import { Text, View } from "react-native";
import { useFonts } from "expo-font";
import { TouchableOpacity, ScrollView } from "react-native";
import NavigationBar from "../components/navigation";
import React, { useState } from "react";
import Maps from "../components/Maps";
import * as Location from "expo-location";
import { useEffect } from "react";
import { UserLocationContext } from "../components/UserLocationContext";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [fontsLoaded, error] = useFonts({
    bolota: require("../assets/fonts/bolota-bold.ttf"),
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const [selectedTab, setSelectedTab] = useState(0);

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <Text>Planning</Text>;
      case 1:
        return <Text>News</Text>;
      case 2:
        return <Text>Profile</Text>;
      case 3:
        return <Maps />; //logo button
      default:
        return <Text>Home Content</Text>;
    }
  };

  return (
    <UserLocationContext.Provider value={{ location, setLocation }}>
      <View className="flex-1 bg-off">
        <NavigationBar
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          className="font-bolota"
        />
        <View>{renderTabContent()}</View>
      </View>
    </UserLocationContext.Provider>
  );
}
