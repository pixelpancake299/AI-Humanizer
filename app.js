const $ = (id) => document.getElementById(id);
const input = $("inputText");
const output = $("outputText");
const results = $("results");
const emptyState = $("emptyState");
let lastAnalysis = null;

function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
function updateCount() {
  const n = countWords(input.value);
  $("wordCount").textContent = n + (n === 1 ? " woord" : " woorden");
}
input.addEventListener("input", updateCount);

const examples = {
  nl: "Sociale media zijn tegenwoordig een groot onderdeel van het dagelijks leven. Veel jongeren gebruiken apps om contact te houden met vrienden en om op de hoogte te blijven van nieuws. Toch zitten er ook nadelen aan. Je kunt bijvoorbeeld veel tijd kwijt zijn aan scrollen, zonder dat je het echt doorhebt. Daarom is het belangrijk om bewust met sociale media om te gaan.",
  en: "Social media has become a big part of everyday life. Many young people use apps to stay in touch with friends and keep up with the news. However, there are disadvantages too. For example, you can spend a lot of time scrolling without really noticing it. That is why it is important to use social media consciously.",
  de: "Soziale Medien sind heutzutage ein wichtiger Teil des Alltags. Viele Jugendliche benutzen Apps, um mit Freunden in Kontakt zu bleiben und sich über Neuigkeiten zu informieren. Es gibt aber auch Nachteile. Man kann zum Beispiel viel Zeit mit Scrollen verbringen, ohne es wirklich zu merken. Deshalb ist es wichtig, soziale Medien bewusst zu nutzen."
};
function setExample() {
  input.value = examples[$("language").value] || examples.nl;
  updateCount();
  input.focus();
}
$("exampleBtn").addEventListener("click", setExample);
$("examplesNav").addEventListener("click", setExample);

function analyzeText(text, language) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const avg = sentences.length ? words.length / sentences.length : 0;
  const longWords = words.filter(w => w.replace(/[^\p{L}]/gu, "").length >= 12).length;
  const repeated = [];
  const normalized = words.map(w => w.toLowerCase().replace(/[^\p{L}]/gu, "")).filter(w => w.length > 4);
  const counts = {};
  normalized.forEach(w => counts[w] = (counts[w] || 0) + 1);
  Object.entries(counts).filter(([w,n]) => n >= 3).slice(0,3).forEach(([w,n]) => repeated.push(w + " (" + n + "×)"));
  const strengths = [];
  const suggestions = [];
  if (sentences.length >= 3) strengths.push("Je tekst bestaat uit meerdere zinnen en werkt een onderwerp uit.");
  if (words.length >= 60) strengths.push("Je hebt voldoende ruimte om je onderwerp toe te lichten.");
  if (/[.!?]/.test(text)) strengths.push("Je gebruikt leestekens om zinnen van elkaar te scheiden.");
  if (!strengths.length) strengths.push("Je hebt een eerste versie op papier gezet. Dat is een goed startpunt.");
  if (avg > 24) suggestions.push("Je zinnen zijn gemiddeld vrij lang. Kijk of je sommige zinnen kunt opsplitsen.");
  else if (avg > 0 && avg < 8) suggestions.push("Je zinnen zijn kort. Voeg waar nodig uitleg of een voorbeeld toe.");
  else suggestions.push("Je zinslengte is redelijk compact. Controleer of de overgangen tussen zinnen logisch zijn.");
  if (longWords.length > Math.max(2, words.length * .12)) suggestions.push("Je gebruikt relatief veel lange woorden. Controleer of eenvoudigere woorden even precies zijn.");
  if (repeated.length) suggestions.push("Deze woorden komen vaak terug: " + repeated.join(", ") + ". Kijk of je herhaling bewust is.");
  if (sentences.length < 3) suggestions.push("Voeg eventueel een toelichting of concreet voorbeeld toe om je punt verder uit te werken.");
  if (words.length < 45) suggestions.push("Je tekst is kort. Als de opdracht meer diepgang vraagt, werk je belangrijkste punt verder uit.");
  if (!/[.!?]$/.test(text.trim())) suggestions.push("Controleer of de laatste zin eindigt met een passend leesteken.");
  if (suggestions.length === 0) suggestions.push("Lees de tekst hardop voor. Zo merk je vaak waar een overgang nog wat stroef voelt.");
  return {words: words.length, sentences: sentences.length, avg, long: longWords.length, strengths, suggestions};
}

