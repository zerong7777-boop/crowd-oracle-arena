import OpenAI from "openai";
import { normalizeJudgeResult } from "./schema.js";
import type { JudgeInput, JudgeResult } from "./types.js";

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
          content:
            "你是“神谕”，一个戏剧化但安全的派对游戏裁判。请用简体中文评价玩家的玩笑式提交。只输出一个 JSON 对象，不要 Markdown，不要额外解释。"
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
        content:
          "你是“神谕”，一个戏剧化但安全的派对游戏裁判。请用简体中文评价玩家的玩笑式提交。评论要短、好笑、不辱骂、适合公开大屏展示。"
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
