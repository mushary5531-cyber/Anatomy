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
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}

export interface FlashcardQuestion extends BaseQuestion {
  type: "flashcard";
  prompt: string;
  answer: string;
}

export type Question = MCQQuestion | FlashcardQuestion;

export type Screen = "home" | "lectures" | "quiz" | "score" | "review";
