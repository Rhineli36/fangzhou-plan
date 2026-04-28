import type { Character } from "../character-types";

const character: Character = {
  id: 'char-06',
  name: '黑曜',
  title: '沉默之刃',
  profession: '战斗者',
  positioning: '单体斩杀',
  hp: 5,
  gender: '男',
  age: '23',
  birthday: '1月1日',
  zodiac: '摩羯座',
  bloodType: 'O型',
  linkedCharacters: ['夜·蝶'],
  backgroundStory: '曾是与夜·蝶同期的实验体，失败后沦为没有感情的杀戮机器。',
  selectionLine: '......',
  avatar: '',
  portrait: '',
  selectionPortrait: '',
  skills: [
    {
      name: '处决',
      type: '攻击',
      description: '对低血量目标造成致命一击。',
      range: '单体',
      cost: 4,
      effect: '对生命值低于 30% 的目标造成双倍伤害',
      upgrade: '斩杀阈值提升至 40%'
    }
  ]
};

export default character;
