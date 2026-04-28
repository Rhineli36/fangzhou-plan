import type { Character } from "../character-types";

const character: Character = {
  id: 'char-05',
  name: '白夜',
  title: '圣职医者',
  profession: '支援者',
  positioning: '群体治疗',
  hp: 4,
  gender: '男',
  age: '25',
  birthday: '12月24日',
  zodiac: '摩羯座',
  bloodType: 'A型',
  linkedCharacters: [],
  backgroundStory: '坚守旧日信仰的医者，使用被称为"圣光"的能量治愈伤者。',
  selectionLine: '无论世界多么黑暗，光芒总会降临。',
  avatar: '',
  portrait: '',
  selectionPortrait: '',
  skills: [
    {
      name: '圣光祈祷',
      type: '恢复',
      description: '恢复全体友军的生命值。',
      range: '多体',
      cost: 2,
      effect: '恢复 100% 攻击力的生命值',
      upgrade: '清除所有负面状态'
    }
  ]
};

export default character;
