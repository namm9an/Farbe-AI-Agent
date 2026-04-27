export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type ExtractedColor = {
  hex: string;
  rgb: RGB;
  weight: number;
  role: "primary" | "secondary" | "accent" | "neutral";
};

export type ColorMatch = {
  reference: ExtractedColor;
  target: ExtractedColor | null;
  distance: number;
};

export type AnalysisResult = {
  referencePalette: ExtractedColor[];
  targetPalette: ExtractedColor[];
  colorMatchScore: number;
  findings: string[];
  suggestions: string[];
  matches: ColorMatch[];
  confidence: number;
  summary: string;
  createdAt: string;
};
