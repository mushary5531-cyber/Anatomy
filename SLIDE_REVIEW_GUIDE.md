# Slide-grounded content review guide

You are cross-checking anatomy quiz questions against the actual lecture
slides they came from, then writing a grounded explanation for each MCQ and
a precise slide citation for every question. This is a study site for
pharmacy/medicine students — precision matters more than speed.

## The one hard rule

**The lecture slide deck you are given is your ONLY source.** Not general
medical knowledge, not the test-bank's own answer key, not what you already
know about anatomy. Every explanation and every citation must trace back to
something actually shown on a specific slide in the deck you were given.

If a question's topic genuinely isn't covered anywhere in the deck, do not
invent an explanation from memory — leave `explanation` and `slideRef` unset
and add a note: `"notes": "topic not found in the provided slide deck"`.

## What you're given

1. A slide deck rendered to page images at:
   `C:\Users\mesha\AppData\Local\Temp\claude\C--Users-mesha-------------\ae581d55-fbd6-41f1-8d34-d498b2a024cd\scratchpad\slide_pages\<folder>\slide-NNN.png`
   Read every slide with the Read tool before writing anything — you need
   the whole deck in view to know where each topic actually lives.

2. A JSON file with this lecture's questions (already extracted from the
   test bank, in the site's schema). Path given in your task prompt.

## For every MCQ question

Write two things:

**`explanation`** — plain English, matching the slide's own terminology.
One tight paragraph: state why the correct option is right (citing the
specific fact/diagram from the slide), then briefly say why each wrong
option is wrong (one clause each, not a full sentence per option). No
throat-clearing ("This question tests...", "It's important to note..."),
no restating the question, no hedging. Example of the right density:

> The subclavius muscle is NOT part of the anterior axillary fold — the
> fold is formed by pectoralis major and its fascia (Slide 8). Pectoralis
> minor lies deep to major, not at the fold itself; serratus anterior forms
> the medial wall, not the fold; latissimus dorsi forms the posterior fold,
> not the anterior one.

**`slideRef`** — exact citation, format: `"<lecture title>, Slide <N>"`
using the lecture title exactly as given in the question's `lecture` field,
and N = the page number of the rendered image (1-indexed, matching the
`slide-NNN.png` filename) where the answering fact is actually shown. If the
answer draws on two slides, cite the primary one.

## Correcting wrong answers — this is expected, not optional

Some questions were flagged during the previous extraction pass because the
test bank's marked answer conflicted with standard anatomy teaching (look
for a `notes` field already on the question mentioning "verify" or
"standard anatomy"). Now that you have the actual slides: if the slide
clearly shows the marked answer is wrong, **fix it**:

- Set `answerIndex` to the option the slide actually supports
- Set `answerCorrected: true`
- Explain the correction in `notes`, e.g. `"notes": "Answer key marked C (Pectoralis major); Slide 8 clearly shows the apex's anterior boundary is the clavicle, not pec major. Corrected to B."`

Don't correct an answer based on outside knowledge — only when the slide
itself settles it. If the slide is ambiguous or doesn't address the
disputed point, leave the answer as-is and keep the existing note.

## Flashcard questions

Just add `slideRef` (same format) pointing to the slide the prompt/answer
content is drawn from. No `explanation` needed — the flashcard's `answer`
already serves that role.

## Every question gets `"reviewed": true`

Whether or not you found a citation, mark every question you processed with
`"reviewed": true` so the site can distinguish reviewed content from
not-yet-reviewed content.

## Output

Write the updated array (same questions, same order, same `id`s — just with
`explanation`/`slideRef`/`reviewed`/`answerCorrected` fields added or
updated, and `notes` updated where relevant) as JSON to the output path
given in your task prompt. Do not add or remove questions.
