import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { characters, Character } from "@/data/characters";
import { useTeamStore } from "@/store/teamStore";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TeamSelection() {
  const { selectedCharacterIds, addCharacter, removeCharacter } = useTeamStore();
  const [viewedCharId, setViewedCharId] = useState<string>(characters[0].id);
  const [overlayChar, setOverlayChar] = useState<Character | null>(null);

  const viewedChar = characters.find(c => c.id === viewedCharId)!;
  const isViewedSelected = selectedCharacterIds.includes(viewedCharId);
  const isTeamFull = selectedCharacterIds.length >= 3;

  const handleSelectClick = () => {
    if (!isViewedSelected && !isTeamFull) {
      setOverlayChar(viewedChar);
    }
  };

  const confirmSelection = () => {
    if (overlayChar) {
      addCharacter(overlayChar.id);
      setOverlayChar(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0612] text-foreground p-6 flex flex-col relative overflow-hidden">
      <div className="scanlines" />
      
      {/* Header / Back */}
      <div className="z-10 flex justify-between items-center mb-6">
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-white group">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            返回
          </Link>
        </Button>
      </div>

      {/* Team Slots */}
      <div className="z-10 flex flex-col items-center justify-center mb-8">
        <div className="flex gap-4">
          {[0, 1, 2].map((index) => {
            const charId = selectedCharacterIds[index];
            const char = characters.find(c => c.id === charId);
            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="w-24 h-24 border border-border bg-card flex items-center justify-center relative overflow-hidden group">
                  {char ? (
                    <>
                      {char.avatar ? (
                        <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                          {char.name[0]}
                        </div>
                      )}
                      <div className="absolute bottom-0 w-full bg-black/80 text-center text-xs py-1 font-medium tracking-wider">
                        {char.name}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground opacity-50">
                      <Plus className="h-6 w-6 mb-1" />
                      <span className="text-xs">空位</span>
                    </div>
                  )}
                </div>
                {char && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs bg-transparent border-border hover:bg-destructive/20 hover:text-destructive hover:border-destructive transition-colors"
                    onClick={() => removeCharacter(char.id)}
                  >
                    更换
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Start Battle Button - only shows when team is full */}
        <AnimatePresence>
          {isTeamFull && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              <Button asChild className="h-12 px-10 bg-primary hover:bg-primary/80 text-white font-bold tracking-widest text-lg glow-box rounded-none border border-primary">
                <Link href="/battle">开始你的战斗</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="z-10 flex-1 flex gap-8 max-w-6xl mx-auto w-full">
        {/* Left: Avatar Grid */}
        <div className="w-1/3 border-r border-border/50 pr-8">
          <div className="grid grid-cols-4 gap-3">
            {characters.map((char) => {
              const isSelected = selectedCharacterIds.includes(char.id);
              const isViewed = char.id === viewedCharId;
              
              return (
                <div 
                  key={char.id}
                  onClick={() => setViewedCharId(char.id)}
                  className={`
                    relative aspect-square cursor-pointer border transition-all duration-300
                    ${isViewed ? 'border-primary glow-box scale-105 z-10' : 'border-border/50 hover:border-primary/50'}
                    ${isSelected ? 'opacity-50' : 'opacity-100'}
                  `}
                >
                  {char.avatar ? (
                    <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {char.name[0]}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Character Info & Portrait */}
        <div className="w-2/3 flex flex-col justify-end relative h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={viewedChar.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex justify-end items-end"
            >
              {viewedChar.portrait ? (
                <img 
                  src={viewedChar.portrait} 
                  alt={viewedChar.name} 
                  className="h-full object-contain object-right-bottom drop-shadow-2xl"
                  style={{ filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.2))" }}
                />
              ) : (
                <div className="h-full w-2/3 bg-gradient-to-t from-primary/20 to-transparent flex items-end justify-center pb-20">
                  <span className="text-4xl font-display font-bold text-primary/30 tracking-widest">{viewedChar.profession}</span>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 bg-gradient-to-r from-[#0a0612] via-[#0a0612]/80 to-transparent p-6 w-full max-w-sm">
                <div className="mb-2 text-primary font-medium tracking-widest text-sm">{viewedChar.title}</div>
                <h2 className="text-5xl font-bold font-display mb-4 tracking-wider">{viewedChar.name}</h2>
                <div className="flex gap-2 mb-6">
                  <Badge variant="outline" className="border-primary/50 text-primary">{viewedChar.profession}</Badge>
                  <Badge variant="secondary" className="bg-secondary/80">{viewedChar.positioning}</Badge>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 rounded-none border border-primary bg-primary hover:bg-primary/80 glow-box text-white"
                    disabled={isViewedSelected || isTeamFull}
                    onClick={handleSelectClick}
                  >
                    {isViewedSelected ? '已在队伍中' : isTeamFull ? '队伍已满' : '选择'}
                  </Button>
                  <Button asChild variant="outline" className="flex-1 rounded-none border-border bg-[#0a0612]/50 hover:bg-secondary text-foreground backdrop-blur-sm">
                    <Link href={`/character/${viewedChar.id}`}>详细信息</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Selection Cinematic Overlay */}
      <AnimatePresence>
        {overlayChar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className="w-full max-w-5xl h-full max-h-[800px] relative flex items-center">
              {/* Cinematic lines */}
              <div className="absolute inset-x-0 h-32 bg-primary/10 top-1/4 -skew-y-3 blur-2xl" />
              
              {/* Portrait sliding in */}
              <motion.div 
                initial={{ x: "50%", opacity: 0 }}
                animate={{ x: "0%", opacity: 1 }}
                exit={{ x: "50%", opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="absolute right-0 h-[120%] -bottom-20 z-10"
              >
                {overlayChar.selectionPortrait ? (
                  <img 
                    src={overlayChar.selectionPortrait} 
                    alt={overlayChar.name} 
                    className="h-full object-cover object-left" 
                    style={{ filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.5))" }}
                  />
                ) : (
                  <div className="h-full w-[600px] bg-gradient-to-l from-primary/30 to-transparent" />
                )}
              </motion.div>
              
              {/* Dialog box sliding in */}
              <motion.div 
                initial={{ x: "-20%", opacity: 0 }}
                animate={{ x: "0%", opacity: 1 }}
                exit={{ x: "-20%", opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
                className="relative z-20 max-w-2xl bg-gradient-to-r from-background via-background/90 to-background/40 p-12 border-l-4 border-primary"
              >
                <div className="text-xl text-primary mb-2 font-display">{overlayChar.name}</div>
                <div className="text-3xl font-light italic leading-relaxed text-white/90 tracking-wide">
                  "{overlayChar.selectionLine}"
                </div>
                
                <div className="mt-12 flex gap-4">
                  <Button 
                    className="rounded-none px-8 py-6 text-lg border border-primary bg-primary hover:bg-primary/80 glow-box"
                    onClick={confirmSelection}
                  >
                    确认加入
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="rounded-none px-8 py-6 text-lg text-muted-foreground hover:text-white"
                    onClick={() => setOverlayChar(null)}
                  >
                    取消
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
