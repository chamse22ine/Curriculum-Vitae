export type Champ = "CC" | "EX1" | "EX2" | "ORAL" | "STG1";

/** Variables d'une formule : les champs saisis et la note de la SAÉ Systèmes et Réseaux */
export type Variable = Champ | "SAESR";

export type Valeurs = Record<Variable, number>;

export interface Formule {
  texte: string;
  variables: Variable[];
  calcul: (v: Valeurs) => number;
}

export interface MasterEC {
  /** Clé de saisie, commune aux occurrences du stage */
  id: string;
  code: string;
  name: string;
  ects: number;
  sae: boolean;
  session1: Formule;
  /** Absente pour les SAÉ et le stage : pas de rattrapage */
  session2?: Formule;
}

export type NiveauCode = "C1" | "C2" | "C3" | "C4";

export interface MasterUE {
  code: string;
  niveau: NiveauCode;
  ects: number;
  elements: MasterEC[];
}

export interface MasterSemestre {
  numero: number;
  ues: MasterUE[];
}

export type Saisies = Record<string, Partial<Record<Champ, number>>>;

export interface MasterState {
  saisies: Saisies;
  /** Demandes de report de la note de session 1, par EC */
  reports: Record<string, boolean>;
}
