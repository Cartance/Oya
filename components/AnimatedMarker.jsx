import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Marker } from "react-native-maps";

const AnimatedMarker = ({ coordinate, title, pinColor, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Add a small delay for each marker based on its index
    const delay = index * 150;

    Animated.sequence([
      // Wait for the delay
      Animated.delay(delay),
      // Then do the pop-up animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Marker coordinate={coordinate} title={title}>
      <Animated.View
        style={{
          transform: [
            {
              scale: scaleAnim,
            },
          ],
        }}
      >
        <Animated.View
          style={{
            width: 30,
            height: 30,
            backgroundColor: pinColor,
            borderRadius: 15,
            borderWidth: 2,
            borderColor: "white",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        />
      </Animated.View>
    </Marker>
  );
};

export default AnimatedMarker;
