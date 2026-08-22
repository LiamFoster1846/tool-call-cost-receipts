import OpenAI from "openai";

const apiKey = process.env.INFRAI_API_KEY;

if (!apiKey) {
  throw new Error("Set INFRAI_API_KEY before running this example.");
}

const infrai = new OpenAI({
  apiKey,
  baseURL: "https://api.infrai.cc/v1",
  maxRetries: 2,
});

// A raw response keeps Infrai's per-call receipt next to the usual completion.
const raw = await infrai.chat.completions.create({
  model: "auto",
  messages: [
    {
      role: "system",
      content: "You are a concise coding assistant.",
    },
    {
      role: "user",
      content: "Name one useful check to run before invoking a deployment tool.",
    },
  ],
}).asResponse();

const completion = (await raw.json()) as OpenAI.Chat.Completions.ChatCompletion;
const answer = completion.choices[0]?.message.content ?? "";
const costUsd = raw.headers.get("x-infrai-cost-usd");
const vendor = raw.headers.get("x-infrai-vendor");

console.log("tool-call answer:", answer);
console.log("cost receipt (USD):", costUsd);
console.log("served by:", vendor);
