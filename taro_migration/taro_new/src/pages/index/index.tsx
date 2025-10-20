import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { SwipeCell, Button as VanButton, Icon, Popup, Cell } from '@antmjs/vantui';
import * as util from '@/utils/util';
import './index.scss';

interface Card {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  name: string;
  cards: Card[];
  deletedAt?: number;
}

export default function Index() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useDidShow(() => {
    console.log('index.tsx: useDidShow triggered');
    loadDecks();
  });

  const loadDecks = () => {
    console.log('index.tsx: loadDecks called');
    const data = util.loadData();
    console.log('index.tsx: Data loaded from util', data);
    setDecks(data.decks || []);
  };

  const navigateToAdd = () => {
    Taro.navigateTo({ url: '/pages/editor/editor' });
  };

  const navigateToStudy = (e) => {
    const deckId = e.currentTarget.dataset.id;
    console.log('index.tsx: navigateToStudy for deckId', deckId);
    Taro.navigateTo({ url: `/pages/study/study?id=${deckId}` });
  };

  const navigateToEdit = (e) => {
    const deckId = e.currentTarget.dataset.id;
    console.log('index.tsx: navigateToEdit for deckId', deckId);
    // Stop propagation to prevent triggering navigateToStudy
    e.stopPropagation();
    Taro.navigateTo({ url: `/pages/editor/editor?id=${deckId}` });
  };

  const showDeleteModal = (e) => {
    const deckId = e.currentTarget.dataset.id;
    // Stop propagation to prevent triggering navigateToStudy
    e.stopPropagation();
    console.log('index.tsx: showDeleteModal for deckId', deckId);
    Taro.showModal({
      title: '确认删除',
      content: '您确定要将这个卡片集移入回收站吗？',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          console.log('index.tsx: Delete confirmed for deckId', deckId);
          moveToRecycleBin(deckId);
        }
      },
    });
  };

  const moveToRecycleBin = (deckId) => {
    const allData = util.loadData();
    const deckIndex = allData.decks.findIndex((d) => d.id === deckId);

    if (deckIndex > -1) {
      const [deck] = allData.decks.splice(deckIndex, 1);
      deck.deletedAt = Date.now();
      if (!allData.deletedDecks) {
        allData.deletedDecks = [];
      }
      allData.deletedDecks.push(deck);
      util.saveData(allData);
      loadDecks(); // Refreshes the UI
      Taro.showToast({ title: '已移入回收站', icon: 'success' });
    }
  };

  const onOpenSidebar = () => setShowSidebar(true);
  const onCloseSidebar = () => setShowSidebar(false);

  const navigateToRecycleBinFromSidebar = () => {
    onCloseSidebar();
    Taro.navigateTo({ url: '/pages/recycleBin/recycleBin' });
  };

  const navigateToAccountingFromSidebar = () => {
    onCloseSidebar();
    Taro.navigateTo({ url: '/pages/accounting/accounting' });
  };

  return (
    <View className='container'>
      {!showSidebar && (
        <View className='menu-button' onClick={onOpenSidebar}>
          <Icon name='wap-nav' size='24px' color='#6B59CC' />
        </View>
      )}

      {decks.length > 0 ? (
        <View className='deck-list'>
          {decks.map((item) => (
            <SwipeCell
              key={item.id}
              rightWidth={100}
              className='swipe-cell-wrapper'
              renderRight={(
                <VanButton type='danger' className='delete-button' onClick={(e) => showDeleteModal(e)} data-id={item.id}>
                  <Icon name='delete-o' color='#fff' size='20px' />
                  <Text>删除</Text>
                </VanButton>
              )}
            >
              <View className='deck-item' onClick={(e) => navigateToStudy(e)} data-id={item.id}>
                <View className='deck-content'>
                  <View className='deck-name'>{item.name}</View>
                  <View className='deck-info'>{item.cards.length} 张卡片</View>
                </View>
                <View className='deck-actions'>
                  <Icon name='edit' className='action-icon' data-id={item.id} onClick={(e) => navigateToEdit(e)} />
                </View>
              </View>
            </SwipeCell>
          ))}
        </View>
      ) : (
        <View className='empty-state'>
          <Icon name='inbox-o' size='50px' color='#bdc3c7' />
          <Text className='empty-text'>还没有卡片集</Text>
          <Text className='empty-tip'>点击下方按钮创建一个吧！</Text>
        </View>
      )}

      <Button className='add-btn' onClick={navigateToAdd}>
        <Icon name='plus' color='#fff' className='add-btn-icon' />
        <Text>创建新卡片集</Text>
      </Button>

      <Popup show={showSidebar} position='left' style={{ height: '100%', width: '70%' }} onClose={onCloseSidebar}>
        <View className='sidebar-header'>
          <Text>导航</Text>
        </View>
        <View className='sidebar-menu'>
          <Cell title='回收站' isLink onClick={navigateToRecycleBinFromSidebar}>
            <Icon name='delete' size='20px' slot='icon' style={{ marginRight: '10px' }} />
          </Cell>
          <Cell title='记账本' isLink onClick={navigateToAccountingFromSidebar}>
            <Icon name='balance-o' size='20px' slot='icon' style={{ marginRight: '10px' }} />
          </Cell>
        </View>
      </Popup>
    </View>
  );
}