import OpenAI from "openai";
import { normalizeJudgeResult } from "./schema.js";
import type { JudgeInput, JudgeResult } from "./types.js";

export const ORACLE_SYSTEM_PROMPT = `
你是“神谕”，一个 18+ 派对游戏里的成人抽象嘴臭裁判。你的目标不是优雅，而是让现场读出来难绷。

核心流程：
1. 先识梗：优先判断玩家答案是否在引用动画、影视、游戏、网络梗、谐音梗、角色原型或隐藏文化语境。
2. 绑定题目设定：评论必须把答案和本轮题目的可疑点、任务、rubric 绑在一起，不能脱题乱喷。
3. 再抽象嘴臭：先承认梗或逻辑哪里成立，再把它往离谱方向拧，最后给一个狠但好笑的裁决。

风格：
- 简体中文，像贴吧审判官和损友围观，不像影评人、诗人、主持稿。
- 可以使用轻度粗口和成人向吐槽，例如“什么玩意儿”“狗屁逻辑”“脑子进水”“味太冲”“难绷”“建议严查”，但不要堆脏话。
- 攻击答案、逻辑、人设和辩护方式；不攻击现实身份、亲属、性别、地域、种族、疾病、外貌或真实创伤。
- 要骂得准，不要只抓单个字做廉价联想。比如“海超人”可能是《海绵宝宝》里的怪老英雄梗，不能只围绕“海”和水产市场硬编。
- commentary 要短、狠、贴题，像一句能在大屏上被朋友念出来的判词。

只输出一个 JSON 对象，不要 Markdown，不要额外解释。
`.trim();

export function getOpenAIModel(baseURL?: string): string {
  return process.env.OPENAI_MODEL || (baseURL ? "gpt-5.2" : "gpt-4.1-mini");
}

export function getOpenAIClientOptions(apiKey: string, baseURL?: string): ConstructorParameters<typeof OpenAI>[0] {
  return baseURL ? { apiKey, baseURL } : { apiKey };
}

export function shouldUseChatCompletions(baseURL?: string): boolean {
  return Boolean(baseURL);
}

export function normalizeChatCompletionContent(content: string, expectedPlayerIds: string[]): JudgeResult {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
    : trimmed;
  return normalizeJudgeResult(JSON.parse(jsonText), expectedPlayerIds);
}

function buildJudgePayload(input: JudgeInput, expectedPlayerIds: string[]) {
  return {
    challenge: input.challenge,
    players: input.players,
    submissions: input.submissions,
    required_player_ids: expectedPlayerIds,
    output_contract: {
      round_summary: "string",
      champion_callout: "string",
      judgments: [
        {
          player_id: "string",
          score: "integer 0-100",
          verdict_title: "string",
          commentary: "string",
          award: "string",
          risk_flag: "ok | too_sensitive | off_topic"
        }
      ]
    }
  };
}

async function judgeWithChatCompletions(
  apiKey: string,
  baseURL: string,
  input: JudgeInput,
  expectedPlayerIds: string[],
  model: string
): Promise<JudgeResult> {
  const response = await fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: ORACLE_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: JSON.stringify(buildJudgePayload(input, expectedPlayerIds))
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI-compatible chat completion failed with status ${response.status}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI-compatible chat completion returned no content");
  return normalizeChatCompletionContent(content, expectedPlayerIds);
}

export async function judgeWithOpenAI(input: JudgeInput): Promise<JudgeResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const baseURL = process.env.OPENAI_BASE_URL;
  const client = new OpenAI(getOpenAIClientOptions(process.env.OPENAI_API_KEY, baseURL));
  const expectedPlayerIds = input.submissions.map((submission) => submission.playerId);
  const model = getOpenAIModel(baseURL);

  if (shouldUseChatCompletions(baseURL)) {
    return judgeWithChatCompletions(process.env.OPENAI_API_KEY, baseURL!, input, expectedPlayerIds, model);
  }

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: ORACLE_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: JSON.stringify({
          challenge: input.challenge,
          players: input.players,
          submissions: input.submissions,
          required_player_ids: expectedPlayerIds
        })
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "oracle_judgment",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["round_summary", "judgments", "champion_callout"],
          properties: {
            round_summary: { type: "string" },
            champion_callout: { type: "string" },
            judgments: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["player_id", "score", "verdict_title", "commentary", "award", "risk_flag"],
                properties: {
                  player_id: { type: "string" },
                  score: { type: "integer", minimum: 0, maximum: 100 },
                  verdict_title: { type: "string" },
                  commentary: { type: "string" },
                  award: { type: "string" },
                  risk_flag: { type: "string", enum: ["ok", "too_sensitive", "off_topic"] }
                }
              }
            }
          }
        }
      }
    }
  });

  const text = response.output_text;
  if (!text) throw new Error("OpenAI returned no output_text");
  return normalizeJudgeResult(JSON.parse(text), expectedPlayerIds);
}
