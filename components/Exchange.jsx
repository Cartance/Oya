import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { EXCHANGE_KEY } from "@env";

const CurrencyExchangeApp = () => {
  // Existing state
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectingCurrency, setSelectingCurrency] = useState("from");
  const [searchQuery, setSearchQuery] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Start entrance animation when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const popularCurrencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "CNY", name: "Chinese Yuan" },
  ];

  const fetchExchangeRate = async () => {
    animateButtonPress();
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.wise.com/v1/rates?source=${fromCurrency}&target=${toCurrency}`,
        {
          headers: {
            Authorization: `Bearer ${EXCHANGE_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.length > 0) {
        setExchangeRate(data[0].rate);
      } else {
        console.error("No rates available for the selected currencies.");
        setExchangeRate(null);
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const openCurrencyModal = (type) => {
    setSelectingCurrency(type);
    setShowCurrencyModal(true);
    setSearchQuery("");
  };

  const selectCurrency = (currencyCode) => {
    if (selectingCurrency === "from") {
      setFromCurrency(currencyCode);
    } else {
      setToCurrency(currencyCode);
    }
    setShowCurrencyModal(false);
  };

  const filteredCurrencies = popularCurrencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateExchangeAmount = () => {
    if (!exchangeRate || !amount) return "0.00";
    return (parseFloat(amount) * exchangeRate).toFixed(2);
  };

  const CurrencySelector = ({ type, currency }) => (
    <TouchableOpacity
      style={styles.currencySelector}
      onPress={() => openCurrencyModal(type)}
    >
      <Text style={styles.currencyCode}>{currency}</Text>
      <Ionicons name="chevron-down" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Currency Exchange</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>You send</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
            />
            <CurrencySelector type="from" currency={fromCurrency} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>They receive</Text>
          <View style={styles.row}>
            <Text style={styles.convertedAmount}>
              {isLoading ? "..." : calculateExchangeAmount()}
            </Text>
            <CurrencySelector type="to" currency={toCurrency} />
          </View>
        </View>

        {exchangeRate && (
          <Text style={styles.rateText}>
            1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
          </Text>
        )}
      </Animated.View>

      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: buttonScaleAnim }],
          },
        ]}
      ></Animated.View>

      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity
                onPress={() => setShowCurrencyModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search currencies..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredCurrencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.currencyItem}
                  onPress={() => selectCurrency(item.code)}
                >
                  <Text style={styles.currencyItemCode}>{item.code}</Text>
                  <Text style={styles.currencyItemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "bolota",
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    padding: 8,
  },
  convertedAmount: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    padding: 8,
    color: "#666",
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  rateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  button: {
    margin: 16,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    fontSize: 16,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  currencyItemCode: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 12,
    width: 60,
  },
  currencyItemName: {
    fontSize: 16,
    color: "#666",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CurrencyExchangeApp;
