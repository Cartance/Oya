// App.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NEWSDATA_KEY } from "@env";
import NewsPage from "./NewsPage";
import { useNavigation } from "@react-navigation/native"; // Changed this line
import { useFonts } from "expo-font";

const API_URL = "https://newsdata.io/api/1/news";

const categories = [
  { id: "business", label: "Business" },
  { id: "technology", label: "Technology" },
  { id: "entertainment", label: "Entertainment" },
  { id: "sports", label: "Sports" },
  { id: "science", label: "Science" },
  { id: "health", label: "Health" },
];

export default function App() {
  const navigation = useNavigation(); // Add this line
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("top");
  const [topNews, setTopNews] = useState([]);

  const fetchNews = async (category = selectedCategory) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}?apikey=${NEWSDATA_KEY}&language=en&country=jp&category=${category}`
      );
      const data = await response.json();

      if (data.status === "success") {
        if (category === "top") {
          setTopNews(data.results);
        }
        setNews(data.results);
        setError(null);
      } else {
        setError("Failed to fetch news");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews("top");
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchNews(categoryId);
  };

  const NewsCard = ({ article, horizontal = false }) => {
    const defaultImage = "https://via.placeholder.com/300x200";
    const cardStyle = horizontal ? styles.horizontalCard : styles.verticalCard;

    return (
      <TouchableOpacity
        style={[styles.card, cardStyle]}
        onPress={() => navigation.navigate("NewsDetail", { news: article })}
      >
        <Image
          source={{ uri: article.image_url || defaultImage }}
          style={horizontal ? styles.horizontalImage : styles.verticalImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {article.description}
          </Text>
          <View style={styles.sourceContainer}>
            <Text style={styles.source}>{article.source_id}</Text>
            <Text style={styles.date}>
              {new Date(article.pubDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const CategorySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategory,
          ]}
          onPress={() => handleCategoryPress(category.id)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        <View style={{ marginTop: -20 }}>
          <Text style={styles.sectionTitle}>Top Stories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {topNews.map((article, index) => (
              <NewsCard key={index} article={article} horizontal={true} />
            ))}
          </ScrollView>
        </View>
        {/* Category Selector */}
        <Text style={styles.sectionTitle2}>Categories</Text>
        <CategorySelector />

        {/* Category News Vertical ScrollView */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.verticalScrollContent}
          >
            {news.map((article, index) => (
              <NewsCard key={index} article={article} horizontal={false} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    zIndex: 2,
    fontSize: 30,
    fontFamily: "bolota",
    color: "#333",
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle2: {
    zIndex: 2,
    fontSize: 30,
    fontFamily: "bolota",
    color: "#333",
    paddingTop: 8,
    paddingLeft: 20,
  },
  horizontalScrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  verticalScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  horizontalCard: {
    width: windowWidth * 0.8,
    marginRight: 16,
  },
  verticalCard: {
    width: "100%",
    marginBottom: 16,
  },
  horizontalImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  verticalImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  source: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  categoryContainer: {
    paddingVertical: 12,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: "#0066cc",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  error: {
    fontSize: 16,
    color: "red",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#0000ff",
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    top: 30,
  },
});
