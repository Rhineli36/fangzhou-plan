import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Download,
  Trash2,
  FileText,
  Sparkles,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const PROFESSIONS = ["调查者", "战斗者", "支援者", "异种", "遗民"] as const;
// 主动技能可选类型（不含"天赋"，天赋单独作为被动技能）
const ACTIVE_SKILL_TYPES = ["攻击", "防御", "异能", "恢复"] as const;
const ZODIACS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座", "未知"
];
const STORAGE_KEY = "oc-card-battle:create-oc-draft";
const FIXED_CLASS = "2025届设计8班";

interface PassiveSkillForm {
  name: string;
  effectDescription: string;
  characteristic: string;
  icon: string;
  castIllustration: string;
}

interface ActiveSkillForm {
  name: string;
  type: typeof ACTIVE_SKILL_TYPES[number] | "";
  effectDescription: string;
  characteristic: string;
  icon: string;
  castIllustration: string;
}

interface FormState {
  // Creator
  studentName: string;
  studentId: string;
  studentClass: string;
  studentAvatar: string;
  messageToCharacter: string;
  proposedGameName: string;

  // Character basics
  id: string;
  name: string;
  title: string;
  profession: typeof PROFESSIONS[number] | "";
  positioning: string;
  hp: number;
  gender: string;
  age: string;
  birthday: string;
  zodiac: string;
  bloodType: string;
  linkedCharacters: string[];
  selectionLine: string;
  backgroundStory: string;

  // Extended background
  origin: string;
  family: string;
  pastExperiences: string;
  currentSituation: string;
  epilogue: string;
  epilogueIllustration: string;

  // Preferences
  likes: string[];
  dislikes: string[];
  favoriteColor: string;
  habits: string;
  motto: string;

  // Character images（不再有"战斗插图"，已被技能释放插图替代）
  avatar: string;
  portrait: string;
  selectionPortrait: string;

  // Skills
  passiveSkill: PassiveSkillForm;
  activeSkills: ActiveSkillForm[];
}

const emptyPassive: PassiveSkillForm = {
  name: "", effectDescription: "", characteristic: "", icon: "", castIllustration: "",
};

const emptyActive: ActiveSkillForm = {
  name: "", type: "", effectDescription: "", characteristic: "", icon: "", castIllustration: "",
};

const emptyForm: FormState = {
  studentName: "",
  studentId: "",
  studentClass: FIXED_CLASS,
  studentAvatar: "",
  messageToCharacter: "",
  proposedGameName: "",

  id: "",
  name: "",
  title: "",
  profession: "",
  positioning: "",
  hp: 5,
  gender: "",
  age: "",
  birthday: "",
  zodiac: "",
  bloodType: "",
  linkedCharacters: [],
  selectionLine: "",
  backgroundStory: "",

  origin: "",
  family: "",
  pastExperiences: "",
  currentSituation: "",
  epilogue: "",
  epilogueIllustration: "",

  likes: [],
  dislikes: [],
  favoriteColor: "",
  habits: "",
  motto: "",

  avatar: "",
  portrait: "",
  selectionPortrait: "",

  passiveSkill: { ...emptyPassive },
  activeSkills: [{ ...emptyActive }],
};

function stripImagesForDraft(form: FormState): FormState {
  return {
    ...form,
    studentAvatar: "",
    epilogueIllustration: "",
    avatar: "",
    portrait: "",
    selectionPortrait: "",
    passiveSkill: {
      ...form.passiveSkill,
      icon: "",
      castIllustration: "",
    },
    activeSkills: form.activeSkills.map(skill => ({
      ...skill,
      icon: "",
      castIllustration: "",
    })),
  };
}

