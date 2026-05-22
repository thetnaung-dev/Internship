import { ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ExerciseCard from "../components/ExerciseCard";
import ExerciseCategory from "../components/ExerciseCategory";

export default function ExerciseScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Exercises</Text>

          <Text className="text-gray-500 mt-2">
            Stay healthy with daily exercise routines
          </Text>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
        >
          <ExerciseCategory title="All" active />

          <ExerciseCategory title="Yoga" />

          <ExerciseCategory title="Cardio" />

          <ExerciseCategory title="Stretching" />
        </ScrollView>

        {/* Exercises */}
        <ExerciseCard
          title="Morning Stretch"
          duration="10 mins"
          level="Beginner"
        />

        <ExerciseCard
          title="Cardio Burn"
          duration="20 mins"
          level="Intermediate"
        />

        <ExerciseCard title="Yoga Relax" duration="15 mins" level="Easy" />
      </ScrollView>
    </SafeAreaView>
  );
}
