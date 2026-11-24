const $ = (id) => document.getElementById(id);
const input = $("inputText");
const output = $("outputText");
const results = $("results");
const emptyState = $("emptyState");
const MAX_TEXT_LENGTH = 12000;
let requestController;
let toastTimer;

const examples = {
  nl: "Sociale media zijn tegenwoordig een groot onderdeel van het dagelijks leven. Veel jongeren gebruiken apps om contact te houden met vrienden en om op de hoogte te blijven van nieuws. Toch zitten er ook nadelen aan. Je kunt bijvoorbeeld veel tijd kwijt zijn aan scrollen, zonder dat je het echt doorhebt. Daarom is het belangrijk om bewust met sociale media om te gaan.",
  en: "Social media has become a big part of everyday life. Many young people use apps to stay in touch with friends and keep up with the news. However, there are disadvantages too. For example, you can spend a lot of time scrolling without really noticing it. That is why it is important to use social media consciously.",
  de: "Soziale Medien sind heutzutage ein wichtiger Teil des Alltags. Viele Jugendliche benutzen Apps, um mit Freunden in Kontakt zu bleiben und sich über Neuigkeiten zu informieren. Es gibt aber auch Nachteile. Man kann zum Beispiel viel Zeit mit Scrollen verbringen, ohne es wirklich zu merken. Deshalb ist es wichtig, soziale Medien bewusst zu nutzen.",
  fr: "Les réseaux sociaux font aujourd'hui partie de la vie quotidienne. Beaucoup de jeunes utilisent des applications pour rester en contact avec leurs amis et suivre l'actualité. Cependant, ils présentent aussi des inconvénients. On peut, par exemple, passer beaucoup de temps à faire défiler des contenus sans s'en rendre compte."
};

