# AI Humanizer

AI Humanizer is een schrijfcoach die leerlingen helpt hun teksten duidelijker en natuurlijker te maken, met behoud van hun eigen schrijfstijl. Nederlands krijgt prioriteit; Engels, Duits, Frans en Spaans worden ook ondersteund.

## GitHub Codespaces
De Dev Container installeert dependencies, start Next.js automatisch en opent poort 3000 in de browser.

Voeg `OPENAI_API_KEY` toe via **Repository Settings → Secrets and variables → Codespaces**. De key blijft server-side en hoort nooit in Git. Als je de secret pas hebt toegevoegd nadat de Codespace gestart is, stop en start de Codespace opnieuw.

## Techniek
- Next.js 15, React 19 en TypeScript
- OpenAI API via de server-side route `/api/rewrite`
- Model: `gpt-4o-mini`

API-gebruik wordt apart door OpenAI gefactureerd en valt niet onder een ChatGPT-abonnement.

## Lokaal starten
1. Voer `npm install` uit.
2. Maak `.env.local` met `OPENAI_API_KEY=jouw_api_key`.
3. Voer `npm run dev` uit.
4. Open poort 3000.

## Privacy
De app slaat teksten niet op in een eigen database. Teksten worden wel naar de OpenAI API verstuurd om te worden verwerkt. Deel geen wachtwoorden of andere gevoelige informatie.

AI Humanizer is bedoeld als schrijfcoach en leermiddel, niet om AI-gebruik te verbergen of detectiesystemen te omzeilen. Controleer suggesties altijd zelf.