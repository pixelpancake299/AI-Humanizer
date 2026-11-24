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

## GitHub Codespaces en API-key instellen

De Dev Container installeert dependencies bij het aanmaken en start de volledige Node-app op poort **8080**. Codespaces forwardt de poort en opent de homepage automatisch; de AI-route blijft op dezelfde origin beschikbaar.

1. Maak een API-key aan op [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Gebruik de volledige sleutel die OpenAI toont; dit is niet je ChatGPT-wachtwoord of ChatGPT-abonnement. Deel de sleutel niet in chat of code.
2. Open in GitHub **Repository → Settings → Secrets and variables → Codespaces → New repository secret**. Vul bij **Name** exact `OPENAI_API_KEY` in en bij **Secret** de volledige OpenAI API-key. Geef de Codespace toegang tot deze repository-secret.
3. Herstart of rebuild de Codespace zodat de secret als omgevingsvariabele aan de server wordt doorgegeven. De server leest die variabele bij het opstarten.

Een gewone **Actions secret** is niet automatisch beschikbaar in Codespaces; kies expliciet **Codespaces**. Voor lokaal gebruik kun je in de repositoryroot `.env` aanmaken (kopieer `.env.example`) en daar `OPENAI_API_KEY=je_volledige_openai_api_key` zetten. `.env` wordt door Git genegeerd en mag niet worden gecommit. Als de sleutel ontbreekt, start de website nog steeds, maar tekstverbetering geeft een configuratiefout.

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
