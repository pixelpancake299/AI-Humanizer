"use client";

import { useState } from "react";

type Result = { improvedText: string; summary: string; styleNotes: string[]; checkPoints: string[] };

export default function Home() {
  const [text, setText] = useState("");
  const [sample, setSample] = useState("");
  const [age, setAge] = useState("15");
  const [education, setEducation] = useState("havo");
  const [year, setYear] = useState("4");
  const [language, setLanguage] = useState("Nederlands");
  const [goal, setGoal] = useState("Maak mijn tekst duidelijker");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function improve() {
    setError("");
    setResult(null);
    setCopied(false);
    if (!text.trim()) { setError("Plak eerst je tekst in het tekstvak."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sample, age, education, year, language, goal })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Er ging iets mis.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result.improvedText);
    setCopied(true);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">✳</span> AI Humanizer</a>
        <span className="top-note">Jouw woorden. Een beetje scherper.</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="dot" /> JOUW PERSOONLIJKE SCHRIJFCOACH</div>
        <h1>Goed schrijven,<br /><em>op jouw manier.</em></h1>
        <p className="intro">Maak je tekst duidelijker en prettiger om te lezen, zonder dat hij zijn eigen karakter verliest.</p>
      </section>

      <section className="workspace">
        <div className="panel input-panel">
          <div className="section-heading"><div><span className="step">01</span><h2>Vertel wie je bent</h2></div><span className="subtle">Zodat de hulp bij je past</span></div>
          <div className="profile-grid">
            <label>Leeftijd<input value={age} onChange={e => setAge(e.target.value)} inputMode="numeric" /></label>
            <label>Onderwijsniveau<select value={education} onChange={e => setEducation(e.target.value)}><option>basisschool</option><option>vmbo</option><option>havo</option><option>vwo</option><option>mbo</option><option>hbo</option><option>universiteit</option><option>anders</option></select></label>
            <label>Leerjaar / groep<input value={year} onChange={e => setYear(e.target.value)} /></label>
            <label>Schrijftaal<select value={language} onChange={e => setLanguage(e.target.value)}><option>Nederlands</option><option>English</option><option>Deutsch</option><option>Français</option><option>Español</option><option>Automatisch herkennen</option></select></label>
          </div>

          <div className="divider" />
          <div className="section-heading"><div><span className="step">02</span><h2>Jouw tekst</h2></div><span className="subtle">Wat wil je verbeteren?</span></div>
          <label className="full-label">Mijn doel<select value={goal} onChange={e => setGoal(e.target.value)}><option>Maak mijn tekst duidelijker</option><option>Verbeter spelling en grammatica</option><option>Maak zinnen natuurlijker</option><option>Maak de tekst iets formeler</option><option>Maak de tekst korter en krachtiger</option><option>Geef feedback, maar herschrijf niet alles</option></select></label>
          <label className="full-label text-label">Plak of typ je tekst<textarea className="main-textarea" value={text} onChange={e => setText(e.target.value)} placeholder="Begin hier met schrijven of plak je tekst..." maxLength={12000} /><span className="char-count">{text.length.toLocaleString("nl-NL")} / 12.000</span></label>

          <details className="sample-details">
            <summary><span>＋</span> Laat AI Humanizer kennismaken met jouw schrijfstijl <small>optioneel</small></summary>
            <p>Voeg een stukje tekst toe dat je zelf hebt geschreven. AI Humanizer gebruikt dit alleen om algemene stijlkenmerken te herkennen.</p>
            <textarea value={sample} onChange={e => setSample(e.target.value)} placeholder="Een eerder stukje tekst van jezelf..." maxLength={5000} />
            <span className="char-count">{sample.length.toLocaleString("nl-NL")} / 5.000</span>
          </details>

          {error && <div className="error">{error}</div>}
          <button className="primary-button" onClick={improve} disabled={loading}>{loading ? <><span className="spinner" /> Even nadenken...</> : <>Verbeter mijn tekst <span>→</span></>}</button>
          <p className="privacy-note">Je tekst wordt verstuurd om te verwerken en niet door deze app opgeslagen.</p>
        </div>

        <div className="panel result-panel">
          <div className="section-heading"><div><span className="step">03</span><h2>Jouw verbeterde tekst</h2></div><span className="result-tag">RESULTAAT</span></div>
          {!result && !loading && <div className="empty-state"><div className="empty-icon">✳</div><h3>Hier komt jouw tekst</h3><p>Vul links je tekst in en klik op verbeteren. Je krijgt een versie terug die helder leest en bij jouw niveau past.</p><div className="empty-lines"><i /><i /><i /><i /></div></div>}
          {loading && <div className="empty-state"><div className="loading-orbit" /><h3>Je tekst wordt bekeken</h3><p>We letten op duidelijkheid, taal en jouw eigen schrijfstijl.</p></div>}
          {result && <div className="result-content"><textarea className="result-textarea" value={result.improvedText} onChange={e => setResult({ ...result, improvedText: e.target.value })} /><button className="copy-button" onClick={copyResult}>{copied ? "Gekopieerd ✓" : "Kopieer tekst ↗"}</button><div className="feedback-box"><h3>Wat is aangepast?</h3><p>{result.summary}</p></div><div className="notes-grid"><div><h3>Stijlherkenning</h3><ul>{result.styleNotes?.map((x, i) => <li key={i}>{x}</li>)}</ul></div><div><h3>Controleer zelf nog</h3><ul>{result.checkPoints?.map((x, i) => <li key={i}>{x}</li>)}</ul></div></div></div>}
        </div>
      </section>
      <footer><span>AI Humanizer</span><span>Een hulpmiddel om beter te leren schrijven.</span></footer>
    </main>
  );
}