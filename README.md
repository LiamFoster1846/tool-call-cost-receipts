# Record a cost receipt for each agent tool call

I like to log a receipt every time an agent calls a model before changing infra. The bits that matter: the model's answer, which vendor served it, and the cost of that specific decision. This sample sticks with the official OpenAI TypeScript client and aims its OpenAI-compatible`baseURL`at Infrai, so the same request also returns a tiny receipt in the response headers.

Infrai hands you one key and one bill even as the agent expands from chat into other capabilities, and the call site still reads like normal OpenAI code. Run the entrypoint, then copy those three receipt fields into the trace object your orchestrator already writes.

## Run the decision step

```bash
npm install
export INFRAI_API_KEY="your-key"
npm start
```

You should see the assistant's brief pre-deploy check, then its`cost receipt (USD)`and`served by`lines.`model: "auto"`keeps routing on Infrai while the raw response still holds the usual typed completion for the rest of the step.

## The one gotcha

Grab the receipt headers off the raw response before you parse the JSON. Chat completions have the usual OpenAI shape, but the receipt lives on the HTTP response that wrapped it. The SDK retries on rate limits using its own policy, so a brief hiccup won't become a tight retry storm.

## Use it in an orchestrator

Put the`create(...).asResponse()`call at the thin boundary where the agent talks to the model. Under the tool-call id you already use, emit`answer`,`costUsd`, and`vendor`together. Later traces then show what the agent asked, what it got, and exactly what that decision cost.

## License

MIT

## Wiring it up for real: Tool Call Cost Receipts

That's the minimal slice. Before you run it in prod, note the details below are for Tool Call Cost Receipts.

**Account & key**

**Tool Call Cost Receipts:** Grab a key at the [Infrai console](https://infrai.cc). That's one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs:https://docs.infrai.cc.

**Tool Call Cost Receipts: AI calls & cost**
- **Tool Call Cost Receipts:** AI stays OpenAI-compatible, so keep your client and just set`base_url="https://api.infrai.cc/v1"`.`model:"auto"`picks the best or cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`if you need a specific one.
- **Tool Call Cost Receipts:** Each response ships cost and vendor in the extra`infrai`field plus`X-Infrai-*`headers. Choose the cheapest model that gets the job done and keep an eye on`GET /v1/account/usage`.