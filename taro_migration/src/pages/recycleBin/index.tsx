import { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { SwipeCell, Button, Icon, Empty } from '@antmjs/vantui';
import * as util from '../../utils/util';
import './index.scss';

const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

export default function RecycleBin() {
  const [deletedDecks, setDeletedDecks] = useState([]);

  useDidShow(() => {
    loadDeletedDecks();
  });

  const loadDeletedDecks = () => {
    const allData = util.loadData();
    const now = Date.now();

    const validDeletedDecks = (allData.deletedDecks || []).filter(deck => {
      return (now - deck.deletedAt) < THREE_DAYS_IN_MS;
    });

    if (validDeletedDecks.length !== (allData.deletedDecks || []).length) {
      allData.deletedDecks = validDeletedDecks;
      util.saveData(allData);
    }

    const formattedDecks = validDeletedDecks.map(deck => ({
      ...deck,
      deletedAtText: new Date(deck.deletedAt).toLocaleString(),
    }));

    setDeletedDecks(formattedDecks);
  };

  const handleRestore = (deckId) => {
    Taro.showModal({
      title: '确认恢复',
      content: '您确定要恢复这个卡片集吗？',
      confirmColor: '#1989fa',
      success: (res) => {
        if (res.confirm) {
          restoreDeck(deckId);
        }
      },
    });
  };

  const restoreDeck = (deckId) => {
    const allData = util.loadData();
    const deckToRestoreIndex = allData.deletedDecks.findIndex(d => d.id === deckId);

    if (deckToRestoreIndex > -1) {
      const [deck] = allData.deletedDecks.splice(deckToRestoreIndex, 1);
      delete deck.deletedAt;
      allData.decks.push(deck);
      util.saveData(allData);
      loadDeletedDecks();
      Taro.showToast({ title: '恢复成功', icon: 'success' });
    }
  };

  const handlePermanentDelete = (deckId) => {
    Taro.showModal({
      title: '彻底删除',
      content: '您确定要彻底删除这个卡片集吗？此操作无法撤销！',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          permanentDeleteDeck(deckId);
        }
      },
    });
  };

  const permanentDeleteDeck = (deckId) => {
    const allData = util.loadData();
    allData.deletedDecks = allData.deletedDecks.filter(d => d.id !== deckId);
    util.saveData(allData);
    loadDeletedDecks();
    Taro.showToast({ title: '已彻底删除', icon: 'success' });
  };

  return (
    <View className="container">
      {deletedDecks.length > 0 ? (
        <View className="item-list">
          {deletedDecks.map(item => (
            <SwipeCell
              key={item.id}
              rightWidth={65}
              leftWidth={65}
              className="swipe-cell-wrapper"
              renderLeft={<Button type="primary" className="restore-button" onClick={() => handleRestore(item.id)}>恢复</Button>}
              renderRight={<Button type="danger" className="delete-button" onClick={() => handlePermanentDelete(item.id)}>彻底删除</Button>}
            >
              <View className="list-item-content">
                <Text>{item.name}</Text>
                <Text className="deleted-info">已删除 {item.deletedAtText}</Text>
              </View>
            </SwipeCell>
          ))}
        </View>
      ) : (
        <View className="empty-state">
          <Icon name="success" size="50px" color="#bdc3c7" />
          <Text className="empty-text">回收站是空的</Text>
          <Text className="empty-tip">没有可恢复的卡片集</Text>
        </View>
      )}
    </View>
  );
}
