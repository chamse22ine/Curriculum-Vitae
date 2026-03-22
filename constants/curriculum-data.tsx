import { competenceColors, type CompetenceColorKey } from "@/constants/colors-constants";
import { UE_NAMES } from "@/lib/calculs"
import type { Annee, Competence, EC } from "@/types/curriculum.types"

const COMPETENCE_NAMES: Record<string, string> = {
    UE1: "Élaborer une modélisation numérique",
    UE2: "Développer des solutions informatiques",
    UE3: "Gérer une solution informatique",
    UE4: "Mettre en œuvre un projet informatique",
    UE5: "Construire son projet professionnel",
}

function comp(code: string, ects: number, elements: EC[]): Competence {
    const prefix = code.replace(/\.\d+$/, "") as CompetenceColorKey
    return {
        name: COMPETENCE_NAMES[prefix],
        code,
        color: competenceColors[prefix].color,
        bgGradient: competenceColors[prefix].bgGradient,
        ues: [{ name: `${code} - ${UE_NAMES[prefix]}`, code, ects, elements }],
    }
}

function ec(name: string, ects: number): EC {
    return { name, ects }
}

export const createInitialData = (): Annee[] => [
    {
        numero: 1,
        semestres: [
            {
                numero: 1, ects: 30,
                competences: [
                    comp("UE1.1", 14, [ec("CALC1 - Calculus 1", 5), ec("MOMI - Modélisation", 6), ec("Option (Physique/Chimie)", 3)]),
                    comp("UE2.1", 7, [ec("ALGO1 - Algorithmique 1", 7)]),
                    comp("UE3.1", 4, [ec("RES - Initiation Réseaux", 3), ec("SAÉ Réseaux-Web partie 1", 1)]),
                    comp("UE5.1", 5, [ec("ANGL1 - Anglais 1", 3), ec("SAÉ PPE", 2)]),
                ],
            },
            {
                numero: 2, ects: 30,
                competences: [
                    comp("UE1.2", 11, [ec("ALGL - Algèbre Linéaire", 5), ec("WEB - Initiation Web", 4), ec("SAÉ Réseaux-Web Partie 2", 2)]),
                    comp("UE2.2", 13, [ec("ALGO2 - Algorithmique 2", 5), ec("SAÉ Projet Algo2", 2), ec("PF1 - Programmation fonctionnelle", 3), ec("Option (DGTV/BIOL)", 3)]),
                    comp("UE3.2", 3, [ec("ARCHI1 - Architecture 1", 3)]),
                    comp("UE5.2", 3, [ec("ANGL2 - Anglais 2", 3)]),
                ],
            },
        ],
    },
    {
        numero: 2,
        semestres: [
            {
                numero: 3, ects: 30,
                competences: [
                    comp("UE1.3", 4, [ec("STAT - Statistiques", 4)]),
                    comp("UE2.3", 15, [ec("ALGO3 - Algorithmique 3", 5), ec("Langage C", 6), ec("PWEB1 - Programmation Web 1", 4)]),
                    comp("UE3.3", 3, [ec("UNIX - Commandes Unix", 3)]),
                    comp("UE4.3", 2, [ec("SAÉ Projet Algo 3", 1), ec("SAÉ Programmation Web 1", 1)]),
                    comp("UE5.3", 6, [ec("ANGL3 - Anglais 3", 3), ec("SAÉ CPP-CTR", 3)]),
                ],
            },
            {
                numero: 4, ects: 30,
                competences: [
                    comp("UE1.4", 11, [ec("ALGO4 - Algorithmique 4", 4), ec("POO - Programmation Orientée Objet", 7)]),
                    comp("UE2.4", 6, [ec("BD - Bases de Données", 6)]),
                    comp("UE3.4", 3, [ec("ARCHI2 - Architecture 2", 3)]),
                    comp("UE4.4", 3, [ec("SAÉ Projet Algo 4", 2), ec("SAÉ Projet BD", 1)]),
                    comp("UE5.4", 7, [ec("ANGL4 - Anglais 4", 3), ec("SAÉ CPP-CTR", 4)]),
                ],
            },
        ],
    },
    {
        numero: 3,
        semestres: [
            {
                numero: 5, ects: 30,
                competences: [
                    comp("UE1.5", 9, [ec("THLA - Théorie de Langage", 7), ec("OL - Outils Logiques", 2)]),
                    comp("UE2.5", 13, [ec("ALGO5 - Algorithmique 5", 6), ec("CAV - C Avancée & C++", 7)]),
                    comp("UE3.5", 3, [ec("SHELL - Programmation Shell", 3)]),
                    comp("UE4.5", 2, [ec("SAÉ Projet SHELL", 2)]),
                    comp("UE5.5", 3, [ec("ANGL5 - Anglais 5", 3)]),
                ],
            },
            {
                numero: 6, ects: 30,
                competences: [
                    comp("UE1.6", 7, [ec("COO - Conception Orientée Objet", 4), ec("PWEB2 - Programmation Web 2", 3)]),
                    comp("UE2.6", 5, [ec("LCPF - Lambda-Calcul", 5)]),
                    comp("UE3.6", 3, [ec("ARCHI3 - Architecture 3", 3)]),
                    comp("UE4.6", 6, [ec("SAÉ multi-tiers", 2), ec("SAÉ Technologies Émergentes", 4)]),
                    comp("UE5.6", 9, [ec("ANGL6 - Anglais 6", 3), ec("SAÉ STAGE", 6)]),
                ],
            },
        ],
    },
]
