import type { GreetingTone, Language, Holiday } from '@/types'

export interface AISuggestionsContext {
  contactName: string
  holiday?: Holiday
  tone: GreetingTone
  language: Language
}

type SuggestionLang = 'english' | 'hebrew' | 'arabic'
type SuggestionTone = 'casual' | 'professional' | 'vip'

function resolveTone(tone: GreetingTone): SuggestionTone {
  if (tone === 'vip') return 'vip'
  if (tone === 'business' || tone === 'formal') return 'professional'
  return 'casual'
}

function resolveLang(lang: Language): SuggestionLang {
  if (lang === 'hebrew') return 'hebrew'
  if (lang === 'arabic') return 'arabic'
  return 'english'
}

function fill(template: string, name: string, holiday: string): string {
  return template.replace(/\{name\}/g, name).replace(/\{holiday\}/g, holiday)
}

// Each slot has exactly 3 options — meaningfully different angles:
// [0] Warm & personal (relationship-focused)
// [1] Thoughtful & occasion-specific
// [2] Brief & modern
const HOLIDAY_SUGGESTIONS: Record<SuggestionTone, Record<SuggestionLang, string[]>> = {
  casual: {
    english: [
      `Hey {name}! 😊 Just wanted to wish you a wonderful {holiday} — hope you get to celebrate with the people you love most. Thinking of you! 💙`,
      `Happy {holiday}, {name}! 🎉 Wishing you a season full of warmth, laughter, and beautiful memories with the people who matter most. Enjoy every moment!`,
      `{name}! Happy {holiday} 🌟 Hope it's amazing — enjoy every second! ✨`,
    ],
    hebrew: [
      `היי {name}! 😊 רציתי לאחל לך חג {holiday} שמח ומלא שמחה — מקווה שתחגגו בגדול עם האנשים שאתה/את הכי אוהב/ת. חושב/ת עליך! 💙`,
      `{name}, לרגל {holiday} רציתי לאחל לך חג מלא שמחה, בריאות ורגעים יפים עם הקרובים. שיהיה לך חג מיוחד! ✨`,
      `{name}! חג {holiday} שמח 🌟 שיהיה נפלא!`,
    ],
    arabic: [
      `أهلاً {name}! 😊 أردت أن أتمنى لك عيد {holiday} سعيداً — أتمنى أن تحتفل مع من تحب. أفكر فيك! 💙`,
      `{name}، عيد {holiday} سعيد! 🎉 أتمنى لك موسماً مليئاً بالدفء والضحك والذكريات الجميلة. استمتع بكل لحظة!`,
      `{name}! كل عام وأنت بخير بمناسبة {holiday} 🌟 أتمنى أن يكون رائعاً! ✨`,
    ],
  },
  professional: {
    english: [
      `Dear {name}, on the occasion of {holiday}, I wanted to extend my warmest wishes to you and your family. May this time bring you well-deserved rest, joy, and celebration.`,
      `Wishing you and your loved ones a meaningful {holiday}, {name}. It has been a pleasure working together, and I hope this season brings you happiness and renewal.`,
      `Happy {holiday}, {name}. May this special time bring you peace and renewed energy. Looking forward to continued collaboration.`,
    ],
    hebrew: [
      `{name} היקר/ה, לרגל {holiday} ברצוני לאחל לך ולמשפחתך חג מבורך ומלא שמחה. מקווה שתחגגו בשמחה ובכבוד.`,
      `לרגל {holiday}, {name}, ברצוני להביע את ברכותיי הכנות לך ולקרוביך. שיביא לך החג מנוחה, שמחה והתחדשות.`,
      `חג {holiday} שמח, {name}. מאחל/ת לך ולמשפחתך חג שמח ובריאות טובה.`,
    ],
    arabic: [
      `{name} العزيز/ة، بمناسبة {holiday}، أودّ أن أتقدم بأحر التهاني لك ولعائلتك. أتمنى أن يكون هذا الوقت مليئاً بالراحة والبهجة والاحتفال.`,
      `أتمنى لك ولأحبائك {holiday} سعيداً ومثمراً، {name}. لقد كان من دواعي سروري العمل معك، وأرجو أن يجلب لك هذا الموسم السعادة والتجدد.`,
      `{holiday} سعيد، {name}. أتمنى أن يجلب لك هذا الوقت السلام والطاقة المتجددة. أتطلع إلى مواصلة تعاوننا.`,
    ],
  },
  vip: {
    english: [
      `My dear {name}, as {holiday} approaches, I find myself reflecting on how much I value your presence in my life. It is my sincerest honor to wish you and your family a truly blessed and joyful celebration. 🌹`,
      `Esteemed {name}, on this auspicious occasion of {holiday}, please accept my heartfelt wishes for a celebration filled with peace, abundance, and the company of those you hold dearest. Your trust means everything to me. 🌹`,
      `{name}, as we welcome {holiday}, I want to express not only my warmest greetings, but my profound gratitude for the privilege of knowing you. May this season bring you all that you deserve. 🌹`,
    ],
    hebrew: [
      `{name} היקר/ה ביותר, לרגל {holiday} ברצוני לאחל לך חג מבורך ומיוחד. הקשר שלנו יקר לי מאוד, ומאחל/ת לך ולמשפחתך כל טוב ואורה. 🌹`,
      `{name} הנכבד/ת, לרגל {holiday} אנא קבל/י את ברכותיי הכנות לחג מלא שלווה, שפע ואנשים יקרים. האמון שלך בי הוא מהדברים החשובים לי ביותר. 🌹`,
      `{name}, עם הגיע {holiday} ברצוני לבטא לא רק ברכות חג, אלא גם הכרת תודה עמוקה על הזכות להכירך. שיביא לך החג את כל מה שמגיע לך. 🌹`,
    ],
    arabic: [
      `عزيزي/تي {name}، مع اقتراب {holiday}، أجد نفسي أفكر في مدى تقديري لوجودك في حياتي. يشرفني أن أتمنى لك ولعائلتك احتفالاً مباركاً مليئاً بالفرح والنور. 🌹`,
      `حضرة {name} المحترم/ة، في هذه المناسبة الكريمة من {holiday}، أتقدم بأصدق التهاني لاحتفال مليء بالسلام والوفرة وأحبائك الأعزاء. ثقتك بي أغلى ما أملك. 🌹`,
      `{name}، مع استقبال {holiday}، أودّ أن أعبّر ليس فقط عن تهانيّ الحارة، بل أيضاً عن امتناني العميق لشرف معرفتك. أتمنى أن يجلب لك هذا الموسم كل ما تستحقه. 🌹`,
    ],
  },
}

