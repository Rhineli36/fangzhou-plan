import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { characters, Character, Skill } from "@/data/characters";
import { currentBoss } from "@/data/enemies";
import { useTeamStore } from "@/store/teamStore";
import { ArrowLeft, RotateCcw, Sparkles, Swords, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dazeIcon from "@assets/status_daze.png";
import bleedIcon from "@assets/status_bleed.png";
import shieldIcon from "@assets/status_shield.png";
import chargeIcon from "@assets/status_charging.png";
import attackUpIcon from "@assets/status_attack_up.png";
import immunityIcon from "@assets/status_immunity.png";

type StatusId = "talent" | "daze" | "bleed" | "shield" | "charge" | "attackUp" | "immunity";
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
  maxHand: number;
  drawPerTurn: number;
  phase: Phase;
  fighters: Fighter[];
  boss: BossState;
  deck: BattleCard[];
  discard: BattleCard[];
  hand: BattleCard[];
  zidianCount: number;
  log: string[];
  finaleLine: string;
  recentHitIds: string[];
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

const statusText: Record<StatusId, string> = {
  talent: "天赋",
  daze: "恍惚",
  bleed: "流血",
  shield: "护盾",
  charge: "蓄力",
  attackUp: "攻击提升",
  immunity: "技能免疫",
};

function makeStatus(id: StatusId, patch: Partial<Status> = {}): Status {
  const base: Record<StatusId, Status> = {
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
      description: "本回合伤害卡额外造成 1 点伤害。",
    },
    immunity: {
      id,
      name: "技能免疫",
      icon: immunityIcon,
      duration: 1,
      description: "本回合免疫新获得的减益状态。",
    },
  };
  return { ...base[id], ...patch };
}

