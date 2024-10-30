import { Text, View } from "react-native";
import { useFonts } from "expo-font";
import { TouchableOpacity, ScrollView } from "react-native";
import NavigationBar from "../components/navigation";
import React, { useState } from "react";

export default function App() {
  const [fontsLoaded, error] = useFonts({
    bolota: require("../assets/fonts/bolota-bold.ttf"),
  });

  const [selectedTab, setSelectedTab] = useState(0);

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <Text>Home Content</Text>;
      case 1:
        return <Text>Profile Content</Text>;
      case 2:
        return <Text>Settings Content</Text>;
      case 3:
        return <Text>About Content</Text>;
      default:
        return <Text>Home Content</Text>;
    }
  };

  return (
    <View className="flex-1 bg-off">
      <NavigationBar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <View>{renderTabContent()}</View>
    </View>
  );
}
