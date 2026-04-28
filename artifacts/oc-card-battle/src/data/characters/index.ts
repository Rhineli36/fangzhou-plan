import type { Character, Profession } from "../character-types";

const modules = import.meta.glob<{ default: Character }>("./*.ts", { eager: true });

const loadedFromGlob: Character[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith("/index.ts"))
  .map(([, mod]) => mod.default)
  .filter((c): c is Character => Boolean(c && c.id));

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
