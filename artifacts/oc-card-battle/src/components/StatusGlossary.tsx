import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { collectStatusesFromText, getStatusByTerm, statusCatalog, statusTerms, type StatusDefinition, type StatusKind } from "@/data/statusCatalog";
import { BookMarked } from "lucide-react";
import type { Skill } from "@/data/characters";

type StatusIconOverrides = Partial<Record<string, string>>;

const kindStyles: Record<StatusKind, string> = {
  增益: "border-cyan-300/55 bg-cyan-300/10 text-cyan-100",
  减益: "border-red-300/55 bg-red-400/10 text-red-100",
  特殊: "border-yellow-300/55 bg-yellow-300/10 text-yellow-100",
};

export function StatusGlossaryButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn("rounded-none border-primary/45 bg-black/35 text-primary hover:border-primary hover:bg-primary/15", className)}
      >
        <BookMarked className="mr-2 h-4 w-4" />
        状态说明
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[86vh] max-w-4xl rounded-none border-primary/45 bg-[#0b0712] p-0 text-white [&>button]:hidden">
          <DialogTitle className="sr-only">状态说明</DialogTitle>
          <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
            <div>
              <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary/80">STATUS INDEX</div>
              <h2 className="mt-1 text-2xl font-black">详细状态说明</h2>
            </div>
            <Button variant="ghost" className="rounded-none text-white/60 hover:text-white" onClick={() => setOpen(false)}>
              关闭
            </Button>
          </div>
          <ScrollArea className="max-h-[68vh] px-6 py-5">
            <div className="grid gap-3 md:grid-cols-2">
              {statusCatalog.map(status => (
                <StatusGlossaryCard key={status.id} status={status} />
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function StatusGlossaryCard({ status }: { status: StatusDefinition }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-3 border border-white/10 bg-white/[0.04] p-3">
      <div className="h-14 w-14 overflow-hidden border border-white/15 bg-black">
        <img src={status.icon} alt={status.name} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <div className="font-black text-white">{status.name}</div>
          <span className={cn("border px-2 py-0.5 text-[10px] font-black", kindStyles[status.kind])}>{status.kind}</span>
        </div>
        <div className="text-xs font-bold text-primary/85">{status.short}</div>
        <p className="mt-1.5 text-xs leading-relaxed text-white/65">{status.description}</p>
      </div>
    </div>
  );
}

export function StatusTermText({ text, className, iconOverrides }: { text: string; className?: string; iconOverrides?: StatusIconOverrides }) {
  const parts = useMemo(() => splitStatusTerms(text, iconOverrides), [text, iconOverrides]);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part.status) return <span key={`${part.text}-${index}`}>{part.text}</span>;
        return (
          <StatusHover key={`${part.text}-${index}`} status={part.status}>
            <span className="cursor-help border-b border-dotted border-primary/70 font-bold text-primary">{part.text}</span>
          </StatusHover>
        );
      })}
    </span>
  );
}

export function SkillStatusHints({
  texts,
  className,
  iconOverrides,
}: {
  texts: Array<string | undefined>;
  className?: string;
  iconOverrides?: StatusIconOverrides;
}) {
  const statuses = collectStatusesFromText(...texts).map(status => applyIconOverride(status, iconOverrides));
  if (statuses.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {statuses.map(status => (
        <StatusChip key={status.id} status={status} />
      ))}
    </div>
  );
}

export function SkillDiscardHint({ skill, className }: { skill: Skill; className?: string }) {
  const hint = getDiscardHint(skill);
  if (!hint) return null;
  return (
    <div className={cn("border-l-4 border-yellow-300 bg-yellow-300/10 px-3 py-2 text-xs font-bold leading-relaxed text-yellow-100", className)}>
      主动弃牌：{hint}
    </div>
  );
}

function getDiscardHint(skill: Skill): string | null {
  const text = [skill.name, skill.description, skill.effect, skill.upgrade].join("\n");
  if (skill.name === "时序修复") return "主动弃置时，有 50% 几率恢复 1 点能量。";
  if (!text.includes("弃") && !text.includes("丢弃") && !text.includes("放弃")) return null;
  if (skill.name === "念念不忘") return "获得 1 点能量，并生成 1 层记忆检索。";
  if (skill.name === "铲尖猛击") return "获得 1 张应急储备。";
  if (skill.name === "绝境应激") return "自身获得恢复，同时承受虚弱，适合在需要续航时主动处理。";
  if (skill.name === "时序祷言") return "结算时会弃置手牌中的时祀牌，每弃 1 张，全体恢复 1 点生命。";
  if (skill.name === "星辰律动") return "若手中有命运折射，会弃置 1 张命运折射，为目标追加 1 层护盾。";
  if (skill.name === "安护屏障") return "释放后随机弃 1 张手牌，换取全体护盾与恢复。";
  return "这个技能带有弃牌结算，请留意手牌资源和触发收益。";
}

function StatusChip({ status }: { status: StatusDefinition }) {
  return (
    <StatusHover status={status}>
      <span className={cn("inline-flex cursor-help items-center gap-1 border px-1.5 py-1 text-[10px] font-black", kindStyles[status.kind])}>
        <img src={status.icon} alt="" className="h-4 w-4 object-cover" />
        {status.name}
      </span>
    </StatusHover>
  );
}

function StatusHover({ status, children }: { status: StatusDefinition; children: ReactNode }) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72 rounded-none border-primary/35 bg-[#0b0712] p-3 text-white shadow-[0_0_28px_rgba(168,85,247,0.24)]">
        <div className="grid grid-cols-[44px_1fr] gap-3">
          <img src={status.icon} alt="" className="h-11 w-11 border border-white/15 object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <div className="font-black">{status.name}</div>
              <span className={cn("border px-1.5 py-0.5 text-[9px] font-black", kindStyles[status.kind])}>{status.kind}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-white/70">{status.description}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function splitStatusTerms(text: string, iconOverrides?: StatusIconOverrides): Array<{ text: string; status?: StatusDefinition }> {
  const parts: Array<{ text: string; status?: StatusDefinition }> = [];
  let index = 0;
  while (index < text.length) {
    const term = statusTerms.find(candidate => text.startsWith(candidate, index));
    if (!term) {
      const nextIndex = findNextTermIndex(text, index + 1);
      parts.push({ text: text.slice(index, nextIndex) });
      index = nextIndex;
      continue;
    }
    const status = applyIconOverride(getStatusByTerm(term), iconOverrides);
    parts.push({ text: term, status });
    index += term.length;
  }
  return parts;
}

function applyIconOverride<T extends StatusDefinition | undefined>(status: T, iconOverrides?: StatusIconOverrides): T {
  if (!status || !iconOverrides?.[status.id]) return status;
  return { ...status, icon: iconOverrides[status.id] } as T;
}

function findNextTermIndex(text: string, start: number): number {
  for (let i = start; i < text.length; i += 1) {
    if (statusTerms.some(term => text.startsWith(term, i))) return i;
  }
  return text.length;
}
