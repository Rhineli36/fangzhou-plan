import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { characters, Character, Skill, isCharacterBattleReady } from "@/data/characters";
import { currentBoss } from "@/data/enemies";
import { bossClearStories } from "@/data/story";
import { useTeamStore } from "@/store/teamStore";
import { ArrowLeft, RotateCcw, Sparkles, Swords, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dazeIcon from "@assets/status_daze.png";
import bleedIcon from "@assets/status_bleed.png";
import shieldIcon from "@assets/status_shield.png";
import chargeIcon from "@assets/status_charging.png";
import attackUpIcon from "@assets/status_attack_up.png";
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
import { SkillDiscardHint, SkillStatusHints, StatusTermText } from "@/components/StatusGlossary";
import { getTalentStatusIconOverrides } from "@/data/statusCatalog";

type StatusId =
  | "talent"
  | "daze"
  | "bleed"
  | "shield"
  | "charge"
  | "attackUp"
  | "immunity"
  | "mark"
  | "ambush"
  | "regen"
  | "healBlock"
  | "damageBoost"
  | "uncontrolled"
  | "weak"
  | "stealth"
  | "wound"
  | "mistResist"
  | "overload"
  | "memory"
  | "rewind"
  | "chronosGuard"
  | "nextDraw"
  | "nextEnergy"
  | "nextHand"
  | "coma"
  | "silkDrain"
  | "lilaReviveUsed"
  | "irisField"
  | "twinSymbiosis"
  | "twinCompensation"
  | "dualBlade";
type Phase = "player" | "enemy" | "victory" | "defeat";

interface Status {
  id: StatusId;
  name: string;
  icon: string;
  duration?: number;
  stacks?: number;
  description: string;
}

interface Fighter {
  character: Character;
  hp: number;
  maxHp: number;
  statuses: Status[];
}

interface BattleCard {
  uid: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  skill: Skill;
}

interface EnemyTarget {
  id: string;
  name: string;
  title: string;
  image: string;
  hp: number;
  maxHp: number;
  statuses: Status[];
  selected: boolean;
}

interface EnemyUnitState {
  id: string;
  name: string;
  title: string;
  image: string;
  portrait: string;
  blade: "red" | "blue";
  hp: number;
  maxHp: number;
  statuses: Status[];
}

interface BossState {
  hp: number;
  maxHp: number;
  statuses: Status[];
  flowerBurial: boolean;
  berserk: boolean;
  crownCooldown: number;
  charging: null | { remaining: number; damageTaken: number };
}

interface BattleState {
  turn: number;
  energy: number;
  maxEnergy: number;
  maxHand: number;
  drawPerTurn: number;
  phase: Phase;
  fighters: Fighter[];
  boss: BossState;
  enemyUnits: EnemyUnitState[];
  deck: BattleCard[];
  discard: BattleCard[];
  hand: BattleCard[];
  zidianCount: number;
  quickShotCount: number;
  emergencyReserveCount: number;
  playedThisTurn: string[];
  playedSkillNames: string[];
  log: string[];
  finaleLine: string;
  recentHitIds: string[];
  selectedEnemyId?: string;
  flowerBurialFlash: boolean;
  flowerBurialRevealed: boolean;
}

interface IntroSlide {
  kind: "boss" | "talent" | "start";
  title: string;
  subtitle: string;
  image?: string;
  line: string;
}

const victoryLines = [
  "啊……原来……我才是多余的那一个吗……",
  "花……还没开完呢……",
  "没关系……我们……还会再见的……",
];

const defeatLines = [
  "看，你也变得安静了。",
  "多好……再也不会痛苦了。",
  "别担心，我会记住你。",
  "下一朵花……会开得更漂亮。",
];

const bossIntroLines: Record<string, string> = {
  "boss-01": "花还没有开完。你们也是来看我的吗？",
  "boss-02": "我来开始。她会完成。你们已经在过程之中了。",
  "boss-03": "别踩碎蓝色的火。它们会替我记住，你们每一次呼吸的位置。",
  "boss-04": "赤月已经升起。猎场关闭，审判开始。",
  "boss-05": "请安静。祷告结束后，神会亲自回答你们。",
};

const LOG_LIMIT = 80;

const statusText: Partial<Record<StatusId, string>> = {
  talent: "天赋",
  daze: "恍惚",
  bleed: "流血",
  shield: "护盾",
  charge: "蓄力",
  attackUp: "攻击提升",
  immunity: "技能免疫",
  mark: "标记",
  ambush: "伏击",
  regen: "恢复",
  healBlock: "禁止治疗",
  damageBoost: "伤害强化",
  uncontrolled: "失控",
  weak: "虚弱",
  stealth: "隐匿",
  wound: "重伤",
  mistResist: "黑雾抗性",
  overload: "过载分析",
  memory: "记忆检索",
  rewind: "时痕回溯",
  chronosGuard: "时序守护",
  nextDraw: "摸牌提升",
  nextEnergy: "能量提升",
  nextHand: "手牌上限提升",
  coma: "昏迷",
  silkDrain: "蛛丝汲生",
  lilaReviveUsed: "朽茧余温",
  irisField: "时滞刀域",
};

function makeStatus(id: StatusId, patch: Partial<Status> = {}): Status {
  const base: Partial<Record<StatusId, Status>> = {
    talent: {
      id,
      name: patch.name ?? "天赋",
      icon: patch.icon ?? "",
      description: patch.description ?? "战斗开始时自动生效。",
    },
    daze: {
      id,
      name: "恍惚",
      icon: dazeIcon,
      duration: 2,
      stacks: 1,
      description: "该角色对应卡牌能量 +1；BOSS 回合开始时每层为 BOSS 回复 2 点生命。",
    },
    bleed: {
      id,
      name: "流血",
      icon: bleedIcon,
      duration: 3,
      stacks: 1,
      description: "回合开始时每层失去 1 点生命，重复获得时刷新持续时间。",
    },
    shield: {
      id,
      name: "护盾",
      icon: shieldIcon,
      stacks: 1,
      description: "免疫下一次直接伤害，触发后消耗 1 层。",
    },
    charge: {
      id,
      name: "蓄力",
      icon: chargeIcon,
      duration: 1,
      description: "荆棘皇冕正在蓄力；累计造成 5 点伤害可打断。",
    },
    attackUp: {
      id,
      name: "攻击提升",
      icon: attackUpIcon,
      duration: 1,
      description: "持续期间伤害卡额外造成 1 点伤害。",
    },
    immunity: {
      id,
      name: "技能免疫",
      icon: immunityIcon,
      duration: 1,
      description: "本回合免疫新获得的减益状态。",
    },
    mark: {
      id,
      name: "标记",
      icon: markIcon,
      duration: 2,
      stacks: 1,
      description: "隐匿无效；受到伤害时每层提供 50% 几率额外承受 1 点伤害，2 层后必定触发。",
    },
    ambush: {
      id,
      name: "伏击",
      icon: ambushIcon,
      duration: 1,
      description: "伏击类效果预留状态。",
    },
    regen: {
      id,
      name: "恢复",
      icon: regenIcon,
      duration: 2,
      stacks: 1,
      description: "回合开始时每层回复 1 点生命，重复获得时刷新持续时间。",
    },
    healBlock: {
      id,
      name: "禁止治疗",
      icon: healBlockIcon,
      duration: 2,
      description: "无法获得生命恢复。",
    },
    damageBoost: {
      id,
      name: "伤害强化",
      icon: attackUpIcon,
      duration: 2,
      stacks: 1,
      description: "造成的伤害提高，每层 +1。",
    },
    uncontrolled: {
      id,
      name: "失控",
      icon: uncontrolledIcon,
      duration: 1,
      description: "行动有 40% 几率失误。玩家出牌无效，敌人行动无效。",
    },
    weak: {
      id,
      name: "虚弱",
      icon: weakIcon,
      duration: 2,
      stacks: 1,
      description: "造成的伤害 -1，可叠加。",
    },
    stealth: {
      id,
      name: "隐匿",
      icon: stealthIcon,
      duration: 1,
      description: "无法被单体技能选中；被标记或反隐匿效果克制。",
    },
    wound: {
      id,
      name: "重伤",
      icon: woundIcon,
      duration: 2,
      description: "生命恢复效果减半。",
    },
    mistResist: {
      id,
      name: "黑雾抗性校准",
      icon: immunityIcon,
      stacks: 1,
      description: "下一次受到减益时，抵抗判定提高 25%。抵抗成功后重置。",
    },
    overload: {
      id,
      name: "过载分析",
      icon: attackUpIcon,
      stacks: 1,
      description: "阿德琳·温莎的天赋计数；达到 3 层时转化为抽牌与能量。",
    },
    memory: {
      id,
      name: "记忆检索",
      icon: markIcon,
      stacks: 1,
      description: "林书瑶的天赋计数；达到 4 层时强化全队增益。",
    },
    rewind: {
      id,
      name: "时痕回溯",
      icon: regenIcon,
      duration: 2,
      description: "死亡时以 3 点生命复活，并反击造成 3 点伤害。",
    },
    chronosGuard: {
      id,
      name: "时序守护",
      icon: shieldIcon,
      stacks: 3,
      description: "队友护盾被清除时回复 1 点生命，最多触发 3 次。",
    },
    nextDraw: {
      id,
      name: "摸牌提升",
      icon: attackUpIcon,
      duration: 1,
      stacks: 1,
      description: "下回合抽牌数量提高。",
    },
    nextEnergy: {
      id,
      name: "能量提升",
      icon: attackUpIcon,
      duration: 1,
      stacks: 1,
      description: "下回合能量恢复提高。",
    },
    nextHand: {
      id,
      name: "手牌上限提升",
      icon: attackUpIcon,
      duration: 1,
      stacks: 1,
      description: "下回合手牌上限提高。",
    },
    coma: {
      id,
      name: "昏迷",
      icon: comaIcon,
      duration: 1,
      description: "跳过一次行动。",
    },
    silkDrain: {
      id,
      name: "蛛丝汲生",
      icon: regenIcon,
      duration: 3,
      description: "卡牌费用 -1；造成伤害后，莉拉和目标同时回复 1 点生命，持续 3 回合。",
    },
    lilaReviveUsed: {
      id,
      name: "朽茧余温",
      icon: regenIcon,
      description: "莉拉的复活天赋已经触发过。",
    },
    irisField: {
      id,
      name: "时滞刀域",
      icon: attackUpIcon,
      duration: 1,
      description: "鸢尾卡牌费用 -1，造成伤害 +1。",
    },
  };
  return {
    ...(base[id] ?? {
      id,
      name: statusText[id] ?? id,
      icon: patch.icon ?? currentBoss.image,
      description: patch.description ?? "",
    }),
    ...patch,
  };
}

function addOrRefreshStatus(statuses: Status[], status: Status): Status[] {
  const existing = statuses.find(s => s.id === status.id);
  if (!existing) return [...statuses, status];
  if (status.id === "mark") {
    return statuses.map(s =>
      s.id === status.id
        ? {
            ...s,
            duration: (s.duration ?? 0) + 1,
            stacks: (s.stacks ?? 1) + (status.stacks ?? 1),
          }
        : s,
    );
  }
  if (status.id === "uncontrolled" || status.id === "silkDrain" || status.id === "irisField" || status.id === "coma") {
    return statuses.map(s => (s.id === status.id ? { ...s, duration: status.duration ?? s.duration, icon: status.icon || s.icon } : s));
  }
  if (status.id === "healBlock" && status.duration !== undefined) {
    const duration = status.duration;
    return statuses.map(s =>
      s.id === status.id
        ? {
            ...s,
            duration: (s.duration ?? 0) + duration,
            stacks: (s.stacks ?? 1) + (status.stacks ?? 1),
          }
        : s,
    );
  }
  return statuses.map(s =>
    s.id === status.id
      ? {
          ...s,
          duration: status.duration ?? s.duration,
          stacks: (s.stacks ?? 1) + (status.stacks ?? 1),
        }
      : s,
  );
}

const debuffIds: StatusId[] = ["daze", "bleed", "mark", "healBlock", "uncontrolled", "weak", "wound", "coma", "dualBlade"];
const buffIds: StatusId[] = ["shield", "attackUp", "immunity", "regen", "damageBoost", "stealth", "rewind", "nextDraw", "nextEnergy", "nextHand", "silkDrain", "irisField", "twinSymbiosis", "twinCompensation"];

function isDebuff(status: Status): boolean {
  return debuffIds.includes(status.id);
}

function isBuff(status: Status): boolean {
  return buffIds.includes(status.id);
}

function removeOneDebuff(statuses: Status[]): Status[] {
  const index = statuses.findIndex(isDebuff);
  if (index === -1) return statuses;
  return statuses.filter((_, i) => i !== index);
}

function removeDebuffs(statuses: Status[], amount: number): Status[] {
  let remaining = amount;
  return statuses.filter(status => {
    if (remaining > 0 && isDebuff(status)) {
      remaining -= 1;
      return false;
    }
    return true;
  });
}

function removeRandomDebuffs(statuses: Status[], amount: number): Status[] {
  const debuffIndexes = statuses
    .map((status, index) => ({ status, index }))
    .filter(item => isDebuff(item.status))
    .map(item => item.index);
  const toRemove = new Set<number>();
  const candidates = [...debuffIndexes];
  while (toRemove.size < amount && candidates.length > 0) {
    const picked = Math.floor(Math.random() * candidates.length);
    toRemove.add(candidates[picked]);
    candidates.splice(picked, 1);
  }
  return statuses.filter((_, index) => !toRemove.has(index));
}

function removeSpecificStatus(statuses: Status[], id: StatusId): Status[] {
  return statuses.filter(status => status.id !== id);
}

function decrementDurations(statuses: Status[]): Status[] {
  return statuses
    .map(status => (status.duration === undefined ? status : { ...status, duration: status.duration - 1 }))
    .filter(status => status.duration === undefined || status.duration > 0);
}

function getActiveSkills(character: Character): Skill[] {
  return character.skills.filter(skill => skill.type !== "天赋").slice(0, 3);
}

function getTalent(character: Character): Skill | undefined {
  return character.skills.find(skill => skill.type === "天赋");
}

function makeTalentStatus(character: Character, id: StatusId, patch: Partial<Status> = {}): Status {
  const talent = getTalent(character);
  return makeStatus(id, {
    icon: talent?.icon || character.avatar,
    ...patch,
  });
}

function getSkillCost(skill: Skill): number {
  if (skill.name === "雾愈之触") return 1;
  if (skill.name === "幻海囚笼") return 2;
  if (skill.name === "时序祷言") return 2;
  if (skill.name === "残响视能") return 2;
  if (skill.name === "紫电瞬杀") return 2;
  if (skill.name === "虚空刃舞") return 4;
  if (skill.name === "残步影") return 2;
  if (skill.name === "残响屏障") return 2;
  if (skill.name === "赤刃·裂空") return 3;
  if (skill.name === "烬影·回溯") return 2;
  if (skill.name === "剥离、千层刃") return 3;
  if (skill.name === "层解、回溯") return 2;
  if (skill.name === "空心、归寂") return 3;
  return Math.max(1, skill.cost || 2);
}

function getCardCost(card: BattleCard, fighters: Fighter[]): number {
  const owner = fighters.find(f => f.character.id === card.ownerId);
  const dazeStacks = owner?.statuses
    .filter(s => s.id === "daze")
    .reduce((sum, s) => sum + (s.stacks ?? 1), 0) ?? 0;
  const supportDiscount = owner?.statuses.some(status => status.id === "silkDrain") ? 1 : 0;
  const fieldDiscount = owner?.statuses.some(status => status.id === "irisField") ? 1 : 0;
  const quickShotDiscount = card.skill.name === "快速射击" ? card.uid.includes("generated") ? 0 : 0 : 0;
  return Math.max(0, getSkillCost(card.skill) + dazeStacks - quickShotDiscount - supportDiscount - fieldDiscount);
}

function makeDeck(team: Character[]): BattleCard[] {
  const cards: BattleCard[] = [];
  for (const character of team) {
    const skills = getActiveSkills(character);
    const copies = skills.length === 3 ? 2 : skills.length === 2 ? 3 : 6;
    for (const skill of skills) {
      for (let i = 0; i < copies; i++) {
        cards.push({
          uid: `${character.id}-${skill.name}-${i}-${Math.random().toString(36).slice(2)}`,
          ownerId: character.id,
          ownerName: character.name,
          ownerAvatar: character.avatar,
          skill,
        });
      }
    }
  }
  return shuffle(cards);
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function drawCards(state: BattleState, amount: number): BattleState {
  let deck = [...state.deck];
  let discard = [...state.discard];
  const hand = [...state.hand];

  for (let i = 0; i < amount && hand.length < state.maxHand; i++) {
    if (deck.length === 0) {
      deck = shuffle(discard);
      discard = [];
      if (deck.length === 0) break;
    }
    const card = deck.shift();
    if (card) hand.push(card);
  }

  return { ...state, deck, discard, hand };
}

function makeCard(character: Character, skill: Skill, suffix = "generated"): BattleCard {
  return {
    uid: `${character.id}-${skill.name}-${suffix}-${Math.random().toString(36).slice(2)}`,
    ownerId: character.id,
    ownerName: character.name,
    ownerAvatar: character.avatar,
    skill,
  };
}

function addGeneratedCard(state: BattleState, character: Character, skill: Skill): BattleState {
  return { ...state, hand: [...state.hand, makeCard(character, skill)] };
}

function drawOwnerCards(state: BattleState, ownerId: string, amount: number, excludeSkillName?: string): BattleState {
  const owner = state.fighters.find(fighter => fighter.character.id === ownerId)?.character;
  if (!owner) return state;
  const candidates = getActiveSkills(owner).filter(skill => skill.name !== excludeSkillName);
  let next = state;
  for (let i = 0; i < amount && next.hand.length < next.maxHand && candidates.length > 0; i++) {
    const skill = candidates[Math.floor(Math.random() * candidates.length)];
    next = addGeneratedCard(next, owner, skill);
  }
  return next;
}

function getBaseMaxHand(team: Character[]): number {
  return team.some(character => character.creator?.studentId === "12250801") ? 8 : 7;
}

function createInitialState(team: Character[]): BattleState {
  const talentLogs: string[] = [];
  const fighters = team.map(character => {
    const talent = getTalent(character);
    if (talent) {
      talentLogs.push(`【${character.name}】天赋「${talent.name}」启动：${talent.effect || talent.description}`);
    }
    return {
      character,
      hp: character.hp,
      maxHp: character.hp,
      statuses: talent
        ? [
            makeStatus("talent", {
              name: talent.name,
              icon: talent.icon || character.avatar,
              description: talent.description || talent.effect,
            }),
          ]
        : [],
    };
  });
  const enemyUnits: EnemyUnitState[] = (currentBoss.units ?? []).map(unit => ({
    id: unit.id,
    name: unit.name,
    title: unit.title,
    image: unit.image,
    portrait: unit.portrait,
    blade: unit.blade,
    hp: unit.startsActive === false ? 0 : unit.hp,
    maxHp: unit.hp,
    statuses: [],
  }));
  const visibleBossUnit = currentBoss.encounterType === "summoner"
    ? enemyUnits.find(unit => unit.id === "boss3-witch")
    : currentBoss.encounterType === "finale"
      ? enemyUnits.find(unit => unit.id === "boss5-nun")
    : undefined;

  const base: BattleState = {
    turn: 1,
    energy: 5,
    maxEnergy: team.some(character => character.creator?.studentId === "12250801") ? 12 : 10,
    maxHand: getBaseMaxHand(team),
    drawPerTurn: 3,
    phase: "player",
    fighters,
    enemyUnits,
    boss: {
      hp: visibleBossUnit ? visibleBossUnit.hp : enemyUnits.length ? enemyUnits.reduce((sum, unit) => sum + unit.hp, 0) : currentBoss.hp,
      maxHp: visibleBossUnit ? visibleBossUnit.maxHp : enemyUnits.length ? enemyUnits.filter(unit => unit.hp > 0).reduce((sum, unit) => sum + unit.maxHp, 0) : currentBoss.hp,
      statuses: [],
      flowerBurial: false,
      berserk: false,
      crownCooldown: 0,
      charging: null,
    },
    deck: makeDeck(team),
    discard: [],
    hand: [],
    zidianCount: 0,
    quickShotCount: 0,
    emergencyReserveCount: 0,
    playedThisTurn: [],
    playedSkillNames: [],
    log: [`战斗开始。方舟小队遭遇${currentBoss.name}。`, ...talentLogs],
    finaleLine: "",
    recentHitIds: [],
    flowerBurialFlash: false,
    flowerBurialRevealed: false,
  };

  let withOpeningCards = drawCards(base, 5);
  const sailasi = team.find(character => character.creator?.studentId === "12250806");
  if (sailasi) {
    const fate = getActiveSkills(sailasi).find(skill => skill.name === "命运折射");
    if (fate) withOpeningCards = addGeneratedCard(withOpeningCards, sailasi, fate);
  }
  return withOpeningCards;
}

function needsAllyTarget(card: BattleCard): boolean {
  return [
    "雾愈之触",
    "残响视能",
    "时序祷言",
    "应急储备",
    "星辰律动",
    "记忆重构·档案提取",
    "理论具现·熵减治疗",
    "净化领域",
    "安护屏障",
    "废墟行者",
    "蛛丝汲生",
    "雾翼庇护",
    "残响屏障",
  ].includes(card.skill.name);
}

function isSelfCast(card: BattleCard): boolean {
  return ["预知残影", "时痕回溯", "残影读秒", "念念不忘", "时滞刀域", "异化释放", "烬影·回溯"].includes(card.skill.name);
}

function applyDamageToFighter(fighter: Fighter, amount: number): { fighter: Fighter; blocked: boolean; damage: number } {
  let incoming = amount;
  if (fighter.character.creator?.studentId === "12250817" && fighter.statuses.some(status => status.id === "stealth" || status.id === "ambush")) {
    incoming = Math.max(0, incoming - 1);
  }
  const shield = fighter.statuses.find(s => s.id === "shield" && (s.stacks ?? 0) > 0);
  if (shield) {
    const statuses = fighter.statuses
      .map(status => (status.id === "shield" ? { ...status, stacks: (status.stacks ?? 1) - 1 } : status))
      .filter(status => status.id !== "shield" || (status.stacks ?? 0) > 0);
    return { fighter: { ...fighter, statuses }, blocked: true, damage: 0 };
  }
  return { fighter: { ...fighter, hp: Math.max(0, fighter.hp - incoming) }, blocked: false, damage: incoming };
}

function afterFighterDamaged(state: BattleState, fighter: Fighter, logs: string[]): { state: BattleState; fighter: Fighter } {
  let next = state;
  let nextFighter = fighter;

  if (nextFighter.hp <= 0 && nextFighter.statuses.some(status => status.id === "rewind")) {
    nextFighter = {
      ...nextFighter,
      hp: Math.min(3, nextFighter.maxHp),
      statuses: removeSpecificStatus(nextFighter.statuses, "rewind"),
    };
    next = applyBossDamage(next, 3, logs);
    logs.push(`${nextFighter.character.name} 的时痕回溯触发：复活并反击 3 点伤害。`);
    if (next.boss.statuses.some(status => status.id === "mark")) {
      const quick = getActiveSkills(nextFighter.character).find(skill => skill.name === "快速射击");
      if (quick) {
        next = addGeneratedCard(addGeneratedCard(next, nextFighter.character, quick), nextFighter.character, quick);
        logs.push("目标处于标记状态，生成 2 张快速射击。");
      }
    }
  }

  if (nextFighter.character.creator?.studentId === "12250806" && Math.random() < 0.5) {
    const fate = getActiveSkills(nextFighter.character).find(skill => skill.name === "命运折射");
    if (fate) {
      next = addGeneratedCard(next, nextFighter.character, fate);
      logs.push("星之残响触发：获得 1 张命运折射。");
    }
  }

  if (nextFighter.hp <= 0 && nextFighter.character.creator?.studentId === "12250813" && !nextFighter.statuses.some(status => status.id === "lilaReviveUsed")) {
    nextFighter = {
      ...nextFighter,
      statuses: addOrRefreshStatus(nextFighter.statuses, makeTalentStatus(nextFighter.character, "lilaReviveUsed")),
    };
    logs.push("朽茧余温预备触发：莉拉将在下个己方回合复苏。");
  }

  if (nextFighter.character.creator?.studentId === "12250816" && nextFighter.hp > 0 && Math.random() < 0.4) {
    next = { ...next, energy: Math.min(next.maxEnergy, next.energy + 1) };
    logs.push("残时回响触发：鸢尾受到伤害，恢复 1 点能量。");
  }

  return { state: next, fighter: nextFighter };
}

function healFighter(fighter: Fighter, amount: number): Fighter {
  if (amount <= 0 || fighter.hp <= 0) return fighter;
  if (fighter.statuses.some(status => status.id === "healBlock")) return fighter;
  const wounded = fighter.statuses.some(status => status.id === "wound");
  const heal = wounded ? Math.ceil(amount / 2) : amount;
  return { ...fighter, hp: Math.min(fighter.maxHp, fighter.hp + heal) };
}

function applyDebuffToFighter(state: BattleState, fighterIndex: number, status: Status, logs: string[]): { state: BattleState; resisted: boolean } {
  const fighter = state.fighters[fighterIndex];
  if (!fighter || fighter.hp <= 0) return { state, resisted: false };
  if (fighter.statuses.some(existing => existing.id === "immunity")) {
    logs.push(`${fighter.character.name} 免疫了「${status.name}」。`);
    return { state, resisted: true };
  }

  if (fighter.character.creator?.studentId === "12250820" && isDebuff(status)) {
    const resistBonus = Math.min(2, getStatusStacks(fighter.statuses, "mistResist"));
    const chance = Math.min(1, 0.5 + resistBonus * 0.25);
    if (Math.random() < chance) {
      const cleansed = { ...fighter, statuses: removeSpecificStatus(fighter.statuses, "mistResist") };
      const healed = healFighter(cleansed, 1);
      logs.push(`${fighter.character.name} 的黑雾抗性抵抗了「${status.name}」，回复 1 点生命并获得 1 点能量。`);
      return {
        state: {
          ...state,
          energy: Math.min(state.maxEnergy, state.energy + 1),
          fighters: state.fighters.map((item, index) => (index === fighterIndex ? healed : item)),
        },
        resisted: true,
      };
    }

    const calibrated = addOrRefreshStatus(
      fighter.statuses,
      makeTalentStatus(fighter.character, "mistResist", { stacks: 1 }),
    );
    logs.push(`${fighter.character.name} 的黑雾抗性判定失败，下次抵抗率提高 25%。`);
    return {
      state: {
        ...state,
        fighters: state.fighters.map((item, index) =>
          index === fighterIndex ? { ...fighter, statuses: addOrRefreshStatus(calibrated, status) } : item,
        ),
      },
      resisted: false,
    };
  }

  return {
    state: {
      ...state,
      fighters: state.fighters.map((item, index) =>
        index === fighterIndex ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, status) } : item,
      ),
    },
    resisted: false,
  };
}

