import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, AlertTriangle, Skull, Eye, ShieldAlert } from "lucide-react";
import { currentBoss, enemies, setCurrentBoss } from "@/data/enemies";

const threatColor: Record<string, string> = {
  低: 'border-zinc-500/40 text-zinc-300',
  中: 'border-amber-500/40 text-amber-300',
  高: 'border-orange-500/50 text-orange-300',
  致命: 'border-red-500/60 text-red-400',
};

export default function EnemyDossier() {
  const [boss, setBoss] = useState(currentBoss);
  const bossIndex = Math.max(0, enemies.findIndex(enemy => enemy.id === boss.id));
  const previousBoss = () => {
    const next = enemies[(bossIndex - 1 + enemies.length) % enemies.length];
    setCurrentBoss(next.id);
    setBoss(next);
  };
  const nextBoss = () => {
    const next = enemies[(bossIndex + 1) % enemies.length];
    setCurrentBoss(next.id);
    setBoss(next);
  };

  return (
    <div className="min-h-screen bg-[#0a0612] text-foreground relative overflow-hidden">
      <div className="scanlines" />

      {/* Background image - faded, atmospheric */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 blur-sm"
        style={{ backgroundImage: `url(${boss.image})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0a0612] via-[#0a0612]/80 to-[#0a0612]/40" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-red-500/20 bg-[#0a0612]/80 backdrop-blur-sm">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white text-xs">
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-3 w-3" />
              返回
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-[10px] text-red-400/70 tracking-[0.3em] font-mono">
            <AlertTriangle className="h-3 w-3" />
            CLASSIFIED · THREAT BRIEFING · LEVEL S
          </div>
          <div className="text-[10px] text-muted-foreground/50 tracking-widest font-mono">
            {boss.codename}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-0">
          {/* Left: Image — full bleed for maximum presence */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative overflow-hidden border-r border-red-500/20 min-h-[60vh] lg:min-h-0"
          >
            {/* Full-bleed boss image */}
            <img
              src={boss.image}
              alt={boss.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'contrast(1.05) saturate(0.95)' }}
            />

            {/* Atmospheric overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0612] via-transparent to-[#0a0612]/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0612]/40 pointer-events-none" />
            <div className="absolute inset-0 mix-blend-overlay pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse at 40% 35%, transparent 30%, rgba(127,29,29,0.25) 100%)' }} />

            {/* Frame corner brackets */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-red-500/70 pointer-events-none" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-red-500/70 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-red-500/70 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-red-500/70 pointer-events-none" />

            {/* HUD Labels */}
            <div className="absolute top-6 left-8 text-[11px] text-red-300/90 font-mono tracking-widest bg-black/60 px-3 py-1.5 border border-red-500/40">
              ▣ TARGET LOCKED
            </div>
            <div className="absolute top-6 right-8 text-[10px] text-red-300/80 font-mono tracking-widest bg-black/60 px-3 py-1.5 border border-red-500/40 text-right">
              <div>{boss.codename}</div>
              <div className="text-[8px] text-red-400/60 mt-0.5">CONTAINMENT: FAILED</div>
            </div>

            {/* Bottom giant name overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-10 pb-10 pt-20 bg-gradient-to-t from-[#0a0612] via-[#0a0612]/70 to-transparent">
              <div className="text-[10px] text-red-300/70 tracking-[0.4em] font-mono mb-1">{boss.title}</div>
              <h2 className="text-6xl lg:text-7xl font-display font-bold text-white tracking-wider"
                style={{ textShadow: '0 0 30px rgba(220,38,38,0.5), 0 4px 12px rgba(0,0,0,0.8)' }}>
                {boss.name}
              </h2>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground/60 font-mono tracking-widest">
                <span className="w-8 h-px bg-red-500/40" />
                VISUAL RECORD · CAPTURED FROM SURVIVOR FOOTAGE
              </div>
            </div>

            {/* Vertical scan ticks */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-2 h-px bg-red-500/40" />
              ))}
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-2 h-px bg-red-500/40 ml-auto" />
              ))}
            </div>
          </motion.div>

          {/* Right: Dossier */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex flex-col"
          >
            <ScrollArea className="flex-1 px-10 py-8 font-mono">
              <div className="mb-5 flex items-center justify-between gap-3">
                <Button variant="outline" size="sm" onClick={previousBoss} className="rounded-none border-red-500/35 bg-black/40 text-red-100 hover:bg-red-500/15">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  上一份
                </Button>
                <div className="text-center text-[10px] font-mono tracking-[0.24em] text-red-300/70">
                  INVESTIGATION FILE {String(bossIndex + 1).padStart(2, "0")} / {String(enemies.length).padStart(2, "0")}
                </div>
                <Button variant="outline" size="sm" onClick={nextBoss} className="rounded-none border-red-500/35 bg-black/40 text-red-100 hover:bg-red-500/15">
                  下一份
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
              {/* Compact header — name is on the image side */}
              <div className="mb-5">
                <div className="text-[10px] text-red-400/70 tracking-[0.3em] mb-3">FILE No.{boss.id.toUpperCase()} · ENEMY DOSSIER</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/50 rounded-none text-[10px] px-2 py-0 h-5 hover:bg-red-500/30">
                    {boss.tier}
                  </Badge>
                  <Badge variant="outline" className="border-border text-[10px] rounded-none px-2 py-0 h-5">
                    HP {boss.hp}
                  </Badge>
                  <Badge variant="outline" className="border-red-500/30 text-red-200 text-[10px] rounded-none px-2 py-0 h-5">
                    {boss.threatLevel}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-red-500/20 mb-5" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6 text-[11px] border border-red-500/20 p-4 bg-red-950/10">
                <div>
                  <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">分类</div>
                  <div className="font-medium text-white">{boss.classification}</div>
                </div>
                <div>
                  <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">出没区域</div>
                  <div className="font-medium text-white">{boss.habitat}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground/70 mb-0.5 tracking-wider text-[9px] uppercase">概述</div>
                  <div className="font-medium text-white/90 leading-relaxed">{boss.description}</div>
                </div>
              </div>

              {/* Background story */}
              <div className="mb-6">
                <h3 className="text-xs font-display font-bold mb-3 flex items-center text-red-300 tracking-widest uppercase">
                  <Skull className="w-3.5 h-3.5 mr-2" />
                  起源 · ORIGIN
                </h3>
                <div className="text-foreground/80 leading-relaxed text-[12px] whitespace-pre-wrap font-serif border-l-2 border-red-500/40 pl-4">
                  {boss.backgroundStory}
                </div>
              </div>

              {/* Abilities */}
              <div className="mb-6">
                <h3 className="text-xs font-display font-bold mb-3 flex items-center text-red-300 tracking-widest uppercase">
                  <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                  已知能力 / ABILITIES
                </h3>
                <div className="space-y-2">
                  {boss.abilities.map((skill, i) => (
                    <div key={i} className="border border-border bg-card/40 p-3">
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <h4 className="font-bold text-sm text-white">{skill.name}</h4>
                        <Badge variant="outline" className={`text-[9px] h-4 px-1.5 rounded-none ${threatColor[skill.threat]}`}>
                          威胁 · {skill.threat}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mechanics */}
              <div className="mb-6">
                <h3 className="text-xs font-display font-bold mb-3 flex items-center text-red-300 tracking-widest uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 mr-2" />
                  状态与阶段 / MECHANICS
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {boss.mechanics.map((mechanic, i) => (
                    <div key={i} className="border border-red-500/20 bg-red-950/10 p-3">
                      <div className="text-[10px] text-red-200 tracking-widest mb-1">
                        {String(i + 1).padStart(2, '0')} · {mechanic.name}
                      </div>
                      <div className="text-[11px] text-foreground/80 leading-relaxed">{mechanic.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategy tips */}
              <div className="mb-6">
                <h3 className="text-xs font-display font-bold mb-3 flex items-center text-red-300 tracking-widest uppercase">
                  <Eye className="w-3.5 h-3.5 mr-2" />
                  攻略要点 / STRATEGY
                </h3>
                <ul className="space-y-2">
                  {boss.strategyTips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-foreground/80 leading-relaxed flex gap-2">
                      <span className="text-red-400/70 font-mono text-[10px] mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weakness + warning */}
              <div className="grid grid-cols-1 gap-3 mb-8">
                <div className="border border-emerald-500/30 bg-emerald-950/10 p-3">
                  <div className="text-[9px] text-emerald-300/80 tracking-widest uppercase mb-1">弱点 · WEAKNESS</div>
                  <div className="text-[11px] text-emerald-100/90 leading-relaxed">{boss.weakness}</div>
                </div>
                <div className="border border-red-500/40 bg-red-950/10 p-3">
                  <div className="text-[9px] text-red-300/80 tracking-widest uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    警告 · WARNING
                  </div>
                  <div className="text-[11px] text-red-100/90 leading-relaxed">{boss.warning}</div>
                </div>
              </div>

              <div className="text-[9px] text-muted-foreground/40 tracking-widest text-center mb-4">
                — END OF BRIEFING —
              </div>
            </ScrollArea>

            {/* Footer CTA */}
            <div className="px-10 py-4 border-t border-red-500/20 bg-[#0a0612]/90 flex items-center justify-between">
              <div className="text-[10px] text-muted-foreground/60 tracking-widest font-mono">
                选择能够针对此目标的队伍配置
              </div>
              <Button
                asChild
                className="rounded-none border border-primary bg-primary hover:bg-primary/80 text-white tracking-widest glow-box h-10 px-6"
              >
                <Link href="/team">
                  组建出击队伍
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
