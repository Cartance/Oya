import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { useFonts } from "expo-font";
import { TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Button } from "react-native";

const NavigationBar = ({ selectedTab, setSelectedTab }) => {
  return (
    <View className="flex-row items-center w-full px-3 mt-1">
      <TouchableOpacity className="justify-center items-center w-18 h-18 p-1">
        <Image
          className="w-14 h-14 mr-1.5"
          source={require("../assets/images/Logo.png")}
        />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="my-14"
      >
        <TouchableOpacity
          style={selectedTab === 0}
          onPress={() => setSelectedTab(0)}
          className="bg-satin flex-grow h-12 items-center justify-center rounded-full mx-2 my-1"
        >
          <Text className="text-white font-bolota text-2xl mx-5 mt-1">
            Planning
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selectedTab === 1}
          onPress={() => setSelectedTab(1)}
          className="bg-mustard flex-grow h-12 items-center justify-center rounded-full mx-2 my-1"
        >
          <Text className="text-white font-bolota text-2xl mx-5 mt-1">
            News
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selectedTab === 2}
          onPress={() => setSelectedTab(2)}
          className="bg-violetBlue flex-grow h-12 items-center justify-center rounded-full mx-2 my-1"
        >
          <Text className="text-white font-bolota text-2xl mx-5 mt-1">
            Profile
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default NavigationBar;
