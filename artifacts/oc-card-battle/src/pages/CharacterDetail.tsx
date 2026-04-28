import { useState } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { characters } from "@/data/characters";
import { ArrowLeft, BookOpen, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";

export default function CharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const char = characters.find(c => c.id === id);
  const [storyOpen, setStoryOpen] = useState(false);

  if (!char) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#0a0612] text-foreground flex relative overflow-hidden">
      <div className="scanlines" />

      {/* Left Panel: Details — dossier feel */}
      <div className="w-1/2 h-screen border-r border-border/50 bg-background/95 backdrop-blur-md z-10 flex flex-col font-mono">
        <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b border-border/30">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white group -ml-2 text-xs h-7">
            <Link href="/team">
              <ArrowLeft className="mr-1.5 h-3 w-3 transition-transform group-hover:-translate-x-1" />
              返回编队
            </Link>
          </Button>
          <div className="text-[10px] text-primary/40 tracking-widest font-mono">
            DOSSIER · ID: {char.id.toUpperCase()}
          </div>
        </div>

        <ScrollArea className="flex-1 px-10 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="text-[10px] text-muted-foreground tracking-[0.3em] mb-2 font-mono">FILE No.{char.id.toUpperCase()}</div>
            <div className="text-primary font-medium tracking-widest mb-1 text-xs">{char.title}</div>
            <h1 className="text-4xl font-bold font-display tracking-wider mb-3 glow-text">{char.name}</h1>
            <div className="flex flex-wrap gap-1.5">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/50 rounded-none px-2 py-0 text-[10px] h-5">
                {char.profession}
              </Badge>
              <Badge variant="secondary" className="rounded-none px-2 py-0 text-[10px] h-5 bg-secondary text-secondary-foreground">
                {char.positioning}
              </Badge>
              <Badge variant="outline" className="rounded-none px-2 py-0 text-[10px] h-5 border-border">
                HP {char.hp}/{char.hp}
              </Badge>
            </div>
          </div>

          <Separator className="bg-border/50 mb-6" />

          {/* Stats Grid — compact dossier feel */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-3 mb-6 text-[11px] border border-border/40 p-4 bg-card/30">
            <div>
              <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">性别</div>
              <div className="font-medium text-white">{char.gender}</div>
            </div>
            <div>
              <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">年龄</div>
              <div className="font-medium text-white">{char.age}</div>
            </div>
            <div>
              <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">星座</div>
              <div className="font-medium text-white">{char.zodiac ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">生日</div>
              <div className="font-medium text-white">{char.birthday}</div>
            </div>
            <div>
              <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">血型</div>
              <div className="font-medium text-white">{char.bloodType}</div>
            </div>
            <div>
              <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">定位</div>
              <div className="font-medium text-white">{char.positioning}</div>
            </div>
          </div>

          {/* Links */}
          <div className="mb-6">
            <div className="text-muted-foreground/70 text-[9px] mb-2 tracking-widest uppercase">羁绊档案</div>
            <div className="flex flex-wrap gap-1.5">
              {char.linkedCharacters.length > 0 ? char.linkedCharacters.map((name, i) => (
                <span key={i} className="text-[11px] border border-border/50 px-2 py-0.5 bg-card text-card-foreground">
                  {name}
                </span>
              )) : (
                <span className="text-[11px] text-muted-foreground/60 italic">无羁绊记录</span>
              )}
            </div>
          </div>

          {/* Background Story Button */}
          <div className="mb-8">
            <Button
              variant="outline"
              className="w-full rounded-none border-primary/40 bg-primary/5 hover:bg-primary/15 hover:border-primary text-primary text-xs h-10 tracking-widest font-mono"
              onClick={() => setStoryOpen(true)}
            >
              <BookOpen className="mr-2 h-3.5 w-3.5" />
              展开背景故事
            </Button>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xs font-display font-bold mb-4 flex items-center text-primary tracking-widest uppercase">
              <span className="w-2.5 h-2.5 bg-primary mr-2 block"></span>
              战斗技能 / SKILLS
            </h3>
            <div className="space-y-3">
              {char.skills.map((skill, index) => (
                <div key={index} className="bg-card/40 border border-border p-3 hover:border-primary/50 transition-colors">
                  <div className="flex gap-3">
                    {/* Skill Icon Placeholder */}
                    <div className="w-12 h-12 bg-secondary flex-shrink-0 flex items-center justify-center border border-border/50 text-muted-foreground text-[10px] tracking-wider">
                      {skill.type}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-white">{skill.name}</h4>
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/30 text-primary/80 rounded-none">
                            {skill.range}
                          </Badge>
                        </div>
                        {skill.cost > 0 && (
                          <div className="text-[10px] font-mono text-accent whitespace-nowrap">
                            消耗 {skill.cost} EN
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                        {skill.description}
                      </p>
                      <div className="text-[11px] text-white bg-secondary/40 p-1.5 border-l-2 border-primary mb-1.5">
                        {skill.effect}
                      </div>
                      <div className="text-[10px] text-accent italic">
                        进阶: {skill.upgrade}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-4 border-t border-border/30 text-[9px] text-muted-foreground/40 tracking-widest text-center font-mono">
            — END OF FILE —
          </div>
        </ScrollArea>
      </div>

      {/* Background Story Dialog */}
      <Dialog open={storyOpen} onOpenChange={setStoryOpen}>
        <DialogContent
          className="max-w-3xl bg-[#0a0612]/98 border border-primary/40 rounded-none p-0 overflow-hidden [&>button]:hidden"
        >
          <DialogTitle className="sr-only">{char.name} 的背景故事</DialogTitle>
          <div className="relative">
            <div className="scanlines opacity-40" />
            <div className="px-10 pt-8 pb-4 border-b border-primary/20 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-primary/60 tracking-[0.3em] mb-1 font-mono">CLASSIFIED · BACKGROUND</div>
                <div className="text-primary text-xs tracking-widest font-mono">{char.title}</div>
                <h2 className="text-3xl font-display font-bold tracking-wider mt-1 glow-text">{char.name}</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-white"
                onClick={() => setStoryOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="max-h-[60vh] px-10 py-6">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-foreground/85 leading-loose space-y-4 whitespace-pre-wrap font-serif text-[15px]"
                >
                  {char.backgroundStory}
                </motion.div>
              </AnimatePresence>
            </ScrollArea>
            <div className="px-10 py-3 border-t border-primary/20 text-[10px] text-muted-foreground/50 tracking-widest font-mono text-center">
              — END OF RECORD —
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Right Panel: Portrait */}
      <div className="w-1/2 h-screen relative flex items-center justify-center bg-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        
        {char.portrait ? (
          <img 
            src={char.portrait} 
            alt={char.name} 
            className="max-h-full max-w-full object-contain p-8 drop-shadow-2xl z-10"
            style={{ filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.3))" }}
          />
        ) : (
          <div className="w-2/3 h-2/3 bg-gradient-to-t from-primary/20 to-transparent flex flex-col items-center justify-center z-10 border border-primary/20">
            <span className="text-6xl font-display font-bold text-primary/30 tracking-widest mb-4">{char.profession}</span>
            <span className="text-xl text-muted-foreground/50 tracking-widest">NO IMAGE DATA</span>
          </div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute top-12 right-12 text-right font-mono text-primary/30 text-xs hidden lg:block">
          <div>ID: {char.id.toUpperCase()}</div>
          <div>STATUS: ACTIVE</div>
          <div>LOC: UNKNOWN</div>
        </div>
        <div className="absolute bottom-12 right-12 text-right font-display text-primary/10 text-8xl font-bold uppercase tracking-tighter mix-blend-overlay">
          {char.profession}
        </div>
      </div>
    </div>
  );
}
