import { StorySequence } from "@/components/StorySequence";
import { prologueSlides } from "@/data/story";
import { enemies, setCurrentBoss } from "@/data/enemies";
import { useEffect } from "react";

export default function Prologue() {
  useEffect(() => {
    setCurrentBoss(enemies[0].id);
  }, []);

  return (
    <StorySequence
      slides={prologueSlides}
      backHref="/"
      backLabel="返回首页"
      completeHref="/enemy"
      completeLabel="进入调查档案"
    />
  );
}
