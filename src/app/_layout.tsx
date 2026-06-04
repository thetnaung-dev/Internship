// import "../../global.css";

// import { Stack } from "expo-router";

// import { GestureHandlerRootView } from "react-native-gesture-handler";

// import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <BottomSheetModalProvider>
//         <Stack screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="index" />
//         </Stack>
//       </BottomSheetModalProvider>
//     </GestureHandlerRootView>
//   );
// }
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";

// Load your language storage configurations
import i18n from "@/lib/i18n"; // Ensure this matches your project's i18next entry path
import { useLanguageStore } from "@/store/useLanguageStore";

export default function RootLayout() {
  const language = useLanguageStore((s) => s.language);
  useEffect(() => {
    if (i18n && typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(language || "mm");
    }
  }, [language]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="chat" />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
