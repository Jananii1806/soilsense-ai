// Soil dataset for phytoremediation plant classification
// 7 plant classes, 150 samples, 10 features

export const PLANT_CLASSES = [
  "Sunflower",
  "Indian Mustard",
  "Vetiver Grass",
  "Willow Tree",
  "Hemp",
  "Pteris Fern",
  "Poplar Tree",
] as const;

export type PlantClass = (typeof PLANT_CLASSES)[number];

export const PLANT_INFO: Record<
  PlantClass,
  { emoji: string; description: string; specialty: string; color: string }
> = {
  Sunflower: {
    emoji: "🌻",
    description:
      "Sunflowers are hyperaccumulators of lead and zinc, drawing toxins from soil into their shoots. They were even used at Chernobyl to remove radioactive cesium.",
    specialty: "Lead (Pb) & Zinc (Zn) accumulation",
    color: "text-yellow-600",
  },
  "Indian Mustard": {
    emoji: "🌿",
    description:
      "Indian Mustard (Brassica juncea) is one of the best cadmium hyperaccumulators, effectively binding heavy metals in its above-ground biomass for easy harvest.",
    specialty: "Cadmium (Cd) & Lead (Pb) hyperaccumulation",
    color: "text-green-600",
  },
  "Vetiver Grass": {
    emoji: "🌾",
    description:
      "Vetiver Grass forms deep root systems that stabilize soil while tolerating and accumulating chromium and nickel. Excellent for erosion-prone contaminated sites.",
    specialty: "Chromium (Cr) & Nickel (Ni) stabilization",
    color: "text-lime-700",
  },
  "Willow Tree": {
    emoji: "🌳",
    description:
      "Willows thrive in moist soils and are effective at extracting arsenic and cadmium. Their extensive root systems and fast biomass growth accelerate remediation.",
    specialty: "Arsenic (As) & Cadmium in wet/low-pH soils",
    color: "text-emerald-700",
  },
  Hemp: {
    emoji: "🪴",
    description:
      "Industrial hemp accumulates a broad spectrum of heavy metals across its whole plant. Its rapid growth cycle makes it ideal for mixed contamination scenarios.",
    specialty: "Broad-spectrum heavy metal accumulation",
    color: "text-teal-600",
  },
  "Pteris Fern": {
    emoji: "🌱",
    description:
      "Pteris vittata (Chinese Brake Fern) is the world's best arsenic hyperaccumulator, concentrating up to 22,600 ppm arsenic in its fronds — 200x ambient levels.",
    specialty: "Arsenic (As) hyperaccumulation specialist",
    color: "text-green-800",
  },
  "Poplar Tree": {
    emoji: "🌲",
    description:
      "Hybrid Poplars combine phytoextraction and phytodegradation, breaking down organic contaminants while absorbing metals. Best for moderately contaminated or nitrogen-rich sites.",
    specialty: "Balanced remediation & nitrogen-rich soils",
    color: "text-green-700",
  },
};

// Feature indices: [pH, Pb, Cd, As, Ni, Zn, Cr, organicMatter, N, P]
// Normalization ranges
export const FEATURE_RANGES = [
  { min: 3, max: 10 }, // pH
  { min: 0, max: 500 }, // leadPPM
  { min: 0, max: 50 }, // cadmiumPPM
  { min: 0, max: 300 }, // arsenicPPM
  { min: 0, max: 400 }, // nickelPPM
  { min: 0, max: 1000 }, // zincPPM
  { min: 0, max: 400 }, // chromiumPPM
  { min: 0, max: 10 }, // organicMatter%
  { min: 0, max: 200 }, // nitrogenPPM
  { min: 0, max: 200 }, // phosphorusPPM
];

export function normalizeFeatures(features: number[]): number[] {
  return features.map((v, i) => {
    const { min, max } = FEATURE_RANGES[i];
    return Math.min(1, Math.max(0, (v - min) / (max - min)));
  });
}

