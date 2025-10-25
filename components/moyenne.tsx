"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Trash2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createInitialData } from "@/constants/curriculum-data";
import type { Annee, Semestre, Competence, UE } from "@/types/curriculum.types"


export default function LCeRCalculator() {
    const [data, setData] = useState<Annee[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("lcer-notes")
            return saved ? JSON.parse(saved) : createInitialData()
        }
        return createInitialData()
    })

    // Sauvegarde automatique
    useEffect(() => {
        localStorage.setItem("lcer-notes", JSON.stringify(data))
    }, [data])

    // Calculs
    const calculerMoyenneUE = (ue: UE): number => {
        const notesValides = ue.elements.filter((ec) => ec.note !== undefined && ec.note !== null)
        if (notesValides.length === 0) return 0

        const sommeNotesPonderees = notesValides.reduce((sum, ec) => sum + ec.note! * ec.ects, 0)
        const sommeECTS = notesValides.reduce((sum, ec) => sum + ec.ects, 0)

        return sommeECTS > 0 ? sommeNotesPonderees / sommeECTS : 0
    }

    const calculerMoyenneCompetenceSemestre = (competence: Competence): number => {
        const uesAvecNotes = competence.ues.filter((ue) => {
            const moyenne = calculerMoyenneUE(ue)
            return moyenne > 0
        })

        if (uesAvecNotes.length === 0) return 0

        const sommePonderee = uesAvecNotes.reduce((sum, ue) => {
            const moyenne = calculerMoyenneUE(ue)
            return sum + moyenne * ue.ects
        }, 0)

        const sommeECTS = uesAvecNotes.reduce((sum, ue) => sum + ue.ects, 0)

        return sommeECTS > 0 ? sommePonderee / sommeECTS : 0
    }

    // NOUVELLE FONCTION : Calcul de la moyenne d'une compétence sur l'année entière
    const calculerMoyenneCompetenceAnnee = (annee: Annee, codeCompetence: string): number => {
        const [s1, s2] = annee.semestres

        // Trouver les compétences correspondantes dans chaque semestre
        const comp1 = s1.competences.find((c) => c.code.startsWith(codeCompetence.substring(0, 3)))
        const comp2 = s2.competences.find((c) => c.code.startsWith(codeCompetence.substring(0, 3)))

        if (!comp1 && !comp2) return 0

        let sommePonderee = 0
        let sommeECTS = 0

        // Semestre 1
        if (comp1) {
            comp1.ues.forEach((ue) => {
                ue.elements.forEach((ec) => {
                    if (ec.note !== undefined && ec.note !== null) {
                        sommePonderee += ec.note * ec.ects
                        sommeECTS += ec.ects
                    }
                })
            })
        }

        // Semestre 2
        if (comp2) {
            comp2.ues.forEach((ue) => {
                ue.elements.forEach((ec) => {
                    if (ec.note !== undefined && ec.note !== null) {
                        sommePonderee += ec.note * ec.ects
                        sommeECTS += ec.ects
                    }
                })
            })
        }

        return sommeECTS > 0 ? sommePonderee / sommeECTS : 0
    }

    const calculerMoyenneSemestre = (semestre: Semestre): number => {
        const competencesAvecNotes = semestre.competences.filter((comp) => {
            const moyenne = calculerMoyenneCompetenceSemestre(comp)
            return moyenne > 0
        })

        if (competencesAvecNotes.length === 0) return 0

        const sommePonderee = competencesAvecNotes.reduce((sum, comp) => {
            const moyenne = calculerMoyenneCompetenceSemestre(comp)
            const ectsComp = comp.ues.reduce((s, ue) => s + ue.ects, 0)
            return sum + moyenne * ectsComp
        }, 0)

        const sommeECTS = competencesAvecNotes.reduce((sum, comp) => {
            return sum + comp.ues.reduce((s, ue) => s + ue.ects, 0)
        }, 0)

        return sommeECTS > 0 ? sommePonderee / sommeECTS : 0
    }

    const calculerMoyenneAnnee = (annee: Annee): number => {
        const [s1, s2] = annee.semestres
        const moyS1 = calculerMoyenneSemestre(s1)
        const moyS2 = calculerMoyenneSemestre(s2)

        if (moyS1 === 0 && moyS2 === 0) return 0
        if (moyS1 === 0) return moyS2
        if (moyS2 === 0) return moyS1

        return (moyS1 + moyS2) / 2
    }

    const analyserValidationAnnee = (
        annee: Annee,
    ): {
        validated: boolean
        mention?: string
        raisons: string[]
        competencesAnnuelles: { code: string; moyenne: number }[]
    } => {
        const moyenneAnnee = calculerMoyenneAnnee(annee)
        const raisons: string[] = []

        if (moyenneAnnee === 0) {
            raisons.push("Aucune note saisie")
            return { validated: false, raisons, competencesAnnuelles: [] }
        }

        // Calculer les moyennes des compétences sur l'année
        const competencesAnnuelles = [
            { code: "UE1", moyenne: calculerMoyenneCompetenceAnnee(annee, "UE1") },
            { code: "UE2", moyenne: calculerMoyenneCompetenceAnnee(annee, "UE2") },
            { code: "UE3", moyenne: calculerMoyenneCompetenceAnnee(annee, "UE3") },
            { code: "UE4", moyenne: calculerMoyenneCompetenceAnnee(annee, "UE4") },
            { code: "UE5", moyenne: calculerMoyenneCompetenceAnnee(annee, "UE5") },
        ].filter((comp) => comp.moyenne > 0)

        // Vérifier la moyenne générale
        const moyenneInsuffisante = moyenneAnnee < 10
        if (moyenneInsuffisante) {
            raisons.push(`Moyenne générale insuffisante (${moyenneAnnee.toFixed(2)}/20 < 10/20)`)
        }

        // Vérifier toutes les compétences >= 8 (sur l'année)
        const competencesInsuffisantes = competencesAnnuelles.filter((comp) => comp.moyenne < 8)

        if (competencesInsuffisantes.length > 0) {
            const details = competencesInsuffisantes.map((comp) => `${comp.code} (${comp.moyenne.toFixed(2)}/20)`).join(", ")
            raisons.push(`Compétence(s) annuelle(s) < 8/20 : ${details}`)
        }

        const validated = !moyenneInsuffisante && competencesInsuffisantes.length === 0

        let mention: string | undefined
        if (validated) {
            if (moyenneAnnee >= 16) mention = "Très bien"
            else if (moyenneAnnee >= 14) mention = "Bien"
            else if (moyenneAnnee >= 12) mention = "Assez bien"
        }

        return { validated, mention, raisons, competencesAnnuelles }
    }

    const updateNote = (
        anneeIndex: number,
        semestreIndex: number,
        compIndex: number,
        ueIndex: number,
        ecIndex: number,
        note: number,
    ) => {
        const newData = [...data]
        newData[anneeIndex].semestres[semestreIndex].competences[compIndex].ues[ueIndex].elements[ecIndex].note = note
        setData(newData)
    }

    const resetData = () => {
        if (confirm("Êtes-vous sûr de vouloir effacer toutes les données ?")) {
            setData(createInitialData())
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl">
            <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Calculateur de Moyenne
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600">Licence Informatique</p>
                    </div>
                    <Button variant="destructive" onClick={resetData} className="w-full sm:w-auto shadow-lg">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Effacer tout
                    </Button>
                </div>

                <Tabs defaultValue="annee1" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm">
                        <TabsTrigger
                            value="annee1"
                            className=" text-xs sm:text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                        >
                            Année 1
                        </TabsTrigger>
                        <TabsTrigger
                            value="annee2"
                            className="text-xs sm:text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                        >
                            Année 2
                        </TabsTrigger>
                        <TabsTrigger
                            value="annee3"
                            className="text-xs sm:text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                        >
                            Année 3
                        </TabsTrigger>
                        <TabsTrigger
                            value="resume"
                            className="text-xs sm:text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                        >
                            Résumé
                        </TabsTrigger>
                    </TabsList>

                    {data.map((annee, anneeIndex) => (
                        <TabsContent key={annee.numero} value={`annee${annee.numero}`}>
                            <div className="space-y-4 sm:space-y-6">
                                <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 p-2">
                                    <CardHeader className="pb-3 bg-linear-to-r from-slate-50 to-blue-50 rounded-t-lg ">
                                        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
                                            <span className="text-xl font-bold">Année {annee.numero}</span>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {(() => {
                                                    const { validated, mention } = analyserValidationAnnee(annee)
                                                    const moyenne = calculerMoyenneAnnee(annee)
                                                    return (
                                                        <>
                                                            <Badge
                                                                variant={validated ? "default" : "destructive"}
                                                                className="text-xs sm:text-sm shadow-sm"
                                                            >
                                                                {moyenne > 0 ? moyenne.toFixed(2) : "N/A"}
                                                            </Badge>
                                                            {validated ? (
                                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                                            )}
                                                            {mention && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs sm:text-sm bg-linear-to-r from-yellow-100 to-orange-100 text-orange-800 shadow-sm"
                                                                >
                                                                    {mention}
                                                                </Badge>
                                                            )}
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        </CardTitle>
                                        {(() => {
                                            const { validated, raisons, competencesAnnuelles } = analyserValidationAnnee(annee)
                                            return (
                                                <div className="space-y-3">
                                                    {/* Affichage des moyennes annuelles par compétence */}
                                                    {competencesAnnuelles.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="text-sm font-medium text-slate-700">Moyennes annuelles :</span>
                                                            {competencesAnnuelles.map((comp) => (
                                                                <Badge
                                                                    key={comp.code}
                                                                    variant={
                                                                        comp.moyenne >= 10 ? "default" : comp.moyenne >= 8 ? "secondary" : "destructive"
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    {comp.code}: {comp.moyenne.toFixed(2)}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {!validated && raisons.length > 0 && (
                                                        <Alert className="bg-red-50 border-red-200">
                                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                                            <AlertDescription className="text-xs sm:text-sm text-red-800">
                                                                <strong>Année non validée :</strong>
                                                                <ul className="mt-1 ml-4 list-disc">
                                                                    {raisons.map((raison, index) => (
                                                                        <li key={index}>{raison}</li>
                                                                    ))}
                                                                </ul>
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            )
                                        })()}
                                    </CardHeader>
                                </Card>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                                    {annee.semestres.map((semestre, semestreIndex) => (
                                        <Card key={semestre.numero} className="bg-white/90 backdrop-blur-sm shadow-lg border-0 ">
                                            <CardHeader className="pb-3 bg-linear-to-r from-indigo-50 to-purple-50 rounded-t-lg p-4 mx-4">
                                                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-base sm:text-lg">
                                                    <span className="font-bold text-black">Semestre {semestre.numero}</span>
                                                    <Badge variant="outline" className="text-xs sm:text-sm w-fit bg-white/80 shadow-sm text-black">
                                                        Moyenne: {calculerMoyenneSemestre(semestre).toFixed(2)}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 sm:space-y-4">
                                                {semestre.competences.map((competence, compIndex) => (
                                                    <Card
                                                        key={competence.code}
                                                        className={`border-2 ${competence.color} ${competence.bgGradient} shadow-md`}
                                                    >
                                                        <CardHeader className="pb-2 sm:pb-3">
                                                            <CardTitle className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                                <span className="font-bold">{competence.code}</span>
                                                                <Badge
                                                                    variant={
                                                                        calculerMoyenneCompetenceSemestre(competence) >= 10
                                                                            ? "default"
                                                                            : calculerMoyenneCompetenceSemestre(competence) >= 8
                                                                                ? "secondary"
                                                                                : "destructive"
                                                                    }
                                                                    className="text-xs w-fit shadow-sm"
                                                                >
                                                                    {calculerMoyenneCompetenceSemestre(competence).toFixed(2)}
                                                                </Badge>
                                                            </CardTitle>
                                                            <CardDescription className="text-xs font-medium">{competence.name}</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="pt-0 space-y-3">
                                                            {competence.ues.map((ue, ueIndex) => (
                                                                <div key={ue.code} className="space-y-2">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                                                                        <Label className="text-xs font-medium leading-tight">{ue.name}</Label>
                                                                        <Badge variant="outline" className="text-xs w-fit bg-black shadow-sm">
                                                                            {calculerMoyenneUE(ue).toFixed(2)}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        {ue.elements.map((ec, ecIndex) => (
                                                                            <div
                                                                                key={ec.name}
                                                                                className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white/60 p-2 rounded-md"
                                                                            >
                                                                                <Label className="text-xs flex-1 leading-tight font-medium">{ec.name}</Label>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Badge variant="outline" className="text-xs whitespace-nowrap bg-black">
                                                                                        {ec.ects} ECTS
                                                                                    </Badge>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        max="20"
                                                                                        step="0.1"
                                                                                        value={ec.note || ""}
                                                                                        onChange={(e) =>
                                                                                            updateNote(
                                                                                                anneeIndex,
                                                                                                semestreIndex,
                                                                                                compIndex,
                                                                                                ueIndex,
                                                                                                ecIndex,
                                                                                                Number.parseFloat(e.target.value) || 0,
                                                                                            )
                                                                                        }
                                                                                        className="w-16 sm:w-20 h-8 text-xs text-white shadow-sm border-2 focus:border-blue-400"
                                                                                        placeholder="Note"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    ))}

                    <TabsContent value="resume">
                        <div className="space-y-4 sm:space-y-6">
                            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 ">
                                <CardHeader className="bg-linear-to-r from-slate-50 to-indigo-50 rounded-t-lg mx-2 p-2">
                                    <CardTitle className="text-lg sm:text-xl font-bold text-black">Résumé général</CardTitle>
                                    <CardDescription className="text-sm">
                                        Vue d&apos;ensemble de votre progression dans la licence
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="">
                                    <div className="space-y-4">
                                        {data.map((annee) => {
                                            const { validated, mention, raisons, competencesAnnuelles } = analyserValidationAnnee(annee)
                                            const moyenne = calculerMoyenneAnnee(annee)

                                            return (
                                                <div key={annee.numero} className="space-y-3">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 bg-linear-to-r from-white to-slate-50 shadow-sm">
                                                        <div>
                                                            <h3 className="font-bold text-sm sm:text-base text-black">Année {annee.numero}</h3>
                                                            <p className="text-xs sm:text-sm text-slate-600">
                                                                Semestres {annee.numero * 2 - 1} et {annee.numero * 2}
                                                            </p>
                                                            {/* Moyennes des compétences annuelles */}
                                                            {competencesAnnuelles.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {competencesAnnuelles.map((comp) => (
                                                                        <Badge
                                                                            key={comp.code}
                                                                            variant={
                                                                                comp.moyenne >= 10 ? "default" : comp.moyenne >= 8 ? "secondary" : "destructive"
                                                                            }
                                                                            className="text-xs"
                                                                        >
                                                                            {comp.code}: {comp.moyenne.toFixed(2)}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge
                                                                variant={validated ? "default" : "destructive"}
                                                                className="text-xs sm:text-sm shadow-sm"
                                                            >
                                                                {moyenne > 0 ? moyenne.toFixed(2) : "N/A"}
                                                            </Badge>
                                                            {validated ? (
                                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                                            ) : (
                                                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                                            )}
                                                            {mention && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs sm:text-sm bg-linear-to-r from-yellow-100 to-orange-100 text-orange-800 shadow-sm"
                                                                >
                                                                    {mention}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {!validated && raisons.length > 0 && (
                                                        <Alert className="bg-red-50 border-red-200">
                                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                                            <AlertDescription className="text-xs sm:text-sm text-red-800">
                                                                <strong>Problèmes détectés :</strong>
                                                                <ul className="mt-1 ml-4 list-disc">
                                                                    {raisons.map((raison, raisonIndex) => (
                                                                        <li key={raisonIndex}>{raison}</li>
                                                                    ))}
                                                                </ul>
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Alert className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-xs sm:text-sm text-blue-900">
                                    <strong>Règles de validation :</strong>
                                    <br />• Une année est validée si la moyenne annuelle ≥ 10/20 ET toutes les compétences annuelles ≥
                                    8/20
                                    <br />• <strong>Les compétences se compensent entre semestres</strong> (pondération par ECTS)
                                    <br />• Mentions : Assez bien (12-14), Bien (14-16), Très bien (≥16)
                                    <br />• Les données sont sauvegardées automatiquement dans votre navigateur
                                    <br />• <span className="inline-block w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-1"></span>
                                    UE1: Modélisation numérique
                                    <span className="inline-block w-3 h-3 bg-emerald-100 border border-emerald-300 rounded mr-1 ml-2"></span>
                                    UE2: Solutions informatiques
                                    <span className="inline-block w-3 h-3 bg-purple-100 border border-purple-300 rounded mr-1 ml-2"></span>
                                    UE3: Gestion solution
                                    <br />•{" "}
                                    <span className="inline-block w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-1"></span>UE4:
                                    Projet informatique
                                    <span className="inline-block w-3 h-3 bg-pink-100 border border-pink-300 rounded mr-1 ml-2"></span>
                                    UE5: Projet professionnel
                                </AlertDescription>
                            </Alert>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
