// // src/features/home/services/newsService.ts
// import axios from "axios";
// import { Article } from "../types/new";

// const NEWS_URLS: Record<string, string> = {
//   en: "https://saurav.tech/NewsAPI/top-headlines/category/health/us.json",
//   my: "https://saurav.tech/NewsAPI/top-headlines/category/health/in.json", // closest available region
// };

// export const fetchHealthNewsData = async (
//   locale: string,
// ): Promise<Article[]> => {
//   try {
//     const url = NEWS_URLS[locale] ?? NEWS_URLS.en;
//     const response = await axios.get(url);
//     if (response && response.data && response.data.articles) {
//       return response.data.articles.slice(0, 8).map((art: any) => ({
//         title: art.title || "No Title Available",
//         description:
//           art.description || "Tap to read more about this health update.",
//         url: art.url || "",
//         sourceName: art.source?.name || "Health Update",
//         imageUrl: art.urlToImage || "",
//         publishedAt: art.publishedAt ? art.publishedAt : "",
//       }));
//     }
//     return [];
//   } catch (error) {
//     console.error("Failed to fetch news updates in newsService:", error);
//     throw error;
//   }
// };

// src/features/home/services/newsService.ts
import axios from "axios";
import { Article } from "../types/new";

// 1. Local Mock Data for Myanmar Health News (100% Free, No Key, Instant Load)
const MYANMAR_MOCK_NEWS = [
  {
    title:
      "နွေရာသီကာလအတွင်း အပူဒဏ်အန္တရာယ်မှ ကာကွယ်ရန် ကျန်းမာရေးသတိပေးချက်များ",
    description:
      "အပူရှိန်ပြင်းထန်သော နွေရာသီတွင် ရေဓာတ်ခမ်းခြောက်မှုနှင့် အပူလျှပ်ခြင်း (Heatstroke) မဖြစ်စေရန် ဂရုပြုရမည့် အချက်များ။",
    url: "https://mohs.gov.mm",
    sourceName: "Ministry of Health MM",
    imageUrl: "https://picsum.photos/id/102/400/250",
    publishedAt: "2026-05-22T00:00:00Z",
  },
  {
    title:
      "နေ့စဉ်ကိုယ်လက်လှုပ်ရှားမှု ပြုလုပ်ခြင်းဖြင့် နှလုံးရောဂါဖြစ်ပွားမှုကို လျှော့ချနိုင်ပုံ",
    description:
      "တစ်နေ့လျှင် မိနစ် ၃၀ ခန့် လမ်းသွက်သွက်လျှောက်ပေးရုံဖြင့် ရရှိနိုင်မည့် ကျန်းမာရေးအကျိုးကျေးဇူးများ။",
    url: "https://example.com/health/fitness",
    sourceName: "Health Digest MM",
    imageUrl: "https://picsum.photos/id/152/400/250",
    publishedAt: "2026-05-21T08:30:00Z",
  },
  {
    title:
      "ဆီးချိုရောဂါရှင်များအတွက် အစားအသောက်နှင့် လူနေမှုပုံစံ ပြုပြင်ပြောင်းလဲခြင်း",
    description:
      "သွေးတွင်းသကြားဓာတ်ကို သဘာဝအတိုင်း ထိန်းညှိပေးနိုင်မည့် အစားအစာများနှင့် ရှောင်ကြဉ်ရမည့်အရာများ။",
    url: "https://example.com/health/diabetes",
    sourceName: "Myanmar Medical Journal",
    imageUrl: "https://picsum.photos/id/493/400/250",
    publishedAt: "2026-05-20T04:15:00Z",
  },
];

const NEWS_URLS: Record<string, string> = {
  // Free open-source endpoint for US Health News (No Key required)
  en: "https://saurav.tech/NewsAPI/top-headlines/category/health/us.json",
};

export const fetchHealthNewsData = async (
  locale: string,
): Promise<Article[]> => {
  try {
    // 2. Serve Local Mock Data instantly if the locale is Myanmar ('my')
    if (locale === "my") {
      return MYANMAR_MOCK_NEWS.slice(0, 8).map((art) => ({
        title: art.title || "No Title Available",
        description: art.description || "ဖတ်ရှုရန် နှိပ်ပါ။",
        url: art.url || "",
        sourceName: art.sourceName || "Health Update",
        imageUrl: art.imageUrl || "",
        publishedAt: art.publishedAt || "",
      }));
    }

    // 3. Fallback to free live API processing for English ('en')
    const url = NEWS_URLS[locale] ?? NEWS_URLS.en;
    const response = await axios.get(url);

    if (response && response.data && response.data.articles) {
      return response.data.articles.slice(0, 8).map((art: any) => ({
        title: art.title || "No Title Available",
        description:
          art.description || "Tap to read more about this health update.",
        url: art.url || "",
        sourceName: art.source?.name || "Health Update",
        imageUrl: art.urlToImage || "",
        publishedAt: art.publishedAt ? art.publishedAt : "",
      }));
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch news updates in newsService:", error);
    throw error;
  }
};