function healBoss(state: BattleState, amount: number): BattleState {
  if (amount <= 0 || state.boss.hp <= 0) return state;
  if (state.boss.statuses.some(status => status.id === "healBlock")) return state;
  const wounded = state.boss.statuses.some(status => status.id === "wound");
  const heal = wounded ? Math.ceil(amount / 2) : amount;
  return { ...state, boss: { ...state.boss, hp: Math.min(state.boss.maxHp, state.boss.hp + heal) } };
}

function getStatusStacks(statuses: Status[], id: StatusId): number {
  return statuses.filter(status => status.id === id).reduce((sum, status) => sum + (status.stacks ?? 1), 0);
}

function getFighterDamageBonus(fighter?: Fighter): number {
  if (!fighter) return 0;
  const attackUp = getStatusStacks(fighter.statuses, "attackUp");
  const damageBoost = getStatusStacks(fighter.statuses, "damageBoost");
  const irisField = fighter.statuses.some(status => status.id === "irisField") ? 1 : 0;
  const weak = getStatusStacks(fighter.statuses, "weak");
  return attackUp + damageBoost + irisField - weak;
}

function refreshBossDebuffs(boss: BossState): BossState {
  return {
    ...boss,
    statuses: boss.statuses.map(status => (isDebuff(status) && status.duration !== undefined ? { ...status, duration: Math.max(status.duration, 2) } : status)),
  };
}

function hasEnemyUnits(state: BattleState): boolean {
  return state.enemyUnits.length > 0;
}

function syncAggregateBoss(state: BattleState): BattleState {
  if (!hasEnemyUnits(state)) return state;
  if (currentBoss.encounterType === "summoner") {
    const bossUnit = state.enemyUnits.find(unit => unit.id === "boss3-witch");
    return { ...state, boss: { ...state.boss, hp: bossUnit?.hp ?? 0, maxHp: bossUnit?.maxHp ?? currentBoss.hp } };
  }
  if (currentBoss.encounterType === "finale") {
    const active = state.enemyUnits.filter(unit => unit.hp > 0);
    const hp = active.reduce((sum, unit) => sum + unit.hp, 0);
    const maxHp = active.reduce((sum, unit) => sum + unit.maxHp, 0) || currentBoss.hp;
    return { ...state, boss: { ...state.boss, hp, maxHp } };
  }
  const hp = state.enemyUnits.reduce((sum, unit) => sum + unit.hp, 0);
  const maxHp = state.enemyUnits.reduce((sum, unit) => sum + unit.maxHp, 0);
  return { ...state, boss: { ...state.boss, hp, maxHp } };
}

function firstAliveEnemyId(state: BattleState): string | undefined {
  return state.enemyUnits.find(unit => unit.hp > 0)?.id;
}

function getTargetEnemyId(state: BattleState, targetId?: string): string | undefined {
  if (!hasEnemyUnits(state)) return undefined;
  if (currentBoss.encounterType === "summoner") {
    const wolf = state.enemyUnits.find(unit => unit.id === "boss3-wolf" && unit.hp > 0);
    const witch = state.enemyUnits.find(unit => unit.id === "boss3-witch");
    const witchMarked = witch?.statuses.some(status => status.id === "mark");
    const liVaughnAlive = state.fighters.some(fighter => fighter.character.creator?.studentId === "12250805" && fighter.hp > 0);
    if (targetId === "boss3-witch" && wolf && !witchMarked && !liVaughnAlive) return wolf.id;
    if (!targetId && wolf) return wolf.id;
  }
  if (!targetId && state.selectedEnemyId && state.enemyUnits.some(unit => unit.id === state.selectedEnemyId && unit.hp > 0)) return state.selectedEnemyId;
  if (targetId && state.enemyUnits.some(unit => unit.id === targetId && unit.hp > 0)) return targetId;
  return firstAliveEnemyId(state);
}

function addEnemyStatus(state: BattleState, status: Status, targetId?: string): BattleState {
  if (!hasEnemyUnits(state)) {
    return { ...state, boss: { ...state.boss, statuses: addOrRefreshStatus(state.boss.statuses, status) } };
  }
  const explicitMarkTarget =
    status.id === "mark" && targetId && state.enemyUnits.some(unit => unit.id === targetId && unit.hp > 0)
      ? targetId
      : undefined;
  const id = explicitMarkTarget ?? getTargetEnemyId(state, targetId);
  if (!id) return state;
  const target = state.enemyUnits.find(unit => unit.id === id);
  if (target?.statuses.some(existing => existing.id === "immunity") && isDebuff(status)) return state;
  return {
    ...state,
    enemyUnits: state.enemyUnits.map(unit =>
      unit.id === id ? { ...unit, statuses: addOrRefreshStatus(unit.statuses, status) } : unit,
    ),
  };
}

function addEnemyStatusToAll(state: BattleState, status: Status): BattleState {
  if (!hasEnemyUnits(state)) {
    return { ...state, boss: { ...state.boss, statuses: addOrRefreshStatus(state.boss.statuses, status) } };
  }
  return {
    ...state,
    enemyUnits: state.enemyUnits.map(unit =>
      unit.hp > 0 ? { ...unit, statuses: addOrRefreshStatus(unit.statuses, status) } : unit,
    ),
  };
}

function addEnemyStatusToRandom(state: BattleState, status: Status, logs: string[], label: string): BattleState {
  if (!hasEnemyUnits(state)) {
    logs.push(`${label}：${currentBoss.name} 获得${status.name}。`);
    return { ...state, boss: { ...state.boss, statuses: addOrRefreshStatus(state.boss.statuses, status) } };
  }
  const alive = state.enemyUnits.filter(unit => unit.hp > 0);
  const target = alive[Math.floor(Math.random() * alive.length)];
  if (!target) return state;
  logs.push(`${label}：${target.name} 获得${status.name}。`);
  return addEnemyStatus(state, status, target.id);
}

function addEnemyDebuffFromCard(state: BattleState, card: BattleCard, status: Status, logs: string[], targetId?: string, refundEnergyOnMist = false): { state: BattleState; mistTriggered: boolean } {
  let next = addEnemyStatus(state, status, targetId);
  const owner = state.fighters.find(fighter => fighter.character.id === card.ownerId)?.character;
  const mistTriggered = owner?.creator?.studentId === "12250819" && isDebuff(status) && Math.random() < 0.5;
  if (!mistTriggered) return { state: next, mistTriggered: false };

  next = addEnemyStatus(next, status, targetId);
  if (refundEnergyOnMist) {
    next = { ...next, energy: Math.min(next.maxEnergy, next.energy + 1) };
    logs.push("黑雾迷阵触发：额外叠加 1 层减益，并回复 1 点能量。");
    return { state: next, mistTriggered: true };
  }
  logs.push("黑雾迷阵触发：额外叠加 1 层减益。");
  return { state: next, mistTriggered: true };
}

function cleanseEnemyUnits(state: BattleState, amount: number, logs: string[], reason: string): BattleState {
  if (!hasEnemyUnits(state)) return state;
  let cleansed = 0;
  const enemyUnits = state.enemyUnits.map(unit => {
    if (unit.hp <= 0 || !unit.statuses.some(isDebuff)) return unit;
    cleansed += 1;
    return { ...unit, statuses: removeDebuffs(unit.statuses, amount) };
  });
  if (cleansed > 0) logs.push(`${reason}：${cleansed} 名敌方单位驱散了 ${amount} 层减益。`);
  return { ...state, enemyUnits };
}

function applyTwinSymbiosis(state: BattleState, logs: string[]): BattleState {
  if (!hasEnemyUnits(state)) return state;
  const alive = state.enemyUnits.filter(unit => unit.hp > 0);
  const fallen = state.enemyUnits.filter(unit => unit.hp <= 0);
  if (alive.length === 0) return syncAggregateBoss(state);
  if (fallen.length === 0) return syncAggregateBoss(state);
  const survivor = alive[0];
  if (survivor.statuses.some(status => status.id === "twinSymbiosis")) return syncAggregateBoss(state);
  logs.push(`${survivor.name} 进入共生等待：若下次敌方回合结束前未被击杀，将重构倒下个体。`);
  return syncAggregateBoss({
    ...state,
    enemyUnits: state.enemyUnits.map(unit =>
      unit.id === survivor.id
        ? { ...unit, statuses: addOrRefreshStatus(unit.statuses, makeStatus("twinSymbiosis", { icon: currentBoss.symbiosisIcon ?? currentBoss.image, name: "共生", duration: 2, description: "等待共生重构。存活到下一次敌方回合结束时，倒下个体会以当前生命值复活。" })) }
        : unit,
    ),
  });
}

function enemyHasStatus(state: BattleState, id: StatusId, targetId?: string): boolean {
  if (!hasEnemyUnits(state)) return state.boss.statuses.some(status => status.id === id);
  const target = getTargetEnemyId(state, targetId);
  return !!state.enemyUnits.find(unit => unit.id === target)?.statuses.some(status => status.id === id);
}

function getEnemyMarkStacks(state: BattleState, targetId?: string): number {
  if (!hasEnemyUnits(state)) return getStatusStacks(state.boss.statuses, "mark");
  const target = getTargetEnemyId(state, targetId);
  const unit = state.enemyUnits.find(enemy => enemy.id === target);
  return getStatusStacks(unit?.statuses ?? [], "mark");
}

function getMarkBonusDamage(markStacks: number, logs: string[], targetName = "目标"): number {
  if (markStacks <= 0) return 0;
  if (Math.random() < Math.min(1, markStacks * 0.5)) {
    logs.push(`标记触发：${targetName} 额外承受 1 点伤害。`);
    return 1;
  }
  return 0;
}

function applyDirectBossDamage(state: BattleState, card: BattleCard, baseDamage: number, logs: string[], targetId?: string): BattleState {
  const owner = state.fighters.find(fighter => fighter.character.id === card.ownerId);
  let damage = Math.max(0, baseDamage + getFighterDamageBonus(owner));
  let nextState = state;
  if (owner?.statuses.some(status => status.id === "ambush")) {
    if (Math.random() < 0.5) {
      damage *= 2;
      logs.push("伏击触发：本次伤害翻倍。");
    }
    nextState = {
      ...nextState,
      fighters: nextState.fighters.map(fighter =>
        fighter.character.id === card.ownerId
          ? { ...fighter, statuses: fighter.statuses.filter(status => status.id !== "ambush" && status.id !== "stealth") }
          : fighter,
      ),
    };
  }
  const markStacks = getEnemyMarkStacks(state, targetId);
  const mark = markStacks > 0;
  damage += getMarkBonusDamage(markStacks, logs);
  nextState = applyBossDamage(nextState, damage, logs, targetId);

  const latestOwner = nextState.fighters.find(fighter => fighter.character.id === card.ownerId);
  if (damage > 0 && latestOwner?.character.creator?.studentId === "12250821") {
    if (mark) {
      nextState = {
        ...nextState,
        fighters: nextState.fighters.map(fighter =>
          fighter.character.id === card.ownerId ? healFighter(fighter, 1) : fighter,
        ),
      };
      logs.push("雾影赤瞳触发：目标已有标记，瑞文回复 1 点生命。");
    }
    if (Math.random() < 0.5) {
      nextState = addEnemyStatus(nextState, makeStatus("mark"), targetId);
      logs.push("雾影赤瞳触发：为目标附加 1 层标记。");
    }
  }

  if (damage > 0 && latestOwner?.statuses.some(status => status.id === "silkDrain")) {
    nextState = {
      ...nextState,
      fighters: nextState.fighters.map(fighter => {
        if (fighter.character.id === card.ownerId || fighter.character.creator?.studentId === "12250813") return healFighter(fighter, 1);
        return fighter;
      }),
    };
    logs.push("蛛丝汲生触发：莉拉与攻击者各回复 1 点生命。");
  }

  if (damage > 0 && latestOwner?.character.creator?.studentId === "12250816" && Math.random() < 0.4) {
    nextState = drawOwnerCards(nextState, latestOwner.character.id, 1, "时滞刀域");
    logs.push("残时回响触发：鸢尾摸 1 张自己的牌。");
  }

  return nextState;
}

function applyDirectAllEnemyDamage(state: BattleState, card: BattleCard, baseDamage: number, logs: string[]): BattleState {
  const owner = state.fighters.find(fighter => fighter.character.id === card.ownerId);
  const base = Math.max(0, baseDamage + getFighterDamageBonus(owner));

  if (!hasEnemyUnits(state)) {
    const markStacks = getStatusStacks(state.boss.statuses, "mark");
    return applyBossDamage(state, base + getMarkBonusDamage(markStacks, logs, currentBoss.name), logs);
  }

  let next = state;
  const damagedNames: string[] = [];
  for (const unit of state.enemyUnits) {
    if (unit.hp <= 0) continue;
    const markStacks = getStatusStacks(unit.statuses, "mark");
    const damage = base + getMarkBonusDamage(markStacks, logs, unit.name);
    damagedNames.push(`${unit.name} ${damage}`);
    next = {
      ...next,
      enemyUnits: next.enemyUnits.map(enemy =>
        enemy.id === unit.id ? { ...enemy, hp: Math.max(0, enemy.hp - damage) } : enemy,
      ),
    };
  }
  if (damagedNames.length) logs.push(`范围伤害命中：${damagedNames.join("；")}。`);
  return processFinaleTransitions(syncAggregateBoss(next), logs);
}

function triggerFlowerBurialIfNeeded(state: BattleState, boss: BossState, logs: string[]): Pick<BattleState, "boss" | "flowerBurialFlash" | "flowerBurialRevealed"> {
  if (!boss.flowerBurial && boss.hp > 0 && boss.hp < 10) {
    const nextBoss = {
      ...boss,
      flowerBurial: true,
      berserk: state.turn <= 5,
    };
    logs.push(nextBoss.berserk ? "特殊狂暴：5 回合内触发花葬。" : "花葬触发：兽骨花冠进入第二阶段。");
    return {
      boss: nextBoss,
      flowerBurialFlash: true,
      flowerBurialRevealed: false,
    };
  }

  return {
    boss,
    flowerBurialFlash: state.flowerBurialFlash,
    flowerBurialRevealed: state.flowerBurialRevealed,
  };
}

