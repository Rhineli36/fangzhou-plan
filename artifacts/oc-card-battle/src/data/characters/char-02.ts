import type { Character } from "../character-types";

const character: Character = {
  id: 'char-02',
  name: '苍骸',
  title: '废土拾荒者',
  profession: '遗民',
  positioning: '重装前排',
  hp: 6,
  gender: '男',
  age: '32',
  birthday: '11月11日',
  zodiac: '天蝎座',
  bloodType: 'O型',
  linkedCharacters: ['夜·蝶'],
  backgroundStory: '在灾变后艰难求生的普通人，凭借拼凑的机械装甲在废土上生存。',
  selectionLine: '这堆破铜烂铁，比你们的信仰可靠多了。',
  avatar: '',
  portrait: '',
  selectionPortrait: '',
  skills: [
    {
      name: '废土求生',
      type: '天赋',
      description: '生命值越低，防御力越高。',
      range: '单体',
      cost: 0,
      effect: '每损失 10% HP 提升 5% 防御',
      upgrade: '达到 30% HP 时获得护盾'
    },
    {
      name: '重型轰击',
      type: '攻击',
      description: '使用机械臂重击敌人。',
      range: '单体',
      cost: 2,
      effect: '造成 150% 物理伤害',
      upgrade: '有概率眩晕目标 1 回合'
    }
  ]
};

export default character;