export default function CreateOC() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [linkInput, setLinkInput] = useState("");
  const [likeInput, setLikeInput] = useState("");
  const [dislikeInput, setDislikeInput] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  // Load draft on mount (含旧版 skills 字段迁移)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);

      // 旧版兼容：把旧的 `skills: SkillForm[]` 拆成 passiveSkill + activeSkills
      if (Array.isArray(draft.skills) && !draft.passiveSkill && !draft.activeSkills) {
        type LegacySkill = {
          name?: string; type?: string;
          effectDescription?: string; characteristic?: string; illustration?: string;
        };
        const legacy: LegacySkill[] = draft.skills;
        const passive = legacy.find(s => s.type === "天赋");
        const actives = legacy.filter(s => s.type !== "天赋");
        draft.passiveSkill = passive ? {
          name: passive.name ?? "",
          effectDescription: passive.effectDescription ?? "",
          characteristic: passive.characteristic ?? "",
          icon: passive.illustration ?? "",
          castIllustration: "",
        } : { ...emptyPassive };
        draft.activeSkills = actives.length > 0
          ? actives.map(s => ({
              name: s.name ?? "",
              type: (s.type && s.type !== "天赋" && (ACTIVE_SKILL_TYPES as readonly string[]).includes(s.type))
                ? (s.type as typeof ACTIVE_SKILL_TYPES[number])
                : "",
              effectDescription: s.effectDescription ?? "",
              characteristic: s.characteristic ?? "",
              icon: "",
              castIllustration: s.illustration ?? "",
            }))
          : [{ ...emptyActive }];
        delete draft.skills;
        delete draft.combatPortrait;
      }

      setForm({ ...emptyForm, ...draft, studentClass: FIXED_CLASS });
    } catch {/* ignore */}
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripImagesForDraft(form)));
      const t = new Date().toLocaleTimeString("zh-CN");
      setSavedAt(t);
    } catch {
      alert("保存失败：浏览器本地草稿空间不足。请先生成提交文件，或清空旧草稿后再试。");
    }
  };

  const handleClearDraft = () => {
    if (!confirm("确定要清空所有内容吗？此操作不可恢复。")) return;
    localStorage.removeItem(STORAGE_KEY);
    setForm(emptyForm);
    setSavedAt(null);
    setSubmitted(null);
  };

  // Image upload helper for top-level fields
  type ImageKey = "avatar" | "portrait" | "selectionPortrait" | "studentAvatar" | "epilogueIllustration";
  const handleImage = (file: File | null, key: ImageKey) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("图片过大，请上传 4MB 以内的图片。");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      update(key, (e.target?.result as string) ?? "");
    };
    reader.readAsDataURL(file);
  };

  // Read a file as data URL (helper for skill image uploads)
  const readAsDataURL = (file: File | null, onDone: (src: string) => void) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("图片过大，请上传 4MB 以内的图片。");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => onDone((e.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  };

  // Passive skill image upload
  const handlePassiveImage = (field: "icon" | "castIllustration", file: File | null) => {
    readAsDataURL(file, src => {
      update("passiveSkill", { ...form.passiveSkill, [field]: src });
    });
  };

  // Active skill image upload
  const handleActiveSkillImage = (idx: number, field: "icon" | "castIllustration", file: File | null) => {
    readAsDataURL(file, src => {
      updateActiveSkill(idx, { [field]: src });
    });
  };

  // Tag list helpers
  const addTag = (key: "linkedCharacters" | "likes" | "dislikes", value: string) => {
    const v = value.trim();
    if (!v) return;
    if (form[key].includes(v)) return;
    update(key, [...form[key], v]);
  };
  const removeTag = (key: "linkedCharacters" | "likes" | "dislikes", value: string) => {
    update(key, form[key].filter(x => x !== value));
  };

  // Active skill helpers
  const addActiveSkill = () => {
    if (form.activeSkills.length >= 3) return;
    update("activeSkills", [...form.activeSkills, { ...emptyActive }]);
  };
  const updateActiveSkill = (idx: number, patch: Partial<ActiveSkillForm>) => {
    const next = [...form.activeSkills];
    next[idx] = { ...next[idx], ...patch };
    update("activeSkills", next);
  };
  const removeActiveSkill = (idx: number) => {
    if (form.activeSkills.length <= 1) return;
    update("activeSkills", form.activeSkills.filter((_, i) => i !== idx));
  };

  // Validation — 全部字段必填
  const errors: string[] = [];

  // 创作者信息
  if (!form.studentAvatar) errors.push("请上传创作者头像");
  if (!form.studentName.trim()) errors.push("请填写创作者姓名");
  if (!form.studentId.trim()) errors.push("请填写学号");
  if (!form.messageToCharacter.trim()) errors.push('请填写"想对这个角色说的话"');
  if (!form.proposedGameName.trim()) errors.push("请为游戏起一个名字");

  // 角色基础信息
  if (!form.name.trim()) errors.push("请填写角色名");
  if (!form.title.trim()) errors.push("请填写称号");
  if (!form.profession) errors.push("请选择职业");
  if (!form.positioning.trim()) errors.push("请填写定位 / 标签");
  if (!form.gender.trim()) errors.push("请填写性别");
  if (!form.age.trim()) errors.push("请填写年龄");
  if (!form.birthday.trim()) errors.push("请填写生日");
  if (!form.zodiac) errors.push("请选择星座");
  if (!form.bloodType.trim()) errors.push("请填写血型");
  if (!form.selectionLine.trim()) errors.push("请填写入场台词 / 选择台词");

  // 角色图片
  if (!form.avatar) errors.push("请上传角色头像");
  if (!form.portrait) errors.push("请上传角色详情立绘");
  if (!form.selectionPortrait) errors.push("请上传角色选择立绘");

  // 背景故事 — 全部必填
  if (!form.backgroundStory.trim()) errors.push("请填写背景故事简述");
  if (!form.origin.trim()) errors.push("请填写第一章 · 身世起源");
  if (!form.family.trim()) errors.push("请填写第二章 · 家人");
  if (!form.pastExperiences.trim()) errors.push("请填写第三章 · 过往遭遇");
  if (!form.currentSituation.trim()) errors.push("请填写第四章 · 当前状态");
  if (!form.epilogue.trim()) errors.push("请填写结局故事");
  if (!form.epilogueIllustration) errors.push("请上传结局插图");

  // 个人侧写 — 全部必填
  if (!form.favoriteColor.trim()) errors.push("请填写喜欢的颜色");
  if (!form.motto.trim()) errors.push("请填写座右铭");
  if (form.likes.length === 0) errors.push("请至少添加 1 个喜好");
  if (form.dislikes.length === 0) errors.push("请至少添加 1 个厌恶");
  if (!form.habits.trim()) errors.push("请填写生活习惯");

  // 天赋（被动） — 全部必填
  if (!form.passiveSkill.name.trim()) errors.push("请填写天赋技能名");
  if (!form.passiveSkill.effectDescription.trim()) errors.push("请填写天赋技能的效果描述");
  if (!form.passiveSkill.characteristic.trim()) errors.push("请填写天赋技能的特点");
  if (!form.passiveSkill.icon) errors.push("请上传天赋技能图标");
  if (!form.passiveSkill.castIllustration) errors.push("请上传天赋技能的释放插图");

  // 主动技能 — 至少 1 个，且每个都全部必填
  if (form.activeSkills.length === 0) {
    errors.push("请至少添加 1 个主动技能");
  }
  form.activeSkills.forEach((s, i) => {
    const tag = `主动技能 #${i + 1}`;
    if (!s.name.trim()) errors.push(`请填写${tag}的技能名`);
    if (!s.type) errors.push(`请选择${tag}的类型`);
    if (!s.effectDescription.trim()) errors.push(`请填写${tag}的效果描述`);
    if (!s.characteristic.trim()) errors.push(`请填写${tag}的特点`);
    if (!s.icon) errors.push(`请上传${tag}的技能图标`);
    if (!s.castIllustration) errors.push(`请上传${tag}的释放插图`);
  });

  const handleSubmit = () => {
    if (errors.length > 0) {
      alert("还有以下内容未填写：\n\n" + errors.join("\n"));
      return;
    }

    const id = form.id.trim() || `oc-${Date.now().toString(36)}`;
    const submission = {
      submittedAt: new Date().toISOString(),
      creator: {
        name: form.studentName,
        studentId: form.studentId,
        class: FIXED_CLASS,
        avatar: form.studentAvatar || undefined,
        messageToCharacter: form.messageToCharacter || undefined,
        proposedGameName: form.proposedGameName || undefined,
      },
      character: {
        id,
        name: form.name,
        title: form.title,
        profession: form.profession,
        positioning: form.positioning,
        hp: form.hp,
        gender: form.gender,
        age: form.age,
        birthday: form.birthday,
        zodiac: form.zodiac,
        bloodType: form.bloodType,
        linkedCharacters: form.linkedCharacters,
        selectionLine: form.selectionLine,
        backgroundStory: form.backgroundStory,
        extendedBackground: {
          origin: form.origin || undefined,
          family: form.family || undefined,
          pastExperiences: form.pastExperiences || undefined,
          currentSituation: form.currentSituation || undefined,
          epilogue: form.epilogue,
          epilogueIllustration: form.epilogueIllustration || undefined,
        },
        preferences: {
          likes: form.likes.length ? form.likes : undefined,
          dislikes: form.dislikes.length ? form.dislikes : undefined,
          favoriteColor: form.favoriteColor || undefined,
          habits: form.habits || undefined,
          motto: form.motto || undefined,
        },
        passiveSkill: {
          name: form.passiveSkill.name,
          type: "天赋",
          effectDescription: form.passiveSkill.effectDescription,
          characteristic: form.passiveSkill.characteristic || undefined,
          icon: form.passiveSkill.icon || undefined,
          castIllustration: form.passiveSkill.castIllustration || undefined,
        },
        activeSkills: form.activeSkills
          .filter(s => s.name.trim())
          .map(s => ({
            name: s.name,
            type: s.type,
            effectDescription: s.effectDescription,
            characteristic: s.characteristic || undefined,
            icon: s.icon || undefined,
            castIllustration: s.castIllustration || undefined,
          })),
      },
      images: {
        avatar: form.avatar,
        portrait: form.portrait,
        selectionPortrait: form.selectionPortrait,
      },
    };

    const json = JSON.stringify(submission, null, 2);

    // Trigger download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeStudentId = form.studentId.trim().replace(/[^\w-]/g, "_");
    const safeCharName = form.name.trim().replace(/[\\/:*?"<>|]/g, "_");
    a.download = `${safeStudentId}_${safeCharName}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setSubmitted(json);
  };

  return (
    <div className="min-h-screen bg-[#0a0612] text-foreground relative overflow-hidden">
      <div className="scanlines" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
              <Link href="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                返回主页
              </Link>
            </Button>
            <div className="hidden md:block">
              <div className="text-[10px] text-primary/60 tracking-[0.3em] font-mono">OC SUBMISSION FORM</div>
              <div className="text-sm font-display font-bold tracking-wider">原创角色提交表 · CHARACTER UPLOAD</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {savedAt && (
              <span className="text-[10px] text-emerald-400/70 font-mono mr-2">已保存文字草稿 · {savedAt}</span>
            )}
            <Button variant="outline" size="sm" onClick={handleSaveDraft} className="rounded-none text-xs">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              保存草稿
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearDraft} className="rounded-none text-xs text-muted-foreground hover:text-destructive">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              清空
            </Button>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border border-primary/30 bg-primary/5 p-6"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-foreground/85 leading-relaxed">
                <div className="font-display font-bold text-lg text-primary mb-2 tracking-wider">欢迎登记你的角色 · 方舟计划</div>
                请按下方表单填写你的 OC 设定与图片。<span className="text-red-400">本次所有字段均为必填</span>，每一栏都不能空着，让你的角色拥有完整的设定档。
                填写过程会自动保存到本地浏览器，关掉页面也能继续。
                完成后点击底部"生成提交文件"，浏览器会下载一个 .json 文件，把它发送给老师即可入库。
              </div>
            </div>
          </motion.div>

          {/* SECTION: Creator info */}
          <Section title="创作者信息" subtitle="CREATOR · 让老师知道这是谁的作品">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
              <ImageUpload
                label="上传作者风格头像"
                hint="可选择卡通头像或非本人头像 · 建议 512 × 512"
                value={form.studentAvatar}
                onChange={file => handleImage(file, "studentAvatar")}
                onClear={() => update("studentAvatar", "")}
                aspect="aspect-square"
                required
              />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="姓名" required>
                    <Input
                      value={form.studentName}
                      onChange={e => update("studentName", e.target.value)}
                      placeholder="例如：王小明"
                    />
                  </Field>
                  <Field label="学号" required>
                    <Input
                      value={form.studentId}
                      onChange={e => update("studentId", e.target.value)}
                      placeholder="例如：2024030115"
                    />
                  </Field>
                </div>
                <Field label="班级" hint="本次活动锁定为本班">
                  <div className="h-10 px-3 flex items-center border border-border/60 bg-muted/30 text-foreground/90 text-sm tracking-wider font-mono">
                    {FIXED_CLASS}
                  </div>
                </Field>
              </div>
            </div>
            <Field label="想对这个角色说的话" required hint="一段写给 TA 的话，会展示在角色档案里">
              <Textarea
                value={form.messageToCharacter}
                onChange={e => update("messageToCharacter", e.target.value)}
                placeholder='例如："谢谢你陪我度过了那些深夜，希望你在另一个世界活得自由。"'
                className="min-h-[100px] font-serif"
              />
            </Field>
            <Field label="为游戏起个名字" required hint="征集中 · 当前默认《方舟计划》，欢迎提名替代方案">
              <Input
                value={form.proposedGameName}
                onChange={e => update("proposedGameName", e.target.value)}
                placeholder="例如：黑雾纪元 / 终末档案 / 残响之后"
              />
            </Field>
          </Section>

          {/* SECTION: Basic */}
          <Section title="角色基础信息" subtitle="BASIC PROFILE">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="角色名" required>
                <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="例如：夜·蝶" />
              </Field>
              <Field label="称号" required>
                <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder="例如：黑雾中的暗杀" />
              </Field>
              <Field label="职业" required>
                <Select value={form.profession} onValueChange={v => update("profession", v as FormState["profession"])}>
                  <SelectTrigger><SelectValue placeholder="请选择职业" /></SelectTrigger>
                  <SelectContent>
                    {PROFESSIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="定位 / 标签" required>
                <Input value={form.positioning} onChange={e => update("positioning", e.target.value)} placeholder="例如：高爆发刺客 / 重装前排" />
              </Field>
              <Field label={`生命值 HP（${form.hp}）`} hint="建议 4-6，越高越耐打">
                <Input
                  type="range" min={3} max={8} value={form.hp}
                  onChange={e => update("hp", Number(e.target.value))}
                />
              </Field>
              <Field label="性别" required>
                <Input value={form.gender} onChange={e => update("gender", e.target.value)} placeholder="例如：女 / 男 / 未知" />
              </Field>
              <Field label="年龄" required>
                <Input value={form.age} onChange={e => update("age", e.target.value)} placeholder="例如：19 / 不详" />
              </Field>
              <Field label="生日" required>
                <Input value={form.birthday} onChange={e => update("birthday", e.target.value)} placeholder="例如：4月14日" />
              </Field>
              <Field label="星座" required>
                <Select value={form.zodiac} onValueChange={v => update("zodiac", v)}>
                  <SelectTrigger><SelectValue placeholder="请选择星座" /></SelectTrigger>
                  <SelectContent>
                    {ZODIACS.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="血型" required>
                <Input value={form.bloodType} onChange={e => update("bloodType", e.target.value)} placeholder="例如：AB型 / 未知" />
              </Field>
            </div>

            <Field label="羁绊角色（选填）" hint="按回车添加，可填多个；也可以留空">
              <div className="flex gap-2">
                <Input
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); addTag("linkedCharacters", linkInput); setLinkInput(""); }
                  }}
                  placeholder="输入羁绊角色名后按回车"
                />
                <Button type="button" onClick={() => { addTag("linkedCharacters", linkInput); setLinkInput(""); }} variant="outline" className="rounded-none">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <TagList tags={form.linkedCharacters} onRemove={t => removeTag("linkedCharacters", t)} />
            </Field>

            <Field label="入场台词 / 选择台词" required>
              <Input value={form.selectionLine} onChange={e => update("selectionLine", e.target.value)} placeholder="例如：黑雾中的暗杀，无法被识别。" />
            </Field>
          </Section>

          {/* SECTION: Background story */}
          <Section title="背景故事" subtitle="BACKGROUND · 角色的身份与世界观 · 全部必填">
            <div className="border border-red-400/30 bg-red-400/5 p-4 mb-4 text-[11px] text-red-200/80 font-mono leading-relaxed">
              本章节<span className="text-white">每一栏都需要填写</span>。请按"简述 + 四章档案 + 结局"完整书写，让角色拥有完整的人物弧。
            </div>

            <Field label="背景故事简述" required hint="200-400 字最佳，作为简介展示">
              <Textarea
                value={form.backgroundStory}
                onChange={e => update("backgroundStory", e.target.value)}
                placeholder="简要介绍角色的身份、来历和当前处境..."
                className="min-h-[140px] font-serif"
              />
            </Field>

            <div className="border border-accent/20 bg-accent/5 p-4 mb-4 mt-2 text-[11px] text-accent/80 font-mono leading-relaxed">
              下面四章为完整背景档案，请按章节展开，让角色更有层次。
            </div>

            <Field label="第一章 · 身世起源" required>
              <Textarea value={form.origin} onChange={e => update("origin", e.target.value)} placeholder="出生地、家庭背景、成长环境..." className="min-h-[100px] font-serif" />
            </Field>
            <Field label="第二章 · 家人" required>
              <Textarea value={form.family} onChange={e => update("family", e.target.value)} placeholder="父亲、母亲、兄弟姐妹、其他重要亲属..." className="min-h-[100px] font-serif" />
            </Field>
            <Field label="第三章 · 过往遭遇" required>
              <Textarea value={form.pastExperiences} onChange={e => update("pastExperiences", e.target.value)} placeholder="灾变前后发生的关键事件..." className="min-h-[100px] font-serif" />
            </Field>
            <Field label="第四章 · 当前状态" required>
              <Textarea value={form.currentSituation} onChange={e => update("currentSituation", e.target.value)} placeholder="角色现在身处何处，在做什么..." className="min-h-[100px] font-serif" />
            </Field>

            <div className="border-l-2 border-primary/60 pl-3 mt-6 mb-2">
              <div className="text-[11px] text-primary tracking-[0.25em] font-mono">FINAL CHAPTER</div>
              <div className="text-sm text-foreground/85">每个角色都需要有一个结局——胜利、牺牲、消失或重生，都可以。</div>
            </div>

            <div className="border border-primary/30 bg-primary/5 p-4 mb-4 text-[12px] text-foreground/85 leading-relaxed">
              <div className="font-bold text-primary mb-2 tracking-wider">写结局时，请务必交代清楚以下内容：</div>
              <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                <li>结局必须和前面的<span className="text-white">背景故事</span>有关联，让读者能感受到前因后果。</li>
                <li>之前你为角色设定的<span className="text-white">羁绊</span>（与谁的牵挂）、<span className="text-white">愿望</span>、<span className="text-white">诉求</span>，最后<span className="text-white">有没有实现</span>？</li>
                <li>角色的<span className="text-white">最终归宿</span>是什么？活下来、牺牲、消失、重生、归隐……都可以，但要写明白。</li>
                <li>故事要<span className="text-white">完整</span>——有开始、过程、结尾，不要只写一句概括。</li>
              </ul>
            </div>

            <Field label="结局故事" required hint="完整、有头有尾，呼应背景故事中的羁绊与诉求">
              <Textarea
                value={form.epilogue}
                onChange={e => update("epilogue", e.target.value)}
                placeholder={`完整地讲述这个角色的结局。例如：\n\n那年她终于找到了父亲留下的研究档案，里面藏着关于母亲的真相。她带着妹妹离开了第十二街区，没有再回头。多年后，下城区的孩子们仍在传说，只要在黑雾最浓的夜晚抬头，就能看见一抹紫色的闪电——那是她回来看故人的方式。\n\n她最初的羁绊从未褪色，只是换了一种方式存在。`}
                className="min-h-[180px] font-serif"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 mt-2">
              <ImageUpload
                label="结局插图"
                hint="竖图 · 建议 1024 × 1536"
                value={form.epilogueIllustration}
                onChange={file => handleImage(file, "epilogueIllustration")}
                onClear={() => update("epilogueIllustration", "")}
                aspect="aspect-[2/3]"
                required
              />
              <div className="text-[12px] text-foreground/75 leading-relaxed border border-accent/20 bg-accent/5 p-4 self-start">
                <div className="font-bold text-accent mb-1 tracking-wider">关于结局插图</div>
                请为结局段落专门设计一张画面（例如：角色背影远去、墓碑前的剪影、新生时的黎明）。
                它会出现在通关结算的结局画面中，是这个角色故事的最后一帧。
              </div>
            </div>
          </Section>

          {/* SECTION: Preferences */}
          <Section title="个人侧写" subtitle="PROFILE · 让角色有生活感的细节 · 全部必填">
            <div className="border border-red-400/30 bg-red-400/5 p-4 mb-4 text-[11px] text-red-200/80 font-mono leading-relaxed">
              本章节<span className="text-white">每一栏都需要填写</span>。喜好 / 厌恶各至少 1 项，让角色更立体真实。
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="喜欢的颜色" required>
                <Input value={form.favoriteColor} onChange={e => update("favoriteColor", e.target.value)} placeholder="例如：深紫 / 暗夜蓝" />
              </Field>
              <Field label="座右铭" required>
                <Input value={form.motto} onChange={e => update("motto", e.target.value)} placeholder='例如："看不见我，就是最大的善意。"' />
              </Field>
            </div>

            <Field label="喜好" required hint="按回车添加，至少 1 项">
              <div className="flex gap-2">
                <Input
                  value={likeInput}
                  onChange={e => setLikeInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag("likes", likeInput); setLikeInput(""); } }}
                  placeholder="例如：深夜的雨"
                />
                <Button type="button" onClick={() => { addTag("likes", likeInput); setLikeInput(""); }} variant="outline" className="rounded-none">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <TagList tags={form.likes} onRemove={t => removeTag("likes", t)} variant="primary" />
            </Field>

            <Field label="厌恶" required hint="按回车添加，至少 1 项">
              <div className="flex gap-2">
                <Input
                  value={dislikeInput}
                  onChange={e => setDislikeInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag("dislikes", dislikeInput); setDislikeInput(""); } }}
                  placeholder="例如：消毒水的气味"
                />
                <Button type="button" onClick={() => { addTag("dislikes", dislikeInput); setDislikeInput(""); }} variant="outline" className="rounded-none">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <TagList tags={form.dislikes} onRemove={t => removeTag("dislikes", t)} variant="danger" />
            </Field>

            <Field label="生活习惯" required>
              <Textarea value={form.habits} onChange={e => update("habits", e.target.value)} placeholder="角色的日常小动作、习惯..." className="min-h-[80px] font-serif" />
            </Field>
          </Section>

          {/* SECTION: Skills */}
          <Section title="战斗技能" subtitle={`SKILLS · 1 个天赋（被动） + ${form.activeSkills.length}/3 个主动技能`}>
            <div className="border border-accent/20 bg-accent/5 p-4 mb-4 text-[12px] text-accent/85 leading-relaxed">
              <div className="font-bold text-accent mb-1 tracking-wider">填写说明</div>
              <div className="space-y-1.5 text-foreground/85">
                <div>每个角色有 <span className="text-white">1 个天赋（被动技能）</span> + <span className="text-white">1-3 个主动技能</span>。</div>
                <div>不需要写数值（伤害百分比、能量值等），只用一句话描述<span className="text-white">效果</span>和<span className="text-white">特点</span>就行。</div>
                <div>每个技能可以上传两张图：<span className="text-white">技能图标</span>（小，方形，用于战斗时的按钮 / 卡牌图标）+ <span className="text-white">释放技能的插图</span>（大，竖图，角色释放该技能时的画面）。</div>
              </div>
            </div>

            {/* 被动 / 天赋技能 */}
            <div className="border border-amber-500/40 bg-amber-500/5 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-mono text-amber-300 tracking-widest">
                  天赋（被动技能） · 每个角色仅 1 个 <span className="text-red-400 ml-1">*</span>
                </div>
                <span className="text-[10px] text-amber-200/70 font-mono">PASSIVE</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px] gap-4">
                <div className="space-y-3">
                  <Field label="天赋名" required>
                    <Input
                      value={form.passiveSkill.name}
                      onChange={e => update("passiveSkill", { ...form.passiveSkill, name: e.target.value })}
                      placeholder="例如：暗影潜行"
                    />
                  </Field>
                  <Field label="效果描述" required hint="天赋是被动触发的，描述它带来什么效果">
                    <Textarea
                      value={form.passiveSkill.effectDescription}
                      onChange={e => update("passiveSkill", { ...form.passiveSkill, effectDescription: e.target.value })}
                      placeholder="例如：在黑雾中获得隐身效果，提高暴击率。"
                      className="min-h-[70px]"
                    />
                  </Field>
                  <Field label="技能特点" required hint="天赋的触发条件或独特机制">
                    <Textarea
                      value={form.passiveSkill.characteristic}
                      onChange={e => update("passiveSkill", { ...form.passiveSkill, characteristic: e.target.value })}
                      placeholder="例如：场上有黑雾时持续生效；每回合开始触发一次。"
                      className="min-h-[70px]"
                    />
                  </Field>
                </div>
                <ImageUpload
                  label="技能图标"
                  hint="方形 · 建议 256 × 256"
                  value={form.passiveSkill.icon}
                  onChange={file => handlePassiveImage("icon", file)}
                  onClear={() => update("passiveSkill", { ...form.passiveSkill, icon: "" })}
                  aspect="aspect-square"
                  required
                />
                <ImageUpload
                  label="释放技能的插图"
                  hint="竖图 · 建议 1024 × 1536"
                  value={form.passiveSkill.castIllustration}
                  onChange={file => handlePassiveImage("castIllustration", file)}
                  onClear={() => update("passiveSkill", { ...form.passiveSkill, castIllustration: "" })}
                  aspect="aspect-[2/3]"
                  required
                />
              </div>
            </div>

            {/* 主动技能 */}
            <div className="text-xs font-mono text-primary tracking-widest mb-2">
              主动技能 · {form.activeSkills.length}/3
            </div>
            <div className="space-y-4">
              {form.activeSkills.map((skill, idx) => (
                <div key={idx} className="border border-border bg-card/30 p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-mono text-primary tracking-widest">
                      主动技能 #{idx + 1}
                      <span className="text-red-400 ml-1">*</span>
                    </div>
                    {form.activeSkills.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeActiveSkill(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px] gap-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field label="技能名" required>
                          <Input value={skill.name} onChange={e => updateActiveSkill(idx, { name: e.target.value })} placeholder="例如：紫电瞬杀" />
                        </Field>
                        <Field label="类型" required>
                          <Select value={skill.type} onValueChange={v => updateActiveSkill(idx, { type: v as ActiveSkillForm["type"] })}>
                            <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                            <SelectContent>
                              {ACTIVE_SKILL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                      <Field label="效果描述" required hint="不需要数值，描述效果即可">
                        <Textarea
                          value={skill.effectDescription}
                          onChange={e => updateActiveSkill(idx, { effectDescription: e.target.value })}
                          placeholder="例如：对单个敌人造成较强伤害；治疗全队少量血量；为自己附加 2 回合护盾。"
                          className="min-h-[70px]"
                        />
                      </Field>
                      <Field label="技能特点" required hint="技能的独特机制 / 触发条件">
                        <Textarea
                          value={skill.characteristic}
                          onChange={e => updateActiveSkill(idx, { characteristic: e.target.value })}
                          placeholder="例如：连续使用效果递增；对生命值低于 50% 的目标额外造成伤害；命中后使敌人沉默 1 回合。"
                          className="min-h-[70px]"
                        />
                      </Field>
                    </div>
                    <ImageUpload
                      label="技能图标"
                      hint="方形 · 建议 256 × 256"
                      value={skill.icon}
                      onChange={file => handleActiveSkillImage(idx, "icon", file)}
                      onClear={() => updateActiveSkill(idx, { icon: "" })}
                      aspect="aspect-square"
                      required
                    />
                    <ImageUpload
                      label="释放技能的插图"
                      hint="竖图 · 建议 1024 × 1536"
                      value={skill.castIllustration}
                      onChange={file => handleActiveSkillImage(idx, "castIllustration", file)}
                      onClear={() => updateActiveSkill(idx, { castIllustration: "" })}
                      aspect="aspect-[2/3]"
                      required
                    />
                  </div>
                </div>
              ))}
              {form.activeSkills.length < 3 && (
                <Button type="button" variant="outline" onClick={addActiveSkill} className="w-full rounded-none border-dashed border-primary/40 text-primary hover:bg-primary/10">
                  <Plus className="mr-2 h-4 w-4" />
                  添加主动技能（最多 3 个）
                </Button>
              )}
            </div>
          </Section>

          {/* SECTION: Images */}
          <Section title="角色图片" subtitle="IMAGES · 头像 + 详情立绘 + 选择立绘（战斗状态画面在技能里上传）">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ImageUpload
                label="头像"
                hint="方形 · 建议 512 × 512"
                value={form.avatar}
                onChange={file => handleImage(file, "avatar")}
                onClear={() => update("avatar", "")}
                aspect="aspect-square"
                required
              />
              <ImageUpload
                label="详情立绘"
                hint="竖图 · 建议 1024 × 1536"
                value={form.portrait}
                onChange={file => handleImage(file, "portrait")}
                onClear={() => update("portrait", "")}
                aspect="aspect-[2/3]"
                required
              />
              <ImageUpload
                label="选择立绘"
                hint="竖图 · 建议 1024 × 1536"
                value={form.selectionPortrait}
                onChange={file => handleImage(file, "selectionPortrait")}
                onClear={() => update("selectionPortrait", "")}
                aspect="aspect-[2/3]"
                required
              />
            </div>
            <div className="mt-4 text-[11px] text-foreground/70 leading-relaxed border border-primary/20 bg-primary/5 p-3">
              <div className="text-primary font-bold mb-1 tracking-wider">说明</div>
              战斗中"释放技能"的画面已经在上方<span className="text-white">每个技能</span>里单独上传了，
              所以这一节只放<span className="text-white">头像 / 详情立绘 / 选择立绘</span>三张就够了。
              单张图片大小请控制在 4MB 以内。
              <br />
              为避免浏览器草稿空间不足，"保存草稿"只保存文字内容；最终生成的 JSON 提交文件仍会完整包含所有图片。
            </div>
          </Section>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="border border-amber-500/40 bg-amber-500/5 p-4 mb-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-amber-300 mb-1 text-sm">还有以下内容需要补充：</div>
                <ul className="text-[12px] text-amber-100/85 space-y-0.5 list-disc pl-5">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border/30">
            <div className="text-[11px] text-muted-foreground/70 font-mono">
              提交后浏览器会下载一个 JSON 文件，请发送给老师。
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" size="lg" onClick={handleSaveDraft} className="rounded-none">
                <Save className="mr-2 h-4 w-4" />
                保存草稿
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                disabled={errors.length > 0}
                className="rounded-none bg-primary hover:bg-primary/80 text-white tracking-widest glow-box border border-primary px-8"
              >
                <Download className="mr-2 h-4 w-4" />
                生成提交文件
              </Button>
            </div>
          </div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 border border-emerald-500/40 bg-emerald-500/5 p-6"
            >
              <div className="flex items-center gap-2 text-emerald-300 mb-3">
                <FileText className="h-4 w-4" />
                <span className="font-display font-bold tracking-wider">提交文件已生成 · SUBMISSION READY</span>
              </div>
              <div className="text-[12px] text-foreground/85 mb-3">
                你的浏览器应该已经下载了一个 .json 文件。如果没有，可以从下方复制内容发送给老师。
              </div>
              <Textarea
                readOnly
                value={submitted}
                className="font-mono text-[10px] min-h-[200px] bg-black/40 border-emerald-500/20"
              />
            </motion.div>
          )}

          <div className="text-[10px] text-muted-foreground/40 tracking-widest text-center font-mono mt-12 mb-6">
            — END OF SUBMISSION FORM —
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Reusable section + field components
// ───────────────────────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mb-8 border border-border/40 bg-card/20 backdrop-blur-sm"
    >
      <div className="px-6 py-4 border-b border-border/40 bg-card/30">
        <div className="text-[10px] text-primary/70 tracking-[0.3em] font-mono mb-0.5">{subtitle}</div>
        <h2 className="text-lg font-display font-bold tracking-wider text-white">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </motion.section>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[12px] text-foreground/90 font-medium tracking-wider">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        {hint && <span className="text-[10px] text-muted-foreground/60 font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TagList({ tags, onRemove, variant = "default" }: { tags: string[]; onRemove: (t: string) => void; variant?: "default" | "primary" | "danger" }) {
  if (tags.length === 0) return null;
  const styles = {
    default: "border-border/60 bg-card/40 text-foreground/85",
    primary: "border-accent/40 bg-accent/10 text-accent-foreground",
    danger: "border-red-500/40 bg-red-500/10 text-red-200",
  } as const;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags.map(t => (
        <Badge key={t} variant="outline" className={`rounded-none px-2 py-0.5 text-[11px] ${styles[variant]} flex items-center gap-1`}>
          {t}
          <button type="button" onClick={() => onRemove(t)} className="ml-0.5 opacity-60 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

function ImageUpload({
  label, hint, value, onChange, onClear, aspect, required,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (file: File | null) => void;
  onClear: () => void;
  aspect: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-2">
        <Label className="text-[12px] font-medium tracking-wider">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        <span className="text-[10px] text-muted-foreground/60 font-mono">{hint}</span>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative w-full ${aspect} border border-dashed border-border hover:border-primary/60 bg-card/30 hover:bg-card/50 transition-colors flex flex-col items-center justify-center overflow-hidden group`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Upload className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <>
            <ImageIcon className="h-7 w-7 text-muted-foreground/40 mb-2" />
            <span className="text-[11px] text-muted-foreground tracking-wider">点击上传</span>
          </>
        )}
      </button>
      <div className="flex gap-2 mt-2">
        <Button type="button" size="sm" variant="outline" className="flex-1 rounded-none text-xs" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1.5 h-3 w-3" />
          {value ? "替换" : "上传"}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" className="rounded-none text-xs text-muted-foreground hover:text-destructive" onClick={onClear}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

// Separator unused but imported keeps Section divider option open
void Separator;