function processFinaleTransitions(state: BattleState, logs: string[]): BattleState {
  if (currentBoss.encounterType !== "finale" || !hasEnemyUnits(state)) return state;
  const nun = state.enemyUnits.find(unit => unit.id === "boss5-nun");
  const god = state.enemyUnits.find(unit => unit.id === "boss5-god");
  if (nun && nun.hp <= 0 && god && god.hp <= 0 && !state.boss.flowerBurial) {
    logs.push("圣棘之母倒下，圣堂地面裂开：溺神残响降临。");
    const next = {
      ...state,
      selectedEnemyId: "boss5-god",
      flowerBurialFlash: true,
      flowerBurialRevealed: false,
      boss: { ...state.boss, flowerBurial: true, berserk: true, charging: null },
      enemyUnits: state.enemyUnits.map(unit => {
        if (unit.id === "boss5-god") return { ...unit, hp: unit.maxHp, statuses: [] };
        if (unit.id === "boss5-nun") return { ...unit, hp: 0, statuses: [] };
        return { ...unit, hp: 0, statuses: [] };
      }),
    };
    return syncAggregateBoss(next);
  }
  return state;
}

function applyBossDamage(state: BattleState, amount: number, logs: string[], targetId?: string): BattleState {
  if (hasEnemyUnits(state)) {
    const id = getTargetEnemyId(state, targetId);
    if (!id) return state;
    const enemy = state.enemyUnits.find(unit => unit.id === id);
    const hunterWolfDamageInterrupt =
      currentBoss.encounterType === "hunterWolf" &&
      amount > 0 &&
      enemy?.statuses.some(status => status.id === "charge") &&
      !(id === "boss4-hunter" && state.turn >= 5);
    const finaleDamageInterrupt =
      currentBoss.encounterType === "finale" &&
      amount > 0 &&
      enemy?.statuses.some(status => status.id === "charge");
    const nextUnits = state.enemyUnits.map(unit =>
      unit.id === id
        ? {
            ...unit,
            hp: Math.max(0, unit.hp - amount),
            statuses: hunterWolfDamageInterrupt || finaleDamageInterrupt ? removeSpecificStatus(unit.statuses, "charge") : unit.statuses,
          }
        : unit,
    );
    if (enemy) logs.push(`${enemy.name} 受到 ${amount} 点伤害。`);
    if (hunterWolfDamageInterrupt && amount > 0) logs.push(`${enemy?.name ?? "目标"} 的蓄力被伤害打断。`);
    if (finaleDamageInterrupt) logs.push(`${enemy?.name ?? "目标"} 的蓄力被伤害打断。`);
    return processFinaleTransitions(syncAggregateBoss({ ...state, enemyUnits: nextUnits }), logs);
  }
  let boss = { ...state.boss, hp: Math.max(0, state.boss.hp - amount) };
  if (boss.charging && !boss.flowerBurial) {
    const damageTaken = boss.charging.damageTaken + amount;
    if (damageTaken >= 5) {
      logs.push("蓄力被打断：荆棘皇冕未能释放。");
      boss = { ...boss, charging: null, crownCooldown: boss.flowerBurial ? 0 : 3 };
    } else {
      boss = { ...boss, charging: { ...boss.charging, damageTaken } };
    }
  }
  const { boss: triggeredBoss, flowerBurialFlash, flowerBurialRevealed } = triggerFlowerBurialIfNeeded(state, boss, logs);
  boss = triggeredBoss;
  return { ...state, boss, flowerBurialFlash, flowerBurialRevealed };
}

