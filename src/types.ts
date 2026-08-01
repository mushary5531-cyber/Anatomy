export type Section =
  | "Upper Limb"
  | "Lower Limb"
  | "Back and Vertebral Column"
  | "Thoracic and Abdominal Walls";

interface BaseQuestion {
  id: string;
  section: Section;
  lecture: string;
  sourcePage: number;
  image?: string;
  notes?: string;
  slideRef?: string; // e.g. "L1- Pectoral Region and Mammary Gland, Slide 14"
  reviewed?: boolean; // true once cross-checked against the lecture slides
  answerCorrected?: boolean; // true if the answer key was fixed during slide review
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string; // why the correct option is right, and briefly why each other option is wrong
}

export interface FlashcardQuestion extends BaseQuestion {
  type: "flashcard";
  prompt: string;
  answer: string;
}

export type Question = MCQQuestion | FlashcardQuestion;

export type Screen = "home" | "lectures" | "quiz" | "score" | "review";
