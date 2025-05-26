import axios from 'axios';

const API_URL = 'http://10.34.12.128:3004/api';

export interface Company {
  _id: string;
  companyName: string;
  companyLogo: string;
  companyType: string;
  companySector: string[];
  companyInfo: string;
  companyWebsite: string;
  companyAddress: string;
  openForInvestments: boolean;
  businessModel: string;
  companySize: string;
  businessScale: string;
}

export const companyService = {
  // Tüm şirketleri getir
  getAllCompanies: async (): Promise<Company[]> => {
    try {
      const response = await axios.get(`${API_URL}/company/all`);
      return response.data;
    } catch (error) {
      console.error('Şirketler getirilirken hata oluştu:', error);
      throw error;
    }
  },

  // Sadece startup'ları getir
  getStartups: async (): Promise<Company[]> => {
    try {
      const response = await axios.get(`${API_URL}/company/all?type=Startup`);
      return Array.isArray(response.data) ? response.data : response.data.data;
    } catch (error) {
      console.error('Startup\'lar getirilirken hata oluştu:', error);
      throw error;
    }
  },

  // Yeni startup ekle
  addStartup: async (startupData: Partial<Company>): Promise<Company> => {
    try {
      const response = await axios.post(`${API_URL}/company/all`, {
        ...startupData,
        companyType: 'Startup'
      });
      return response.data;
    } catch (error) {
      console.error('Startup eklenirken hata oluştu:', error);
      throw error;
    }
  },

  // Startup güncelle
  updateStartup: async (id: string, startupData: Partial<Company>): Promise<Company> => {
    try {
      const response = await axios.put(`${API_URL}/company/all${id}`, startupData);
      return response.data;
    } catch (error) {
      console.error('Startup güncellenirken hata oluştu:', error);
      throw error;
    }
  },

  // Startup sil
  deleteStartup: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/company/all${id}`);
    } catch (error) {
      console.error('Startup silinirken hata oluştu:', error);
      throw error;
    }
  }
}; 