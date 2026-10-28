import { DIETARY_TAGS, EU_ALLERGENS } from "@/lib/constants";
import { SOURCE_LANGUAGE, type LanguageCode } from "@/lib/languages";

/**
 * The fixed wording of the guest menu — everything the owner does not type.
 * Hand-written per language rather than machine-translated, because these
 * strings carry the allergen legend and the "ask our staff" note, which must
 * read correctly whatever the dishes say.
 */

type AllergenCode = (typeof EU_ALLERGENS)[number]["code"];
type DietaryKey = (typeof DIETARY_TAGS)[number]["key"];

/** Chrome strings, sent to the guest page for the one language it renders. */
export type GuestStrings = {
  menu: string;
  categories: string;
  emptyTitle: string;
  emptyText: string;
  featured: string;
  featuredLong: string;
  soldOut: string;
  previously: string;
  allergens: string;
  allergensAndAdditives: string;
  openLegend: string;
  legendIntro: string;
  legendNote: string;
  openingHours: string;
  closed: string;
  weekdaysShort: readonly [string, string, string, string, string, string, string];
  review: string;
  /** `{currency}` is replaced with the restaurant's currency code. */
  pricesNote: string;
  language: string;
  close: string;
  machineTranslated: string;
};

type GuestDictionary = GuestStrings & {
  allergenNames: Record<AllergenCode, string>;
  dietaryNames: Record<DietaryKey, string>;
};

