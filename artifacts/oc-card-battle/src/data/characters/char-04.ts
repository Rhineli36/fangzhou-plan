import type { Character } from "../character-types";

const character: Character = {
  id: 'char-04',
  name: '赤枭',
  title: '狂热之焰',
  profession: '异种',
  positioning: '群体输出',
  hp: 5,
  gender: '女',
  age: '21',
  birthday: '8月8日',
  zodiac: '狮子座',
  bloodType: 'B型',
  linkedCharacters: [],
  backgroundStory: '感染黑雾后不仅没有丧失理智，反而掌握了操控火焰的能力。',
  selectionLine: '燃烧吧，将这腐朽的世界化为灰烬！',
  avatar: '',
  portrait: '',
  selectionPortrait: '',
  skills: [
    {
      name: '浴火',
      type: '天赋',
      description: '免疫燃烧效果，受到火焰伤害时恢复生命值。',
      range: '单体',
      cost: 0,
      effect: '火抗 100%',
      upgrade: '周围友军火抗提升'
    }
  ]
};

export default character;
