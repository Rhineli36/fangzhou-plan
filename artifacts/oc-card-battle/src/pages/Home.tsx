import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import coverImage from "@assets/game_cover.png";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0612] text-foreground">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0612] via-[#0a0612]/70 to-transparent" />
      <div className="scanlines" />

      <div className="relative z-20 flex min-h-screen flex-col items-center justify-end pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="space-y-2">
            <h2 className="font-display text-xl font-medium tracking-[0.3em] text-primary/80">
              PROJECT ARK · 2025 设计 8 班
            </h2>
            <p className="text-sm tracking-[0.18em] text-white/65">
              指导教师：李路　数字与影像艺术课程作业
            </p>
            <h1 className="glow-text font-display text-6xl font-bold tracking-wider text-white md:text-8xl">
              方舟计划
            </h1>
          </div>

          <div className="mt-12 flex flex-col items-center space-y-4">
            <Button
              asChild
              size="lg"
              className="glow-box h-14 rounded-none border border-primary bg-primary px-12 text-xl font-bold tracking-widest text-white transition-all duration-300 hover:bg-primary/80"
            >
              <Link href="/prologue">开始游戏</Link>
            </Button>
            <Button asChild variant="link" className="tracking-widest text-muted-foreground transition-colors hover:text-primary">
              <Link href="/enemy">调查档案</Link>
            </Button>
            <Button asChild variant="link" className="text-sm tracking-widest text-muted-foreground/70 transition-colors hover:text-accent">
              <Link href="/create">提交我的原创角色 →</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
