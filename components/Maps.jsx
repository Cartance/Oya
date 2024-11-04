import "react-native-get-random-values";
import { View, Text, StyleSheet } from "react-native";
import React from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const Maps = () => {
  return (
    <View className="bottom-9">
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 35.689814231246245,
          longitude: 139.69296542486626,
          latitudeDelta: 0.0422,
          longitudeDelta: 0.0521,
        }}
      />

      <View style={styles.container}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          onPress={(data, details = null) => {
            console.log(data, details);
          }}
          query={{
            key: process.env.GOOGLE_API_KEY, // Use environment variable
            language: "en",
          }}
          styles={{
            textInputContainer: {
              borderRadius: 20,
            },
            textInput: {
              borderRadius: 20,
            },
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "visible",
    borderRadius: 25,
    position: "absolute",
    bottom: 243.5,
    left: 0,
    right: 2,
    marginHorizontal: 25,
  },
  map: {
    marginHorizontal: 16,
    width: "91.5%",
    height: 300,
    borderRadius: 20,
  },
});

export default Maps;
