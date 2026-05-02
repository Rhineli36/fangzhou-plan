import boss1Image from "@assets/BOSS1测试_1777349128576.png";
import boss1BerserkImage from "@assets/BOSS特殊狂暴立绘_5回合内打出花葬.png";
import boss1DefeatImage from "@assets/BOSS1_defeat.png";
import boss1FlowerBurialImage from "@assets/BOSS_flower_burial.png";
import boss2Background from "@assets/boss2_background.png";
import boss2DefeatImage from "@assets/boss2_defeat.png";
import boss2Feiduan from "@assets/boss2_feiduan.png";
import boss2Cangqi from "@assets/boss2_cangqi.png";
import boss2FeiduanPortrait from "@assets/boss2_feiduan_portrait.png";
import boss2CangqiPortrait from "@assets/boss2_cangqi_portrait.png";
import boss2DualBlade from "@assets/boss2_dual_blade.png";
import boss2SyncOffset from "@assets/boss2_sync_offset.png";
import boss2Symbiosis from "@assets/boss2_symbiosis.png";
import boss2Compensation from "@assets/boss2_compensation.png";
import boss3Background from "@assets/boss3_background.png";
import boss3CastImage from "@assets/boss3_cast.png";
import boss3DefeatImage from "@assets/boss3_defeat.png";

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
  encounterType?: "single" | "twin" | "summoner";
  berserkImage?: string;
  flowerBurialImage?: string;
  defeatImage?: string;
  battleBackground?: string;
  dualBladeImage?: string;
  syncIcon?: string;
  symbiosisIcon?: string;
  compensationIcon?: string;
  units?: Array<{
    id: string;
    name: string;
    title: string;
    hp: number;
    image: string;
    portrait: string;
    blade: "red" | "blue";
    startsActive?: boolean;
  }>;
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
    flowerBurialImage: boss1FlowerBurialImage,
    defeatImage: boss1DefeatImage
  }
  ,
  {
    id: "boss-02",
    name: "双生刃鬼",
    title: "绯断 / 苍契",
    codename: 'B.I.F. No. BOSS-02 / "TWIN BLADE ECHOES"',
    tier: "首领",
    hp: 30,
    threatLevel: "5 级 / 不建议单人接触",
    classification: "高危突变体 · 镜像共生类",
    habitat: "废弃校区 · 樱花步道 / 夜间庭园区域",
    description: "目标通常以“两人”的形式出现，但观测记录均指向同一结论：她们不是两个人，而是将一个行为拆分成了两个存在。",
    backgroundStory:
      "灾变初期，某封闭学院曾进行“行为同步实验”，对象是一对双胞胎。实验第 14 天后，她们不再以姓名互称，而开始反复使用“绯断”与“苍契”两个称谓。第 21 天，监控画面出现动作不同步但结果一致的异常：两具身体做出不同动作，却达成同一行为结果。第 23 天，实验记录中断。救援队只找到一套血迹轨迹、两组脚印，以及两把磨损方向完全一致的训练刀。此后，废弃校区夜间庭园区域开始出现“绯断 / 苍契”。B.I.F. 推测，这并非两名个体的幸存记录，而是某种共生执行结构的残留。",
    abilities: [
      {
        name: "同步偏移",
        description: "苍契存在时，两体行动有约 0.3 秒的偏移，攻击难以被闪避或打断；苍契死亡或昏迷时，该天赋失效。",
        threat: "高",
      },
      {
        name: "共生",
        description: "任意一体被击倒后，另一体进入共生等待并跳过当前行动。若存活体撑到下一次敌方回合结束，倒下个体会以存活体当前生命值重构。",
        threat: "致命",
      },
      {
        name: "双相刃光",
        description: "绯断红刃造成 1-3 点伤害并可能附加重伤；苍契蓝刃造成 2 点伤害并可能附加失控。同一角色在同回合被两种刃光命中时，会额外获得恍惚与流血。",
        threat: "高",
      },
    ],
    mechanics: [
      {
        name: "同源补偿",
        description: "我方回合开始时，若绯断存活则苍契获得 1 回合攻击提升；若苍契存活则绯断获得 1 回合恢复。该增益可被清除，不会叠加。",
      },
      {
        name: "双目标战斗",
        description: "战斗中需要分别攻击绯断与苍契。逐个击破并不稳定，最好在压低血线后连续终止两体。",
      },
    ],
    strategyTips: [
      "同时管理两体血线，避免只击杀其中一体后让另一体完成共生重构。",
      "清除同源补偿可以显著降低本回合压力，尤其是苍契的攻击提升。",
      "尽量避免同一角色在同一回合连续承受红刃和蓝刃，否则会触发双相刃光。",
    ],
    weakness: "两体状态接近时，整体动作会出现轻微迟滞；一体倒下后的共生等待窗口是最稳定的突破口。",
    warning: "不要把她们当成两个独立敌人处理。绯断是开始，苍契是完成，过程未被同时终止，结果就会被修正。",
    encounterType: "twin",
    image: boss2Background,
    battleBackground: boss2Background,
    defeatImage: boss2DefeatImage,
    dualBladeImage: boss2DualBlade,
    syncIcon: boss2SyncOffset,
    symbiosisIcon: boss2Symbiosis,
    compensationIcon: boss2Compensation,
    units: [
      {
        id: "feiduan",
        name: "绯断",
        title: "红刃 · 先行动个体",
        hp: 15,
        image: boss2Feiduan,
        portrait: boss2FeiduanPortrait,
        blade: "red",
      },
      {
        id: "cangqi",
        name: "苍契",
        title: "蓝刃 · 响应个体",
        hp: 15,
        image: boss2Cangqi,
        portrait: boss2CangqiPortrait,
        blade: "blue",
      },
    ],
  },
  {
    id: "boss-03",
    name: "鸦月织影",
    title: "月下林地的召唤者",
    codename: 'B.I.F. No. BOSS-03 / "RAVEN MOON WEAVER"',
    tier: "首领",
    hp: 24,
    threatLevel: "5 级 / 召唤物压制型",
    classification: "高危突变体 · 隐匿召唤类",
    habitat: "月蚀森林 · 缚链祭坛",
    description: "目标藏身于蓝焰与树影之间，能不断呼唤黑狼替她挡住调查队的视线。只要狼仍在场，她本人就像被森林吞没一样难以锁定。",
    backgroundStory:
      "最早的记录来自一支夜巡队的残缺影像：镜头中只有月光、锁链和一圈幽蓝色火焰。队员反复确认自己听见了少女的低语，却没有任何人能指出声音从哪里传来。几秒后，狼影从画面边缘扑入，所有通讯同时中断。B.I.F. 将其暂定名为“鸦月织影”。她并不急于杀死入侵者，而是让猎物在狼爪、幻听与月光之间一点点失去判断。",
    abilities: [
      {
        name: "影狼召唤",
        description: "若场上没有影狼，鸦月织影会优先召唤一只影狼，并为自己附加隐匿。影狼存在时，本体无法被普通攻击直接选中。",
        threat: "高",
      },
      {
        name: "鸦月咒火",
        description: "影狼存在时释放的全体魔法。对全队造成 1 点伤害，并有概率附加恍惚或失控。",
        threat: "高",
      },
      {
        name: "林间回生",
        description: "生命低于一半时，鸦月织影会短暂回复生命并获得恢复。治疗不高，但会拖长战斗节奏。",
        threat: "中",
      },
    ],
    mechanics: [
      {
        name: "隐匿",
        description: "影狼存活时，本体保持隐匿。击败影狼、驱散隐匿或给本体施加标记，都是打开输出窗口的方式。",
      },
      {
        name: "影狼",
        description: "影狼会进行低伤害单体攻击，并附加流血。它本身生命较低，但若放任不管，会让 BOSS 稳定释放全体魔法。",
      },
    ],
    strategyTips: [
      "优先击败影狼，让本体显形后集中输出。",
      "带有标记、驱散、持续伤害的角色会明显降低她的节奏优势。",
      "如果队伍血线偏低，不要让影狼连续存活多个敌方回合。",
    ],
    weakness: "失去影狼保护后，本体防线明显松动；短时间爆发可以压过她的治疗节奏。",
    warning: "听见第二声鸦鸣时不要回头。记录显示，回头者通常会把影子误认为队友。",
    encounterType: "summoner",
    image: boss3Background,
    battleBackground: boss3Background,
    flowerBurialImage: boss3CastImage,
    defeatImage: boss3DefeatImage,
    units: [
      {
        id: "boss3-witch",
        name: "鸦月织影",
        title: "隐匿召唤者",
        hp: 24,
        image: boss3Background,
        portrait: boss3CastImage,
        blade: "red",
      },
      {
        id: "boss3-wolf",
        name: "影狼",
        title: "召唤物 · 低血量",
        hp: 6,
        image: boss3CastImage,
        portrait: boss3CastImage,
        blade: "blue",
        startsActive: false,
      },
    ],
  }
];

function readStoredBossId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("fangzhou-current-boss");
}

export let currentBoss = enemies.find(enemy => enemy.id === readStoredBossId()) ?? enemies[0];

export function setCurrentBoss(id: string) {
  const next = enemies.find(enemy => enemy.id === id);
  if (!next) return currentBoss;
  currentBoss = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("fangzhou-current-boss", id);
  }
  return currentBoss;
}
