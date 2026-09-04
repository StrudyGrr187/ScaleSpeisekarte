import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { EU_ALLERGENS, DIETARY_TAGS } from "../src/lib/constants";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type SeedItem = {
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  allergens?: string[];
  tags?: string[];
  featured?: boolean;
  available?: boolean;
};

type SeedCategory = {
  name: string;
  description?: string;
  icon: string;
  items: SeedItem[];
};

const MENU: SeedCategory[] = [
  {
    name: "Vorspeisen",
    description: "Zum Ankommen und Teilen",
    icon: "salad",
    items: [
      {
        name: "Bruschetta Classica",
        description: "Geröstetes Sauerteigbrot, Tomaten, Basilikum, Knoblauch, Olivenöl",
        price: 790,
        allergens: ["A"],
        tags: ["vegan"],
      },
      {
        name: "Vitello Tonnato",
        description: "Dünn geschnittenes Kalbfleisch, Thunfisch-Kapern-Creme, Rucola",
        price: 1290,
        allergens: ["C", "D"],
      },
      {
        name: "Burrata Pugliese",
        description: "Burrata aus Apulien, Ochsenherztomaten, Basilikumöl, Fleur de Sel",
        price: 1190,
        allergens: ["G"],
        tags: ["vegetarian", "gluten-free"],
        featured: true,
      },
      {
        name: "Vongole in Weißwein",
        description: "Venusmuscheln, Knoblauch, Petersilie, Weißwein, Ciabatta",
        price: 1390,
        allergens: ["A", "O", "R"],
      },
    ],
  },
  {
    name: "Hauptgerichte",
    description: "Aus der Küche",
    icon: "utensils",
    items: [
      {
        name: "Wiener Schnitzel",
        description: "Kalbsschnitzel, Petersilienkartoffeln, Preiselbeeren, Zitrone",
        price: 1890,
        allergens: ["A", "C", "G"],
        featured: true,
      },
      {
        name: "Saltimbocca alla Romana",
        description: "Kalbsschnitzel mit Salbei und Rohschinken, Marsalajus, Polenta",
        price: 2190,
        allergens: ["G", "O"],
      },
      {
        name: "Branzino al Forno",
        description: "Ganzer Wolfsbarsch aus dem Ofen, Fenchel, Zitrone, Rosmarinkartoffeln",
        price: 2490,
        allergens: ["D"],
        tags: ["gluten-free", "lactose-free"],
      },
      {
        name: "Melanzane alla Parmigiana",
        description: "Auberginen, Tomatensugo, Basilikum, Parmigiano Reggiano",
        price: 1590,
        allergens: ["G"],
        tags: ["vegetarian", "gluten-free"],
      },
      {
        name: "Ossobuco Milanese",
        description: "Geschmorte Kalbshaxe, Gremolata, Safranrisotto",
        price: 2690,
        allergens: ["A", "G", "L", "O"],
        available: false,
      },
    ],
  },
  {
    name: "Pizza",
    description: "24 Stunden Teigführung, Holzofen",
    icon: "pizza",
    items: [
      {
        name: "Margherita",
        description: "San-Marzano-Tomaten, Fior di Latte, Basilikum, Olivenöl",
        price: 1090,
        allergens: ["A", "G"],
        tags: ["vegetarian"],
      },
      {
        name: "Diavola",
        description: "Tomaten, Mozzarella, scharfe Salami, Peperoncino, Oregano",
        price: 1390,
        allergens: ["A", "G"],
        tags: ["spicy"],
      },
      {
        name: "Quattro Formaggi",
        description: "Mozzarella, Gorgonzola, Taleggio, Parmigiano, Honig",
        price: 1490,
        allergens: ["A", "G"],
        tags: ["vegetarian"],
      },
      {
        name: "Tartufo e Funghi",
        description: "Champignons, Trüffelcreme, Fior di Latte, Rucola, Grana",
        price: 1690,
        oldPrice: 1890,
        allergens: ["A", "G"],
        tags: ["vegetarian"],
        featured: true,
      },
      {
        name: "Marinara",
        description: "Tomaten, Knoblauch, Oregano, Olivenöl — ohne Käse",
        price: 890,
        allergens: ["A"],
        tags: ["vegan"],
      },
    ],
  },
  {
    name: "Pasta",
    description: "Hausgemacht, täglich frisch",
    icon: "soup",
    items: [
      {
        name: "Spaghetti Cacio e Pepe",
        description: "Pecorino Romano, schwarzer Pfeffer, Nudelwasser — mehr braucht es nicht",
        price: 1390,
        allergens: ["A", "G"],
        tags: ["vegetarian"],
      },
      {
        name: "Tagliatelle al Ragù",
        description: "Rinderragout, vier Stunden geschmort, Grana Padano",
        price: 1690,
        allergens: ["A", "C", "G", "L"],
        featured: true,
      },
      {
        name: "Linguine alle Vongole",
        description: "Venusmuscheln, Knoblauch, Petersilie, Weißwein, Peperoncino",
        price: 1890,
        allergens: ["A", "C", "O", "R"],
        tags: ["spicy"],
      },
      {
        name: "Ravioli di Ricotta e Spinaci",
        description: "Ricotta, Spinat, braune Salbeibutter, Pinienkerne",
        price: 1590,
        allergens: ["A", "C", "G", "H"],
        tags: ["vegetarian"],
      },
    ],
  },
  {
    name: "Getränke",
    description: "Bar & Keller",
    icon: "wine",
    items: [
      {
        name: "Espresso",
        description: "Hausmischung, dunkel geröstet",
        price: 250,
        tags: ["vegan", "gluten-free"],
      },
      {
        name: "Cappuccino",
        description: "Mit Hafermilch ohne Aufpreis",
        price: 390,
        allergens: ["G"],
        tags: ["vegetarian"],
      },
      {
        name: "Aperol Spritz",
        description: "Aperol, Prosecco, Soda, Orange",
        price: 890,
        allergens: ["O"],
        tags: ["vegan"],
      },
      {
        name: "Negroni",
        description: "Gin, Campari, roter Wermut, Orangenzeste",
        price: 1090,
        allergens: ["O"],
        tags: ["vegan"],
      },
      {
        name: "Chianti Classico DOCG",
        description: "Toskana, 0,2 l — Sangiovese, Kirsche, Leder",
        price: 720,
        allergens: ["O"],
        tags: ["vegan"],
      },
      {
        name: "Acqua Panna / San Pellegrino",
        description: "0,75 l, still oder mit Kohlensäure",
        price: 590,
        tags: ["vegan", "gluten-free", "lactose-free"],
      },
    ],
  },
  {
    name: "Desserts",
    description: "Dolci della casa",
    icon: "cake-slice",
    items: [
      {
        name: "Tiramisù",
        description: "Mascarpone, Savoiardi, Espresso, Amaretto, Kakao",
        price: 790,
        allergens: ["A", "C", "G"],
        tags: ["vegetarian"],
        featured: true,
      },
      {
        name: "Panna Cotta",
        description: "Sahne, Vanille, Waldbeerenspiegel",
        price: 690,
        allergens: ["G"],
        tags: ["vegetarian", "gluten-free"],
      },
      {
        name: "Cannoli Siciliani",
        description: "Zwei Stück, Ricotta-Pistazien-Füllung, kandierte Orange",
        price: 750,
        allergens: ["A", "C", "G", "H"],
        tags: ["vegetarian"],
      },
      {
        name: "Sorbetto al Limone",
        description: "Zitronensorbet aus Amalfi-Zitronen, Prosecco",
        price: 650,
        tags: ["vegan", "gluten-free", "lactose-free"],
      },
    ],
  },
];

