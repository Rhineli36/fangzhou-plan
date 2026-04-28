# 角色数据目录

每一个角色 = 这个目录下的一个 `.ts` 文件。
游戏会自动扫描这个目录里所有的 `.ts` 文件，并把它们汇总到队伍选择页。
**新增角色不需要去改任何其他代码**。

---

## 怎么添加一个新角色（两种方法）

---

### 方法一（最快）：直接丢 JSON 文件 ⭐ 推荐

学生提交表单后，浏览器会下载一个 `学号_角色名.json` 文件。

**你只需要把这个文件复制到这个 `characters/` 目录里，保存，角色就自动出现在游戏里。** 不需要改任何代码。

注意：
- 文件名不要带空格、不要带中文标点
- 后缀必须是 `.json`
- JSON 里的图片已经以 base64 格式打包进去了，不需要单独上传图片

---

### 方法二：手动写 .ts 文件（给需要自定义的角色用）

如果你需要从零手写一个角色（比如 NPC、BOSS、示范角色），在这个文件夹里新建 `xxx.ts`，参考 `char-02.ts` 的格式填写字段。

图片可以放到 `attached_assets/` 文件夹后这样引用：

```ts
import avatar from "@assets/学号_头像.png";
const character: Character = {
  // ...
  avatar,
};
```

---

### 保存 → 自动生效

无论哪种方法，保存文件后预览会自动刷新；发布时新角色自动出现在游戏里。

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
