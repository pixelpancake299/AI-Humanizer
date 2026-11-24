# Draftmate

Een lichte, Nederlandstalige schrijfcoach die lokaal in je browser draait.

## Starten in GitHub Codespaces
De Dev Container start automatisch een statische webserver op poort **8500**. Codespaces forwardt deze poort en opent de website automatisch.

Als de server niet automatisch draait, open dan de terminal en voer uit:

```bash
python3 -m http.server 8500
```

Open daarna tab **Ports** en klik op de doorgestuurde poort 8500.

## Functies
- Nederlandse interface met ondersteuning voor Nederlands, Engels en Duits.
- Contextvelden voor onderwijsniveau, leerjaar en leeftijd.
- Teksteditor, woordenteller en voorbeeldtekst.
- Optioneel voorbeeld van je eigen schrijfstijl.
- Feedback op zinslengte, tekstomvang en herhaling.
- Voorstel met veilige opmaak- en interpunctiecorrecties.
- Kopiëren en verbeterde versie terugzetten in de editor.
- Concept lokaal bewaren in de browser.

## Eerlijk over de huidige versie
Dit is een volledig werkende frontend-demo. De tekstcontrole en correcties draaien lokaal met eenvoudige regels; er is nog geen AI-model of externe API gekoppeld. De tool is bedoeld om je eigen schrijfwerk te verbeteren en ervan te leren, niet om AI-gebruik of detectoren te omzeilen. Je tekst wordt niet naar een server verstuurd.
