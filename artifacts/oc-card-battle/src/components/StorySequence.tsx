import { useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StorySlide } from "@/data/story";

interface StorySequenceProps {
  slides: StorySlide[];
  backHref: string;
  backLabel: string;
  completeHref: string;
  completeLabel: string;
}

export function StorySequence({ slides, backHref, backLabel, completeHref, completeLabel }: StorySequenceProps) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isFirst = index === 0;
  const isLast = index === slides.length - 1;
  const hasForeground = !!slide.foregroundImage;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07040d] text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      </AnimatePresence>

      <div className={hasForeground ? "absolute inset-0 bg-[#07040d]/78" : "absolute inset-0 bg-gradient-to-r from-[#07040d]/95 via-[#07040d]/62 to-[#07040d]/15"} />
      <div className={hasForeground ? "absolute inset-0 bg-gradient-to-r from-[#07040d]/96 via-[#07040d]/44 to-[#07040d]/82" : "absolute inset-0 bg-gradient-to-t from-[#07040d] via-transparent to-[#07040d]/45"} />
      <div className="scanlines" />

      {slide.foregroundImage && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`foreground-${slide.foregroundImage}`}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.42 }}
            className="pointer-events-none fixed inset-0 z-[2] flex items-end justify-center pt-16"
          >
            <img
              src={slide.foregroundImage}
              alt=""
              className="max-h-[88vh] max-w-[42vw] object-contain object-bottom drop-shadow-[0_0_42px_rgba(0,0,0,0.82)]"
            />
          </motion.div>
        </AnimatePresence>
      )}

      <div className="relative z-10 flex min-h-screen flex-col justify-between p-5 md:p-8">
        <Button asChild variant="ghost" className="w-fit rounded-none text-white/65 hover:text-white">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        <main className="max-w-3xl pb-10 md:pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-4 font-mono text-xs font-bold tracking-[0.38em] text-primary">{slide.label}</div>
              <h1 className="mb-6 font-display text-5xl font-black tracking-wide text-white md:text-7xl">{slide.title}</h1>
              <div className="border-l-4 border-primary bg-black/42 px-5 py-4 text-base leading-loose text-white/82 shadow-[0_0_40px_rgba(0,0,0,0.35)] md:text-lg">
                {slide.body}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              disabled={isFirst}
              onClick={() => setIndex(current => Math.max(0, current - 1))}
              className="rounded-none border-white/20 bg-black/25 text-white disabled:opacity-35"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              上一幕
            </Button>
            {isLast ? (
              <Button asChild className="rounded-none bg-primary px-8 font-black hover:bg-primary/80">
                <Link href={completeHref}>{completeLabel}</Link>
              </Button>
            ) : (
              <Button onClick={() => setIndex(current => Math.min(slides.length - 1, current + 1))} className="rounded-none bg-primary px-8 font-black hover:bg-primary/80">
                下一幕
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <div className="ml-1 font-mono text-xs tracking-[0.28em] text-white/45">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
