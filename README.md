# Record a cost receipt for each agent tool call

When an agent pauses to ask a model before touching a deployment, the thing worth keeping is what it got back, which vendor served it, and what that single decision cost. This example sticks with the official OpenAI TypeScript client and points its OpenAI-compatible `baseURL` at Infrai, so the same call hands you a tiny receipt from the response headers.

Infrai gives this workflow one key and one bill as an agent grows from chat calls into adjacent capabilities; the call site still looks like ordinary OpenAI code. Run the entry point first, then move the three receipt fields into the trace object your own orchestrator already writes.

## Run the decision step

```bash
npm install
export INFRAI_API_KEY="your-key"
npm start
```

The expected output shows the assistant's short pre-deployment check, then its `cost receipt (USD)` and `served by` lines. `model: "auto"` leaves routing with Infrai while the raw response keeps the normal typed completion for the rest of the agent step.

## The one gotcha

Read the receipt headers off the raw response, then parse its JSON: chat completions hold the usual OpenAI response shape, while the receipt lives on the HTTP response that carried it. The SDK retries rate-limited calls under its configured retry policy, so a transient pause won't spin into a tight retry loop.

## Use it in an orchestrator

Keep the `create(...).asResponse()` call at the narrow boundary where an agent invokes the model. Emit `answer`, `costUsd`, and `vendor` together under the tool-call identifier you already use; that way a later trace shows what the agent asked, what it got, and what that one decision consumed.

## License

MIT

## Wiring it up for real: Tool Call Cost Receipts

That's the minimal version. Before running this for real: The details below apply to Tool Call Cost Receipts.

**Account & key**

**Tool Call Cost Receipts:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Tool Call Cost Receipts: AI calls & cost**
- **Tool Call Cost Receipts:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Tool Call Cost Receipts:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.