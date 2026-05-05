import { StorySequence } from "@/components/StorySequence";
import { characters, isCharacterBattleReady } from "@/data/characters";
import { currentBoss } from "@/data/enemies";
import { bossClearStories, epilogueHopeImage, epilogueSlides, type StorySlide } from "@/data/story";
import { useRoute } from "wouter";

function buildCharacterEpilogueSlides(): StorySlide[] {
  return characters
    .filter(character => !character.locked && isCharacterBattleReady(character))
    .map((character, index) => ({
      label: `OPERATOR FILE ${String(index + 1).padStart(2, "0")} / ${character.creator?.studentId ?? character.id}`,
      title: character.name,
      image: epilogueHopeImage,
      foregroundImage: character.portrait || character.selectionPortrait || character.avatar,
      body:
        character.extendedBackground?.epilogue ||
        character.backgroundStory ||
        character.selectionLine ||
        "方舟记录系统保留了这名队员的归队档案。战斗结束后，新的外勤名单仍会留下她的位置。",
    }));
}

export default function Epilogue() {
  const [, params] = useRoute<{ storyId: string }>("/epilogue/:storyId");
  const storyId = params?.storyId;
  const finalSlides = [...epilogueSlides, ...buildCharacterEpilogueSlides()];
  const slides = storyId === "final"
    ? finalSlides
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
