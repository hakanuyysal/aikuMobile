import { MMKVInstance } from '../storage/mmkv';
import { BaseService } from './BaseService';

class CurrencyService {
  private cachedRate: number | null = null;
  private lastFetchTime: number | null = null;
  private readonly cacheDuration = 1000 * 60 * 60 * 24; // 24 saat cache süresi
  private readonly baseService: BaseService;

  constructor() {
    this.baseService = BaseService.getInstance();
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedRate = MMKVInstance.getString('usd_try_rate');
      const savedTime = MMKVInstance.getString('usd_try_last_fetch');
      
      if (savedRate && savedTime) {
        this.cachedRate = parseFloat(savedRate);
        this.lastFetchTime = parseInt(savedTime);
      } else {
        this.cachedRate = null;
        this.lastFetchTime = null;
      }
    } catch (error) {
      console.error('Error loading exchange rate from storage:', error);
      this.cachedRate = null;
      this.lastFetchTime = null;
    }
  }

  private saveToStorage(rate: number, time: number) {
    try {
      MMKVInstance.setString('usd_try_rate', rate.toString());
      MMKVInstance.setString('usd_try_last_fetch', time.toString());
    } catch (error) {
      console.error('Error saving exchange rate to storage:', error);
    }
  }

  async getUSDtoTRYRate(): Promise<number> {
    try {
      // Cache kontrolü - son 24 saat içinde çekildiyse tekrar API'ye gitme
      if (this.cachedRate && this.lastFetchTime && (Date.now() - this.lastFetchTime < this.cacheDuration)) {
        return this.cachedRate;
      }

      const response = await this.baseService.getAll();
      
      if (response.success && response.data?.rate) {
        const rate = response.data.rate;
        
        // Cache'i güncelle ve storage'a kaydet
        this.cachedRate = rate;
        this.lastFetchTime = Date.now();
        this.saveToStorage(rate, this.lastFetchTime);
        
        return rate;
      } else {
        // API başarısız olursa önbellekteki değeri kontrol et
        if (this.cachedRate) {
          return this.cachedRate;
        }
        
        return 32; // Varsayılan dolar kuru
      }
    } catch (error) {
      // Hata durumunda önbellekteki değeri kontrol et
      if (this.cachedRate) {
        return this.cachedRate;
      }
      
      return 32; // Hata durumunda varsayılan değer
    }
  }

  isRateFromCache(): boolean {
    return this.cachedRate !== null && 
           this.lastFetchTime !== null && 
           (Date.now() - this.lastFetchTime < this.cacheDuration);
  }

  getLastUpdateTime(): string {
    if (!this.lastFetchTime) return 'Henüz güncellenmedi';
    
    const now = new Date();
    const lastUpdate = new Date(this.lastFetchTime);
    const diffHours = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return diffHours === 0 
        ? 'Az önce güncellendi' 
        : `${diffHours} saat önce güncellendi`;
    } else {
      return `${lastUpdate.getDate()} ${lastUpdate.toLocaleString('tr-TR', { month: 'long' })} ${lastUpdate.getFullYear()} tarihinde güncellendi`;
    }
  }
}

export default new CurrencyService(); 