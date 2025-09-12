// src/screens/AllNewsScreen.tsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Modal,
    ScrollView,
    RefreshControl,
    SafeAreaView,
    Platform,
    TextInput,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import BaseService from '../api/BaseService';
import { RootStackParamList } from '../types';
import metrics from '../constants/aikuMetric';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Article {
    _id: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
    fullContent?: string;
    source: { name: string };
    author?: string;
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/400x200?text=Haber+Görseli';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AllNewsScreen: React.FC = () => {
    const navigation = useNavigation<Nav>();

    const [articles, setArticles] = useState<Article[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // search states
    const [search, setSearch] = useState('');
    const [fullMap, setFullMap] = useState<Record<string, string>>({});
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const cleanContent = (content?: string) => {
        if (!content) return '';
        let cleaned = content.replace(/\d+\s*chars?/gi, '');
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        cleaned = cleaned.replace(/([.,!?])([^\s])/g, '$1 $2');
        return cleaned;
    };

    const fetchPage = async (p = 1, append = false) => {
        setError(null);
        append ? setLoadingMore(true) : setLoading(true);
        try {
            const res = await BaseService.getNews(p, 10);
            if (res.success) {
                setArticles(prev => (append ? [...prev, ...res.articles] : res.articles));
                setPage(p);
            } else {
                throw new Error(res.message || 'News load failed.');
            }
        } catch (e: any) {
            setError(e.message || 'News load failed.');
        } finally {
            append ? setLoadingMore(false) : setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPage(1, false);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPage(1, false);
    }, []);

    const loadMore = () => {
        if (!loadingMore) fetchPage(page + 1, true);
    };

    const openModalWithContent = async (article: Article) => {
        try {
            const res = await BaseService.getNewsById(article._id);
            if (res.success) {
                setSelectedArticle(res.article);
                setModalVisible(true);
            }
        } catch (e: any) {
            setError(e.message || 'News details failed.');
        }
    };

    // --- SEARCH: lazily fetch missing fullContent for current list with limited concurrency ---
    const ensureFullContent = useCallback(
        async (ids: string[]) => {
            const missing = ids.filter(id => fullMap[id] == null);
            const concurrency = 4;
            for (let i = 0; i < missing.length; i += concurrency) {
                const chunk = missing.slice(i, i + concurrency);
                const resps = await Promise.all(
                    chunk.map(id =>
                        BaseService.getNewsById(id).catch(() => null),
                    ),
                );
                const updates: Record<string, string> = {};
                resps.forEach(r => {
                    if (r && r.success && r.article) {
                        const a = r.article;
                        updates[a._id] = cleanContent(a.fullContent) || cleanContent(a.content) || '';
                    }
                });
                if (Object.keys(updates).length) {
                    setFullMap(prev => ({ ...prev, ...updates }));
                }
            }
        },
        [fullMap],
    );

    // debounce search to avoid excessive calls
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const q = search.trim();
            if (q.length >= 2) {
                // fetch full contents for currently loaded page to allow fullContent search
                ensureFullContent(articles.map(a => a._id));
            }
        }, 350);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search, articles, ensureFullContent]);

    const filteredArticles = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return articles;
        return articles.filter(a => {
            const titleMatch = a.title?.toLowerCase().includes(q);
            const full = fullMap[a._id] || cleanContent(a.fullContent) || cleanContent(a.content) || cleanContent(a.description);
            const fullMatch = full.toLowerCase().includes(q);
            return titleMatch || fullMatch;
        });
    }, [articles, search, fullMap]);

    const renderItem = ({ item }: { item: Article }) => (
        <TouchableOpacity style={styles.newsCard} onPress={() => openModalWithContent(item)}>
            <View style={styles.newsCardContent}>
                <Image
                    source={item.urlToImage ? { uri: item.urlToImage } : { uri: DEFAULT_IMAGE }}
                    style={styles.newsImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.87)', 'rgba(0,0,0,0.45)', 'transparent']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.imageOverlay}
                >
                    <Text style={styles.newsTitle} numberOfLines={2} ellipsizeMode="tail">
                        {item.title || 'Başlık Yok'}
                    </Text>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
            locations={[0, 0.3, 0.6, 0.9]}
            start={{ x: 0, y: 0 }}
            end={{ x: 2, y: 1 }}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                {/* Startups ile aynı geri butonu ve ortalanmış başlık */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#3B82F7" />
                    </TouchableOpacity>
                    <Text style={styles.header}>AI Pulse</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Startups’taki arama barının aynısı */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search news..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* içerik */}
                {loading && !refreshing ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={Colors.lightText} />
                    </View>
                ) : error ? (
                    <View style={styles.center}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={() => fetchPage(1, false)}>
                            <Text style={styles.retryButton}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredArticles}
                        keyExtractor={it => it._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={
                            <View style={{ padding: 24, alignItems: 'center' }}>
                                <Text style={{ color: Colors.lightText, opacity: 0.8 }}>
                                    {search ? 'No results found.' : 'No news found.'}
                                </Text>
                            </View>
                        }
                        ListFooterComponent={
                            loadingMore ? (
                                <ActivityIndicator style={{ marginVertical: 16 }} color={Colors.lightText} />
                            ) : null
                        }
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.lightText} />
                        }
                    />
                )}

                {/* modal */}
                <Modal
                    transparent
                    visible={modalVisible}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <LinearGradient
                            colors={['#1A1E29', '#1A1E29', '#3B82F780', '#3B82F740']}
                            locations={[0, 0.3, 0.6, 0.9]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 2, y: 1 }}
                            style={styles.modalContainer}
                        >
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIconContainer}>
                                <Text style={styles.closeIcon}>✕</Text>
                            </TouchableOpacity>

                            {selectedArticle ? (
                                <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalContentContainer}>
                                    <View style={styles.modalContent}>
                                        <View style={styles.modalImageContainer}>
                                            <Image
                                                source={
                                                    selectedArticle.urlToImage
                                                        ? { uri: selectedArticle.urlToImage }
                                                        : { uri: DEFAULT_IMAGE }
                                                }
                                                style={styles.modalImage}
                                                resizeMode="cover"
                                            />
                                        </View>
                                        <View style={styles.modalTextContainer}>
                                            <Text style={styles.modalTitle}>{selectedArticle.title || ''}</Text>
                                            <Text style={styles.modalSource}>
                                                {selectedArticle.source?.name} •{' '}
                                                {new Date(selectedArticle.publishedAt).toLocaleDateString('en-US')}
                                            </Text>
                                            <Text style={styles.modalAbstract}>
                                                {cleanContent(selectedArticle.fullContent) ||
                                                    cleanContent(selectedArticle.content) ||
                                                    cleanContent(selectedArticle.description) ||
                                                    'No content found.'}
                                            </Text>
                                        </View>
                                    </View>
                                </ScrollView>
                            ) : (
                                <Text style={styles.modalText}>No news selected.</Text>
                            )}
                        </LinearGradient>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default AllNewsScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Startups başlığıyla aynı düzen
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: Platform.OS === 'ios' ? 32 : 0,
        paddingHorizontal: 16,
    },
    backButton: { marginRight: 8 },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: { width: 34 },

    // Startups’taki arama barı
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: metrics.isTablet ? Math.min(metrics.WIDTH * 0.8, 800) : SCREEN_WIDTH - 32,
        alignSelf: 'center',
    },
    searchIcon: { marginRight: 6 },
    searchInput: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        fontSize: 16,
        color: '#fff',
    },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: Colors.lightText, opacity: 0.8, marginBottom: 8 },

    listContent: { paddingHorizontal: 16, paddingBottom: 20 },
    newsCard: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    newsCardContent: { height: 170, position: 'relative' },
    newsImage: { width: '100%', height: '100%' },
    imageOverlay: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: '60%',
        padding: 12,
        justifyContent: 'flex-end',
    },
    newsTitle: { color: Colors.lightText, fontSize: 16, fontWeight: '700' },

    modalOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContainer: {
        padding: 20, borderRadius: 24, width: '90%', maxHeight: '80%',
        backgroundColor: 'rgba(26,30,41,0.95)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    modalScrollView: { flexGrow: 1 },
    modalContentContainer: { paddingBottom: 20 },
    closeIconContainer: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
    closeIcon: { fontSize: 24, color: Colors.lightText },
    modalContent: { flexDirection: 'column', marginTop: 20 },
    modalImageContainer: { width: '100%', height: 200, marginBottom: 16 },
    modalImage: { width: '100%', height: '100%', borderRadius: 8 },
    modalTextContainer: { flex: 1, paddingHorizontal: 10 },
    modalTitle: { fontSize: 18, fontWeight: '600', color: Colors.lightText, marginBottom: 12 },
    modalSource: { fontSize: 14, color: Colors.lightText, opacity: 0.7, marginBottom: 16 },
    modalAbstract: { fontSize: 15, color: Colors.lightText, lineHeight: 24, opacity: 0.9 },
    modalText: { fontSize: 16, color: Colors.lightText, textAlign: 'center', marginTop: 20 },
    retryButton: { fontSize: 16, color: Colors.primary, marginTop: 6 },
});