function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function updateCount() {
  const words = countWords(input.value);
  const chars = input.value.length;
  $("wordCount").textContent = `${words} ${words === 1 ? "woord" : "woorden"} · ${chars.toLocaleString("nl-NL")}/${MAX_TEXT_LENGTH.toLocaleString("nl-NL")} tekens`;
  $("wordCount").classList.toggle("limit-warning", chars > MAX_TEXT_LENGTH);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function setLoading(loading) {
  const button = $("analyzeBtn");
  button.disabled = loading;
  button.setAttribute("aria-busy", String(loading));
  button.innerHTML = loading
    ? '<span class="spinner" aria-hidden="true"></span> Bezig met verbeteren…'
    : '<span>✦</span> Verbeter mijn tekst <b>→</b>';
  if (loading && !output.value.trim()) {
    emptyState.classList.add("hidden");
    results.classList.remove("hidden");
    $("resultTitle").textContent = "Even goed nadenken over je tekst…";
    $("resultWords").textContent = "Bezig";
    $("changes").innerHTML = "<li>Je tekst wordt zorgvuldig verbeterd.</li>";
    $("styleFeedback").textContent = "";
    $("checkPoints").replaceChildren();
  }
}

function getPayload() {
  return {
    text: input.value,
    styleSample: $("styleSample").value,
    language: $("language").value,
    customLanguage: $("customLanguage").value.trim(),
    level: $("level").value,
    year: $("year").value.trim(),
    age: $("age").value ? Number($("age").value) : "",
    desiredStyle: $("desiredStyle").value,
    goals: [...document.querySelectorAll('input[name="goal"]:checked')].map(checkbox => checkbox.value),
    keepVoice: $("keepVoice").checked
  };
}

function renderList(element, items, emptyMessage) {
  element.replaceChildren();
  const values = items.length ? items : [emptyMessage];
  for (const value of values) {
    const item = document.createElement("li");
    item.textContent = value;
    element.append(item);
  }
}

function showResult(result) {
  output.value = result.improvedText;
  $("resultTitle").textContent = "Klaar om verder te schrijven";
  $("resultWords").textContent = `${countWords(result.improvedText)} woorden`;
  renderList($("changes"), result.changes, "Geen specifieke wijzigingen gemeld.");
  $("styleFeedback").textContent = result.styleFeedback;
  renderList($("checkPoints"), result.checkPoints, "Er zijn geen specifieke aandachtspunten genoemd. Controleer zelf of de tekst precies zegt wat je bedoelt.");
  emptyState.classList.add("hidden");
  results.classList.remove("hidden");
  $("resultPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function runHumanizer() {
  const payload = getPayload();
  if (countWords(payload.text) < 5) {
    showToast("Voeg eerst minimaal vijf woorden toe.");
    input.focus();
    return;
  }
  if (payload.text.length > MAX_TEXT_LENGTH) {
    showToast(`Je tekst mag maximaal ${MAX_TEXT_LENGTH.toLocaleString("nl-NL")} tekens bevatten.`);
    input.focus();
    return;
  }
  if (payload.styleSample.length > 5000) {
    showToast("Je stijlvoorbeeld mag maximaal 5.000 tekens bevatten.");
    $("styleSample").focus();
    return;
  }
  if (payload.language === "other" && !payload.customLanguage) {
    showToast("Vul de taal in die je wilt gebruiken.");
    $("customLanguage").focus();
    return;
  }
  if (!payload.goals.length) {
    showToast("Kies ten minste een verbeterdoel.");
    return;
  }

  requestController?.abort();
  const controller = new AbortController();
  requestController = controller;
  const timeout = setTimeout(() => controller.abort(), 55_000);
  setLoading(true);
  try {
    const response = await fetch("/api/humanize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "De tekst kon niet worden verwerkt. Probeer het opnieuw.");
    if (!data || typeof data.improvedText !== "string" || !Array.isArray(data.changes) || typeof data.styleFeedback !== "string" || !Array.isArray(data.checkPoints)) {
      throw new Error("De AI gaf een onvolledig resultaat terug. Probeer het opnieuw.");
    }
    showResult(data);
  } catch (error) {
    if (requestController !== controller) return;
    if (!output.value.trim()) {
      results.classList.add("hidden");
      emptyState.classList.remove("hidden");
    }
    if (error.name === "AbortError") {
      showToast("De aanvraag duurde te lang of is geannuleerd. Probeer het opnieuw.");
    } else {
      showToast(error.message || "Geen verbinding met de server. Controleer je verbinding en probeer het opnieuw.");
    }
  } finally {
    clearTimeout(timeout);
    if (requestController === controller) {
      setLoading(false);
      requestController = undefined;
    }
  }
}

function setExample() {
  const lang = $("language").value;
  input.value = examples[lang] || examples.nl;
  updateCount();
  input.focus();
}

input.addEventListener("input", updateCount);
$("exampleBtn").addEventListener("click", setExample);
$("examplesNav").addEventListener("click", setExample);
$("analyzeBtn").addEventListener("click", runHumanizer);
$("regenerateBtn").addEventListener("click", runHumanizer);
$("language").addEventListener("change", () => {
  const custom = $("language").value === "other";
  $("customLanguageField").classList.toggle("hidden", !custom);
  $("customLanguage").required = custom;
});

$("copyBtn").addEventListener("click", async () => {
  if (!output.value.trim()) return showToast("Er staat nog geen tekst klaar.");
  try {
    await navigator.clipboard.writeText(output.value);
    showToast("Tekst gekopieerd.");
  } catch {
    output.focus();
    output.select();
    const copied = document.execCommand("copy");
    showToast(copied ? "Tekst gekopieerd." : "Kopiëren is niet gelukt. Selecteer en kopieer de tekst zelf.");
  }
});

$("useBtn").addEventListener("click", () => {
  input.value = output.value;
  updateCount();
  input.focus();
  showToast("De verbeterde versie staat nu klaar om verder aan te passen.");
});

$("resetBtn").addEventListener("click", () => {
  requestController?.abort();
  requestController = undefined;
  setLoading(false);
  input.value = "";
  output.value = "";
  $("styleSample").value = "";
  $("year").value = "";
  $("age").value = "";
  $("customLanguage").value = "";
  $("language").value = "nl";
  $("customLanguageField").classList.add("hidden");
  $("level").value = "havo";
  $("desiredStyle").value = "neutral";
  $("keepVoice").checked = true;
  document.querySelectorAll('input[name="goal"]').forEach((checkbox, index) => {
    checkbox.checked = index < 3;
  });
  updateCount();
  results.classList.add("hidden");
  emptyState.classList.remove("hidden");
  showToast("Nieuwe tekst gestart.");
});

updateCount();
