import boss1Image from "@assets/BOSS1测试_1777349128576.png";

export type EnemyTier = '杂兵' | '精英' | '首领' | '终焉';

export interface EnemySkill {
  name: string;
  description: string;
  threat: '低' | '中' | '高' | '致命';
}

export interface Enemy {
  id: string;
  name: string;
  title: string;
  codename: string;
  tier: EnemyTier;
  hp: number;
  threatLevel: string;
  classification: string;
  habitat: string;
  description: string;
  backgroundStory: string;
  abilities: EnemySkill[];
  strategyTips: string[];
  weakness: string;
  warning: string;
  image: string;
}

export const enemies: Enemy[] = [
  {
    id: 'boss-01',
    name: '兽骨花冠',
    title: '迷雾深处的低语',
    codename: 'ENT-Ω-01 / "EWELAMB"',
    tier: '首领',
    hp: 28,
    threatLevel: 'S 级 / 不建议单人接触',
    classification: '高位异变体 · 群体感染源',
    habitat: '废弃森林带 · 浓雾覆盖区域',
    description: '披着白色长发与兽骨头冠的少女形态异变体。她的歌声会让听者陷入幻觉，分不清自己是猎物还是花园里的一朵花。',
    backgroundStory: `在灾变第三年，调查队第一次在北方废林深处录到了那段歌声。\n\n旋律温柔得近乎慈母，但任何一支接近源头的队伍都没有完整地回来过。幸存者的描述高度一致：一个被花朵与藤蔓裹住的少女身影，头戴一具公羊的颅骨，看不见眼睛，却始终"看着"他们。\n\n联邦档案将其命名为 "EWELAMB"——意为"带着羊面的羔羊"。\n据信她原本是灾变前一所女子修道院的孤儿，黑雾首次降临时，整座修道院在一夜之间被花海与白骨覆盖。她，是其中唯一站起来的"幸存者"。`,
    abilities: [
      {
        name: '迷雾摇篮曲',
        description: '吟唱一段催眠旋律，使全体角色随机弃掉手中 1 张牌，并陷入"恍惚"状态 1 回合。',
        threat: '高'
      },
      {
        name: '荆棘加冕',
        description: '从地面召唤血色荆棘缠绕指定目标，对其造成持续 3 回合的流血伤害，并使其每回合可用能量 -1。',
        threat: '致命'
      },
      {
        name: '花葬',
        description: '当自身生命值低于 40% 时进入"花葬"形态：免疫一切异常状态，攻击附带范围伤害，但每回合自损 1 点生命值。',
        threat: '高'
      }
    ],
    strategyTips: [
      '优先携带至少一名"调查者"或"支援者"，用以驱散"恍惚"与"流血"。',
      '回合循环不宜过长——她的"迷雾摇篮曲"会持续消耗你的手牌资源，速攻队比续航队更稳定。',
      '不要在第 5 回合前将其打入"花葬"形态，否则收尾阶段你的群体清场技能会被反制。',
      '面对单体高威胁时，前排"战斗者"应先吸收"荆棘加冕"，避免你的核心输出被锁能量。',
      '羁绊角色"残响"对其有微弱的精神抗性加成，若你队伍中有相关角色将获得隐性增益。'
    ],
    weakness: '对高频次小额能量伤害敏感；连续打断其吟唱可中止"摇篮曲"。',
    warning: '严禁直视其头骨双角之间的空洞——记录显示，连续直视超过 6 秒的调查员未能保持自我认知。',
    image: boss1Image
  }
];

export const currentBoss = enemies[0];
