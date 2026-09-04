export type TourId =
  | 'home'
  | 'createMatch'
  | 'session'
  | 'match'
  | 'rounds'
  | 'pelusas'
  | 'skullKing'
  | 'piliPili'
  | 'flip7'
  | 'aventurerosSubmode'
  | 'aventurerosConstruccion'
  | 'aventurerosDestinos'
  | 'regicideSelect'
  | 'regicideCombat';

export type LayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TourStep = {
  id: string;
  title: string;
  body: string;
  /** Si no hay ancla, el tooltip se muestra centrado. */
  anchorId?: string;
};

export type TourDefinition = {
  id: TourId;
  steps: TourStep[];
};

export type OnboardingState = {
  version: number;
  welcomeSeen: boolean;
  completedTours: TourId[];
};

export type AnchorHandle = {
  measure: () => Promise<LayoutRect | null>;
  onFocus?: () => void;
};
