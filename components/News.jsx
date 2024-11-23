import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import axios from "axios";
import { NEWS_KEY } from "@env";

const { width } = Dimensions.get("window");

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_KEY}`;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(NEWS_API_URL);
        setNews(response.data.articles);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trending News</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          {news.map((article, index) => (
            <View key={index} style={styles.card}>
              {article.urlToImage ? (
                <Image
                  source={{ uri: article.urlToImage }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.placeholder} />
              )}
              <Text style={styles.title} numberOfLines={2}>
                {article.title}
              </Text>
              <Text style={styles.source}>Source: {article.source.name}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  loader: {
    marginTop: 50,
  },
  scrollContainer: {
    flexDirection: "row",
  },
  card: {
    width: width * 0.7,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 150,
  },
  placeholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#e0e0e0",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    color: "#333",
  },
  source: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingBottom: 10,
    color: "#666",
  },
});
