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

export interface ExtendedBackground {
  origin?: string;
  family?: string;
  pastExperiences?: string;
  currentSituation?: string;
  epilogue?: string;
}

export interface Preferences {
  likes?: string[];
  dislikes?: string[];
  favoriteColor?: string;
  habits?: string;
  motto?: string;
}

/** 创作者信息 — 由提交表单录入，展示在角色档案右上角 */
export interface CreatorInfo {
  name: string;
  studentId: string;
  className?: string;
  avatar?: string;
  /** 想对这个角色说的话（角色寄语） */
  messageToCharacter?: string;
  /** 为游戏起的名字建议 */
  proposedGameName?: string;
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
  extendedBackground?: ExtendedBackground;
  preferences?: Preferences;
  selectionLine: string;
  avatar: string;
  portrait: string;
  selectionPortrait: string;
  skills: Skill[];
  /** 创作者信息（提交者本人 / 学生） */
  creator?: CreatorInfo;
  /** 待录入占位 — UI 中显示为锁定卡牌 */
  locked?: boolean;
}

/** 生成 16 个占位角色，凑够 24 个槽位 */
function makePlaceholders(): Character[] {
  return Array.from({ length: 16 }, (_, i) => {
    const num = String(i + 9).padStart(2, "0");
    return {
      id: `placeholder-${num}`,
      name: "???",
      title: "档案待录入",
      profession: "调查者" as Profession,
      positioning: "—",
      hp: 0,
      gender: "—",
      age: "—",
      birthday: "—",
      zodiac: "—",
      bloodType: "—",
      linkedCharacters: [],
      backgroundStory: "档案尚未录入。等待 2025 届设计 8 班的同学提交。",
      selectionLine: "...",
      avatar: "",
      portrait: "",
      selectionPortrait: "",
      skills: [],
      locked: true,
    };
  });
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
    extendedBackground: {
      origin: `生于联邦中央管制区第七生活圈，登记编号 NX-0414。父母皆为联邦能源研究所的中层技术官，自幼在被白光与无菌空气包裹的家庭长大。\n\n十二岁那年的入学体检中，她体内被检出极罕见的"暗物质亲和因子"，从此被列为"特别观察对象"。表面上她仍是优等生，私下里却开始接受联邦秘密机构"夜环"的强化训练。`,
      family: `父亲——夜城远，联邦能源研究所副所长，灾变日当夜失踪，仅留下一份未寄出的辞职信。\n母亲——蝶野澄，前研究员，灾变后精神崩溃，被收容至中央疗养所，至今未苏醒。\n妹妹——夜·萤，比她小七岁，灾变时正在中央学园寄宿，下落不明。`,
      pastExperiences: `15 岁时被强制纳入"暗影计划"，编号 NX-0414-S。在长达三年的实验中，她目睹同期的 23 名实验体在改造中死去，仅有自己存活并完成觉醒。\n\n灾变日当晚，研究所地下三层泄露失控，她在意识混乱中杀出包围，第一次以"夜·蝶"的代号出现在外部世界。她背着昏迷的导师走了 47 公里，最终将其安置在一处废弃地铁站后独自离开。`,
      currentSituation: `目前栖身于第十二街区的一栋旧公寓顶层，对外身份是夜班的霓虹灯维修工。她拒绝加入任何派系，只在黑雾浓度超过警戒值的夜晚出动，专门处理被感染的异变者与失控实验体。\n\n她仍在搜寻父亲留下的研究档案，这是她至今没有放弃这个名字的唯一理由。`,
      epilogue: `"如果有一天我也失去了理智，希望那道紫光，会是某个人最后的怜悯。" —— 摘自其随身记事本第 12 页`
    },
    preferences: {
      likes: ['深夜的雨', '黑咖啡（不加糖）', '老式怀表', '霓虹灯下的倒影'],
      dislikes: ['强光', '消毒水的气味', '过于亲昵的人', '需要解释自己'],
      favoriteColor: '深紫 / 暗夜蓝',
      habits: '入睡前会擦拭随身的两把战术短刃；从不在同一家店铺连续光顾两次。',
      motto: '"看不见我，就是最大的善意。"'
    },
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
    ],
    creator: {
      name: '示例 · 林若曦',
      studentId: '2025030101',
      className: '2025届设计8班',
      avatar: testAvatar,
      messageToCharacter: '夜·蝶，谢谢你陪我度过那些写不完作业的深夜。希望有一天，你也能放下手里的刀，安安静静地看一场不会被警报打断的雨。',
      proposedGameName: '方舟计划 · 夜环档案',
    }
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
  },
  ...makePlaceholders(),
];