function addOrRefreshStatus(statuses: Status[], status: Status): Status[] {
  const existing = statuses.find(s => s.id === status.id);
  if (!existing) return [...statuses, status];
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

function removeOneDebuff(statuses: Status[]): Status[] {
  const index = statuses.findIndex(s => s.id === "bleed" || s.id === "daze");
  if (index === -1) return statuses;
  return statuses.filter((_, i) => i !== index);
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

function getSkillCost(skill: Skill): number {
  if (skill.name === "雾愈之触") return 1;
  if (skill.name === "幻海囚笼") return 3;
  if (skill.name === "时序祷言") return 2;
  if (skill.name === "残响视能") return 2;
  if (skill.name === "紫电瞬杀") return 2;
  if (skill.name === "虚空刃舞") return 4;
  return Math.max(1, skill.cost || 2);
}

function getCardCost(card: BattleCard, fighters: Fighter[]): number {
  const owner = fighters.find(f => f.character.id === card.ownerId);
  const dazeStacks = owner?.statuses
    .filter(s => s.id === "daze")
    .reduce((sum, s) => sum + (s.stacks ?? 1), 0) ?? 0;
  return getSkillCost(card.skill) + dazeStacks;
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

  const base: BattleState = {
    turn: 1,
    energy: 5,
    maxHand: 6,
    drawPerTurn: 3,
    phase: "player",
    fighters,
    boss: {
      hp: currentBoss.hp,
      maxHp: currentBoss.hp,
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
    log: ["战斗开始。方舟小队遭遇兽骨花冠。", ...talentLogs],
    finaleLine: "",
    recentHitIds: [],
    flowerBurialFlash: false,
    flowerBurialRevealed: false,
  };

  return drawCards(base, 5);
}

function needsAllyTarget(card: BattleCard): boolean {
  return card.skill.name === "雾愈之触" || card.skill.name === "残响视能";
}

function applyDamageToFighter(fighter: Fighter, amount: number): { fighter: Fighter; blocked: boolean; damage: number } {
  const shield = fighter.statuses.find(s => s.id === "shield" && (s.stacks ?? 0) > 0);
  if (shield) {
    const statuses = fighter.statuses
      .map(status => (status.id === "shield" ? { ...status, stacks: (status.stacks ?? 1) - 1 } : status))
      .filter(status => status.id !== "shield" || (status.stacks ?? 0) > 0);
    return { fighter: { ...fighter, statuses }, blocked: true, damage: 0 };
  }
  return { fighter: { ...fighter, hp: Math.max(0, fighter.hp - amount) }, blocked: false, damage: amount };
}

function applyBossDamage(state: BattleState, amount: number, logs: string[]): BattleState {
  let boss = { ...state.boss, hp: Math.max(0, state.boss.hp - amount) };
  let flowerBurialFlash = state.flowerBurialFlash;
  let flowerBurialRevealed = state.flowerBurialRevealed;
  if (boss.charging && !boss.flowerBurial) {
    const damageTaken = boss.charging.damageTaken + amount;
    if (damageTaken >= 5) {
      logs.push("蓄力被打断：荆棘皇冕未能释放。");
      boss = { ...boss, charging: null, crownCooldown: boss.flowerBurial ? 0 : 3 };
    } else {
      boss = { ...boss, charging: { ...boss.charging, damageTaken } };
    }
  }
  if (!boss.flowerBurial && boss.hp > 0 && boss.hp < 10) {
    boss.flowerBurial = true;
    boss.berserk = state.turn <= 5;
    flowerBurialFlash = true;
    flowerBurialRevealed = false;
    logs.push(boss.berserk ? "特殊狂暴：5 回合内触发花葬。" : "花葬触发：兽骨花冠进入第二阶段。");
  }
  return { ...state, boss, flowerBurialFlash, flowerBurialRevealed };
}

export default function Battle() {
  const { selectedCharacterIds } = useTeamStore();
  const team = useMemo(() => {
    const selected = selectedCharacterIds
      .map(id => characters.find(character => character.id === id))
      .filter((character): character is Character => !!character && !character.locked);
    if (selected.length === 3) return selected;
    return characters.filter(character => !character.locked).slice(0, 3);
  }, [selectedCharacterIds]);

  const [state, setState] = useState<BattleState>(() => createInitialState(team));
  const [targetingCard, setTargetingCard] = useState<BattleCard | null>(null);
  const [playedCard, setPlayedCard] = useState<BattleCard | null>(null);
  const [discardMode, setDiscardMode] = useState(false);
  const [bossHit, setBossHit] = useState(false);
  const alive = state.fighters.filter(fighter => fighter.hp > 0);
  const flowerImage = state.boss.berserk ? currentBoss.berserkImage : currentBoss.flowerBurialImage ?? currentBoss.image;
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
        line: "花还没有开完。你们也是来看我的吗？",
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
  const introActive = introIndex < introSlides.length;

  useEffect(() => {
    if (!introActive) return;
    const slide = introSlides[introIndex];
    const timer = window.setTimeout(() => setIntroIndex(index => index + 1), slide?.kind === "start" ? 900 : 1600);
    return () => window.clearTimeout(timer);
  }, [introActive, introIndex, introSlides]);

  useEffect(() => {
    if (!state.flowerBurialFlash) return;
    const timer = window.setTimeout(() => {
      setState(prev => ({ ...prev, flowerBurialFlash: false, flowerBurialRevealed: true }));
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [state.flowerBurialFlash]);

  const restart = () => {
    setTargetingCard(null);
    setPlayedCard(null);
    setDiscardMode(false);
    setBossHit(false);
    setIntroIndex(0);
    setState(createInitialState(team));
  };

  const resolveCardPlay = (card: BattleCard, targetIndex?: number) => {
    if (state.phase !== "player") return;
    const cost = getCardCost(card, state.fighters);
    if (state.energy < cost) return;
    if (state.fighters.find(f => f.character.id === card.ownerId)?.hp === 0) return;
    if (needsAllyTarget(card) && (targetIndex === undefined || state.fighters[targetIndex]?.hp <= 0)) return;

    setPlayedCard(card);
    window.setTimeout(() => setPlayedCard(null), 620);
    setTargetingCard(null);

    setState(prev => {
      let next: BattleState = {
        ...prev,
        energy: prev.energy - getCardCost(card, prev.fighters),
        hand: prev.hand.filter(c => c.uid !== card.uid),
        discard: [...prev.discard, card],
        recentHitIds: [],
      };
      const logs = [`${card.ownerName} 使用「${card.skill.name}」。`];
      const beforeBossHp = next.boss.hp;
      next = resolveSkill(next, card, logs, false, targetIndex);

      const owner = next.fighters.find(f => f.character.id === card.ownerId);
      if (owner?.character.name === "夜·蝶" && Math.random() < 0.3) {
        logs.push("暗影潜行触发：技能再次生效。");
        next = resolveSkill(next, card, logs, true, targetIndex);
      }

      if (next.boss.hp < beforeBossHp) {
        setBossHit(true);
        window.setTimeout(() => setBossHit(false), 520);
      }

      if (card.skill.name === "幻海囚笼" && beforeBossHp > 0 && next.boss.hp <= 0) {
        next = { ...next, hand: [...next.hand, card] };
      }

      if (next.boss.hp <= 0) {
        return {
          ...next,
          phase: "victory",
          finaleLine: victoryLines[Math.floor(Math.random() * victoryLines.length)],
          log: [...logs, "兽骨花冠被击败。", ...next.log].slice(0, 14),
        };
      }

      return { ...next, log: [...logs, ...next.log].slice(0, 14) };
    });
  };

  const onCardClick = (card: BattleCard) => {
    if (discardMode) {
      if (state.phase !== "player") return;
      setState(prev => ({
        ...prev,
        hand: prev.hand.filter(c => c.uid !== card.uid),
        discard: [...prev.discard, card],
        log: [`弃置「${card.skill.name}」。`, ...prev.log].slice(0, 14),
      }));
      setDiscardMode(false);
      return;
    }
    const cost = getCardCost(card, state.fighters);
    if (state.phase !== "player" || state.energy < cost) return;
    if (state.fighters.find(f => f.character.id === card.ownerId)?.hp === 0) return;
    if (needsAllyTarget(card)) {
      setTargetingCard(card);
      return;
    }
    resolveCardPlay(card);
  };

  const onFighterClick = (index: number) => {
    if (!targetingCard) return;
    resolveCardPlay(targetingCard, index);
  };

  const endTurn = () => {
    if (state.phase !== "player") return;
    setTargetingCard(null);
    setDiscardMode(false);
    setState(prev => runEnemyTurn(prev));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#090510] text-white">
      <div className="scanlines" />
      <div className="relative min-h-screen">
        <motion.img
          key={state.boss.flowerBurial && state.flowerBurialRevealed ? "flower-bg" : "normal-bg"}
          src={state.boss.flowerBurial && state.flowerBurialRevealed ? flowerImage ?? currentBoss.image : currentBoss.image}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 h-full w-full object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090510]/70 via-[#090510]/82 to-[#090510]" />

        <div className="relative z-10 grid min-h-screen grid-rows-[auto_1fr_auto] gap-3 p-4">
          <header className="flex items-center justify-between">
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

          <main className="grid min-h-0 grid-cols-[260px_1fr_300px] gap-3">
            <section className="space-y-2">
              {state.fighters.map((fighter, index) => (
                <FighterPanel
                  key={fighter.character.id}
                  fighter={fighter}
                  selectable={!!targetingCard && fighter.hp > 0}
                  isHit={state.recentHitIds.includes(fighter.character.id)}
                  onClick={() => onFighterClick(index)}
                />
              ))}
            </section>

            <section className="relative flex min-h-0 flex-col items-center justify-between border border-red-500/20 bg-black/35 p-4">
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
                <div className="mt-3 flex gap-2">
                  {state.boss.flowerBurial && (
                    <StatusIcon status={makeStatus("talent", { name: "花葬", icon: flowerImage ?? currentBoss.image, description: "第二阶段：迷雾摇篮曲全体化，荆棘皇冕无冷却。" })} />
                  )}
                  {state.boss.charging && (
                    <StatusIcon status={makeStatus("charge", { duration: state.boss.charging.remaining, description: `荆棘皇冕蓄力中，已承受 ${state.boss.charging.damageTaken}/5 点打断伤害。` })} />
                  )}
                  {state.boss.statuses.map((status, index) => <StatusIcon key={`${status.id}-${index}`} status={status} />)}
                </div>
              </div>

              <motion.div
                animate={bossHit ? { x: [0, -10, 10, -6, 6, 0], scale: [1, 1.02, 1] } : { x: 0, scale: 1 }}
                transition={{ duration: 0.46 }}
                className="relative flex w-full flex-1 items-center justify-center"
              >
                {bossHit && <div className="absolute inset-0 bg-red-500/12 mix-blend-screen" />}
                <img
                  src={state.boss.flowerBurial && state.flowerBurialRevealed ? flowerImage ?? currentBoss.image : currentBoss.image}
                  alt={currentBoss.name}
                  className="max-h-[44vh] max-w-[66%] object-contain drop-shadow-[0_0_36px_rgba(220,38,38,0.36)]"
                />
              </motion.div>

              <div className="w-full border border-white/10 bg-black/40 p-3">
                <div className="mb-2 text-xs font-bold tracking-widest text-white/50">战斗记录</div>
                <div className="space-y-1 text-xs leading-relaxed text-white/75">
                  {state.log.slice(0, 7).map((entry, index) => <LogLine key={index} text={entry} />)}
                </div>
              </div>
            </section>

            <section className="border border-white/10 bg-black/35 p-4">
              <h2 className="mb-3 text-sm font-black tracking-widest text-primary">行动面板</h2>

              <div className="mb-4 grid grid-cols-2 overflow-hidden border border-primary/40 bg-primary/10">
                <div className="flex flex-col items-center justify-center border-r border-primary/30 px-4 py-3">
                  <div className="font-mono text-4xl font-black leading-none text-cyan-100">{state.turn}</div>
                  <div className="mt-1 text-[10px] font-bold tracking-[0.25em] text-cyan-100/60">TURN</div>
                </div>
                <div className="flex flex-col items-center justify-center px-4 py-3">
                  <Zap className="mb-1 h-9 w-9 fill-yellow-300 text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.7)]" />
                  <div className="font-mono text-4xl font-black leading-none text-yellow-100">{state.energy}</div>
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

              <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                <InfoTile label="手牌上限" value={state.maxHand} />
                <InfoTile label="每回合抽牌" value={state.drawPerTurn + (state.turn <= 3 ? 1 : 0)} />
                <InfoTile label="能量增长" value="+4" />
                <InfoTile label="存活角色" value={`${alive.length}/3`} />
              </div>
              <Button onClick={endTurn} disabled={state.phase !== "player"} className="mb-4 w-full rounded-none bg-primary hover:bg-primary/80">
                结束回合
              </Button>
              <Button
                onClick={() => {
                  setDiscardMode(mode => !mode);
                  setTargetingCard(null);
                }}
                disabled={state.phase !== "player" || state.hand.length === 0}
                variant="outline"
                className={`mb-4 w-full rounded-none border-white/20 bg-transparent text-white ${discardMode ? "border-yellow-300 text-yellow-100 shadow-[0_0_18px_rgba(250,204,21,0.22)]" : ""}`}
              >
                {discardMode ? "点击一张手牌弃置" : "主动弃牌"}
              </Button>
              <Button onClick={restart} variant="outline" className="w-full rounded-none border-white/20 bg-transparent text-white">
                <RotateCcw className="mr-2 h-4 w-4" />
                重新开始
              </Button>
            </section>
          </main>

          <footer className="min-h-[136px] overflow-x-auto border-t border-white/10 pt-2">
            <div className="grid min-w-max grid-flow-col auto-cols-[132px] gap-2">
              {state.hand.map(card => {
                const cost = getCardCost(card, state.fighters);
                const disabled = state.phase !== "player" || (!discardMode && state.energy < cost) || state.fighters.find(f => f.character.id === card.ownerId)?.hp === 0;
                return (
                  <BattleCardButton
                    key={card.uid}
                    card={card}
                    cost={cost}
                    disabled={disabled}
                    selected={targetingCard?.uid === card.uid || discardMode}
                    onClick={() => onCardClick(card)}
                  />
                );
              })}
            </div>
          </footer>
        </div>

        <AnimatePresence>
          {introActive && <IntroOverlay slide={introSlides[introIndex]} />}
          {state.flowerBurialFlash && <FlowerBurialOverlay image={flowerImage ?? currentBoss.image} berserk={state.boss.berserk} />}
          {playedCard && <PlayedCardAnimation card={playedCard} />}
          {(state.phase === "victory" || state.phase === "defeat") && (
            <ResultOverlay phase={state.phase} line={state.finaleLine} onRestart={restart} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function resolveSkill(state: BattleState, card: BattleCard, logs: string[], copied: boolean, targetIndex?: number): BattleState {
  if (card.skill.name === "雾愈之触") {
    const index = targetIndex ?? findHealTarget(state.fighters);
    const target = state.fighters[index];
    const debuffStacks = target.statuses
      .filter(status => status.id === "daze" || status.id === "bleed")
      .reduce((sum, status) => sum + (status.stacks ?? 1), 0);
    const heal = 1 + debuffStacks;
    const fighters = state.fighters.map((fighter, fighterIndex) =>
      fighterIndex === index
        ? {
            ...fighter,
            hp: Math.min(fighter.maxHp, fighter.hp + heal),
            statuses: removeOneDebuff(fighter.statuses),
          }
        : fighter,
    );
    logs.push(`雾愈之触治疗 ${target.character.name} ${heal} 点，并驱散 1 个异常。`);
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
      ...fighter,
      hp: Math.min(fighter.maxHp, fighter.hp + heal),
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
    logs.push(`残响视能为 ${state.fighters[index].character.name} 生成 1 层护盾。`);
    return { ...state, fighters };
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
    const next = applyBossDamage(state, damage, logs);
    logs.push(`虚空刃舞造成 ${damage} 点伤害，并附加 1 层流血。`);
    return {
      ...next,
      boss: { ...next.boss, statuses: addOrRefreshStatus(next.boss.statuses, makeStatus("bleed")) },
    };
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
  let next = { ...state, phase: "enemy" as Phase };
  const logs: string[] = ["敌方回合开始。"];

  const bossBleed = next.boss.statuses.find(status => status.id === "bleed");
  if (bossBleed) {
    const damage = bossBleed.stacks ?? 1;
    next = { ...next, boss: { ...next.boss, hp: Math.max(0, next.boss.hp - damage), statuses: decrementDurations(next.boss.statuses) } };
    logs.push(`BOSS 因流血失去 ${damage} 点生命。`);
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
    next = { ...next, boss: { ...next.boss, hp: Math.min(next.boss.maxHp, next.boss.hp + dazeHeal) } };
    logs.push(`恍惚回响为 BOSS 回复 ${dazeHeal} 点生命。`);
  }

  if (next.boss.hp <= 0) {
    return { ...next, phase: "victory", finaleLine: victoryLines[Math.floor(Math.random() * victoryLines.length)], log: [...logs, ...next.log].slice(0, 14) };
  }

  if (next.boss.charging) {
    const remaining = next.boss.charging.remaining - 1;
    if (remaining <= 0) {
      next = releaseCrown(next, logs);
    } else {
      next = { ...next, boss: { ...next.boss, charging: { ...next.boss.charging, remaining } } };
      logs.push("荆棘皇冕仍在蓄力。");
    }
  } else if (next.boss.crownCooldown <= 0 && (next.boss.flowerBurial || Math.random() < 0.45)) {
    next = { ...next, boss: { ...next.boss, charging: { remaining: 1, damageTaken: 0 } } };
    logs.push("BOSS 开始蓄力：荆棘皇冕。");
  } else {
    next = lullaby(next, logs);
  }

  if (next.fighters.every(fighter => fighter.hp <= 0)) {
    return { ...next, phase: "defeat", finaleLine: defeatLines[Math.floor(Math.random() * defeatLines.length)], log: [...logs, ...next.log].slice(0, 14) };
  }

  return startPlayerTurn({ ...next, log: [...logs, ...next.log].slice(0, 14) });
}

function releaseCrown(state: BattleState, logs: string[]): BattleState {
  const hitIds: string[] = [];
  const summaries: string[] = [];
  const fighters = state.fighters.map(fighter => {
    if (fighter.hp <= 0) return fighter;
    const result = applyDamageToFighter(fighter, 1);
    hitIds.push(fighter.character.id);
    summaries.push(result.blocked ? `${fighter.character.name} 的护盾抵消了伤害，获得流血` : `${fighter.character.name} 受到 1 点伤害并获得流血`);
    const statuses = addOrRefreshStatus(result.fighter.statuses, makeStatus("bleed"));
    return { ...result.fighter, statuses };
  });
  logs.push(`BOSS 释放「荆棘皇冕」：${summaries.join("；")}。`);
  return {
    ...state,
    fighters,
    recentHitIds: hitIds,
    boss: { ...state.boss, charging: null, crownCooldown: state.boss.flowerBurial ? 0 : 3 },
  };
}

function lullaby(state: BattleState, logs: string[]): BattleState {
  const targets = state.boss.flowerBurial ? state.fighters.map((_, index) => index) : [randomAliveIndex(state.fighters)];
  const hitIds: string[] = [];
  const summaries: string[] = [];
  const fighters = state.fighters.map((fighter, index) => {
    if (!targets.includes(index) || fighter.hp <= 0) return fighter;
    const damage = 1 + Math.floor(Math.random() * 2);
    const result = applyDamageToFighter(fighter, damage);
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
      ...result.fighter,
      statuses: immune ? result.fighter.statuses : addOrRefreshStatus(result.fighter.statuses, makeStatus("daze")),
    };
  });
  logs.push(`BOSS 使用「迷雾摇篮曲」：${summaries.join("；")}。`);
  return { ...state, fighters, recentHitIds: hitIds, boss: { ...state.boss, crownCooldown: Math.max(0, state.boss.crownCooldown - 1) } };
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
    return {
      ...fighter,
      hp: Math.max(0, fighter.hp - damage),
      statuses: decrementDurations(fighter.statuses),
    };
  });

  let next: BattleState = {
    ...state,
    turn: state.turn + 1,
    energy: state.energy + 4,
    phase: "player",
    fighters,
    zidianCount: 0,
    boss: { ...state.boss, crownCooldown: Math.max(0, state.boss.crownCooldown - 1) },
    log: logs.length ? [...logs, ...state.log].slice(0, 14) : state.log,
  };

  if (fighters.every(fighter => fighter.hp <= 0)) {
    return { ...next, phase: "defeat", finaleLine: defeatLines[Math.floor(Math.random() * defeatLines.length)] };
  }

  const draw = next.drawPerTurn + (next.turn <= 3 ? 1 : 0);
  return drawCards(next, draw);
}

function IntroOverlay({ slide }: { slide?: IntroSlide }) {
  if (!slide) return null;
  const isStart = slide.kind === "start";
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

function BattleCardButton({ card, cost, disabled, selected, onClick }: { card: BattleCard; cost: number; disabled: boolean; selected: boolean; onClick: () => void }) {
  const icon = card.skill.icon || card.ownerAvatar;
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      className={`group grid h-32 grid-rows-[1fr_48px] overflow-hidden border bg-black/60 text-left transition ${
        disabled
          ? "border-white/10 opacity-45"
          : selected
            ? "border-yellow-300 shadow-[0_0_26px_rgba(250,204,21,0.34)]"
            : "border-primary/40 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_24px_rgba(168,85,247,0.28)]"
      }`}
    >
      <div className="relative overflow-hidden">
        <img src={icon} alt={card.skill.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-black">{cost}</div>
      </div>
      <div className="grid grid-cols-[34px_1fr] gap-2 border-t border-white/10 bg-[#130b20] p-2">
        <img src={card.ownerAvatar} alt={card.ownerName} className="h-8 w-8 object-cover" />
        <div className="min-w-0">
          <div className="truncate text-xs font-black">{card.skill.name}</div>
          <div className="truncate text-[10px] text-white/55">{card.ownerName} / {card.skill.type}</div>
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

function ResultOverlay({ phase, line, onRestart }: { phase: Phase; line: string; onRestart: () => void }) {
  const victory = phase === "victory";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-8">
      <div className="grid w-full max-w-5xl grid-cols-[1.2fr_0.8fr] overflow-hidden border border-white/15 bg-[#0c0712]">
        <img src={victory ? currentBoss.defeatImage ?? currentBoss.image : currentBoss.image} alt="" className="h-[560px] w-full object-cover" />
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