const GENERIC_SUGGESTIONS: Record<SuggestionTone, Record<SuggestionLang, string[]>> = {
  casual: {
    english: [
      `Hey {name}! 😊 You've been on my mind lately and I just wanted to reach out and say hello. How are things going? Hope life is treating you wonderfully! 💙`,
      `{name}! It's been way too long. Just popping in to say I miss you and hope everything is amazing on your end. Let's catch up soon! ☕`,
      `Randomly thought of you today, {name}! 🌟 Sending good vibes your way. Hope you're having an awesome week! ✨`,
    ],
    hebrew: [
      `היי {name}! 😊 עלית לי בראש ורציתי להגיד שלום. מה שלומך? מקווה שהכל טוב ומעניין. כמה זמן לא דיברנו! 💙`,
      `{name}! נזכרתי בך היום ורציתי לאחל לך יום נפלא. מה קורה? מקווה שהכל מעולה 🌟`,
      `היי {name}, סתם חשבתי עליך 😊 מקווה שהכל בסדר. נסגור לשוחח בקרוב? ☕`,
    ],
    arabic: [
      `أهلاً {name}! 😊 كنت أفكر فيك مؤخراً وأردت أن أقول مرحباً. كيف حالك؟ أتمنى أن تكون بأحسن حال! 💙`,
      `{name}! مضى وقت طويل. خطرت على بالي وأردت معرفة أحوالك. نلتقي قريباً؟ ☕`,
      `تذكرتك اليوم، {name}! 🌟 أبعث إليك طاقة إيجابية. أتمنى أن تكون أسبوعك رائعاً! ✨`,
    ],
  },
  professional: {
    english: [
      `Dear {name}, I hope this message finds you well. I wanted to reach out and stay connected — it's been a while and I value our relationship greatly. Wishing you continued success.`,
      `Hello {name}, I hope everything is going smoothly on your end. I'm reaching out to express my appreciation for our professional connection. Looking forward to future collaboration.`,
      `{name}, just checking in to see how things are progressing. Hope your work is going well and that you're finding time to recharge. Looking forward to connecting soon.`,
    ],
    hebrew: [
      `{name}, מקווה שהכל מצוין אצלך. רציתי ליצור קשר ולהביע את הערכתי לשיתוף הפעולה שלנו. מצפה להמשך קשר פורה.`,
      `שלום {name}, פונה אליך לשמור על קשר ולוודא שהכל מתנהל בצורה הטובה ביותר. מקווה שהכל מצוין אצלך.`,
      `{name}, שלחתי יד לבדוק מה נשמע. מקווה שהעבודה מתקדמת יפה ושאתה/את בטוב.`,
    ],
    arabic: [
      `{name} العزيز/ة، آمل أن تكون في أحسن حال. أردت التواصل والاطمئنان عليك. أقدّر علاقتنا كثيراً وأتمنى لك مزيداً من النجاح.`,
      `أهلاً {name}، أرجو أن تسير الأمور بشكل جيد. أتواصل معك للتعبير عن تقديري لعلاقتنا المهنية. أتطلع إلى تعاون مستقبلي.`,
      `{name}، أردت الاطمئنان عليك ومعرفة كيف تسير الأمور. أتمنى أن يكون عملك على ما يرام. أتطلع إلى التواصل قريباً.`,
    ],
  },
  vip: {
    english: [
      `My dear {name}, I hope you are enjoying excellent health and remarkable success. I am reaching out to express how much I value our connection and to ensure it remains as warm and strong as ever. 🌹`,
      `Esteemed {name}, it is always a pleasure to be in touch with someone of your caliber. I hope life is bringing you the joy and success you so richly deserve. With deepest regard. 🌹`,
      `{name}, I find myself thinking of you with great admiration and gratitude. I hope you are thriving in every sense, and I wanted to ensure you know how much I cherish our relationship. 🌹`,
    ],
    hebrew: [
      `{name} היקר/ה ביותר, מקווה שאתה/את נהנה/ת מבריאות מצוינת. פניתי לבטא את הערכתי הרבה ולוודא שהקשר בינינו ממשיך לפרוח. 🌹`,
      `{name} הנכבד/ת, תמיד שמחה להיות בקשר. מקווה שהחיים מעניקים לך את כל מה שמגיע לך. בהערכה עמוקה. 🌹`,
      `{name}, חושב/ת עליך בהערכה ובהכרת תודה. רציתי לוודא שאתה/את יודע/ת עד כמה הקשר שלנו יקר לי. 🌹`,
    ],
    arabic: [
      `{name} العزيز/ة، آمل أن تكون في أوج صحتك وازدهارك. أتواصل معك لأعبّر عن مدى تقديري لعلاقتنا وللتأكد من أنها تظل دافئة وقوية دائماً. 🌹`,
      `حضرة {name} المحترم/ة، يسعدني دائماً التواصل مع شخص من مستواك الرفيع. أرجو أن تجلب لك الحياة الفرح والنجاح اللذين تستحقهما. بأعمق التقدير. 🌹`,
      `{name}، أجد نفسي أفكر فيك بإعجاب وامتنان. أردت التأكد من أنك تعلم/ين مدى قيمة علاقتنا عندي. 🌹`,
    ],
  },
}

export function getAISuggestions(ctx: AISuggestionsContext): string[] {
  const tone = resolveTone(ctx.tone)
  const lang = resolveLang(ctx.language)
  const firstName = ctx.contactName.split(' ')[0]
  const holidayName = ctx.holiday?.name ?? ''

  const pool = ctx.holiday ? HOLIDAY_SUGGESTIONS : GENERIC_SUGGESTIONS
  return pool[tone][lang].map(template => fill(template, firstName, holidayName))
}
