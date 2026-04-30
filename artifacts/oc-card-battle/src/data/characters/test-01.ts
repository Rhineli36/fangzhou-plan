import type { Character } from "../character-types";
import testAvatar from "@assets/测试头像-1_1777347912995.png";
import testPortrait from "@assets/测试立绘-1_1777347909226.png";
import testSelectionPortrait from "@assets/选择立绘-1_1777347905177.png";
import shadowWalkIcon from "@assets/night_shadow_walk.png";
import zidianKillIcon from "@assets/night_zidian_kill.png";
import voidBladeIcon from "@assets/night_void_blade.png";

const character: Character = {
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
    epilogue: `那住她终于找到了父亲留下的研究档案，里面藏着关于母亲的真相。她带着妹妹离开了第十一街区，没有再回头。多年后，下城区的孩子们仍在传说，只要在黑雾最浓的夜晚抬头，就能看见一抹紫色的闪电--那是她回来看看故人的方式。

她最初的羁绊从未褪色，只是换了一种方式存在。

"如果有一天我也失去了理智，希望那道紫光，会是某个人最后的怜悯。" —— 摘自其随身记事本第 12 页`
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
      upgrade: '暴击伤害提升 50%',
      icon: shadowWalkIcon
    },
    {
      name: '紫电瞬杀',
      type: '攻击',
      description: '化作紫色闪电穿透敌人，造成巨额物理与能量混合伤害。',
      range: '单体',
      cost: 3,
      effect: '造成 250% 攻击力的伤害',
      upgrade: '若击杀目标，返还 2 点能量',
      icon: zidianKillIcon
    },
    {
      name: '虚空刃舞',
      type: '异能',
      description: '召唤多把暗影之刃，对范围内的所有敌人进行无差别打击。',
      range: '多体',
      cost: 4,
      effect: '对所有敌人造成 120% 伤害',
      upgrade: '附带流血效果，持续 2 回合',
      icon: voidBladeIcon
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
};

export default character;