function polish(text, language, keepVoice) {
  let value = text.trim().replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  // Only safe, mechanical cleanup: preserve the writer's claims and vocabulary.
  value = value.replace(/\s+([,.!?;:])/g, "$1").replace(/([,.!?])([A-Za-zÀ-ÿ])/g, "$1 $2");
  value = value.replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (m, start, letter) => start + letter.toLocaleUpperCase(language === "de" ? "de" : language === "en" ? "en" : "nl"));
  if (!keepVoice) {
    value = value.replace(/\b(echt heel|super erg)\b/gi, "erg");
  }
  return value;
}

function runAnalysis() {
  const text = input.value.trim();
  if (countWords(text) < 5) {
    showToast("Voeg eerst minimaal vijf woorden toe.");
    input.focus();
    return;
  }
  const language = $("language").value;
  const analysis = analyzeText(text, language);
  lastAnalysis = {text, language, analysis};
  $("resultWords").textContent = analysis.words + " woorden";
  $("resultTitle").textContent = analysis.words >= 100 ? "Je hebt een goede basis" : "Je eerste versie is klaar";
  $("metrics").innerHTML = [
    [analysis.words, "Woorden"],
    [analysis.sentences, "Zinnen"],
    [analysis.avg.toFixed(1), "Woorden per zin"]
  ].map(([n,label]) => '<div class="metric"><strong>' + n + '</strong><span>' + label + '</span></div>').join("");
  $("strengths").innerHTML = analysis.strengths.map(s => "<li>" + escapeHtml(s) + "</li>").join("");
  $("suggestions").innerHTML = analysis.suggestions.map(s => "<li>" + escapeHtml(s) + "</li>").join("");
  output.value = polish(text, language, $("keepVoice").checked);
  emptyState.classList.add("hidden");
  results.classList.remove("hidden");
  $("resultPanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}
$("analyzeBtn").addEventListener("click", runAnalysis);
$("keepVoice").addEventListener("change", () => { if(lastAnalysis) output.value = polish(lastAnalysis.text,lastAnalysis.language,$("keepVoice").checked); });
$("copyBtn").addEventListener("click", async () => {
  if (!output.value.trim()) return showToast("Er staat nog geen tekst klaar.");
  try { await navigator.clipboard.writeText(output.value); showToast("Tekst gekopieerd."); }
  catch { output.select(); document.execCommand("copy"); showToast("Tekst gekopieerd."); }
});
$("useBtn").addEventListener("click", () => {
  input.value = output.value;
  updateCount();
  input.focus();
  showToast("De verbeterde versie staat nu links.");
});
$("resetBtn").addEventListener("click", () => {
  input.value = "";
  output.value = "";
  $("styleSample").value = "";
  $("year").value = "";
  $("age").value = "";
  $("language").value = "nl";
  $("level").value = "havo";
  $("keepVoice").checked = true;
  lastAnalysis = null;
  updateCount();
  results.classList.add("hidden");
  emptyState.classList.remove("hidden");
  showToast("Nieuwe tekst gestart.");
});
let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
// Restore only non-sensitive draft text locally on this device.
try {
  const saved = localStorage.getItem("draftmate-draft");
  if (saved) { input.value = saved; updateCount(); }
  input.addEventListener("input", () => localStorage.setItem("draftmate-draft", input.value));
} catch {}
