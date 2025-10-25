import { competenceColors } from "@/constants/colors-constants";
import type { Annee } from "@/types/curriculum.types"

export const createInitialData = (): Annee[] => [
    {
        numero: 1,
        semestres: [
            {
                numero: 1,
                ects: 30,
                competences: [
                    {
                        name: "Élaborer une modélisation numérique",
                        code: "UE1.1",
                        color: competenceColors.UE1.color,
                        bgGradient: competenceColors.UE1.bgGradient,
                        ues: [
                            {
                                name: "UE1.1 - Modélisation numérique",
                                code: "UE1.1",
                                ects: 14,
                                elements: [
                                    { name: "CALC1 - Calculus 1", ects: 5 },
                                    { name: "MOMI - Modélisation", ects: 6 },
                                    { name: "Option (Physique/Chimie)", ects: 3 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Développer des solutions informatiques",
                        code: "UE2.1",
                        color: competenceColors.UE2.color,
                        bgGradient: competenceColors.UE2.bgGradient,
                        ues: [
                            {
                                name: "UE2.1 - Solutions informatiques",
                                code: "UE2.1",
                                ects: 7,
                                elements: [{ name: "ALGO1 - Algorithmique 1", ects: 7 }],
                            },
                        ],
                    },
                    {
                        name: "Gérer une solution informatique",
                        code: "UE3.1",
                        color: competenceColors.UE3.color,
                        bgGradient: competenceColors.UE3.bgGradient,
                        ues: [
                            {
                                name: "UE3.1 - Gestion solution",
                                code: "UE3.1",
                                ects: 4,
                                elements: [
                                    { name: "RES - Initiation Réseaux", ects: 3 },
                                    { name: "SAÉ Réseaux-Web partie 1", ects: 1 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Construire son projet professionnel",
                        code: "UE5.1",
                        color: competenceColors.UE5.color,
                        bgGradient: competenceColors.UE5.bgGradient,
                        ues: [
                            {
                                name: "UE5.1 - Projet professionnel",
                                code: "UE5.1",
                                ects: 5,
                                elements: [
                                    { name: "ANGL1 - Anglais 1", ects: 3 },
                                    { name: "SAÉ PPE", ects: 2 },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                numero: 2,
                ects: 30,
                competences: [
                    {
                        name: "Élaborer une modélisation numérique",
                        code: "UE1.2",
                        color: competenceColors.UE1.color,
                        bgGradient: competenceColors.UE1.bgGradient,
                        ues: [
                            {
                                name: "UE1.2 - Modélisation numérique",
                                code: "UE1.2",
                                ects: 11,
                                elements: [
                                    { name: "ALGL - Algèbre Linéaire", ects: 5 },
                                    { name: "WEB - Initiation Web", ects: 4 },
                                    { name: "SAÉ Réseaux-Web Partie 2", ects: 2 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Développer des solutions informatiques",
                        code: "UE2.2",
                        color: competenceColors.UE2.color,
                        bgGradient: competenceColors.UE2.bgGradient,
                        ues: [
                            {
                                name: "UE2.2 - Solutions informatiques",
                                code: "UE2.2",
                                ects: 13,
                                elements: [
                                    { name: "ALGO2 - Algorithmique 2", ects: 5 },
                                    { name: "SAÉ Projet Algo2", ects: 2 },
                                    { name: "PF1 - Programmation fonctionnelle", ects: 3 },
                                    { name: "Option (DGTV/BIOL)", ects: 3 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Gérer une solution informatique",
                        code: "UE3.2",
                        color: competenceColors.UE3.color,
                        bgGradient: competenceColors.UE3.bgGradient,
                        ues: [
                            {
                                name: "UE3.2 - Gestion solution",
                                code: "UE3.2",
                                ects: 3,
                                elements: [{ name: "ARCHI1 - Architecture 1", ects: 3 }],
                            },
                        ],
                    },
                    {
                        name: "Construire son projet professionnel",
                        code: "UE5.2",
                        color: competenceColors.UE5.color,
                        bgGradient: competenceColors.UE5.bgGradient,
                        ues: [
                            {
                                name: "UE5.2 - Projet professionnel",
                                code: "UE5.2",
                                ects: 3,
                                elements: [{ name: "ANGL2 - Anglais 2", ects: 3 }],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        numero: 2,
        semestres: [
            {
                numero: 3,
                ects: 30,
                competences: [
                    {
                        name: "Élaborer une modélisation numérique",
                        code: "UE1.3",
                        color: competenceColors.UE1.color,
                        bgGradient: competenceColors.UE1.bgGradient,
                        ues: [
                            {
                                name: "UE1.3 - Modélisation numérique",
                                code: "UE1.3",
                                ects: 4,
                                elements: [{ name: "STAT - Statistiques", ects: 4 }],
                            },
                        ],
                    },
                    {
                        name: "Développer des solutions informatiques",
                        code: "UE2.3",
                        color: competenceColors.UE2.color,
                        bgGradient: competenceColors.UE2.bgGradient,
                        ues: [
                            {
                                name: "UE2.3 - Solutions informatiques",
                                code: "UE2.3",
                                ects: 15,
                                elements: [
                                    { name: "ALGO3 - Algorithmique 3", ects: 5 },
                                    { name: "Langage C", ects: 6 },
                                    { name: "PWEB1 - Programmation Web 1", ects: 4 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Gérer une solution informatique",
                        code: "UE3.3",
                        color: competenceColors.UE3.color,
                        bgGradient: competenceColors.UE3.bgGradient,
                        ues: [
                            {
                                name: "UE3.3 - Gestion solution",
                                code: "UE3.3",
                                ects: 3,
                                elements: [{ name: "UNIX - Commandes Unix", ects: 3 }],
                            },
                        ],
                    },
                    {
                        name: "Mettre en œuvre un projet informatique",
                        code: "UE4.3",
                        color: competenceColors.UE4.color,
                        bgGradient: competenceColors.UE4.bgGradient,
                        ues: [
                            {
                                name: "UE4.3 - Projet informatique",
                                code: "UE4.3",
                                ects: 2,
                                elements: [
                                    { name: "SAÉ Projet Algo 3", ects: 1 },
                                    { name: "SAÉ Programmation Web 1", ects: 1 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Construire son projet professionnel",
                        code: "UE5.3",
                        color: competenceColors.UE5.color,
                        bgGradient: competenceColors.UE5.bgGradient,
                        ues: [
                            {
                                name: "UE5.3 - Projet professionnel",
                                code: "UE5.3",
                                ects: 6,
                                elements: [
                                    { name: "ANGL3 - Anglais 3", ects: 3 },
                                    { name: "SAÉ CPP-CTR", ects: 3 },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                numero: 4,
                ects: 30,
                competences: [
                    {
                        name: "Élaborer une modélisation numérique",
                        code: "UE1.4",
                        color: competenceColors.UE1.color,
                        bgGradient: competenceColors.UE1.bgGradient,
                        ues: [
                            {
                                name: "UE1.4 - Modélisation numérique",
                                code: "UE1.4",
                                ects: 11,
                                elements: [
                                    { name: "ALGO4 - Algorithmique 4", ects: 4 },
                                    { name: "POO - Programmation Orientée Objet", ects: 7 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Développer des solutions informatiques",
                        code: "UE2.4",
                        color: competenceColors.UE2.color,
                        bgGradient: competenceColors.UE2.bgGradient,
                        ues: [
                            {
                                name: "UE2.4 - Solutions informatiques",
                                code: "UE2.4",
                                ects: 6,
                                elements: [{ name: "BD - Bases de Données", ects: 6 }],
                            },
                        ],
                    },
                    {
                        name: "Gérer une solution informatique",
                        code: "UE3.4",
                        color: competenceColors.UE3.color,
                        bgGradient: competenceColors.UE3.bgGradient,
                        ues: [
                            {
                                name: "UE3.4 - Gestion solution",
                                code: "UE3.4",
                                ects: 3,
                                elements: [{ name: "ARCHI2 - Architecture 2", ects: 3 }],
                            },
                        ],
                    },
                    {
                        name: "Mettre en œuvre un projet informatique",
                        code: "UE4.4",
                        color: competenceColors.UE4.color,
                        bgGradient: competenceColors.UE4.bgGradient,
                        ues: [
                            {
                                name: "UE4.4 - Projet informatique",
                                code: "UE4.4",
                                ects: 3,
                                elements: [
                                    { name: "SAÉ Projet Algo 4", ects: 2 },
                                    { name: "SAÉ Projet BD", ects: 1 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Construire son projet professionnel",
                        code: "UE5.4",
                        color: competenceColors.UE5.color,
                        bgGradient: competenceColors.UE5.bgGradient,
                        ues: [
                            {
                                name: "UE5.4 - Projet professionnel",
                                code: "UE5.4",
                                ects: 7,
                                elements: [
                                    { name: "ANGL4 - Anglais 4", ects: 3 },
                                    { name: "SAÉ CPP-CTR", ects: 4 },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        numero: 3,
        semestres: [
            {
                numero: 5,
                ects: 30,
                competences: [
                    {
                        name: "Élaborer une modélisation numérique",
                        code: "UE1.5",
                        color: competenceColors.UE1.color,
                        bgGradient: competenceColors.UE1.bgGradient,
                        ues: [
                            {
                                name: "UE1.5 - Modélisation numérique",
                                code: "UE1.5",
                                ects: 9,
                                elements: [
                                    { name: "THLA - Théorie de Langage", ects: 7 },
                                    { name: "OL - Outils Logiques", ects: 2 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Développer des solutions informatiques",
                        code: "UE2.5",
                        color: competenceColors.UE2.color,
                        bgGradient: competenceColors.UE2.bgGradient,
                        ues: [
                            {
                                name: "UE2.5 - Solutions informatiques",
                                code: "UE2.5",
                                ects: 13,
                                elements: [
                                    { name: "ALGO5 - Algorithmique 5", ects: 6 },
                                    { name: "CAV - C Avancée & C++", ects: 7 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Gérer une solution informatique",
                        code: "UE3.5",
                        color: competenceColors.UE3.color,
                        bgGradient: competenceColors.UE3.bgGradient,
                        ues: [
                            {
                                name: "UE3.5 - Gestion solution",
                                code: "UE3.5",
                                ects: 3,
                                elements: [{ name: "SHELL - Programmation Shell", ects: 3 }],
                            },
                        ],
                    },
                    {
                        name: "Mettre en œuvre un projet informatique",
                        code: "UE4.5",
                        color: competenceColors.UE4.color,
                        bgGradient: competenceColors.UE4.bgGradient,
                        ues: [
                            {
                                name: "UE4.5 - Projet informatique",
                                code: "UE4.5",
                                ects: 2,
                                elements: [{ name: "SAÉ Projet SHELL", ects: 2 }],
                            },
                        ],
                    },
                    {
                        name: "Construire son projet professionnel",
                        code: "UE5.5",
                        color: competenceColors.UE5.color,
                        bgGradient: competenceColors.UE5.bgGradient,
                        ues: [
                            {
                                name: "UE5.5 - Projet professionnel",
                                code: "UE5.5",
                                ects: 3,
                                elements: [{ name: "ANGL5 - Anglais 5", ects: 3 }],
                            },
                        ],
                    },
                ],
            },
            {
                numero: 6,
                ects: 30,
                competences: [
                    {
                        name: "Élaborer une modélisation numérique",
                        code: "UE1.6",
                        color: competenceColors.UE1.color,
                        bgGradient: competenceColors.UE1.bgGradient,
                        ues: [
                            {
                                name: "UE1.6 - Modélisation numérique",
                                code: "UE1.6",
                                ects: 7,
                                elements: [
                                    { name: "COO - Conception Orientée Objet", ects: 4 },
                                    { name: "PWEB2 - Programmation Web 2", ects: 3 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Développer des solutions informatiques",
                        code: "UE2.6",
                        color: competenceColors.UE2.color,
                        bgGradient: competenceColors.UE2.bgGradient,
                        ues: [
                            {
                                name: "UE2.6 - Solutions informatiques",
                                code: "UE2.6",
                                ects: 5,
                                elements: [{ name: "LCPF - Lambda-Calcul", ects: 5 }],
                            },
                        ],
                    },
                    {
                        name: "Gérer une solution informatique",
                        code: "UE3.6",
                        color: competenceColors.UE3.color,
                        bgGradient: competenceColors.UE3.bgGradient,
                        ues: [
                            {
                                name: "UE3.6 - Gestion solution",
                                code: "UE3.6",
                                ects: 3,
                                elements: [{ name: "ARCHI3 - Architecture 3", ects: 3 }],
                            },
                        ],
                    },
                    {
                        name: "Mettre en œuvre un projet informatique",
                        code: "UE4.6",
                        color: competenceColors.UE4.color,
                        bgGradient: competenceColors.UE4.bgGradient,
                        ues: [
                            {
                                name: "UE4.6 - Projet informatique",
                                code: "UE4.6",
                                ects: 6,
                                elements: [
                                    { name: "SAÉ multi-tiers", ects: 2 },
                                    { name: "SAÉ Technologies Émergentes", ects: 4 },
                                ],
                            },
                        ],
                    },
                    {
                        name: "Construire son projet professionnel",
                        code: "UE5.6",
                        color: competenceColors.UE5.color,
                        bgGradient: competenceColors.UE5.bgGradient,
                        ues: [
                            {
                                name: "UE5.6 - Projet professionnel",
                                code: "UE5.6",
                                ects: 9,
                                elements: [
                                    { name: "ANGL6 - Anglais 6", ects: 3 },
                                    { name: "SAÉ STAGE", ects: 6 },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
]
