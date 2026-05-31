// import { useLanguageStore } from "@/store/useLanguageStore";
// import { router } from "expo-router";
// import React from "react";
// import { useTranslation } from "react-i18next";
// import { Text, TouchableOpacity, View } from "react-native";

// export default function LanguageScreen() {
//   const { t } = useTranslation();
//   const setLanguage = useLanguageStore((s) => s.setLanguage);

//   const chooseLanguage = async (lang: "en" | "mm") => {
//     await setLanguage(lang);
//     console.log("Language set to:", lang);
//     // Securely routes to the onboarding sequence index
//     router.replace("/(onboarding)");
//   };

//   return (
//     <View className="flex-1 items-center justify-center bg-white px-6">
//       <Text className="mb-10 text-3xl font-bold">{t("chooseLanguage")}</Text>

//       <TouchableOpacity
//         onPress={() => chooseLanguage("en")}
//         className="mb-5 w-full rounded-2xl bg-black p-5 active:opacity-90"
//       >
//         <Text className="text-center text-lg font-semibold text-white">
//           {t("english")}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         onPress={() => chooseLanguage("mm")}
//         className="w-full rounded-2xl bg-green-600 p-5 active:opacity-90"
//       >
//         <Text className="text-center text-lg font-semibold text-white">
//           {t("myanmar")}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export default function OnboardingScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Structural Hero Banner Section */}
      <View className="flex-[6] bg-slate-900 justify-end px-6 pb-16">
        <View className="bg-amber-500 self-start px-3 py-1 rounded-full mb-4">
          <Text className="text-xs font-bold text-slate-900 uppercase tracking-widest">
            Premium
          </Text>
        </View>

        <Text className="text-white text-4xl font-black tracking-tight mb-4">
          {t("findDreamHome")}
        </Text>

        <Text className="text-slate-300 text-base leading-6 font-medium">
          {t("onboardingSubtitle")}
        </Text>
      </View>

      {/* Bottom Functional Interaction Wrapper */}
      <View className="flex-[3] justify-center px-6 bg-slate-50">
        <TouchableOpacity
          // Fixed relative navigation path error to absolute format
          onPress={() => router.replace("/(tabs)")}
          className="w-full bg-slate-900 py-5 rounded-2xl active:opacity-90 shadow-lg"
        >
          <Text className="text-center text-white text-lg font-bold">
            {t("getStarted")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
