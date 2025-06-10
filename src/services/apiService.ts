import axios from 'axios';
import { SearchResult } from './searchService';

const API_URL = 'http://localhost:3004/api';

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const messageService = {
  getMessages: async (userId: string) => {
    try {
      const response = await apiService.get(`/messages/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Mesajlar alınırken hata oluştu:', error);
      throw error;
    }
  },

  sendMessage: async (message: {
    senderId: string;
    receiverId: string;
    content: string;
  }) => {
    try {
      const response = await apiService.post('/messages', message);
      return response.data;
    } catch (error) {
      console.error('Mesaj gönderilirken hata oluştu:', error);
      throw error;
    }
  },
};

export default apiService;

class ApiService {
  private static instance: ApiService;
  private baseUrl: string = 'https://api.aikuaiplatform.com/api'; // API URL'nizi buraya ekleyin

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async search(query: string, filters: any): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
        }),
      });

      if (!response.ok) {
        throw new Error('Arama işlemi başarısız oldu');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('API Hatası:', error);
      // Hata durumunda örnek veri döndür
      return this.getMockData();
    }
  }

  private getMockData(): SearchResult[] {
    return [
      {
        id: 1,
        type: 'Startup',
        name: 'TechVision AI',
        latitude: 41.0082,
        longitude: 28.9784,
        description: 'Yapay zeka destekli görüntü işleme çözümleri',
        icon: 'https://via.placeholder.com/40',
        sector: 'AI & Machine Learning',
        stage: 'Seed'
      },
      {
        id: 2,
        type: 'Investor',
        name: 'Venture Capital Partners',
        latitude: 41.0082,
        longitude: 28.9784,
        description: 'Erken aşama teknoloji yatırımları',
        icon: 'https://via.placeholder.com/40',
        sector: 'Finance',
        stage: 'Series A'
      },
      {
        id: 4,
        type: 'Startup',
        name: 'GreenTech Solutions',
        latitude: 41.0082,
        longitude: 28.9784,
        description: 'Sürdürülebilir enerji çözümleri',
        icon: 'https://via.placeholder.com/40',
        sector: 'Energy',
        stage: 'Series B'
      },
      {
        id: 5,
        type: 'Investor',
        name: 'Tech Angels',
        latitude: 41.0082,
        longitude: 28.9784,
        description: 'Teknoloji odaklı melek yatırımcı grubu',
        icon: 'https://via.placeholder.com/40',
        sector: 'Finance',
        stage: 'Pre-Seed'
      }
    ];
  }
} 