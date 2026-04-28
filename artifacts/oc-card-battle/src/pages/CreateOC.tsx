import { useState, useRef, useEffect } from "react";
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
const SKILL_TYPES = ["攻击", "防御", "异能", "天赋", "恢复"] as const;
const RANGES = ["单体", "多体"] as const;
const ZODIACS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座", "未知"
];

interface SkillForm {
  name: string;
  type: typeof SKILL_TYPES[number] | "";
  description: string;
  range: typeof RANGES[number] | "";
  cost: number;
  effect: string;
  upgrade: string;
}

interface FormState {
  studentName: string;
  studentClass: string;
  studentNote: string;

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

  origin: string;
  family: string;
  pastExperiences: string;
  currentSituation: string;
  epilogue: string;

  likes: string[];
  dislikes: string[];
  favoriteColor: string;
  habits: string;
  motto: string;

  avatar: string;
  portrait: string;
  selectionPortrait: string;

  skills: SkillForm[];
}

const emptyForm: FormState = {
  studentName: "",
  studentClass: "",
  studentNote: "",

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

  likes: [],
  dislikes: [],
  favoriteColor: "",
  habits: "",
  motto: "",

  avatar: "",
  portrait: "",
  selectionPortrait: "",

  skills: [
    { name: "", type: "", description: "", range: "", cost: 0, effect: "", upgrade: "" }
  ],
};

const STORAGE_KEY = "oc-card-battle:create-oc-draft";

