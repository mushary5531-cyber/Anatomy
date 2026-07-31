import type { Question } from "../types";
import raw from "./questions.generated.json";

export const QUESTIONS: Question[] = raw as Question[];
