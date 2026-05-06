import type { Character, Profession, Skill } from "../character-types";
import shisiAvatarCutout from "@assets/shisi_avatar_cutout.png";
import { resolvePublicAsset } from "@/lib/resourcePath";

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
      icon: resolvePublicAsset(p.icon as string) || undefined,
      castIllustration: resolvePublicAsset(p.castIllustration as string) || undefined,
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
        icon: resolvePublicAsset(s.icon as string) || undefined,
        castIllustration: resolvePublicAsset(s.castIllustration as string) || undefined,
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
    avatar: resolvePublicAsset(imgs.avatar),
    portrait: resolvePublicAsset(imgs.portrait),
    selectionPortrait: resolvePublicAsset(imgs.selectionPortrait),
    skills,
    creator: cr
      ? {
          name: (cr.name as string) || "",
          studentId: (cr.studentId as string) || "",
          className: (cr.class as string) || undefined,
          avatar: resolvePublicAsset(cr.avatar as string) || undefined,
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

function byName(character: Character, name: string): Skill | undefined {
  return character.skills.find(skill => skill.name === name);
}

function byType(character: Character, type: Skill["type"]): Skill | undefined {
  return character.skills.find(skill => skill.type === type);
}

function applyTeacherBattleOverrides(character: Character): Character {
  if (character.creator?.studentId === "12250801") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 6,
      skills: [
        {
          name: "满载行囊",
          type: "天赋",
          description: "团队最大能量 +2，团队手牌上限 +2。第 3、6 回合开始时，团队本回合能量恢复额外 +1。",
          range: "多体",
          cost: 0,
          effect: "开战提升能量与手牌上限；第 3、6 回合额外获得 1 点能量。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "应急储备",
          type: "恢复",
          description: "为指定角色回复 1 点生命，并获得 1 层恢复，驱散虚弱状态。每打出 3 张应急储备，恢复 1 点能量。",
          range: "单体",
          cost: 1,
          effect: "治疗 1；获得恢复；移除虚弱；每 3 次回能。",
          upgrade: "",
          icon: byName(character, "应急储备")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "应急储备")?.castIllustration,
        },
        {
          name: "铲尖猛击",
          type: "攻击",
          description: "对单体敌人造成 3 点伤害，并将 1 张应急储备放入自己的手牌。主动弃置时，也获得 1 张应急储备。",
          range: "单体",
          cost: 3,
          effect: "造成 3 点伤害；生成 1 张应急储备。",
          upgrade: "",
          icon: byName(character, "铲尖猛击")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "铲尖猛击")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250803") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "翳目溯时",
          type: "天赋",
          description: "溯衍存活时，每回合开始分别判定：50% 取消所有敌人的隐匿；50% 使自身获得隐匿。",
          range: "多体",
          cost: 0,
          effect: "每回合开始处理隐匿与反隐匿判定。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "勿忘",
          type: "攻击",
          description: "对敌人造成 2 点伤害，并施加标记，持续 2 回合。",
          range: "单体",
          cost: 2,
          effect: "造成 2 点伤害；附加标记。",
          upgrade: "",
          icon: byName(character, "勿忘")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "勿忘")?.castIllustration,
        },
        {
          name: "铭记",
          type: "攻击",
          description: "对敌人造成 3 点伤害；若目标被标记，额外造成 2 点伤害，并刷新目标全部减益持续时间。",
          range: "单体",
          cost: 4,
          effect: "造成 3 点伤害；标记目标额外 +2，并刷新减益。",
          upgrade: "",
          icon: byName(character, "铭记")?.icon || byName(character, "勿忘")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "铭记")?.castIllustration,
        },
      ],
    };
  }

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
          description: "为指定队友恢复 1 点生命；若目标身上存在异常状态，按异常层数额外回复等量生命，并随机驱散最多 2 个异常状态。",
          range: "单体",
          cost: 1,
          effect: "治疗 1 + 目标异常层数，并驱散最多 2 个异常。",
          upgrade: "",
          icon: heal?.icon,
          castIllustration: heal?.castIllustration,
        },
        {
          name: "幻海囚笼",
          type: "异能",
          description: "造成 3 点伤害，并强制造成伤害打断效果。若造成击杀，该卡片返回手中。这张牌消费 -1。",
          range: "单体",
          cost: 3,
          effect: "造成 3 点伤害；若 BOSS 正在蓄力，强制打断；费用 -1。",
          upgrade: "击杀目标时返回手牌。",
          icon: cage?.icon,
          castIllustration: cage?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250805") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "时痕感知",
          type: "天赋",
          description: "丽·沃恩存活时，所有敌人的隐匿效果无法生效。",
          range: "多体",
          cost: 0,
          effect: "反制敌方隐匿。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "预知残影",
          type: "防御",
          description: "只能对自己使用。获得 1 层护盾，并对随机敌人造成 1 次标记。",
          range: "单体",
          cost: 1,
          effect: "自身获得护盾；敌方获得标记。",
          upgrade: "",
          icon: byName(character, "预知残影")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "预知残影")?.castIllustration,
        },
        {
          name: "时痕回溯",
          type: "防御",
          description: "只能对自己使用，持续 2 回合。若期间死亡，以 3 点生命复活，并反击致命伤来源 3 点伤害；若来源被标记，生成 2 张快速射击。",
          range: "单体",
          cost: 3,
          effect: "自身获得回溯复活状态。",
          upgrade: "",
          icon: byName(character, "时痕回溯")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "时痕回溯")?.castIllustration,
        },
        {
          name: "快速射击",
          type: "攻击",
          description: "造成 2 点伤害。本回合每次打出快速射击，手牌中剩余快速射击消费 -1。",
          range: "单体",
          cost: 2,
          effect: "造成 2 点伤害；本回合后续快速射击费用降低。",
          upgrade: "",
          icon: byName(character, "快速射击")?.icon || byName(character, "预知残影")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "快速射击")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250806") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "星之残响",
          type: "天赋",
          description: "塞拉斯受到伤害时有 50% 几率获得 1 张命运折射。开战第一回合固定获得 1 张命运折射，不受手牌上限限制。",
          range: "单体",
          cost: 0,
          effect: "受伤有概率生成命运折射；开战额外获得 1 张。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "星辰律动",
          type: "恢复",
          description: "回复指定队友 2 点生命；如果手中有命运折射，强制弃置 1 张，并为目标添加 1 层护盾。",
          range: "单体",
          cost: 2,
          effect: "治疗 2；弃命运折射可追加护盾。",
          upgrade: "",
          icon: byName(character, "星辰律动")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "星辰律动")?.castIllustration,
        },
        {
          name: "命运折射",
          type: "攻击",
          description: "对目标造成 1-3 点伤害，并附加 1 回合失控。失控无法叠加。",
          range: "单体",
          cost: 2,
          effect: "造成 1-3 点伤害；附加失控。",
          upgrade: "",
          icon: byName(character, "命运折射")?.icon || byName(character, "星之残响")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "命运折射")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250807") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "过载分析",
          type: "天赋",
          description: "每次打出阿德琳·温莎的卡牌，获得 1 层过载分析。达到 4 层时清空，抽 1 张牌并获得 2 点能量。",
          range: "单体",
          cost: 0,
          effect: "打出自身牌累计过载；4 层转化为抽牌与 2 点能量。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "记忆重构·档案提取",
          type: "恢复",
          description: "为目标清除随机 1 层减益并回复 1 点生命；若目标不存在减益，则扣除 1 点生命并添加 1 层护盾，生命为 1 时不会扣血。",
          range: "单体",
          cost: 1,
          effect: "驱散减益并治疗；无减益时转化为护盾。",
          upgrade: "",
          icon: byName(character, "记忆重构·档案提取")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "记忆重构·档案提取")?.castIllustration,
        },
        {
          name: "时序断层·停滞场",
          type: "攻击",
          description: "对单体造成 2 点伤害，并有 50% 几率造成打断。",
          range: "单体",
          cost: 2,
          effect: "造成 2 点伤害；50% 打断蓄力。",
          upgrade: "",
          icon: byName(character, "时序断层·停滞场")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "时序断层·停滞场")?.castIllustration,
        },
        {
          name: "理论具现·熵减治疗",
          type: "恢复",
          description: "全体回复 2 点生命，并清除当前全部过载分析，获得对应层数的恢复。",
          range: "多体",
          cost: 3,
          effect: "全体治疗 2；过载层数转为恢复。",
          upgrade: "",
          icon: byName(character, "理论具现·熵减治疗")?.icon || character.skills[3]?.icon,
          castIllustration: byName(character, "理论具现·熵减治疗")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250808") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "失控解放",
          type: "天赋",
          description: "纺拥有减益时，她的雾爪必定命中并且伤害 +1。",
          range: "单体",
          cost: 0,
          effect: "有减益时强化雾爪。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "雾爪",
          type: "攻击",
          description: "对目标造成 1 点伤害，并赋予 1 层流血。",
          range: "单体",
          cost: 1,
          effect: "造成 1 点伤害；附加流血。",
          upgrade: "",
          icon: byName(character, "雾爪")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "雾爪")?.castIllustration,
        },
        {
          name: "净化领域",
          type: "恢复",
          description: "为全体队友驱散随机 1 层减益，并赋予 1 层恢复。",
          range: "多体",
          cost: 3,
          effect: "全体驱散 1 个减益，并获得恢复。",
          upgrade: "",
          icon: byName(character, "净化领域")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "净化领域")?.castIllustration,
        },
        {
          name: "残影读秒",
          type: "防御",
          description: "生成 1 张雾爪到手中，同时赋予自身失控和隐匿。",
          range: "单体",
          cost: 2,
          effect: "生成雾爪；自身获得失控与隐匿。",
          upgrade: "",
          icon: byName(character, "残影读秒")?.icon || character.skills[3]?.icon,
          castIllustration: byName(character, "残影读秒")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250809") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 6,
      skills: [
        {
          name: "时序守护",
          type: "天赋",
          description: "赛琳·维拉存活时，队友护盾被清除可回复 1 点生命。该效果最多触发 3 次。",
          range: "多体",
          cost: 0,
          effect: "护盾破裂时治疗，最多 3 次。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "时序修复",
          type: "恢复",
          description: "下回合摸牌 +1、能量恢复 +1、手牌上限 +1，仅持续 1 回合。时序修复返回手牌。主动弃置时，有 50% 几率恢复 1 点能量。",
          range: "多体",
          cost: 2,
          effect: "获得下回合资源增益；本牌返回手牌；弃置可能回能。",
          upgrade: "",
          icon: byName(character, "Chronos Repair 时序修复")?.icon || byName(character, "时序修复")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "Chronos Repair 时序修复")?.castIllustration,
        },
        {
          name: "安护屏障",
          type: "防御",
          description: "为全体队友添加 1 层护盾和 1 层恢复，并随机丢弃 1 张手牌。",
          range: "多体",
          cost: 4,
          effect: "全体获得护盾与恢复；随机弃 1 张手牌。",
          upgrade: "",
          icon: byName(character, "Safe Haven Barrier 安护屏障")?.icon || byName(character, "安护屏障")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "Safe Haven Barrier 安护屏障")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250810") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "共鸣",
          type: "天赋",
          description: "当敌人的失控效果触发时，队伍获得 1 点能量并抽 1 张牌。",
          range: "多体",
          cost: 0,
          effect: "敌方失控失败时获得资源。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "时空之刃·断界",
          type: "攻击",
          description: "造成 1-4 点伤害，并对敌人造成重伤。",
          range: "单体",
          cost: 3,
          effect: "造成 1-4 点伤害；附加重伤。",
          upgrade: "",
          icon: byName(character, "时空之刃·断界")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "时空之刃·断界")?.castIllustration,
        },
        {
          name: "时空之刃·扭曲",
          type: "攻击",
          description: "造成 1-2 点伤害，并附加失控。",
          range: "单体",
          cost: 2,
          effect: "造成 1-2 点伤害；附加失控。",
          upgrade: "",
          icon: byName(character, "时空之刃·扭曲")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "时空之刃·扭曲")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250811") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "记忆检索",
          type: "天赋",
          description: "每回合开始获得 1 层记忆检索。达到 4 层时清空，队友所有增益层数 +1；无层数增益刷新持续时间。",
          range: "多体",
          cost: 0,
          effect: "回合开始累计记忆；4 层强化全队增益。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "念念不忘",
          type: "防御",
          description: "对自己生成 1 层护盾，并生成 1 层记忆检索。主动弃置时，获得 1 点能量并生成 1 层记忆检索。",
          range: "单体",
          cost: 1,
          effect: "自身护盾；获得记忆检索。",
          upgrade: "主动弃置时获得能量和记忆。",
          icon: byName(character, "念念不忘")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "念念不忘")?.castIllustration,
        },
        {
          name: "永恒离别",
          type: "攻击",
          description: "对所有敌人造成 2 + 当前记忆检索层数的伤害，并有 50% 几率附加虚弱。",
          range: "多体",
          cost: 3,
          effect: "群体伤害；概率附加虚弱。",
          upgrade: "",
          icon: byName(character, "永恒离别")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "永恒离别")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250812") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 7,
      skills: [
        {
          name: "时空之力",
          type: "天赋",
          description: "回合结束时，若雷恩拥有增益，下回合抽卡 +1；若拥有减益，下回合能量恢复 +1。",
          range: "单体",
          cost: 0,
          effect: "根据自身增益/减益提供下回合资源。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "废墟行者",
          type: "恢复",
          description: "清除目标 2 层减益，并获得 1 层恢复。若目标是雷恩本人，额外获得 1 层攻击提升。",
          range: "单体",
          cost: 2,
          effect: "驱散 2 层减益；获得恢复；自用追加攻击提升。",
          upgrade: "",
          icon: byName(character, "废墟行者")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "废墟行者")?.castIllustration,
        },
        {
          name: "绝境应激",
          type: "攻击",
          description: "造成 2 点伤害。自身当前每损失 2 点生命，额外造成 1 点伤害。主动弃置时，自身获得恢复和虚弱。",
          range: "单体",
          cost: 2,
          effect: "造成基于损血的伤害。",
          upgrade: "主动弃置时获得恢复和虚弱。",
          icon: byName(character, "绝境应激")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "绝境应激")?.castIllustration,
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
      hp: 6,
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
          description: "为指定队友生成 1 层护盾，并抽 1 张该角色对应的手牌。护盾可免疫一次直接伤害，触发后消耗。",
          range: "单体",
          cost: 2,
          effect: "指定队友获得 1 层护盾；抽 1 张该角色手牌。",
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

  if (character.creator?.studentId === "12250813") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "朽茧余温",
          type: "天赋",
          description: "莉拉首次死亡时，会在下个己方回合以 1 点生命复活；同时驱散全队 1 层异常状态，并为全队赋予 1 层恢复。",
          range: "多体",
          cost: 0,
          effect: "每场战斗限 1 次：死亡后延迟复活，并为全队净化与恢复。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "蛛丝汲生",
          type: "异能",
          description: "赋予指定队友蛛丝汲生，持续 3 回合。目标卡牌消费 -1；目标卡牌造成伤害后，为莉拉和目标同时回复 1 点生命。莉拉支付 1 点生命。",
          range: "单体",
          cost: 4,
          effect: "指定队友获得蛛丝汲生 3 回合：费用 -1，造成伤害后双方回复；莉拉失去 1 点生命。",
          upgrade: "",
          icon: byName(character, "蛛丝汲生")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "蛛丝汲生")?.castIllustration,
        },
        {
          name: "流萤抚墟",
          type: "恢复",
          description: "全体队友回复 1 点生命；带有蛛丝汲生的角色额外驱散 1 层异常状态，并获得 1 层恢复。",
          range: "多体",
          cost: 2,
          effect: "全体治疗；强化蛛丝汲生目标。",
          upgrade: "",
          icon: byName(character, "流萤抚墟")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "流萤抚墟")?.castIllustration,
        },
        {
          name: "蝶落守彰",
          type: "攻击",
          description: "造成 2 点伤害；如果队友中有人带有蛛丝汲生，则对目标赋予重伤。",
          range: "单体",
          cost: 2,
          effect: "造成 2 点伤害；有蛛丝汲生时附加重伤。",
          upgrade: "",
          icon: byName(character, "蝶落守彰")?.icon || character.skills[3]?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "蝶落守彰")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250815") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "影痕共鸣",
          type: "天赋",
          description: "如果上一己方回合阮烬没有出过牌，下个回合开始前阮烬获得 1 回合技能免疫，免疫新获得的减益。",
          range: "单体",
          cost: 0,
          effect: "空过一回合后获得技能免疫。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "时间锚点",
          type: "攻击",
          description: "造成 1 点伤害，并附加标记。",
          range: "单体",
          cost: 1,
          effect: "造成 1 点伤害；附加标记。",
          upgrade: "",
          icon: byName(character, "时间锚点")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "时间锚点")?.castIllustration,
        },
        {
          name: "碎片脉冲",
          type: "攻击",
          description: "对所有敌人造成 1 点伤害；如果敌人身上有标记，每层标记额外 +1 伤害，并刷新标记持续时间。",
          range: "多体",
          cost: 3,
          effect: "群体伤害；根据标记层数追加伤害并刷新标记。",
          upgrade: "",
          icon: byName(character, "碎片脉冲")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "碎片脉冲")?.castIllustration,
        },
        {
          name: "时停回溯",
          type: "攻击",
          description: "造成 1-2 点伤害，并尝试打断蓄力。若成功打断蓄力，有 50% 几率赋予昏迷。",
          range: "单体",
          cost: 3,
          effect: "随机伤害；打断蓄力；成功打断后可能昏迷。",
          upgrade: "",
          icon: byName(character, "时停回溯")?.icon || character.skills[3]?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "时停回溯")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250816") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 6,
      skills: [
        {
          name: "残时回响",
          type: "天赋",
          description: "鸢尾每次造成伤害时，40% 几率摸 1 张自己的牌，不会摸到时滞刀域；每次受到伤害时，40% 几率恢复 1 点能量。",
          range: "单体",
          cost: 0,
          effect: "造成伤害可能抽自己的牌；受到伤害可能回能。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "断空瞬斩",
          type: "攻击",
          description: "造成 1-3 点伤害，并清除自身所有减益；如果清除了减益，回复 1 点生命。",
          range: "单体",
          cost: 2,
          effect: "随机伤害；自净化；清除成功时自疗。",
          upgrade: "",
          icon: byName(character, "断空瞬斩")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "断空瞬斩")?.castIllustration,
        },
        {
          name: "暗影裂刃",
          type: "攻击",
          description: "造成 2 点伤害，并清除目标身上的所有增益；每清除 1 个增益，额外造成 1 点伤害。",
          range: "单体",
          cost: 2,
          effect: "驱散敌方增益并按数量追加伤害。",
          upgrade: "",
          icon: byName(character, "暗影裂刃")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "暗影裂刃")?.castIllustration,
        },
        {
          name: "时滞刀域",
          type: "异能",
          description: "鸢尾进入自己的领域，摸 2 张自己的牌；不会摸到时滞刀域。本回合所有鸢尾卡牌消费 -1，造成伤害 +1。",
          range: "单体",
          cost: 4,
          effect: "抽 2 张鸢尾牌；本回合鸢尾费用降低并提高伤害。",
          upgrade: "",
          icon: byName(character, "时滞刀域")?.icon || character.skills[3]?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "时滞刀域")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250817") {
    const talent = byType(character, "天赋");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "黑雾亲和",
          type: "天赋",
          description: "在隐匿或伏击状态下，艾琳处于技能免疫状态，并且受到的最终伤害 -1。",
          range: "单体",
          cost: 0,
          effect: "隐匿/伏击期间获得减伤与技能免疫。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "雾蚀突袭",
          type: "攻击",
          description: "造成 2 点伤害，并为目标附加重伤。",
          range: "单体",
          cost: 2,
          effect: "造成 2 点伤害；附加重伤。",
          upgrade: "",
          icon: byName(character, "雾蚀突袭")?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "雾蚀突袭")?.castIllustration,
        },
        {
          name: "异化释放",
          type: "异能",
          description: "驱散自身减益，并进入伏击状态。伏击拥有隐匿效果，下一次伤害有 50% 几率翻倍。",
          range: "单体",
          cost: 3,
          effect: "自净化；获得伏击。",
          upgrade: "",
          icon: byName(character, "异化释放")?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "异化释放")?.castIllustration,
        },
        {
          name: "雾翼庇护",
          type: "防御",
          description: "让指定队友进入隐匿状态，并驱散所有减益。",
          range: "单体",
          cost: 2,
          effect: "指定队友隐匿并完全净化。",
          upgrade: "",
          icon: byName(character, "雾翼庇护")?.icon || character.skills[3]?.icon || character.skills[2]?.icon,
          castIllustration: byName(character, "雾翼庇护")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250820") {
    const talent = byType(character, "天赋");
    const shadowStep = byName(character, "残步影");
    return {
      ...character,
      hp: 6,
      skills: [
        {
          name: "黑雾抗性",
          type: "天赋",
          description: "受到减益时有 50% 几率抵抗。若失败，下一次抵抗判定提高 25%；判定成功后，下一次抵抗概率重置为 50%。每次抵抗成功，回复 1 点生命并获得 1 点能量。",
          range: "单体",
          cost: 0,
          effect: "抵抗减益；失败会提高下一次判定，成功时自疗并回能。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "残步影",
          type: "攻击",
          description: "造成 2 点伤害，对敌人附加失控；有 50% 几率尝试对自己附加失控。如果触发自我失控判定，无论是否被黑雾抗性抵抗，这张残步影都会回到手中。",
          range: "单体",
          cost: 2,
          effect: "造成 2 点伤害并附加失控；可能回手。",
          upgrade: "",
          icon: shadowStep?.icon || character.skills[1]?.icon,
          castIllustration: shadowStep?.castIllustration,
        },
        {
          name: "残响屏障",
          type: "防御",
          description: "为指定队友生成 1 层护盾，并为林青梧自己生成 1 层恍惚。如果林青梧抵抗了这次恍惚，则下回合额外摸 1 张牌，最多叠加 3 次。",
          range: "单体",
          cost: 2,
          effect: "指定护盾；自我恍惚判定；抵抗成功时准备额外摸牌。",
          upgrade: "",
          icon: byName(character, "残响屏障")?.icon || shadowStep?.icon || character.skills[1]?.icon,
          castIllustration: byName(character, "残响屏障")?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250819") {
    const talent = byName(character, "黑雾迷阵") || byType(character, "天赋");
    const thousandBlades = byName(character, "剥离、千层刃") || byType(character, "天赋");
    const rewind = byName(character, "层解、回溯");
    const silence = byName(character, "空心、归寂");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "黑雾迷阵",
          type: "天赋",
          description: "鳞造成的减益有 50% 几率额外叠加 1 层。",
          range: "单体",
          cost: 0,
          effect: "减益追加叠层。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "剥离、千层刃",
          type: "攻击",
          description: "对目标造成 1-3 点伤害，并附加 1 层流血。如果黑雾迷阵触发，额外附加 1 层流血，并回复 1 点能量。",
          range: "单体",
          cost: 3,
          effect: "随机伤害；附加流血；迷阵触发时回能。",
          upgrade: "",
          icon: thousandBlades?.icon || character.skills[1]?.icon,
          castIllustration: thousandBlades?.castIllustration,
        },
        {
          name: "层解、回溯",
          type: "恢复",
          description: "全体队友驱散 1 层减益并回复 2 点生命，随后鳞失去 2 点生命；此技能不会使鳞死亡，至少保留 1 点生命。",
          range: "多体",
          cost: 2,
          effect: "全体净化与治疗；自身支付生命。",
          upgrade: "",
          icon: rewind?.icon || character.skills[2]?.icon || thousandBlades?.icon,
          castIllustration: rewind?.castIllustration,
        },
        {
          name: "空心、归寂",
          type: "攻击",
          description: "对目标造成 1-3 点伤害，并附加禁止治疗 2 回合。禁止治疗会阻止目标获得治疗，重复叠加会延长持续回合。",
          range: "单体",
          cost: 3,
          effect: "随机伤害；附加禁止治疗。",
          upgrade: "",
          icon: silence?.icon || character.skills[3]?.icon || rewind?.icon,
          castIllustration: silence?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250821") {
    const talent = byType(character, "天赋");
    const redBlade = byName(character, "赤刃·裂空");
    const rewind = byName(character, "烬影·回溯");
    return {
      ...character,
      hp: 6,
      name: "瑞文",
      skills: [
        {
          name: "雾影赤瞳",
          type: "天赋",
          description: "瑞文对敌人造成伤害时，有 50% 几率附加 1 层标记。如果敌人已经带有标记，则瑞文回复 1 点生命。",
          range: "单体",
          cost: 0,
          effect: "造成伤害时尝试标记；攻击已有标记目标时自疗。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "赤刃·裂空",
          type: "攻击",
          description: "对目标造成 2-3 点伤害。如果造成的伤害超过目标总生命值的 30%，则立刻杀死非 BOSS 对手。",
          range: "单体",
          cost: 3,
          effect: "随机伤害；高伤害时斩杀非 BOSS 目标。",
          upgrade: "",
          icon: redBlade?.icon || character.skills[1]?.icon,
          castIllustration: redBlade?.castIllustration,
        },
        {
          name: "烬影·回溯",
          type: "防御",
          description: "清除自身 1 项减益，获得攻击提升（持续 2 回合），并把 1 张赤刃·裂空放入手牌。",
          range: "单体",
          cost: 2,
          effect: "自我净化；获得 2 回合攻击提升；生成赤刃·裂空。",
          upgrade: "",
          icon: rewind?.icon || character.skills[2]?.icon || redBlade?.icon,
          castIllustration: rewind?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250802") {
    const talent = byType(character, "天赋");
    const missile = byName(character, "奥术飞弹");
    const field = byName(character, "虚空力场");
    const spring = byName(character, "生命源泉");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "命运之书",
          type: "天赋",
          description: "战斗开始获得 15 层命运计数。艾瑟琳每打出 1 张自己的技能牌，计数 +1。友方倒下时，若计数达到 15 层，清空计数并使其以 50% 生命复活。",
          range: "多体",
          cost: 0,
          effect: "记录技能牌；满 15 层触发友方复活。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "奥术飞弹",
          type: "攻击",
          description: "费用 2。指定 1 名敌人，下回合开始时造成伤害。基础伤害为 2，本回合每打出 1 张艾瑟琳技能牌，伤害 +1。若本回合再次打出奥术飞弹，有 50% 几率改为全体敌人各结算一次。",
          range: "单体",
          cost: 2,
          effect: "延迟伤害；随本回合艾瑟琳出牌数提高。",
          upgrade: "",
          icon: missile?.icon || character.skills[1]?.icon,
          castIllustration: missile?.castIllustration,
        },
        {
          name: "虚空力场",
          type: "异能",
          description: "费用 3。为当前生命最低的友方获得 1 层护盾，并让全体友方获得 2 回合攻击提升。主动弃置时，艾瑟琳失去 1 点生命并获得 1 层护盾，同时计入命运之书出牌计数。",
          range: "多体",
          cost: 3,
          effect: "保护低血量友方；全队攻击提升。",
          upgrade: "",
          icon: field?.icon || character.skills[2]?.icon || missile?.icon,
          castIllustration: field?.castIllustration,
        },
        {
          name: "生命源泉",
          type: "恢复",
          description: "费用 2。指定 1 名友方，回复 1 点生命并驱散全部减益；每驱散 1 项减益，获得 1 层恢复。主动弃置时，艾瑟琳回复 1 点生命，同时计入命运之书出牌计数。",
          range: "单体",
          cost: 2,
          effect: "治疗；净化减益；按净化数量获得恢复。",
          upgrade: "",
          icon: spring?.icon || character.skills[3]?.icon || field?.icon,
          castIllustration: spring?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250814") {
    const talent = byType(character, "天赋");
    const spark = byName(character, "电光火石");
    const breath = byName(character, "凝息");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "吞噬强化",
          type: "天赋",
          description: "马特维每次实际受到生命伤害时，按当前吞噬概率判定是否免疫。初始概率 30%；免疫失败后概率 +15%，成功免疫后重置为 30%。护盾抵消的伤害不会触发判定。",
          range: "单体",
          cost: 0,
          effect: "受伤时概率免疫；失败会提高下次概率。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "电光火石",
          type: "攻击",
          description: "费用 2。对单个敌人造成 1-3 点随机伤害，并有 50% 几率打断或控制目标。若马特维当前吞噬概率高于 30%，打断判定必定成功。",
          range: "单体",
          cost: 2,
          effect: "随机伤害；概率打断，高吞噬概率时必定打断。",
          upgrade: "",
          icon: spark?.icon || character.skills[1]?.icon,
          castIllustration: spark?.castIllustration,
        },
        {
          name: "凝息",
          type: "恢复",
          description: "费用 2。马特维回复 2 点生命，获得 2 回合攻击提升，并使吞噬强化的当前免疫概率 +15%。",
          range: "单体",
          cost: 2,
          effect: "自我治疗；攻击提升；提高吞噬概率。",
          upgrade: "",
          icon: breath?.icon || character.skills[2]?.icon || spark?.icon,
          castIllustration: breath?.castIllustration,
        },
      ],
    };
  }

  if (character.creator?.studentId === "12250823") {
    const talent = byName(character, "一键满血") || byType(character, "天赋");
    const reflux = byName(character, "药水反攻");
    const frost = byName(character, "冰雪瞬杀");
    return {
      ...character,
      hp: 5,
      skills: [
        {
          name: "药息共鸣",
          type: "天赋",
          description: "恒我在场时，任意友方受到治疗后，分别进行两次判定：50% 几率获得 1 层恢复；50% 几率额外回复 1 点生命。",
          range: "多体",
          cost: 0,
          effect: "全队治疗后概率追加恢复或额外治疗。",
          upgrade: "",
          icon: talent?.icon || character.avatar,
          castIllustration: talent?.castIllustration,
        },
        {
          name: "逆剂回流",
          type: "恢复",
          description: "费用 3。指定 1 名友方，回复 2 点生命；随后对随机敌人造成等同于本次治疗数值的伤害。若药息共鸣触发额外治疗，本次回流伤害也会随之提高。",
          range: "单体",
          cost: 3,
          effect: "单体治疗；按治疗量反击随机敌人。",
          upgrade: "",
          icon: reflux?.icon || character.skills[1]?.icon,
          castIllustration: reflux?.castIllustration,
        },
        {
          name: "寒脉封针",
          type: "攻击",
          description: "费用 3。对单个敌人造成 1-3 点伤害；50% 几率造成控制打断，50% 几率附加 1 层虚弱，持续 2 回合。",
          range: "单体",
          cost: 3,
          effect: "随机伤害；概率控制；概率虚弱。",
          upgrade: "",
          icon: frost?.icon || character.skills[2]?.icon || reflux?.icon,
          castIllustration: frost?.castIllustration,
        },
      ],
    };
  }

  return character;
}

// ─── Aggregate ───────────────────────────────────────────────────────────────

const loadedFromGlob: Character[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith("/index.ts") && !/\/char-\d+\.ts$/.test(path))
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

const rosterPriority = [
  "test-01",
  "12250801",
  "12250802",
  "12250804",
  "12250818",
  "12250803",
  "12250805",
  "12250806",
  "12250807",
  "12250808",
  "12250809",
  "12250810",
  "12250811",
  "12250812",
  "12250813",
  "12250814",
  "12250815",
  "12250816",
  "12250817",
  "12250819",
  "12250820",
  "12250821",
  "12250823",
];
export const playableCharacterIds = [
  "test-01",
  "12250801",
  "12250802",
  "12250803",
  "12250804",
  "12250805",
  "12250806",
  "12250807",
  "12250808",
  "12250809",
  "12250810",
  "12250811",
  "12250812",
  "12250813",
  "12250814",
  "12250815",
  "12250816",
  "12250817",
  "12250818",
  "12250819",
  "12250820",
  "12250821",
];

export function isCharacterBattleReady(character: Character): boolean {
  const studentId = character.creator?.studentId;
  return playableCharacterIds.includes(character.id) || (!!studentId && playableCharacterIds.includes(studentId));
}

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

export const allCharacters: Character[] = [...realCharacters];
