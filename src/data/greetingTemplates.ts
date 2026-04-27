import type { GreetingTone, Language } from '@/types'

export const HOLIDAY_SPECIFIC_BODIES: Partial<Record<string, Partial<Record<GreetingTone, Partial<Record<Language, string[]>>>>>> = {
  'rosh-hashana': {
    friendly: {
      english: [
        'Wishing you and your family a sweet, happy, and healthy New Year! 🍎🍯 May this year bring you joy, love, and all the blessings you deserve.',
        'Shana Tova! 🍎✨ Hoping this new year is filled with wonderful moments, good health, and sweet surprises for you and your loved ones.',
        'A brand new year is here — and I\'m wishing you the very sweetest of starts! 🍯 May it be a year of happiness, health, and peace.',
      ],
      hebrew: [
        'שנה טובה ומתוקה! 🍎🍯 שתהיה לך שנה מלאה בברכות, שמחה ובריאות. מאחל/ת לך ולמשפחתך כתיבה וחתימה טובה!',
        'ראש השנה הגיע! 🍎 מאחל/ת לך שנה נפלאה ומתוקה כדבש, מלאה בהצלחות, אהבה ורגעים יפים.',
        'שנה טובה! 🍯✨ שהשנה החדשה תביא לך ולמשפחתך בריאות, פרנסה בשפע ושמחה אמיתית.',
        'כתיבה וחתימה טובה! 🍎 שתהיה לך שנה מוצלחת, מלאה בעשייה משמעותית ורגעים מאושרים.',
      ],
    },
    business: {
      english: [
        'On behalf of our team, Shana Tova — wishing you a sweet and prosperous New Year. May this year bring growth, success, and fulfillment.',
        'As the Jewish New Year begins, we extend our warmest wishes for a healthy, meaningful, and successful year ahead.',
      ],
      hebrew: [
        'שנה טובה ומתוקה! 🍎 בשם הצוות כולו, מאחלים לך ולמשפחתך שנה של הצלחות, בריאות ושגשוג.',
        'לרגל ראש השנה, ברצוננו לאחל לך כתיבה וחתימה טובה. שנה של שגשוג, שמחה ועשייה ברוכה לפניך.',
      ],
    },
    formal: {
      english: [
        'Please accept our most sincere wishes for a healthy, happy, and meaningful New Year. Shana Tova.',
      ],
      hebrew: [
        'ברצוני להגיש את ברכותיי הכנות לשנה החדשה. כתיבה וחתימה טובה, ושנה של בריאות, שמחה ושגשוג.',
      ],
    },
    vip: {
      english: [
        'On this most sacred occasion of Rosh Hashana, I extend to you and your family my warmest and most heartfelt wishes for a sweet, healthy, and blessed New Year. Your friendship and trust mean the world to me. Shana Tova! 🌹',
      ],
      hebrew: [
        'לרגל ראש השנה הקדוש, ברצוני לאחל לך ולמשפחתך שנה טובה ומתוקה מכל הלב. 🌹 הקשר שלנו יקר לי מאוד, ואני מאחל/ת לך שנה מלאה בברכות, בריאות, ואהבה. כתיבה וחתימה טובה!',
      ],
    },
  },

  'yom-kippur': {
    friendly: {
      english: [
        'Wishing you an easy and meaningful fast. May this Yom Kippur bring you peace, clarity, and renewal. 🙏',
        'G\'mar Chatima Tova! Thinking of you on this solemn and beautiful day. Wishing you a meaningful fast.',
      ],
      hebrew: [
        'גמר חתימה טובה! 🙏 מאחל/ת לך ולמשפחתך צום קל ומשמעותי. שהיום הזה יביא לך שלום פנימי וחידוש.',
        'צום קל! 🕍 מאחל/ת לך יום כיפור משמעותי, מלא התבוננות ורוגע. גמח"ט!',
        'גמר חתימה טובה 🙏 — שתחתם לחיים טובים ומאושרים. צום קל ומשמעותי.',
      ],
    },
    business: {
      english: [
        'G\'mar Chatima Tova. Wishing you and your family an easy fast and a meaningful Yom Kippur.',
      ],
      hebrew: [
        'גמר חתימה טובה. מאחלים לך ולמשפחתך צום קל ויום משמעותי.',
        'לרגל יום הכיפורים, אנו מאחלים לך ולכל בני ביתך צום קל וגמר חתימה טובה.',
      ],
    },
    formal: {
      hebrew: [
        'ברצוני לאחל לך גמר חתימה טובה. שיום הכיפורים הזה יביא לך שלום פנימי ורוגע.',
      ],
      english: [
        'G\'mar Chatima Tova. May this Yom Kippur be a day of peace, renewal, and meaningful reflection for you and your loved ones.',
      ],
    },
    vip: {
      hebrew: [
        'גמר חתימה טובה 🙏 מכל הלב. מאחל/ת לך ולמשפחתך צום קל, יום משמעותי, ושנה מלאה בכל הטוב. הקשר שלנו יקר לי מאוד.',
      ],
      english: [
        'G\'mar Chatima Tova. On this holiest of days, I wish you and your loved ones an easy fast, deep renewal, and a year sealed with blessing, health, and peace. 🙏',
      ],
    },
  },

  'hanukkah': {
    friendly: {
      english: [
        'Happy Hanukkah! 🕎✨ Wishing you eight nights filled with warmth, light, and joy. May the Festival of Lights brighten your days!',
        'Chag Urim Sameach! 🕎 Hoping your Hanukkah is full of delicious latkes, spinning dreidels, and lots of family love!',
        'Happy Hanukkah! 🕎🌟 May the light of the menorah fill your home with warmth, happiness, and holiday magic.',
      ],
      hebrew: [
        'חג אורים שמח! 🕎✨ שהאור יאיר את דרכך ויביא לך שמחה, חום ואהבה. חנוכה שמח!',
        'חג חנוכה שמח! 🕎 שמונת הנרות יביאו לך אור, שמחה ורגעים נפלאים עם המשפחה.',
        'חנוכה שמח! 🕎🌟 מאחל/ת לך ולמשפחתך חג מואר ומשמח, מלא בסביבונים, לביבות ונרות חנוכה.',
        'חג אורים שמח! 🕎 שהנרות יאירו את חייך ויביאו לך ולמשפחתך ברכה ושמחה בימי החנוכה.',
      ],
    },
    business: {
      english: [
        'Happy Hanukkah! 🕎 On behalf of our team, wishing you a joyful Festival of Lights filled with warmth and celebration.',
      ],
      hebrew: [
        'חנוכה שמח! 🕎 בשם הצוות כולו, מאחלים לך ולמשפחתך חג אורים שמח ומבורך.',
        'חג חנוכה שמח ומואר! 🕎 מאחלים לך שמונה ימים של שמחה, אור ובריאות.',
      ],
    },
    vip: {
      english: [
        'Happy Hanukkah! 🕎🌹 As the lights of the menorah grow brighter each night, may your life be filled with an ever-growing light of joy, success, and meaning. Wishing you and your loved ones the most beautiful Festival of Lights.',
      ],
      hebrew: [
        'חנוכה שמח! 🕎🌹 כשם שנרות החנוכייה מאירים את הלילה, כן יאיר הקשר שלנו ויביא לך ולמשפחתך שמחה וברכה. מאחל/ת לך חג אורים נפלא ומואר.',
      ],
    },
  },

  'passover': {
    friendly: {
      english: [
        'Chag Pesach Sameach! 🫓✨ Wishing you a joyful and meaningful Passover, filled with great food, wonderful family time, and the spirit of freedom.',
        'Happy Passover! 🌿 May this Seder be filled with warmth, laughter, and beautiful memories. Chag sameach!',
        'Wishing you a happy and kosher Passover! 🫓 May the spirit of freedom and renewal fill your home and heart.',
      ],
      hebrew: [
        'חג פסח כשר ושמח! 🫓✨ מאחל/ת לך חירות אמיתית וגאולה בחייך האישיים. שהחג הזה יביא לך שמחה, קרבה משפחתית ורגעים נפלאים.',
        'פסח שמח! 🌿 שהסדר יהיה מלא בשמחה, צחוק וסיפורים יפים. חג כשר ושמח!',
        'חג פסח שמח ומשמעותי! 🫓 מאחל/ת לך ולמשפחתך חירות, בריאות ושמחה אמיתית בחג האביב.',
        'חג חרות שמח! 🌾✨ שהחגיגות יהיו מלאות בשמחה ואהבה, ושיציאת מצרים תעניק לך השראה לחירות אמיתית.',
      ],
    },
    business: {
      english: [
        'Chag Pesach Sameach! Wishing you and your family a joyful and meaningful Passover. May this Festival of Freedom bring renewal and inspiration.',
      ],
      hebrew: [
        'חג פסח כשר ושמח! מאחלים לך ולמשפחתך חג משמח ומשמעותי, מלא בחירות ובשמחת החג.',
      ],
    },
    vip: {
      english: [
        'Chag Pesach Sameach! 🌹 As you gather around the Seder table, I wish you and your family the most joyful, meaningful, and beautiful Passover. The story of freedom and redemption is timeless — may it inspire and renew you this holiday season.',
      ],
      hebrew: [
        'חג פסח כשר ושמח! 🌹 מאחל/ת לך ולמשפחתך ליל סדר מרגש ומלא בשמחה, חירות ואהבה. הקשר שלנו יקר לי, ואני שמח/ה לאחל לך חג שיביא לך גאולה ושמחה אמיתית.',
      ],
    },
  },

  'eid-al-fitr': {
    friendly: {
      english: [
        'Eid Mubarak! 🌙✨ Wishing you and your family a joyful and blessed Eid al-Fitr. May this special day bring happiness, peace, and wonderful celebrations!',
        'Eid Mubarak! 🎉 After a month of devotion, may your Eid be filled with love, laughter, and beautiful moments with those you cherish.',
        'Happy Eid al-Fitr! 🌙 Kul aam wa antum bikhair — may you always be well! Wishing you a festive and joyful celebration.',
      ],
      arabic: [
        'عيد مبارك وكل عام وأنت بخير! 🌙✨ أتمنى لك ولأسرتك عيداً سعيداً مليئاً بالفرح والمحبة والبركات.',
        'عيد الفطر المبارك! 🎉 تقبّل الله طاعتك وأعاد عليك هذه المناسبة السعيدة بالخير والسعادة. كل عام وأنت بخير!',
        'عيد مبارك! 🌙 أتمنى أن يكون عيدك مليئاً بالفرح والمسرة والذكريات الجميلة مع أحبائك.',
        'كل عام وأنت بخير بمناسبة عيد الفطر المبارك! 🌙✨ عيد سعيد ومبارك لك ولعائلتك الكريمة.',
      ],
    },
    business: {
      arabic: [
        'بمناسبة حلول عيد الفطر المبارك، نتقدم لكم بأحر التهاني وأصدق التمنيات. كل عام وأنتم بخير.',
        'عيد فطر مبارك وسعيد. باسم الفريق بأكمله، نتمنى لكم عيداً مليئاً بالفرح والنجاح والبركات.',
      ],
      english: [
        'Eid Mubarak! On behalf of our entire team, we extend our warmest wishes for a blessed and joyful Eid al-Fitr.',
      ],
    },
    vip: {
      arabic: [
        'عيد مبارك وسعيد! 🌹 يسعدني أن أتقدم لكم بأرق التهاني وأحر التمنيات بمناسبة عيد الفطر المبارك. أقدّر علاقتنا الراقية وأتمنى أن يعود عليكم هذا العيد بالخير والسعادة والتوفيق دائماً.',
      ],
      english: [
        'Eid Mubarak! 🌹 On this most joyous occasion, I extend to you and your family my warmest and most sincere wishes for a blessed and beautiful Eid al-Fitr. Your trust and partnership are deeply valued, and I hope this celebration brings you immense joy and peace.',
      ],
    },
  },

  'eid-al-adha': {
    friendly: {
      english: [
        'Eid al-Adha Mubarak! 🐑✨ Wishing you and your family a blessed and joyful celebration. May this day of sacrifice and gratitude bring you peace and happiness.',
        'Eid Mubarak! 🌙 Kul aam wa antum bikhair on this beautiful Eid al-Adha. May it be filled with blessings, family, and joy.',
      ],
      arabic: [
        'عيد الأضحى مبارك! 🐑✨ أتمنى لك ولأسرتك عيداً سعيداً مليئاً بالخير والبركات والفرح.',
        'كل عام وأنت بخير بمناسبة عيد الأضحى المبارك! 🐑 عيد مبارك وتقبّل الله الطاعات.',
        'عيد أضحى مبارك وسعيد! 🌙✨ أتمنى لكم أياماً مليئة بالفرح والمحبة والتقارب العائلي.',
      ],
    },
    business: {
      arabic: [
        'بمناسبة حلول عيد الأضحى المبارك، نتقدم بأجمل التهاني وأطيب الأمنيات. كل عام وأنتم بخير.',
      ],
      english: [
        'Eid al-Adha Mubarak! Wishing you and your family a joyful and blessed celebration.',
      ],
    },
    vip: {
      arabic: [
        'عيد الأضحى المبارك! 🌹 يسرني أن أتقدم إليكم بأرقى التهاني وأصدق التمنيات في هذه المناسبة المباركة. أتمنى لكم ولعائلتكم الكريمة عيداً سعيداً مليئاً بالخير والصحة والتوفيق.',
      ],
      english: [
        'Eid al-Adha Mubarak! 🌹 I extend to you and your family my most heartfelt and sincere wishes on this blessed occasion. May this Eid be a time of deep reflection, gratitude, and joyful celebration for you and all your loved ones.',
      ],
    },
  },

  'christmas': {
    friendly: {
      english: [
        'Wishing you and your loved ones a joyful and peaceful Christmas! 🎄✨ May your holidays be merry, bright, and filled with everything that makes you happy.',
        'Merry Christmas! 🎄🎁 Hope your holiday season is filled with warmth, laughter, and precious moments with those you love.',
        'Happy Christmas! 🎅✨ Sending you lots of holiday cheer, love, and warmest wishes for a wonderful festive season.',
        'Merry Christmas and a Happy New Year! 🎄🌟 May this magical season bring you joy, peace, and wonderful memories.',
      ],
    },
    business: {
      english: [
        'On behalf of our team, wishing you and your family a Merry Christmas and a prosperous New Year. 🎄 Thank you for your continued partnership.',
        'Season\'s Greetings and Merry Christmas! 🎄 We\'re grateful for your trust and look forward to a wonderful year ahead together.',
      ],
    },
    formal: {
      english: [
        'Please accept our most sincere Season\'s Greetings and warmest wishes for a Merry Christmas and a healthy, happy New Year.',
      ],
    },
    vip: {
      english: [
        'Wishing you and your family a truly magical and joyful Christmas season. 🎄🌹 Your trust and friendship are among the things I am most grateful for this year. May the holidays bring you all the warmth, peace, and happiness you so richly deserve.',
      ],
    },
  },
}
