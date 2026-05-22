import ScreenWrapper from "@/components/common/ScreenWrapper";
import EmergencyButton from "@/features/home/components/EmergencyButton";
import HealthNewsCard from "@/features/home/components/HealthNewsCard";
import HomeHeader from "@/features/home/components/HomeHeader";
import { useLanguageStore } from "@/store/useLanguageStore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { fetchHealthNewsData } from "../services/newsService";
import { Article } from "../types/new";

export default function HomeScreen() {
  const { t } = useTranslation();
  const locale = useLanguageStore((state) => state.locale);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const cardColors = ["bg-blue-50", "bg-red-50", "bg-green-50", "bg-purple-50"];

  useEffect(() => {
    let isMounted = true;
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await fetchHealthNewsData(locale);
        if (isMounted) setArticles(data);
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadNews();
    return () => {
      isMounted = false;
    };
  }, [locale]);

  return (
    <ScreenWrapper bg="bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 120,
        }}
      >
        <HomeHeader />

        <View className="items-center my-12">
          <EmergencyButton />
        </View>

        <View className="mb-12">
          <Text className="text-2xl font-bold mb-2">{t("healthNews")}</Text>
          <Text className="text-gray-500 mb-6">{t("latestUpdates")}</Text>

          {loading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="large" color="#0055FF" />
              <Text className="text-gray-400 mt-2 font-medium">
                {t("fetchingUpdates")}
              </Text>
            </View>
          ) : error || articles.length === 0 ? (
            <View className="p-6 bg-gray-50 rounded-2xl items-center">
              <Text className="text-gray-500 text-center">
                {t("loadError")}
              </Text>
            </View>
          ) : (
            articles.map((item, index) => (
              <HealthNewsCard
                key={`${locale}-${index}`}
                title={item.title}
                description={item.description}
                sourceName={item.sourceName}
                imageUrl={item.imageUrl}
                publishedAt={item.publishedAt}
                url={item.url}
                color={cardColors[index % cardColors.length]}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