export function estimateRemediationCycles(
  plantIndex: number,
  features: number[],
): number {
  const [pH, Pb, Cd, As, Ni, Zn, Cr, , ,] = features;
  let cycles = 1;
  switch (plantIndex) {
    case 0: // Sunflower
      cycles = Math.max(1, Math.ceil(Math.max(Pb / 80, Zn / 200)));
      break;
    case 1: // Indian Mustard
      cycles = Math.max(1, Math.ceil(Cd / 3) + 1);
      break;
    case 2: // Vetiver Grass
      cycles = Math.max(1, Math.ceil((Cr + Ni) / 150));
      break;
    case 3: // Willow Tree
      cycles = Math.max(1, Math.ceil(As / 40) + (pH < 5.5 ? 1 : 0));
      break;
    case 4: // Hemp
      cycles = Math.max(
        2,
        Math.min(5, Math.ceil((Pb + Cd * 10 + As / 10) / 80)),
      );
      break;
    case 5: // Pteris Fern
      cycles = Math.max(1, Math.ceil(As / 60));
      break;
    case 6: // Poplar Tree
      cycles = Math.max(2, Math.min(4, Math.ceil((Pb + Zn / 5) / 60)));
      break;
  }
  return Math.min(8, Math.max(1, cycles));
}

interface SoilSample {
  features: number[]; // raw, un-normalized
  label: number;
}

// Generate synthetic training data
function r(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateSamples(): SoilSample[] {
  const samples: SoilSample[] = [];

  // Class 0: Sunflower - high Pb or Zn, moderate others
  for (let i = 0; i < 22; i++) {
    samples.push({
      features: [
        r(5.5, 7.5),
        r(120, 450),
        r(1, 8),
        r(5, 30),
        r(10, 60),
        r(300, 900),
        r(10, 60),
        r(1, 5),
        r(20, 100),
        r(20, 80),
      ],
      label: 0,
    });
  }

  // Class 1: Indian Mustard - high Cd, moderate-high Pb, low Zn
  for (let i = 0; i < 22; i++) {
    samples.push({
      features: [
        r(5, 7),
        r(60, 200),
        r(10, 45),
        r(5, 40),
        r(10, 50),
        r(30, 150),
        r(15, 70),
        r(1, 6),
        r(20, 80),
        r(20, 70),
      ],
      label: 1,
    });
  }

  // Class 2: Vetiver Grass - high Cr or Ni
  for (let i = 0; i < 21; i++) {
    samples.push({
      features: [
        r(5.5, 8),
        r(10, 80),
        r(1, 6),
        r(5, 30),
        r(150, 380),
        r(50, 200),
        r(120, 380),
        r(2, 8),
        r(20, 100),
        r(20, 80),
      ],
      label: 2,
    });
  }

  // Class 3: Willow Tree - high As, low pH, moist
  for (let i = 0; i < 21; i++) {
    samples.push({
      features: [
        r(3.5, 5.8),
        r(10, 60),
        r(2, 15),
        r(60, 250),
        r(10, 60),
        r(50, 200),
        r(10, 50),
        r(4, 9),
        r(10, 80),
        r(10, 60),
      ],
      label: 3,
    });
  }

  // Class 4: Hemp - mixed moderate contamination
  for (let i = 0; i < 21; i++) {
    samples.push({
      features: [
        r(6, 7.5),
        r(40, 150),
        r(3, 15),
        r(20, 80),
        r(40, 150),
        r(100, 300),
        r(40, 150),
        r(2, 7),
        r(30, 120),
        r(30, 100),
      ],
      label: 4,
    });
  }

  // Class 5: Pteris Fern - very high As dominant
  for (let i = 0; i < 22; i++) {
    samples.push({
      features: [
        r(4.5, 7),
        r(5, 40),
        r(1, 8),
        r(120, 290),
        r(5, 40),
        r(20, 100),
        r(10, 50),
        r(2, 7),
        r(10, 60),
        r(10, 50),
      ],
      label: 5,
    });
  }

  // Class 6: Poplar Tree - balanced low-moderate contamination
  for (let i = 0; i < 21; i++) {
    samples.push({
      features: [
        r(6.5, 8.5),
        r(5, 60),
        r(0.5, 5),
        r(2, 25),
        r(5, 50),
        r(20, 150),
        r(5, 50),
        r(3, 9),
        r(60, 180),
        r(50, 150),
      ],
      label: 6,
    });
  }

  return samples;
}

export function getDataset(): {
  trainData: Array<{ features: number[]; label: number }>;
  testData: Array<{ features: number[]; label: number }>;
} {
  // Use a fixed seed-like approach by generating deterministic data
  // We generate and split 80/20
  const raw = generateSamples();

  // Normalize
  const normalized = raw.map((s) => ({
    features: normalizeFeatures(s.features),
    label: s.label,
  }));

  // Shuffle
  const shuffled = [...normalized].sort(() => Math.random() - 0.5);
  const splitIdx = Math.floor(shuffled.length * 0.8);

  return {
    trainData: shuffled.slice(0, splitIdx),
    testData: shuffled.slice(splitIdx),
  };
}
