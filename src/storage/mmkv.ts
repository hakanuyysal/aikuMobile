import { MMKV as MMKVStorage } from 'react-native-mmkv';

// Tek gerçek instance - ilk erişimde oluşturulacak
let _mmkv: MMKVStorage | null = null;
const getMMKV = () => {
  if (!_mmkv) {
    _mmkv = new MMKVStorage();
  }
  return _mmkv;
};

/**
 * Proje genelinde kullanılan "storage" objesi.
 * Daha önceki gibi storage.set / storage.getString / storage.getNumber ...
 * şeklinde çalışır ama MMKV instance'ını ilk çağrıda oluşturur.
 */
export const storage = {
  // ham set/get
  set: (key: string, value: string | number | boolean) => getMMKV().set(key, value),
  getString: (key: string): string | undefined => getMMKV().getString(key),
  getNumber: (key: string): number | undefined => getMMKV().getNumber(key),
  getBoolean: (key: string): boolean | undefined => getMMKV().getBoolean(key),

  // yönetim
  delete: (key: string) => getMMKV().delete(key),
  clearAll: () => getMMKV().clearAll(),
};

// Eski MMKVInstance isimli helper'ı da aynı şekilde, lazy MMKV üstünden çalıştırıyoruz
const getString = (key: string) => storage.getString(key);
const setString = (key: string, value: string) => storage.set(key, value);
const getNumber = (key: string) => storage.getNumber(key);
const setNumber = (key: string, value: number) => storage.set(key, value);
const getBoolean = (key: string) => storage.getBoolean(key);
const setBoolean = (key: string, value: boolean) => storage.set(key, value);
const deleteItem = (key: string) => storage.delete(key);
const clearAll = () => storage.clearAll();

export const MMKVInstance = {
  getString,
  setString,
  getNumber,
  setNumber,
  getBoolean,
  setBoolean,
  deleteItem,
  clearAll,
};
