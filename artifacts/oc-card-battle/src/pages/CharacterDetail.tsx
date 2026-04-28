import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { characters } from "@/data/characters";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotFound from "@/pages/not-found";

export default function CharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const char = characters.find(c => c.id === id);

  if (!char) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#0a0612] text-foreground flex relative overflow-hidden">
      <div className="scanlines" />

      {/* Left Panel: Details */}
      <div className="w-1/2 h-screen border-r border-border/50 bg-background/95 backdrop-blur-md z-10 flex flex-col">
        <div className="p-6">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-white group -ml-4">
            <Link href="/team">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回编队
            </Link>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-12 pb-12">
          {/* Header */}
          <div className="mb-8">
            <div className="text-primary font-medium tracking-widest mb-1">{char.title}</div>
            <h1 className="text-6xl font-bold font-display tracking-wider mb-4 glow-text">{char.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/50 rounded-none px-3 py-1">
                {char.profession}
              </Badge>
              <Badge variant="secondary" className="rounded-none px-3 py-1 bg-secondary text-secondary-foreground">
                {char.positioning}
              </Badge>
              <Badge variant="outline" className="rounded-none px-3 py-1 border-border">
                生命值 {char.hp}/{char.hp}
              </Badge>
            </div>
          </div>

          <Separator className="bg-border/50 mb-8" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">性别</div>
              <div className="font-medium text-white">{char.gender}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">年龄</div>
              <div className="font-medium text-white">{char.age}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">生日</div>
              <div className="font-medium text-white">{char.birthday}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">血型</div>
              <div className="font-medium text-white">{char.bloodType}</div>
            </div>
          </div>

          {/* Links */}
          <div className="mb-8">
            <div className="text-muted-foreground text-sm mb-2">羁绊角色</div>
            <div className="flex flex-wrap gap-2">
              {char.linkedCharacters.length > 0 ? char.linkedCharacters.map((name, i) => (
                <span key={i} className="text-sm border border-border/50 px-3 py-1 bg-card text-card-foreground">
                  {name}
                </span>
              )) : (
                <span className="text-sm text-muted-foreground italic">无羁绊记录</span>
              )}
            </div>
          </div>

          {/* Story */}
          <div className="mb-10">
            <h3 className="text-xl font-display font-bold mb-4 flex items-center text-primary">
              <span className="w-4 h-4 bg-primary mr-2 block rounded-sm"></span>
              档案记录
            </h3>
            <div className="text-muted-foreground leading-relaxed space-y-4 whitespace-pre-wrap">
              {char.backgroundStory}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xl font-display font-bold mb-6 flex items-center text-primary">
              <span className="w-4 h-4 bg-primary mr-2 block rounded-sm"></span>
              战斗技能
            </h3>
            <div className="space-y-6">
              {char.skills.map((skill, index) => (
                <div key={index} className="bg-card/50 border border-border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex gap-4">
                    {/* Skill Icon Placeholder */}
                    <div className="w-16 h-16 bg-secondary flex-shrink-0 flex items-center justify-center border border-border/50 text-muted-foreground text-xs">
                      {skill.type}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-white">{skill.name}</h4>
                          <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary/80">
                            {skill.range}
                          </Badge>
                        </div>
                        {skill.cost > 0 && (
                          <div className="text-sm font-mono text-accent">
                            消耗: {skill.cost} EN
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {skill.description}
                      </p>
                      <div className="text-sm text-white bg-secondary/50 p-2 border-l-2 border-primary mb-2">
                        {skill.effect}
                      </div>
                      <div className="text-xs text-accent italic">
                        进阶: {skill.upgrade}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

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
