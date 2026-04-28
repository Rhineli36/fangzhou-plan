import type { Character } from "../character-types";

const character: Character = {
  id: 'char-03',
  name: '莉莉丝',
  title: '数据幽灵',
  profession: '调查者',
  positioning: '战术控制',
  hp: 4,
  gender: '女',
  age: '未知',
  birthday: '未知',
  zodiac: '未知',
  bloodType: '未知',
  linkedCharacters: ['霓虹·零'],
  backgroundStory: '旧世界网络中诞生的AI实体，通过某种方式获得了机械躯体。',
  selectionLine: '正在分析敌方弱点...分析完成，胜率 99.9%。',
  avatar: '',
  portrait: '',
  selectionPortrait: '',
  skills: [
    {
      name: '防火墙',
      type: '防御',
      description: '为全体友军提供数据护盾。',
      range: '多体',
      cost: 3,
      effect: '提供相当于最大生命值 15% 的护盾',
      upgrade: '护盾破碎时反弹部分伤害'
    }
  ]
};

export default character;