const DICTIONARY: Record<LanguageCode, GuestDictionary> = {
  de: {
    menu: "Speisekarte",
    categories: "Kategorien",
    emptyTitle: "Karte in Arbeit",
    emptyText: "Diese Speisekarte wird gerade zusammengestellt und ist gleich für Sie da.",
    featured: "Empfehlung",
    featuredLong: "Empfehlung des Hauses",
    soldOut: "Heute nicht verfügbar",
    previously: "Vorher",
    allergens: "Allergene",
    allergensAndAdditives: "Allergene & Zusatzstoffe",
    openLegend: "Legende öffnen",
    legendIntro:
      "Die Buchstaben hinter einem Gericht verweisen auf enthaltene Allergene nach EU-Lebensmittelinformationsverordnung.",
    legendNote: "Bei Fragen zu Zutaten und Unverträglichkeiten sprechen Sie bitte unser Personal an.",
    openingHours: "Öffnungszeiten",
    closed: "Geschlossen",
    weekdaysShort: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
    review: "Uns auf Google bewerten",
    pricesNote: "Alle Preise in {currency}, inkl. MwSt.",
    language: "Sprache",
    close: "Schließen",
    machineTranslated:
      "Automatisch aus dem Deutschen übersetzt. Bei Allergien und Unverträglichkeiten fragen Sie bitte unser Personal.",
    allergenNames: {
      A: "Glutenhaltiges Getreide",
      B: "Krebstiere",
      C: "Eier",
      D: "Fisch",
      E: "Erdnüsse",
      F: "Soja",
      G: "Milch/Laktose",
      H: "Schalenfrüchte",
      L: "Sellerie",
      M: "Senf",
      N: "Sesam",
      O: "Sulfite",
      P: "Lupinen",
      R: "Weichtiere",
    },
    dietaryNames: {
      vegan: "Vegan",
      vegetarian: "Vegetarisch",
      "gluten-free": "Glutenfrei",
      "lactose-free": "Laktosefrei",
      spicy: "Scharf",
    },
  },

  en: {
    menu: "Menu",
    categories: "Categories",
    emptyTitle: "Menu coming soon",
    emptyText: "This menu is being put together and will be ready for you shortly.",
    featured: "Recommended",
    featuredLong: "House recommendation",
    soldOut: "Not available today",
    previously: "Was",
    allergens: "Allergens",
    allergensAndAdditives: "Allergens & additives",
    openLegend: "Open legend",
    legendIntro:
      "The letters after a dish refer to the allergens it contains, as defined by EU food information regulations.",
    legendNote: "If you have questions about ingredients or intolerances, please ask our staff.",
    openingHours: "Opening hours",
    closed: "Closed",
    weekdaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    review: "Review us on Google",
    pricesNote: "All prices in {currency}, including VAT.",
    language: "Language",
    close: "Close",
    machineTranslated:
      "Automatically translated from German. If you have allergies or intolerances, please ask our staff.",
    allergenNames: {
      A: "Cereals containing gluten",
      B: "Crustaceans",
      C: "Eggs",
      D: "Fish",
      E: "Peanuts",
      F: "Soy",
      G: "Milk/lactose",
      H: "Tree nuts",
      L: "Celery",
      M: "Mustard",
      N: "Sesame",
      O: "Sulphites",
      P: "Lupin",
      R: "Molluscs",
    },
    dietaryNames: {
      vegan: "Vegan",
      vegetarian: "Vegetarian",
      "gluten-free": "Gluten-free",
      "lactose-free": "Lactose-free",
      spicy: "Spicy",
    },
  },

  fr: {
    menu: "Carte",
    categories: "Catégories",
    emptyTitle: "Carte en préparation",
    emptyText: "Cette carte est en cours de préparation et sera bientôt disponible.",
    featured: "Suggestion",
    featuredLong: "Suggestion de la maison",
    soldOut: "Indisponible aujourd’hui",
    previously: "Avant",
    allergens: "Allergènes",
    allergensAndAdditives: "Allergènes et additifs",
    openLegend: "Ouvrir la légende",
    legendIntro:
      "Les lettres après un plat indiquent les allergènes qu’il contient, selon le règlement européen sur l’information des consommateurs.",
    legendNote:
      "Pour toute question sur les ingrédients ou les intolérances, adressez-vous à notre personnel.",
    openingHours: "Horaires d’ouverture",
    closed: "Fermé",
    weekdaysShort: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."],
    review: "Laissez-nous un avis sur Google",
    pricesNote: "Tous les prix en {currency}, TVA incluse.",
    language: "Langue",
    close: "Fermer",
    machineTranslated:
      "Traduit automatiquement de l’allemand. En cas d’allergie ou d’intolérance, adressez-vous à notre personnel.",
    allergenNames: {
      A: "Céréales contenant du gluten",
      B: "Crustacés",
      C: "Œufs",
      D: "Poisson",
      E: "Arachides",
      F: "Soja",
      G: "Lait/lactose",
      H: "Fruits à coque",
      L: "Céleri",
      M: "Moutarde",
      N: "Sésame",
      O: "Sulfites",
      P: "Lupin",
      R: "Mollusques",
    },
    dietaryNames: {
      vegan: "Végan",
      vegetarian: "Végétarien",
      "gluten-free": "Sans gluten",
      "lactose-free": "Sans lactose",
      spicy: "Épicé",
    },
  },

  it: {
    menu: "Menù",
    categories: "Categorie",
    emptyTitle: "Menù in preparazione",
    emptyText: "Questo menù è in fase di preparazione e sarà presto disponibile.",
    featured: "Consigliato",
    featuredLong: "Consigliato dalla casa",
    soldOut: "Non disponibile oggi",
    previously: "Prima",
    allergens: "Allergeni",
    allergensAndAdditives: "Allergeni e additivi",
    openLegend: "Apri legenda",
    legendIntro:
      "Le lettere dopo un piatto indicano gli allergeni contenuti, secondo il regolamento UE sulle informazioni alimentari.",
    legendNote: "Per domande su ingredienti e intolleranze, rivolgetevi al nostro personale.",
    openingHours: "Orari di apertura",
    closed: "Chiuso",
    weekdaysShort: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
    review: "Lasciaci una recensione su Google",
    pricesNote: "Tutti i prezzi in {currency}, IVA inclusa.",
    language: "Lingua",
    close: "Chiudi",
    machineTranslated:
      "Tradotto automaticamente dal tedesco. In caso di allergie o intolleranze, rivolgetevi al nostro personale.",
    allergenNames: {
      A: "Cereali contenenti glutine",
      B: "Crostacei",
      C: "Uova",
      D: "Pesce",
      E: "Arachidi",
      F: "Soia",
      G: "Latte/lattosio",
      H: "Frutta a guscio",
      L: "Sedano",
      M: "Senape",
      N: "Sesamo",
      O: "Solfiti",
      P: "Lupini",
      R: "Molluschi",
    },
    dietaryNames: {
      vegan: "Vegano",
      vegetarian: "Vegetariano",
      "gluten-free": "Senza glutine",
      "lactose-free": "Senza lattosio",
      spicy: "Piccante",
    },
  },

  es: {
    menu: "Carta",
    categories: "Categorías",
    emptyTitle: "Carta en preparación",
    emptyText: "Estamos preparando esta carta; estará disponible en breve.",
    featured: "Recomendado",
    featuredLong: "Recomendación de la casa",
    soldOut: "No disponible hoy",
    previously: "Antes",
    allergens: "Alérgenos",
    allergensAndAdditives: "Alérgenos y aditivos",
    openLegend: "Abrir leyenda",
    legendIntro:
      "Las letras tras un plato indican los alérgenos que contiene, según el reglamento europeo de información alimentaria.",
    legendNote: "Si tiene preguntas sobre ingredientes o intolerancias, consulte a nuestro personal.",
    openingHours: "Horario",
    closed: "Cerrado",
    weekdaysShort: ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"],
    review: "Valóranos en Google",
    pricesNote: "Todos los precios en {currency}, IVA incluido.",
    language: "Idioma",
    close: "Cerrar",
    machineTranslated:
      "Traducido automáticamente del alemán. Si tiene alergias o intolerancias, consulte a nuestro personal.",
    allergenNames: {
      A: "Cereales con gluten",
      B: "Crustáceos",
      C: "Huevos",
      D: "Pescado",
      E: "Cacahuetes",
      F: "Soja",
      G: "Leche/lactosa",
      H: "Frutos de cáscara",
      L: "Apio",
      M: "Mostaza",
      N: "Sésamo",
      O: "Sulfitos",
      P: "Altramuces",
      R: "Moluscos",
    },
    dietaryNames: {
      vegan: "Vegano",
      vegetarian: "Vegetariano",
      "gluten-free": "Sin gluten",
      "lactose-free": "Sin lactosa",
      spicy: "Picante",
    },
  },

  nl: {
    menu: "Menukaart",
    categories: "Categorieën",
    emptyTitle: "Menukaart in voorbereiding",
    emptyText: "Deze menukaart wordt op dit moment samengesteld en is zo voor u klaar.",
    featured: "Aanrader",
    featuredLong: "Aanrader van het huis",
    soldOut: "Vandaag niet beschikbaar",
    previously: "Was",
    allergens: "Allergenen",
    allergensAndAdditives: "Allergenen & additieven",
    openLegend: "Legenda openen",
    legendIntro:
      "De letters achter een gerecht verwijzen naar de allergenen die het bevat, volgens de EU-verordening over voedselinformatie.",
    legendNote: "Heeft u vragen over ingrediënten of intoleranties? Vraag het ons personeel.",
    openingHours: "Openingstijden",
    closed: "Gesloten",
    weekdaysShort: ["ma", "di", "wo", "do", "vr", "za", "zo"],
    review: "Beoordeel ons op Google",
    pricesNote: "Alle prijzen in {currency}, incl. btw.",
    language: "Taal",
    close: "Sluiten",
    machineTranslated:
      "Automatisch vertaald uit het Duits. Heeft u allergieën of intoleranties? Vraag het ons personeel.",
    allergenNames: {
      A: "Glutenbevattende granen",
      B: "Schaaldieren",
      C: "Eieren",
      D: "Vis",
      E: "Pinda’s",
      F: "Soja",
      G: "Melk/lactose",
      H: "Noten",
      L: "Selderij",
      M: "Mosterd",
      N: "Sesam",
      O: "Sulfieten",
      P: "Lupine",
      R: "Weekdieren",
    },
    dietaryNames: {
      vegan: "Veganistisch",
      vegetarian: "Vegetarisch",
      "gluten-free": "Glutenvrij",
      "lactose-free": "Lactosevrij",
      spicy: "Pittig",
    },
  },

  pl: {
    menu: "Menu",
    categories: "Kategorie",
    emptyTitle: "Menu w przygotowaniu",
    emptyText: "To menu jest właśnie przygotowywane i wkrótce będzie dostępne.",
    featured: "Polecamy",
    featuredLong: "Nasza rekomendacja",
    soldOut: "Dziś niedostępne",
    previously: "Wcześniej",
    allergens: "Alergeny",
    allergensAndAdditives: "Alergeny i dodatki",
    openLegend: "Otwórz legendę",
    legendIntro:
      "Litery przy daniu oznaczają zawarte w nim alergeny zgodnie z unijnym rozporządzeniem w sprawie informowania o żywności.",
    legendNote: "W razie pytań o składniki lub nietolerancje prosimy o kontakt z obsługą.",
    openingHours: "Godziny otwarcia",
    closed: "Zamknięte",
    weekdaysShort: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
    review: "Oceń nas w Google",
    pricesNote: "Wszystkie ceny w {currency}, z VAT.",
    language: "Język",
    close: "Zamknij",
    machineTranslated:
      "Przetłumaczono automatycznie z języka niemieckiego. W przypadku alergii lub nietolerancji prosimy o kontakt z obsługą.",
    allergenNames: {
      A: "Zboża zawierające gluten",
      B: "Skorupiaki",
      C: "Jaja",
      D: "Ryby",
      E: "Orzeszki ziemne",
      F: "Soja",
      G: "Mleko/laktoza",
      H: "Orzechy",
      L: "Seler",
      M: "Gorczyca",
      N: "Sezam",
      O: "Siarczyny",
      P: "Łubin",
      R: "Mięczaki",
    },
    dietaryNames: {
      vegan: "Wegańskie",
      vegetarian: "Wegetariańskie",
      "gluten-free": "Bezglutenowe",
      "lactose-free": "Bez laktozy",
      spicy: "Ostre",
    },
  },

  tr: {
    menu: "Menü",
    categories: "Kategoriler",
    emptyTitle: "Menü hazırlanıyor",
    emptyText: "Bu menü şu anda hazırlanıyor ve birazdan hizmetinizde olacak.",
    featured: "Öneri",
    featuredLong: "Önerimiz",
    soldOut: "Bugün mevcut değil",
    previously: "Eski fiyat",
    allergens: "Alerjenler",
    allergensAndAdditives: "Alerjenler ve katkı maddeleri",
    openLegend: "Açıklamayı aç",
    legendIntro:
      "Yemeklerin yanındaki harfler, AB gıda bilgilendirme yönetmeliğine göre içerdikleri alerjenleri gösterir.",
    legendNote: "İçerikler ve intoleranslar hakkında sorularınız için lütfen personelimize danışın.",
    openingHours: "Çalışma saatleri",
    closed: "Kapalı",
    weekdaysShort: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    review: "Bizi Google’da değerlendirin",
    pricesNote: "Tüm fiyatlar {currency} cinsindendir, KDV dahildir.",
    language: "Dil",
    close: "Kapat",
    machineTranslated:
      "Almancadan otomatik olarak çevrilmiştir. Alerji veya intoleransınız varsa lütfen personelimize danışın.",
    allergenNames: {
      A: "Gluten içeren tahıllar",
      B: "Kabuklu deniz ürünleri",
      C: "Yumurta",
      D: "Balık",
      E: "Yer fıstığı",
      F: "Soya",
      G: "Süt/laktoz",
      H: "Sert kabuklu yemişler",
      L: "Kereviz",
      M: "Hardal",
      N: "Susam",
      O: "Sülfitler",
      P: "Acı bakla (lupin)",
      R: "Yumuşakçalar",
    },
    dietaryNames: {
      vegan: "Vegan",
      vegetarian: "Vejetaryen",
      "gluten-free": "Glutensiz",
      "lactose-free": "Laktozsuz",
      spicy: "Acılı",
    },
  },

  ru: {
    menu: "Меню",
    categories: "Категории",
    emptyTitle: "Меню готовится",
    emptyText: "Это меню сейчас составляется и скоро будет доступно.",
    featured: "Рекомендуем",
    featuredLong: "Рекомендация заведения",
    soldOut: "Сегодня нет в наличии",
    previously: "Было",
    allergens: "Аллергены",
    allergensAndAdditives: "Аллергены и добавки",
    openLegend: "Открыть пояснения",
    legendIntro:
      "Буквы после блюда обозначают содержащиеся в нём аллергены согласно регламенту ЕС об информировании о пищевых продуктах.",
    legendNote:
      "Если у вас есть вопросы об ингредиентах или непереносимости, пожалуйста, обратитесь к нашему персоналу.",
    openingHours: "Часы работы",
    closed: "Закрыто",
    weekdaysShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    review: "Оцените нас в Google",
    pricesNote: "Все цены в {currency}, включая НДС.",
    language: "Язык",
    close: "Закрыть",
    machineTranslated:
      "Автоматически переведено с немецкого. При аллергии или непереносимости, пожалуйста, обратитесь к нашему персоналу.",
    allergenNames: {
      A: "Злаки, содержащие глютен",
      B: "Ракообразные",
      C: "Яйца",
      D: "Рыба",
      E: "Арахис",
      F: "Соя",
      G: "Молоко/лактоза",
      H: "Орехи",
      L: "Сельдерей",
      M: "Горчица",
      N: "Кунжут",
      O: "Сульфиты",
      P: "Люпин",
      R: "Моллюски",
    },
    dietaryNames: {
      vegan: "Веганское",
      vegetarian: "Вегетарианское",
      "gluten-free": "Без глютена",
      "lactose-free": "Без лактозы",
      spicy: "Острое",
    },
  },

  uk: {
    menu: "Меню",
    categories: "Категорії",
    emptyTitle: "Меню готується",
    emptyText: "Це меню зараз складається і незабаром буде доступне.",
    featured: "Радимо",
    featuredLong: "Рекомендація закладу",
    soldOut: "Сьогодні немає",
    previously: "Було",
    allergens: "Алергени",
    allergensAndAdditives: "Алергени та добавки",
    openLegend: "Відкрити пояснення",
    legendIntro:
      "Літери після страви позначають алергени, які вона містить, відповідно до регламенту ЄС про інформування щодо харчових продуктів.",
    legendNote:
      "Якщо у вас є запитання щодо інгредієнтів чи непереносимості, будь ласка, зверніться до нашого персоналу.",
    openingHours: "Години роботи",
    closed: "Зачинено",
    weekdaysShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    review: "Оцініть нас у Google",
    pricesNote: "Усі ціни в {currency}, включно з ПДВ.",
    language: "Мова",
    close: "Закрити",
    machineTranslated:
      "Автоматично перекладено з німецької. У разі алергії чи непереносимості, будь ласка, зверніться до нашого персоналу.",
    allergenNames: {
      A: "Злаки, що містять глютен",
      B: "Ракоподібні",
      C: "Яйця",
      D: "Риба",
      E: "Арахіс",
      F: "Соя",
      G: "Молоко/лактоза",
      H: "Горіхи",
      L: "Селера",
      M: "Гірчиця",
      N: "Кунжут",
      O: "Сульфіти",
      P: "Люпин",
      R: "Молюски",
    },
    dietaryNames: {
      vegan: "Веганське",
      vegetarian: "Вегетаріанське",
      "gluten-free": "Без глютену",
      "lactose-free": "Без лактози",
      spicy: "Гостре",
    },
  },

  zh: {
    menu: "菜单",
    categories: "分类",
    emptyTitle: "菜单准备中",
    emptyText: "本菜单正在整理中，很快即可查看。",
    featured: "推荐",
    featuredLong: "本店推荐",
    soldOut: "今日售罄",
    previously: "原价",
    allergens: "过敏原",
    allergensAndAdditives: "过敏原与添加剂",
    openLegend: "打开说明",
    legendIntro: "菜品后的字母表示其所含的过敏原，依据欧盟食品信息法规标注。",
    legendNote: "如对配料或食物不耐受有任何疑问，请咨询我们的服务人员。",
    openingHours: "营业时间",
    closed: "休息",
    weekdaysShort: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    review: "在 Google 上评价我们",
    pricesNote: "所有价格以 {currency} 计，含增值税。",
    language: "语言",
    close: "关闭",
    machineTranslated: "由德语自动翻译。如有过敏或食物不耐受，请咨询我们的服务人员。",
    allergenNames: {
      A: "含麸质谷物",
      B: "甲壳类",
      C: "蛋类",
      D: "鱼类",
      E: "花生",
      F: "大豆",
      G: "乳制品/乳糖",
      H: "坚果",
      L: "芹菜",
      M: "芥末",
      N: "芝麻",
      O: "亚硫酸盐",
      P: "羽扇豆",
      R: "软体动物",
    },
    dietaryNames: {
      vegan: "纯素",
      vegetarian: "素食",
      "gluten-free": "无麸质",
      "lactose-free": "无乳糖",
      spicy: "辣",
    },
  },

  ja: {
    menu: "メニュー",
    categories: "カテゴリー",
    emptyTitle: "メニュー準備中",
    emptyText: "このメニューは現在準備中です。まもなくご覧いただけます。",
    featured: "おすすめ",
    featuredLong: "当店のおすすめ",
    soldOut: "本日品切れ",
    previously: "通常価格",
    allergens: "アレルゲン",
    allergensAndAdditives: "アレルゲン・添加物",
    openLegend: "凡例を開く",
    legendIntro:
      "料理名の後のアルファベットは、EUの食品情報規則に基づき含まれるアレルゲンを示しています。",
    legendNote: "原材料や食物不耐症についてのご質問は、スタッフまでお尋ねください。",
    openingHours: "営業時間",
    closed: "定休日",
    weekdaysShort: ["月", "火", "水", "木", "金", "土", "日"],
    review: "Googleでレビューする",
    pricesNote: "価格はすべて{currency}、税込です。",
    language: "言語",
    close: "閉じる",
    machineTranslated:
      "ドイツ語から自動翻訳されています。アレルギーや食物不耐症のある方はスタッフまでお尋ねください。",
    allergenNames: {
      A: "グルテンを含む穀物",
      B: "甲殻類",
      C: "卵",
      D: "魚",
      E: "落花生",
      F: "大豆",
      G: "乳/乳糖",
      H: "ナッツ類",
      L: "セロリ",
      M: "マスタード",
      N: "ごま",
      O: "亜硫酸塩",
      P: "ルピナス",
      R: "軟体動物",
    },
    dietaryNames: {
      vegan: "ヴィーガン",
      vegetarian: "ベジタリアン",
      "gluten-free": "グルテンフリー",
      "lactose-free": "ラクトースフリー",
      spicy: "辛い",
    },
  },
};

function dictionary(code: LanguageCode): GuestDictionary {
  return DICTIONARY[code] ?? DICTIONARY[SOURCE_LANGUAGE];
}

export function guestStrings(code: LanguageCode): GuestStrings {
  const { allergenNames: _a, dietaryNames: _d, ...strings } = dictionary(code);
  return strings;
}

/** Falls back to the stored (German) name for a code the dictionary does not know. */
export function allergenName(code: string, lang: LanguageCode, fallback: string): string {
  return dictionary(lang).allergenNames[code as AllergenCode] ?? fallback;
}

export function dietaryName(key: string, lang: LanguageCode, fallback: string): string {
  return dictionary(lang).dietaryNames[key as DietaryKey] ?? fallback;
}
