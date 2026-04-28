import type { Character, Profession, Skill } from "../character-types";

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

// ─── Aggregate ───────────────────────────────────────────────────────────────

const loadedFromGlob: Character[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith("/index.ts"))
  .map(([, mod]) => parseCharacter(mod.default))
  .filter((c): c is Character => c !== null);

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

realCharacters.sort((a, b) => {
  if (a.id === "test-01") return -1;
  if (b.id === "test-01") return 1;
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