export default function Battle() {
  const { selectedCharacterIds } = useTeamStore();
  const [, setLocation] = useLocation();
  const team = useMemo(() => {
    const selected = selectedCharacterIds
      .map(id => characters.find(character => character.id === id))
      .filter((character): character is Character => !!character && !character.locked && isCharacterBattleReady(character));
    if (selected.length === 3) return selected;
    return characters.filter(character => !character.locked && isCharacterBattleReady(character)).slice(0, 3);
  }, [selectedCharacterIds]);
  const resultPreview = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("previewResult") : null;

  const [state, setState] = useState<BattleState>(() => {
    const initial = createInitialState(team);
    if (resultPreview === "victory") {
      return { ...initial, phase: "victory", finaleLine: "赤月沉入城垣，猎场终于重新打开。" };
    }
    return initial;
  });
  const [targetingCard, setTargetingCard] = useState<BattleCard | null>(null);
  const [enemyTargetingCard, setEnemyTargetingCard] = useState<BattleCard | null>(null);
  const [hoveredCard, setHoveredCard] = useState<BattleCard | null>(null);
  const [playedCard, setPlayedCard] = useState<BattleCard | null>(null);
  const [discardMode, setDiscardMode] = useState(false);
  const [bossHit, setBossHit] = useState(false);

  useEffect(() => {
    if (state.phase === "victory" && currentBoss.id === "boss-05") {
      setLocation("/epilogue/final");
    }
  }, [state.phase, setLocation]);

  const alive = state.fighters.filter(fighter => fighter.hp > 0);
  const flowerImage = state.boss.berserk ? currentBoss.berserkImage : currentBoss.flowerBurialImage ?? currentBoss.image;
  const battleBackgroundImage = currentBoss.battleBackground ?? (state.boss.flowerBurial && state.flowerBurialRevealed ? flowerImage ?? currentBoss.image : currentBoss.image);
  const bossDisplayImage =
    currentBoss.encounterType === "finale" && state.enemyUnits.some(unit => unit.id === "boss5-god" && unit.hp > 0)
      ? currentBoss.flowerBurialImage ?? currentBoss.image
      : currentBoss.encounterType === "finale" && state.enemyUnits.some(unit => unit.id === "boss5-nun" && unit.statuses.some(status => status.id === "damageBoost"))
        ? currentBoss.berserkImage ?? currentBoss.image
        : currentBoss.encounterType === "summoner"
      ? currentBoss.flowerBurialImage ?? currentBoss.image
      : state.boss.flowerBurial && state.flowerBurialRevealed
        ? flowerImage ?? currentBoss.image
        : currentBoss.image;
  const visibleEnemyUnits = currentBoss.encounterType === "summoner"
    ? state.enemyUnits.filter(unit => unit.id !== "boss3-wolf" || unit.hp > 0)
    : currentBoss.encounterType === "finale"
      ? state.enemyUnits.filter(unit => unit.hp > 0)
    : state.enemyUnits;
  const enemyTargets: EnemyTarget[] = visibleEnemyUnits.length
    ? visibleEnemyUnits.map(unit => {
        const wolfAlive = state.enemyUnits.some(enemy => enemy.id === "boss3-wolf" && enemy.hp > 0);
        const unitMarked = unit.statuses.some(status => status.id === "mark");
        const liVaughnAlive = state.fighters.some(fighter => fighter.character.creator?.studentId === "12250805" && fighter.hp > 0);
        const hiddenByWolf = currentBoss.encounterType === "summoner" && unit.id === "boss3-witch" && wolfAlive && !unitMarked && !liVaughnAlive;
        return {
          id: unit.id,
          name: unit.name,
          title: hiddenByWolf ? `${unit.title} · 隐匿中` : unit.title,
          image: unit.hp > 0 ? unit.image : unit.portrait,
          hp: unit.hp,
          maxHp: unit.maxHp,
          statuses: hiddenByWolf
            ? [
                makeStatus("stealth", {
                  icon: unit.portrait,
                  name: "隐匿",
                  description: "影狼仍在场，本体无法被普通攻击直接选中。击败影狼或施加标记可打开输出窗口。",
                }),
                ...unit.statuses,
              ]
            : unit.statuses,
          selected: !hiddenByWolf && unit.hp > 0,
        };
      })
    : [
        {
          id: currentBoss.id,
          name: currentBoss.name,
          title: currentBoss.title,
          image: state.boss.flowerBurial && state.flowerBurialRevealed ? flowerImage ?? currentBoss.image : currentBoss.image,
          hp: state.boss.hp,
          maxHp: state.boss.maxHp,
          statuses: [
            ...(state.boss.flowerBurial
              ? [
                  makeStatus("talent", {
                    name: "花葬",
                    icon: flowerImage ?? currentBoss.image,
                    description: "第二阶段：迷雾摇篮曲全体化，荆棘皇冕无冷却。",
                  }),
                ]
              : []),
            ...(state.boss.charging
              ? [
                  makeStatus("charge", {
                    duration: state.boss.charging.remaining,
                    description: `荆棘皇冕蓄力中，已承受 ${state.boss.charging.damageTaken}/5 点打断伤害。`,
                  }),
                ]
              : []),
            ...state.boss.statuses,
          ],
          selected: true,
        },
      ];
  const introSlides = useMemo<IntroSlide[]>(() => {
    const talentSlides = team
      .map<IntroSlide | null>(character => {
        const talent = getTalent(character);
        if (!talent) return null;
        return {
          kind: "talent" as const,
          title: talent.name,
          subtitle: character.name,
          image: talent.icon || character.avatar,
          line: talent.effect || talent.description || "天赋技能启动。",
        };
      })
      .filter((slide): slide is IntroSlide => slide !== null);
    return [
      {
        kind: "boss",
        title: currentBoss.name,
        subtitle: currentBoss.codename,
        image: currentBoss.image,
        line: bossIntroLines[currentBoss.id] ?? "目标已确认。方舟小队进入战斗。",
      },
      ...talentSlides,
      {
        kind: "start",
        title: "战斗开始",
        subtitle: `TURN ${state.turn}`,
        line: "方舟小队进入战斗。",
      },
    ];
  }, [team, state.turn]);
  const [introIndex, setIntroIndex] = useState(0);
  const introActive = !resultPreview && introIndex < introSlides.length;

  useEffect(() => {
    if (!state.flowerBurialFlash) return;
    const timer = window.setTimeout(() => {
      setState(prev => ({ ...prev, flowerBurialFlash: false, flowerBurialRevealed: true }));
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [state.flowerBurialFlash]);

  const restart = () => {
    setTargetingCard(null);
    setEnemyTargetingCard(null);
    setHoveredCard(null);
    setPlayedCard(null);
    setDiscardMode(false);
    setBossHit(false);
    setIntroIndex(0);
    setState(createInitialState(team));
  };

  const resolveCardPlay = (card: BattleCard, targetIndex?: number, enemyTargetId?: string) => {
    if (state.phase !== "player") return;
    const cost = getCardCost(card, state.fighters);
    if (state.energy < cost) return;
    if (state.fighters.find(f => f.character.id === card.ownerId)?.hp === 0) return;
    if (needsAllyTarget(card) && (targetIndex === undefined || state.fighters[targetIndex]?.hp <= 0)) return;

    setPlayedCard(card);
    window.setTimeout(() => setPlayedCard(null), 620);
    setTargetingCard(null);
    setEnemyTargetingCard(null);
    setHoveredCard(null);

    setState(prev => {
      let next: BattleState = {
        ...prev,
        energy: prev.energy - getCardCost(card, prev.fighters),
        hand: prev.hand.filter(c => c.uid !== card.uid),
        discard: [...prev.discard, card],
        playedThisTurn: [...prev.playedThisTurn, card.ownerId],
        playedSkillNames: [...prev.playedSkillNames, `${card.ownerId}:${card.skill.name}`],
        recentHitIds: [],
        selectedEnemyId: enemyTargetId,
      };
      const logs = [`${card.ownerName} 使用「${card.skill.name}」。`];
      const ownerBefore = next.fighters.find(f => f.character.id === card.ownerId);
      const ownerUncontrolled = ownerBefore?.statuses.some(status => status.id === "uncontrolled");
      if (ownerUncontrolled && Math.random() < 0.4 && card.skill.name !== "雾爪") {
        logs.push(`${card.ownerName} 的失控触发，行动失败。`);
        return { ...next, log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
      }
      next = applyCardPlayedTalents(next, card, logs);
      const beforeBossHp = next.boss.hp;
      next = resolveSkill(next, card, logs, false, targetIndex, enemyTargetId);

      const owner = next.fighters.find(f => f.character.id === card.ownerId);
      if (owner?.character.name === "夜·蝶" && Math.random() < 0.3) {
        logs.push("暗影潜行触发：技能再次生效。");
        next = resolveSkill(next, card, logs, true, targetIndex, enemyTargetId);
      }

      if (next.boss.hp < beforeBossHp) {
        setBossHit(true);
        window.setTimeout(() => setBossHit(false), 520);
      }

      if (card.skill.name === "幻海囚笼" && beforeBossHp > 0 && next.boss.hp <= 0) {
        next = { ...next, hand: [...next.hand, card] };
      }

      if (currentBoss.encounterType === "twin") {
        next = applyTwinSymbiosis(next, logs);
      }

      if (next.boss.hp <= 0) {
        return {
          ...next,
          phase: "victory",
          finaleLine: victoryLines[Math.floor(Math.random() * victoryLines.length)],
          log: [...logs, "兽骨花冠被击败。", ...next.log].slice(0, LOG_LIMIT),
        };
      }

      return { ...next, log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
    });
  };

  const onCardClick = (card: BattleCard) => {
    if (discardMode) {
      if (state.phase !== "player") return;
      setState(prev => ({
        ...applyDiscardEffects(prev, card),
        hand: prev.hand.filter(c => c.uid !== card.uid),
        discard: [...prev.discard, card],
      }));
      setDiscardMode(false);
      return;
    }
    const cost = getCardCost(card, state.fighters);
    if (state.phase !== "player" || state.energy < cost) return;
    if (state.fighters.find(f => f.character.id === card.ownerId)?.hp === 0) return;
    if (needsAllyTarget(card)) {
      setTargetingCard(card);
      setEnemyTargetingCard(null);
      return;
    }
    if (isSelfCast(card)) {
      const selfIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
      resolveCardPlay(card, selfIndex);
      return;
    }
    setEnemyTargetingCard(card);
    setTargetingCard(null);
  };

  const onFighterClick = (index: number) => {
    if (!targetingCard) return;
    resolveCardPlay(targetingCard, index);
  };

  const onEnemyClick = (enemyId: string) => {
    if (!enemyTargetingCard) return;
    resolveCardPlay(enemyTargetingCard, undefined, enemyId);
  };

  const endTurn = () => {
    if (state.phase !== "player") return;
    setTargetingCard(null);
    setEnemyTargetingCard(null);
    setDiscardMode(false);
    setState(prev => runEnemyTurn(prev));
  };

  if (state.phase === "victory" || state.phase === "defeat") {
    return (
      <div className="h-screen bg-[#090510] text-white">
        <ResultOverlay phase={state.phase} line={state.finaleLine} onRestart={restart} />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#090510] text-white">
      <div className="scanlines" />
      <div className="relative h-screen overflow-hidden">
        <motion.img
          key={battleBackgroundImage}
          src={battleBackgroundImage}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 h-full w-full object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090510]/70 via-[#090510]/82 to-[#090510]" />

        <div className="relative z-10 grid h-screen grid-rows-[36px_minmax(0,1fr)_136px] gap-2 p-2">
          <header className="flex min-h-0 items-center justify-between">
            <Button asChild variant="ghost" className="text-white/70 hover:text-white">
              <Link href="/team">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回编队
              </Link>
            </Button>
            <div className="flex items-center gap-3 font-mono text-sm">
              <span>TURN {state.turn}</span>
              <span>DECK {state.deck.length}</span>
              <span>DISCARD {state.discard.length}</span>
            </div>
          </header>

          <main className="grid min-h-0 grid-cols-[252px_minmax(500px,1fr)_320px] gap-2">
            <section className="min-h-0 space-y-2 overflow-y-auto pr-1">
              {state.fighters.map((fighter, index) => (
                <FighterPanel
                  key={fighter.character.id}
                  fighter={fighter}
                  selectable={!!targetingCard && fighter.hp > 0}
                  isHit={state.recentHitIds.includes(fighter.character.id)}
                  onClick={() => onFighterClick(index)}
                />
              ))}
              {targetingCard && (
                <div className="border-2 border-yellow-300 bg-yellow-300/15 p-3 shadow-[0_0_24px_rgba(250,204,21,0.25)]">
                  <div className="text-xs font-mono font-bold tracking-[0.25em] text-yellow-200">TARGET SELECT</div>
                  <div className="mt-1 text-sm font-black text-white">正在选择「{targetingCard.skill.name}」的目标</div>
                  <Button
                    onClick={() => setTargetingCard(null)}
                    className="mt-3 h-10 w-full rounded-none border border-yellow-200 bg-yellow-300 text-black hover:bg-yellow-200"
                  >
                    取消目标选择
                  </Button>
                </div>
              )}
            </section>

            <section className="relative flex min-h-0 flex-col items-center justify-between border border-red-500/20 bg-black/35 p-3">
              <div className="w-full">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono tracking-[0.25em] text-red-300/80">{currentBoss.codename}</div>
                    <h1 className="text-4xl font-black tracking-wider">{currentBoss.name}</h1>
                  </div>
                  <Badge className="rounded-none border border-red-500/50 bg-red-500/20 text-red-200">
                    HP {state.boss.hp}/{state.boss.maxHp}
                  </Badge>
                </div>
                <div className="h-3 border border-red-500/40 bg-black/50">
                  <div className="h-full bg-red-500" style={{ width: `${Math.max(0, (state.boss.hp / state.boss.maxHp) * 100)}%` }} />
                </div>
                <EnemyTargetRow
                  enemies={enemyTargets}
                  targetingCard={enemyTargetingCard}
                  onEnemyClick={onEnemyClick}
                />
              </div>

              <div className="grid min-h-0 w-full flex-1 grid-cols-[minmax(0,1fr)_340px] gap-3 pt-3">
                <motion.div
                  animate={bossHit ? { x: [0, -10, 10, -6, 6, 0], scale: [1, 1.02, 1] } : { x: 0, scale: 1 }}
                  transition={{ duration: 0.46 }}
                  className="relative flex min-h-0 items-center justify-center overflow-hidden border border-red-500/20 bg-black/12 p-2"
                >
                  {bossHit && <div className="absolute inset-0 bg-red-500/12 mix-blend-screen" />}
                  <img
                    src={bossDisplayImage}
                    alt={currentBoss.name}
                    className="h-full w-full object-contain drop-shadow-[0_0_42px_rgba(220,38,38,0.42)]"
                  />
                </motion.div>

                <div className="flex min-h-0 flex-col border border-red-500/35 bg-black/45 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-xs font-bold tracking-widest text-red-100/75">战斗记录</div>
                    <div className="font-mono text-[10px] text-white/35">{state.log.length}/{LOG_LIMIT}</div>
                  </div>
                  <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-2 text-xs leading-relaxed text-white/75">
                    {state.log.map((entry, index) => <LogLine key={`${index}-${entry}`} text={entry} />)}
                  </div>
                </div>
              </div>
            </section>

            <section className="flex min-h-0 flex-col overflow-y-auto border border-white/10 bg-black/35 p-3">
              <h2 className="mb-2 text-sm font-black tracking-widest text-primary">行动面板</h2>

              <div className="mb-3 grid grid-cols-2 overflow-hidden border border-primary/40 bg-primary/10">
                <div className="flex flex-col items-center justify-center border-r border-primary/30 px-4 py-2">
                  <div className="font-mono text-3xl font-black leading-none text-cyan-100">{state.turn}</div>
                  <div className="mt-1 text-[10px] font-bold tracking-[0.25em] text-cyan-100/60">TURN</div>
                </div>
                <div className="flex flex-col items-center justify-center px-4 py-2">
                  <Zap className="mb-1 h-8 w-8 fill-yellow-300 text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.7)]" />
                  <div className="font-mono text-3xl font-black leading-none text-yellow-100">{state.energy}</div>
                  <div className="mt-0.5 font-mono text-[10px] font-bold text-yellow-100/45">MAX {state.maxEnergy}</div>
                  <div className="mt-1 text-[10px] font-bold tracking-[0.25em] text-yellow-100/60">ENERGY</div>
                </div>
              </div>

              {targetingCard && (
                <div className="mb-4 border border-primary/50 bg-primary/10 p-3 text-sm text-primary-foreground">
                  <div className="font-black">选择目标</div>
                  <div className="mt-1 text-xs text-white/70">正在使用「{targetingCard.skill.name}」，点击左侧队友头像确认。</div>
                  <Button onClick={() => setTargetingCard(null)} variant="outline" className="mt-3 h-8 w-full rounded-none border-white/20 bg-transparent text-white">
                    取消选择
                  </Button>
                </div>
              )}
              {enemyTargetingCard && (
                <div className="mb-4 border border-red-400/70 bg-red-500/15 p-3 text-sm text-red-50 shadow-[0_0_20px_rgba(248,113,113,0.18)]">
                  <div className="font-black">选择敌方目标</div>
                  <div className="mt-1 text-xs text-white/70">正在使用「{enemyTargetingCard.skill.name}」，点击中间敌方头像确认。</div>
                  <Button onClick={() => setEnemyTargetingCard(null)} variant="outline" className="mt-3 h-8 w-full rounded-none border-red-200/30 bg-transparent text-red-50">
                    取消攻击目标
                  </Button>
                </div>
              )}

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <InfoTile label="手牌上限" value={state.maxHand} />
                <InfoTile label="能量上限" value={state.maxEnergy} />
                <InfoTile label="每回合抽牌" value={state.drawPerTurn + (state.turn <= 3 ? 1 : 0)} />
                <InfoTile label="能量增长" value="+4" />
                <InfoTile label="存活角色" value={`${alive.length}/3`} />
              </div>
              <Button onClick={endTurn} disabled={state.phase !== "player"} className="mb-3 h-9 w-full rounded-none bg-primary hover:bg-primary/80">
                结束回合
              </Button>
              <Button
                onClick={() => {
                  setDiscardMode(mode => !mode);
                  setTargetingCard(null);
                  setEnemyTargetingCard(null);
                }}
                disabled={state.phase !== "player" || state.hand.length === 0}
                variant="outline"
                className={`mb-3 h-9 w-full rounded-none border-white/20 bg-transparent text-white ${discardMode ? "border-yellow-300 text-yellow-100 shadow-[0_0_18px_rgba(250,204,21,0.22)]" : ""}`}
              >
                {discardMode ? "点击一张手牌弃置" : "主动弃牌"}
              </Button>
              <Button onClick={restart} variant="outline" className="h-9 w-full rounded-none border-white/20 bg-transparent text-white">
                <RotateCcw className="mr-2 h-4 w-4" />
                重新开始
              </Button>
            </section>
          </main>

          <footer className="relative min-h-0 overflow-x-auto border-t border-white/10 pt-1">
            {hoveredCard && <SkillHoverPanel card={hoveredCard} cost={getCardCost(hoveredCard, state.fighters)} />}
            <div className="grid min-w-max grid-flow-col auto-cols-[112px] gap-2">
              {state.hand.map(card => {
                const cost = getCardCost(card, state.fighters);
                const disabled = state.phase !== "player" || (!discardMode && state.energy < cost) || state.fighters.find(f => f.character.id === card.ownerId)?.hp === 0;
                return (
                  <BattleCardButton
                    key={card.uid}
                    card={card}
                    cost={cost}
                    disabled={disabled}
                    selected={targetingCard?.uid === card.uid || enemyTargetingCard?.uid === card.uid || discardMode}
                    onHover={setHoveredCard}
                    onClick={() => onCardClick(card)}
                  />
                );
              })}
            </div>
          </footer>
        </div>

        <AnimatePresence>
          {introActive && <IntroOverlay slide={introSlides[introIndex]} onNext={() => setIntroIndex(index => index + 1)} />}
          {state.flowerBurialFlash && <FlowerBurialOverlay image={flowerImage ?? currentBoss.image} berserk={state.boss.berserk} />}
          {playedCard && <PlayedCardAnimation card={playedCard} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function applyDiscardEffects(state: BattleState, card: BattleCard): BattleState {
  const logs = [`弃置「${card.skill.name}」。`];
  let next = state;
  const ownerIndex = next.fighters.findIndex(fighter => fighter.character.id === card.ownerId);

  if (card.skill.name === "念念不忘" && ownerIndex >= 0) {
    next = {
      ...next,
      energy: Math.min(next.maxEnergy, next.energy + 1),
      fighters: next.fighters.map((fighter, index) =>
        index === ownerIndex ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeTalentStatus(fighter.character, "memory")) } : fighter,
      ),
    };
    logs.push("念念不忘弃置效果：获得 1 点能量和 1 层记忆检索。");
  }

  if (card.skill.name === "时序断层·停滞场" && ownerIndex >= 0) {
    next = {
      ...next,
      fighters: next.fighters.map((fighter, index) =>
        index === ownerIndex ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeTalentStatus(fighter.character, "overload")) } : fighter,
      ),
    };
    logs.push("时序断层·停滞场弃置效果：获得 1 层过载分析。");
  }

  if (card.skill.name === "铲尖猛击" && ownerIndex >= 0) {
    const owner = next.fighters[ownerIndex].character;
    const reserve = getActiveSkills(owner).find(skill => skill.name === "应急储备");
    if (reserve) next = addGeneratedCard(next, owner, reserve);
    logs.push("铲尖猛击弃置效果：生成 1 张应急储备。");
  }

  if (card.skill.name === "绝境应激" && ownerIndex >= 0) {
    next = {
      ...next,
      fighters: next.fighters.map((fighter, index) =>
        index === ownerIndex
          ? { ...fighter, statuses: addOrRefreshStatus(addOrRefreshStatus(fighter.statuses, makeStatus("regen")), makeStatus("weak")) }
          : fighter,
      ),
    };
    logs.push("绝境应激弃置效果：自身获得恢复和虚弱。");
  }

  if (card.skill.name === "时序修复" && Math.random() < 0.5) {
    next = {
      ...next,
      energy: Math.min(next.maxEnergy, next.energy + 1),
    };
    logs.push("时序修复弃置效果触发：恢复 1 点能量。");
  }

  return { ...next, log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
}

function applyCardPlayedTalents(state: BattleState, card: BattleCard, logs: string[]): BattleState {
  let next = state;
  const ownerIndex = next.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
  if (ownerIndex === -1) return next;

  const owner = next.fighters[ownerIndex];
  if (owner.character.creator?.studentId === "12250807") {
    let statuses = addOrRefreshStatus(owner.statuses, makeTalentStatus(owner.character, "overload"));
    const overload = statuses.find(status => status.id === "overload");
    if ((overload?.stacks ?? 0) >= 4) {
      statuses = statuses.filter(status => status.id !== "overload");
      next = { ...next, energy: Math.min(next.maxEnergy, next.energy + 2) };
      next = drawCards(next, 1);
      logs.push("过载分析达到 4 层：抽 1 张牌并获得 2 点能量。");
    }
    next = {
      ...next,
      fighters: next.fighters.map((fighter, index) => (index === ownerIndex ? { ...fighter, statuses } : fighter)),
    };
  }

  return next;
}

function resolveSkill(state: BattleState, card: BattleCard, logs: string[], copied: boolean, targetIndex?: number, enemyTargetId?: string): BattleState {
  if (card.skill.name === "剥离、千层刃") {
    const damage = 1 + Math.floor(Math.random() * 3);
    let next = applyDirectBossDamage(state, card, damage, logs, enemyTargetId);
    const debuffResult = addEnemyDebuffFromCard(next, card, makeStatus("bleed"), logs, enemyTargetId, true);
    next = debuffResult.state;
    logs.push(`剥离、千层刃造成 ${damage} 点伤害，并附加流血。`);
    return next;
  }

  if (card.skill.name === "层解、回溯") {
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const fighters = state.fighters.map((fighter, fighterIndex) => {
      let nextFighter = { ...fighter, statuses: removeDebuffs(fighter.statuses, 1) };
      nextFighter = healFighter(nextFighter, 2);
      if (fighterIndex === ownerIndex) {
        nextFighter = { ...nextFighter, hp: Math.max(1, nextFighter.hp - 2) };
      }
      return nextFighter;
    });
    logs.push("层解、回溯：全体驱散 1 层减益并回复 2 点生命，鳞以自身生命支付代价。");
    return { ...state, fighters };
  }

  if (card.skill.name === "空心、归寂") {
    const damage = 1 + Math.floor(Math.random() * 3);
    let next = applyDirectBossDamage(state, card, damage, logs, enemyTargetId);
    const debuffResult = addEnemyDebuffFromCard(next, card, makeStatus("healBlock", { duration: 2 }), logs, enemyTargetId);
    next = debuffResult.state;
    logs.push(`空心、归寂造成 ${damage} 点伤害，并附加禁止治疗。`);
    return next;
  }

  if (card.skill.name === "残步影") {
    let next = applyDirectBossDamage(state, card, 2, logs, enemyTargetId);
    next = addEnemyStatus(next, makeStatus("uncontrolled"), enemyTargetId);
    logs.push("残步影造成 2 点伤害，并令目标陷入失控。");

    if (!copied && Math.random() < 0.5) {
      const ownerIndex = next.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
      if (ownerIndex >= 0) {
        const applied = applyDebuffToFighter(next, ownerIndex, makeStatus("uncontrolled"), logs);
        next = applied.state;
      }
      next = { ...next, hand: [...next.hand, card] };
      logs.push("残步影的回响失控被触发，这张牌返回手牌。");
    }
    return next;
  }

  if (card.skill.name === "残响屏障") {
    const index = targetIndex ?? findShieldTarget(state.fighters);
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    let next: BattleState = {
      ...state,
      fighters: state.fighters.map((fighter, fighterIndex) =>
        fighterIndex === index
          ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeStatus("shield")) }
          : fighter,
      ),
    };
    let resisted = false;
    if (ownerIndex >= 0) {
      const applied = applyDebuffToFighter(next, ownerIndex, makeStatus("daze"), logs);
      next = applied.state;
      resisted = applied.resisted;
    }
    if (resisted && ownerIndex >= 0) {
      next = {
        ...next,
        fighters: next.fighters.map((fighter, fighterIndex) => {
          if (fighterIndex !== ownerIndex) return fighter;
          const existing = getStatusStacks(fighter.statuses, "nextDraw");
          const statuses = addOrRefreshStatus(fighter.statuses, makeTalentStatus(fighter.character, "nextDraw", {
            name: "残响回收",
            description: "下回合额外摸 1 张牌，最多叠加 3 层。",
          }));
          return {
            ...fighter,
            statuses: statuses.map(status => status.id === "nextDraw" ? { ...status, stacks: Math.min(3, Math.max(existing + 1, status.stacks ?? 1)) } : status),
          };
        }),
      };
      logs.push("林青梧抵抗了残响屏障的恍惚，下回合额外摸牌。");
    }
    logs.push(`残响屏障为 ${state.fighters[index].character.name} 生成 1 层护盾。`);
    return next;
  }

  if (card.skill.name === "赤刃·裂空") {
    const damage = 2 + Math.floor(Math.random() * 2);
    const targetId = getTargetEnemyId(state, enemyTargetId);
    const beforeTarget = targetId ? state.enemyUnits.find(unit => unit.id === targetId) : undefined;
    let next = applyDirectBossDamage(state, card, damage, logs, enemyTargetId);
    if (beforeTarget && beforeTarget.id === "boss3-wolf" && damage > beforeTarget.maxHp * 0.3) {
      next = {
        ...next,
        enemyUnits: next.enemyUnits.map(unit => unit.id === beforeTarget.id ? { ...unit, hp: 0 } : unit),
      };
      next = syncAggregateBoss(next);
      logs.push("赤刃·裂空斩杀了非 BOSS 目标。");
    }
    logs.push(`赤刃·裂空造成 ${damage} 点伤害。`);
    return next;
  }

  if (card.skill.name === "烬影·回溯") {
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    if (ownerIndex === -1) return state;
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === ownerIndex
        ? {
            ...fighter,
            statuses: addOrRefreshStatus(removeDebuffs(fighter.statuses, 1), makeStatus("attackUp", { duration: 2 })),
          }
        : fighter,
    );
    let next: BattleState = { ...state, fighters };
    const owner = state.fighters[ownerIndex].character;
    const redBlade = getActiveSkills(owner).find(skill => skill.name === "赤刃·裂空");
    if (redBlade) next = addGeneratedCard(next, owner, redBlade);
    logs.push("烬影·回溯净化自身，获得 2 回合攻击提升，并生成 1 张赤刃·裂空。");
    return next;
  }

  if (card.skill.name === "蛛丝汲生") {
    const index = targetIndex ?? findHealTarget(state.fighters);
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const icon = card.skill.icon || state.fighters.find(fighter => fighter.character.id === card.ownerId)?.character.avatar;
    const fighters = state.fighters.map((fighter, fighterIndex) => {
      let nextFighter = fighter;
      if (fighterIndex === index) {
        nextFighter = {
          ...nextFighter,
          statuses: addOrRefreshStatus(
            nextFighter.statuses,
            makeStatus("silkDrain", { icon, name: "蛛丝汲生", duration: 3, description: "卡牌费用 -1；造成伤害后，莉拉和目标同时回复 1 点生命，持续 3 回合。" }),
          ),
        };
      }
      if (fighterIndex === ownerIndex) {
        const hp = Math.max(0, nextFighter.hp - 1);
        const needsReviveFlag = hp <= 0 && !nextFighter.statuses.some(status => status.id === "lilaReviveUsed");
        nextFighter = {
          ...nextFighter,
          hp,
          statuses: needsReviveFlag
            ? addOrRefreshStatus(nextFighter.statuses, makeTalentStatus(nextFighter.character, "lilaReviveUsed"))
            : nextFighter.statuses,
        };
      }
      return nextFighter;
    });
    logs.push(`蛛丝汲生连接 ${state.fighters[index].character.name}，莉拉支付 1 点生命。`);
    return { ...state, fighters };
  }

  if (card.skill.name === "流萤抚墟") {
    const fighters = state.fighters.map(fighter => {
      let next = healFighter(fighter, 1);
      if (next.statuses.some(status => status.id === "silkDrain")) {
        next = { ...next, statuses: addOrRefreshStatus(removeDebuffs(next.statuses, 1), makeStatus("regen")) };
      }
      return next;
    });
    logs.push("流萤抚墟：全体回复，蛛丝汲生目标额外净化并获得恢复。");
    return { ...state, fighters };
  }

  if (card.skill.name === "蝶落守彰") {
    let next = applyDirectBossDamage(state, card, 2, logs);
    if (state.fighters.some(fighter => fighter.statuses.some(status => status.id === "silkDrain"))) {
      next = addEnemyStatus(next, makeStatus("wound"), enemyTargetId);
      logs.push("蝶落守彰追加重伤。");
    }
    return next;
  }

  if (card.skill.name === "时间锚点") {
    const next = applyDirectBossDamage(state, card, 1, logs);
    logs.push("时间锚点造成 1 点伤害，并附加标记。");
    return addEnemyStatus(next, makeStatus("mark"), enemyTargetId);
  }

  if (card.skill.name === "碎片脉冲") {
    const markStacks = getStatusStacks(state.boss.statuses, "mark");
    let next = applyDirectBossDamage(state, card, 1 + markStacks, logs);
    if (markStacks > 0) next = { ...next, boss: refreshBossDebuffs(next.boss) };
    logs.push(`碎片脉冲造成 ${1 + markStacks} 点伤害。`);
    return next;
  }

  if (card.skill.name === "时停回溯") {
    const damage = 1 + Math.floor(Math.random() * 2);
    const wasCharging = !!state.boss.charging;
    let next = applyDirectBossDamage(state, card, damage, logs);
    if (wasCharging) {
      next = { ...next, boss: { ...next.boss, charging: null, crownCooldown: 3 } };
      logs.push("时停回溯成功打断蓄力。");
      if (Math.random() < 0.5) {
        next = addEnemyStatus(next, makeStatus("coma"), enemyTargetId);
        logs.push("时停回溯追加昏迷。");
      }
    }
    return next;
  }

  if (card.skill.name === "断空瞬斩") {
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const hadDebuff = ownerIndex >= 0 && state.fighters[ownerIndex].statuses.some(isDebuff);
    let next = applyDirectBossDamage(state, card, 1 + Math.floor(Math.random() * 3), logs);
    if (ownerIndex >= 0) {
      next = {
        ...next,
        fighters: next.fighters.map((fighter, index) =>
          index === ownerIndex
            ? { ...healFighter({ ...fighter, statuses: removeDebuffs(fighter.statuses, 99) }, hadDebuff ? 1 : 0) }
            : fighter,
        ),
      };
    }
    logs.push(hadDebuff ? "断空瞬斩清除自身减益并回复。" : "断空瞬斩造成随机伤害。");
    return next;
  }

  if (card.skill.name === "暗影裂刃") {
    const removedBuffs = state.boss.statuses.filter(isBuff).length;
    let next = { ...state, boss: { ...state.boss, statuses: state.boss.statuses.filter(status => !isBuff(status)) } };
    next = applyDirectBossDamage(next, card, 2 + removedBuffs, logs);
    logs.push(`暗影裂刃清除 ${removedBuffs} 个增益。`);
    return next;
  }

  if (card.skill.name === "时滞刀域") {
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    let next = drawOwnerCards(state, card.ownerId, 2, "时滞刀域");
    if (ownerIndex >= 0) {
      next = {
        ...next,
        fighters: next.fighters.map((fighter, index) =>
          index === ownerIndex
            ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeTalentStatus(fighter.character, "irisField", { name: "时滞刀域", duration: 1 })) }
            : fighter,
        ),
      };
    }
    logs.push("时滞刀域：摸 2 张鸢尾牌，本回合鸢尾费用 -1、伤害 +1。");
    return next;
  }

  if (card.skill.name === "雾蚀突袭") {
    const next = applyDirectBossDamage(state, card, 2, logs);
    logs.push("雾蚀突袭造成 2 点伤害，并附加重伤。");
    return addEnemyStatus(next, makeStatus("wound"), enemyTargetId);
  }

  if (card.skill.name === "异化释放") {
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const fighters = state.fighters.map((fighter, index) =>
      index === ownerIndex
        ? {
            ...fighter,
            statuses: addOrRefreshStatus(
              addOrRefreshStatus(removeDebuffs(fighter.statuses, 99), makeStatus("stealth")),
              makeStatus("ambush", { duration: 2, description: "拥有隐匿效果，下一次伤害有 50% 几率翻倍。" }),
            ),
          }
        : fighter,
    );
    logs.push("异化释放：艾琳净化自身并进入伏击。");
    return { ...state, fighters };
  }

  if (card.skill.name === "雾翼庇护") {
    const index = targetIndex ?? findShieldTarget(state.fighters);
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === index
        ? { ...fighter, statuses: addOrRefreshStatus(removeDebuffs(fighter.statuses, 99), makeStatus("stealth")) }
        : fighter,
    );
    logs.push(`雾翼庇护让 ${state.fighters[index].character.name} 进入隐匿并净化。`);
    return { ...state, fighters };
  }

  if (card.skill.name === "应急储备") {
    const index = targetIndex ?? findHealTarget(state.fighters);
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === index
        ? {
            ...healFighter(fighter, 1),
            statuses: addOrRefreshStatus(removeSpecificStatus(fighter.statuses, "weak"), makeStatus("regen")),
          }
        : fighter,
    );
    const emergencyReserveCount = state.emergencyReserveCount + 1;
    const energyReward = emergencyReserveCount % 3 === 0 ? 1 : 0;
    logs.push(`应急储备治疗 ${state.fighters[index].character.name} 1 点，并赋予恢复。`);
    if (energyReward > 0) logs.push("应急储备连携触发：每打出 3 张应急储备，恢复 1 点能量。");
    return {
      ...state,
      fighters,
      emergencyReserveCount,
      energy: Math.min(state.maxEnergy, state.energy + energyReward),
    };
  }

  if (card.skill.name === "铲尖猛击") {
    const owner = state.fighters.find(fighter => fighter.character.id === card.ownerId)?.character;
    const reserve = owner ? getActiveSkills(owner).find(skill => skill.name === "应急储备") : undefined;
    let next = applyDirectBossDamage(state, card, 3, logs);
    if (owner && reserve) next = addGeneratedCard(next, owner, reserve);
    logs.push("铲尖猛击造成 3 点伤害，并生成 1 张应急储备。");
    return next;
  }

  if (card.skill.name === "勿忘") {
    const next = applyDirectBossDamage(state, card, 2, logs);
    logs.push("勿忘造成 2 点伤害，并施加标记。");
    return addEnemyStatus(next, makeStatus("mark"), enemyTargetId);
  }

  if (card.skill.name === "铭记") {
    const markStacks = getEnemyMarkStacks(state, enemyTargetId);
    const marked = markStacks > 0;
    let next = applyDirectBossDamage(state, card, marked ? 5 : 3, logs);
    if (marked && !hasEnemyUnits(next)) next = { ...next, boss: refreshBossDebuffs(next.boss) };
    logs.push(marked ? "铭记命中标记目标，造成 5 点伤害并刷新减益。" : "铭记造成 3 点伤害。");
    return next;
  }

  if (card.skill.name === "预知残影") {
    const index = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === index ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeStatus("shield")) } : fighter,
    );
    return addEnemyStatusToRandom({ ...state, fighters }, makeStatus("mark"), logs, "预知残影：丽·沃恩获得护盾，并标记敌人");
  }

  if (card.skill.name === "时痕回溯") {
    const index = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === index ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeTalentStatus(fighter.character, "rewind")) } : fighter,
    );
    logs.push("时痕回溯启动：丽·沃恩进入复活预备状态。");
    return { ...state, fighters };
  }

  if (card.skill.name === "快速射击") {
    const damage = 2;
    logs.push("快速射击造成 2 点伤害。");
    return { ...applyDirectBossDamage(state, card, damage, logs), quickShotCount: state.quickShotCount + 1 };
  }

  if (card.skill.name === "星辰律动") {
    const index = targetIndex ?? findHealTarget(state.fighters);
    const fateIndex = state.hand.findIndex(handCard => handCard.ownerId === card.ownerId && handCard.skill.name === "命运折射");
    const fighters = state.fighters.map((fighter, fighterIndex) => {
      if (fighterIndex !== index) return fighter;
      const healed = healFighter(fighter, 2);
      return fateIndex >= 0 ? { ...healed, statuses: addOrRefreshStatus(healed.statuses, makeStatus("shield")) } : healed;
    });
    logs.push(fateIndex >= 0 ? "星辰律动治疗 2 点，弃置命运折射并追加护盾。" : "星辰律动治疗 2 点。");
    return fateIndex >= 0
      ? { ...state, fighters, hand: state.hand.filter((_, indexInHand) => indexInHand !== fateIndex) }
      : { ...state, fighters };
  }

  if (card.skill.name === "命运折射") {
    const damage = 1 + Math.floor(Math.random() * 3);
    const next = applyDirectBossDamage(state, card, damage, logs);
    logs.push(`命运折射造成 ${damage} 点伤害，并附加失控。`);
    return addEnemyStatus(next, makeStatus("uncontrolled"), enemyTargetId);
  }

  if (card.skill.name === "记忆重构·档案提取") {
    const index = targetIndex ?? findHealTarget(state.fighters);
    const fighters = state.fighters.map((fighter, fighterIndex) => {
      if (fighterIndex !== index) return fighter;
      if (fighter.statuses.some(isDebuff)) {
        return { ...healFighter(fighter, 1), statuses: removeDebuffs(fighter.statuses, 1) };
      }
      const hp = fighter.hp > 1 ? fighter.hp - 1 : fighter.hp;
      return { ...fighter, hp, statuses: addOrRefreshStatus(fighter.statuses, makeStatus("shield")) };
    });
    logs.push("记忆重构·档案提取处理目标状态。");
    return { ...state, fighters };
  }

  if (card.skill.name === "时序断层·停滞场") {
    let next = applyDirectBossDamage(state, card, 2, logs);
    if (Math.random() < 0.5 && next.boss.charging && !next.boss.flowerBurial) {
      next = { ...next, boss: { ...next.boss, charging: null, crownCooldown: 3 } };
      logs.push("时序断层·停滞场触发打断。");
    }
    logs.push("时序断层·停滞场造成 2 点伤害。");
    return next;
  }

  if (card.skill.name === "理论具现·熵减治疗") {
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const overloadStacks = ownerIndex >= 0 ? getStatusStacks(state.fighters[ownerIndex].statuses, "overload") : 0;
    const fighters = state.fighters.map((fighter, fighterIndex) => {
      const healed = healFighter(fighter, 2);
      const statuses = fighterIndex === ownerIndex ? removeSpecificStatus(healed.statuses, "overload") : healed.statuses;
      let nextStatuses = statuses;
      for (let i = 0; i < overloadStacks; i++) nextStatuses = addOrRefreshStatus(nextStatuses, makeStatus("regen"));
      return { ...healed, statuses: nextStatuses };
    });
    logs.push(`理论具现·熵减治疗全体恢复 2 点，并将 ${overloadStacks} 层过载转为恢复。`);
    return { ...state, fighters };
  }

  if (card.skill.name === "雾爪") {
    const owner = state.fighters.find(fighter => fighter.character.id === card.ownerId);
    const empowered = owner?.statuses.some(isDebuff) ? 1 : 0;
    const next = applyDirectBossDamage(state, card, 1 + empowered, logs);
    logs.push(`雾爪造成 ${1 + empowered} 点伤害，并附加流血。`);
    return addEnemyStatus(next, makeStatus("bleed"), enemyTargetId);
  }

  if (card.skill.name === "净化领域") {
    const fighters = state.fighters.map(fighter => ({
      ...fighter,
      statuses: addOrRefreshStatus(removeDebuffs(fighter.statuses, 1), makeStatus("regen")),
    }));
    logs.push("净化领域为全队驱散 1 个减益，并赋予恢复。");
    return { ...state, fighters };
  }

  if (card.skill.name === "残影读秒") {
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const owner = state.fighters[ownerIndex]?.character;
    const claw = owner ? getActiveSkills(owner).find(skill => skill.name === "雾爪") : undefined;
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === ownerIndex
        ? { ...fighter, statuses: addOrRefreshStatus(addOrRefreshStatus(fighter.statuses, makeStatus("uncontrolled")), makeStatus("stealth")) }
        : fighter,
    );
    let next = { ...state, fighters };
    if (owner && claw) next = addGeneratedCard(next, owner, claw);
    logs.push("残影读秒生成 1 张雾爪，并赋予自身失控和隐匿。");
    return next;
  }

  if (card.skill.name === "时序修复") {
    const fighters = state.fighters.map(fighter =>
      fighter.character.id === card.ownerId
        ? {
            ...fighter,
            statuses: addOrRefreshStatus(
              addOrRefreshStatus(
                addOrRefreshStatus(fighter.statuses, makeTalentStatus(fighter.character, "nextDraw", { duration: 2 })),
                makeTalentStatus(fighter.character, "nextEnergy", { duration: 2 }),
              ),
              makeTalentStatus(fighter.character, "nextHand", { duration: 2 }),
            ),
          }
        : fighter,
    );
    logs.push("时序修复：下回合摸牌、能量恢复、手牌上限各 +1，并返回手牌。");
    return { ...state, fighters, hand: [...state.hand, card] };
  }

  if (card.skill.name === "安护屏障") {
    const fighters = state.fighters.map(fighter => ({
      ...fighter,
      statuses: addOrRefreshStatus(addOrRefreshStatus(fighter.statuses, makeStatus("shield")), makeStatus("regen")),
    }));
    const candidates = state.hand.filter(handCard => handCard.uid !== card.uid);
    const discardCard = candidates[Math.floor(Math.random() * candidates.length)];
    logs.push("安护屏障为全队添加护盾和恢复，并随机丢弃 1 张手牌。");
    return discardCard
      ? { ...state, fighters, hand: state.hand.filter(handCard => handCard.uid !== discardCard.uid), discard: [...state.discard, discardCard] }
      : { ...state, fighters };
  }

  if (card.skill.name === "时空之刃·断界") {
    const damage = 1 + Math.floor(Math.random() * 4);
    const next = applyDirectBossDamage(state, card, damage, logs);
    logs.push(`时空之刃·断界造成 ${damage} 点伤害，并附加重伤。`);
    return addEnemyStatus(next, makeStatus("wound"), enemyTargetId);
  }

  if (card.skill.name === "时空之刃·扭曲") {
    const damage = 1 + Math.floor(Math.random() * 2);
    const next = applyDirectBossDamage(state, card, damage, logs);
    logs.push(`时空之刃·扭曲造成 ${damage} 点伤害，并附加失控。`);
    return addEnemyStatus(next, makeStatus("uncontrolled"), enemyTargetId);
  }

  if (card.skill.name === "念念不忘") {
    const ownerIndex = state.fighters.findIndex(fighter => fighter.character.id === card.ownerId);
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === ownerIndex
        ? { ...fighter, statuses: addOrRefreshStatus(addOrRefreshStatus(fighter.statuses, makeStatus("shield")), makeTalentStatus(fighter.character, "memory")) }
        : fighter,
    );
    logs.push("念念不忘生成护盾与记忆检索。");
    return { ...state, fighters };
  }

  if (card.skill.name === "永恒离别") {
    const owner = state.fighters.find(fighter => fighter.character.id === card.ownerId);
    const memory = getStatusStacks(owner?.statuses ?? [], "memory");
    let next = applyDirectBossDamage(state, card, 2 + memory, logs);
    const weakApplied = Math.random() < 0.5;
    if (weakApplied) next = addEnemyStatus(next, makeStatus("weak"), enemyTargetId);
    logs.push(`永恒离别造成 ${2 + memory} 点伤害${weakApplied ? "，并附加虚弱" : ""}。`);
    return next;
  }

  if (card.skill.name === "废墟行者") {
    const index = targetIndex ?? findHealTarget(state.fighters);
    const fighters = state.fighters.map((fighter, fighterIndex) => {
      if (fighterIndex !== index) return fighter;
      let statuses = addOrRefreshStatus(removeDebuffs(fighter.statuses, 2), makeStatus("regen"));
      if (fighter.character.id === card.ownerId) statuses = addOrRefreshStatus(statuses, makeStatus("attackUp"));
      return { ...fighter, statuses };
    });
    logs.push("废墟行者清除减益并赋予恢复。");
    return { ...state, fighters };
  }

  if (card.skill.name === "绝境应激") {
    const owner = state.fighters.find(fighter => fighter.character.id === card.ownerId);
    const missing = owner ? owner.maxHp - owner.hp : 0;
    const damage = 2 + Math.floor(missing / 2);
    logs.push(`绝境应激造成 ${damage} 点伤害。`);
    return applyDirectBossDamage(state, card, damage, logs);
  }

  if (card.skill.name === "雾愈之触") {
    const index = targetIndex ?? findHealTarget(state.fighters);
    const target = state.fighters[index];
    const debuffStacks = target.statuses
      .filter(isDebuff)
      .reduce((sum, status) => sum + (status.stacks ?? 1), 0);
    const heal = 1 + debuffStacks;
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === index
        ? {
            ...healFighter(fighter, heal),
            statuses: removeRandomDebuffs(fighter.statuses, 2),
          }
        : fighter,
    );
    logs.push(`雾愈之触治疗 ${target.character.name} ${heal} 点，并驱散最多 2 个异常。`);
    return { ...state, fighters };
  }

  if (card.skill.name === "幻海囚笼") {
    let next = applyBossDamage(state, 3, logs);
    if (next.boss.charging && !next.boss.flowerBurial) {
      next = { ...next, boss: { ...next.boss, charging: null, crownCooldown: next.boss.flowerBurial ? 0 : 3 } };
      logs.push("幻海囚笼强制打断蓄力。");
    } else if (next.boss.charging && next.boss.flowerBurial) {
      logs.push("花葬状态下的荆棘皇冕无法被打断。");
    }
    logs.push("幻海囚笼造成 3 点伤害。");
    return next;
  }

  if (card.skill.name === "时序祷言") {
    const shisiCards = state.hand.filter(handCard => handCard.ownerName === "时祀" && handCard.uid !== card.uid);
    const heal = shisiCards.length;
    const fighters = state.fighters.map(fighter => ({
      ...healFighter(fighter, heal),
      statuses: fighter.statuses.filter(status => status.id === "talent"),
    }));
    logs.push(`时序祷言清除全队状态，弃置 ${shisiCards.length} 张时祀手牌，全体恢复 ${heal} 点。`);
    return {
      ...state,
      fighters,
      hand: state.hand.filter(handCard => handCard.ownerName !== "时祀" || handCard.uid === card.uid),
      discard: [...state.discard, ...shisiCards],
    };
  }

  if (card.skill.name === "残响视能") {
    const index = targetIndex ?? findShieldTarget(state.fighters);
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === index
        ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeStatus("shield")) }
        : fighter,
    );
    const next = drawOwnerCards({ ...state, fighters }, state.fighters[index].character.id, 1);
    logs.push(`残响视能为 ${state.fighters[index].character.name} 生成 1 层护盾，并抽取 1 张该角色手牌。`);
    return next;
  }

  if (card.skill.name === "紫电瞬杀") {
    const count = state.zidianCount + 1;
    const boosted = hasShieldedDamageBoost(state, card.ownerId) ? 1 : 0;
    const damage = 2 + (count - 1) + boosted;
    logs.push(`紫电瞬杀造成 ${damage} 点伤害。${boosted ? "残响之躯追加 1 点。" : ""}`);
    return { ...applyBossDamage(state, damage, logs), zidianCount: count };
  }

  if (card.skill.name === "虚空刃舞") {
    const boosted = hasShieldedDamageBoost(state, card.ownerId) ? 1 : 0;
    const damage = 3 + boosted;
    let next = applyDirectAllEnemyDamage(state, card, damage, logs);
    next = addEnemyStatusToAll(next, makeStatus("bleed"));
    logs.push(`虚空刃舞造成 ${damage} 点伤害，并附加 1 层流血。`);
    return next;
  }

  const fallbackDamage = copied ? 1 : 2;
  logs.push(`${card.skill.name} 造成 ${fallbackDamage} 点伤害。`);
  return applyBossDamage(state, fallbackDamage, logs);
}

