import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Icon } from '@antmjs/vantui';
import * as util from '../../utils/util';
import './index.scss';

interface Card {
  id: string;
  front: string;
  back: string;
}

export default function Editor() {
  const router = useRouter();
  const [deckId, setDeckId] = useState<string | null>(null);
  const [deckName, setDeckName] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const { id } = router.params;
    if (id) {
      const allData = util.loadData();
      const deck = allData.decks.find((d) => d.id === id);
      if (deck) {
        setIsEditMode(true);
        setDeckId(deck.id);
        setDeckName(deck.name);
        setCards(deck.cards);
        Taro.setNavigationBarTitle({ title: '编辑卡片集' });
      } else {
        Taro.showToast({ title: '找不到卡片集', icon: 'none' });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    } else {
      setIsEditMode(false);
      Taro.setNavigationBarTitle({ title: '新建卡片集' });
    }
  }, [router.params]);

  const onDeckNameInput = (e) => {
    setDeckName(e.detail.value);
  };

  const addCard = () => {
    const newCard = {
      id: util.generateId(),
      front: '',
      back: '',
    };
    setCards([...cards, newCard]);
  };

  const removeCard = (cardId: string) => {
    setCards(cards.filter((c) => c.id !== cardId));
  };

  const onCardInput = (e, cardId: string, field: 'front' | 'back') => {
    const { value } = e.detail;
    const newCards = cards.map((card) => {
      if (card.id === cardId) {
        return { ...card, [field]: value };
      }
      return card;
    });
    setCards(newCards);
  };

  const save = () => {
    if (!deckName.trim()) {
      Taro.showToast({ title: '卡片集名称不能为空', icon: 'none' });
      return;
    }

    const allData = util.loadData();

    if (isEditMode) {
      const deckIndex = allData.decks.findIndex((d) => d.id === deckId);
      if (deckIndex > -1) {
        allData.decks[deckIndex].name = deckName;
        allData.decks[deckIndex].cards = cards;
      }
    } else {
      const newDeck = {
        id: util.generateId(),
        name: deckName,
        cards: cards,
      };
      allData.decks.push(newDeck);
    }

    util.saveData(allData);

    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  return (
    <View className='container'>
      <View className='form-wrapper'>
        <View className='form-group'>
          <Text as='label' htmlFor='deckName'>卡片集名称</Text>
          <Input id='deckName' value={deckName} onInput={onDeckNameInput} placeholder='例如：前端高频面试题' />
        </View>

        <View className='divider'>卡片列表</View>

        <View className='cards-list'>
          {cards.map((item, index) => (
            <View className='card-editor-item' key={item.id}>
              <View className='card-header'>
                <View className='card-title'>卡片 {index + 1}</View>
                <Icon name='delete-o' className='delete-card-icon' color='#e74c3c' onClick={() => removeCard(item.id)} />
              </View>
              <View className='card-body'>
                <Textarea className='card-input' placeholder='输入正面内容...' value={item.front} onInput={(e) => onCardInput(e, item.id, 'front')}></Textarea>
                <Textarea className='card-input' placeholder='输入反面内容...' value={item.back} onInput={(e) => onCardInput(e, item.id, 'back')}></Textarea>
              </View>
            </View>
          ))}
        </View>

        <Button className='add-card-btn-main' onClick={addCard}>
          <Icon name='plus' color='#6B59CC' className='add-card-btn-icon' />
          <Text>添加新卡片</Text>
        </Button>
      </View>

      <Button className='save-btn' onClick={save}>保存</Button>
    </View>
  );
}
