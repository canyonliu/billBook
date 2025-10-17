import { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import { Icon } from '@antmjs/vantui';
import * as util from '../../utils/util';
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
}

export default function Study() {
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useDidShow(() => {
    const { id } = router.params;
    if (!id) return;

    const allData = util.loadData();
    const foundDeck = allData.decks.find((d) => d.id === id);

    if (foundDeck) {
      setDeck(foundDeck);
      setCurrentIndex(0);
      setIsFlipped(false);
      Taro.setNavigationBarTitle({ title: foundDeck.name });
    } else {
      showErrorAndGoBack('找不到卡片集');
    }
  });

  const showErrorAndGoBack = (title: string) => {
    Taro.showToast({
      title: title,
      icon: 'none',
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const flipCard = () => {
    if (!deck || deck.cards.length === 0) return;
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (deck && currentIndex < deck.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const navigateToAddCard = () => {
    if (deck) {
      Taro.navigateTo({ url: `/pages/editor/editor?id=${deck.id}` });
    }
  };

  if (!deck) {
    return <View>加载中...</View>;
  }

  return (
    <View className='container'>
      {deck.cards.length > 0 ? (
        <View className='study-area'>
          <View className='progress'>{currentIndex + 1} / {deck.cards.length}</View>

          <View className='card-container' onClick={flipCard}>
            <View className={`card-content ${isFlipped ? 'is-flipped' : ''}`}>
              <View className='card-face card-front'>
                <Text>{deck.cards[currentIndex].front}</Text>
              </View>
              <View className='card-face card-back'>
                <Text>{deck.cards[currentIndex].back}</Text>
              </View>
            </View>
          </View>

          <View className='actions'>
            <View className={`action-btn prev-btn ${currentIndex === 0 ? 'disabled' : ''}`} onClick={prevCard}>
              <Icon name='arrow-left' className='nav-icon' />
            </View>
            <View className='action-btn flip-btn' onClick={flipCard}>
              <Icon name='replay' className='flip-icon' />
            </View>
            <View className={`action-btn next-btn ${currentIndex === deck.cards.length - 1 ? 'disabled' : ''}`} onClick={nextCard}>
              <Icon name='arrow' className='nav-icon' />
            </View>
          </View>
        </View>
      ) : (
        <View className='empty-state'>
          <Icon name='add-o' size='40px' color='#bdc3c7' />
          <Text className='empty-text'>这个卡片集是空的</Text>
          <Text className='empty-tip'>快去添加一些卡片吧！</Text>
          <Button className='add-card-btn' onClick={navigateToAddCard}>
            <Icon name='plus' color='#fff' className='add-card-btn-icon' />
            <Text>添加第一张卡片</Text>
          </Button>
        </View>
      )}
    </View>
  );
}
