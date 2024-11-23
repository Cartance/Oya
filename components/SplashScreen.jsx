import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

const SplashScreen = ({ onPress }) => {
  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <View className="items-center space-y-8">
        {/* Logo or App Icon */}
        <Image
          source={require("../assets/splash.png")}
          className="w-48 h-48"
          resizeMode="contain"
        />

        {/* App Title */}
        <Text className="text-3xl font-bold text-gray-800 font-bolota">
          Your App Name
        </Text>

        {/* Welcome Message */}
        <Text className="text-gray-600 text-center text-lg mb-8">
          Welcome to a new way of exploring
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity
          onPress={onPress}
          className="bg-blue-500 px-8 py-4 rounded-full shadow-lg"
        >
          <Text className="text-white text-lg font-bold">Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SplashScreen;
