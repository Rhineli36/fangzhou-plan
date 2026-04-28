import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import coverImage from "@assets/测试用游戏封面_1777348034161.png";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0612] text-foreground">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0612] via-[#0a0612]/70 to-transparent" />
      <div className="scanlines" />

      {/* Content */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-end pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-xl tracking-[0.3em] text-primary/80 font-display font-medium">PROJECT ARK · 2025 设计 8 班</h2>
            <h1 className="text-6xl md:text-8xl font-bold tracking-wider text-white glow-text font-display">
              方舟计划
            </h1>
          </div>

          <div className="mt-12 flex flex-col items-center space-y-4">
            <Button 
              asChild
              size="lg" 
              className="h-14 px-12 text-xl font-bold tracking-widest bg-primary hover:bg-primary/80 text-white rounded-none border border-primary glow-box transition-all duration-300"
            >
              <Link href="/enemy">开始游戏</Link>
            </Button>
            <Button asChild variant="link" className="text-muted-foreground hover:text-primary transition-colors tracking-widest">
              <Link href="/prologue">序章 (剧情敬请期待)</Link>
            </Button>
            <Button asChild variant="link" className="text-muted-foreground/70 hover:text-accent transition-colors tracking-widest text-sm">
              <Link href="/create">提交我的原创角色 →</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
