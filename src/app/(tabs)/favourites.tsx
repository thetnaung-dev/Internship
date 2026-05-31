import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Favourites = () => {
  return (
    <SafeAreaView>
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-bold">Favourites Screen</Text>
      </View>
    </SafeAreaView>
  );
};

export default Favourites;
