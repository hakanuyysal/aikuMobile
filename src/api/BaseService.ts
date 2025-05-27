import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class BaseService {
  static async getNews() {
    try {
      const response = await axios.get(`${API_URL}/news`);
      return response.data;
    } catch (error) {
      console.error('Haberler yüklenirken hata oluştu:', error);
      throw error;
    }
  }

  static async getNewsById(id: string) {
    try {
      const response = await axios.get(`${API_URL}/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('Haber detayı yüklenirken hata oluştu:', error);
      throw error;
    }
  }
}

export default BaseService; 