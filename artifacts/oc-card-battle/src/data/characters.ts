import testAvatar from "@assets/测试头像-1_1777347912995.png";
import testPortrait from "@assets/测试立绘-1_1777347909226.png";
import testSelectionPortrait from "@assets/选择立绘-1_1777347905177.png";

export type Profession = '调查者' | '战斗者' | '支援者' | '异种' | '遗民';
export type SkillType = '攻击' | '防御' | '异能' | '天赋' | '恢复';
export type TargetRange = '单体' | '多体';

export interface Skill {
  name: string;
  type: SkillType;
  description: string;
  range: TargetRange;
  cost: number;
  effect: string;
  upgrade: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  profession: Profession;
  positioning: string;
  hp: number;
  gender: string;
  age: string;
  birthday: string;
  zodiac: string;
  bloodType: string;
  linkedCharacters: string[];
  backgroundStory: string;
  selectionLine: string;
  avatar: string;
  portrait: string;
  selectionPortrait: string;
  skills: Skill[];
}

export const characters: Character[] = [
  {
    id: 'test-01',
    name: '夜·蝶',
    title: '黑雾中的暗杀',
    profession: '战斗者',
    positioning: '高爆发刺客',
    hp: 5,
    gender: '女',
    age: '19',
    birthday: '4月14日',
    zodiac: '白羊座',
    bloodType: 'AB型',
    linkedCharacters: ['霓虹·零', '残响'],
    backgroundStory: `在废弃的下城区，传闻中有一道紫色的闪电，在黑雾弥漫的夜晚收割生命。夜·蝶是幸存者口中的幽灵，没有人见过她的真面目，只知道当紫色的光芒闪过时，一切都已经结束。\n\n她曾是联邦特种部队的实验体，在灾变日觉醒了控制暗影与能量的能力。逃离实验室后，她在这片废土上寻找着自己的过去，同时冷酷地清理着那些被黑雾感染的异变者。`,
    selectionLine: '黑雾中的暗杀，无法被识别。',
    avatar: testAvatar,
    portrait: testPortrait,
    selectionPortrait: testSelectionPortrait,
    skills: [
      {
        name: '暗影潜行',
        type: '天赋',
        description: '在黑雾中获得隐身效果，暴击率提升。',
        range: '单体',
        cost: 0,
        effect: '暴击率 +20%',
        upgrade: '暴击伤害提升 50%'
      },
      {
        name: '紫电瞬杀',
        type: '攻击',
        description: '化作紫色闪电穿透敌人，造成巨额物理与能量混合伤害。',
        range: '单体',
        cost: 3,
        effect: '造成 250% 攻击力的伤害',
        upgrade: '若击杀目标，返还 2 点能量'
      },
      {
        name: '虚空刃舞',
        type: '异能',
        description: '召唤多把暗影之刃，对范围内的所有敌人进行无差别打击。',
        range: '多体',
        cost: 4,
        effect: '对所有敌人造成 120% 伤害',
        upgrade: '附带流血效果，持续 2 回合'
      }
    ]
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  }
];
