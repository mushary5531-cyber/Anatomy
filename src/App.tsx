import { useMemo, useState } from "react";
import { SECTIONS, SECTION_LIST } from "./data/sections";
import { QUESTIONS } from "./data/questions";
import type { Question, Screen, Section } from "./types";
import "./App.css";

const LETTERS = ["A", "B", "C", "D", "E"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [section, setSection] = useState<Section | null>(null);
  const [lecture, setLecture] = useState<string | null>(null); // null = whole section
  const [pool, setPool] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const countsBySection = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of QUESTIONS) map[q.section] = (map[q.section] ?? 0) + 1;
    return map;
  }, []);

  const countsByLecture = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of QUESTIONS) map[q.lecture] = (map[q.lecture] ?? 0) + 1;
    return map;
  }, []);

  function openSection(s: Section) {
    setSection(s);
    setScreen("lectures");
  }

  function startQuiz(lec: string | null) {
    const filtered = QUESTIONS.filter(
      (q) => q.section === section && (lec === null || q.lecture === lec)
    );
    setLecture(lec);
    setPool(shuffle(filtered));
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setWrongIds([]);
    setScreen("quiz");
  }

  function answerMCQ(optionIndex: number) {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
    const q = pool[index];
    if (q.type === "mcq" && optionIndex === q.answerIndex) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongIds((w) => [...w, q.id]);
    }
  }

  function revealFlashcard() {
    setRevealed(true);
  }

  function next() {
    if (index + 1 >= pool.length) {
      setScreen("score");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  function goHome() {
    setScreen("home");
    setSection(null);
    setLecture(null);
  }

  const current = pool[index];

  return (
    <>
      <div className="aurora" />
      <div className="app">
        {screen === "home" && (
          <div className="screen home">
            <span className="badge">Anatomy 🦴</span>
            <h1>Anatomy</h1>
            <p className="subtitle">بنك أسئلة التشريح — اختر القسم</p>
            <div className="grid">
              {SECTION_LIST.map((s) => (
                <button key={s} className="card" onClick={() => openSection(s)}>
                  <div className="card-title">{s}</div>
                  <div className="card-count">{countsBySection[s] ?? 0} سؤال</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === "lectures" && section && (
          <div className="screen lectures">
            <button className="back" onClick={goHome}>
              → الرئيسية
            </button>
            <h2>{section}</h2>
            <button
              className="lecture-item all"
              onClick={() => startQuiz(null)}
              disabled={(countsBySection[section] ?? 0) === 0}
            >
              <span>كل القسم</span>
              <span className="count">{countsBySection[section] ?? 0}</span>
            </button>
            {SECTIONS[section].map((lec) => (
              <button
                key={lec}
                className="lecture-item"
                onClick={() => startQuiz(lec)}
                disabled={(countsByLecture[lec] ?? 0) === 0}
              >
                <span>{lec}</span>
                <span className="count">{countsByLecture[lec] ?? 0}</span>
              </button>
            ))}
          </div>
        )}

        {screen === "quiz" && current && (
          <div className="screen quiz">
            <div className="topbar">
              <span className="pill">{current.lecture}</span>
              <button className="home-btn" onClick={goHome}>
                Home ←
              </button>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${((index + 1) / pool.length) * 100}%` }}
              />
            </div>
            <div className="progress">
              {pool.length} / {index + 1}
            </div>

            <div className="quiz-card">
              <div className="lecture-tag">{current.section}</div>

              {current.image && (
                <img
                  className="q-image"
                  src={import.meta.env.BASE_URL + current.image}
                  alt=""
                />
              )}

              {current.type === "mcq" ? (
                <>
                  <div className="question">{current.question}</div>
                  <div className="options">
                    {current.options.map((opt, i) => {
                      let cls = "option";
                      if (revealed) {
                        if (i === current.answerIndex) cls += " correct";
                        else if (i === selected) cls += " incorrect";
                      } else if (i === selected) {
                        cls += " selected";
                      }
                      return (
                        <button
                          key={i}
                          className={cls}
                          onClick={() => answerMCQ(i)}
                          disabled={revealed}
                        >
                          <span className="option-letter">{LETTERS[i]}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {revealed && current.explanation && (
                    <div className="explanation">
                      <div className="explanation-label">
                        <span>الشرح</span>
                        <span>Explanation 💡</span>
                      </div>
                      {current.explanation}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="question">{current.prompt}</div>
                  {!revealed ? (
                    <button className="reveal-btn" onClick={revealFlashcard}>
                      إظهار الإجابة
                    </button>
                  ) : (
                    <div className="flashcard-answer">{current.answer}</div>
                  )}
                </>
              )}

              {revealed && (
                <button className="next-btn" onClick={next}>
                  {index + 1 >= pool.length ? "إنهاء ←" : "التالي ←"}
                </button>
              )}
            </div>
          </div>
        )}

        {screen === "score" && (
          <div className="screen score">
            <h2>النتيجة</h2>
            <div className="score-value">
              {correctCount} / {pool.filter((q) => q.type === "mcq").length}
            </div>
            <div className="score-actions">
              <button onClick={() => startQuiz(lecture)}>إعادة</button>
              <button onClick={() => setScreen("lectures")}>رجوع للمحاضرات</button>
              <button onClick={goHome}>الرئيسية</button>
            </div>
            {wrongIds.length > 0 && (
              <button className="review-btn" onClick={() => setScreen("review")}>
                مراجعة الأخطاء ({wrongIds.length})
              </button>
            )}
          </div>
        )}

        {screen === "review" && (
          <div className="screen review">
            <button className="back" onClick={() => setScreen("score")}>
              → رجوع
            </button>
            <h2>مراجعة الأخطاء</h2>
            {pool
              .filter((q) => wrongIds.includes(q.id))
              .map((q) => (
                <div key={q.id} className="review-item">
                  <div className="lecture-tag">{q.lecture}</div>
                  {q.image && (
                    <img
                      className="q-image"
                      src={import.meta.env.BASE_URL + q.image}
                      alt=""
                    />
                  )}
                  {q.type === "mcq" && (
                    <>
                      <div className="question">{q.question}</div>
                      <div className="options">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={
                              "option static" +
                              (i === q.answerIndex ? " correct" : "")
                            }
                          >
                            <span className="option-letter">{LETTERS[i]}</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="explanation">
                          <div className="explanation-label">
                            <span>الشرح</span>
                            <span>Explanation 💡</span>
                          </div>
                          {q.explanation}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
