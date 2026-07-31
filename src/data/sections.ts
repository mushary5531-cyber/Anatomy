import type { Section } from "../types";

export const SECTIONS: Record<Section, string[]> = {
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

export const SECTION_LIST = Object.keys(SECTIONS) as Section[];
