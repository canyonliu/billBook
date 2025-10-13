const STORAGE_KEY = 'flashcard_data';

// 获取所有数据
const loadData = () => {
  try {
    const data = wx.getStorageSync(STORAGE_KEY);
    if (data) {
      return data;
    }
    // 如果没有数据，返回初始结构
    return { decks: [] };
  } catch (e) {
    console.error('Failed to load data from storage', e);
    return { decks: [] };
  }
};

// 保存所有数据
const saveData = (data) => {
  try {
    wx.setStorageSync(STORAGE_KEY, data);
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
