"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import dynamic from "next/dynamic"
import { BookOpen, CalendarPlus, ChevronLeft, ChevronRight, MousePointerClick, Plus } from "lucide-react"
import type { CalendarEvent, CalendarInstanceApi } from "@svar-ui/react-calendar"
import { usePersistedState } from "@/components/calculator-ui"
import { CartePeriode, ResumeMois } from "@/components/heures/bilan-heures"
import type { VueCalendrier } from "@/components/heures/calendrier-heures"
import { CalendriersIcs } from "@/components/heures/calendriers-ics"
import { PropositionsBu } from "@/components/heures/propositions-bu"
import { ReglagesHeures } from "@/components/heures/reglages-heures"
import { SelecteurCategorie } from "@/components/heures/selecteur-categorie"
import { chargerCreneaux, enregistrerCreneaux, preparerMois } from "@/components/heures/stockage"
import { cn } from "@/lib/utils"
import {
    REGLAGES_PAR_DEFAUT,
    cleMois,
    creneauxTypes,
    dateLocale,
    debutJour,
    debutMois,
    fmtHeures,
    isoJour,
    joursSansCreneau,
    libelleJour,
    libelleJourAbrege,
    libelleMois,
    libelleSemaine,
    lireBilan,
    moisSuivant,
    rythmeMois,
    suivrePeriodes,
    type Bilan,
    type Categorie,
    type Creneau,
    type Reglages,
} from "@/lib/heures"
import { FERMETURE_BU, OUVERTURE_BU, proposerBu, type PropositionBu } from "@/lib/bu"
import type { CalendrierIcs } from "@/lib/ics"

// SVAR mesure le DOM : aucun rendu serveur, et le paquet reste hors du bundle des autres pages
const CalendrierHeures = dynamic(() => import("@/components/heures/calendrier-heures").then((m) => m.CalendrierHeures), { ssr: false })

const CLE_REGLAGES = "heures-alternance:reglages"
const CLE_CALENDRIERS = "heures-alternance:calendriers"
const reglagesParDefaut = (): Reglages => REGLAGES_PAR_DEFAUT
const aucunCalendrier = (): CalendrierIcs[] => []

const BOUTON_ICONE =
    "inline-flex size-10 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors duration-100 ease-out-ui hover:bg-surface-sunk hover:text-ink"

const sansAbonnement = () => () => {}

/** Date du jour lue dans le navigateur seulement : le serveur n'a ni l'heure ni le fuseau de l'utilisateur */
function useAujourdhui(): string | null {
    return useSyncExternalStore(sansAbonnement, () => isoJour(new Date()), () => null)
}

const REQUETE_ECRAN_LARGE = "(min-width: 768px)"

function suivreEcran(rappel: () => void) {
    const requete = window.matchMedia(REQUETE_ECRAN_LARGE)
    requete.addEventListener("change", rappel)
    return () => requete.removeEventListener("change", rappel)
}

/** Tablette et bureau. En dessous, le calendrier reste en vue jour */
function useEcranLarge(): boolean {
    return useSyncExternalStore(suivreEcran, () => window.matchMedia(REQUETE_ECRAN_LARGE).matches, () => true)
}

function messageConseil(propositions: PropositionBu[], aFaire: number, mois: Date, maintenant: Date): string {
    const nomMois = libelleMois(mois)
    const plage = `le lundi, mardi ou mercredi entre ${OUVERTURE_BU}h et ${FERMETURE_BU}h`
    if (aFaire <= 0) return `Objectif de ${nomMois} atteint : pas besoin de BU.`
    if (moisSuivant(mois) <= debutJour(maintenant)) return `${nomMois.charAt(0).toUpperCase()}${nomMois.slice(1)} est terminé : plus rien à proposer.`
    if (propositions.length === 0) return `Aucune plage libre d'au moins 1h ${plage} d'ici la fin de ${nomMois}.`

    const propose = propositions.reduce((total, p) => total + (p.end.getTime() - p.start.getTime()) / 3_600_000, 0)
    const nombre = `${propositions.length} ${propositions.length > 1 ? "créneaux" : "créneau"}`
    return propose >= aFaire
        ? `${nombre} pour tes ${fmtHeures(aFaire)} de BU, ${plage}.`
        : `${nombre} pour ${fmtHeures(propose)} sur ${fmtHeures(aFaire)} à faire : plus assez de place ${plage}.`
}

