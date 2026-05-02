import { useState } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { characters } from "@/data/characters";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  FolderOpen,
  Gamepad2,
  Heart,
  Lock,
  MessageSquareQuote,
  Quote,
  Shield,
  Sword,
  User2,
  Volume2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import NotFound from "@/pages/not-found";
import { getCharacterAlias, getCharacterDisplayName } from "@/lib/characterName";
import { SkillDiscardHint, SkillStatusHints, StatusGlossaryButton, StatusTermText } from "@/components/StatusGlossary";
import { getTalentStatusIconOverrides } from "@/data/statusCatalog";

type DetailTab = "profile" | "equipment" | "voice";
type ProfileView = "dossier" | "archive";

const tabs: Array<{ id: DetailTab; label: string; sub: string; icon: typeof FolderOpen }> = [
  { id: "profile", label: "档案", sub: "PROFILE", icon: FolderOpen },
  { id: "equipment", label: "装备", sub: "EQUIPMENT", icon: Sword },
  { id: "voice", label: "语音", sub: "VOICE", icon: Volume2 },
];

export default function CharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const char = characters.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState<DetailTab>("profile");
  const [profileView, setProfileView] = useState<ProfileView>("dossier");
  const [storyOpen, setStoryOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);

  if (!char || char.locked) return <NotFound />;

  const ext = char.extendedBackground;
  const pref = char.preferences;
  const creator = char.creator;
  const displayName = getCharacterDisplayName(char.name);
  const alias = getCharacterAlias(char.name);
  const statusIconOverrides = getTalentStatusIconOverrides(char.skills.find(skill => skill.type === "天赋")?.icon || char.avatar);

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f2ff] text-[#22183d]">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#ffffff_0%,#f7f4ff_42%,#ece7ff_42%,#ffffff_73%,#d8cff8_73%,#f7f4ff_100%)]" />
        <div className="absolute inset-0 opacity-55 bg-[radial-gradient(circle_at_72%_12%,rgba(120,86,210,0.28),transparent_28%),radial-gradient(circle_at_20%_82%,rgba(45,148,172,0.16),transparent_30%)]" />
        <div className="absolute right-0 top-0 h-full w-[48%] bg-[#5b40a8]/10 [clip-path:polygon(26%_0,100%_0,100%_100%,0_100%)]" />
        <div className="absolute bottom-8 right-12 select-none text-[16rem] font-black leading-none text-[#6a52c8]/10">
          {char.id === "test-01" ? "01" : char.creator?.studentId?.slice(-2) ?? "OC"}
        </div>

        <div className="relative z-10 flex min-h-screen">
          <aside className="flex w-[104px] shrink-0 flex-col border-r border-[#6a52c8]/15 bg-white/55 shadow-[10px_0_40px_rgba(84,67,160,0.08)] backdrop-blur">
            <Button asChild variant="ghost" className="m-3 h-10 justify-start px-2 text-[#332653] hover:bg-[#ece7ff]">
              <Link href="/team">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                返回
              </Link>
            </Button>
            <div className="mt-4 flex flex-1 flex-col items-stretch gap-2 px-3">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== "profile") setProfileView("dossier");
                    }}
                    className={`flex min-h-20 flex-col items-center justify-center border px-2 py-3 text-center transition ${
                      selected
                        ? "border-[#7b4ded] bg-[#7b4ded] text-white shadow-[0_12px_30px_rgba(103,72,202,0.28)]"
                        : "border-transparent bg-white/40 text-[#6d6380] hover:border-[#7b4ded]/25 hover:bg-white"
                    }`}
                  >
                    <Icon className="mb-2 h-5 w-5" />
                    <span className="text-sm font-bold">{tab.label}</span>
                    <span className={`mt-0.5 text-[9px] ${selected ? "text-white/70" : "text-[#8a7ba7]"}`}>{tab.sub}</span>
                  </button>
                );
              })}
            </div>
            <div className="pb-6 text-center text-[10px] text-[#7a6d98] [writing-mode:vertical-rl] mx-auto">
              CHARACTER FILE
            </div>
          </aside>

          <main className="grid min-h-screen flex-1 grid-cols-[minmax(520px,0.95fr)_minmax(440px,1.05fr)]">
            <section className="relative z-20 flex h-screen flex-col px-12 py-8">
              <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                  <div className="mb-2 font-mono text-xs text-[#31284b]">FILE No.{char.id.toUpperCase()}</div>
                  <div className="mb-2 text-sm font-bold text-[#6d4bd4]">{char.title}</div>
                  <h1 className="text-6xl font-black leading-none text-[#25153e] drop-shadow-[0_8px_22px_rgba(104,82,189,0.18)]">
                    {displayName}
                  </h1>
                  {alias && <div className="mt-2 font-mono text-xs font-bold tracking-[0.22em] text-[#7a6d98]">ALIAS / {alias}</div>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className="rounded-none border-[#7b4ded] bg-[#7b4ded] px-4 py-1 text-sm text-white">
                      {char.profession}
                    </Badge>
                    <Badge className="rounded-none border-[#211c32] bg-[#211c32] px-4 py-1 text-sm text-white">
                      {char.positioning}
                    </Badge>
                    <Badge className="rounded-none border-[#211c32] bg-[#211c32] px-4 py-1 text-sm text-white">
                      HP {char.hp}/{char.hp}
                    </Badge>
                  </div>
                </div>

                {creator && (
                  <div className="relative w-[294px]">
                    <button
                      type="button"
                      onClick={() => setCreatorOpen(open => !open)}
                      className={`flex w-full items-center gap-3 border bg-white/75 p-2 text-left shadow-[0_12px_28px_rgba(62,45,123,0.08)] transition ${
                        creatorOpen ? "border-[#7b4ded]/70" : "border-[#7b4ded]/25 hover:border-[#7b4ded]/60"
                      }`}
                    >
                      {creator.avatar ? (
                        <img src={creator.avatar} alt={creator.name} className="h-12 w-12 object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center bg-[#ede8ff]">
                          <User2 className="h-5 w-5 text-[#7b4ded]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-[#8b7fac]">CREATOR</div>
                        <div className="truncate text-sm font-black text-[#231a37]">{creator.name}</div>
                      </div>
                    </button>

                    {creatorOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-50 w-full border border-[#7b4ded]/35 bg-white/95 p-4 text-left shadow-[0_18px_44px_rgba(62,45,123,0.16)] backdrop-blur"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[10px] font-black tracking-[0.22em] text-[#7b4ded]">CREATOR PROFILE</div>
                            <div className="mt-1 text-lg font-black text-[#231a37]">{creator.name}</div>
                            <div className="mt-1 text-xs leading-relaxed text-[#6d6380]">
                              学号：{creator.studentId}
                              {creator.className && <><br />班级：{creator.className}</>}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#7c7195]" onClick={() => setCreatorOpen(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {creator.messageToCharacter && (
                          <div className="mb-3 border-l-4 border-[#7b4ded] bg-[#f3efff] px-3 py-2 font-serif text-xs leading-relaxed text-[#43365e]">
                            <div className="mb-1 flex items-center gap-1.5 font-sans text-[10px] font-bold text-[#6d4bd4]">
                              <MessageSquareQuote className="h-3.5 w-3.5" />
                              想对 {displayName} 说的话
                            </div>
                            {creator.messageToCharacter}
                          </div>
                        )}
                        {creator.proposedGameName && (
                          <div className="border border-[#d8d1ef] bg-[#fbfaff] px-3 py-2 text-xs text-[#43365e]">
                            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-[#6d4bd4]">
                              <Gamepad2 className="h-3.5 w-3.5" />
                              为游戏起的名字
                            </div>
                            {creator.proposedGameName}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <ScrollArea className="min-h-0 flex-1 pr-3">
                {activeTab === "profile" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {profileView === "dossier" ? (
                    <>
                    <section className="border border-[#d8d1ef] bg-white/78 p-5 shadow-[0_18px_42px_rgba(64,47,118,0.08)]">
                      <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <Info label="性别" value={char.gender} />
                        <Info label="年龄" value={char.age} />
                        <Info label="星座" value={char.zodiac} />
                        <Info label="生日" value={char.birthday} />
                        <Info label="血型" value={char.bloodType} />
                        <Info label="定位" value={char.positioning} />
                      </div>

                      <div className="mt-5 border-t border-[#d8d1ef] pt-4">
                        <div className="mb-2 text-xs font-bold text-[#59497a]">羁绊标签</div>
                        <div className="flex flex-wrap gap-2">
                          {char.linkedCharacters.length > 0 ? (
                            char.linkedCharacters.map(name => (
                              <span key={name} className="border border-[#d8d1ef] bg-[#f5f1ff] px-3 py-1 text-xs font-medium text-[#31284b]">
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#8a7ba7]">无羁绊记录</span>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        onClick={() => setStoryOpen(true)}
                        className="h-14 rounded-none border border-[#7b4ded] bg-[#7b4ded] text-white shadow-[0_12px_24px_rgba(103,72,202,0.24)] hover:bg-[#6f41de]"
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        背景故事
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setProfileView("archive")}
                        className="h-14 rounded-none border border-[#211c32] bg-[#211c32] text-white hover:bg-[#342b4b]"
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        完整背景档案
                      </Button>
                    </section>

                    {pref && (
                      <section className="border border-[#d8d1ef] bg-white/70 p-5">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-[#256b89]">
                          <Heart className="h-4 w-4" />
                          附录 · 个人侧写 / PROFILE
                        </h2>
                        <div className="space-y-3 text-sm">
                          {pref.favoriteColor && <InfoWide label="喜欢的颜色" value={pref.favoriteColor} />}
                          {pref.likes && pref.likes.length > 0 && <TagRow label="喜好" tags={pref.likes} color="cyan" />}
                          {pref.dislikes && pref.dislikes.length > 0 && <TagRow label="厌恶" tags={pref.dislikes} color="red" />}
                          {pref.habits && <InfoWide label="习惯" value={pref.habits} />}
                          {pref.motto && (
                            <div className="grid grid-cols-[96px_1fr] gap-4">
                              <div className="text-xs text-[#7c7195]">座右铭</div>
                              <div className="flex gap-2 font-serif italic text-[#43365e]">
                                <Quote className="mt-1 h-4 w-4 shrink-0 text-[#2d93b2]" />
                                {pref.motto}
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    <section className="border border-[#d8d1ef] bg-white/78 p-5 shadow-[0_18px_42px_rgba(64,47,118,0.08)]">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-sm font-black text-[#6d4bd4]">战斗技能 / SKILLS</h2>
                        <StatusGlossaryButton className="h-8 border-[#7b4ded]/35 bg-white/70 px-3 text-xs text-[#6d4bd4] hover:bg-[#ece7ff]" />
                      </div>
                      <div className="space-y-3">
                        {char.skills.map((skill, index) => (
                          <div key={`${skill.name}-${index}`} className="grid grid-cols-[64px_1fr] gap-4 border border-[#e1daf4] bg-[#fbfaff] p-3">
                            <div className="relative h-16 w-16 overflow-hidden border-2 border-[#8c61f0] bg-[#211c32] shadow-[0_0_24px_rgba(123,77,237,0.22)]">
                              {skill.icon ? (
                                <img src={skill.icon} alt={skill.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#7b4ded] text-xs font-bold text-white">{skill.type}</div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 bg-[#211c32]/82 py-0.5 text-center text-[9px] font-bold text-white">
                                {skill.type}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="mb-1 flex items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-black text-[#211c32]">{skill.name}</h3>
                                  <Badge className="rounded-none bg-[#ece7ff] text-[#6d4bd4] hover:bg-[#ece7ff]">{skill.range}</Badge>
                                </div>
                                {skill.cost > 0 && <span className="text-xs font-bold text-[#7b4ded]">消耗 {skill.cost} EN</span>}
                              </div>
                              <p className="text-sm leading-relaxed text-[#5d526f]">
                                <StatusTermText text={skill.description} iconOverrides={statusIconOverrides} />
                              </p>
                              <div className="mt-2 border-l-4 border-[#7b4ded] bg-[#f0ecff] px-3 py-1 text-sm text-[#342b4b]">
                                <StatusTermText text={skill.effect} iconOverrides={statusIconOverrides} />
                              </div>
                              {skill.upgrade && (
                                <div className="mt-1 text-xs font-bold text-[#2d93b2]">
                                  进阶：<StatusTermText text={skill.upgrade} iconOverrides={statusIconOverrides} />
                                </div>
                              )}
                              <SkillStatusHints texts={[skill.description, skill.effect, skill.upgrade]} className="mt-2" iconOverrides={statusIconOverrides} />
                              <SkillDiscardHint skill={skill} className="mt-2 border-yellow-400 bg-yellow-200/45 text-[#5a3b00]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                    </>
                    ) : (
                        <ArchivePanel charName={displayName} ext={ext} onBack={() => setProfileView("dossier")} />
                    )}
                  </motion.div>
                )}

                {activeTab === "equipment" && <LockedPanel icon={Sword} title="装备档案" />}
                {activeTab === "voice" && <LockedPanel icon={Volume2} title="语音记录" />}
              </ScrollArea>
            </section>

            <section className="relative h-screen overflow-hidden">
              <div className="absolute right-10 top-12 text-right">
                <div className="text-2xl font-black text-[#6d4bd4]/50">{displayName.toUpperCase()}</div>
                <div className="mt-1 text-xs font-bold text-[#7a6d98]">{char.title}</div>
              </div>

              <div className="absolute inset-x-0 bottom-0 top-8 flex items-end justify-center">
                {char.portrait ? (
                  <img
                    src={char.portrait}
                    alt={displayName}
                    className="relative z-10 max-h-[96vh] max-w-[88%] object-contain drop-shadow-[0_30px_60px_rgba(48,36,95,0.28)]"
                  />
                ) : (
                  <div className="mb-24 flex h-[62vh] w-[52%] items-center justify-center border border-[#7b4ded]/20 bg-white/45 text-4xl font-black text-[#7b4ded]/30">
                    {char.profession}
                  </div>
                )}
              </div>

              <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                {[Shield, Sword, BookOpen, Volume2].map((Icon, index) => (
                  <div key={index} className="flex h-10 w-10 items-center justify-center border border-[#6a52c8]/20 bg-white/55 text-[#6d4bd4]">
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <TextDialog
        open={storyOpen}
        onOpenChange={setStoryOpen}
        title={`${displayName} · 背景故事`}
        subtitle={char.title}
        body={char.backgroundStory}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[52px_1fr] gap-2">
      <span className="text-xs font-bold text-[#7c7195]">{label}</span>
      <span className="font-bold text-[#302544]">{value || "—"}</span>
    </div>
  );
}

function InfoWide({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4">
      <div className="text-xs text-[#7c7195]">{label}</div>
      <div className="leading-relaxed text-[#43365e]">{value}</div>
    </div>
  );
}

function TagRow({ label, tags, color }: { label: string; tags: string[]; color: "cyan" | "red" }) {
  const style = color === "cyan" ? "border-[#2d93b2] bg-[#eaf8fc] text-[#256b89]" : "border-[#a24862] bg-[#fff0f4] text-[#80324b]";
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4">
      <div className="text-xs text-[#7c7195]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className={`border px-3 py-1 text-xs ${style}`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function LockedPanel({ icon: Icon, title }: { icon: typeof Lock; title: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[520px] items-center justify-center border border-[#d8d1ef] bg-white/65">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ede8ff] text-[#7b4ded]">
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-xl font-black text-[#302544]">{title}</div>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[#8a7ba7]">
          <Lock className="h-4 w-4" />
          DATA LOCKED
        </div>
      </div>
    </motion.div>
  );
}

function TextDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  body,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  body: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] max-w-3xl rounded-none border-[#d8d1ef] bg-white p-0 text-[#22183d] [&>button]:hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex items-center justify-between border-b border-[#d8d1ef] px-8 py-5">
          <div>
            <div className="text-xs font-bold text-[#7b4ded]">{subtitle}</div>
            <h2 className="text-2xl font-black">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="max-h-[62vh] px-8 py-6">
          <div className="whitespace-pre-wrap font-serif text-base leading-loose text-[#43365e]">{body}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function ArchivePanel({
  charName,
  ext,
  onBack,
}: {
  charName: string;
  ext?: {
    origin?: string;
    family?: string;
    pastExperiences?: string;
    currentSituation?: string;
    epilogue?: string;
  };
  onBack: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="border border-[#d8d1ef] bg-white/76 shadow-[0_18px_42px_rgba(64,47,118,0.08)]"
    >
      <div className="flex items-center justify-between border-b border-[#d8d1ef] px-5 py-4">
        <div>
          <div className="text-[10px] font-bold tracking-[0.25em] text-[#7b4ded]">FULL BACKGROUND ARCHIVES</div>
          <h2 className="mt-1 text-2xl font-black text-[#25153e]">{charName} · 完整背景档案</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="rounded-none text-[#6d6380] hover:bg-[#ece7ff] hover:text-[#25153e]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回基础档案
        </Button>
      </div>

      <div className="space-y-7 px-6 py-6">
        <div className="border border-[#d8d1ef] bg-[#f8f5ff] px-4 py-3 text-xs leading-relaxed text-[#6d6380]">
          以下记录由调查者整合自角色设定、访谈与残存档案。结局故事目前为测试期可见，正式版将改为通关后解锁。
        </div>
        <ArchiveSection title="第一章 · 身世起源 / ORIGIN" text={ext?.origin} />
        <ArchiveSection title="第二章 · 家人 / FAMILY" text={ext?.family} />
        <ArchiveSection title="第三章 · 过往遭遇 / PAST" text={ext?.pastExperiences} />
        <ArchiveSection title="第四章 · 当前状态 / PRESENT" text={ext?.currentSituation} />
        <ArchiveSection title="结局故事 / EPILOGUE" text={ext?.epilogue} accent />
        {!ext && (
          <div className="py-16 text-center text-sm font-bold tracking-widest text-[#8a7ba7]">
            此角色暂无完整背景档案
          </div>
        )}
      </div>
    </motion.section>
  );
}

function ArchiveSection({ title, text, accent }: { title: string; text?: string; accent?: boolean }) {
  if (!text) return null;
  return (
    <section className={accent ? "border-t border-[#d8d1ef] pt-5" : ""}>
      <h3 className="mb-2 text-sm font-black text-[#6d4bd4]">{title}</h3>
      <div className={`whitespace-pre-wrap font-serif leading-loose ${accent ? "text-center text-[#256b89]" : "text-[#43365e]"}`}>
        {text}
      </div>
    </section>
  );
}
