export interface EC {
  name: string;
  ects: number;
  note?: number;
}

export interface UE {
  name: string;
  code: string;
  ects: number;
  elements: EC[];
  moyenne?: number;
  validated?: boolean;
}
export interface Competence {
  name: string;
  code: string;
  ues: UE[];
  moyenne?: number;
  validated?: boolean;
  color: string;
  bgGradient: string;
}

export interface Semestre {
  numero: number;
  competences: Competence[];
  moyenne?: number;
  validated?: boolean;
  ects: number;
}

export interface Annee {
  numero: number;
  semestres: [Semestre, Semestre];
  moyenne?: number;
  validated?: boolean;
  mention?: string;
}