export default function HeuresAlternance() {
    const aujourdhui = useAujourdhui()
    // Premier rendu (serveur et hydratation) : rien à afficher tant que la date du navigateur est inconnue
    if (!aujourdhui) return <div aria-busy="true" className="min-h-dvh" />
    return <Suivi aujourdhui={aujourdhui} />
}

function Suivi({ aujourdhui: isoAujourdhui }: { aujourdhui: string }) {
    const [aujourdhui] = useState(() => dateLocale(isoAujourdhui))
    // Le mois courant arrive déjà rempli si c'est sa première ouverture ; le calendrier enregistre tout à son montage
    const [initiaux] = useState(() => {
        const charges = chargerCreneaux()
        return [...charges, ...preparerMois(charges, debutMois(aujourdhui), moisSuivant(aujourdhui))]
    })
    const [creneaux, setCreneaux] = useState(initiaux)
    const [stockes, setReglages] = usePersistedState(CLE_REGLAGES, reglagesParDefaut)
    // Réglages d'une version antérieure : on complète avec les valeurs par défaut
    const reglages: Reglages = { ...REGLAGES_PAR_DEFAUT, ...stockes, joursTravailles: stockes.joursTravailles ?? {} }
    const [calendriers, setCalendriers] = usePersistedState(CLE_CALENDRIERS, aucunCalendrier)
    const ecranLarge = useEcranLarge()
    const [vueInitiale] = useState<VueCalendrier>(() => (ecranLarge ? "week" : "day"))
    const [affichage, setAffichage] = useState({ date: aujourdhui, vue: vueInitiale })
    const [categorie, setCategorie] = useState<Categorie>("entreprise")
    const [api, setApi] = useState<CalendarInstanceApi | null>(null)
    const [propositions, setPropositions] = useState<PropositionBu[]>([])
    /** Message de la liste des horaires conseillés ; null quand elle est fermée */
    const [conseil, setConseil] = useState<string | null>(null)
    const [selection, setSelection] = useState<string | null>(null)

    // Sur téléphone, seule la vue jour est lisible : on y revient si l'écran rétrécit
    useEffect(() => {
        if (!ecranLarge && affichage.vue !== "day") api?.exec("navigate-to", { view: "day", date: affichage.date })
    }, [ecranLarge, affichage, api])

    const suivi = suivrePeriodes(creneaux, affichage.date, reglages)
    const { attendu, joursRestants } = rythmeMois(affichage.date, aujourdhui, suivi.mois.objectif)
    const lecture = lireBilan(suivi.mois, attendu, joursRestants)
    const mois = libelleMois(affichage.date)

    const afficher = (vue: VueCalendrier) => api?.exec("navigate-to", { view: vue, date: affichage.date })
    const enregistrer = (liste: Creneau[]) => {
        setCreneaux(liste)
        enregistrerCreneaux(liste)
    }
    const joursVides = joursSansCreneau(debutMois(affichage.date), moisSuivant(affichage.date), creneaux)
    const completerMois = () => api?.exec("provide-data", { data: { events: creneauxTypes(joursVides) as CalendarEvent[] } })
    // Import, actualisation ou retrait d'un calendrier : la liste complète remplace celle du calendrier, qui enregistre ensuite
    const appliquerCalendriers = (liste: Creneau[], nouveaux: CalendrierIcs[]) => {
        setCalendriers(nouveaux)
        // Le reset efface aussi les pointillés : la liste des horaires conseillés se ferme avec eux
        fermerConseil()
        api?.exec("provide-data", { data: { events: liste as CalendarEvent[] }, reset: true })
    }

    const fermerConseil = () => {
        setPropositions([])
        setConseil(null)
        setSelection(null)
    }
    // Horaires conseillés : les heures qui manquent au mois affiché, en pointillé dans la grille
    const conseillerBu = () => {
        for (const p of propositions) api?.exec("delete-event", { id: p.id })
        const maintenant = new Date()
        const aFaire = suivi.mois.restant
        const nouvelles = aFaire > 0 ? proposerBu(creneaux, affichage.date, maintenant, aFaire) : []
        setPropositions(nouvelles)
        setSelection(null)
        setConseil(messageConseil(nouvelles, aFaire, affichage.date, maintenant))
        if (nouvelles.length === 0) return
        api?.exec("provide-data", { data: { events: nouvelles.map((p) => ({ ...p, categorie: "bu" })) as CalendarEvent[] } })
        api?.exec("navigate-to", { date: nouvelles[0].start })
    }
    const traiterPropositions = (ids: string[], accepter: boolean) => {
        for (const p of propositions.filter((p) => ids.includes(p.id))) {
            api?.exec("delete-event", { id: p.id })
            if (accepter) api?.exec("add-event", { event: { start: p.start, end: p.end, categorie: "bu" } })
        }
        const restantes = propositions.filter((p) => !ids.includes(p.id))
        setPropositions(restantes)
        if (restantes.length === 0) fermerConseil()
    }
    // Bouton + du téléphone : une heure sur le jour affiché, à l'heure suivante si c'est aujourd'hui
    const ajouterCreneau = () => {
        const maintenant = new Date()
        const heure = isoJour(affichage.date) === isoJour(maintenant) ? Math.min(20, Math.max(7, maintenant.getHours() + 1)) : 9
        const debut = new Date(affichage.date.getFullYear(), affichage.date.getMonth(), affichage.date.getDate(), heure)
        api?.exec("add-event", { event: { start: debut, end: new Date(debut.getTime() + 3_600_000) }, edit: true })
    }

    return (
        <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
            <header>
                <p className="num text-caption uppercase tracking-[0.14em] text-ink-muted">Alternance · lissage mensuel</p>
                <h1 className="mt-3 font-display text-[2.5rem] leading-[1.05] text-ink sm:text-h1">Heures d&apos;alternance</h1>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <ResumeMois
                    bilan={suivi.mois}
                    lecture={lecture}
                    attendu={attendu}
                    joursTravailles={suivi.joursTravailles}
                    normeJournaliere={suivi.normeJournaliere}
                    libelle={mois}
                    active={affichage.vue === "month"}
                    onAfficher={ecranLarge ? () => afficher("month") : undefined}
                />
                <div className="grid grid-cols-2 content-start gap-3 sm:gap-4 lg:grid-cols-1">
                    <CartePeriode
                        titre="Jour"
                        sousTitre={ecranLarge ? libelleJour(affichage.date) : libelleJourAbrege(affichage.date)}
                        bilan={suivi.jour}
                        active={affichage.vue === "day"}
                        onClick={ecranLarge ? () => afficher("day") : undefined}
                    />
                    <CartePeriode
                        titre="Semaine"
                        sousTitre={libelleSemaine(affichage.date)}
                        bilan={suivi.semaine}
                        active={affichage.vue === "week"}
                        onClick={ecranLarge ? () => afficher("week") : undefined}
                    />
                    <div className="col-span-2 space-y-4 lg:col-span-1">
                        <ReglagesHeures
                            reglages={reglages}
                            mois={cleMois(affichage.date)}
                            libelleMois={mois}
                            joursSuggeres={suivi.joursSuggeres}
                            normeJournaliere={suivi.normeJournaliere}
                            onChange={(maj) => setReglages((r) => maj({ ...REGLAGES_PAR_DEFAUT, ...r, joursTravailles: r.joursTravailles ?? {} }))}
                        />
                        <CalendriersIcs calendriers={calendriers} creneaux={creneaux} pret={api !== null} onAppliquer={appliquerCalendriers} />
                    </div>
                </div>
            </div>

            <section aria-label="Calendrier des heures" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    <SelecteurCategorie legende="Nouveau créneau" valeur={categorie} onChange={setCategorie} />
                    <div className="flex flex-wrap gap-2">
                        {joursVides.length > 0 && (
                            <button
                                type="button"
                                onClick={completerMois}
                                className="inline-flex h-10 items-center gap-2 rounded-md border border-hairline-strong bg-surface px-3 text-ui font-medium text-primary transition-colors duration-100 ease-out-ui hover:border-primary"
                            >
                                <CalendarPlus className="size-4 shrink-0" aria-hidden />
                                Remplir {joursVides.length} {joursVides.length > 1 ? "jours vides" : "jour vide"}
                                <span className="hidden sm:inline">avec la semaine type</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={conseillerBu}
                            disabled={!api}
                            className="inline-flex h-10 items-center gap-2 rounded-md border border-dashed border-c5 bg-surface px-3 text-ui font-medium text-ink transition-colors duration-100 ease-out-ui hover:bg-surface-sunk disabled:opacity-60"
                        >
                            <BookOpen className="size-4 shrink-0 text-c5" aria-hidden />
                            {conseil === null ? "Horaires conseillés" : "Recalculer"}
                            <span className="hidden sm:inline">pour la BU</span>
                        </button>
                    </div>
                </div>
                <p className="flex items-start gap-2 text-caption text-ink-muted">
                    <MousePointerClick className="mt-px size-4 shrink-0" aria-hidden />
                    {ecranLarge ? (
                        <span>
                            Chaque mois démarre avec ta semaine type : 9h–12h et 14h–18h, cours du lundi au mercredi, entreprise jeudi et vendredi. Glisse dans
                            la grille pour poser un créneau, clique dessus pour le modifier ou le supprimer.
                        </span>
                    ) : (
                        <span>Semaine type : 9h–12h et 14h–18h. Touche + pour ajouter un créneau, touche un créneau pour le modifier.</span>
                    )}
                </p>
                {conseil !== null && (
                    <PropositionsBu
                        propositions={propositions}
                        message={conseil}
                        selection={selection}
                        onAccepter={(ids) => traiterPropositions(ids, true)}
                        onRefuser={(ids) => traiterPropositions(ids, false)}
                        onVoir={(date) => api?.exec("navigate-to", { date })}
                        onFermer={fermerConseil}
                    />
                )}
                <div
                    className={cn(
                        "hr-calendrier flex h-[75dvh] min-h-[540px] flex-col overflow-hidden rounded-lg border border-hairline bg-surface shadow-raise lg:h-[800px]",
                        !ecranLarge && "hr-compact"
                    )}
                >
                    {!ecranLarge && (
                        <BarreJour
                            date={affichage.date}
                            aujourdhui={aujourdhui}
                            bilan={suivi.jour}
                            onNaviguer={(direction) => api?.exec("navigate-time", { direction })}
                            onAjouter={ajouterCreneau}
                        />
                    )}
                    <div className="min-h-0 flex-1">
                        <CalendrierHeures
                            creneauxInitiaux={initiaux}
                            dateInitiale={aujourdhui}
                            vueInitiale={vueInitiale}
                            categorie={categorie}
                            onChange={enregistrer}
                            onNavigate={(date, vue) => setAffichage({ date, vue })}
                            preparer={(debut, fin) => preparerMois(creneaux, debut, fin)}
                            onProposition={setSelection}
                            onApi={setApi}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

/** Téléphone : la date du jour affiché, bien lisible, avec la navigation jour par jour et l'ajout d'un créneau */
function BarreJour({ date, aujourdhui, bilan, onNaviguer, onAjouter }: {
    date: Date
    aujourdhui: Date
    bilan: Bilan
    onNaviguer: (direction: "previous" | "next" | "now") => void
    onAjouter: () => void
}) {
    const estAujourdhui = isoJour(date) === isoJour(aujourdhui)
    const autreAnnee = date.getFullYear() !== aujourdhui.getFullYear()

    return (
        <div className="flex shrink-0 items-center gap-1 border-b border-hairline px-1.5 py-2">
            <button type="button" onClick={() => onNaviguer("previous")} aria-label="Jour précédent" className={BOUTON_ICONE}>
                <ChevronLeft className="size-5" aria-hidden />
            </button>
            <div className="min-w-0 flex-1 text-center">
                <p aria-live="polite" className="truncate font-display text-[1.375rem] leading-tight text-ink first-letter:uppercase">
                    {libelleJour(date)}
                    {autreAnnee && ` ${date.getFullYear()}`}
                </p>
                <p className="num mt-0.5 flex items-center justify-center gap-2 text-caption text-ink-muted">
                    <span>
                        {fmtHeures(bilan.total)} / {fmtHeures(bilan.objectif)}
                    </span>
                    <span aria-hidden>·</span>
                    {estAujourdhui ? (
                        <span className="text-accent">Aujourd&apos;hui</span>
                    ) : (
                        <button type="button" onClick={() => onNaviguer("now")} className="text-accent underline underline-offset-2">
                            Aujourd&apos;hui
                        </button>
                    )}
                </p>
            </div>
            <button type="button" onClick={() => onNaviguer("next")} aria-label="Jour suivant" className={BOUTON_ICONE}>
                <ChevronRight className="size-5" aria-hidden />
            </button>
            <button
                type="button"
                onClick={onAjouter}
                aria-label="Ajouter un créneau"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-on-primary transition-colors duration-100 ease-out-ui hover:bg-primary-hover"
            >
                <Plus className="size-5" aria-hidden />
            </button>
        </div>
    )
}
