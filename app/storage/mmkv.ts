import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'aiku-storage',
  encryptionKey: 'aiku-secret-key',
});
