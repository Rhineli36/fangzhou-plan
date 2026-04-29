export type Profession = '调查者' | '战斗者' | '支援者' | '异种' | '遗民';
export type SkillType = '攻击' | '防御' | '异能' | '天赋' | '恢复';
export type TargetRange = '单体' | '多体';

export interface Skill {
  name: string;
  type: SkillType;
  description: string;
  range: TargetRange;
  cost: number;
  effect: string;
  upgrade: string;
  icon?: string;
  castIllustration?: string;
}

export interface ExtendedBackground {
  origin?: string;
  family?: string;
  pastExperiences?: string;
  currentSituation?: string;
  epilogue?: string;
}

export interface Preferences {
  likes?: string[];
  dislikes?: string[];
  favoriteColor?: string;
  habits?: string;
  motto?: string;
}

export interface CreatorInfo {
  name: string;
  studentId: string;
  className?: string;
  avatar?: string;
  messageToCharacter?: string;
  proposedGameName?: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  profession: Profession;
  positioning: string;
  hp: number;
  gender: string;
  age: string;
  birthday: string;
  zodiac: string;
  bloodType: string;
  linkedCharacters: string[];
  backgroundStory: string;
  extendedBackground?: ExtendedBackground;
  preferences?: Preferences;
  selectionLine: string;
  avatar: string;
  portrait: string;
  selectionPortrait: string;
  skills: Skill[];
  creator?: CreatorInfo;
  locked?: boolean;
}
