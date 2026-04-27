import type { Contact, Holiday, GreetingTone, Language } from '@/types'
import { HOLIDAY_SPECIFIC_BODIES } from '@/data/greetingTemplates'

interface GreetingContext {
  contact: Contact
  holiday?: Holiday
  tone: GreetingTone
  language: Language
  customName?: string
}

type TemplateMap = Partial<Record<Language, string[]>>

const SALUTATIONS: Record<GreetingTone, TemplateMap> = {
  friendly: {
    english: ['{name}! 👋', 'Hey {name}! 😊', 'Hi {name}!', 'Dear {name},', 'Hello there, {name}! 🌟'],
    hebrew: [
      'שלום {name}! 😊',
      'היי {name}! 👋',
      '{name} היקר/ה,',
      'מה שלומך {name}?',
      'הי {name}! 😄',
      'אהלן {name}! 👋',
    ],
    arabic: [
      '{name}، مرحباً! 😊',
      'أهلاً {name}،',
      'مرحباً {name}،',
      'أهلاً وسهلاً {name}! 👋',
      'هلا {name}! 😊',
    ],
  },
  business: {
    english: ['Dear {name},', 'Hello {name},', 'Hi {name},', 'Good day, {name},'],
    hebrew: [
      '{name} הנכבד/ת,',
      'שלום {name},',
      'לכבוד {name},',
      'שלום וברכה, {name},',
    ],
    arabic: [
      'عزيزي/تي {name}،',
      'السيد/ة {name}،',
      'حضرة {name}،',
      'مرحباً {name}،',
    ],
  },
  formal: {
    english: ['Dear Mr./Ms. {name},', 'To {name},', 'Dear {name},', 'Most respected {name},'],
    hebrew: [
      'לכבוד {name},',
      'אל {name},',
      'הנכבד/ת {name},',
      'לכבוד הנכבד/ת {name},',
    ],
    arabic: [
      'حضرة {name}،',
      'إلى {name}،',
      'المحترم/ة {name}،',
      'السيد/ة الموقر/ة {name}،',
    ],
  },
  internal: {
    english: ['Hi {name}! 👋', 'Hey {name}!', '{name} —', 'Hey {name}, 🙌'],
    hebrew: [
      'הי {name}! 👋',
      'שלום {name}!',
      '{name},',
      'מה קורה {name}!',
      'יאלה {name}, 😄',
    ],
    arabic: [
      'مرحباً {name}! 👋',
      'هلا {name}!',
      '{name} —',
      'يا {name}! 🙌',
    ],
  },
  vip: {
    english: [
      'Dear {name},',
      'Esteemed {name},',
      'My dear {name},',
      'Dear and valued {name},',
    ],
    hebrew: [
      '{name} הנכבד/ת מאוד,',
      '{name} היקר/ה ביותר,',
      '{name} הנערך/ת,',
      'לכבוד {name} היקר/ה,',
    ],
    arabic: [
      'سعادة {name}،',
      'حضرة {name} الموقر/ة،',
      'الأستاذ/ة {name} المحترم/ة،',
      'عزيزي/تي {name} الكريم/ة،',
    ],
  },
}

