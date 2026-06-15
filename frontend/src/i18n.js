// ─────────────────────────────────────────────────────────────────────────
//  UI LANGUAGE FILE  —  English / Русский / Қазақша
// ─────────────────────────────────────────────────────────────────────────
//
//  The ru / kk values below are DRAFT translations — please review them,
//  especially the Kazakh (kk), and adjust any wording to your academic
//  preference before the defense.
//
//  HOW TO EDIT (no coding needed):
//    • Each line has the English text, then a Russian (ru) and Kazakh (kk)
//      translation. Change the words inside the quotation marks.
//    • Leave a slot as ""  →  the app shows the English word there instead.
//      So nothing ever breaks if a slot is empty.
//    • IMPORTANT: keep every  "  quotation mark  and every  ,  comma exactly
//      where they are. Only change the words inside the "" .
//
//  Example:   "Places": { ru: "Места", kk: "Орындар" },
//
// ─────────────────────────────────────────────────────────────────────────

export const LANGUAGES = [
  { id: "en", label: "EN" },
  { id: "ru", label: "РУС" },
  { id: "kk", label: "ҚАЗ" },
];

export const UI_STRINGS = {
  // ── Title & top bar ──────────────────────────────────────────────
  "Almaty Tourism Map": { ru: "Карта туризма Алматы", kk: "Алматы туризм картасы" },

  // ── Map layer buttons ────────────────────────────────────────────
  "Places": { ru: "Места", kk: "Орындар" },
  "Events": { ru: "События", kk: "Іс-шаралар" },
  "Innovation Layer": { ru: "Слой инноваций", kk: "Инновация қабаты" },
  "Movement": { ru: "Движение", kk: "Қозғалыс" },

  // ── Lite mode / menu ─────────────────────────────────────────────
  "Lite mode": { ru: "Лёгкий режим", kk: "Жеңіл режим" },
  "ON": { ru: "ВКЛ", kk: "ҚОСУЛЫ" },
  "OFF": { ru: "ВЫКЛ", kk: "ӨШІРУЛІ" },
  "Show menu": { ru: "Показать меню", kk: "Мәзірді көрсету" },
  "Hide menu": { ru: "Скрыть меню", kk: "Мәзірді жасыру" },

  // ── Model toggle ─────────────────────────────────────────────────
  "Current Model": { ru: "Текущая модель", kk: "Ағымдағы модель" },
  "Innovation Model": { ru: "Инновационная модель", kk: "Инновациялық модель" },

  // ── Action buttons ───────────────────────────────────────────────
  "Budget Simulator": { ru: "Симулятор бюджета", kk: "Бюджет симуляторы" },
  "Generate Route": { ru: "Построить маршрут", kk: "Маршрут құру" },
  "Clear route": { ru: "Очистить маршрут", kk: "Маршрутты тазалау" },
  "Presentation Mode": { ru: "Режим презентации", kk: "Презентация режимі" },
  "Exit Presentation": { ru: "Выйти из презентации", kk: "Презентациядан шығу" },
  "Research basis": { ru: "Научная основа", kk: "Зерттеу негізі" },
  "Demo Script": { ru: "Демо-сценарий", kk: "Демо-сценарий" },

  // ── Time of day ──────────────────────────────────────────────────
  "Morning": { ru: "Утро", kk: "Таң" },
  "Afternoon": { ru: "День", kk: "Күндіз" },
  "Evening": { ru: "Вечер", kk: "Кеш" },
  "Night": { ru: "Ночь", kk: "Түн" },

  // ── Presentation header ──────────────────────────────────────────
  "Innovation Map of Almaty Tourism": { ru: "Карта инноваций туризма Алматы", kk: "Алматы туризмінің инновация картасы" },
  "PhD prototype for smart tourism, polycentric development and visitor movement": { ru: "Докторский прототип для умного туризма, полицентрического развития и движения посетителей", kk: "Ақылды туризм, полицентрлік даму және келушілер қозғалысына арналған докторлық прототип" },
  "The model visualizes how district-level tourism innovations can redistribute visitor flows, reduce pressure on the center, and support smart-destination development.": { ru: "Модель показывает, как туристические инновации на уровне районов могут перераспределять потоки посетителей, снижать нагрузку на центр и поддерживать развитие умной дестинации.", kk: "Модель аудан деңгейіндегі туристік инновациялар келушілер ағынын қалай қайта бөліп, орталыққа жүктемені азайтып, ақылды дестинация дамуын қолдайтынын көрсетеді." },

  // ── Loading / error ──────────────────────────────────────────────
  "Loading Almaty district map...": { ru: "Загрузка карты районов Алматы...", kk: "Алматы аудандарының картасы жүктелуде..." },
  "Could not load district boundaries": { ru: "Не удалось загрузить границы районов", kk: "Аудан шекараларын жүктеу мүмкін болмады" },

  // ── Innovation side panel ────────────────────────────────────────
  "Smart Tourism System": { ru: "Система умного туризма", kk: "Ақылды туризм жүйесі" },
  "This layer visualizes proposed innovation projects from the PhD research model. The data is prototype-based and should be validated with ticketing, telecom, transport, camera, transaction, and CRM data.": { ru: "Этот слой показывает предлагаемые инновационные проекты из докторской исследовательской модели. Данные основаны на прототипе и должны быть подтверждены данными билетов, телекома, транспорта, камер, транзакций и CRM.", kk: "Бұл қабат докторлық зерттеу моделінен ұсынылған инновациялық жобаларды көрсетеді. Деректер прототипке негізделген және билет, телеком, көлік, камера, транзакция және CRM деректерімен тексерілуі қажет." },

  // ── Bottom scenario captions ─────────────────────────────────────
  "Current model: tourism is concentrated in the historical center and mountain corridor.": { ru: "Текущая модель: туризм сосредоточен в историческом центре и горном коридоре.", kk: "Ағымдағы модель: туризм тарихи орталық пен тау дәлізінде шоғырланған." },
  "Innovation model: district-level projects redistribute flows and create a polycentric smart tourism system.": { ru: "Инновационная модель: проекты на уровне районов перераспределяют потоки и создают полицентрическую систему умного туризма.", kk: "Инновациялық модель: аудан деңгейіндегі жобалар ағындарды қайта бөліп, полицентрлік ақылды туризм жүйесін құрады." },
  "Choose a district to reveal attractions, events, and visitor movement.": { ru: "Выберите район, чтобы увидеть достопримечательности, события и движение посетителей.", kk: "Көрікті жерлерді, іс-шараларды және келушілер қозғалысын көру үшін ауданды таңдаңыз." },
  "Movement story": { ru: "История движения", kk: "Қозғалыс тарихы" },

  // ── Generated route panel ────────────────────────────────────────
  "Generated Route": { ru: "Построенный маршрут", kk: "Құрылған маршрут" },
  "Stops:": { ru: "Остановки:", kk: "Аялдамалар:" },
  "Duration:": { ru: "Длительность:", kk: "Ұзақтығы:" },
  "Best time:": { ru: "Лучшее время:", kk: "Үздік уақыт:" },
  "Districts:": { ru: "Районы:", kk: "Аудандар:" },
  "Innovation projects:": { ru: "Инновационные проекты:", kk: "Инновациялық жобалар:" },
  "No direct project mapping": { ru: "Нет прямой связи с проектом", kk: "Тікелей жоба байланысы жоқ" },

  // ── Demo / Research / Route / Budget modals ──────────────────────
  "Demo Script (90 seconds)": { ru: "Демо-сценарий (90 секунд)", kk: "Демо-сценарий (90 секунд)" },
  "Close": { ru: "Закрыть", kk: "Жабу" },
  "Build route": { ru: "Построить", kk: "Құру" },
  "Profile-based itinerary prototype": { ru: "Прототип маршрута по профилю", kk: "Профиль негізіндегі маршрут прототипі" },
  "Plan the City Budget": { ru: "Планирование городского бюджета", kk: "Қала бюджетін жоспарлау" },
  "Allocate 100 innovation points across district projects.": { ru: "Распределите 100 инновационных баллов между проектами районов.", kk: "Аудан жобалары арасында 100 инновациялық ұпайды бөліңіз." },
  "Total allocated:": { ru: "Всего распределено:", kk: "Барлығы бөлінді:" },
  "Run Scenario": { ru: "Запустить сценарий", kk: "Сценарийді іске қосу" },
  "Prototype scoring model": { ru: "Прототип модели оценки", kk: "Бағалау моделінің прототипі" },
  "pts": { ru: "балл.", kk: "ұп." },
  "Tourist flow balance": { ru: "Баланс туристических потоков", kk: "Туристік ағын балансы" },
  "Center overload reduction": { ru: "Снижение перегрузки центра", kk: "Орталық жүктемесін азайту" },
  "Average stay growth": { ru: "Рост средней продолжительности пребывания", kk: "Орташа болу ұзақтығының өсуі" },
  "SME revenue potential": { ru: "Потенциал доходов МСБ", kk: "ШОБ кіріс әлеуеті" },
  "Innovation index": { ru: "Индекс инноваций", kk: "Инновация индексі" },
  "Prototype simulation: results are modeled indicators for research demonstration and require validation with ticketing, telecom, transport, transaction, and CRM data.": { ru: "Прототип симуляции: результаты являются смоделированными показателями для исследовательской демонстрации и требуют проверки данными билетов, телекома, транспорта, транзакций и CRM.", kk: "Прототиптік симуляция: нәтижелер зерттеу демонстрациясына арналған модельденген көрсеткіштер және билет, телеком, көлік, транзакция және CRM деректерімен тексеруді қажет етеді." },

  // ── District detail panel ────────────────────────────────────────
  "District": { ru: "Район", kk: "Аудан" },
  "Tourism intensity": { ru: "Интенсивность туризма", kk: "Туризм қарқындылығы" },
  "index": { ru: "индекс", kk: "индекс" },
  "PhD Innovation Layer": { ru: "Докторский слой инноваций", kk: "Докторлық инновация қабаты" },
  "Why it matters:": { ru: "Почему это важно:", kk: "Неліктен маңызды:" },
  "Expected effects": { ru: "Ожидаемые эффекты", kk: "Күтілетін әсерлер" },
  "Target segments": { ru: "Целевые сегменты", kk: "Мақсатты сегменттер" },
  "KPIs": { ru: "KPI", kk: "KPI" },
  "Innovation tools": { ru: "Инструменты инноваций", kk: "Инновация құралдары" },
  "Movement impact": { ru: "Влияние на движение", kk: "Қозғалысқа әсері" },
  "Events this season": { ru: "События сезона", kk: "Маусым іс-шаралары" },
  "Entertainment & culture": { ru: "Развлечения и культура", kk: "Ойын-сауық және мәдениет" },
  "Food & shopping lanes": { ru: "Еда и шопинг", kk: "Тамақ және сауда" },
  "Tourist movement insight": { ru: "Анализ движения туристов", kk: "Туристер қозғалысын талдау" },
  "Innovation opportunity": { ru: "Инновационная возможность", kk: "Инновациялық мүмкіндік" },
  "Back to city view": { ru: "Назад к обзору города", kk: "Қала көрінісіне оралу" },
};

// Returns the translation for `text` in `lang`, falling back to the original
// English whenever a slot is empty or the string isn't in the table.
export function translate(lang, text) {
  if (lang === "en") return text;
  const entry = UI_STRINGS[text];
  if (!entry) return text;
  return entry[lang] || text;
}
