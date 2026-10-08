import type { JudgeProvider } from "@campusoj/shared";
import { MockJudgeProvider } from "./MockJudgeProvider.js";
import { Judge0Provider } from "./Judge0Provider.js";
import { LocalJudgeProvider } from "./LocalJudgeProvider.js";

export { MockJudgeProvider } from "./MockJudgeProvider.js";
export { Judge0Provider } from "./Judge0Provider.js";
export { LocalJudgeProvider } from "./LocalJudgeProvider.js";

export function getJudgeProvider(): JudgeProvider {
  const provider = (process.env.JUDGE_PROVIDER ?? "local").toLowerCase();
  if (provider === "judge0") {
    return new Judge0Provider();
  }
  if (provider === "mock") {
    return new MockJudgeProvider();
  }
  return new LocalJudgeProvider();
}
