import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { useFonts } from "expo-font";
import { TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Button } from "react-native";
import NavigationBar from "../components/navigation";

const profile = () => {
  return (
    <View className="flex-1 bg-off">
      <NavigationBar />
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({});
