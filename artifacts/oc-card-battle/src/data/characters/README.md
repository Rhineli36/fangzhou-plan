# 角色数据目录

每一个角色 = 这个目录下的一个 `.ts` 文件。
游戏会自动扫描这个目录里所有的 `.ts` 文件，并把它们汇总到队伍选择页。
**新增角色不需要去改任何其他代码**。

---

## 怎么添加一个新角色（最常用流程）

### 第 1 步：决定文件名

文件名建议直接用学号 + 名字，例如：
```
2024030115_夜蝶.ts
```

文件名只是工程文件名，不会显示给玩家。但是要注意：
- 不要带空格、不要带中文标点
- 后缀必须是 `.ts`

### 第 2 步：复制一个已有角色，改字段

最简单的办法：把 `char-02.ts` 整个复制一份，改名为新文件名，然后改里面的 `id`、`name`、各个字段就行。

每个角色对象的格式是固定的，TypeScript 会在你少写、写错字段时直接红色报错，不用怕忘。

### 第 3 步（推荐）：处理图片

把同学交来的图片放到项目根目录的 `attached_assets/` 文件夹下，然后在角色文件里这样引用：

```ts
import avatar from "@assets/学号_头像.png";
import portrait from "@assets/学号_立绘.png";
import selection from "@assets/学号_选择立绘.png";

const character: Character = {
  // ...其他字段
  avatar,
  portrait,
  selectionPortrait: selection,
};
```

如果暂时没图，把 `avatar`/`portrait`/`selectionPortrait` 写成 `""` 也可以，页面会显示为空白。

### 第 4 步：保存 → 自动生效

保存文件后，dev 预览会自动刷新；发布时这位角色会自动出现在游戏里。

---

## 注意事项

- **`id` 必须唯一**。重复 id 会在控制台打警告，且只有第一个会被认。建议用 `oc-学号` 或 `2024030115` 这种格式。
- **不要改 `index.ts`**。它是自动汇总脚本，每次扫描整个目录。
- **占位卡牌**：游戏一共有 24 个槽位，真实角色不够 24 个时，剩余的会自动用"档案待录入"占位卡牌补齐。
- **`test-01` 是示范角色**，正式上线前可以删掉这个文件，删掉后它就不会出现在游戏里。

---

## 字段速查

每个角色文件 `export default` 一个 `Character` 对象，字段如下：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✓ | 全局唯一，建议 `oc-学号` |
| `name` | string | ✓ | 角色名 |
| `title` | string | ✓ | 称号 |
| `profession` | 调查者/战斗者/支援者/异种/遗民 | ✓ | 职业 |
| `positioning` | string | ✓ | 定位标签 |
| `hp` | number | ✓ | 生命值 (3-8) |
| `gender` / `age` / `birthday` / `zodiac` / `bloodType` | string | ✓ | 基础档案 |
| `linkedCharacters` | string[] | ✓ | 羁绊角色名数组（可以是 `[]`） |
| `backgroundStory` | string | ✓ | 背景故事简述 |
| `extendedBackground` | object | 选 | 包含 `origin/family/pastExperiences/currentSituation/epilogue` |
| `preferences` | object | 选 | 包含 `likes/dislikes/favoriteColor/habits/motto` |
| `selectionLine` | string | ✓ | 入场台词 |
| `avatar` / `portrait` / `selectionPortrait` | string | ✓ | 三张图片（可以是 `""`） |
| `skills` | Skill[] | ✓ | 技能列表 |
| `creator` | object | 选 | 创作者信息 |

完整类型定义见 `../character-types.ts`。
