/**
 * Starter menus offered right after signup. An owner who *overwrites* "Margherita
 * 9,50" is far quicker than one facing an empty form — and every seeded row is
 * flagged `isExample` so the builder can warn before it reaches guests.
 */
export type PresetItem = {
  name: string;
  description?: string;
  price: number;
  allergens?: string[];
  tags?: string[];
};

export type PresetCategory = {
  name: string;
  icon: string;
  items: PresetItem[];
};

export type CuisinePreset = {
  key: string;
  label: string;
  description: string;
  icon: string;
  accent: string;
  categories: PresetCategory[];
};

export const CUISINE_PRESETS: CuisinePreset[] = [
  {
    key: "cafe",
    label: "Café",
    description: "Kaffee, Kuchen, Frühstück",
    icon: "coffee",
    accent: "#8a5a3b",
    categories: [
      {
        name: "Kaffee",
        icon: "coffee",
        items: [
          { name: "Espresso", price: 250, tags: ["vegan"] },
          { name: "Cappuccino", price: 390, allergens: ["G"], tags: ["vegetarian"] },
          { name: "Flat White", price: 420, allergens: ["G"], tags: ["vegetarian"] },
        ],
      },
      {
        name: "Frühstück",
        icon: "croissant",
        items: [
          {
            name: "Croissant",
            description: "Mit Butter und Marmelade",
            price: 350,
            allergens: ["A", "C", "G"],
            tags: ["vegetarian"],
          },
          {
            name: "Rührei mit Brot",
            description: "Drei Eier, Schnittlauch, Sauerteigbrot",
            price: 790,
            allergens: ["A", "C", "G"],
            tags: ["vegetarian"],
          },
        ],
      },
      {
        name: "Kuchen",
        icon: "cake-slice",
        items: [
          { name: "Käsekuchen", price: 420, allergens: ["A", "C", "G"], tags: ["vegetarian"] },
          { name: "Apfelstrudel", price: 450, allergens: ["A", "C", "G", "H"], tags: ["vegetarian"] },
        ],
      },
      {
        name: "Kalte Getränke",
        icon: "cup-soda",
        items: [
          { name: "Hausgemachte Limonade", price: 390, tags: ["vegan"] },
          { name: "Mineralwasser 0,33 l", price: 290, tags: ["vegan"] },
        ],
      },
    ],
  },
  {
    key: "italian",
    label: "Italienisch",
    description: "Pizza, Pasta, Antipasti",
    icon: "pizza",
    accent: "#b4472a",
    categories: [
      {
        name: "Antipasti",
        icon: "salad",
        items: [
          {
            name: "Bruschetta",
            description: "Tomaten, Basilikum, Knoblauch, Olivenöl",
            price: 690,
            allergens: ["A"],
            tags: ["vegan"],
          },
          { name: "Vitello Tonnato", price: 1190, allergens: ["C", "D"] },
        ],
      },
      {
        name: "Pizza",
        icon: "pizza",
        items: [
          {
            name: "Margherita",
            description: "Tomaten, Mozzarella, Basilikum",
            price: 950,
            allergens: ["A", "G"],
            tags: ["vegetarian"],
          },
          {
            name: "Salame Piccante",
            description: "Scharfe Salami, Peperoncino",
            price: 1250,
            allergens: ["A", "G"],
            tags: ["spicy"],
          },
        ],
      },
      {
        name: "Pasta",
        icon: "soup",
        items: [
          { name: "Spaghetti Aglio e Olio", price: 1090, allergens: ["A"], tags: ["vegan"] },
          { name: "Tagliatelle al Ragù", price: 1490, allergens: ["A", "C", "G"] },
        ],
      },
      {
        name: "Dolci",
        icon: "cake-slice",
        items: [
          { name: "Tiramisù", price: 690, allergens: ["A", "C", "G"], tags: ["vegetarian"] },
          { name: "Panna Cotta", price: 620, allergens: ["G"], tags: ["vegetarian", "gluten-free"] },
        ],
      },
      {
        name: "Getränke",
        icon: "wine",
        items: [
          { name: "Hauswein rot 0,2 l", price: 650, allergens: ["O"], tags: ["vegan"] },
          { name: "Espresso", price: 250, tags: ["vegan"] },
        ],
      },
    ],
  },
  {
    key: "bar",
    label: "Bar & Kneipe",
    description: "Drinks, Bier, Snacks",
    icon: "martini",
    accent: "#1e3a8a",
    categories: [
      {
        name: "Cocktails",
        icon: "martini",
        items: [
          { name: "Gin Tonic", price: 950, tags: ["vegan"] },
          { name: "Aperol Spritz", price: 890, allergens: ["O"], tags: ["vegan"] },
          { name: "Negroni", price: 1050, allergens: ["O"], tags: ["vegan"] },
        ],
      },
      {
        name: "Bier",
        icon: "beer",
        items: [
          { name: "Pils vom Fass 0,3 l", price: 390, allergens: ["A"], tags: ["vegan"] },
          { name: "Weizen 0,5 l", price: 480, allergens: ["A"], tags: ["vegan"] },
        ],
      },
      {
        name: "Alkoholfrei",
        icon: "cup-soda",
        items: [
          { name: "Cola / Fanta 0,3 l", price: 350, tags: ["vegan"] },
          { name: "Mineralwasser 0,25 l", price: 290, tags: ["vegan"] },
        ],
      },
      {
        name: "Snacks",
        icon: "sandwich",
        items: [
          {
            name: "Pommes mit Mayo",
            price: 490,
            allergens: ["C", "M"],
            tags: ["vegetarian"],
          },
          { name: "Nachos mit Käse", price: 790, allergens: ["G"], tags: ["vegetarian", "spicy"] },
        ],
      },
    ],
  },
  {
    key: "bakery",
    label: "Bäckerei",
    description: "Brot, Gebäck, Belegtes",
    icon: "croissant",
    accent: "#a16207",
    categories: [
      {
        name: "Brot",
        icon: "croissant",
        items: [
          { name: "Sauerteigbrot 1 kg", price: 490, allergens: ["A"], tags: ["vegan"] },
          { name: "Roggenmischbrot 750 g", price: 390, allergens: ["A"], tags: ["vegan"] },
        ],
      },
      {
        name: "Brötchen & Gebäck",
        icon: "croissant",
        items: [
          { name: "Weizenbrötchen", price: 60, allergens: ["A"], tags: ["vegan"] },
          { name: "Butter-Croissant", price: 180, allergens: ["A", "C", "G"], tags: ["vegetarian"] },
          { name: "Laugenbrezel", price: 140, allergens: ["A"], tags: ["vegan"] },
        ],
      },
      {
        name: "Belegte Brötchen",
        icon: "sandwich",
        items: [
          { name: "Käsebrötchen", price: 320, allergens: ["A", "G"], tags: ["vegetarian"] },
          { name: "Schinkenbrötchen", price: 350, allergens: ["A"] },
        ],
      },
      {
        name: "Kuchen",
        icon: "cake-slice",
        items: [
          { name: "Bienenstich", price: 340, allergens: ["A", "C", "G", "H"], tags: ["vegetarian"] },
          { name: "Streuselkuchen", price: 290, allergens: ["A", "C", "G"], tags: ["vegetarian"] },
        ],
      },
    ],
  },
  {
    key: "asian",
    label: "Asiatisch",
    description: "Wok, Curry, Sushi",
    icon: "soup",
    accent: "#0f766e",
    categories: [
      {
        name: "Vorspeisen",
        icon: "salad",
        items: [
          { name: "Sommerrollen", price: 690, allergens: ["F", "N"], tags: ["vegan"] },
          { name: "Miso-Suppe", price: 450, allergens: ["D", "F"], tags: ["vegetarian"] },
        ],
      },
      {
        name: "Wok",
        icon: "soup",
        items: [
          {
            name: "Gebratene Nudeln mit Gemüse",
            price: 1090,
            allergens: ["A", "F", "N"],
            tags: ["vegan"],
          },
          { name: "Rind mit Brokkoli", price: 1390, allergens: ["A", "F", "N"], tags: ["spicy"] },
        ],
      },
      {
        name: "Curry",
        icon: "soup",
        items: [
          {
            name: "Rotes Thai-Curry",
            description: "Kokosmilch, Bambus, Thai-Basilikum",
            price: 1290,
            allergens: ["D", "F"],
            tags: ["vegan", "spicy"],
          },
          { name: "Massaman Curry", price: 1350, allergens: ["E", "F"], tags: ["gluten-free"] },
        ],
      },
      {
        name: "Getränke",
        icon: "cup-soda",
        items: [
          { name: "Jasmintee", price: 320, tags: ["vegan"] },
          { name: "Thai-Eistee", price: 420, allergens: ["G"], tags: ["vegetarian"] },
        ],
      },
    ],
  },
  {
    key: "blank",
    label: "Leer starten",
    description: "Zwei leere Kategorien",
    icon: "utensils",
    accent: "#b4472a",
    categories: [
      { name: "Speisen", icon: "utensils", items: [] },
      { name: "Getränke", icon: "cup-soda", items: [] },
    ],
  },
];

export function findPreset(key: string): CuisinePreset | undefined {
  return CUISINE_PRESETS.find((preset) => preset.key === key);
}
