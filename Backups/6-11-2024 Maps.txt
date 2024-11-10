import React, { useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useContext } from "react";
import { UserLocationContext } from "./UserLocationContext";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const ExpandableMapWithSearch = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const animation = useRef(new Animated.Value(300)).current;
  const mapRef = useRef(null);
  const { location, setLocation } = useContext(UserLocationContext);

  const handleExpand = () => {
    if (!isExpanded) {
      Animated.spring(animation, {
        toValue: Dimensions.get("window").height * 0.89,
        useNativeDriver: false,
        friction: 7,
        tension: 40,
      }).start();
      setIsExpanded(true);
    }
  };

  const handleCollapse = () => {
    Animated.spring(animation, {
      toValue: 300,
      useNativeDriver: false,
      friction: 7,
      tension: 40,
    }).start(() => {
      setIsExpanded(false);
    });
  };

  const handleSearch = () => {
    const demoResults = [
      {
        id: 1,
        title: "Golden Gate Bridge",
        coordinate: { latitude: 37.8199, longitude: -122.4783 },
      },
      {
        id: 2,
        title: "Alcatraz Island",
        coordinate: { latitude: 37.8267, longitude: -122.4233 },
      },
      {
        id: 3,
        title: "Fisherman's Wharf",
        coordinate: { latitude: 37.808, longitude: -122.4203 },
      },
    ];
    setSearchResults(demoResults);
  };

  const handleResultPress = (result) => {
    mapRef.current.animateToRegion(
      {
        ...result.coordinate,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      1000
    );
  };

  const containerStyle = {
    height: animation,
  };

  return (
    <View>
      <View style={styles.wrapper}>
        {isExpanded && (
          <TouchableWithoutFeedback onPress={handleCollapse}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          onPress={!isExpanded ? handleExpand : null}
          activeOpacity={1}
          style={styles.container}
        >
          <Animated.View style={[styles.mapContainer, containerStyle]}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={true}
            >
              {searchResults.map((result) => (
                <Marker
                  key={result.id}
                  coordinate={result.coordinate}
                  title={result.title}
                  onPress={() => handleResultPress(result)}
                />
              ))}
            </MapView>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? -40 : 20,
    marginHorizontal: 10,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 16,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    shadowColor: "#000",
    top: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    width: "92%",
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    width: "101%",
    overflow: "hidden",
    borderRadius: 25,
    marginTop: 5,
    marginLeft: 35,
    bottom: 50,
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ExpandableMapWithSearch;
