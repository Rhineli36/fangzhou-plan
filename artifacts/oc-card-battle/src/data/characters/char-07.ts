import type { Character } from "../character-types";

const character: Character = {
  id: 'char-07',
  name: '幽蓝',
  title: '深渊凝视',
  profession: '异种',
  positioning: '负面施加',
  hp: 4,
  gender: '未知',
  age: '未知',
  birthday: '未知',
  zodiac: '未知',
  bloodType: '未知',
  linkedCharacters: [],
  backgroundStory: '从深海中走出的异变体，散发着令人疯狂的气息。',
  selectionLine: '你听见深渊的呼唤了吗...',
  avatar: '',
  portrait: '',
  selectionPortrait: '',
  skills: [
    {
      name: '精神污染',
      type: '异能',
      description: '降低全体敌人的攻击力和防御力。',
      range: '多体',
      cost: 3,
      effect: '攻防降低 20%，持续 3 回合',
      upgrade: '有概率附加混乱效果'
    }
  ]
};

export default character;
