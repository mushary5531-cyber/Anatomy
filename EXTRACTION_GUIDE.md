# Anatomy test bank extraction guide

You are extracting multiple-choice and flashcard-style questions from a
154-page anatomy test bank (already rendered to page images) into structured
JSON for a quiz website. Precision matters: this is used by pharmacy/medical
students to study, so every question must be transcribed faithfully, fixed of
obvious typos, and filed under the *correct* lecture.

## Source images

Rendered PNG pages (150dpi) live at:
`C:\Users\mesha\AppData\Local\Temp\claude\C--Users-mesha-------------\ae581d55-fbd6-41f1-8d34-d498b2a024cd\scratchpad\testbank_pages\page-NNN.png`
(3-digit zero-padded page number, e.g. `page-057.png`).

Read each page in your assigned range with the Read tool (it can read PNG
images directly).

## Pages to skip entirely (not questions)

- Page 1: cover page
- Page 2: "Topics Included in Each Assessment" (exam scope summary — not content)
- Page 3: table of contents / lecture list
- Any page that is ONLY a section-divider with a topic list and no actual
  question text (e.g. a page reading just "Upper limb (5)" with a table of
  lecture titles and no Q/A content — this is a divider, not a question)
- The final page (154): a closing dua/prayer page, no content

## Taxonomy — classify into EXACTLY these 4 sections and their lectures

```
Upper Limb:
  - L1- Pectoral Region and Mammary Gland
  - L2- Back, Shoulder, and Scapular Region
  - L3- Axilla
  - L4- The Arm
  - L5,6- The Forearm (Posterior & Anterior)
  - L7- The Hand
  - L8- Brachial Plexus & Nerve Lesions
  - L9- Joints of Upper Limb and Radiology

Lower Limb:
  - Anterior Compartment of the Thigh
  - Medial Compartment of the Thigh
  - Neurovascular structures and relationships in anteromedial thigh
  - Gluteal Region
  - Back of Thigh & The Popliteal Fossa
  - Posterior and Lateral Compartments of Leg
  - Anterior Compartment of Leg
  - Venous and Lymphatic Drainage of Leg
  - The Foot
  - Nerves and Lesions of Lower Limb
  - Joints of Lower Limb

Back and Vertebral Column:
  - Muscles of the Back and Vertebral Column
  - Joints of the Back, Lesions, and Radiology

Thoracic and Abdominal Walls:
  - Anterior and Posterior Thoracic Walls
  - Anterolateral Abdominal Wall
  - Posterior Abdominal Wall
```

**Classify by the question's actual anatomical content, never by the page's
source-batch label.** Pages carry labels like "2nd mid اسئلة تجميعات med25",
"MED24", "—Locker21—✧🎉 anatomy Quiz 2 (med21 ملف)", "1-1st game anatomy quiz
file (med24ملف)", "تجميعات اسئلة كويز1 (دفعة 2023)" — these are just which
student batch collected the question. They are NOT the exam/section
classification. You must read the question and decide which of the 19
lectures above it actually belongs to, using your own anatomy knowledge.

## EXCLUDE "General Anatomy" content — out of scope

The test bank also contains a "General Anatomy" topic set (anatomical
terminology, skeletal system, articular system, muscular system, intro to
body systems/blood vessels, nervous system/brain — e.g. brain lobes,
brainstem, GPCR/receptor types, cranial content). **Skip every question in
this category entirely** — do not output it. Only the 4 sections above are
in scope. When in doubt whether a question belongs to General Anatomy vs. one
of the 4 target sections, check whether it maps to one of the 19 specific
lecture titles above; if it doesn't fit any of them, exclude it.

## Two question formats

**1. Standard MCQ.** Numbered question with lettered options (a/b/c/d or
A/B/C/D, sometimes 5 options a-e). An answer-key table appears at the
bottom of the page (or sometimes doesn't reach the bottom until a later
page — track running Q-numbers across pages if a table is delayed). Match
each question number to its answer letter, convert to a 0-based
`answerIndex` (a=0, b=1, c=2, d=3, e=4).

