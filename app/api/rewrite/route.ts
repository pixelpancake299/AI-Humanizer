import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "De API-key ontbreekt. Voeg OPENAI_API_KEY toe aan je Codespaces Secrets en herstart de Codespace." }, { status: 503 });
    }

    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const sample = typeof body.sample === "string" ? body.sample.trim() : "";
    const age = String(body.age ?? "15");
    const education = String(body.education ?? "havo");
    const year = String(body.year ?? "4");
    const language = String(body.language ?? "Nederlands");
    const goal = String(body.goal ?? "Maak mijn tekst duidelijker");

    if (!text) return NextResponse.json({ error: "Vul eerst een tekst in." }, { status: 400 });
    if (text.length > 12000 || sample.length > 5000) {
      return NextResponse.json({ error: "Je tekst mag maximaal 12.000 tekens zijn en je voorbeeldtekst maximaal 5.000." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Je bent AI Humanizer, een vriendelijke schrijfcoach. Help leerlingen hun eigen tekst te verbeteren, niet om schoolwerk te verbergen of AI-detectie te omzeilen. Behoud de inhoud, bedoeling en persoonlijke stem van de schrijver. Verzin geen feiten, bronnen, citaten of ervaringen. Maak de tekst passend bij leeftijd, onderwijsniveau en leerjaar. Geef prioriteit aan natuurlijk, helder Nederlands; andere talen zijn ook mogelijk. Gebruik een eventueel voorbeeld alleen om algemene stijlkenmerken te herkennen, kopieer geen inhoud. Houd de tekst geloofwaardig en niet overdreven formeel. Als de tekst al goed is, verander dan weinig. Antwoord uitsluitend als JSON met de velden: improvedText (string), summary (string), styleNotes (array strings), checkPoints (array strings).`
        },
        {
          role: "user",
          content: `Taal: ${language}
Leeftijd: ${age}
Onderwijsniveau: ${education}
Leerjaar/groep: ${year}
Doel: ${goal}

Voorbeeld van eigen schrijfstijl (optioneel):
${sample || "Geen voorbeeld opgegeven."}

Tekst om te verbeteren:
${text}`
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("De AI gaf geen antwoord terug.");
    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Humanizer API error:", error);
    return NextResponse.json({ error: "Er ging iets mis bij het verbeteren. Controleer je API-instellingen en probeer het opnieuw." }, { status: 500 });
  }
}