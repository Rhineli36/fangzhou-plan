import boss1Image from "@assets/BOSS1测试_1777349128576.png";
import boss1BerserkImage from "@assets/BOSS特殊狂暴立绘_5回合内打出花葬.png";
import boss1DefeatImage from "@assets/BOSS1_defeat.png";

export type EnemyTier = '杂兵' | '精英' | '首领' | '终焉';

export interface EnemySkill {
  name: string;
  description: string;
  threat: '低' | '中' | '高' | '致命';
}

export interface EnemyMechanic {
  name: string;
  description: string;
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
  mechanics: EnemyMechanic[];
  strategyTips: string[];
  weakness: string;
  warning: string;
  image: string;
  berserkImage?: string;
  defeatImage?: string;
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
        description: '无冷却的常规攻击。随机攻击 1 名角色，造成 1-2 点伤害，并赋予"恍惚"2 回合；花葬后目标改为全体。',
        threat: '高'
      },
      {
        name: '荆棘皇冕',
        description: '蓄力 2 回合，冷却 3 回合。释放后对全体角色造成 1 点伤害，并赋予 3 回合"流血"；蓄力期间累计造成 5 点伤害可打断。',
        threat: '致命'
      },
      {
        name: '花葬',
        description: '生命低于 10 点时触发一次。进入花葬后，迷雾摇篮曲变为全体，荆棘皇冕不再有冷却，但 BOSS 每回合开始时失去 2 点生命。',
        threat: '高'
      }
    ],
    mechanics: [
      {
        name: '恍惚',
        description: '处于恍惚的角色，其对应卡牌消耗能量 +1，持续 2 回合。BOSS 回合开始时，场上每有 1 名恍惚角色，BOSS 回复 2 点生命。'
      },
      {
        name: '流血',
        description: '处于流血的角色在回合开始时失去 1 点生命。流血可无限叠加，重复获得时刷新持续时间。'
      },
      {
        name: '蓄力打断',
        description: '荆棘皇冕蓄力期间可以被伤害打断：在蓄力窗口内累计对 BOSS 造成 5 点伤害，即可取消本次释放。'
      },
      {
        name: '特殊狂暴',
        description: '若 5 回合内将其打入花葬，可触发特殊狂暴演出。挑战奖励暂未公开。'
      }
    ],
    strategyTips: [
      '恍惚会抬高卡牌能量，并让 BOSS 持续回血；优先处理被恍惚影响的角色节奏。',
      '荆棘皇冕有蓄力窗口，集中输出 5 点伤害即可打断，是控制流血层数的关键。',
      '花葬后荆棘皇冕不再有冷却，但 BOSS 会每回合自损 2 点；进入收尾阶段后需要在续航与爆发之间做取舍。',
      '5 回合内触发花葬会进入特殊狂暴分支，适合高爆发队伍挑战，但风险明显上升。'
    ],
    weakness: '荆棘皇冕蓄力期间防线松动，集中伤害可打断其释放。',
    warning: '严禁直视其头骨双角之间的空洞——记录显示，连续直视超过 6 秒的调查员未能保持自我认知。',
    image: boss1Image,
    berserkImage: boss1BerserkImage,
    defeatImage: boss1DefeatImage
  }
];

export const currentBoss = enemies[0];
