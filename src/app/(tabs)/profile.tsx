import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  return (
    <SafeAreaView>
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-bold">Profile Screen</Text>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