const OPENING_HOURS = [
  { dayOfWeek: 0, closed: true, opensAt: null, closesAt: null },
  { dayOfWeek: 1, closed: false, opensAt: "11:30", closesAt: "23:00" },
  { dayOfWeek: 2, closed: false, opensAt: "11:30", closesAt: "23:00" },
  { dayOfWeek: 3, closed: false, opensAt: "11:30", closesAt: "23:00" },
  { dayOfWeek: 4, closed: false, opensAt: "11:30", closesAt: "00:00" },
  { dayOfWeek: 5, closed: false, opensAt: "10:00", closesAt: "00:00" },
  { dayOfWeek: 6, closed: false, opensAt: "10:00", closesAt: "22:00" },
];

async function seedReferenceData() {
  for (const [index, allergen] of EU_ALLERGENS.entries()) {
    await prisma.allergen.upsert({
      where: { code: allergen.code },
      update: { name: allergen.name, sortOrder: index },
      create: { code: allergen.code, name: allergen.name, sortOrder: index },
    });
  }

  for (const [index, tag] of DIETARY_TAGS.entries()) {
    await prisma.dietaryTag.upsert({
      where: { key: tag.key },
      update: { name: tag.name, icon: tag.icon, color: tag.color, sortOrder: index },
      create: {
        key: tag.key,
        name: tag.name,
        icon: tag.icon,
        color: tag.color,
        sortOrder: index,
      },
    });
  }

  console.log(`  reference data: ${EU_ALLERGENS.length} allergens, ${DIETARY_TAGS.length} tags`);
}

