import dazeIcon from "@assets/status_daze.png";
import bleedIcon from "@assets/status_bleed.png";
import shieldIcon from "@assets/status_shield.png";
import chargeIcon from "@assets/status_charging.png";
import attackUpIcon from "@assets/status_attack_up.png";
import damageBoostIcon from "@assets/status_damage_boost.png";
import immunityIcon from "@assets/status_immunity.png";
import markIcon from "@assets/status_mark.png";
import ambushIcon from "@assets/status_ambush.png";
import regenIcon from "@assets/status_regen.png";
import healBlockIcon from "@assets/status_heal_block.png";
import uncontrolledIcon from "@assets/status_uncontrolled.png";
import weakIcon from "@assets/status_weak.png";
import stealthIcon from "@assets/status_stealth.png";
import woundIcon from "@assets/status_wound.png";
import comaIcon from "@assets/status_coma.png";

export type StatusKind = "增益" | "减益" | "特殊";

export interface StatusDefinition {
  id: string;
  name: string;
  kind: StatusKind;
  icon: string;
  short: string;
  description: string;
  aliases?: string[];
}

export const statusCatalog: StatusDefinition[] = [
  {
    id: "shield",
    name: "护盾",
    kind: "增益",
    icon: shieldIcon,
    short: "抵消一次直接伤害。",
    description: "拥有护盾的角色受到直接伤害时，优先消耗 1 层护盾并抵消本次伤害。",
  },
  {
    id: "regen",
    name: "恢复",
    kind: "增益",
    icon: regenIcon,
    short: "回合开始时回复生命。",
    description: "回合开始时按层数回复生命。若目标带有禁止治疗，则恢复会被阻止；若带有重伤，则恢复效果会降低。",
    aliases: ["持续恢复"],
  },
  {
    id: "attackUp",
    name: "攻击提升",
    kind: "增益",
    icon: attackUpIcon,
    short: "提高本回合或持续期间的伤害。",
    description: "角色造成的直接伤害提高。若状态有层数，通常按层数追加伤害或倍率。",
    aliases: ["伤害强化", "攻击力提升"],
  },
  {
    id: "immunity",
    name: "技能免疫",
    kind: "增益",
    icon: immunityIcon,
    short: "免疫指定技能或负面状态。",
    description: "在持续期间免疫部分控制、减益或技能效果。具体免疫范围由技能文本决定。",
    aliases: ["免疫"],
  },
  {
    id: "stealth",
    name: "隐匿",
    kind: "增益",
    icon: stealthIcon,
    short: "无法被单体技能选中。",
    description: "隐匿目标通常不能被单体攻击或指定技能选择。标记、反隐匿或全体技能可以克制隐匿。",
  },
  {
    id: "damageBoost",
    name: "伤害强化",
    kind: "增益",
    icon: damageBoostIcon,
    short: "提高后续技能伤害。",
    description: "强化后续攻击或特定技能的伤害，可叠加时会按层数提高收益。",
  },
  {
    id: "charge",
    name: "蓄力",
    kind: "特殊",
    icon: chargeIcon,
    short: "准备强力行动。",
    description: "处于蓄力时会在之后释放强力技能。部分蓄力可以通过造成足够伤害或特定控制打断。",
  },
  {
    id: "mark",
    name: "标记",
    kind: "减益",
    icon: markIcon,
    short: "让目标更容易被追击。",
    description: "被标记的目标会触发部分技能的额外效果，例如追加伤害、刷新减益或无视隐匿。",
  },
  {
    id: "bleed",
    name: "流血",
    kind: "减益",
    icon: bleedIcon,
    short: "回合开始时受到伤害。",
    description: "回合开始时按层数受到生命损失。流血可以叠加，重复施加通常会刷新持续时间。",
  },
  {
    id: "daze",
    name: "恍惚",
    kind: "减益",
    icon: dazeIcon,
    short: "提高技能费用或干扰行动。",
    description: "恍惚会让角色行动变迟缓。目前主要表现为对应角色的手牌费用提高。",
  },
  {
    id: "weak",
    name: "虚弱",
    kind: "减益",
    icon: weakIcon,
    short: "降低造成的伤害。",
    description: "处于虚弱时造成的伤害降低，可叠加时会进一步削弱输出。",
  },
  {
    id: "wound",
    name: "重伤",
    kind: "减益",
    icon: woundIcon,
    short: "降低治疗收益。",
    description: "受到治疗时效果降低，适合针对高回复敌人或治疗型 Boss。",
  },
  {
    id: "healBlock",
    name: "禁止治疗",
    kind: "减益",
    icon: healBlockIcon,
    short: "无法获得生命恢复。",
    description: "持续期间无法通过技能或状态恢复生命，是限制治疗型敌人的关键状态。",
  },
  {
    id: "uncontrolled",
    name: "失控",
    kind: "减益",
    icon: uncontrolledIcon,
    short: "行动可能失败。",
    description: "行动时有概率失败。对玩家表现为出牌无效，对敌人表现为本次行动被跳过。",
  },
  {
    id: "ambush",
    name: "伏击",
    kind: "特殊",
    icon: ambushIcon,
    short: "预留一次反击或突袭。",
    description: "伏击是预备型状态，会在满足条件时触发追加攻击、反击或先制行动。",
  },
  {
    id: "coma",
    name: "昏迷",
    kind: "减益",
    icon: comaIcon,
    short: "跳过一次行动。",
    description: "昏迷会让目标跳过当前或下一次行动，通常由打断蓄力后的控制效果触发。",
  },
  {
    id: "silkDrain",
    name: "蛛丝汲生",
    kind: "增益",
    icon: regenIcon,
    short: "降低费用并在造成伤害后回复。",
    description: "目标卡牌费用降低。目标造成伤害后，莉拉和目标同时回复生命，持续 3 回合。",
  },
  {
    id: "overload",
    name: "过载分析",
    kind: "特殊",
    icon: attackUpIcon,
    short: "积累后转化为资源。",
    description: "阿德琳的专属计数。达到指定层数后会转化为抽牌、能量或后续治疗强化。",
    aliases: ["解析进度"],
  },
  {
    id: "memory",
    name: "记忆检索",
    kind: "特殊",
    icon: markIcon,
    short: "积累记忆碎片。",
    description: "林书瑶的专属计数。累积后可以强化技能、返还资源或触发额外增益。",
    aliases: ["记忆碎片"],
  },
  {
    id: "rewind",
    name: "时痕回溯",
    kind: "增益",
    icon: regenIcon,
    short: "预备复活。",
    description: "角色受到致命伤害时触发，恢复一定生命并对敌人造成反击。",
  },
];

export function getTalentStatusIconOverrides(talentIcon?: string): Partial<Record<string, string>> | undefined {
  if (!talentIcon) return undefined;
  return {
    overload: talentIcon,
    memory: talentIcon,
    rewind: talentIcon,
    chronosGuard: talentIcon,
    nextDraw: talentIcon,
    nextEnergy: talentIcon,
    nextHand: talentIcon,
  };
}

export const statusTerms = statusCatalog
  .flatMap(status => [status.name, ...(status.aliases ?? [])])
  .sort((a, b) => b.length - a.length);

export function getStatusByTerm(term: string): StatusDefinition | undefined {
  return statusCatalog.find(status => status.name === term || status.aliases?.includes(term));
}

export function collectStatusesFromText(...texts: Array<string | undefined>): StatusDefinition[] {
  const source = texts.filter(Boolean).join("\n");
  const seen = new Set<string>();
  const result: StatusDefinition[] = [];
  for (const status of statusCatalog) {
    const terms = [status.name, ...(status.aliases ?? [])];
    if (terms.some(term => source.includes(term)) && !seen.has(status.id)) {
      seen.add(status.id);
      result.push(status);
    }
  }
  return result;
}
