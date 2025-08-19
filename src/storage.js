import AsyncStorage from '@react-native-async-storage/async-storage';

export const getPassphrase = async () => {
  return await AsyncStorage.getItem("passphrase");
};

export const savePassphrase = async (passphrase) => {
  await AsyncStorage.setItem("passphrase", passphrase);
};
