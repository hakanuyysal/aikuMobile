import axios from 'axios';

const API_URL = 'http://10.34.12.128:3004/api';
const BASE_URL = 'http://10.34.12.128:3004';

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
      const response = await axios.get(`${API_URL}/company/all`);
      console.log('API Response:', response.data); // API yanıtını kontrol et
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
      const response = await axios.get(`${API_URL}/company/all`);
      if (response.data.success) {
        const startups = response.data.companies
          .filter((c: Company) => c.companyType === "Startup")
          .map(processCompanyLogo);
        // Öne çıkan şirketleri başa al
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
      const response = await axios.get(`${API_URL}/company/all`);
      if (response.data.success) {
        const investors = response.data.companies
          .filter((c: Company) => c.companyType === "Investor")
          .map(processCompanyLogo);
        // Öne çıkan şirketleri başa al
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

  // Yeni startup ekle
  addStartup: async (startupData: Partial<Company> | FormData): Promise<Company> => {
    try {
      // Verinin FormData mı yoksa Partial<Company> mi olduğunu kontrol et
      const isFormData = startupData instanceof FormData;
      
      const response = await axios.post(`${API_URL}/company`, startupData, {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      });
      // API yanıtı doğrudan şirket verisini döndürüyor varsayıldı
      return processCompanyLogo(response.data.company);
    } catch (error) {
      console.error('Startup eklenirken hata oluştu:', error);
      throw error;
    }
  },

  // Startup güncelle
  updateStartup: async (id: string, startupData: Partial<Company> | FormData): Promise<Company> => {
    try {
       // Verinin FormData mı yoksa Partial<Company> mi olduğunu kontrol et
       const isFormData = startupData instanceof FormData;

      const response = await axios.put(`${API_URL}/company/${id}`, startupData, {
         headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
      });
      // API yanıtı doğrudan şirket verisini döndürüyor varsayıldı
      return processCompanyLogo(response.data.company);
    } catch (error) {
      console.error('Startup güncellenirken hata oluştu:', error);
      throw error;
    }
  },

  // Startup sil
  deleteStartup: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/company/${id}`);
    } catch (error) {
      console.error('Startup silinirken hata oluştu:', error);
      throw error;
    }
  }
}; 