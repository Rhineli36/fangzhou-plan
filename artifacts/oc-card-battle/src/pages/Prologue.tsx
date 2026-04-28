import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Prologue() {
  return (
    <div className="min-h-screen bg-[#0a0612] text-foreground flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="scanlines" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center flex flex-col items-center"
      >
        <BookOpen className="w-16 h-16 text-muted-foreground mb-6 opacity-50" />
        <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-widest mb-12">
          序章敬请期待
        </h1>
        
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-white">
          <Link href="/">
            <ArrowLeft className="mr-2" /> 返回主界面
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
