import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './apiService';

export interface SearchResult {
  id: number;
  type: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  icon: string;
  sector: string;
  stage: string;
}

export interface SearchFilters {
  types: string[];
  sectors: string[];
  stages: string[];
  location: string;
}

class SearchService {
  private static instance: SearchService;
  private searchHistory: string[] = [];
  private favorites: SearchResult[] = [];
  private apiService: ApiService;

  private constructor() {
    this.apiService = ApiService.getInstance();
    this.loadSearchHistory();
    this.loadFavorites();
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  private async loadSearchHistory() {
    try {
      const stored = await AsyncStorage.getItem('searchHistory');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Arama geçmişi yüklenirken hata:', error);
    }
  }

  private async loadFavorites() {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        this.favorites = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Favoriler yüklenirken hata:', error);
    }
  }

  public async search(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // API'den veri çek
      const results = await this.apiService.search(query, filters);

      // Arama geçmişine ekle
      if (query.length > 0) {
        await this.addToSearchHistory(query);
      }

      return results;
    } catch (error) {
      console.error('Arama hatası:', error);
      return [];
    }
  }

  private async addToSearchHistory(query: string) {
    this.searchHistory = [query, ...this.searchHistory.filter(item => item !== query)].slice(0, 5);
    await AsyncStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  public getSearchHistory(): string[] {
    return this.searchHistory;
  }

  public async toggleFavorite(item: SearchResult) {
    const isFavorite = this.favorites.some(fav => fav.id === item.id);
    if (isFavorite) {
      this.favorites = this.favorites.filter(fav => fav.id !== item.id);
    } else {
      this.favorites = [...this.favorites, item];
    }
    await AsyncStorage.setItem('favorites', JSON.stringify(this.favorites));
    return !isFavorite;
  }

  public getFavorites(): SearchResult[] {
    return this.favorites;
  }

  public isFavorite(itemId: number): boolean {
    return this.favorites.some(fav => fav.id === itemId);
  }
}

export default SearchService; 