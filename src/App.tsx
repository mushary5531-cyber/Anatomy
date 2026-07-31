import { useEffect, useMemo, useState } from "react";
import { SECTIONS, SECTION_LIST } from "./data/sections";
import { QUESTIONS } from "./data/questions";
import type { Question, Screen, Section } from "./types";
import "./App.css";

const LETTERS = ["A", "B", "C", "D", "E"];
const SEEN_KEY = "anatomy_seen_ids";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // ignore
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [section, setSection] = useState<Section | null>(null);
  const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(1);
  const [hideSeen, setHideSeen] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => loadSeen());
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

  const selectableLectures = section
    ? SECTIONS[section].filter((lec) => (countsByLecture[lec] ?? 0) > 0)
    : [];
  const allSelected =
    selectableLectures.length > 0 &&
    selectedLectures.length === selectableLectures.length;

  const availableCount = useMemo(() => {
    if (!section) return 0;
    return QUESTIONS.filter(
      (q) =>
        q.section === section &&
        selectedLectures.includes(q.lecture) &&
        (!hideSeen || !seenIds.has(q.id))
    ).length;
  }, [section, selectedLectures, hideSeen, seenIds]);

  useEffect(() => {
    setQuestionCount((prev) => {
      if (availableCount === 0) return prev;
      return Math.min(Math.max(prev, 1), availableCount);
    });
  }, [availableCount]);

  function markSeen(id: string) {
    setSeenIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveSeen(next);
      return next;
    });
  }

  function openSection(s: Section) {
    const lectures = SECTIONS[s].filter((lec) => (countsByLecture[lec] ?? 0) > 0);
    const total = QUESTIONS.filter(
      (q) => q.section === s && lectures.includes(q.lecture) && (!hideSeen || !seenIds.has(q.id))
    ).length;
    setSection(s);
    setSelectedLectures(lectures);
    setQuestionCount(Math.min(20, Math.max(total, 1)));
    setScreen("lectures");
  }

  function toggleLecture(lec: string) {
    setSelectedLectures((prev) =>
      prev.includes(lec) ? prev.filter((l) => l !== lec) : [...prev, lec]
    );
  }

  function toggleSelectAll() {
    setSelectedLectures(allSelected ? [] : selectableLectures);
  }

  function startQuiz() {
    const filtered = QUESTIONS.filter(
      (q) =>
        q.section === section &&
        selectedLectures.includes(q.lecture) &&
        (!hideSeen || !seenIds.has(q.id))
    );
    setPool(shuffle(filtered).slice(0, questionCount));
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
    markSeen(q.id);
    if (q.type === "mcq" && optionIndex === q.answerIndex) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongIds((w) => [...w, q.id]);
    }
  }

  function revealFlashcard() {
    setRevealed(true);
    markSeen(pool[index].id);
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
  }

  function retry() {
    if (availableCount > 0) startQuiz();
    else setScreen("lectures");
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
          <div className="screen setup">
            <button className="back" onClick={goHome}>
              → الرئيسية
            </button>
            <h2>{section}</h2>

            <div className="setup-block">
              <div className="setup-block-head">
                <span className="section-label">LECTURES / المحاضرات</span>
                <button className="select-all-btn" onClick={toggleSelectAll}>
                  {allSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                </button>
              </div>
              <div className="pill-grid">
                {selectableLectures.map((lec) => {
                  const active = selectedLectures.includes(lec);
                  return (
                    <button
                      key={lec}
                      className={"pill-select" + (active ? " active" : "")}
                      onClick={() => toggleLecture(lec)}
                    >
                      {lec}
                      {active && <span className="pill-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="setup-block">
              <div className="setup-block-head">
                <span className="section-label">SETTINGS / الإعدادات</span>
              </div>

              <div className="slider-block" dir="ltr">
                <div className="slider-value">{questionCount}</div>
                <input
                  className="slider"
                  type="range"
                  min={1}
                  max={Math.max(availableCount, 1)}
                  value={Math.min(questionCount, Math.max(availableCount, 1))}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={availableCount === 0}
                  style={{
                    ["--fill" as string]: `${
                      ((Math.min(questionCount, Math.max(availableCount, 1)) - 1) /
                        Math.max(availableCount - 1, 1)) *
                      100
                    }%`,
                  }}
                />
                <div className="slider-ends">
                  <span>{availableCount}</span>
                  <span>عدد الأسئلة</span>
                  <span>1</span>
                </div>
              </div>

              <label className="toggle-row">
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={hideSeen}
                    onChange={(e) => setHideSeen(e.target.checked)}
                  />
                  <span className="switch-track">
                    <span className="switch-thumb" />
                  </span>
                </span>
                <span className="toggle-text">
                  <span className="toggle-title">إخفاء الأسئلة المشاهدة</span>
                  <span className="toggle-sub">تخطي الأسئلة اللي جاوبتها قبل</span>
                </span>
              </label>
            </div>

            <button
              className="start-btn"
              onClick={startQuiz}
              disabled={availableCount === 0}
            >
              🚀 ابدأ الاختبار
              <span className="start-btn-sub">
                {questionCount} سؤال · {selectedLectures.length} محاضرة
              </span>
            </button>
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
              <button onClick={retry}>إعادة</button>
              <button onClick={() => setScreen("lectures")}>تخصيص جديد</button>
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
