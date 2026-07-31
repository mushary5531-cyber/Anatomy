const fs = require("fs");
const path = require("path");

const SECTIONS = {
  "Upper Limb": [
    "L1- Pectoral Region and Mammary Gland",
    "L2- Back, Shoulder, and Scapular Region",
    "L3- Axilla",
    "L4- The Arm",
    "L5,6- The Forearm (Posterior & Anterior)",
    "L7- The Hand",
    "L8- Brachial Plexus & Nerve Lesions",
    "L9- Joints of Upper Limb and Radiology",
  ],
  "Lower Limb": [
    "Anterior Compartment of the Thigh",
    "Medial Compartment of the Thigh",
    "Neurovascular structures and relationships in anteromedial thigh",
    "Gluteal Region",
    "Back of Thigh & The Popliteal Fossa",
    "Posterior and Lateral Compartments of Leg",
    "Anterior Compartment of Leg",
    "Venous and Lymphatic Drainage of Leg",
    "The Foot",
    "Nerves and Lesions of Lower Limb",
    "Joints of Lower Limb",
  ],
  "Back and Vertebral Column": [
    "Muscles of the Back and Vertebral Column",
    "Joints of the Back, Lesions, and Radiology",
  ],
  "Thoracic and Abdominal Walls": [
    "Anterior and Posterior Thoracic Walls",
    "Anterolateral Abdominal Wall",
    "Posterior Abdominal Wall",
  ],
};
const VALID_LECTURES = new Set(Object.values(SECTIONS).flat());
const VALID_SECTIONS = new Set(Object.keys(SECTIONS));

const files = ["batch-A.json", "batch-B.json", "batch-C.json", "batch-D.json"];
const seenIds = new Set();
const merged = [];
const problems = [];
const imageDir = path.join(__dirname, "..", "..", "assets", "questions");
const existingImages = new Set(fs.readdirSync(imageDir));

for (const file of files) {
  const items = JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
  for (const q of items) {
    const tag = `${file}:${q.id}`;
    if (!q.id || !q.type || !q.section || !q.lecture || !q.sourcePage) {
      problems.push(`${tag}: missing required base field`);
      continue;
    }
    if (seenIds.has(q.id)) {
      problems.push(`${tag}: DUPLICATE id (renaming with file prefix)`);
      q.id = `${file.replace(".json", "")}-${q.id}`;
    }
    seenIds.add(q.id);

    if (!VALID_SECTIONS.has(q.section)) {
      problems.push(`${tag}: invalid section "${q.section}"`);
    }
    if (!VALID_LECTURES.has(q.lecture)) {
      problems.push(`${tag}: invalid lecture "${q.lecture}"`);
    }
    if (q.section && q.lecture && VALID_SECTIONS.has(q.section) && !SECTIONS[q.section].includes(q.lecture)) {
      problems.push(`${tag}: lecture "${q.lecture}" doesn't belong to section "${q.section}"`);
    }

    if (q.type === "mcq") {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
        problems.push(`${tag}: mcq missing question/options`);
      }
      if (typeof q.answerIndex !== "number" || q.answerIndex < 0 || q.answerIndex >= (q.options || []).length) {
        problems.push(`${tag}: mcq invalid answerIndex`);
      }
    } else if (q.type === "flashcard") {
      if (!q.prompt || !q.answer) {
        problems.push(`${tag}: flashcard missing prompt/answer`);
      }
    } else {
      problems.push(`${tag}: unknown type "${q.type}"`);
    }

    if (q.image) {
      const base = q.image.split("/").pop();
      if (!existingImages.has(base)) {
        problems.push(`${tag}: image file not found: ${q.image}`);
      }
    }

    merged.push(q);
  }
}

fs.writeFileSync(
  path.join(__dirname, "merged-report.txt"),
  `Total merged: ${merged.length}\nProblems: ${problems.length}\n\n` + problems.join("\n")
);

fs.writeFileSync(path.join(__dirname, "merged.json"), JSON.stringify(merged, null, 2));

console.log("Total merged:", merged.length);
console.log("Problems:", problems.length);
if (problems.length) console.log(problems.slice(0, 50).join("\n"));

// breakdown by section
const bySec = {};
for (const q of merged) bySec[q.section] = (bySec[q.section] || 0) + 1;
console.log("By section:", bySec);
