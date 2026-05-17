const STEPS = [
  "主持人创建房间，把大屏页投到电视或投影上。",
  "玩家用手机打开加入链接，输入房间号和昵称入场。",
  "主持人选择一条荒诞审判题，开启本轮作答。",
  "玩家提交一句机智、离谱但适合公开展示的答案。",
  "神谕裁判逐个揭晓吐槽、分数和称号，现场一起围观。",
  "回合结束后看排行榜，继续下一轮。"
];

export function PlayGuide({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "play-guide compact-guide" : "play-guide"} aria-labelledby="play-guide-title">
      <p className="eyebrow">玩法介绍</p>
      <h2 id="play-guide-title">多人围观的神谕审判派对</h2>
      <ol>
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