async function seedDemoRestaurant() {
  const slug = "cafe-milano";
  const email = "demo@cafe-milano.de";

  // Idempotent: wipe and rebuild the demo tenant so `db:seed` can be re-run.
  const existing = await prisma.restaurant.findUnique({ where: { slug } });
  if (existing) {
    await prisma.restaurant.delete({ where: { id: existing.id } });
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Café Milano",
      slug,
      description:
        "Italienische Küche im Herzen der Stadt. Hausgemachte Pasta, Holzofenpizza und eine Bar, die bis Mitternacht offen hat.",
      address: "Hauptstraße 24, 10827 Berlin",
      phone: "+49 30 1234567",
      website: "https://cafe-milano.example",
      primaryColor: "#B4472A",
      secondaryColor: "#1C1917",
      currency: "EUR",
      onboardedAt: new Date(),
      openingHours: { create: OPENING_HOURS },
      users: {
        create: {
          email,
          name: "Marco Rossi",
          passwordHash: await bcrypt.hash("demo1234", 12),
          role: "OWNER",
        },
      },
      menus: {
        create: {
          name: "Speisekarte",
          isDefault: true,
          published: true,
          publishedAt: new Date(),
        },
      },
    },
    include: { menus: true },
  });

  const menu = restaurant.menus[0];
  const allergens = await prisma.allergen.findMany();
  const tags = await prisma.dietaryTag.findMany();
  const allergenByCode = new Map(allergens.map((a) => [a.code, a.id]));
  const tagByKey = new Map(tags.map((t) => [t.key, t.id]));

  let itemCount = 0;

  for (const [categoryIndex, category] of MENU.entries()) {
    const createdCategory = await prisma.category.create({
      data: {
        menuId: menu.id,
        name: category.name,
        description: category.description ?? null,
        icon: category.icon,
        sortOrder: categoryIndex,
        active: true,
      },
    });

    for (const [itemIndex, item] of category.items.entries()) {
      await prisma.menuItem.create({
        data: {
          categoryId: createdCategory.id,
          name: item.name,
          description: item.description ?? null,
          price: item.price,
          oldPrice: item.oldPrice ?? null,
          sortOrder: itemIndex,
          visible: true,
          available: item.available ?? true,
          featured: item.featured ?? false,
          allergens: {
            create: (item.allergens ?? [])
              .map((code) => allergenByCode.get(code))
              .filter((id): id is string => Boolean(id))
              .map((allergenId) => ({ allergenId })),
          },
          dietaryTags: {
            create: (item.tags ?? [])
              .map((key) => tagByKey.get(key))
              .filter((id): id is string => Boolean(id))
              .map((dietaryTagId) => ({ dietaryTagId })),
          },
        },
      });
      itemCount++;
    }
  }

  console.log(`  demo tenant: ${MENU.length} categories, ${itemCount} items`);
  return { email };
}

async function main() {
  console.log("Seeding ScaleSpeisekarte…");
  await seedReferenceData();
  const { email } = await seedDemoRestaurant();
  console.log("\nDone. Demo login:");
  console.log(`  E-Mail:   ${email}`);
  console.log("  Passwort: demo1234");
  console.log("  Karte:    http://localhost:3100/menu/cafe-milano\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
