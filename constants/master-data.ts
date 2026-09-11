import { competenceColors } from "@/constants/colors-constants"
import type { Formule, MasterEC, MasterSemestre, NiveauCode, Valeurs, Variable } from "@/types/master.types"

// Master Informatique — M1 (M3C 2026-2027)

export const NIVEAUX: Record<NiveauCode, { name: string; color: string; bgGradient: string; dot: string }> = {
    C1: { name: "Mettre en œuvre une solution informatique complète", ...competenceColors.UE1, dot: "bg-blue-400" },
    C2: { name: "Optimiser des solutions informatiques en conditions opérationnelles", ...competenceColors.UE2, dot: "bg-emerald-400" },
    C3: { name: "Développer des solutions fondées sur l'analyse et le traitement de données", ...competenceColors.UE3, dot: "bg-purple-400" },
    C4: { name: "Construire son projet professionnel", ...competenceColors.UE4, dot: "bg-orange-400" },
}

function formule(texte: string, variables: Variable[], calcul: (v: Valeurs) => number): Formule {
    return { texte, variables, calcul }
}

const CC = formule("CC", ["CC"], (v) => v.CC)
const EX1_CC_2_1 = formule("(2×EX1 + CC) / 3", ["EX1", "CC"], (v) => (2 * v.EX1 + v.CC) / 3)
const EX2_CC_2_1 = formule("max(EX2, (2×EX2 + CC) / 3)", ["EX2", "CC"], (v) => Math.max(v.EX2, (2 * v.EX2 + v.CC) / 3))
const EX2_CC_1_1 = formule("max(EX2, (EX2 + CC) / 2)", ["EX2", "CC"], (v) => Math.max(v.EX2, (v.EX2 + v.CC) / 2))
const ORAL_CC = formule("max(CC, (2×Oral + CC) / 3)", ["CC", "ORAL"], (v) => Math.max(v.CC, (2 * v.ORAL + v.CC) / 3))

function ressource(id: string, name: string, ects: number, session1: Formule, session2: Formule): MasterEC {
    return { id, code: id, name, ects, sae: false, session1, session2 }
}

function sae(id: string, name: string, ects: number, session1: Formule): MasterEC {
    return { id, code: id, name, ects, sae: true, session1 }
}

// Le stage compte dans les quatre UE du S2 avec une seule note
function stage(ects: number): MasterEC {
    return sae("STG1", "Stage / TER (note commune)", ects, formule("STG1", ["STG1"], (v) => v.STG1))
}

export const M1: MasterSemestre[] = [
    {
        numero: 1,
        ues: [
            {
                code: "UE 1.1", niveau: "C1", ects: 19,
                elements: [
                    sae("SAESR", "Systèmes et Réseaux", 3, CC),
                    ressource("GP", "Gestion de projets", 4, EX1_CC_2_1, EX2_CC_2_1),
                    ressource("RES", "Réseaux", 6, EX1_CC_2_1, EX2_CC_2_1),
                    ressource("SE", "Systèmes d'Exploitation", 6,
                        formule("(2×EX1 + SAESR) / 3", ["EX1", "SAESR"], (v) => (2 * v.EX1 + v.SAESR) / 3),
                        formule("max(EX2, (2×EX2 + SAESR) / 3)", ["EX2", "SAESR"], (v) => Math.max(v.EX2, (2 * v.EX2 + v.SAESR) / 3))),
                ],
            },
            {
                code: "UE 3.1", niveau: "C3", ects: 8,
                elements: [
                    ressource("2IA", "Introduction à l'IA", 4, CC, formule("max(EX2, CC)", ["EX2", "CC"], (v) => Math.max(v.EX2, v.CC))),
                    ressource("SD", "Science des Données", 4, EX1_CC_2_1, EX2_CC_2_1),
                ],
            },
            {
                code: "UE 4.1", niveau: "C4", ects: 3,
                elements: [
                    ressource("ANG1", "Anglais", 3, CC, ORAL_CC),
                ],
            },
        ],
    },
    {
        numero: 2,
        ues: [
            {
                code: "UE 1.2", niveau: "C1", ects: 5,
                elements: [
                    stage(2),
                    ressource("BDA", "Bases de données avancées", 3, EX1_CC_2_1, EX2_CC_2_1),
                ],
            },
            {
                code: "UE 2.2", niveau: "C2", ects: 12,
                elements: [
                    stage(2),
                    ressource("VVL", "Validation et Vérification de Logiciels", 4,
                        formule("(3×EX1 + 2×CC) / 5", ["EX1", "CC"], (v) => (3 * v.EX1 + 2 * v.CC) / 5),
                        formule("max(EX2, (3×EX2 + 2×CC) / 5)", ["EX2", "CC"], (v) => Math.max(v.EX2, (3 * v.EX2 + 2 * v.CC) / 5))),
                    ressource("SI", "Sécurité Informatique", 3, CC, EX2_CC_1_1),
                    ressource("OS", "Option de spécialisation", 3, CC, EX2_CC_1_1),
                ],
            },
            {
                code: "UE 3.2", niveau: "C3", ects: 5,
                elements: [
                    stage(2),
                    ressource("FD", "Fouille de Données", 3, formule("(EX1 + CC) / 2", ["EX1", "CC"], (v) => (v.EX1 + v.CC) / 2), EX2_CC_1_1),
                ],
            },
            {
                code: "UE 4.2", niveau: "C4", ects: 8,
                elements: [
                    stage(3),
                    sae("SS1", "Soft Skills 1", 2, CC),
                    ressource("ANG2", "Anglais", 3, CC, ORAL_CC),
                ],
            },
        ],
    },
]
