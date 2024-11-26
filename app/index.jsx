import { Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useFonts } from "expo-font";
import NavigationBar from "../components/navigation";
import React, { useState, useEffect } from "react";
import Maps from "../components/Maps";
import * as Location from "expo-location";
import { UserLocationContext } from "../components/UserLocationContext";
import NewsPage from "../components/News";

const SplashScreenComponent = ({ onPress }) => {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Image
        source={require("../assets/splash.png")}
        className="w-64 h-64 mb-4"
        resizeMode="contain"
      />
      <TouchableOpacity
        onPress={onPress}
        className="bg-blue-500 px-8 py-4 rounded-full"
      >
        <Text className="text-white text-lg font-bold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
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

  const handleSplashButtonPress = () => {
    setShowSplash(false);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <Text>Planning</Text>;
      case 1:
        return (
          <View>
            <NewsPage />
          </View>
        );
      case 2:
        return <Text>Profile</Text>;
      case 3:
        return (
          <View className="absolute top-0 left-0 right-0 bottom-20">
            <Maps />
          </View>
        );
      default:
        return <Text>Home Content</Text>;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return <SplashScreenComponent onPress={handleSplashButtonPress} />;
  }

  return (
    <UserLocationContext.Provider value={{ location, setLocation }}>
      <View className="flex-1">
        {selectedTab === 3 ? (
          <>
            {renderTabContent()}
            <NavigationBar
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              className="font-bolota absolute bottom-0"
            />
          </>
        ) : (
          <>
            <NavigationBar
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              className="font-bolota"
            />
            <ScrollView className="flex-1">
              <View>{renderTabContent()}</View>
            </ScrollView>
          </>
        )}
      </View>
    </UserLocationContext.Provider>
  );
}
