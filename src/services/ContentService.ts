import axios from 'axios';

class ContentService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:3004';
  }

  // Featured Products
  async getFeaturedProducts() {
    try {
      const response = await axios.get(`${this.baseURL}/products/featured`);
      return response.data;
    } catch (error) {
      console.error('Featured products error:', error);
      throw error;
    }
  }

  // News
  async getNews() {
    try {
      const response = await axios.get(`${this.baseURL}/news`);
      return response.data;
    } catch (error) {
      console.error('News error:', error);
      throw error;
    }
  }

  // News by ID
  async getNewsById(id: string) {
    try {
      const response = await axios.get(`${this.baseURL}/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('News detail error:', error);
      throw error;
    }
  }
}

const contentService = new ContentService();
export default contentService; 