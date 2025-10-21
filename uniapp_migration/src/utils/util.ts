const STORAGE_KEY = 'flashcard_data';

// 获取所有数据
export const loadData = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY);
    console.log('util.loadData: Raw data from storage', data);
    if (data) {
      // Ensure deletedDecks exists even if not present in old data
      if (!data.deletedDecks) {
        data.deletedDecks = [];
      }
      // Ensure transactions exists
      if (!data.transactions) {
        data.transactions = [];
      }
      console.log('util.loadData: Processed data', data);
      return data;
    }
    // If no data, return initial structure
    const initialData = { decks: [], deletedDecks: [], transactions: [] };
    console.log('util.loadData: Initial data (storage empty)', initialData);
    return initialData;
  } catch (e) {
    console.error('Failed to load data from storage', e);
    return { decks: [], deletedDecks: [], transactions: [] };
  }
};

// 保存所有数据
export const saveData = (data) => {
  try {
    console.log('util.saveData: Data to be saved', data);
    uni.setStorageSync(STORAGE_KEY, data);
    console.log('util.saveData: Data saved successfully');
  } catch (e) {
    console.error('Failed to save data to storage', e);
  }
};

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
