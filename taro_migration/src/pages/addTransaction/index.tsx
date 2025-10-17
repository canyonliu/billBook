import { useState, useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { RadioGroup, Radio, Field, CellGroup, Cell, Button, Popup, DatetimePicker, TreeSelect } from '@antmjs/vantui';
import * as util from '../../utils/util';
import './index.scss';

export default function AddTransaction() {
  const router = useRouter();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().getTime());
  const [transactionId, setTransactionId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [mainActiveIndex, setMainActiveIndex] = useState(0);
  const [activeTagIds, setActiveTagIds] = useState([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categorizedTags = useMemo(() => [
    {
      text: '生活',
      children: [
        { id: '餐饮', text: '餐饮', icon: 'food-o' },
        { id: '购物', text: '购物', icon: 'shopping-cart-o' },
        { id: '交通', text: '交通', icon: 'logistics' },
        { id: '娱乐', text: '娱乐', icon: 'smile-o' },
        { id: '住房', text: '住房', icon: 'wap-home-o' },
        { id: '学习', text: '学习', icon: 'notes-o' },
      ],
    },
    {
      text: '理财',
      children: [
        { id: '工资', text: '工资', icon: 'gold-coin-o' },
        { id: '理财', text: '理财', icon: 'balance-o' },
      ],
    },
  ], []);

  const formattedDate = useMemo(() => {
    const d = new Date(transactionDate);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }, [transactionDate]);

  const selectedTagNames = useMemo(() => {
    const selectedNames = [];
    categorizedTags.forEach(category => {
      category.children.forEach(tag => {
        if (activeTagIds.includes(tag.id)) {
          selectedNames.push(tag.text);
        }
      });
    });
    return selectedNames.join(', ');
  }, [activeTagIds, categorizedTags]);

  useEffect(() => {
    const { id } = router.params;
    if (id) {
      const allData = util.loadData();
      const transaction = allData.transactions.find(t => t.id === id);
      if (transaction) {
        setTransactionId(transaction.id);
        setIsEditMode(true);
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setDescription(transaction.description);
        setActiveTagIds(transaction.tags || []);
        setTransactionDate(transaction.date);
        Taro.setNavigationBarTitle({ title: '编辑记账' });
      } else {
        Taro.showToast({ title: '交易不存在', icon: 'none' });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    } else {
      Taro.setNavigationBarTitle({ title: '新增记账' });
    }
  }, [router.params]);

  const onSave = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Taro.showToast({ title: '请输入有效的金额', icon: 'none' });
      return;
    }

    const allData = util.loadData();
    if (!allData.transactions) {
      allData.transactions = [];
    }

    const newTransaction = {
      id: isEditMode ? transactionId : util.generateId(),
      type,
      amount: parseFloat(amount),
      description,
      tags: activeTagIds,
      date: transactionDate,
    };

    if (isEditMode) {
      const index = allData.transactions.findIndex(t => t.id === transactionId);
      if (index !== -1) {
        allData.transactions[index] = newTransaction;
      }
    } else {
      allData.transactions.unshift(newTransaction);
    }
    
    util.saveData(allData);

    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className="container">
      <View className="form-group">
        <RadioGroup value={type} onChange={(e) => setType(e.detail)} direction="horizontal">
          <Radio name="expense">支出</Radio>
          <Radio name="income">收入</Radio>
        </RadioGroup>
      </View>

      <View className="form-group amount-group">
        <Text className="currency-symbol">¥</Text>
        <Field
          value={amount}
          type="digit"
          placeholder="0.00"
          onChange={(e) => setAmount(e.detail)}
          inputClass="amount-input"
          border={false}
        />
      </View>

      <CellGroup inset>
        <Field
          value={description}
          label="描述"
          placeholder="点击输入描述 (可选)"
          onChange={(e) => setDescription(e.detail)}
        />
        <Cell title="日期" isLink value={formattedDate} onClick={() => setShowDatePicker(true)} />
        <Cell title="标签" isLink value={selectedTagNames} onClick={() => setShowTagSelector(true)} />
      </CellGroup>

      <View className="button-wrapper">
        <Button type="primary" block round onClick={onSave}>保 存</Button>
      </View>

      <Popup show={showDatePicker} position="bottom" onClose={() => setShowDatePicker(false)}>
        <DatetimePicker
          type="datetime"
          value={transactionDate}
          minDate={new Date(2000, 0, 1).getTime()}
          maxDate={new Date().getTime()}
          onConfirm={(e) => {
            setTransactionDate(e.detail);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      </Popup>

      <Popup show={showTagSelector} position="bottom" onClose={() => setShowTagSelector(false)} style={{ height: '70%' }}>
        <TreeSelect
          items={categorizedTags}
          mainActiveIndex={mainActiveIndex}
          activeId={activeTagIds}
          max={5}
          onClickNav={(e) => setMainActiveIndex(e.detail.index)}
          onClickItem={(e) => {
            const { id } = e.detail;
            const index = activeTagIds.indexOf(id);
            if (index > -1) {
              setActiveTagIds(activeTagIds.filter(i => i !== id));
            } else {
              setActiveTagIds([...activeTagIds, id]);
            }
          }}
        />
      </Popup>
    </View>
  );
}
