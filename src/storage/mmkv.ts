import {MMKV as MMKVStorage} from 'react-native-mmkv';

export const storage = new MMKVStorage();

const getString = (key: string): string | undefined => {
  return storage.getString(key);
};

const setString = (key: string, value: string): void => {
  storage.set(key, value);
};

const getNumber = (key: string): number | undefined => {
  return storage.getNumber(key);
};

const setNumber = (key: string, value: number): void => {
  storage.set(key, value);
};

const getBoolean = (key: string): boolean | undefined => {
  return storage.getBoolean(key);
};

const setBoolean = (key: string, value: boolean): void => {
  storage.set(key, value);
};

const deleteItem = (key: string): void => {
  storage.delete(key);
};

const clearAll = (): void => {
  storage.clearAll();
};

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
