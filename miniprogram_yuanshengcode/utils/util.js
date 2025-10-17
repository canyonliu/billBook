const STORAGE_KEY = 'flashcard_data';

// 获取所有数据
const loadData = () => {
  try {
    const data = wx.getStorageSync(STORAGE_KEY);
    console.log('util.loadData: Raw data from storage', data);
    if (data) {
      // Ensure deletedDecks exists even if not present in old data
      if (!data.deletedDecks) {
        data.deletedDecks = [];
      }
      console.log('util.loadData: Processed data', data);
      return data;
    }
    // If no data, return initial structure with both decks and deletedDecks
    const initialData = { decks: [], deletedDecks: [] };
    console.log('util.loadData: Initial data (storage empty)', initialData);
    return initialData;
  } catch (e) {
    console.error('Failed to load data from storage', e);
    return { decks: [], deletedDecks: [] };
  }
};

// 保存所有数据
const saveData = (data) => {
  try {
    console.log('util.saveData: Data to be saved', data);
    wx.setStorageSync(STORAGE_KEY, data);
    console.log('util.saveData: Data saved successfully');
  } catch (e) {
    console.error('Failed to save data to storage', e);
  }
};

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
  loadData,
  saveData,
  generateId
};