const CLOSINGS: Record<GreetingTone, TemplateMap> = {
  friendly: {
    english: ['With warm regards, 💙', 'Warmly, 😊', 'With love and care,', 'Cheers! 🌟', 'Sending you good vibes! ✨'],
    hebrew: [
      'בחיבה ובחום, ❤️',
      'בברכה חמה, 😊',
      'שלך/שלכם,',
      'עם חיבה רבה, 🌟',
      'חיבוק מרחוק, 🤗',
      'תמיד אצלך בלב, 💙',
    ],
    arabic: [
      'مع تحياتي الحارة، 💙',
      'بحب وتقدير،',
      'مع المودة،',
      'مع أحر التحيات، 🌟',
      'بكل المحبة، ❤️',
    ],
  },
  business: {
    english: ['Best regards,', 'Kind regards,', 'With best wishes,', 'Sincerely,', 'With appreciation,'],
    hebrew: [
      'בברכה,',
      'בכבוד רב,',
      'בהוקרה,',
      'בברכה ובהערכה,',
      'בידידות,',
    ],
    arabic: [
      'مع التحية،',
      'مع أطيب التمنيات،',
      'بالاحترام،',
      'مع خالص التقدير،',
      'وافر الاحترام،',
    ],
  },
  formal: {
    english: ['Respectfully yours,', 'With respect,', 'Yours faithfully,', 'With highest regards,'],
    hebrew: [
      'בכבוד רב,',
      'בכבוד ובהערכה,',
      'בברכה ובכבוד,',
      'בהוקרה ובכבוד,',
    ],
    arabic: [
      'مع الاحترام والتقدير،',
      'مع خالص الاحترام،',
      'مع وافر الاحترام والتقدير،',
      'وتفضلوا بقبول فائق الاحترام،',
    ],
  },
  internal: {
    english: ['Cheers! 🙌', 'Best,', 'See you soon! 👋', 'Talk soon! 😊'],
    hebrew: [
      'יאלה, בהצלחה! 🙌',
      'ברכות,',
      'נתראה! 👋',
      'שיהיה טוב! 😊',
      'קדימה! 💪',
    ],
    arabic: [
      'تحياتي! 🙌',
      'مع السلامة،',
      'نراك قريباً! 👋',
      'موفق! 😊',
    ],
  },
  vip: {
    english: [
      'With deepest regard, 🌹',
      'With the highest esteem,',
      'With great appreciation and respect,',
      'Yours with sincere admiration and gratitude, 🌹',
    ],
    hebrew: [
      'בהערכה עמוקה, 🌹',
      'בכבוד ובהוקרה רבה,',
      'בהערכה ובכבוד עצום,',
      'בחיבה ובהוקרה אין קץ, 🌹',
    ],
    arabic: [
      'مع خالص الاحترام والتقدير، 🌹',
      'مع عظيم التقدير والوفاء،',
      'مع أرق المشاعر وخالص الاحترام، 🌹',
      'مع تقديري العميق ووافر احترامي،',
    ],
  },
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function resolveLanguage(lang: Language): Language {
  return lang === 'russian' || lang === 'french' || lang === 'spanish' || lang === 'amharic' || lang === 'other'
    ? 'english'
    : lang
}

function fillTemplate(template: string, contact: Contact): string {
  const firstName = contact.name.split(' ')[0]
  return template.replace(/\{name\}/g, firstName)
}

// Derive the "base" holiday key by stripping the trailing -YYYY year suffix
function holidayBaseKey(holidayId: string): string {
  return holidayId.replace(/-\d{4}$/, '')
}

function buildGreeting({ contact, holiday, tone, language }: GreetingContext): string {
  const lang = resolveLanguage(language)

  const salutationMap = SALUTATIONS[tone]
  const salutationTemplates = salutationMap[lang] ?? salutationMap.english ?? ['{name},']
  const salutation = fillTemplate(pick(salutationTemplates), contact)

  const body = holiday
    ? buildHolidayBody(holiday, contact, tone, lang)
    : buildGenericBody(contact, tone, lang)

  const closingMap = CLOSINGS[tone]
  const closingTemplates = closingMap[lang] ?? closingMap.english ?? ['Warm regards,']
  const closing = pick(closingTemplates)

  return `${salutation}\n\n${body}\n\n${closing}`
}

function buildHolidayBody(
  holiday: Holiday,
  contact: Contact,
  tone: GreetingTone,
  lang: Language
): string {
  // ── 1. Check if we have a holiday-specific override pool ────────────────────
  const baseKey = holidayBaseKey(holiday.id)
  const specificEntry = HOLIDAY_SPECIFIC_BODIES[baseKey]
  if (specificEntry) {
    const toneEntry = specificEntry[tone] ?? specificEntry.friendly
    if (toneEntry) {
      const langPool = toneEntry[lang] ?? toneEntry.english
      if (langPool && langPool.length) {
        return pick(langPool)
      }
    }
  }

  // ── 2. Fall back to the existing generic logic ──────────────────────────────
  const greetingPool =
    lang === 'hebrew' && holiday.greetings.hebrew?.length
      ? holiday.greetings.hebrew
      : lang === 'arabic' && holiday.greetings.arabic?.length
      ? holiday.greetings.arabic
      : holiday.greetings.english

  const baseGreeting = pick(greetingPool)

  const toneAddons: Record<GreetingTone, Partial<Record<Language, string[]>>> = {
    friendly: {
      english: [
        `Thinking of you this ${holiday.name} and wanted to send some love your way! 🌟`,
        `Hope this ${holiday.name} brings you so much joy and warmth! 💫`,
        `Wishing you and your family a truly beautiful ${holiday.name}! ✨`,
        `Sending you warmth and good wishes for a wonderful ${holiday.name}! 🎉`,
      ],
      hebrew: [
        `חשבתי עליך בחג ורציתי לאחל לך ולמשפחתך חג שמח ומבורך! 🌟`,
        `מקווה שהחג יביא לך שמחה, בריאות, ואהבה. שיהיה לך חג נפלא! ✨`,
        `תחגגו בגדול ותהנו! 😊🎉`,
        `עלית לי בראש ורציתי לאחל לך חג שמח ומלא שמחה! 💙`,
      ],
      arabic: [
        `أتمنى لك ولعائلتك عيداً مليئاً بالفرح والسعادة! 🌟`,
        `كل عام وأنت بخير في هذه المناسبة السعيدة! ✨`,
        `أتمنى أن تكون هذه المناسبة مليئة بالفرح والسعادة لك ولأحبائك! 🎉`,
      ],
    },
    business: {
      english: [
        `On behalf of our team, we extend our warmest ${holiday.name} greetings to you and yours.`,
        `We take this opportunity to wish you a meaningful and joyful ${holiday.name}.`,
        `This ${holiday.name}, we're grateful for your partnership and trust.`,
        `As we celebrate ${holiday.name}, we wish to express our appreciation for your continued collaboration.`,
      ],
      hebrew: [
        `אנו שמחים לאחל לך ולמשפחתך חג שמח ומאושר בשם הצוות כולו.`,
        `לרגל החג, ברצוננו להביע את הערכתנו לשיתוף הפעולה הפורה שלנו.`,
        `מאחלים לך ולקרוביך חג מבורך ושנה טובה מלאה הצלחות.`,
        `לרגל החג, אנו מביעים הוקרה על שיתוף הפעולה הנמשך שלנו.`,
      ],
      arabic: [
        `باسم فريقنا بأكمله، نتقدم لكم بأحر التهاني بمناسبة هذه الذكرى السعيدة.`,
        `نغتنم هذه المناسبة لنتمنى لكم عيداً سعيداً مليئاً بالخير والبركات.`,
        `بهذه المناسبة السعيدة، نشكركم على تعاونكم المثمر ونتمنى لكم كل الخير.`,
      ],
    },
    formal: {
      english: [
        `Please accept our most sincere ${holiday.name} greetings and best wishes.`,
        `On this auspicious occasion, we extend our warmest compliments and good wishes.`,
        `It is with great respect that we extend our greetings on the occasion of ${holiday.name}.`,
      ],
      hebrew: [
        `ברצוני להגיש את ברכותינו הכנות לרגל החג המיוחד.`,
        `אנא קבל/י את איחולינו הכנים לחג שמח ומבורך.`,
        `לרגל החג, ברצוני להביע את כבודי ואת ברכותיי הכנות.`,
      ],
      arabic: [
        `يسرني أن أتقدم إليكم بخالص التهاني والتبريكات بهذه المناسبة الكريمة.`,
        `تفضلوا بقبول أصدق التهاني وأحر التمنيات بمناسبة هذه المناسبة الكريمة.`,
      ],
    },
    internal: {
      english: [
        `Happy ${holiday.name} to the whole team! 🙌 Enjoy the celebrations!`,
        `Wishing everyone an amazing ${holiday.name} — you all deserve it! 🎉`,
        `Happy ${holiday.name}! Hope you all have a wonderful break and come back recharged! 💪`,
      ],
      hebrew: [
        `חג שמח לכל הצוות! 🙌 תיהנו ותחגגו!`,
        `מאחל/ת לכולכם חג שמח ומנוחה מוחלטת! תחזרו טעונים 🎉`,
        `חג שמח! תנוחו, תיהנו ותחגגו — מגיע לכם! 😊`,
      ],
      arabic: [
        `كل عيد وأنتم بخير! عيد سعيد للفريق بأكمله! 🙌`,
        `عيد سعيد! أتمنى لكم جميعاً أياماً مليئة بالفرح والراحة! 🎉`,
      ],
    },
    vip: {
      english: [
        `It is my sincerest honor to extend to you the warmest ${holiday.name} wishes. Your continued trust and partnership means the world to me. 🌹`,
        `On this most special occasion of ${holiday.name}, I wish to express not only my holiday greetings, but my profound gratitude for you. 🌹`,
        `As ${holiday.name} approaches, I find myself reflecting on how much I value our connection. With warmest wishes and deep appreciation. 🌹`,
      ],
      hebrew: [
        `זהו כבוד מיוחד עבורי לאחל לך ולמשפחתך חג מבורך ומלא אור. הקשר שלנו יקר לי מאוד. 🌹`,
        `לרגל החג, ברצוני להביע לא רק ברכות חג, אלא גם הכרת תודה עמוקה על כל מה שאתה/את מייצג/ת עבורי. 🌹`,
        `עם הגיע החג, אני חושב/ת כמה הקשר שלנו חשוב לי. מאחל/ת לך חג מבורך ומיוחד. 🌹`,
      ],
      arabic: [
        `يسعدني في هذه المناسبة الكريمة أن أتقدم لسعادتكم بأرق التهاني وأحر التمنيات. أقدّر علاقتنا الراقية حق قدرها. 🌹`,
        `بمناسبة هذه المناسبة الكريمة، أتوجه إليكم بأصدق التهاني وأعمق الامتنان لهذه العلاقة القيّمة التي تجمعنا. 🌹`,
      ],
    },
  }

  const addonsForTone = toneAddons[tone] ?? toneAddons.friendly
  const addonPool = addonsForTone[lang] ?? addonsForTone.english ?? []
  const addon = addonPool.length ? pick(addonPool) : ''

  return addon ? `${baseGreeting}\n\n${addon}` : baseGreeting
}

function buildGenericBody(
  _contact: Contact,
  tone: GreetingTone,
  lang: Language
): string {
  const templates: Record<GreetingTone, Partial<Record<Language, string[]>>> = {
    friendly: {
      english: [
        "I've been thinking of you lately and wanted to reach out — hope life is treating you wonderfully! 😊",
        "Just a quick hello to say you've been on my mind! Hope all is well and that we can catch up soon. 💙",
        "It's been a while and I miss you! Hope everything is going great on your end. Let's connect soon! 🌟",
        "Randomly thought of you today and realized I haven't said hello in too long! How are you doing? 😊",
        "Popping in to say hi and check how life has been treating you. Hope everything is wonderful! 🌟",
      ],
      hebrew: [
        "עלית לי בראש לאחרונה ורציתי לומר שלום! מקווה שהכל טוב ומעניין אצלך 😊",
        "סתם חשבתי עליך ורציתי לברר מה שלומך. מי יודע — אולי נסגור סוף סוף לפגוש? ☕",
        "הרבה זמן לא דיברנו! מקווה שהכל בסדר גמור. תעדכן/י אותי בחדשות! 🌟",
        "נזכרתי בך ועלה לי להגיד שלום. איך אתה/את? מקווה שהכל מעולה 😊",
        "מה קורה? סתם חשבתי עליך ורציתי לבדוק מה שלומך! כמה זמן לא דיברנו...",
        "הרבה זמן לא דיברנו — עלית לי בראש ורציתי להגיד שלום. שכל טוב אצלך? 💙",
        "כמה שמח/ה לחשוב עליך! מקווה שהכל מעולה ושנצליח להיתראות בקרוב ☕",
      ],
      arabic: [
        "كنت أفكر فيك مؤخراً وأردت أن أسأل عنك. آمل أن تكون بخير وسعادة! 😊",
        "مضى وقت طويل! أتمنى أن تكون أحوالك على ما يرام. نتحدث قريباً؟ 🌟",
        "تذكرتك اليوم وأردت أن أطمئن عليك. أتمنى أن يكون كل شيء على ما يرام! 😊",
        "لم نتحدث منذ زمن طويل! آمل أن تكون بصحة جيدة وسعيداً. 💙",
      ],
    },
    business: {
      english: [
        "I hope this message finds you well. I wanted to touch base and ensure our connection remains strong.",
        "Following up to check in and see how things are progressing. Looking forward to our continued collaboration.",
        "I hope you're doing great. I wanted to reach out and express my appreciation for our ongoing partnership.",
        "Reaching out to stay connected and see how everything is going on your end. Hope all is well!",
        "Just checking in to see how things are going. Looking forward to our continued work together.",
      ],
      hebrew: [
        "מקווה שהכל מצוין אצלך. רציתי לשמור על קשר ולוודא שהשיתוף הפעולה שלנו ממשיך בצורה מיטבית.",
        "שלחתי ידו/ת לבדוק מה נשמע ולוודא שאנחנו מסונכרנים. מקווה שהכל מתקדם כמו שצריך.",
        "רציתי ליצור קשר ולהביע את הערכתי לשותפות המשמעותית שלנו.",
        "פונה אליך כדי לשמור על קשר ולוודא שהכל מתנהל בצורה הטובה ביותר.",
        "מקווה שהכל מצוין. רציתי לבדוק מה נשמע ולוודא שאנחנו עדיין על אותו הגל.",
      ],
      arabic: [
        "آمل أن تكون في أحسن حال. أردت التواصل والتأكد من استمرار تعاوننا بأفضل صورة.",
        "أريد المتابعة معك والاطمئنان على سير الأمور. أتطلع إلى استمرار تعاوننا المثمر.",
        "أتواصل معك للاطمئنان وضمان استمرار تعاوننا الرائع.",
        "آمل أن تكون بصحة جيدة. أردت التواصل والتعبير عن تقديري لشراكتنا المستمرة.",
      ],
    },
    formal: {
      english: [
        "I trust this correspondence finds you in good health and high spirits. I am reaching out to maintain our valued connection.",
        "I hope you are well. I am writing to stay in touch and express my continued regard.",
        "It is my pleasure to reach out and maintain our esteemed connection. I trust you are well.",
        "I am writing to express my continued appreciation for our valued relationship and to ensure our correspondence remains active.",
      ],
      hebrew: [
        "מקווה שאתה/את בריא/ה ובמצב רוח טוב. פניתי אליך כדי לשמור על הקשר המכובד שלנו.",
        "ברצוני לבטא את הערכתי לקשר שלנו ולשמור על הקשר הפעיל ביננו.",
        "פונה אליך כדי לשמור על ראיית הדברים המשותפת שלנו ועל הקשר המכובד.",
        "מקווה שמצב הדברים אצלך מצוין. פניתי לשמור על קשר ולבטא את הכבוד הרב שרוחש לך.",
      ],
      arabic: [
        "آمل أن تكون بصحة جيدة. أتواصل معك للحفاظ على علاقتنا القيّمة.",
        "أتواصل للتعبير عن تقديري المستمر وللحفاظ على تواصلنا الراقي.",
        "أرجو أن تكون في أتم الصحة والعافية. أكتب إليك للحفاظ على علاقتنا المحترمة.",
      ],
    },
    internal: {
      english: [
        "Hey! Just checking in — how's everything going on your end? Let me know if you need anything! 👋",
        "Quick hello from me! Hope the workload is manageable and you're getting enough breaks. 🙌",
        "Just wanted to pop in and see how you're doing. Hope work is going smoothly! 😊",
        "Checking in! How's it all going? Hope the week is treating you well. 🙌",
      ],
      hebrew: [
        "היי! סתם מציץ/צת לבדוק מה נשמע. כל טוב! 👋",
        "מה קורה? רציתי לבדוק שהכל בסדר אצלך. פנה/י אלי אם צריך/ה משהו! 🙌",
        "היי, סתם בודק/ת מה נשמע. מקווה שהכל מתנהל חלק! 😊",
        "מה המצב? רציתי להגיד שלום ולבדוק שהכל בסדר. יאלה, בהצלחה! 🙌",
      ],
      arabic: [
        "مرحباً! فقط أردت الاطمئنان عليك. أخبرني إذا احتجت شيئاً! 👋",
        "كيف حال الأمور؟ أردت فقط السلام والاطمئنان. 🙌",
        "مرحباً! كيف تسير الأمور؟ أتمنى أن يكون كل شيء على ما يرام! 😊",
      ],
    },
    vip: {
      english: [
        "I hope you are enjoying excellent health and remarkable success. I am reaching out to express my continued regard and to ensure our valued connection remains as strong as ever. 🌹",
        "It is always a pleasure to be in touch with someone of your caliber. I hope life is bringing you all the joy and success you so richly deserve. 🌹",
        "I find myself thinking of you with great admiration and gratitude. I hope you are thriving in every way, and I wanted to ensure our connection remains warm and strong. 🌹",
        "Reaching out to express how much I value our relationship and to ensure you know that your trust and partnership are among the things I cherish most. I hope you are in excellent spirits. 🌹",
      ],
      hebrew: [
        "מקווה שאתה/את נהנה/ת מבריאות מצוינת והצלחות רבות. פניתי כדי לבטא את הערכתי הרבה ולהבטיח שהקשר בינינו ממשיך לפרוח. 🌹",
        "תמיד שמחה להיות בקשר עם אדם בעל כישורים ורמה כמוך. מקווה שהחיים מעניקים לך את כל מה שמגיע לך. 🌹",
        "חושב/ת עליך בהערכה ובהכרת תודה. מקווה שאתה/את שגשג/ת בכל תחום, ורציתי לוודא שהקשר שלנו נשאר חם ומשמעותי. 🌹",
        "פונה אליך כדי לבטא עד כמה אני מעריך/ה את הקשר שלנו. האמון שלך והשותפות שלנו הם מהדברים היקרים לי ביותר. 🌹",
      ],
      arabic: [
        "آمل أن تكون في أوج صحتك وازدهارك. أتواصل معك لأعبّر عن مدى تقديري، وللتأكد من أن علاقتنا القيّمة تظل في أفضل حالاتها. 🌹",
        "يسعدني دائماً التواصل مع شخص من مستواك الرفيع. أرجو أن تكون السعادة والنجاح رفيقيك في كل وقت. 🌹",
        "أتواصل معك لأعبّر عن تقديري العميق لعلاقتنا القيّمة. ثقتك وشراكتك من أثمن ما أحمله في مسيرتي. 🌹",
      ],
    },
  }

  const langTemplates = templates[tone]?.[lang]
  const fallback = templates[tone]?.english ?? templates.friendly.english ?? []
  const pool = (langTemplates?.length ? langTemplates : fallback)
  return pick(pool)
}

export function generateGreeting(ctx: GreetingContext): string {
  return buildGreeting(ctx)
}

export function generateBirthdayGreeting(
  contact: Contact,
  tone: GreetingTone,
  language: Language
): string {
  const lang = resolveLanguage(language)
  const firstName = contact.name.split(' ')[0]

  const salutationMap = SALUTATIONS[tone]
  const salutationTemplates = salutationMap[lang] ?? salutationMap.english ?? ['{name},']
  const salutation = fillTemplate(pick(salutationTemplates), contact)

  const bodies: Record<Language, string[]> = {
    english: [
      `Happy Birthday, ${firstName}! 🎂🎉 May this special day bring you all the joy, love, and laughter you deserve. Here's to an amazing year ahead full of wonderful moments!`,
      `It's your big day, ${firstName}! 🥳 Wishing you a birthday filled with celebration, warmth, and everything your heart desires. You deserve every bit of happiness!`,
      `Happy Birthday! 🎉 ${firstName}, I hope this day is as wonderful as you are. May the year ahead bring you incredible adventures and beautiful memories.`,
      `Wishing you the happiest of birthdays, ${firstName}! 🎂 May your day be filled with people you love, food you enjoy, and moments that make you smile.`,
      `Many happy returns, ${firstName}! 🥳✨ Hope today is everything you've wished for and that the year ahead brings you health, happiness, and every success.`,
    ],
    hebrew: {
      friendly: [
        `יום הולדת שמח, ${firstName}! 🎂🎉 מאחל/ת לך יום מיוחד מלא שמחה, אהבה וצחוק. שתמיד תישאר/י בריא/ה ומאושר/ת, ושהשנה הבאה תביא לך הצלחות ורגעים נפלאים!`,
        `יום הולדת שמח! 🎉 ${firstName}, מקווה שהיום שלך יהיה כיפי ומלא אנשים שאתה/את אוהב/ת. שנה נפלאה לפניך!`,
        `ווואו, יום הולדת! 🥳 ${firstName}, אתה/את מיוחד/ת ומגיע/ה לך יום נפלא. חוגגים אותך!`,
        `יום הולדת שמח ${firstName}! 🎂 שיהיה לך יום מלא שמחה ואהבה, ושנה מדהימה לפניך!`,
      ],
      business: [
        `ברכות חמות מהלב ליום הולדתך, ${firstName}! 🥳🎈 שיהיה לך יום מלא אהבה, חברים וכל מה שאתה/את אוהב/ת. שנה נפלאה לפניך!`,
        `לרגל יום ההולדת, מאחל/ת לך כל טוב, בריאות ושמחה. ${firstName}, שתמשיך/י בהצלחות ובהישגים! 🎂`,
      ],
      formal: [
        `ברכות כנות ליום הולדתך, ${firstName}. מאחל/ת לך בריאות, שמחה ושנה של הצלחות. 🎂`,
      ],
      vip: [
        `ברכות החמות והכנות ביותר ליום הולדתך, ${firstName}. 🌹🎂 מאחל/ת לך יום מלא בשמחה ואהבה, ושנה מלאה בכל הטוב — בריאות, הצלחה ואושר שמגיע לך מכל הלב.`,
      ],
    } as unknown as string[],
    arabic: [
      `عيد ميلاد سعيد يا ${firstName}! 🎂🎉 أتمنى لك يوماً مليئاً بالفرح والمحبة والسعادة. كل عام وأنت بألف خير!`,
      `تهانيّ الحارة بعيد ميلادك يا ${firstName}! 🥳 أتمنى لك كل الخير والصحة والسعادة في سنواتك القادمة!`,
      `كل عام وأنت بخير يا ${firstName}! 🎂✨ أتمنى أن يكون يومك مليئاً بالفرح والمسرة ومحاطاً بمن تحب.`,
      `عيد ميلاد سعيد! 🎉 يا ${firstName}، أتمنى لك يوماً رائعاً وسنة مليئة بالنجاح والسعادة.`,
    ],
    russian: [
      `С днём рождения, ${firstName}! 🎉🎂 Желаю вам крепкого здоровья, счастья, любви и всего самого прекрасного!`,
      `Поздравляю с днём рождения, ${firstName}! 🥳 Пусть этот день будет особенным, а год впереди принесёт вам радость и успех!`,
    ],
    amharic: [
      `ደስተኛ የልደት ቀን፣ ${firstName}! 🎂🎉 ደስታ፣ ጤና እና ፍቅር ይምጣልዎ!`,
    ],
    french: [
      `Joyeux anniversaire, ${firstName}! 🎉🎂 Que cette journée soit pleine de joie, d'amour et de célébration. Bonne année devant vous!`,
      `Bon anniversaire, ${firstName}! 🥳🎂 J'espère que ta journée est aussi merveilleuse que tu l'es. Que l'année qui s'ouvre t'apporte santé, bonheur et réussite!`,
      `Joyeux anniversaire! 🎉 ${firstName}, puisse ce jour te remplir de bonheur et de sourires. Avec toute mon affection!`,
    ],
    spanish: [
      `¡Feliz cumpleaños, ${firstName}! 🎂🎉 ¡Que tu día esté lleno de alegría, amor y todo lo que deseas! ¡Que tengas un año increíble!`,
      `¡Muchas felicidades, ${firstName}! 🥳🎂 ¡Espero que este día sea tan especial como tú! ¡Que el año que empieza te traiga salud, felicidad y éxito!`,
      `¡Feliz cumpleaños! 🎉 ${firstName}, que este día esté rodeado de personas queridas y momentos que te hagan sonreír. ¡Con todo mi cariño!`,
    ],
    other: [
      `Happy Birthday, ${firstName}! 🎉🎂 Wishing you a wonderful day filled with joy, love, and celebration!`,
      `Wishing you the happiest birthday, ${firstName}! 🎂 May your special day be everything you've wished for!`,
    ],
  }

  // For Hebrew, pick by tone if we have tone-specific arrays
  let pool: string[]
  if (language === 'hebrew') {
    const heEntry = bodies.hebrew as unknown as Record<string, string[]>
    pool = heEntry[tone] ?? heEntry.friendly ?? []
  } else {
    pool = bodies[language] ?? bodies.english
  }

  // If pool somehow ended up as an object rather than array (type guard), fall back
  if (!Array.isArray(pool) || pool.length === 0) {
    pool = bodies.english
  }

  const body = pick(pool)

  const closingMap = CLOSINGS[tone]
  const closingTemplates = closingMap[lang] ?? closingMap.english ?? ['Warm regards,']
  const closing = pick(closingTemplates)

  return `${salutation}\n\n${body}\n\n${closing}`
}
