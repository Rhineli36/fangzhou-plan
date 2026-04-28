import type { Character } from "../character-types";

const character: Character = {
  id: 'char-08',
  name: '零式',
  title: '原型机',
  profession: '调查者',
  positioning: '全能辅助',
  hp: 5,
  gender: '无',
  age: '0',
  birthday: '未知',
  zodiac: '未知',
  bloodType: '机油',
  linkedCharacters: ['莉莉丝'],
  backgroundStory: '第一代人形战斗装甲，虽然性能不如后继机型，但稳定性极高。',
  selectionLine: '系统启动。指令：保护友军。',
  avatar: '',
  portrait: '',
  selectionPortrait: '',
  skills: [
    {
      name: '能量过载',
      type: '天赋',
      description: '每回合为随机一名友军恢复能量。',
      range: '单体',
      cost: 0,
      effect: '回合结束时触发',
      upgrade: '恢复量增加'
    }
  ]
};

export default character;
