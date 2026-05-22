// src/services/localization.ts
import * as Localization from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      emergencyTitle: "SOS",
      callingIn: "Calling in {{count}}...",
      holdInstructions: "Hold 3 seconds",
      healthNews: "Health News",
      latestUpdates: "Latest healthcare updates",
      healthFeatures: "Health Features",
      exploreTools: "Explore healthcare tools",
      traditionalMed: "Traditional Medicine",
      exploreMyanmarMed: "Explore Myanmar traditional medicine",
      fetchingUpdates: "Fetching live updates...",
      loadError: "Could not load live updates at this moment.",
      tabHome: "Home",
      tabChat: "AI Chat",
      tabMap: "Map",
      tabExercise: "Workout",
      tabMedicine: "Medicine",
    },
  },
  my: {
    translation: {
      emergencyTitle: "အရေးပေါ်",
      callingIn: "{{count}} စက္ကန့်အတွင်း ခေါ်ဆိုမည်...",
      holdInstructions: "၃ စက္ကန့် ဖိထားပါ",
      healthNews: "ကျန်းမာရေးသတင်း",
      latestUpdates: "နောက်ဆုံးရ ကျန်းမာရေးစောင့်ရှောက်မှုသတင်းများ",
      healthFeatures: "ကျန်းမာရေးကဏ္ဍများ",
      exploreTools: "ကျန်းမာရေးကိရိယာများကို လေ့လာပါ",
      traditionalMed: "တိုင်းရင်းဆေးပညာ",
      exploreMyanmarMed: "မြန်မာ့ရိုးရာ တိုင်းရင်းဆေးပညာများကို လေ့လာပါ",
      fetchingUpdates: "သတင်းအသစ်များကို ရယူနေသည်...",
      loadError: "ယခုအချိန်တွင် သတင်းအသစ်များကို မရယူနိုင်သေးပါ။",
      tabHome: "ပင်မစာမျက်နှာ",
      tabChat: "မေးမြန်းရန်",
      tabMap: "မြေပုံ",
      tabExercise: "လေ့ကျင့်ခန်း",
      tabMedicine: "ဆေးညွန်း",
    },
  },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: Localization.getLocales()[0].languageCode ?? "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const i18n = i18next;
