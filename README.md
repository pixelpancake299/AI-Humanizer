# Draftmate — AI-schrijfcoach

Een Nederlandstalige AI-schrijfcoach die spelling, duidelijkheid en formulering verbetert en daarbij rekening houdt met jouw leeftijd, onderwijsniveau, doelen en optionele schrijfstijlvoorbeeld.

## Benodigdheden
- Node.js 20 of hoger en npm.
- Een OpenAI API-key voor tekstverbetering.

## Lokaal starten

```bash
npm ci
cp .env.example .env
```

Zet je API-key in `.env`:

```env
OPENAI_API_KEY=je_openai_api_key
# Optioneel; standaard gpt-4o-mini
OPENAI_MODEL=gpt-4o-mini
```

Start de applicatie:

```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080). De server levert de website en de beveiligde `/api/humanize`-route vanaf dezelfde origin. De API-key blijft op de server en wordt nooit naar de browser gestuurd. Zonder API-key start de website wel, maar geeft verbeteren een duidelijke configuratiefout.

Voor automatisch herstarten tijdens ontwikkeling: `npm run dev`.

## GitHub Codespaces

De Dev Container installeert dependencies bij het aanmaken en start de volledige Node-app op poort **8080**. Codespaces forwardt de poort en opent de homepage automatisch; de AI-route blijft op dezelfde origin beschikbaar. Stel `OPENAI_API_KEY` in als Codespaces-secret (of lokaal in `.env`); zet de sleutel niet in frontendbestanden of commits.

## Gebruik en privacy

- Kies taal, onderwijsniveau, leerjaar/klas, leeftijd, gewenste stijl en een of meer verbeterdoelen.
- Voeg optioneel een eerder zelfgeschreven tekst toe. De coach leidt hier stijlkenmerken uit af, maar gebruikt die tekst niet als opdracht.
- Resultaten zijn rechtstreeks bewerkbaar, kopieerbaar en opnieuw te verbeteren.
- De oorspronkelijke tekst en het stijlvoorbeeld worden alleen voor de aanvraag naar de OpenAI API gestuurd. De app slaat ze niet op in de browser of op de server.
- Invoer is begrensd tot 12.000 tekens; het stijlvoorbeeld tot 5.000 tekens.
- De coach hoort geen feiten, argumenten of voorbeelden toe te voegen. Controleer altijd zelf of formulering en betekenis kloppen.

## Tests

```bash
npm test
```

De tests controleren de homepage en health-route, een volledige gesimuleerde AI-aanvraag, invoerlimieten, ontbrekende API-key en tijdelijke upstream-fouten. Een echte tekstverbetering vereist een geldige OpenAI API-key.
