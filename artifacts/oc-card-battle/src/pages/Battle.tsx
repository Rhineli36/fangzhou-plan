import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code } from "lucide-react";
import { motion } from "framer-motion";

export default function Battle() {
  return (
    <div className="min-h-screen bg-[#0a0612] text-foreground flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="scanlines" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-[#0a0612] to-[#0a0612] opacity-50" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center flex flex-col items-center"
      >
        <div className="w-24 h-24 mb-8 flex items-center justify-center border-2 border-primary rounded-full bg-card/50 text-primary glow-box">
          <Code className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-widest mb-4 glow-text">
          战斗系统开发中
        </h1>
        <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto">
          核心战斗模块正在进行超维演算，即将部署到主网，敬请期待。
        </p>
        
        <Button asChild variant="outline" className="h-12 px-8 text-lg border-primary text-primary hover:bg-primary hover:text-white rounded-none glow-box transition-all">
          <Link href="/team">
            <ArrowLeft className="mr-2" /> 返回战前准备
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
