import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

const NYT_API_KEY = 'LgJjoRLiG2OafnBB7475ZBHfhAAl1uet'; // NYT Developer Portal'dan al
const query = 'artificial intelligence';

const NewsScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const res = await fetch(
        `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${NYT_API_KEY}`
      );
      const json = await res.json();
      setArticles(json.response.docs);
    } catch (err) {
      console.error('NYT API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={{ padding: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>{item.headline.main}</Text>
          <Text>{item.snippet}</Text>
        </View>
      )}
    />
  );
};

export default NewsScreen;
