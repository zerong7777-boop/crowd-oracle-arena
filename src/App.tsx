import { HostPage } from "./features/host/HostPage";
import { JoinPage } from "./features/join/JoinPage";
import { PlayerPage } from "./features/player/PlayerPage";
import { ScreenPage } from "./features/screen/ScreenPage";
import { PlayGuide } from "./features/shared/PlayGuide";

export function App() {
  const path = window.location.pathname;

  if (path.startsWith("/host")) return <HostPage />;
  if (path.startsWith("/join")) return <JoinPage />;
  if (path.startsWith("/play")) return <PlayerPage />;
  if (path.startsWith("/screen")) return <ScreenPage />;

  return (
    <main className="home-shell">
      <section className="hero-panel">
        <p className="eyebrow">Crowd Oracle Arena</p>
        <h1>众声神谕竞技场</h1>
        <p className="hero-copy">一个适合多人围观的 AI 派对游戏：玩家递交离谱答案，神谕当场裁决、吐槽、打分。</p>
        <div className="home-actions">
          <a className="primary-link" href="/host">
            主持开局
          </a>
          <a className="secondary-link" href="/join">
            加入游戏
          </a>
        </div>
        <PlayGuide />
      </section>
    </main>
  );
}
