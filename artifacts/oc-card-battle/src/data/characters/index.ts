import type { Character, Profession, Skill } from "../character-types";
import shisiAvatarCutout from "@assets/shisi_avatar_cutout.png";

// ─── Module aggregation (Vite glob) ─────────────────────────────────────────
const modules = import.meta.glob<{ default: unknown }>("./*.{ts,json}", { eager: true });

// ─── Format detection + conversion ──────────────────────────────────────────

/**
 * Submission-JSON format produced by the CreateOC form:
 * { submittedAt, creator, character: {...}, images: { avatar, portrait, selectionPortrait } }
 */
function fromSubmissionJson(raw: Record<string, unknown>): Character | null {
  const c = raw.character as Record<string, unknown> | undefined;
  const imgs = (raw.images ?? {}) as Record<string, string>;
  const cr = raw.creator as Record<string, unknown> | undefined;

  if (!c || typeof c.id !== "string") return null;

  // Convert passiveSkill + activeSkills → Skill[]
  const skills: Skill[] = [];

  if (c.passiveSkill && typeof c.passiveSkill === "object") {
    const p = c.passiveSkill as Record<string, unknown>;
    skills.push({
      name: (p.name as string) || "天赋",
      type: "天赋",
      description: (p.effectDescription as string) || "",
      range: "单体",
      cost: 0,
      effect: (p.characteristic as string) || "",
      upgrade: "",
      icon: (p.icon as string) || undefined,
      castIllustration: (p.castIllustration as string) || undefined,
    });
  }

  if (Array.isArray(c.activeSkills)) {
    for (const s of c.activeSkills as Record<string, unknown>[]) {
      skills.push({
        name: (s.name as string) || "",
        type: (s.type as Skill["type"]) || "攻击",
        description: (s.effectDescription as string) || "",
        range: "单体",
        cost: 0,
        effect: (s.characteristic as string) || "",
        upgrade: "",
        icon: (s.icon as string) || undefined,
        castIllustration: (s.castIllustration as string) || undefined,
      });
    }
  }

  return {
    id: c.id as string,
    name: (c.name as string) || "",
    title: (c.title as string) || "",
    profession: (c.profession as Profession) || "调查者",
    positioning: (c.positioning as string) || "",
    hp: typeof c.hp === "number" ? c.hp : 5,
    gender: (c.gender as string) || "",
    age: (c.age as string) || "",
    birthday: (c.birthday as string) || "",
    zodiac: (c.zodiac as string) || "",
    bloodType: (c.bloodType as string) || "",
    linkedCharacters: Array.isArray(c.linkedCharacters) ? c.linkedCharacters as string[] : [],
    backgroundStory: (c.backgroundStory as string) || "",
    extendedBackground: c.extendedBackground as Character["extendedBackground"] ?? undefined,
    preferences: c.preferences as Character["preferences"] ?? undefined,
    selectionLine: (c.selectionLine as string) || "",
    avatar: imgs.avatar || "",
    portrait: imgs.portrait || "",
    selectionPortrait: imgs.selectionPortrait || "",
    skills,
    creator: cr
      ? {
          name: (cr.name as string) || "",
          studentId: (cr.studentId as string) || "",
          className: (cr.class as string) || undefined,
          avatar: (cr.avatar as string) || undefined,
          messageToCharacter: (cr.messageToCharacter as string) || undefined,
          proposedGameName: (cr.proposedGameName as string) || undefined,
        }
      : undefined,
  };
}

/**
 * Accepts both:
 * – Raw Character object (from .ts files: `export default character`)
 * – Submission JSON (from form download: `{ creator, character, images }`)
 */
function parseCharacter(raw: unknown): Character | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  // Raw Character: has top-level `id` string
  if (typeof obj.id === "string") return obj as unknown as Character;

  // Submission JSON: has nested `character` object
  if (obj.character && typeof obj.character === "object") {
    return fromSubmissionJson(obj);
  }

  return null;
}

