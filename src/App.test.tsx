import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

afterEach(() => cleanup());

describe("App", () => {
  it("renders Chinese host and join actions with the play guide on the home route", () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(screen.getByText("众声神谕竞技场")).toBeInTheDocument();
    expect(screen.getByText("主持开局")).toBeInTheDocument();
    expect(screen.getByText("加入游戏")).toBeInTheDocument();
    expect(screen.getByText("玩法介绍")).toBeInTheDocument();
  });

  it("renders the Chinese join form on the join route", () => {
    window.history.pushState({}, "", "/join/ABCD");

    render(<App />);

    expect(screen.getByRole("heading", { name: "进入竞技场" })).toBeInTheDocument();
    expect(screen.getByLabelText("房间号")).toBeInTheDocument();
    expect(screen.getByLabelText("昵称")).toBeInTheDocument();
  });
});
