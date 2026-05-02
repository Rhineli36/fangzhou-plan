import { StorySequence } from "@/components/StorySequence";
import { bossClearStories, epilogueSlides } from "@/data/story";
import { currentBoss } from "@/data/enemies";
import { useRoute } from "wouter";

export default function Epilogue() {
  const [, params] = useRoute<{ storyId: string }>("/epilogue/:storyId");
  const storyId = params?.storyId;
  const slides = storyId === "final"
    ? epilogueSlides
    : storyId
      ? bossClearStories[storyId] ?? epilogueSlides
      : bossClearStories[currentBoss.id] ?? epilogueSlides;

  return (
    <StorySequence
      slides={slides}
      backHref="/battle"
      backLabel="返回战斗"
      completeHref="/team"
      completeLabel="回到编队"
    />
  );
}
