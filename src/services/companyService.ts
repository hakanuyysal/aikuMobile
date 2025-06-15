import axios from 'axios';

const API_URL = 'http://10.0.2.2:3000/api'; // Android emülatör için localhost
export const BASE_URL = 'http://10.0.2.2:3000';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  isHighlighted?: boolean;
  userId?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyLinkedIn?: string;
  companyInstagram?: string;
  companyTwitter?: string;
  acceptMessages?: boolean;
  detailedDescription?: string;
  interestedSectors?: string[];
  numberOfInvestments?: number;
  numberOfExits?: number;
  isIncorporated?: boolean;
}

const processCompanyLogo = (company: Company): Company => {
  if (company.companyLogo) {
    console.log('Orijinal logo URL:', company.companyLogo);
    // Eğer URL zaten tam URL ise değiştirme
    if (company.companyLogo.startsWith('http')) {
      return company;
    }
    // Eğer /uploads ile başlıyorsa BASE_URL ekle
    if (company.companyLogo.startsWith('/uploads/images')) {
      const fullUrl = `${BASE_URL}${company.companyLogo}`;
      console.log('İşlenmiş logo URL:', fullUrl);
      return {
        ...company,
        companyLogo: fullUrl
      };
    }
    // Diğer durumlar için varsayılan logo
    return {
      ...company,
      companyLogo: `${BASE_URL}/uploads/images/defaultCompanyLogo.png`
    };
  }
  // Logo yoksa varsayılan logo
  return {
    ...company,
    companyLogo: `${BASE_URL}/uploads/images/defaultCompanyLogo.png`
  };
};

export const companyService = {
  // Tüm şirketleri getir
  getAllCompanies: async (): Promise<{ success: boolean; companies: Company[] }> => {
    try {
      const response = await api.get('/company/all');
      console.log('API Response:', response.data);
      return {
        success: true,
        companies: response.data.companies.map(processCompanyLogo)
      };
    } catch (error) {
      console.error('Şirketler getirilirken hata oluştu:', error);
      return {
        success: false,
        companies: []
      };
    }
  },

  // Sadece startup'ları getir
  getStartups: async (): Promise<Company[]> => {
    try {
      const response = await api.get('/company/all');
      if (response.data.success) {
        const startups = response.data.companies
          .filter((c: Company) => c.companyType === "Startup")
          .map(processCompanyLogo);
        return [
          ...startups.filter((c: Company) => c.isHighlighted),
          ...startups.filter((c: Company) => !c.isHighlighted)
        ];
      }
      return [];
    } catch (error) {
      console.error('Startup\'lar getirilirken hata oluştu:', error);
      return [];
    }
  },

  // Sadece yatırımcıları getir
  getInvestors: async (): Promise<Company[]> => {
    try {
      const response = await api.get('/company/all');
      if (response.data.success) {
        const investors = response.data.companies
          .filter((c: Company) => c.companyType === "Investor")
          .map(processCompanyLogo);
        return [
          ...investors.filter((c: Company) => c.isHighlighted),
          ...investors.filter((c: Company) => !c.isHighlighted)
        ];
      }
      return [];
    } catch (error) {
      console.error('Yatırımcılar getirilirken hata oluştu:', error);
      return [];
    }
  },

  // Yeni şirket ekle
  addCompany: async (companyData: Partial<Company> | FormData): Promise<Company> => {
    try {
      const isFormData = companyData instanceof FormData;
      
      const config = {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      };

      console.log('Gönderilen veri:', companyData);
      const response = await api.post('/company', companyData, config);
      console.log('API yanıtı:', response.data);
      return processCompanyLogo(response.data.company);
    } catch (error) {
      console.error('Şirket eklenirken hata oluştu:', error);
      throw error;
    }
  },

  // Şirket güncelle
  updateCompany: async (id: string, companyData: Partial<Company> | FormData): Promise<Company> => {
    try {
      const isFormData = companyData instanceof FormData;

      const config = {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      };

      const response = await api.put(`/company/${id}`, companyData, config);
      return processCompanyLogo(response.data.company);
    } catch (error) {
      console.error('Şirket güncellenirken hata oluştu:', error);
      throw error;
    }
  },

  // Şirket sil
  deleteCompany: async (id: string): Promise<void> => {
    try {
      await api.delete(`/company/${id}`);
    } catch (error) {
      console.error('Şirket silinirken hata oluştu:', error);
      throw error;
    }
  },

  // AI ile şirket analizi
  analyzeWebsite: async (url: string): Promise<any> => {
    try {
      const response = await api.post('/ai/analyze-website', { url });
      return response.data;
    } catch (error) {
      console.error('Website analizi sırasında hata oluştu:', error);
      throw error;
    }
  },

  // AI ile dosya analizi
  analyzeDocument: async (file: FormData): Promise<any> => {
    try {
      const response = await api.post('/ai/analyze-document', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Dosya analizi sırasında hata oluştu:', error);
      throw error;
    }
  }
};

export default companyService; 