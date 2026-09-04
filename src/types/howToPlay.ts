export type HowToPlayTerm = {
  term: string;
  definition: string;
};

export type HowToPlayHierarchyLevel = {
  label: string;
  arrowBonus?: string;
};

export type HowToPlayMatchup = {
  from: string;
  to: string;
  bonus?: string;
};

export type HowToPlayItem =
  | { type: 'term'; term: string; definition: string }
  | { type: 'heading'; title: string; body?: string }
  | { type: 'note'; text: string }
  | { type: 'hierarchy'; levels: HowToPlayHierarchyLevel[] }
  | { type: 'matchups'; rows: HowToPlayMatchup[] }
  | {
      type: 'table';
      headers: string[];
      rows: string[][];
      /** score: última columna a la derecha. center: todo centrado. text: todo a la izquierda. */
      align?: 'score' | 'center' | 'text';
    };

export type HowToPlaySection = {
  title: string;
  body?: string;
  terms?: HowToPlayTerm[];
  items?: HowToPlayItem[];
};
