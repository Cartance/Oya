import { StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import your components
import GooglePlacesMap from "../components/Maps";
import PlaceDetails from "../components/MapDetails";
import News from "../components/News";
import NewsDetail from "../components/NewsPage";
import NavigationBar from "../components/navigation";
import Exchange from "../components/Exchange";
import Index from "./index";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

const _layout = () => {
  const [fontsLoaded, error] = useFonts({
    bolota: require("../assets/fonts/bolota-bold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Home Screen */}
        <Stack.Screen name="Home" component={Index} />

        {/* Map Stack */}
        <Stack.Screen name="Map" component={GooglePlacesMap} />
        <Stack.Screen
          name="Details"
          component={PlaceDetails}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitleVisible: false,
            headerTransparent: true,
            headerTintColor: "#000",
          }}
        />

        {/* News Stack */}
        <Stack.Screen name="News" component={News} />
        <Stack.Screen
          name="NewsDetail"
          component={NewsDetail}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitleVisible: false,
            headerTransparent: true,
            headerTintColor: "#000",
          }}
        />

        {/* Exchange Screen */}
        <Stack.Screen name="Exchange" component={Exchange} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default _layout;
