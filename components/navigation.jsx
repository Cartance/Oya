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
    <View className="flex-row items-center w-full px-3 mt-10">
      <TouchableOpacity
        style={selectedTab === 3}
        onPress={() => setSelectedTab(3)}
        className="justify-center items-center w-18 h-18 p-1"
      >
        <Image
          className="w-14 h-14 mr-1.5"
          source={require("../assets/images/MomoIconCapstoneFYP5.png")}
        />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="my-5"
      >
        <TouchableOpacity
          style={selectedTab === 0}
          onPress={() => setSelectedTab(0)}
          className="bg-DDD3 flex-grow h-12 rounded-full mx-2 my-1 "
        >
          <Text className="text-white text-2xl mx-5 mt-2" style={styles.button}>
            Planning
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selectedTab === 1}
          onPress={() => setSelectedTab(1)}
          className="bg-DDD2 flex-grow h-12 items-center justify-center rounded-full mx-2 my-1"
        >
          <Text
            className="text-white font-bolota text-2xl mx-5 mt-0"
            style={styles.button}
          >
            News
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selectedTab === 2}
          onPress={() => setSelectedTab(2)}
          className="bg-DDD4 flex-grow h-12 items-center justify-center rounded-full mx-2 my-1"
        >
          <Text className="text-white text-2xl mx-5 mt-0" style={styles.button}>
            Exchange
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default NavigationBar;

const styles = StyleSheet.create({
  button: {
    fontFamily: "bolota",
  },
});
