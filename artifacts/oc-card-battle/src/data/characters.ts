/**
 * 角色数据入口 (barrel)
 *
 * 真正的角色数据已经拆分到 ./characters/ 目录下，
 * 一个角色 = 一个 .ts 文件，本文件只负责重新导出。
 *
 * 添加新角色：在 src/data/characters/ 目录里新建一个文件即可，
 * 详见 src/data/characters/README.md。
 */

export type {
  Profession,
  SkillType,
  TargetRange,
  Skill,
  ExtendedBackground,
  Preferences,
  CreatorInfo,
  Character,
} from "./character-types";

export { allCharacters as characters } from "./characters/index";