**2. Flashcard/table pairs.** A prompt page (e.g. "1. snuffbox content" with
an empty table, or "2. List 4 contents of cubital fossa from medial to
lateral:" with a blank box) is immediately followed on the NEXT page by the
same layout filled in with the answer. **Combine these two pages into ONE
flashcard question** — do not emit them as two separate items. Use the
prompt page's heading as `prompt`, and transcribe the filled-in content from
the answer page as plain text into `answer` (use `\n` line breaks between
rows, e.g. `"Medial border: Extensor Pollicis Longus\nLateral border: ...\nFloor: ..."`).

## Images — 9 pre-extracted real images, nothing else

Only these 9 questions in the ENTIRE test bank have a real diagnostic/diagram
image (X-ray, MRI, clinical photo, or illustration) that matters for
answering. They have already been extracted and saved for you — do NOT try
to extract any image yourself. Just reference the exact relative path below
in the `image` field of the matching question (matched by page number and
question content):

| Page | File (relative to repo `src/`) | What it shows |
|------|-------------------------------|----------------|
| 57 | `assets/questions/p57-hip-xray.jpg` | pelvis/hip X-ray (Q about bony projection below pubic tubercle / adductor muscle) |
| 58 | `assets/questions/p58-thenar-wasting.jpg` | hand photo, thenar eminence wasting circled (Q: "What nerve is damaged?") |
| 63 | `assets/questions/p63-humerus-fracture-xray.jpg` | humerus/arm X-ray with arrow (Q29: "What deformity will this cause?") |
| 64 | `assets/questions/p64-shoulder-mri.jpg` | shoulder MRI, numbered structures 1-6 (Q30: "What is the name of structure number 1?") |
| 71 | `assets/questions/p71-wrist-xray.jpg` | wrist X-ray with arrow (Q7: "What is a feature of the structure indicated here?") |
| 73 | `assets/questions/p73-wrist-drop-sketch.jpg` | sketch of hand/wrist deformity (Q5: "Which nerve is responsible for the following deformity") |
| 74 | `assets/questions/p74-elbow-xray.jpg` | elbow X-ray (Q6: "according to the photo, which nerve will be affected?") |
| 135 | `assets/questions/p135-hand-gesture.jpg` | hand making a specific gesture/pose (Q4: "(Hand position shown) Which nerve is being tested?") |
| 140 | `assets/questions/p140-scoliosis.jpg` | back illustration showing spinal curvature (Q2: "(Spine X-ray shown) The diagnosis is:") |

Every OTHER image you see rendered on a page is either:
- **decorative recycled clip art** (the same muscle/rib-cage/brain/body
  illustrations appear in the corners of literally every page) — completely
  ignore these, or
- **a text table/list rendered as a picture** (like the flashcard question
  pages, or a section-divider topic list) — transcribe the text content,
  do not treat it as an "image".

If you encounter what looks like a genuine 10th diagnostic image not in the
table above, do not attempt to extract it — just add a `"notes"` field like
`"needs image extraction, not in pre-extracted set"` so it can be handled
later, and still transcribe the rest of the question normally.

## Fixing errors

Transcribe faithfully, but silently fix obvious typos (e.g. "felxor" →
"flexor", "musculocteneous" → "musculocutaneous", stray double spaces). If a
question or answer key looks factually wrong or internally inconsistent
(e.g. the marked "correct" answer contradicts standard anatomy), do NOT
silently change the answer — instead add a `"notes"` field flagging your
concern, e.g. `"notes": "answer key says C but standard anatomy suggests B — verify"`.

## Output schema

Write a JSON array to your assigned output file (see task prompt). Each
element is one of:

```json
{
  "id": "p57q4",
  "type": "mcq",
  "section": "Lower Limb",
  "lecture": "Medial Compartment of the Thigh",
  "sourcePage": 57,
  "question": "The patient has a bony projection below the pubic tubercle, the patient also has (pain/numbness) when adducting his right leg, what muscle is likely affected?",
  "options": ["Gracilis", "adductor longus", "adductor brevis", "adductor magnus"],
  "answerIndex": 1,
  "image": "assets/questions/p57-hip-xray.jpg"
}
```

```json
{
  "id": "p28q1",
  "type": "flashcard",
  "section": "Upper Limb",
  "lecture": "L7- The Hand",
  "sourcePage": 28,
  "prompt": "1. snuffbox content",
  "answer": "Medial border: Extensor Pollicis Longus\nLateral border: Tendons of the Abductor Pollicis Longus (APL) and Extensor Pollicis Brevis (EPB)\nFloor: Scaphoid and Trapezium"
}
```

Fields: `id` (unique within your file — use `p<page>q<number>` or
`p<page>-<n>` for flashcards), `type` (`"mcq"` or `"flashcard"`), `section`
(exact string from the taxonomy), `lecture` (exact string from the
taxonomy), `sourcePage` (int), plus type-specific fields as shown. Add
`"notes"` only when needed (typo fixes worth flagging, answer-key doubts,
missing image). Omit `image` entirely when there isn't one.

Skip any question you cannot confidently classify into one of the 19
lectures (note it briefly in your final summary to the user, don't guess
wildly).
