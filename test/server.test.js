const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { createServer } = require("node:http");
const { createApp, MAX_TEXT_LENGTH } = require("../server");

const successResult = {
  improvedText: "Sociale media zijn belangrijk in het dagelijks leven.",
  changes: ["Een lange formulering is verduidelijkt."],
  styleFeedback: "De heldere, directe toon is behouden.",
  checkPoints: ["Controleer of deze formulering precies past bij je bedoeling."]
};

async function startServer(options) {
  const server = createServer(createApp(options));
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

let server;
let baseUrl;
before(async () => {
  ({ server, baseUrl } = await startServer({
    apiKey: "test-key",
    openaiClient: { chat: { completions: { create: async () => ({ choices: [{ message: { content: JSON.stringify(successResult) } }] }) } } }
  }));
});
after(() => new Promise(resolve => server.close(resolve)));

test("serves the homepage and health endpoint", async () => {
  const homepage = await fetch(baseUrl);
  assert.equal(homepage.status, 200);
  assert.match(await homepage.text(), /Draftmate/);
  assert.equal((await fetch(`${baseUrl}/enhancements.css`)).status, 200);
  assert.deepEqual(await (await fetch(`${baseUrl}/api/health`)).json(), { status: "ok" });
});

test("returns the structured AI result for a valid text", async () => {
  const response = await fetch(`${baseUrl}/api/humanize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Dit is een korte tekst om te verbeteren.", level: "havo", language: "nl", goals: ["grammar"] })
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), successResult);
});

test("rejects empty and overlong text before calling the AI", async () => {
  for (const text of [" ", "x".repeat(MAX_TEXT_LENGTH + 1)]) {
    const response = await fetch(`${baseUrl}/api/humanize`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text })
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "INVALID_INPUT");
  }
});

test("requires a name when the selected language is other", async () => {
  const response = await fetch(`${baseUrl}/api/humanize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Een tekst met een andere schrijftaal.", language: "other" })
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_INPUT");
});

test("reports a missing API key clearly", async () => {
  const { server: noKeyServer, baseUrl: noKeyUrl } = await startServer({ apiKey: "" });
  try {
    const response = await fetch(`${noKeyUrl}/api/humanize`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "Een geldige invoertekst." })
    });
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.code, "API_KEY_MISSING");
    assert.match(body.error, /Codespaces-secret OPENAI_API_KEY/);
  } finally {
    await new Promise(resolve => noKeyServer.close(resolve));
  }
});

test("handles connection errors as temporary AI unavailability", async () => {
  const { server: failingServer, baseUrl: failingUrl } = await startServer({
    apiKey: "test-key",
    openaiClient: { chat: { completions: { create: async () => { const error = new Error("offline"); error.name = "APIConnectionError"; throw error; } } } }
  });
  try {
    const response = await fetch(`${failingUrl}/api/humanize`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "Een geldige invoertekst." })
    });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "AI_UNAVAILABLE");
  } finally {
    await new Promise(resolve => failingServer.close(resolve));
  }
});

test("turns upstream failures into a retryable service error", async () => {
  const { server: failingServer, baseUrl: failingUrl } = await startServer({
    apiKey: "test-key",
    openaiClient: { chat: { completions: { create: async () => { const error = new Error("offline"); error.status = 503; throw error; } } } }
  });
  try {
    const response = await fetch(`${failingUrl}/api/humanize`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "Een geldige invoertekst." })
    });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "AI_UNAVAILABLE");
  } finally {
    await new Promise(resolve => failingServer.close(resolve));
  }
});
