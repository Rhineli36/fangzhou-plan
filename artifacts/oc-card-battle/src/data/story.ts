import prologueTwo from "@assets/测试用游戏封面_1777348034161.png";
import prologueOne from "@assets/story_prologue_1.png";
import prologueThree from "@assets/story_prologue_3.png";
import epilogueOne from "@assets/story_epilogue_1.png";
import epilogueTwo from "@assets/story_epilogue_2.png";
import epilogueThree from "@assets/story_epilogue_3.png";
import boss1ClearCg from "@assets/boss1_clear_cg.png";
import boss2ClearCg from "@assets/boss2_clear_cg.png";
import boss3ClearCg from "@assets/boss3_clear_cg.png";
import boss4ClearCg from "@assets/boss4_clear_cg.png";

export interface StorySlide {
  label: string;
  title: string;
  image: string;
  foregroundImage?: string;
  body: string;
}

export const epilogueHopeImage = epilogueThree;

export const prologueSlides: StorySlide[] = [
  {
    label: "PROLOGUE 01",
    title: "方舟之上",
    image: prologueOne,
    body:
      "全球性灾难爆发后，世界被“扭曲之地”覆盖。黑雾吞没城市、撕裂地表，曾经稳定的法则被折成无数危险的断面。幸存的人类退入漂浮于高空的巨大避难所“方舟”，却很快发现这不是终点，而只是延迟到来的倒计时。维系方舟运转的核心动力源“钟楼”正在逐渐停摆，一旦钟声完全沉默，人类最后的避难所也会坠入黑雾。",
  },
  {
    label: "PROLOGUE 02",
    title: "扭曲之地",
    image: prologueTwo,
    body:
      "地表已经不再属于过去的世界。时间在废墟间忽快忽慢，空间像受伤的玻璃般重叠，旧时代的片段与异常生物一起徘徊在黑雾深处。那里仍埋藏着让方舟重启的线索，也埋藏着无数无法解释的灾厄。每一次踏入扭曲之地，都意味着走进一段可能无法返回的历史残响。",
  },
  {
    label: "PROLOGUE 03",
    title: "调查队启程",
    image: prologueThree,
    body:
      "为了夺回未来，方舟召集拥有异能、战斗技术或特殊知识的志愿者，组成调查队。他们将离开相对安全的高空都市，前往被黑雾侵蚀的大地，收集失落资料，确认异常源头，并对抗那些被扭曲改写的存在。每一名成员都带着自己的秘密、执念与未完成的故事，而这些故事将成为方舟计划继续前进的火种。",
  },
];

export const epilogueSlides: StorySlide[] = [
  {
    label: "EPILOGUE 01",
    title: "战斗之后",
    image: epilogueOne,
    body:
      "邪神之灾结束后，方舟并没有立刻迎来安宁。伤员被送回医疗区，工程组重新接入被震断的能源管线，记录员在残缺的数据里反复校对战场报告。胜利只是暂时推开了黑雾的一角，城市仍在修补，钟楼仍在低鸣，而每一个从战场归来的人，都比出发时更清楚：这场灾难远没有结束。",
  },
  {
    label: "EPILOGUE 02",
    title: "外勤仍在继续",
    image: epilogueTwo,
    body:
      "调查队的名单被重新整理，新的异常坐标不断亮起。扭曲之地深处仍有会移动的裂隙、会吞噬记忆的黑雾，以及对方舟构成威胁的异常生命。队员们短暂休整后再次出发，他们不是为了成为英雄，而是为了让更多人能够在方舟的灯光下醒来，继续拥有明天。",
  },
  {
    label: "EPILOGUE 03",
    title: "仍存的希望",
    image: epilogueThree,
    body:
      "黑雾依然存在，破碎的世界也无法在一夜之间恢复成旧日模样。但方舟保存着人类最后的课程、作品、记忆与愿望，也保存着调查队从废墟中带回来的每一份线索。只要还有人愿意记录、创造、战斗和归来，钟楼就不会真正沉默。方舟计划仍在继续，而下一次出发，已经在晨光抵达前悄然准备。",
  },
];

export const bossClearStories: Record<string, StorySlide[]> = {
  "boss-01": [
    {
      label: "ARK-INV-██-03 / CLEAR REPORT",
      title: "花冠骨面体失活",
      image: boss1ClearCg,
      body:
        "调查队第七小队完成对 EVE-LAMB 的定位与围剿。目标在交战中释放花状孢体与精神干扰，造成短时感知偏移和记忆错位；稳定装置介入后，主体被成功压制，核心结构已回收封存。区域扭曲指数下降至安全阈值以下，但该异常与高阶“时间阴影”的波形仍存在相似反应，同类事件响应等级建议上调。",
    },
  ],
  "boss-02": [
    {
      label: "ARK-INV-██-05 / CLEAR REPORT",
      title: "双生刃鬼封存",
      image: boss2ClearCg,
      body:
        "第七小队在旧交通节点残骸区完成对 EVE-TWIN 的强制分离。双目标具备高度同步、伤害转移与短距离位相错位能力，常规压制一度失效；在分割战术和同步干扰装置介入后，两体协同节奏被打断，并相继失去行动能力。双核心结构已分别封存，现场仍残留微弱同步反应，研究组将继续追踪“重影感”与时间错位体验。",
    },
  ],
  "boss-03": [
    {
      label: "ARK-INV-██-08 / CLEAR REPORT",
      title: "鸦月仪式场崩解",
      image: boss3ClearCg,
      body:
        "第七小队完成对黑林拘束域内 EVE-CROW 的清除。目标以拟态人形与伴生兽形式存在，通过悬挂遗体、符链和紫色结晶构筑仪式场，持续强化自身存在稳定度。行动中队员出现重复月相、个体数量异常增殖等认知偏差；伴生兽被优先击杀后，主体显形并被围剿。黑羽冠饰与结晶节点已回收，林地紫色能量反应显著衰减。",
    },
  ],
  "boss-04": [
    {
      label: "ARK-INV-██-11 / CLEAR REPORT",
      title: "断蚀骑兽封存",
      image: boss4ClearCg,
      body:
        "目标区域：扭曲之地·赤蚀旧王城遗址。异常编号：EVE-WARDEN（暂定命名：断蚀骑兽）。调查队第七小队于 ██ 时进入目标区域，对异常个体进行定位与清除。目标以“重装人形主体 + 伴生兽”形式存在，主体持有大型斧戟类武器，具备高强度近战压制能力；伴生兽表现为巨狼形态，可配合主体进行侧翼突袭与牵制。目标活动区域存在赤色能量沉积，并对周边空间稳定性造成持续扰动。接敌后，主体通过重型武器发动大范围攻击，伴生兽从侧翼进行高速扑击，迫使小队队形多次调整。交战中记录到主体与伴生兽之间存在同步反应，一方受创时，另一方行动强度会短暂提升。稳定装置启动后，赤色能量波动被削弱。小队采取分割战术，优先压制伴生兽，随后集中火力攻击主体。异常体已确认失活，主体核心结构与伴生兽颈部链式核心已完成回收并分别封存。大型斧戟残留有赤蚀反应，已作为危险遗物转交研究组处理。现场能量场明显衰减，区域扭曲指数下降至可控范围。",
    },
  ],
};