function applyTeacherBattleOverrides(character: Character): Character {
  if (character.creator?.studentId === "12250804") {
    const talent = character.skills.find(skill => skill.type === "天赋");
    const heal = character.skills.find(skill => skill.name === "雾愈之触");
    const cage = character.skills.find(skill => skill.name === "幻海囚笼");
    return {
      ...character,
      hp: 6,
      skills: [
        {
          name: "雾海感知",
          type: "天赋",
          description: "团队前三回合，摸牌数 +1。",
          range: "多体",
          cost: 0,
          effect: "第 1-3 回合，队伍每回合抽牌数 +1。",
          upgrade: "",
          icon: talent?.icon,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "雾愈之触",
          type: "恢复",
          description: "为指定队友恢复 1 点生命；若目标身上存在异常状态，按异常层数额外回复等量生命，并随机驱散最多 1 个异常状态。",
          range: "单体",
          cost: 1,
          effect: "治疗 1 + 目标异常层数，并驱散 1 个异常。",
          upgrade: "",
          icon: heal?.icon,
          castIllustration: heal?.castIllustration,
        },
        {
          name: "幻海囚笼",
          type: "异能",
          description: "造成 3 点伤害，并强制造成伤害打断效果。若造成击杀，该卡片返回手中。",
          range: "单体",
          cost: 3,
          effect: "造成 3 点伤害；若 BOSS 正在蓄力，强制打断。",
          upgrade: "击杀目标时返回手牌。",
          icon: cage?.icon,
          castIllustration: cage?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250818") {
    const talent = character.skills.find(skill => skill.type === "天赋");
    const prayer = character.skills.find(skill => skill.name === "时序祷言");
    const shield = character.skills.find(skill => skill.name === "残响视能");
    return {
      ...character,
      avatar: shisiAvatarCutout,
      hp: 5,
      skills: [
        {
          name: "残响之躯",
          type: "天赋",
          description: "单数回合：有护盾的队友伤害卡牌额外造成 1 点伤害。双数回合：有护盾的队友免疫减益，护盾不消耗。",
          range: "多体",
          cost: 0,
          effect: "奇数回合护盾队友伤害 +1；偶数回合护盾队友免疫减益。",
          upgrade: "",
          icon: talent?.icon,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "时序祷言",
          type: "恢复",
          description: "驱散全体队友身上的所有增益和减益，同时放弃当前手牌中所有和时祀相关的手牌。每丢弃 1 张，全体恢复 1 点生命。",
          range: "多体",
          cost: 2,
          effect: "清除全队状态；弃置手牌中的时祀牌，每弃 1 张全体治疗 1。",
          upgrade: "",
          icon: prayer?.icon,
          castIllustration: prayer?.castIllustration,
        },
        {
          name: "残响视能",
          type: "防御",
          description: "为指定队友生成 1 层护盾。护盾可免疫一次直接伤害，触发后消耗。",
          range: "单体",
          cost: 2,
          effect: "指定队友获得 1 层护盾。",
          upgrade: "",
          icon: shield?.icon,
          castIllustration: shield?.castIllustration,
        },
      ],
    };
  }

  if (character.id === "test-01") {
    const talent = character.skills.find(skill => skill.type === "天赋");
    const zidian = character.skills.find(skill => skill.name === "紫电瞬杀");
    const blade = character.skills.find(skill => skill.name === "虚空刃舞");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "暗影潜行",
          type: "天赋",
          description: "夜·蝶所有技能牌生效后，有 30% 几率再次生效，无需消耗手牌和能量。",
          range: "单体",
          cost: 0,
          effect: "夜·蝶技能生效后，30% 概率复制本次效果一次。",
          upgrade: "复制效果不会再次触发天赋。",
          icon: talent?.icon,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "紫电瞬杀",
          type: "攻击",
          description: "造成 2 点单体伤害。当前回合每次打出或复制紫电瞬杀，都会使后续紫电瞬杀额外增加 1 点伤害。",
          range: "单体",
          cost: 2,
          effect: "造成 2 点伤害；本回合每次生效后，后续紫电瞬杀伤害 +1。",
          upgrade: "",
          icon: zidian?.icon,
          castIllustration: zidian?.castIllustration,
        },
        {
          name: "虚空刃舞",
          type: "攻击",
          description: "对所有敌人造成 3 点伤害，并附加 1 层流血，持续 3 回合。",
          range: "多体",
          cost: 4,
          effect: "全体敌人受到 3 点伤害，并获得 1 层流血。",
          upgrade: "",
          icon: blade?.icon,
          castIllustration: blade?.castIllustration,
        },
      ],
    };
  }

  return character;
}

// ─── Aggregate ───────────────────────────────────────────────────────────────

const loadedFromGlob: Character[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith("/index.ts"))
  .map(([, mod]) => parseCharacter(mod.default))
  .filter((c): c is Character => c !== null)
  .map(applyTeacherBattleOverrides);

const seen = new Set<string>();
const realCharacters: Character[] = [];
for (const c of loadedFromGlob) {
  if (seen.has(c.id)) {
    console.warn(
      `[characters] duplicate id "${c.id}" detected, ignoring later entry. ` +
      `Please rename one of them in src/data/characters/.`
    );
    continue;
  }
  seen.add(c.id);
  realCharacters.push(c);
}

const rosterPriority = ["test-01", "12250804", "12250818"];

function getRosterRank(character: Character): number {
  const studentId = character.creator?.studentId;
  const priorityId = rosterPriority.findIndex(
    priority => character.id === priority || studentId === priority,
  );
  return priorityId === -1 ? Number.POSITIVE_INFINITY : priorityId;
}

realCharacters.sort((a, b) => {
  const aRank = getRosterRank(a);
  const bRank = getRosterRank(b);
  if (aRank !== bRank) return aRank - bRank;
  return a.id.localeCompare(b.id);
});

// ─── Pad to 24 slots with locked placeholders ────────────────────────────────

const TOTAL_SLOTS = 24;

function makePlaceholders(startIndex: number, count: number): Character[] {
  return Array.from({ length: count }, (_, i) => {
    const num = String(startIndex + i + 1).padStart(2, "0");
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
    } satisfies Character;
  });
}

const placeholderCount = Math.max(0, TOTAL_SLOTS - realCharacters.length);

export const allCharacters: Character[] = [
  ...realCharacters,
  ...makePlaceholders(realCharacters.length, placeholderCount),
];