function hasShieldedDamageBoost(state: BattleState, ownerId: string): boolean {
  if (state.turn % 2 === 0) return false;
  const owner = state.fighters.find(fighter => fighter.character.id === ownerId);
  return !!owner?.statuses.some(status => status.id === "shield");
}

function findHealTarget(fighters: Fighter[]): number {
  let best = 0;
  for (let i = 1; i < fighters.length; i++) {
    const score = (fighters[i].maxHp - fighters[i].hp) + fighters[i].statuses.filter(s => s.id === "daze" || s.id === "bleed").length * 2;
    const bestScore = (fighters[best].maxHp - fighters[best].hp) + fighters[best].statuses.filter(s => s.id === "daze" || s.id === "bleed").length * 2;
    if (fighters[i].hp > 0 && score > bestScore) best = i;
  }
  return best;
}

function findShieldTarget(fighters: Fighter[]): number {
  const alive = fighters.map((fighter, index) => ({ fighter, index })).filter(item => item.fighter.hp > 0);
  const withoutShield = alive.filter(item => !item.fighter.statuses.some(status => status.id === "shield"));
  const candidates = withoutShield.length ? withoutShield : alive;
  return candidates.sort((a, b) => a.fighter.hp - b.fighter.hp)[0]?.index ?? 0;
}

