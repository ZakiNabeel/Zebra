export type Lang = "en" | "ur";

/**
 * UI strings. Keep keys flat and stable — Urdu copy needs a human review pass
 * before pilot (tracked in the sprint doc).
 */
const en = {
  appName: "Zebra",
  tagline: "Safe stories & learning for kids",
  heroLine: "Stories, spellings, maths and good morals — in Urdu and English.",
  getStarted: "Get Started",
  kidMode: "Kid Mode",
  forParents: "For Parents",
  language: "اردو",

  // Onboarding
  obWelcome: "Welcome to Zebra!",
  obFamilyName: "What should we call your family?",
  obFamilyPlaceholder: "e.g. The Ahmed Family",
  obPickLanguage: "App language",
  obSetPin: "Set your parent PIN",
  obPinHint: "4 digits. Kids will need this PIN to leave Kid Mode — don't share it!",
  obConfirmPin: "Enter the PIN again to confirm",
  obPinMismatch: "PINs don't match — try again",
  obFirstChild: "Add your first child",
  obChildName: "Child's name (or nickname)",
  obAgeBand: "Age",
  obStoryLanguage: "Story language",
  obFinish: "All set — let's go!",
  next: "Next",
  back: "Back",

  // Age bands
  band35: "3–5 years",
  band68: "6–8 years",
  band912: "9–12 years",
  english: "English",
  urdu: "Urdu",

  // Parental gate
  gateTitle: "Parents only",
  gateAsk: "Enter your PIN to continue",
  gateWrong: "That PIN isn't right",
  cancel: "Cancel",

  // Parent dashboard
  pdTitle: "Parent Dashboard",
  pdChildren: "Children",
  pdAddChild: "Add child",
  pdNoChildren: "No child profiles yet — add one to unlock Kid Mode.",
  pdLibrary: "Library",
  pdLibraryCount: "stories ready to read",
  pdComingSoon: "Coming next",
  pdSoonCreate: "Create a personalized AI story (with your approval gate)",
  pdSoonAudio: "Audio narration in Urdu & English",
  pdSoonGames: "Spelling & maths games",
  pdLock: "Lock & exit",
  delete: "Remove",
  save: "Save",

  // Kid mode
  kidWho: "Who is reading today?",
  kidHello: "Hello",
  kidPickStory: "Pick a story!",
  kidNoStories: "No stories for this profile yet.",
  kidExit: "Exit",
  kidTheEnd: "The End!",
  kidGreatJob: "Great job reading!",
  kidReadAgain: "Read again",
  kidAllStories: "All stories",

  // Themes
  themeSharing: "Sharing",
  themeHonesty: "Honesty",
  themeCounting: "Counting",

  // Auth (cloud mode)
  email: "Email",
  password: "Password",
  signIn: "Sign in",
  signOut: "Sign out",
  createAccount: "Create your account",
  obAccount: "First, create your parent account",
  haveAccount: "Already have an account?",
  needAccount: "New to Zebra?",
  authError: "Couldn't do that — check your email and password",
  weakPassword: "Password must be at least 6 characters",
  confirmEmail: "Almost there! Check your email to confirm, then sign in.",
  loading: "Please wait…",
} as const;

export type UiKey = keyof typeof en;

const ur: Record<UiKey, string> = {
  appName: "زیبرا",
  tagline: "بچوں کے لیے محفوظ کہانیاں اور تعلیم",
  heroLine: "کہانیاں، ہجے، حساب اور اچھے اخلاق — اردو اور انگریزی میں۔",
  getStarted: "شروع کریں",
  kidMode: "بچوں کا حصہ",
  forParents: "والدین کے لیے",
  language: "English",

  obWelcome: "زیبرا میں خوش آمدید!",
  obFamilyName: "آپ کی فیملی کا نام کیا رکھیں؟",
  obFamilyPlaceholder: "مثلاً احمد فیملی",
  obPickLanguage: "ایپ کی زبان",
  obSetPin: "اپنا والدین والا پن سیٹ کریں",
  obPinHint: "4 ہندسے۔ بچوں کے حصے سے نکلنے کے لیے یہی پن چاہیے ہوگا — کسی کو نہ بتائیں!",
  obConfirmPin: "تصدیق کے لیے پن دوبارہ لکھیں",
  obPinMismatch: "پن ایک جیسے نہیں — دوبارہ کوشش کریں",
  obFirstChild: "اپنا پہلا بچہ شامل کریں",
  obChildName: "بچے کا نام",
  obAgeBand: "عمر",
  obStoryLanguage: "کہانی کی زبان",
  obFinish: "سب تیار — چلیں!",
  next: "آگے",
  back: "پیچھے",

  band35: "3 سے 5 سال",
  band68: "6 سے 8 سال",
  band912: "9 سے 12 سال",
  english: "انگریزی",
  urdu: "اردو",

  gateTitle: "صرف والدین کے لیے",
  gateAsk: "آگے بڑھنے کے لیے اپنا پن لکھیں",
  gateWrong: "یہ پن درست نہیں",
  cancel: "منسوخ",

  pdTitle: "والدین کا ڈیش بورڈ",
  pdChildren: "بچے",
  pdAddChild: "بچہ شامل کریں",
  pdNoChildren: "ابھی کوئی پروفائل نہیں — بچوں کا حصہ کھولنے کے لیے ایک شامل کریں۔",
  pdLibrary: "لائبریری",
  pdLibraryCount: "کہانیاں پڑھنے کے لیے تیار",
  pdComingSoon: "آگے کیا آرہا ہے",
  pdSoonCreate: "اپنے بچے کے لیے ذاتی AI کہانی (آپ کی منظوری کے بعد)",
  pdSoonAudio: "اردو اور انگریزی میں آواز کے ساتھ کہانیاں",
  pdSoonGames: "ہجے اور حساب کے کھیل",
  pdLock: "بند کر کے باہر جائیں",
  delete: "حذف کریں",
  save: "محفوظ کریں",

  kidWho: "آج کون پڑھے گا؟",
  kidHello: "السلام علیکم",
  kidPickStory: "کوئی کہانی چنو!",
  kidNoStories: "اس پروفائل کے لیے ابھی کہانیاں نہیں۔",
  kidExit: "باہر",
  kidTheEnd: "ختم شد!",
  kidGreatJob: "واہ! بہت خوب پڑھا!",
  kidReadAgain: "دوبارہ پڑھو",
  kidAllStories: "ساری کہانیاں",

  themeSharing: "بانٹنا",
  themeHonesty: "سچائی",
  themeCounting: "گنتی",

  email: "ای میل",
  password: "پاس ورڈ",
  signIn: "سائن اِن",
  signOut: "سائن آؤٹ",
  createAccount: "اپنا اکاؤنٹ بنائیں",
  obAccount: "پہلے، اپنا والدین اکاؤنٹ بنائیں",
  haveAccount: "پہلے سے اکاؤنٹ ہے؟",
  needAccount: "زیبرا پر نئے ہیں؟",
  authError: "نہیں ہو سکا — اپنا ای میل اور پاس ورڈ دیکھیں",
  weakPassword: "پاس ورڈ کم از کم 6 حروف کا ہو",
  confirmEmail: "بس تھوڑا سا باقی! تصدیق کے لیے اپنا ای میل دیکھیں، پھر سائن اِن کریں۔",
  loading: "انتظار کریں…",
};

export const dictionaries: Record<Lang, Record<UiKey, string>> = { en, ur };