export default function CreateOC() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [linkInput, setLinkInput] = useState("");
  const [likeInput, setLikeInput] = useState("");
  const [dislikeInput, setDislikeInput] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const portraitRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<HTMLInputElement>(null);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setForm({ ...emptyForm, ...JSON.parse(raw) });
    } catch {/* ignore */}
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      const t = new Date().toLocaleTimeString("zh-CN");
      setSavedAt(t);
    } catch {
      alert("保存失败：浏览器存储空间可能已满（图片过大）。");
    }
  };

  const handleClearDraft = () => {
    if (!confirm("确定要清空所有内容吗？此操作不可恢复。")) return;
    localStorage.removeItem(STORAGE_KEY);
    setForm(emptyForm);
    setSavedAt(null);
    setSubmitted(null);
  };

  // Image upload helper
  const handleImage = (file: File | null, key: "avatar" | "portrait" | "selectionPortrait") => {
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

  // Skill helpers
  const addSkill = () => {
    if (form.skills.length >= 3) return;
    update("skills", [
      ...form.skills,
      { name: "", type: "", description: "", range: "", cost: 0, effect: "", upgrade: "" }
    ]);
  };
  const updateSkill = (idx: number, patch: Partial<SkillForm>) => {
    const next = [...form.skills];
    next[idx] = { ...next[idx], ...patch };
    update("skills", next);
  };
  const removeSkill = (idx: number) => {
    if (form.skills.length <= 1) return;
    update("skills", form.skills.filter((_, i) => i !== idx));
  };

  // Validation
  const errors: string[] = [];
  if (!form.studentName.trim()) errors.push("请填写创作者姓名");
  if (!form.name.trim()) errors.push("请填写角色名");
  if (!form.title.trim()) errors.push("请填写称号");
  if (!form.profession) errors.push("请选择职业");
  if (!form.backgroundStory.trim()) errors.push("请填写背景故事简述");
  if (!form.skills[0]?.name?.trim()) errors.push("至少填写 1 个技能（含技能名）");

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
        class: form.studentClass,
        note: form.studentNote,
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
          epilogue: form.epilogue || undefined,
        },
        preferences: {
          likes: form.likes.length ? form.likes : undefined,
          dislikes: form.dislikes.length ? form.dislikes : undefined,
          favoriteColor: form.favoriteColor || undefined,
          habits: form.habits || undefined,
          motto: form.motto || undefined,
        },
        skills: form.skills
          .filter(s => s.name.trim())
          .map(s => ({
            name: s.name,
            type: s.type,
            description: s.description,
            range: s.range,
            cost: s.cost,
            effect: s.effect,
            upgrade: s.upgrade,
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
    a.download = `OC_${form.name}_${form.studentName}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setSubmitted(json);
    handleSaveDraft();
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
              <span className="text-[10px] text-emerald-400/70 font-mono mr-2">已自动保存草稿 · {savedAt}</span>
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
                <div className="font-display font-bold text-lg text-primary mb-2 tracking-wider">欢迎提交你的原创角色</div>
                请按下方表单填写你的 OC 设定与图片。带 <span className="text-red-400">*</span> 的字段为必填项；其他章节可以选填，越完整越好。
                填写过程会自动保存到本地浏览器，关掉页面也能继续。
                完成后点击底部"生成提交文件"，浏览器会下载一个 .json 文件，把它发送给老师即可入库。
              </div>
            </div>
          </motion.div>

          {/* SECTION: Creator info */}
          <Section title="创作者信息" subtitle="CREATOR · 让老师知道这是谁的作品">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="创作者姓名" required>
                <Input
                  value={form.studentName}
                  onChange={e => update("studentName", e.target.value)}
                  placeholder="例如：王小明"
                />
              </Field>
              <Field label="班级 / 组别">
                <Input
                  value={form.studentClass}
                  onChange={e => update("studentClass", e.target.value)}
                  placeholder="例如：AIGC 实验班 第 3 组"
                />
              </Field>
            </div>
            <Field label="给老师的话（可选）">
              <Textarea
                value={form.studentNote}
                onChange={e => update("studentNote", e.target.value)}
                placeholder="对这个角色想补充说明的内容、设计灵感、引用的素材来源等。"
                className="min-h-[80px]"
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
              <Field label="定位 / 标签">
                <Input value={form.positioning} onChange={e => update("positioning", e.target.value)} placeholder="例如：高爆发刺客 / 重装前排" />
              </Field>
              <Field label={`生命值 HP（${form.hp}）`} hint="建议 4-6，越高越耐打">
                <Input
                  type="range" min={3} max={8} value={form.hp}
                  onChange={e => update("hp", Number(e.target.value))}
                />
              </Field>
              <Field label="性别">
                <Input value={form.gender} onChange={e => update("gender", e.target.value)} placeholder="例如：女 / 男 / 未知" />
              </Field>
              <Field label="年龄">
                <Input value={form.age} onChange={e => update("age", e.target.value)} placeholder="例如：19 / 不详" />
              </Field>
              <Field label="生日">
                <Input value={form.birthday} onChange={e => update("birthday", e.target.value)} placeholder="例如：4月14日" />
              </Field>
              <Field label="星座">
                <Select value={form.zodiac} onValueChange={v => update("zodiac", v)}>
                  <SelectTrigger><SelectValue placeholder="请选择星座" /></SelectTrigger>
                  <SelectContent>
                    {ZODIACS.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="血型">
                <Input value={form.bloodType} onChange={e => update("bloodType", e.target.value)} placeholder="例如：AB型 / 未知" />
              </Field>
            </div>

            <Field label="羁绊角色" hint="按回车添加，可填多个">
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

            <Field label="入场台词 / 选择台词">
              <Input value={form.selectionLine} onChange={e => update("selectionLine", e.target.value)} placeholder="例如：黑雾中的暗杀，无法被识别。" />
            </Field>
          </Section>

          {/* SECTION: Background story */}
          <Section title="背景故事" subtitle="BACKGROUND · 角色的身份与世界观">
            <Field label="背景故事简述" required hint="200-400 字最佳，作为简介展示">
              <Textarea
                value={form.backgroundStory}
                onChange={e => update("backgroundStory", e.target.value)}
                placeholder="简要介绍角色的身份、来历和当前处境..."
                className="min-h-[140px] font-serif"
              />
            </Field>

            <div className="border border-accent/20 bg-accent/5 p-4 mb-4 text-[11px] text-accent/80 font-mono leading-relaxed">
              下面四章为完整背景档案（选填），填得越详细，角色越立体。空着不影响提交。
            </div>

            <Field label="第一章 · 身世起源">
              <Textarea value={form.origin} onChange={e => update("origin", e.target.value)} placeholder="出生地、家庭背景、成长环境..." className="min-h-[100px] font-serif" />
            </Field>
            <Field label="第二章 · 家人">
              <Textarea value={form.family} onChange={e => update("family", e.target.value)} placeholder="父亲、母亲、兄弟姐妹、其他重要亲属..." className="min-h-[100px] font-serif" />
            </Field>
            <Field label="第三章 · 过往遭遇">
              <Textarea value={form.pastExperiences} onChange={e => update("pastExperiences", e.target.value)} placeholder="灾变前后发生的关键事件..." className="min-h-[100px] font-serif" />
            </Field>
            <Field label="第四章 · 当前状态">
              <Textarea value={form.currentSituation} onChange={e => update("currentSituation", e.target.value)} placeholder="角色现在身处何处，在做什么..." className="min-h-[100px] font-serif" />
            </Field>
            <Field label="结语 / 摘录">
              <Textarea value={form.epilogue} onChange={e => update("epilogue", e.target.value)} placeholder="一句角色的内心独白或笔记摘录..." className="min-h-[60px] font-serif" />
            </Field>
          </Section>

          {/* SECTION: Preferences */}
          <Section title="个人侧写（选填）" subtitle="PROFILE · 让角色有生活感的细节">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="喜欢的颜色">
                <Input value={form.favoriteColor} onChange={e => update("favoriteColor", e.target.value)} placeholder="例如：深紫 / 暗夜蓝" />
              </Field>
              <Field label="座右铭">
                <Input value={form.motto} onChange={e => update("motto", e.target.value)} placeholder='例如："看不见我，就是最大的善意。"' />
              </Field>
            </div>

            <Field label="喜好" hint="按回车添加，可填多个">
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

            <Field label="厌恶" hint="按回车添加，可填多个">
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

            <Field label="生活习惯">
              <Textarea value={form.habits} onChange={e => update("habits", e.target.value)} placeholder="角色的日常小动作、习惯..." className="min-h-[80px] font-serif" />
            </Field>
          </Section>

          {/* SECTION: Skills */}
          <Section title="战斗技能" subtitle={`SKILLS · 1-3 个 · 当前 ${form.skills.length} 个`}>
            <div className="space-y-4">
              {form.skills.map((skill, idx) => (
                <div key={idx} className="border border-border bg-card/30 p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-mono text-primary tracking-widest">技能 #{idx + 1}{idx === 0 && <span className="text-red-400 ml-1">*</span>}</div>
                    {form.skills.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeSkill(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="技能名" required={idx === 0}>
                      <Input value={skill.name} onChange={e => updateSkill(idx, { name: e.target.value })} placeholder="例如：紫电瞬杀" />
                    </Field>
                    <Field label="类型">
                      <Select value={skill.type} onValueChange={v => updateSkill(idx, { type: v as SkillForm["type"] })}>
                        <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                        <SelectContent>
                          {SKILL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="作用范围">
                      <Select value={skill.range} onValueChange={v => updateSkill(idx, { range: v as SkillForm["range"] })}>
                        <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                        <SelectContent>
                          {RANGES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="能量消耗" hint="0 = 天赋/被动；1-4 = 主动技能">
                      <Input type="number" min={0} max={6} value={skill.cost} onChange={e => updateSkill(idx, { cost: Number(e.target.value) })} />
                    </Field>
                  </div>
                  <Field label="技能描述（叙述向）">
                    <Textarea value={skill.description} onChange={e => updateSkill(idx, { description: e.target.value })} placeholder="例如：化作紫色闪电穿透敌人，造成巨额物理与能量混合伤害。" className="min-h-[60px]" />
                  </Field>
                  <Field label="数值效果" hint="实际生效的数据">
                    <Input value={skill.effect} onChange={e => updateSkill(idx, { effect: e.target.value })} placeholder="例如：造成 250% 攻击力的伤害" />
                  </Field>
                  <Field label="进阶效果">
                    <Input value={skill.upgrade} onChange={e => updateSkill(idx, { upgrade: e.target.value })} placeholder="例如：若击杀目标，返还 2 点能量" />
                  </Field>
                </div>
              ))}
              {form.skills.length < 3 && (
                <Button type="button" variant="outline" onClick={addSkill} className="w-full rounded-none border-dashed border-primary/40 text-primary hover:bg-primary/10">
                  <Plus className="mr-2 h-4 w-4" />
                  添加技能（最多 3 个）
                </Button>
              )}
            </div>
          </Section>

          {/* SECTION: Images */}
          <Section title="图片上传" subtitle="IMAGES · 推荐尺寸如下">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImageUpload
                label="头像"
                hint="256 × 256，PNG"
                value={form.avatar}
                onChange={file => handleImage(file, "avatar")}
                onClear={() => update("avatar", "")}
                inputRef={avatarRef}
                aspect="aspect-square"
              />
              <ImageUpload
                label="立绘（详情页）"
                hint="1024 × 1536，PNG"
                value={form.portrait}
                onChange={file => handleImage(file, "portrait")}
                onClear={() => update("portrait", "")}
                inputRef={portraitRef}
                aspect="aspect-[2/3]"
              />
              <ImageUpload
                label="选择立绘"
                hint="1024 × 1536，PNG"
                value={form.selectionPortrait}
                onChange={file => handleImage(file, "selectionPortrait")}
                onClear={() => update("selectionPortrait", "")}
                inputRef={selectionRef}
                aspect="aspect-[2/3]"
              />
            </div>
            <div className="mt-4 text-[11px] text-muted-foreground/70 font-mono leading-relaxed border border-border/40 p-3 bg-card/20">
              图片大小请控制在 4MB 以内。如果暂时没有图，可以先空着提交，后续补充。
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
  label, hint, value, onChange, onClear, inputRef, aspect,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (file: File | null) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  aspect: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-2">
        <Label className="text-[12px] font-medium tracking-wider">{label}</Label>
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