function runEnemyTurn(state: BattleState): BattleState {
  if (hasEnemyUnits(state) && currentBoss.encounterType === "finale") return runFinaleEnemyTurn(state);
  if (hasEnemyUnits(state) && currentBoss.encounterType === "hunterWolf") return runHunterWolfEnemyTurn(state);
  if (hasEnemyUnits(state) && currentBoss.encounterType === "summoner") return runSummonerEnemyTurn(state);
  if (hasEnemyUnits(state)) return runTwinEnemyTurn(state);

  let next = { ...state, phase: "enemy" as Phase };
  const logs: string[] = ["敌方回合开始。"];

  next = {
    ...next,
    fighters: next.fighters.map(fighter =>
      fighter.character.creator?.studentId === "12250815" && fighter.hp > 0 && !state.playedThisTurn.includes(fighter.character.id)
        ? {
            ...fighter,
            statuses: addOrRefreshStatus(
              fighter.statuses,
              makeTalentStatus(fighter.character, "immunity", { name: "影痕共鸣", duration: 1, description: "本回合免疫新获得的减益。" }),
            ),
          }
        : fighter,
    ),
  };

  const bossBleed = next.boss.statuses.find(status => status.id === "bleed");
  if (bossBleed) {
    const damage = bossBleed.stacks ?? 1;
    next = { ...next, boss: { ...next.boss, hp: Math.max(0, next.boss.hp - damage), statuses: decrementDurations(next.boss.statuses) } };
    logs.push(`BOSS 因流血失去 ${damage} 点生命。`);
    const flower = triggerFlowerBurialIfNeeded(next, next.boss, logs);
    next = { ...next, ...flower };
  }

  if (next.boss.flowerBurial && next.boss.hp > 0) {
    const delta = next.boss.berserk ? 2 : -2;
    next = { ...next, boss: { ...next.boss, hp: Math.min(next.boss.maxHp, Math.max(0, next.boss.hp + delta)) } };
    logs.push(next.boss.berserk ? "特殊狂暴正在恢复花葬生命：+2。" : "花葬反噬：BOSS 失去 2 点生命。");
  }

  const dazeHeal = next.fighters.reduce(
    (sum, fighter) => sum + fighter.statuses.filter(status => status.id === "daze").reduce((s, status) => s + (status.stacks ?? 1), 0),
    0,
  ) * 2;
  if (dazeHeal > 0 && next.boss.hp > 0) {
    next = healBoss(next, dazeHeal);
    logs.push(`恍惚回响为 BOSS 回复 ${dazeHeal} 点生命。`);
  }

  if (next.boss.hp <= 0) {
    return { ...next, phase: "victory", finaleLine: victoryLines[Math.floor(Math.random() * victoryLines.length)], log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
  }

  if (next.boss.statuses.some(status => status.id === "coma")) {
    logs.push("BOSS 处于昏迷，跳过本次行动。");
    next = { ...next, boss: { ...next.boss, statuses: decrementDurations(next.boss.statuses) } };
  } else if (next.boss.charging) {
    const remaining = next.boss.charging.remaining - 1;
    if (remaining <= 0) {
      next = releaseCrown(next, logs);
    } else {
      next = { ...next, boss: { ...next.boss, charging: { ...next.boss.charging, remaining } } };
      logs.push("荆棘皇冕仍在蓄力。");
    }
  } else if (next.boss.statuses.some(status => status.id === "uncontrolled") && Math.random() < 0.4) {
    logs.push("BOSS 的失控触发，行动失败。");
    next = rewardChaosResonance(next, logs);
  } else if (next.boss.crownCooldown <= 0 && (next.boss.flowerBurial || Math.random() < 0.45)) {
    next = { ...next, boss: { ...next.boss, charging: { remaining: 1, damageTaken: 0 } } };
    logs.push("BOSS 开始蓄力：荆棘皇冕。");
  } else {
    next = lullaby(next, logs);
  }

  if (next.fighters.every(fighter => fighter.hp <= 0)) {
    return { ...next, phase: "defeat", finaleLine: defeatLines[Math.floor(Math.random() * defeatLines.length)], log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
  }

  return startPlayerTurn({ ...next, log: [...logs, ...next.log].slice(0, LOG_LIMIT) });
}

function releaseCrown(state: BattleState, logs: string[]): BattleState {
  const hitIds: string[] = [];
  const summaries: string[] = [];
  let workingState = state;
  const fighters = state.fighters.map(fighter => {
    if (fighter.hp <= 0) return fighter;
    const result = applyDamageToFighter(fighter, 1);
    const after = afterFighterDamaged(workingState, result.fighter, logs);
    workingState = after.state;
    hitIds.push(fighter.character.id);
    summaries.push(result.blocked ? `${fighter.character.name} 的护盾抵消了伤害，获得流血` : `${fighter.character.name} 受到 1 点伤害并获得流血`);
    const statuses = addOrRefreshStatus(after.fighter.statuses, makeStatus("bleed"));
    return { ...after.fighter, statuses };
  });
  logs.push(`BOSS 释放「荆棘皇冕」：${summaries.join("；")}。`);
  return {
    ...workingState,
    fighters,
    recentHitIds: hitIds,
    boss: { ...workingState.boss, charging: null, crownCooldown: workingState.boss.flowerBurial ? 0 : 3 },
  };
}

function rewardChaosResonance(state: BattleState, logs: string[]): BattleState {
  const kaneAlive = state.fighters.some(fighter => fighter.character.creator?.studentId === "12250810" && fighter.hp > 0);
  if (!kaneAlive) return state;
  logs.push("共鸣触发：队伍获得 1 点能量并抽 1 张牌。");
  return drawCards({ ...state, energy: Math.min(state.maxEnergy, state.energy + 1) }, 1);
}

function lullaby(state: BattleState, logs: string[]): BattleState {
  const selectable = state.fighters
    .map((fighter, index) => ({ fighter, index }))
    .filter(item => item.fighter.hp > 0 && !item.fighter.statuses.some(status => status.id === "stealth" || status.id === "ambush"));
  const forcedSweep = !state.boss.flowerBurial && selectable.length === 0;
  const targets = state.boss.flowerBurial || forcedSweep
    ? state.fighters.map((_, index) => index)
    : [selectable[Math.floor(Math.random() * selectable.length)]?.index ?? randomAliveIndex(state.fighters)];
  if (forcedSweep) logs.push("全队处于隐匿/伏击，BOSS 改为释放范围压制。");
  const hitIds: string[] = [];
  const summaries: string[] = [];
  let workingState = state;
  const fighters = state.fighters.map((fighter, index) => {
    if (!targets.includes(index) || fighter.hp <= 0) return fighter;
    const damage = forcedSweep ? 1 : 1 + Math.floor(Math.random() * 2);
    const result = applyDamageToFighter(fighter, damage);
    const after = afterFighterDamaged(workingState, result.fighter, logs);
    workingState = after.state;
    const immune = state.turn % 2 === 0 && result.fighter.statuses.some(status => status.id === "shield");
    hitIds.push(fighter.character.id);
    if (result.blocked) {
      summaries.push(`${fighter.character.name} 的护盾抵消了 ${damage} 点伤害`);
    } else if (immune) {
      summaries.push(`${fighter.character.name} 受到 ${damage} 点伤害，护盾残响免疫恍惚`);
    } else {
      summaries.push(`${fighter.character.name} 受到 ${damage} 点伤害并获得恍惚`);
    }
    return {
      ...after.fighter,
      statuses: immune ? after.fighter.statuses : addOrRefreshStatus(after.fighter.statuses, makeStatus("daze")),
    };
  });
  logs.push(`BOSS 使用「迷雾摇篮曲」：${summaries.join("；")}。`);
  return { ...workingState, fighters, recentHitIds: hitIds, boss: { ...workingState.boss, crownCooldown: Math.max(0, workingState.boss.crownCooldown - 1) } };
}

function runTwinEnemyTurn(state: BattleState): BattleState {
  let next = syncAggregateBoss({ ...state, phase: "enemy" as Phase });
  const logs: string[] = ["敌方回合开始：双生刃鬼展开同步行动。"];
  const blueTwinAlive = next.enemyUnits.some(unit => unit.id === "cangqi" && unit.hp > 0);
  if (blueTwinAlive && state.turn > 0 && state.turn % 3 === 0) {
    next = cleanseEnemyUnits(next, 1, logs, "苍契维持同步校准");
  }

  const waiting = next.enemyUnits.find(unit => unit.hp > 0 && unit.statuses.some(status => status.id === "twinSymbiosis"));
  if (waiting) {
    const symbiosis = waiting.statuses.find(status => status.id === "twinSymbiosis");
    if ((symbiosis?.duration ?? 1) > 1) {
      logs.push(`${waiting.name} 正在维持共生重构，本回合跳过行动。`);
      next = {
        ...next,
        enemyUnits: next.enemyUnits.map(unit =>
          unit.id === waiting.id ? { ...unit, statuses: decrementDurations(unit.statuses) } : unit,
        ),
      };
      return startPlayerTurn({ ...syncAggregateBoss(next), log: [...logs, ...next.log].slice(0, LOG_LIMIT) });
    }
    next = {
      ...next,
      enemyUnits: next.enemyUnits.map(unit => {
        if (unit.id === waiting.id) return { ...unit, statuses: decrementDurations(unit.statuses).filter(status => status.id !== "twinSymbiosis") };
        if (unit.hp <= 0) {
          logs.push(`${waiting.name} 完成共生重构：${unit.name} 以 ${waiting.hp} 点生命返回战斗。`);
          return { ...unit, hp: Math.max(1, waiting.hp), statuses: [] };
        }
        return unit;
      }),
    };
    return startPlayerTurn({ ...syncAggregateBoss(next), log: [...logs, ...next.log].slice(0, LOG_LIMIT) });
  }

  const hitByBlade = new Map<string, Set<"red" | "blue">>();
  for (const unit of next.enemyUnits) {
    if (unit.hp <= 0) continue;
    if (unit.statuses.some(status => status.id === "coma")) {
      logs.push(`${unit.name} 处于昏迷，跳过行动。`);
      continue;
    }
    const targetIndex = randomAliveIndex(next.fighters);
    const target = next.fighters[targetIndex];
    if (!target || target.hp <= 0) continue;

    const attackUp = getStatusStacks(unit.statuses, "attackUp");
    const baseDamage = unit.blade === "red" ? 1 + Math.floor(Math.random() * 3) : 2;
    const damage = baseDamage + attackUp;
    const result = applyDamageToFighter(target, damage);
    const after = afterFighterDamaged(next, result.fighter, logs);
    next = after.state;

    let statuses = after.fighter.statuses;
    if (!result.blocked) {
      if (unit.blade === "red" && Math.random() < 0.5) statuses = addOrRefreshStatus(statuses, makeStatus("wound"));
      if (unit.blade === "blue" && Math.random() < 0.5) statuses = addOrRefreshStatus(statuses, makeStatus("uncontrolled"));
      const seen = hitByBlade.get(target.character.id) ?? new Set<"red" | "blue">();
      seen.add(unit.blade);
      hitByBlade.set(target.character.id, seen);
    }
    next = {
      ...next,
      fighters: next.fighters.map((fighter, index) => index === targetIndex ? { ...after.fighter, statuses } : fighter),
      recentHitIds: [...new Set([...next.recentHitIds, target.character.id])],
    };
    logs.push(`${unit.name} 使用${unit.blade === "red" ? "红刃" : "蓝刃"}命中 ${target.character.name}${result.blocked ? "，护盾抵消了伤害" : `，造成 ${result.damage} 点伤害`}。`);
  }

  for (const [fighterId, blades] of hitByBlade.entries()) {
    if (!(blades.has("red") && blades.has("blue"))) continue;
    next = {
      ...next,
      fighters: next.fighters.map(fighter =>
        fighter.character.id === fighterId
          ? {
              ...fighter,
              statuses: fighter.statuses.some(status => status.id === "immunity")
                ? fighter.statuses
                : addOrRefreshStatus(addOrRefreshStatus(fighter.statuses, makeStatus("daze")), makeStatus("bleed")),
            }
          : fighter,
      ),
    };
    const name = next.fighters.find(fighter => fighter.character.id === fighterId)?.character.name ?? "目标";
    logs.push(`双相刃光触发：${name} 同回合承受红刃与蓝刃，获得恍惚和流血。`);
  }

  next = {
    ...next,
    enemyUnits: next.enemyUnits.map(unit => ({
      ...unit,
      statuses: decrementDurations(unit.statuses),
    })),
  };

  if (next.fighters.every(fighter => fighter.hp <= 0)) {
    return { ...syncAggregateBoss(next), phase: "defeat", finaleLine: "结束了。早就开始了。", log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
  }

  return startPlayerTurn({ ...syncAggregateBoss(next), log: [...logs, ...next.log].slice(0, LOG_LIMIT) });
}

function runSummonerEnemyTurn(state: BattleState): BattleState {
  let next = syncAggregateBoss({ ...state, phase: "enemy" as Phase });
  const logs: string[] = ["敌方回合开始：鸦月织影听见了林中的回声。"];
  const witch = next.enemyUnits.find(unit => unit.id === "boss3-witch");
  const wolf = next.enemyUnits.find(unit => unit.id === "boss3-wolf");

  if (!witch || witch.hp <= 0) {
    return { ...syncAggregateBoss(next), phase: "victory", finaleLine: victoryLines[Math.floor(Math.random() * victoryLines.length)], log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
  }

  if (!wolf || wolf.hp <= 0) {
    next = {
      ...next,
      enemyUnits: next.enemyUnits.map(unit => {
        if (unit.id === "boss3-wolf") return { ...unit, hp: unit.maxHp, statuses: [] };
        if (unit.id === "boss3-witch") {
          return {
            ...unit,
            statuses: addOrRefreshStatus(unit.statuses, makeStatus("stealth", {
              icon: currentBoss.flowerBurialImage ?? unit.image,
              name: "影幕隐匿",
              description: "影狼挡在前方，本体暂时无法被普通攻击锁定。",
            })),
          };
        }
        return unit;
      }),
    };
    logs.push("鸦月织影召唤影狼，并退入影幕。");
    return startPlayerTurn({ ...syncAggregateBoss(next), log: [...logs, ...next.log].slice(0, LOG_LIMIT) });
  }

  if (witch.hp <= Math.floor(witch.maxHp / 2) && state.turn % 3 === 0) {
    next = {
      ...next,
      enemyUnits: next.enemyUnits.map(unit =>
        unit.id === "boss3-witch"
          ? {
              ...unit,
              hp: Math.min(unit.maxHp, unit.hp + 3),
              statuses: addOrRefreshStatus(unit.statuses, makeStatus("regen", {
                icon: currentBoss.flowerBurialImage ?? unit.image,
                name: "林间回生",
                description: "森林的蓝焰正在为她缝合伤口。",
              })),
            }
          : unit,
      ),
    };
    next = {
      ...next,
      enemyUnits: next.enemyUnits.map(unit =>
        unit.id === "boss3-witch"
          ? { ...unit, statuses: removeDebuffs(unit.statuses, 1) }
          : unit,
      ),
    };
    logs.push("鸦月织影使用林间回生：回复 3 点生命，获得恢复，并驱散自身 1 层减益。");
  }

  let hitIds: string[] = [];
  let workingState = next;
  const magicFighters = next.fighters.map(fighter => {
    if (fighter.hp <= 0) return fighter;
    const result = applyDamageToFighter(fighter, 1);
    const after = afterFighterDamaged(workingState, result.fighter, logs);
    workingState = after.state;
    let statuses = after.fighter.statuses;
    if (!result.blocked) {
      statuses = addOrRefreshStatus(statuses, makeStatus(Math.random() < 0.5 ? "daze" : "uncontrolled"));
    }
    hitIds.push(fighter.character.id);
    return { ...after.fighter, statuses };
  });
  next = { ...workingState, fighters: magicFighters, recentHitIds: hitIds };
  logs.push("鸦月织影释放鸦月咒火：全队受到 1 点伤害，并可能陷入恍惚或失控。");

  const targetIndex = randomAliveIndex(next.fighters);
  const target = next.fighters[targetIndex];
  if (target && target.hp > 0) {
    const result = applyDamageToFighter(target, 1);
    const after = afterFighterDamaged(next, result.fighter, logs);
    next = {
      ...after.state,
      fighters: after.state.fighters.map((fighter, index) =>
        index === targetIndex
          ? {
              ...after.fighter,
              statuses: result.blocked ? after.fighter.statuses : addOrRefreshStatus(after.fighter.statuses, makeStatus("bleed")),
            }
          : fighter,
      ),
      recentHitIds: [...new Set([...after.state.recentHitIds, target.character.id])],
    };
    logs.push(`影狼撕咬 ${target.character.name}${result.blocked ? "，护盾抵消了伤害" : "，造成 1 点伤害并附加流血"}。`);
  }

  next = {
    ...next,
    enemyUnits: next.enemyUnits.map(unit => ({
      ...unit,
      statuses: decrementDurations(unit.statuses),
    })),
  };

  if (next.fighters.every(fighter => fighter.hp <= 0)) {
    return { ...syncAggregateBoss(next), phase: "defeat", finaleLine: defeatLines[Math.floor(Math.random() * defeatLines.length)], log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
  }

  return startPlayerTurn({ ...syncAggregateBoss(next), log: [...logs, ...next.log].slice(0, LOG_LIMIT) });
}

function runFinaleEnemyTurn(state: BattleState): BattleState {
  let next = processFinaleTransitions(syncAggregateBoss({ ...state, phase: "enemy" as Phase }), []);
  const logs: string[] = ["敌方回合开始：圣棘祷文在破碎圣堂内回响。"];
  const nun = next.enemyUnits.find(unit => unit.id === "boss5-nun");
  const serpent = next.enemyUnits.find(unit => unit.id === "boss5-serpent");
  const horror = next.enemyUnits.find(unit => unit.id === "boss5-horror");
  const god = next.enemyUnits.find(unit => unit.id === "boss5-god");
  const godAlive = !!god && god.hp > 0;

  next = {
    ...next,
    enemyUnits: next.enemyUnits.map(unit => {
      const regen = getStatusStacks(unit.statuses, "regen");
      if (unit.hp <= 0 || regen <= 0) return unit;
      logs.push(`${unit.name} 因恢复回复 ${regen} 点生命。`);
      return { ...unit, hp: Math.min(unit.maxHp, unit.hp + regen) };
    }),
  };

  if (godAlive) {
    const currentGod = next.enemyUnits.find(unit => unit.id === "boss5-god");
    if (!currentGod || currentGod.hp <= 0) return { ...syncAggregateBoss(next), phase: "victory", finaleLine: "钟声停下，方舟终于听见了黎明。", log: [...logs, ...next.log].slice(0, LOG_LIMIT) };

    if (next.turn % 2 === 1 && !currentGod.statuses.some(status => status.id === "immunity")) {
      next = {
        ...next,
        enemyUnits: next.enemyUnits.map(unit =>
          unit.id === "boss5-god"
            ? { ...unit, statuses: addOrRefreshStatus(unit.statuses, makeStatus("immunity", { name: "神格隔绝", duration: 2, description: "奇数回合获得，免疫减益直到下个己方窗口结束。" })) }
            : unit,
        ),
      };
      logs.push("溺神残响展开神格隔绝：本轮减益难以生效。");
    } else if (next.turn % 2 === 0) {
      next = {
        ...next,
        enemyUnits: next.enemyUnits.map(unit =>
          unit.id === "boss5-god"
            ? {
                ...unit,
                statuses: addOrRefreshStatus(
                  addOrRefreshStatus(unit.statuses, makeStatus("damageBoost", { name: "紫潮增幅", duration: 2, description: "偶数回合获得，造成伤害提高。" })),
                  makeStatus("regen", { name: "神血回潮", duration: 2, stacks: 3, description: "可被驱散。回合开始时每层回复 1 点生命，拖延会继续叠高。" }),
                ),
              }
            : unit,
        ),
      };
      logs.push("紫潮回涌：溺神残响获得攻击提升与 3 层可驱散恢复。");
    }

    const chargedGod = next.enemyUnits.find(unit => unit.id === "boss5-god");
    if (chargedGod?.statuses.some(status => status.id === "charge")) {
      next = finaleGodJudgement(next, chargedGod, logs);
    } else if (Math.random() < 0.42) {
      next = {
        ...next,
        enemyUnits: next.enemyUnits.map(unit =>
          unit.id === "boss5-god"
            ? { ...unit, statuses: addOrRefreshStatus(unit.statuses, makeStatus("charge", { name: "沉没福音", description: "下次行动对全体造成伤害，并施加多种异常。受到伤害可打断。" })) }
            : unit,
        ),
      };
      logs.push("溺神残响开始蓄力：沉没福音。");
    } else {
      next = finaleGodStrike(next, chargedGod ?? currentGod, logs);
    }
  } else if (nun && nun.hp > 0) {
    const nunBerserk = nun.hp <= Math.floor(nun.maxHp / 2);
    if (nunBerserk && !nun.statuses.some(status => status.id === "damageBoost")) {
      next = {
        ...next,
        enemyUnits: next.enemyUnits.map(unit => {
          if (unit.id === "boss5-nun") {
            return { ...unit, statuses: addOrRefreshStatus(unit.statuses, makeStatus("damageBoost", { name: "殉道圣餐", description: "半血后进入进攻姿态。" })) };
          }
          if (unit.id === "boss5-horror" && unit.hp <= 0) {
            return { ...unit, hp: unit.maxHp, statuses: [makeStatus("regen", { name: "圣血回潮", duration: 3, stacks: 2, description: "可被驱散的强化恢复。" })] };
          }
          if (unit.hp > 0) {
            return { ...unit, statuses: addOrRefreshStatus(unit.statuses, makeStatus("regen", { name: "圣血回潮", duration: 3, stacks: 2, description: "可被驱散的强化恢复。" })) };
          }
          return unit;
        }),
      };
      logs.push("殉道圣餐触发：强化蛇群出现，敌方获得 2 层可驱散恢复。");
    }

    const activeEnemies = next.enemyUnits.filter(unit => unit.hp > 0 && unit.id !== "boss5-god");
    const allFull = activeEnemies.length > 0 && activeEnemies.every(unit => unit.hp >= unit.maxHp);
    if (allFull && next.turn % 3 === 0) {
      next = finaleDamageAll(next, 1, logs, "圣棘之母释放满溢祷告", "weak");
    } else if (!nunBerserk && Math.random() < 0.42) {
      const damaged = activeEnemies.filter(unit => unit.hp < unit.maxHp);
      const target = damaged.sort((a, b) => a.hp - b.hp)[0];
      if (target) {
        next = {
          ...next,
          enemyUnits: next.enemyUnits.map(unit => unit.id === target.id ? { ...unit, hp: Math.min(unit.maxHp, unit.hp + 3) } : unit),
        };
        logs.push(`圣棘之母治疗 ${target.name} 3 点生命。`);
      } else {
        next = finaleSummonSerpent(next, logs);
      }
    } else if ((serpent?.hp ?? 0) <= 0 && !nunBerserk) {
      next = finaleSummonSerpent(next, logs);
    } else {
      next = finaleNunAttack(next, logs, nunBerserk);
    }

    const latestSerpent = next.enemyUnits.find(unit => unit.id === "boss5-serpent");
    if (latestSerpent && latestSerpent.hp > 0) next = finaleSerpentBite(next, latestSerpent, logs, false);
    const latestHorror = next.enemyUnits.find(unit => unit.id === "boss5-horror");
    if (latestHorror && latestHorror.hp > 0) next = finaleSerpentBite(next, latestHorror, logs, true);
  }

  next = {
    ...next,
    enemyUnits: next.enemyUnits.map(unit => ({
      ...unit,
      statuses: unit.statuses.some(status => status.id === "charge")
        ? [
            ...decrementDurations(unit.statuses.filter(status => status.id !== "charge")),
            ...unit.statuses.filter(status => status.id === "charge"),
          ]
        : decrementDurations(unit.statuses),
    })),
  };

  if (next.fighters.every(fighter => fighter.hp <= 0)) {
    return { ...syncAggregateBoss(next), phase: "defeat", finaleLine: "祷告继续，方舟没有等到回声。", log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
  }

  return startPlayerTurn({ ...syncAggregateBoss(next), log: [...logs, ...next.log].slice(0, LOG_LIMIT) });
}

function finaleSummonSerpent(state: BattleState, logs: string[]): BattleState {
  logs.push("圣棘之母召唤毒棘蛇。");
  return {
    ...state,
    enemyUnits: state.enemyUnits.map(unit => unit.id === "boss5-serpent" ? { ...unit, hp: unit.maxHp, statuses: [] } : unit),
  };
}

function finaleNunAttack(state: BattleState, logs: string[], berserk: boolean): BattleState {
  const targetIndex = randomAliveIndex(state.fighters);
  const target = state.fighters[targetIndex];
  if (!target || target.hp <= 0) return state;
  const result = applyDamageToFighter(target, berserk ? 2 : 1);
  const after = afterFighterDamaged(state, result.fighter, logs);
  logs.push(`圣棘之母以血棘刺穿 ${target.character.name}${result.blocked ? "，护盾抵消了伤害" : `，造成 ${result.damage} 点伤害`}。`);
  return {
    ...after.state,
    fighters: after.state.fighters.map((fighter, index) => index === targetIndex ? after.fighter : fighter),
    recentHitIds: [...new Set([...after.state.recentHitIds, target.character.id])],
  };
}

function finaleSerpentBite(state: BattleState, unit: EnemyUnitState, logs: string[], strong: boolean): BattleState {
  const targetIndex = randomAliveIndex(state.fighters);
  const target = state.fighters[targetIndex];
  if (!target || target.hp <= 0) return state;
  const result = applyDamageToFighter(target, strong ? 2 : 1);
  const after = afterFighterDamaged(state, result.fighter, logs);
  const statuses = result.blocked ? after.fighter.statuses : addOrRefreshStatus(after.fighter.statuses, makeStatus("bleed"));
  logs.push(`${unit.name} 咬中 ${target.character.name}${result.blocked ? "，护盾抵消了伤害" : `，造成 ${result.damage} 点伤害并附加流血`}。`);
  return {
    ...after.state,
    fighters: after.state.fighters.map((fighter, index) => index === targetIndex ? { ...after.fighter, statuses } : fighter),
    recentHitIds: [...new Set([...after.state.recentHitIds, target.character.id])],
  };
}

function finaleDamageAll(state: BattleState, damage: number, logs: string[], label: string, statusId?: StatusId): BattleState {
  const hitIds: string[] = [];
  let workingState = state;
  const fighters = state.fighters.map(fighter => {
    if (fighter.hp <= 0) return fighter;
    const result = applyDamageToFighter(fighter, damage);
    const after = afterFighterDamaged(workingState, result.fighter, logs);
    workingState = after.state;
    hitIds.push(fighter.character.id);
    return result.blocked || !statusId ? after.fighter : { ...after.fighter, statuses: addOrRefreshStatus(after.fighter.statuses, makeStatus(statusId)) };
  });
  logs.push(`${label}：全体受到压力。`);
  return { ...workingState, fighters, recentHitIds: hitIds };
}

function finaleGodStrike(state: BattleState, unit: EnemyUnitState, logs: string[]): BattleState {
  const targetIndex = randomAliveIndex(state.fighters);
  const target = state.fighters[targetIndex];
  if (!target || target.hp <= 0) return state;
  const damage = 2 + (getStatusStacks(unit.statuses, "damageBoost") > 0 ? 1 : 0);
  const result = applyDamageToFighter(target, damage);
  const after = afterFighterDamaged(state, result.fighter, logs);
  const statusId = Math.random() < 0.5 ? "daze" : "wound";
  const statuses = result.blocked ? after.fighter.statuses : addOrRefreshStatus(after.fighter.statuses, makeStatus(statusId));
  logs.push(`溺神残响凝视 ${target.character.name}${result.blocked ? "，护盾抵消了伤害" : `，造成 ${result.damage} 点伤害并附加${statusText[statusId]}`}。`);
  return {
    ...after.state,
    fighters: after.state.fighters.map((fighter, index) => index === targetIndex ? { ...after.fighter, statuses } : fighter),
    recentHitIds: [...new Set([...after.state.recentHitIds, target.character.id])],
  };
}

function finaleGodJudgement(state: BattleState, unit: EnemyUnitState, logs: string[]): BattleState {
  let next = finaleDamageAll(state, 2 + (getStatusStacks(unit.statuses, "damageBoost") > 0 ? 1 : 0), logs, "溺神残响释放沉没福音", "weak");
  next = {
    ...next,
    fighters: next.fighters.map(fighter =>
      fighter.hp > 0
        ? { ...fighter, statuses: addOrRefreshStatus(addOrRefreshStatus(fighter.statuses, makeStatus("wound")), makeStatus("uncontrolled", { duration: 1 })) }
        : fighter,
    ),
    enemyUnits: next.enemyUnits.map(enemy => enemy.id === unit.id ? { ...enemy, statuses: removeSpecificStatus(enemy.statuses, "charge") } : enemy),
  };
  logs.push("沉没福音附加虚弱、重伤与短暂失控。");
  return next;
}

function runHunterWolfEnemyTurn(state: BattleState): BattleState {
  let next = syncAggregateBoss({ ...state, phase: "enemy" as Phase });
  const logs: string[] = ["敌方回合开始：蚀月铠猎与坟狼逼近调查队。"];
  const hunter = next.enemyUnits.find(unit => unit.id === "boss4-hunter");
  const wolf = next.enemyUnits.find(unit => unit.id === "boss4-wolf");
  const hunterAlive = !!hunter && hunter.hp > 0;
  const wolfAlive = !!wolf && wolf.hp > 0;
  const turnBerserk = next.turn >= 5 && hunterAlive && wolfAlive;
  const wolfBerserk = wolfAlive && (!hunterAlive || turnBerserk);

  if (!hunterAlive && !wolfAlive) {
    return { ...syncAggregateBoss(next), phase: "victory", finaleLine: "赤月沉入城垣，猎场终于重新打开。", log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
  }

  if (turnBerserk) {
    next = {
      ...next,
      enemyUnits: next.enemyUnits.map(unit => {
        if (unit.hp <= 0 || unit.statuses.some(status => status.id === "damageBoost")) return unit;
        return {
          ...unit,
          statuses: addOrRefreshStatus(
            unit.statuses,
            makeStatus("damageBoost", {
              name: "赤月狂暴",
              description: "第五回合后双单位仍存活，造成伤害提高。猎人蓄力不再被伤害打断，坟狼蓄力不再被控制打断。",
            }),
          ),
        };
      }),
    };
    logs.push("赤月狂暴触发：猎人与坟狼仍然同时存活，攻击性上升。");
  } else if (wolfBerserk && !wolf?.statuses.some(status => status.id === "damageBoost")) {
    next = {
      ...next,
      enemyUnits: next.enemyUnits.map(unit =>
        unit.id === "boss4-wolf"
          ? {
              ...unit,
              statuses: addOrRefreshStatus(
                removeSpecificStatus(unit.statuses, "charge"),
                makeStatus("damageBoost", {
                  name: "孤狼狂暴",
                  description: "猎人已被击杀，坟狼不再需要蓄力并提高伤害。",
                }),
              ),
            }
          : unit,
      ),
    };
    logs.push("孤狼狂暴触发：坟狼不再需要蓄力。");
  }

  for (const unit of next.enemyUnits) {
    const current = next.enemyUnits.find(enemy => enemy.id === unit.id);
    if (!current || current.hp <= 0) continue;

    const controlLocked = current.id === "boss4-wolf" && next.turn >= 5;
    if (!controlLocked && current.statuses.some(status => status.id === "coma")) {
      logs.push(`${current.name} 处于昏迷，跳过行动。`);
      next = {
        ...next,
        enemyUnits: next.enemyUnits.map(enemy => enemy.id === current.id ? { ...enemy, statuses: decrementDurations(enemy.statuses) } : enemy),
      };
      continue;
    }
    if (!controlLocked && current.statuses.some(status => status.id === "uncontrolled") && Math.random() < 0.4) {
      logs.push(`${current.name} 的失控触发，行动失败。`);
      next = {
        ...next,
        enemyUnits: next.enemyUnits.map(enemy => enemy.id === current.id ? { ...enemy, statuses: decrementDurations(enemy.statuses) } : enemy),
      };
      continue;
    }

    const charge = current.statuses.find(status => status.id === "charge");
    if (charge) {
      next = current.id === "boss4-hunter"
        ? releaseHunterExecution(next, current, logs)
        : releaseWolfHowl(next, current, logs, getStatusStacks(current.statuses, "damageBoost") > 0);
      continue;
    }

    const enraged = getStatusStacks(current.statuses, "damageBoost") > 0;
    if (current.id === "boss4-hunter") {
      if (Math.random() < (enraged ? 0.55 : 0.38)) {
        next = {
          ...next,
          enemyUnits: next.enemyUnits.map(enemy =>
            enemy.id === current.id
              ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, makeStatus("charge", { name: "月蚀处刑", description: "下次行动释放高伤害攻击，附加虚弱与重伤。" })) }
              : enemy,
          ),
        };
        logs.push("蚀月铠猎开始蓄力：月蚀处刑。");
      } else {
        next = hunterBasicAttack(next, current, logs, enraged);
      }
    } else if (current.id === "boss4-wolf") {
      if (wolfBerserk || enraged) {
        next = releaseWolfHowl(next, current, logs, true);
      } else if (Math.random() < 0.42) {
        next = {
          ...next,
          enemyUnits: next.enemyUnits.map(enemy =>
            enemy.id === current.id
              ? { ...enemy, statuses: addOrRefreshStatus(enemy.statuses, makeStatus("charge", { name: "赤月群嚎", description: "下次行动对全体造成伤害并附加流血。" })) }
              : enemy,
          ),
        };
        logs.push("坟狼开始蓄力：赤月群嚎。");
      } else {
        next = wolfBite(next, current, logs, false);
      }
    }
  }

  next = {
    ...next,
    enemyUnits: next.enemyUnits.map(unit => ({
      ...unit,
      statuses: decrementDurations(unit.statuses),
    })),
  };

  if (next.fighters.every(fighter => fighter.hp <= 0)) {
    return { ...syncAggregateBoss(next), phase: "defeat", finaleLine: "赤月没有落下，只是换了一批猎物。", log: [...logs, ...next.log].slice(0, LOG_LIMIT) };
  }

  return startPlayerTurn({ ...syncAggregateBoss(next), log: [...logs, ...next.log].slice(0, LOG_LIMIT) });
}

function hunterBasicAttack(state: BattleState, unit: EnemyUnitState, logs: string[], enraged: boolean): BattleState {
  const targetIndex = randomAliveIndex(state.fighters);
  const target = state.fighters[targetIndex];
  if (!target || target.hp <= 0) return state;
  const damage = 2 + (enraged ? 1 : 0);
  const result = applyDamageToFighter(target, damage);
  const after = afterFighterDamaged(state, result.fighter, logs);
  logs.push(`${unit.name} 挥动断罪重斧命中 ${target.character.name}${result.blocked ? "，护盾抵消了伤害" : `，造成 ${result.damage} 点伤害`}。`);
  return {
    ...after.state,
    fighters: after.state.fighters.map((fighter, index) => index === targetIndex ? after.fighter : fighter),
    recentHitIds: [...new Set([...after.state.recentHitIds, target.character.id])],
  };
}

function releaseHunterExecution(state: BattleState, unit: EnemyUnitState, logs: string[]): BattleState {
  const targetIndex = randomAliveIndex(state.fighters);
  const target = state.fighters[targetIndex];
  if (!target || target.hp <= 0) return state;
  const enraged = getStatusStacks(unit.statuses, "damageBoost") > 0;
  const damage = 3 + (enraged ? 1 : 0);
  const result = applyDamageToFighter(target, damage);
  const after = afterFighterDamaged(state, result.fighter, logs);
  const statuses = result.blocked
    ? after.fighter.statuses
    : addOrRefreshStatus(addOrRefreshStatus(after.fighter.statuses, makeStatus("weak")), makeStatus("wound"));
  logs.push(`${unit.name} 释放「月蚀处刑」命中 ${target.character.name}${result.blocked ? "，护盾抵消了伤害" : `，造成 ${result.damage} 点伤害并附加虚弱、重伤`}。`);
  return {
    ...after.state,
    fighters: after.state.fighters.map((fighter, index) => index === targetIndex ? { ...after.fighter, statuses } : fighter),
    enemyUnits: after.state.enemyUnits.map(enemy => enemy.id === unit.id ? { ...enemy, statuses: removeSpecificStatus(enemy.statuses, "charge") } : enemy),
    recentHitIds: [...new Set([...after.state.recentHitIds, target.character.id])],
  };
}

function wolfBite(state: BattleState, unit: EnemyUnitState, logs: string[], enraged: boolean): BattleState {
  const targetIndex = randomAliveIndex(state.fighters);
  const target = state.fighters[targetIndex];
  if (!target || target.hp <= 0) return state;
  const damage = 1 + (enraged ? 1 : 0);
  const result = applyDamageToFighter(target, damage);
  const after = afterFighterDamaged(state, result.fighter, logs);
  const statuses = result.blocked ? after.fighter.statuses : addOrRefreshStatus(after.fighter.statuses, makeStatus("bleed"));
  logs.push(`${unit.name} 撕咬 ${target.character.name}${result.blocked ? "，护盾抵消了伤害" : `，造成 ${result.damage} 点伤害并附加流血`}。`);
  return {
    ...after.state,
    fighters: after.state.fighters.map((fighter, index) => index === targetIndex ? { ...after.fighter, statuses } : fighter),
    recentHitIds: [...new Set([...after.state.recentHitIds, target.character.id])],
  };
}

function releaseWolfHowl(state: BattleState, unit: EnemyUnitState, logs: string[], enraged: boolean): BattleState {
  const hitIds: string[] = [];
  const summaries: string[] = [];
  let workingState = state;
  const fighters = state.fighters.map(fighter => {
    if (fighter.hp <= 0) return fighter;
    const result = applyDamageToFighter(fighter, 1 + (enraged ? 1 : 0));
    const after = afterFighterDamaged(workingState, result.fighter, logs);
    workingState = after.state;
    hitIds.push(fighter.character.id);
    summaries.push(result.blocked ? `${fighter.character.name} 的护盾抵消了伤害` : `${fighter.character.name} 受到 ${result.damage} 点伤害并获得流血`);
    return result.blocked ? after.fighter : { ...after.fighter, statuses: addOrRefreshStatus(after.fighter.statuses, makeStatus("bleed")) };
  });
  logs.push(`${unit.name} 释放「赤月群嚎」：${summaries.join("；")}。`);
  return {
    ...workingState,
    fighters,
    enemyUnits: workingState.enemyUnits.map(enemy => enemy.id === unit.id ? { ...enemy, statuses: removeSpecificStatus(enemy.statuses, "charge") } : enemy),
    recentHitIds: hitIds,
  };
}

function randomAliveIndex(fighters: Fighter[]): number {
  const alive = fighters.map((fighter, index) => ({ fighter, index })).filter(item => item.fighter.hp > 0);
  return alive[Math.floor(Math.random() * alive.length)]?.index ?? 0;
}

function startPlayerTurn(state: BattleState): BattleState {
  const logs: string[] = [];
  const fighters = state.fighters.map(fighter => {
    const bleed = fighter.statuses.find(status => status.id === "bleed");
    const damage = bleed?.stacks ?? 0;
    if (damage > 0) logs.push(`${fighter.character.name} 因流血失去 ${damage} 点生命。`);
    const regen = getStatusStacks(fighter.statuses, "regen");
    const healed = regen > 0 ? healFighter(fighter, regen) : fighter;
    if (regen > 0) logs.push(`${fighter.character.name} 因恢复回复 ${regen} 点生命。`);
    return {
      ...healed,
      hp: Math.max(0, healed.hp - damage),
      statuses: decrementDurations(healed.statuses),
    };
  });

  let processedFighters = fighters;
  if (processedFighters.some(fighter => fighter.character.creator?.studentId === "12250813" && fighter.hp <= 0 && fighter.statuses.some(status => status.id === "lilaReviveUsed"))) {
    processedFighters = processedFighters.map(fighter => {
      const revived = fighter.character.creator?.studentId === "12250813" && fighter.hp <= 0 && fighter.statuses.some(status => status.id === "lilaReviveUsed");
      const base = revived ? { ...fighter, hp: 1 } : fighter;
      return {
        ...base,
        statuses: addOrRefreshStatus(removeDebuffs(base.statuses, 1), makeStatus("regen")),
      };
    });
    logs.push("朽茧余温触发：莉拉复活，全队驱散 1 层异常并获得恢复。");
  }

  const suyuanIndex = processedFighters.findIndex(fighter => fighter.character.creator?.studentId === "12250803" && fighter.hp > 0);
  if (suyuanIndex >= 0) {
    if (Math.random() < 0.5 && state.boss.statuses.some(status => status.id === "stealth")) {
      logs.push("翳目溯时取消了敌人的隐匿。");
    }
    if (Math.random() < 0.5) {
      processedFighters = processedFighters.map((fighter, index) =>
        index === suyuanIndex ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeStatus("stealth")) } : fighter,
      );
      logs.push("翳目溯时让溯衍进入隐匿。");
    }
  }

  const linshuyaoIndex = processedFighters.findIndex(fighter => fighter.character.creator?.studentId === "12250811" && fighter.hp > 0);
  if (linshuyaoIndex >= 0) {
    processedFighters = processedFighters.map((fighter, index) =>
      index === linshuyaoIndex ? { ...fighter, statuses: addOrRefreshStatus(fighter.statuses, makeTalentStatus(fighter.character, "memory")) } : fighter,
    );
    const memory = getStatusStacks(processedFighters[linshuyaoIndex].statuses, "memory");
    if (memory >= 4) {
      processedFighters = processedFighters.map(fighter => ({
        ...fighter,
        statuses: fighter.statuses
          .filter(status => status.id !== "memory")
          .map(status => isBuff(status) ? { ...status, stacks: (status.stacks ?? 1) + 1, duration: status.duration ?? 2 } : status),
      }));
      logs.push("记忆检索达到 4 层：全队增益层数 +1。");
    }
  }

  const extraDraw = processedFighters.reduce((sum, fighter) => sum + getStatusStacks(fighter.statuses, "nextDraw"), 0);
  const extraEnergy = processedFighters.reduce((sum, fighter) => sum + getStatusStacks(fighter.statuses, "nextEnergy"), 0);
  const extraHand = processedFighters.reduce((sum, fighter) => sum + getStatusStacks(fighter.statuses, "nextHand"), 0);
  const scavengerEnergy = state.turn + 1 === 3 || state.turn + 1 === 6
    ? processedFighters.some(fighter => fighter.character.creator?.studentId === "12250801" && fighter.hp > 0) ? 1 : 0
    : 0;

  let next: BattleState = {
    ...state,
    turn: state.turn + 1,
    energy: Math.min(state.maxEnergy, state.energy + 4 + extraEnergy + scavengerEnergy),
    maxHand: getBaseMaxHand(processedFighters.map(fighter => fighter.character)) + extraHand,
    phase: "player",
    fighters: processedFighters,
    zidianCount: 0,
    quickShotCount: 0,
    playedThisTurn: [],
    playedSkillNames: [],
    boss: { ...state.boss, crownCooldown: Math.max(0, state.boss.crownCooldown - 1) },
    log: logs.length ? [...logs, ...state.log].slice(0, LOG_LIMIT) : state.log,
  };

  if (processedFighters.every(fighter => fighter.hp <= 0)) {
    return { ...next, phase: "defeat", finaleLine: defeatLines[Math.floor(Math.random() * defeatLines.length)] };
  }

  const draw = next.drawPerTurn + (next.turn <= 3 ? 1 : 0) + extraDraw;
  return drawCards(next, draw);
}

function IntroOverlay({ slide, onNext }: { slide?: IntroSlide; onNext: () => void }) {
  if (!slide) return null;
  const isStart = slide.kind === "start";
  const actionText = slide.kind === "boss" ? "确认目标" : isStart ? "进入战斗" : "继续";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-8"
    >
      <motion.div
        key={`${slide.kind}-${slide.title}`}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 1.03 }}
        transition={{ duration: 0.35 }}
        className={`relative grid w-full overflow-hidden border border-primary/35 bg-[#0c0712] shadow-[0_0_60px_rgba(168,85,247,0.28)] ${isStart ? "max-w-4xl place-items-center p-14 text-center" : "max-w-5xl grid-cols-[0.9fr_1.1fr]"}`}
      >
        {!isStart && (
          <div className="relative h-[520px] overflow-hidden bg-black">
            {slide.image && <img src={slide.image} alt="" className="h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c0712]/50" />
          </div>
        )}
        <div className={isStart ? "" : "flex flex-col justify-center p-10"}>
          <div className="mb-3 font-mono text-xs font-bold tracking-[0.35em] text-primary">{slide.subtitle}</div>
          <h2 className={`${isStart ? "text-7xl" : "text-5xl"} mb-6 font-black tracking-wider text-white`}>{slide.title}</h2>
          <div className="border-l-4 border-primary bg-white/5 px-5 py-4 text-xl leading-loose text-white/85">
            {slide.line}
          </div>
          <Button
            onClick={onNext}
            className={`${isStart ? "mx-auto mt-8" : "mt-8 w-48"} rounded-none border border-primary bg-primary px-8 py-6 text-base font-black tracking-widest text-white hover:bg-primary/80`}
          >
            {actionText}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FlowerBurialOverlay({ image, berserk }: { image: string; berserk: boolean }) {
  const line = berserk ? "这么快就让花开了……那就一起留下吧。" : "花……终于开了。你们听见了吗？";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center bg-red-950/45"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 48 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 1.08, opacity: 0, y: -30 }}
        transition={{ duration: 0.55 }}
        className="relative w-full max-w-5xl overflow-hidden border border-red-400/50 bg-black shadow-[0_0_80px_rgba(248,113,113,0.45)]"
      >
        <motion.img
          src={image}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          className="h-[560px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <div className="mb-2 font-mono text-sm tracking-[0.35em] text-red-200">{berserk ? "SPECIAL BERSERK" : "PHASE SHIFT"}</div>
          <div className="text-6xl font-black tracking-wider text-white">花葬</div>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            transition={{ delay: 0.65, duration: 1.3, ease: "easeOut" }}
            className="mt-4 overflow-hidden whitespace-nowrap border-l-4 border-red-300 bg-black/45 px-5 py-3 text-2xl font-serif text-red-50"
          >
            “{line}”
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FighterPanel({ fighter, selectable, isHit, onClick }: { fighter: Fighter; selectable: boolean; isHit: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      disabled={!selectable}
      onClick={onClick}
      animate={isHit ? { x: [0, -8, 8, -5, 5, 0], borderColor: "rgba(248,113,113,0.9)" } : { x: 0 }}
      transition={{ duration: 0.46 }}
      className={`w-full border bg-black/45 p-3 text-left transition ${
        fighter.hp <= 0
          ? "border-red-900/60 opacity-55"
          : isHit
            ? "border-red-400 shadow-[0_0_22px_rgba(248,113,113,0.42)]"
          : selectable
            ? "border-primary/70 shadow-[0_0_18px_rgba(168,85,247,0.25)] hover:-translate-y-0.5 hover:bg-primary/10"
            : "border-white/10"
      }`}
    >
      <div className="flex gap-3">
        <img src={fighter.character.avatar} alt={fighter.character.name} className="h-14 w-14 object-cover" />
        <div className="min-w-0 flex-1">
          <div className="font-black">{fighter.character.name}</div>
          <div className="truncate text-xs text-white/55">{fighter.character.profession} / {fighter.character.positioning}</div>
          <div className="mt-2 h-2 border border-emerald-400/30 bg-black">
            <div className="h-full bg-emerald-400" style={{ width: `${Math.max(0, (fighter.hp / fighter.maxHp) * 100)}%` }} />
          </div>
          <div className="mt-1 text-xs font-mono">HP {fighter.hp}/{fighter.maxHp}</div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {fighter.statuses.map((status, index) => <StatusIcon key={`${status.id}-${index}`} status={status} />)}
      </div>
      {selectable && <div className="mt-2 text-xs font-bold text-primary">点击选择</div>}
    </motion.button>
  );
}

const logHighlights = [
  "迷雾摇篮曲",
  "荆棘皇冕",
  "花葬",
  "雾海感知",
  "雾愈之触",
  "幻海囚笼",
  "残响之躯",
  "时序祷言",
  "残响视能",
  "暗影潜行",
  "紫电瞬杀",
  "虚空刃舞",
  "恍惚",
  "流血",
  "护盾",
  "蓄力",
  "技能免疫",
];

function LogLine({ text }: { text: string }) {
  const pattern = new RegExp(`(${logHighlights.map(escapeRegExp).join("|")})`, "g");
  const parts = text.split(pattern);
  return (
    <div>
      {parts.map((part, index) =>
        logHighlights.includes(part) ? (
          <span key={`${part}-${index}`} className="font-black text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </div>
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function StatusIcon({ status }: { status: Status }) {
  return (
    <div title={`${status.name}${status.stacks ? ` x${status.stacks}` : ""}${status.duration ? ` / ${status.duration}回合` : ""}\n${status.description}`} className="relative h-8 w-8 border border-white/20 bg-black/40">
      {status.icon ? <img src={status.icon} alt={status.name} className="h-full w-full object-cover" /> : <span className="text-xs">{statusText[status.id]}</span>}
      {status.stacks && status.stacks > 1 && <span className="absolute -bottom-1 -right-1 bg-red-500 px-1 text-[10px] font-bold">{status.stacks}</span>}
    </div>
  );
}

function EnemyTargetRow({
  enemies,
  targetingCard,
  onEnemyClick,
}: {
  enemies: EnemyTarget[];
  targetingCard: BattleCard | null;
  onEnemyClick: (enemyId: string) => void;
}) {
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between text-[10px] font-mono font-bold tracking-[0.24em] text-red-200/65">
        <span>ENEMY TARGETS</span>
        <span>{enemies.length} HOSTILE</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {enemies.map(enemy => {
          const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 0;
          return (
            <button
              key={enemy.id}
              type="button"
              disabled={!targetingCard || enemy.hp <= 0 || !enemy.selected}
              onClick={() => onEnemyClick(enemy.id)}
              className={`group relative min-h-[88px] overflow-hidden border bg-black/60 p-2 text-left transition ${
                targetingCard
                  ? "border-red-300 shadow-[0_0_20px_rgba(248,113,113,0.26)] hover:-translate-y-0.5 hover:bg-red-500/10"
                  : enemy.selected
                    ? "border-red-500/45"
                    : "border-white/10"
              }`}
            >
              <img src={enemy.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 transition group-hover:opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/72 to-black/28" />
              <div className="relative grid grid-cols-[48px_1fr] gap-2">
                <div className="h-12 w-12 overflow-hidden border border-red-300/40 bg-black">
                  <img src={enemy.image} alt={enemy.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-white">{enemy.name}</div>
                  <div className="truncate text-[10px] text-red-100/55">{enemy.title}</div>
                  <div className="mt-1 h-1.5 border border-red-400/30 bg-black">
                    <div className="h-full bg-red-500" style={{ width: `${Math.max(0, hpRatio * 100)}%` }} />
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-red-100/70">HP {enemy.hp}/{enemy.maxHp}</div>
                </div>
              </div>
              <div className="relative mt-2 flex flex-wrap gap-1.5">
                {enemy.statuses.map((status, index) => <StatusIcon key={`${enemy.id}-${status.id}-${index}`} status={status} />)}
              </div>
              {targetingCard && (
                <div className="relative mt-2 text-[10px] font-black tracking-widest text-red-100">
                  {enemy.selected ? "点击攻击" : "暂时无法锁定"}
                </div>
              )}
            </button>
          );
        })}
        {Array.from({ length: Math.max(0, 3 - enemies.length) }, (_, index) => (
          <div key={`empty-enemy-${index}`} className="flex min-h-[88px] items-center justify-center border border-white/10 bg-black/30 text-[10px] font-mono tracking-widest text-white/25">
            EMPTY
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillHoverPanel({ card, cost }: { card: BattleCard; cost: number }) {
  const owner = characters.find(character => character.id === card.ownerId);
  const iconOverrides = getTalentStatusIconOverrides(owner?.skills.find(skill => skill.type === "天赋")?.icon || owner?.avatar || card.ownerAvatar);
  return (
    <motion.div
      key={card.uid}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="pointer-events-none fixed bottom-[176px] left-6 z-40 w-[420px] border border-primary/50 bg-[#0d0715]/95 p-4 shadow-[0_0_36px_rgba(168,85,247,0.28)] backdrop-blur"
    >
      <div className="flex gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden border border-primary/35 bg-black">
          <img src={card.skill.icon || card.ownerAvatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{card.skill.name}</h3>
            <Badge className="rounded-none border border-primary/40 bg-primary/15 text-primary">{card.skill.type}</Badge>
            <Badge className="rounded-none border border-yellow-300/40 bg-yellow-300/10 text-yellow-100">能量 {cost}</Badge>
          </div>
          <div className="text-xs font-bold text-white/55">{card.ownerName} / {card.skill.range}</div>
          <p className="mt-3 text-sm leading-relaxed text-white/78">
            <StatusTermText text={card.skill.description || "暂无技能说明。"} iconOverrides={iconOverrides} />
          </p>
          {card.skill.effect && (
            <div className="mt-3 border-l-4 border-primary bg-white/5 px-3 py-2 text-sm leading-relaxed text-cyan-100">
              <StatusTermText text={card.skill.effect} iconOverrides={iconOverrides} />
            </div>
          )}
          {card.skill.upgrade && (
            <div className="mt-2 text-xs font-bold text-yellow-100/80">
              进阶：<StatusTermText text={card.skill.upgrade} iconOverrides={iconOverrides} />
            </div>
          )}
          <SkillStatusHints texts={[card.skill.description, card.skill.effect, card.skill.upgrade]} className="mt-3" iconOverrides={iconOverrides} />
          <SkillDiscardHint skill={card.skill} className="mt-3" />
        </div>
      </div>
    </motion.div>
  );
}

function BattleCardButton({
  card,
  cost,
  disabled,
  selected,
  onClick,
  onHover,
}: {
  card: BattleCard;
  cost: number;
  disabled: boolean;
  selected: boolean;
  onClick: () => void;
  onHover: (card: BattleCard | null) => void;
}) {
  const icon = card.skill.icon || card.ownerAvatar;
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => onHover(card)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(card)}
      onBlur={() => onHover(null)}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      className={`group grid h-[124px] grid-rows-[minmax(0,1fr)_48px] overflow-hidden border bg-black/60 text-left transition ${
        disabled
          ? "border-white/10 opacity-45"
          : selected
            ? "border-yellow-300 shadow-[0_0_26px_rgba(250,204,21,0.34)]"
            : "border-primary/40 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_24px_rgba(168,85,247,0.28)]"
      }`}
    >
      <div className="relative overflow-hidden">
        <img src={icon} alt={card.skill.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        <div className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-300 text-xs font-black text-black">{cost}</div>
      </div>
      <div className="grid grid-cols-[34px_1fr] items-center gap-1.5 border-t border-primary/30 bg-[#10091b] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden border border-primary/35 bg-white/90">
          <img src={card.ownerAvatar} alt={card.ownerName} className="max-h-full max-w-full object-contain" />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[11px] font-black text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.55)]">{card.skill.name}</div>
          <div className="mt-0.5 truncate text-[10px] font-bold text-primary">{card.ownerName}</div>
        </div>
      </div>
    </motion.button>
  );
}

function PlayedCardAnimation({ card }: { card: BattleCard }) {
  const icon = card.skill.icon || card.ownerAvatar;
  return (
    <motion.div
      initial={{ opacity: 0, y: 140, scale: 0.65, rotate: -4 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, y: -120, scale: 1.18, rotate: 4 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="pointer-events-none fixed left-1/2 top-1/2 z-40 w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden border-2 border-primary bg-black shadow-[0_0_60px_rgba(168,85,247,0.55)]"
    >
      <img src={icon} alt="" className="h-32 w-full object-cover" />
      <div className="border-t border-white/10 bg-[#130b20] p-3">
        <div className="text-center text-lg font-black">{card.skill.name}</div>
        <div className="text-center text-xs text-white/60">{card.ownerName}</div>
      </div>
    </motion.div>
  );
}

function InfoTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-white/10 bg-white/5 p-2">
      <div className="text-[10px] text-white/45">{label}</div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}

const clearReportDetails: Record<string, { action: string; combat: string; result: string; loss: string; note: string }> = {
  "boss-01": {
    action:
      "调查队第七小队已于 ██ 时进入目标区域，对异常源进行定位与围剿。目标具备中等范围精神干扰与环境侵蚀能力，可通过花状组织释放孢体，对周边时序稳定性造成持续扰动。进入区域后，稳定装置记录到多次低频脉冲，目标核心位置与废弃结构群中心重合。",
    combat:
      "行动过程中，小队遭遇异常精神方面的干扰，并出现短时感知偏移与记忆错位现象。目标在交战中释放花状孢体与骨面幻象，试图分割前线单位并拖慢压制节奏。经稳定装置介入后，小队恢复基础协同，完成对主体外层结构的剥离，并对核心进行集中打击。",
    result:
      "异常体已失活，核心结构成功回收并编号封存。区域扭曲指数下降至安全阈值以下，现场残留的花状组织已由后勤组焚毁处理。",
    loss: "轻伤 ██ 人（已稳定），装备损毁率约 18%，阵亡 ██ 人。",
    note:
      "该异常疑似与高阶“时间阴影”存在关联，失活后仍残留微弱波形反应。建议提升同类事件响应等级，并在后续废弃结构群行动中优先部署精神干扰隔离装置。",
  },
  "boss-02": {
    action:
      "调查队第七小队于 ██ 时进入旧交通节点残骸区外围，对持续活动的双体异常进行追踪与封锁。目标表现为高度同步的双个体结构，具备近战高速机动能力与短距离位相错位特性，可在极短时间内完成攻击路径重构。环境受其影响出现轻度空间折叠与路径误导现象。",
    combat:
      "接敌后，异常体迅速展开协同攻击。两目标间存在明显“共生”机制，可共享受击反馈并进行伤害转移，导致常规压制手段效果削弱。交战中段，小队成员出现短时判断延迟与攻击落空现象，疑似受其位相偏移能力影响。通过分割战术与同步干扰装置介入，小队成功打断其协同节奏，将两目标强制分离。最终由前线单位完成近距离压制，双目标相继失去行动能力。",
    result:
      "异常体“双生刃鬼”已确认失活，双核心结构完成回收并分别封存。现场残留的空间扰动已趋于稳定，区域威胁等级下降至可控范围。",
    loss: "轻伤 ██ 人（均已脱离危险），中度损伤装备若干，约 21% 需更换，阵亡 ██ 人。",
    note:
      "目标在失活前仍保持微弱同步反应，个体间连接未完全断裂。部分成员报告称在接近时产生“重影感”与短暂时间错位体验。该现象已记录并移交研究组。",
  },
  "boss-03": {
    action:
      "调查队第七小队于 ██ 时进入黑林拘束域，对异常个体进行定位与清除。目标以“拟态人形 + 伴生兽”形式存在，具备领域性精神侵蚀与环境同化能力，可通过悬挂遗体、符链与紫色结晶构建“仪式场”，持续强化自身存在稳定度。",
    combat:
      "小队进入林区后即受到视觉与听觉干扰，多名成员报告出现“重复月相”与“个体数量异常增殖”等认知偏差。目标在战斗中通过伴生兽进行牵制，并释放低强度精神压迫波动。稳定装置启动后，小队恢复基础协同能力，采取分散压制与核心锁定策略，对主体进行围剿。伴生兽被优先击杀，随后完成对异常个体的致命打击。",
    result:
      "异常体已确认失活，核心结构（黑羽冠饰及结晶节点）已完成回收并封存。现场“仪式场”结构崩解，紫色能量反应显著衰减，区域扭曲指数恢复至可控范围。",
    loss: "轻伤 ██ 人（已稳定），精神污染迹象 ██ 例（均已隔离观察），装备损毁率约 22%，阵亡 ██ 人。",
    note:
      "该异常具备明显“仪式构筑”特征，疑似通过环境叠加强化自身存在层级。其能量波形与已记录“时间阴影”存在部分重合，推测为其衍生或低阶映射体。建议后续进入同类林地环境时，优先部署高规格稳定装置，并限制单点停留时间。",
  },
  "boss-04": {
    action:
      "调查队第七小队于 ██ 时进入目标区域，对异常个体进行定位与清除。目标以“重装人形主体 + 伴生兽”形式存在，主体持有大型斧戟类武器，具备高强度近战压制能力；伴生兽表现为巨狼形态，可配合主体进行侧翼突袭与牵制。目标活动区域存在赤色能量沉积，并对周边空间稳定性造成持续扰动。",
    combat:
      "接敌后，目标迅速展开正面压制。主体通过重型武器发动大范围攻击，伴生兽从侧翼进行高速扑击，迫使小队队形多次调整。交战中，小队记录到主体与伴生兽之间存在同步反应，一方受创时，另一方行动强度会短暂提升。稳定装置启动后，赤色能量波动被削弱。小队采取分割战术，优先压制伴生兽，随后集中火力攻击主体。伴生兽失去行动能力后，主体行动明显迟缓，最终被前线单位合围击倒。",
    result:
      "异常体“断蚀骑兽”已确认失活。主体核心结构与伴生兽颈部链式核心已完成回收并分别封存。大型斧戟残留有赤蚀反应，已作为危险遗物转交研究组处理。现场能量场明显衰减，区域扭曲指数下降至可控范围。",
    loss: "轻伤 ██ 人（已稳定），中度伤 ██ 人，装备损毁率约 24%，阵亡 ██ 人。",
    note:
      "该异常具备明显“守卫”特征，活动范围长期固定于旧王城遗址外围，疑似与遗址封锁机制有关。目标能量波形与已记录“时间阴影”存在部分重合，但污染性质更偏向赤蚀残响。建议后续遭遇同类“人形主体 + 伴生兽”结构时，优先切断二者同步关系，并避免正面持久战。",
  },
};

function ResultOverlay({ phase, line, onRestart }: { phase: Phase; line: string; onRestart: () => void }) {
  const victory = phase === "victory";
  const report = bossClearStories[currentBoss.id]?.[0];
  const reportDetail = clearReportDetails[currentBoss.id];
  const resultImage = victory ? report?.image ?? currentBoss.defeatImage ?? currentBoss.image : currentBoss.image;
  const reportRows = [
    ["档案编号", report?.label ?? currentBoss.codename],
    ["异常编号", currentBoss.codename],
    ["目标区域", currentBoss.habitat],
    ["异常等级", currentBoss.threatLevel],
    ["分类", currentBoss.classification],
    ["封存状态", victory ? "已压制 / 核心回收" : "行动失败 / 威胁延续"],
  ];
  const actionSummary = reportDetail?.action ?? currentBoss.description;
  const combatSummary = reportDetail?.combat ?? currentBoss.backgroundStory;
  const resultSummary = reportDetail?.result ?? report?.body ?? "异常体已确认失活，核心结构已完成回收并封存。";
  const lossSummary = reportDetail?.loss ?? "轻伤 ██ 人（已稳定），装备损毁率待复核，阵亡 ██ 人。";
  const noteSummary = reportDetail?.note ?? currentBoss.warning;

  if (victory) {
    return (
      <div className="fixed inset-0 isolate bg-black" style={{ zIndex: 9999, opacity: 1, backgroundColor: "#000" }}>
        <img src={resultImage} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 1 }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/15 to-black/85" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 to-transparent" />

        <section className="absolute bottom-8 left-8 max-w-[58vw] text-white">
          <div className="mb-3 inline-flex items-center gap-2 border border-primary/50 bg-black/55 px-3 py-2 text-xs font-bold tracking-[0.32em] text-primary">
            <Sparkles className="h-4 w-4" />
            BOSS DEFEATED
          </div>
          <h2 className="text-5xl font-black drop-shadow-[0_0_22px_rgba(0,0,0,0.9)]">战斗胜利</h2>
          <p className="mt-4 max-w-2xl border-l-4 border-primary bg-black/45 px-5 py-3 font-serif text-xl italic leading-relaxed text-white/88">
            "{line}"
          </p>
        </section>

        <aside className="absolute right-6 top-6 flex h-[calc(100vh-48px)] w-[39vw] min-w-[560px] max-w-[720px] flex-col border border-[#d8c7a6]/45 bg-[#1b1720]/92 text-[#efe6d2] shadow-[0_0_50px_rgba(0,0,0,0.75)] backdrop-blur-md">
          <div className="grid grid-cols-[minmax(170px,0.7fr)_minmax(310px,1.3fr)] gap-5 border-b border-[#d8c7a6]/30 bg-[#2b2131]/82 px-6 py-5">
            <div>
              <div className="text-[11px] font-bold tracking-[0.32em] text-[#c590ff]">ARK FIELD ARCHIVE</div>
              <h3 className="mt-2 text-3xl font-black text-[#fff8e8]">{report?.title ?? currentBoss.name}</h3>
              <div className="mt-2 text-xs tracking-[0.22em] text-[#d8c7a6]/70">{currentBoss.name} / CLEAR REPORT</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {reportRows.map(([label, value]) => (
                <div key={label} className="border border-[#d8c7a6]/25 bg-[#f2e4c8]/8 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="text-[9px] font-bold tracking-[0.18em] text-[#d8c7a6]/62">{label}</div>
                  <div className="mt-1 text-[12px] font-black leading-snug text-[#fff8e8]/92">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,248,232,0.055),rgba(255,248,232,0.018))] px-6 py-5">
            <div className="space-y-3 border border-[#b85a52]/70 bg-[#251817]/72 p-4 shadow-[0_0_22px_rgba(184,90,82,0.08)]">
              <div>
                <div className="mb-2 flex items-center justify-between border-b border-[#b85a52]/35 pb-1 text-[11px] font-bold tracking-[0.28em] text-[#ffb0a8]">
                  <span>行动概述</span>
                  <span className="font-mono tracking-[0.18em] text-[#ffb0a8]/45">SECTION 01</span>
                </div>
                <p className="text-sm leading-loose text-[#efe6d2]/86">{actionSummary}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between border-b border-[#b85a52]/35 pb-1 text-[11px] font-bold tracking-[0.28em] text-[#ffb0a8]">
                  <span>交战情况</span>
                  <span className="font-mono tracking-[0.18em] text-[#ffb0a8]/45">SECTION 02</span>
                </div>
                <p className="text-sm leading-loose text-[#efe6d2]/86">{combatSummary}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 border border-[#55b6d8]/80 bg-[#10202a]/72 p-4 shadow-[0_0_22px_rgba(85,182,216,0.08)]">
              <div>
                <div className="mb-2 flex items-center justify-between border-b border-[#55b6d8]/35 pb-1 text-[11px] font-bold tracking-[0.28em] text-[#9ee7ff]">
                  <span>结果</span>
                  <span className="font-mono tracking-[0.18em] text-[#9ee7ff]/45">RESULT</span>
                </div>
                <p className="text-sm leading-loose text-[#efe6d2]/86">{resultSummary}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between border-b border-[#55b6d8]/35 pb-1 text-[11px] font-bold tracking-[0.28em] text-[#9ee7ff]">
                  <span>损失情况</span>
                  <span className="font-mono tracking-[0.18em] text-[#9ee7ff]/45">LOSS</span>
                </div>
                <p className="text-sm leading-relaxed text-[#efe6d2]/86">{lossSummary}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between border-b border-[#55b6d8]/35 pb-1 text-[11px] font-bold tracking-[0.28em] text-[#9ee7ff]">
                  <span>备注</span>
                  <span className="font-mono tracking-[0.18em] text-[#9ee7ff]/45">NOTE</span>
                </div>
                <p className="text-sm leading-loose text-[#efe6d2]/86">{noteSummary}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-[#d8c7a6]/25 bg-[#100d14]/78 p-4">
            <Button onClick={onRestart} className="rounded-none bg-primary hover:bg-primary/80">
              <RotateCcw className="mr-2 h-4 w-4" />
              再战一次
            </Button>
            <Button asChild className="rounded-none bg-white text-black hover:bg-white/85">
              <Link href="/epilogue">
                <Sparkles className="mr-2 h-4 w-4" />
                战后剧情
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-none border-white/20 bg-transparent text-white">
              <Link href="/team">
                <Swords className="mr-2 h-4 w-4" />
                返回编队
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-8">
      <div className="grid w-full max-w-5xl grid-cols-[1.2fr_0.8fr] overflow-hidden border border-white/15 bg-[#0c0712]">
        <img src={resultImage} alt="" className="h-[560px] w-full object-cover" />
        <div className="flex flex-col justify-center p-10">
          <div className="mb-3 flex items-center gap-2 text-sm tracking-[0.25em] text-primary">
            <Sparkles className="h-4 w-4" />
            {victory ? "BOSS DEFEATED" : "MISSION FAILED"}
          </div>
          <h2 className="mb-6 text-5xl font-black">{victory ? "战斗胜利" : "全队失去战斗能力"}</h2>
          <div className="mb-8 border-l-4 border-primary bg-white/5 px-5 py-4 font-serif text-xl italic leading-loose text-white/85">
            “{line}”
          </div>
          <div className="flex gap-3">
            <Button onClick={onRestart} className="rounded-none bg-primary hover:bg-primary/80">
              <RotateCcw className="mr-2 h-4 w-4" />
              再战一次
            </Button>
            {victory && (
              <Button asChild className="rounded-none bg-white text-black hover:bg-white/85">
                <Link href="/epilogue">
                  <Sparkles className="mr-2 h-4 w-4" />
                  查看战后剧情
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="rounded-none border-white/20 bg-transparent text-white">
              <Link href="/team">
                <Swords className="mr-2 h-4 w-4" />
                返回编队
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
