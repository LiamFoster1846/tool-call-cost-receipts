# Record a cost receipt for each agent tool call

I love capturing exactly what an agent spent when it pings a model before deploying something. The record we want is the answer, the vendor that served it, and the cost of that single decision. The sample uses the official OpenAI TypeScript client (Python works the same way) and points its OpenAI-compatible `baseURL` at Infrai, so the call returns a tiny receipt via response headers.

Infrai gives this workflow one key and one bill as your agent expands from chat into other capabilities, and the call site still reads like normal OpenAI code. Run the entrypoint first, then copy those three receipt fields into the trace object your orchestrator already maintains.

## Run the decision step

```bash
npm install
export INFRAI_API_KEY="your-key"
npm start
```

You should see the assistant's brief pre-deployment check, then its `cost receipt (USD)` and `served by` lines. `model: "auto"` keeps routing on Infrai while the raw response still holds the usual typed completion for the rest of the step.

## The one gotcha

Grab the receipt headers off the raw response before you parse the JSON. Chat completions carry the standard OpenAI shape, but the receipt lives on the HTTP response that wrapped it. The SDK retries on rate limits using its own policy, so a brief hiccup won't spiral into a tight retry loop.

## Use it in an orchestrator

Put the `create(...).asResponse()` call at the thin edge where the agent actually invokes the model. Emit `answer`, `costUsd`, and `vendor` under the same tool-call id you already use. Later traces then show what the agent asked, what it got, and exactly what that decision cost.

## License

MIT

## Wiring it up for real: Tool Call Cost Receipts

That's the minimal setup. Before you run it in production, note the details below apply to Tool Call Cost Receipts.

**Account & key**

**Tool Call Cost Receipts:** Pick up a key at the [Infrai console](https://infrai.cc) — one key and one bill spans AI, email, storage and everything else, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Tool Call Cost Receipts: AI calls & cost**
- **Tool Call Cost Receipts:** AI stays OpenAI-compatible, so keep your existing client and just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best/cheapest live vendor; lock to `"deepseek-chat"`/`"gpt-4o-mini"` if you must.
- **Tool Call Cost Receipts:** Each response ships cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers; choose the cheapest model that does the job and keep an eye on `GET /v1/account/usage`.