import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { characters, Character, Skill, isCharacterBattleReady } from "@/data/characters";
import { currentBoss, enemies } from "@/data/enemies";
import { useTeamStore } from "@/store/teamStore";
import { AlertTriangle, ArrowLeft, Check, Eye, Lock, Plus, Swords } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import professionInvestigatorIcon from "@assets/profession_investigator.png";
import professionFighterIcon from "@assets/profession_fighter.png";
import professionSupportIcon from "@assets/profession_support.png";
import professionMutantIcon from "@assets/profession_mutant.png";
import professionRemnantIcon from "@assets/profession_remnant.png";

const BOSS_SLOT_COUNT = 5;
const professionIcons: Record<Character["profession"], string> = {
  调查者: professionInvestigatorIcon,
  战斗者: professionFighterIcon,
  支援者: professionSupportIcon,
  异种: professionMutantIcon,
  遗民: professionRemnantIcon,
};

export default function TeamSelection() {
  const { selectedCharacterIds, addCharacter, removeCharacter } = useTeamStore();
  const firstUnlocked = characters.find(c => !c.locked) ?? characters[0];
  const [viewedCharId, setViewedCharId] = useState<string>(firstUnlocked.id);
  const [overlayChar, setOverlayChar] = useState<Character | null>(null);
  const [bossPeek, setBossPeek] = useState(false);

  const viewedChar = characters.find(c => c.id === viewedCharId) ?? firstUnlocked;
  const isViewedLocked = !!viewedChar.locked;
  const isViewedBattleReady = isCharacterBattleReady(viewedChar);
  const isViewedSelected = selectedCharacterIds.includes(viewedChar.id);
  const isTeamFull = selectedCharacterIds.length >= 3;
  const selectedTeam = selectedCharacterIds
    .map(id => characters.find(character => character.id === id))
    .filter((character): character is Character => !!character);

  const bossSlots = useMemo(() => {
    const realBosses = enemies.map((enemy, index) => ({ enemy, unlocked: index === 0 }));
    const locked = Array.from({ length: Math.max(0, BOSS_SLOT_COUNT - realBosses.length) }, (_, index) => ({
      enemy: null,
      unlocked: false,
      label: `调查档案 ${String(realBosses.length + index + 1).padStart(2, "0")}`,
    }));
    return [...realBosses, ...locked];
  }, []);

  const handleSelectClick = () => {
    if (isViewedLocked || !isViewedBattleReady) return;
    if (isViewedSelected) {
      removeCharacter(viewedChar.id);
      return;
    }
    if (!isTeamFull) setOverlayChar(viewedChar);
  };

  const confirmSelection = () => {
    if (!overlayChar) return;
    addCharacter(overlayChar.id);
    setOverlayChar(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0612] p-6 text-foreground">
      <div className="scanlines" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[46%] overflow-hidden">
        <img src={currentBoss.image} alt="" className="h-full w-full object-cover opacity-55 grayscale-[20%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0612]/35 to-[#0a0612]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0612]/75 via-transparent to-[#0a0612]" />
      </div>

      <header className="relative z-10 mb-5 flex justify-end">
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-white">
          <Link href="/enemy">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Link>
        </Button>
      </header>

      <main className="relative z-10 grid min-h-[calc(100vh-92px)] grid-cols-[220px_minmax(500px,660px)_minmax(560px,1fr)] gap-6">
        <BossColumn slots={bossSlots} onPeek={() => setBossPeek(true)} />

        <section className="flex min-h-0 flex-col">
          <TeamSlots selectedTeam={selectedTeam} removeCharacter={removeCharacter} />

          <div className="mt-5 flex h-12 items-center justify-center">
            <Button
              asChild={isTeamFull}
              disabled={!isTeamFull}
              className="h-12 w-64 rounded-none border border-primary bg-primary text-lg font-black tracking-widest text-white glow-box hover:bg-primary/80 disabled:opacity-45"
            >
              {isTeamFull ? <Link href="/battle">开始你的战斗</Link> : <span>选择 3 名角色</span>}
            </Button>
          </div>

          <div className="mt-5 min-h-[520px] border border-border/35 bg-black/30 p-3 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-[0.3em] text-primary/80">OPERATOR ROSTER</div>
                <div className="text-sm text-white/60">固定角色选择区域</div>
              </div>
              <div className="text-xs text-white/45">{selectedCharacterIds.length}/3</div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {characters.map(character => (
                <CharacterTile
                  key={character.id}
                  character={character}
                  viewed={character.id === viewedChar.id}
                  selected={selectedCharacterIds.includes(character.id)}
                  battleReady={isCharacterBattleReady(character)}
                  onClick={() => !character.locked && setViewedCharId(character.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="grid min-h-0 grid-cols-[minmax(260px,420px)_minmax(280px,360px)] gap-5">
          <CharacterPreview
            character={viewedChar}
            selected={isViewedSelected}
            teamFull={isTeamFull}
            battleReady={isViewedBattleReady}
            onSelect={handleSelectClick}
          />
          <SkillPreview character={viewedChar} />
        </section>
      </main>

      <BossDossier open={bossPeek} onClose={() => setBossPeek(false)} />
      <SelectionOverlay character={overlayChar} onConfirm={confirmSelection} onClose={() => setOverlayChar(null)} />
    </div>
  );
}

function BossColumn({ slots, onPeek }: { slots: Array<{ enemy: typeof currentBoss | null; unlocked: boolean; label?: string }>; onPeek: () => void }) {
  return (
    <aside className="flex flex-col gap-4">
      <div className="border border-red-500/60 bg-black/45 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-[0.3em] text-red-400">
          <AlertTriangle className="h-3 w-3" />
          INVESTIGATION FILES
        </div>
        <div className="text-sm text-red-100/80">按顺序击杀解锁</div>
      </div>

      {slots.map((slot, index) => {
        if (!slot.enemy || !slot.unlocked) {
          return (
            <div key={`locked-${index}`} className="flex h-24 items-center justify-center border border-red-500/35 bg-black/55 text-red-200/45">
              <div className="text-center">
                <Lock className="mx-auto mb-1 h-5 w-5" />
                <div className="font-mono text-xs tracking-widest">{slot.label ?? `调查档案 ${String(index + 1).padStart(2, "0")}`}</div>
                <div className="text-[10px]">未解锁</div>
              </div>
            </div>
          );
        }

        return (
          <button
            key={slot.enemy.id}
            type="button"
            onClick={onPeek}
            className="group relative h-24 overflow-hidden border-2 border-red-500/80 bg-black text-left shadow-[0_0_22px_rgba(239,68,68,0.18)]"
          >
            <img src={slot.enemy.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 transition group-hover:scale-105 group-hover:opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="relative p-3">
              <div className="font-mono text-[9px] tracking-[0.25em] text-red-300">TARGET {String(index + 1).padStart(2, "0")}</div>
              <div className="mt-1 text-lg font-black text-white">{slot.enemy.name}</div>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-red-100/70">
                <Eye className="h-3 w-3" />
                查看档案
              </div>
            </div>
          </button>
        );
      })}
    </aside>
  );
}

function TeamSlots({ selectedTeam, removeCharacter }: { selectedTeam: Character[]; removeCharacter: (id: string) => void }) {
  return (
    <div className="flex justify-center gap-4">
      {[0, 1, 2].map(index => {
        const character = selectedTeam[index];
        return (
          <div key={index} className="w-24">
            <div className="relative flex h-24 items-center justify-center overflow-hidden border border-border bg-card">
              {character ? (
                <>
                  {character.avatar ? (
                    <div className="flex h-full w-full items-center justify-center bg-white/90">
                      <img src={character.avatar} alt={character.name} className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/20 text-2xl font-bold text-primary">{character.name[0]}</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center text-xs font-bold tracking-wider">{character.name}</div>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground/50">
                  <Plus className="mb-1 h-6 w-6" />
                  <span className="text-xs">空位</span>
                </div>
              )}
            </div>
            <div className="mt-2 h-7">
              {character && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-full rounded-none border-border bg-black/25 text-xs hover:border-destructive hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => removeCharacter(character.id)}
                >
                  更换
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CharacterTile({ character, viewed, selected, battleReady, onClick }: { character: Character; viewed: boolean; selected: boolean; battleReady: boolean; onClick: () => void }) {
  if (character.locked) {
    return (
      <div className="relative aspect-square border border-border/25 bg-black/45">
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="h-4 w-4 text-muted-foreground/35" />
        </div>
        <div className="absolute inset-x-0 bottom-1 text-center text-[8px] font-mono tracking-widest text-muted-foreground/40">待录入</div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative aspect-square overflow-hidden border transition ${
        viewed
          ? "z-10 scale-105 border-primary shadow-[0_0_24px_rgba(168,85,247,0.35)]"
          : "border-border/45 hover:border-primary/60"
      } ${selected ? "opacity-55" : ""}`}
    >
      {character.avatar ? (
        <div className="flex h-full w-full items-center justify-center bg-white/90">
          <img src={character.avatar} alt={character.name} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-secondary text-lg font-bold text-muted-foreground">{character.name[0]}</div>
      )}
      {selected && (
        <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
      {!battleReady && (
        <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center text-[9px] font-bold tracking-widest text-yellow-100">
          待实装
        </div>
      )}
    </button>
  );
}

function CharacterPreview({ character, selected, teamFull, battleReady, onSelect }: { character: Character; selected: boolean; teamFull: boolean; battleReady: boolean; onSelect: () => void }) {
  const professionIcon = professionIcons[character.profession];

  return (
    <div className="flex min-h-0 flex-col">
      <div className="relative min-h-[520px] flex-1 overflow-hidden border border-border/30 bg-black/20">
        {character.portrait ? (
          <img
            src={character.portrait}
            alt={character.name}
            className="absolute inset-0 h-full w-full object-contain object-center"
            style={{ filter: "drop-shadow(0 0 24px rgba(168,85,247,0.25))" }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl font-black text-primary/20">{character.name}</div>
        )}
      </div>

      <div className="relative mt-3 min-h-[232px] overflow-hidden border border-border/45 bg-black/55 p-4">
        <div className="pointer-events-none absolute right-4 top-4 flex h-28 w-28 items-center justify-center overflow-hidden border border-primary/25 bg-[#efe6ff] shadow-[0_0_28px_rgba(168,85,247,0.18)]">
          <img src={professionIcon} alt={character.profession} className="h-full w-full object-contain" />
          <div className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-black tracking-widest text-white">
            {character.profession}
          </div>
        </div>
        <div className="pr-32">
          <div className="text-sm font-bold tracking-widest text-primary">{character.title}</div>
          <h2 className="mt-1 text-4xl font-black tracking-wider text-white">{character.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-none border-primary/50 text-primary">{character.profession}</Badge>
            <Badge variant="secondary" className="rounded-none bg-secondary/80">{character.positioning}</Badge>
            {!battleReady && <Badge variant="outline" className="rounded-none border-yellow-300/50 text-yellow-100">待实装</Badge>}
          </div>
        </div>
        <div className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-3">
          <Button
            className="h-12 rounded-none border border-primary bg-primary font-black tracking-widest text-white hover:bg-primary/80"
            disabled={character.locked || !battleReady || (!selected && teamFull)}
            onClick={onSelect}
          >
            {!battleReady ? "待实装" : selected ? "已在队伍中" : teamFull ? "队伍已满" : "选择"}
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-none border-border bg-black/40 font-black tracking-widest text-foreground hover:bg-secondary">
            <Link href={`/character/${character.id}`}>详细信息</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SkillPreview({ character }: { character: Character }) {
  const skills = character.skills.slice(0, 4);
  return (
    <aside className="min-h-0 border border-yellow-300/60 bg-black/35 p-4">
      <div className="mb-3 flex items-center gap-2 text-yellow-100">
        <Swords className="h-4 w-4" />
        <div className="font-mono text-xs font-bold tracking-[0.28em]">SKILL DETAILS</div>
      </div>
      <div className="space-y-3">
        {skills.length === 0 && <div className="text-sm text-white/45">暂无技能资料</div>}
        {skills.map(skill => <SkillCard key={`${character.id}-${skill.name}`} skill={skill} />)}
      </div>
    </aside>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-3">
      <div className="flex gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden border border-white/15 bg-black/40">
          {skill.icon ? <img src={skill.icon} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-primary/20" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-white">{skill.name}</span>
            <Badge variant="outline" className="rounded-none border-yellow-300/40 text-[10px] text-yellow-100">{skill.type}</Badge>
            {skill.cost > 0 && <span className="font-mono text-xs text-yellow-200">能量 {skill.cost}</span>}
          </div>
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-white/70">{skill.effect || skill.description}</p>
        </div>
      </div>
    </div>
  );
}

function BossDossier({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden border border-red-500/40 bg-[#0a0612]"
            onClick={event => event.stopPropagation()}
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${currentBoss.image})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0612]/95 via-[#0a0612]/85 to-[#0a0612]/60" />
            <div className="relative flex items-center justify-between border-b border-red-500/20 px-8 py-5">
              <div>
                <div className="mb-1 flex items-center gap-1 text-[10px] font-mono tracking-[0.3em] text-red-400/70">
                  <AlertTriangle className="h-3 w-3" />
                  THREAT BRIEFING · {currentBoss.codename}
                </div>
                <div className="text-xs font-mono tracking-widest text-red-300">{currentBoss.title}</div>
                <h2 className="mt-1 text-3xl font-bold tracking-wider text-white">{currentBoss.name}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-white">关闭</Button>
            </div>
            <div className="relative flex-1 overflow-y-auto px-8 py-6 font-mono">
              <div className="mb-5 grid grid-cols-2 gap-3 border border-red-500/20 bg-red-950/10 p-3 text-[11px]">
                <Info label="威胁" value={currentBoss.threatLevel} />
                <Info label="分类" value={currentBoss.classification} />
                <Info label="出没" value={currentBoss.habitat} />
                <Info label="生命" value={currentBoss.hp} />
              </div>
              <div className="mb-5 text-[10px] tracking-widest text-red-300">攻略要点</div>
              <ul className="space-y-1.5">
                {currentBoss.strategyTips.map((tip, index) => (
                  <li key={tip} className="flex gap-2 text-[11px] leading-relaxed text-foreground/85">
                    <span className="shrink-0 text-[10px] text-red-400/70">{String(index + 1).padStart(2, "0")}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{label}</span>
      <div className="text-white">{value}</div>
    </div>
  );
}

function SelectionOverlay({ character, onConfirm, onClose }: { character: Character | null; onConfirm: () => void; onClose: () => void }) {
  return (
    <AnimatePresence>
      {character && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        >
          <div className="relative flex h-full max-h-[800px] w-full max-w-5xl items-center">
            <div className="absolute top-1/4 h-32 w-full -skew-y-3 bg-primary/10 blur-2xl" />
            <motion.div
              initial={{ x: "50%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "50%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="absolute -bottom-20 right-0 z-10 h-[120%]"
            >
              {character.selectionPortrait ? (
                <img
                  src={character.selectionPortrait}
                  alt={character.name}
                  className="h-full object-cover object-left"
                  style={{ filter: "drop-shadow(0 0 30px rgba(168,85,247,0.5))" }}
                />
              ) : (
                <div className="h-full w-[600px] bg-gradient-to-l from-primary/30 to-transparent" />
              )}
            </motion.div>
            <motion.div
              initial={{ x: "-20%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "-20%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
              className="relative z-20 max-w-2xl border-l-4 border-primary bg-gradient-to-r from-background via-background/90 to-background/40 p-12"
            >
              <div className="mb-2 text-xl text-primary">{character.name}</div>
              <div className="text-3xl font-light italic leading-relaxed tracking-wide text-white/90">"{character.selectionLine}"</div>
              <div className="mt-12 flex gap-4">
                <Button className="rounded-none border border-primary bg-primary px-8 py-6 text-lg glow-box hover:bg-primary/80" onClick={onConfirm}>
                  确认加入
                </Button>
                <Button variant="ghost" className="rounded-none px-8 py-6 text-lg text-muted-foreground hover:text-white" onClick={onClose}>
                  取消
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
