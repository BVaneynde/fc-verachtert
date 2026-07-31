# Plan: FC Verachtert Wedstrijdtracker App

## TL;DR
Bouwen van een mobiel-responsive web app (React) met Node.js/Express backend en Supabase database om wedstrijdgegevens van FC Verachtert centraal op te slaan. Automatisch ophalen van Google Calendar, admin-only data entry, publieke read-only access, statistieken per speler (doelpunten, kaarten, aantal matchen), gratis hosting.

**Recommended tech stack:**
- **Frontend:** React + Vite (mobiel-responsive, snelle dev)
- **Backend:** Node.js + Express (eenvoudig, gratis hosting)
- **Database:** Supabase (PostgreSQL, gratis tier voldoende)
- **Hosting:** Vercel (frontend gratis), Railway of Render (backend gratis tier)
- **Calendar:** Google Calendar API v3

---

## Steps

### Fase 1: Setup & Data Model (Start hier)

1. **Project scaffolding**
   - React (Vite) voor frontend
   - Express server voor backend
   - Supabase project aanmaken (gratis)
   - Git repository initialiseren

2. **Database schema ontwerpen** (Supabase PostgreSQL)
   - `matches` tabel: date, opponent, score_home, score_away, location, notes, is_official_match (boolean)
   - `players` tabel: name, number, is_active
   - `match_appearances` tabel: match_id, player_id, was_present, goals, yellow_cards, red_cards
   - `calendar_events` tabel: google_event_id, title, date, is_match (boolean) — voor onthouden of event een wedstrijd is
   - `users` tabel: email, role (admin/viewer), auth_token
   
3. **Backend API endpoints bouwen** (Express)
   - `GET /api/matches` — alle wedstrijden met stats
   - `GET /api/matches/:id` — details van één match
   - `POST /api/matches` — nieuw match toevoegen (admin-only)
   - `PUT /api/matches/:id` — match updaten (admin-only)
   - `POST /api/matches/:id/appearances` — speler-gegevens invoeren
   - `GET /api/players/stats` — statistieken (doelpunten, kaarten, aantal matchen)
   - `POST /api/calendar/sync` — Google Calendar ophalen
   - `PUT /api/calendar/:eventId/mark-as-match` — event als wedstrijd markeren
   - Auth endpoints: login, register (admin setup)

### Fase 2: Google Calendar Sync (Parallel met Fase 1)

4. **Google Calendar integratie**
   - Google Calendar API OAuth setup
   - Maandelijks/wekelijks events ophalen
   - Automatisch events in `calendar_events` opslaan
   - Logica: als `is_match = true` en datum in toekomst → toon in "Upcoming Matches"
   - Bij eerste sync: user kiest welke events matches zijn (onderscheid BBQ/events vs. wedstrijden)

### Fase 3: Frontend UI (Na Fase 1 API)

5. **Overzicht/Dashboard pagina**
   - Komende wedstrijden (uit Google Calendar)
   - Afgelopen resultaten
   - Top scorers, meeste kaarten (stats)

6. **Wedstrijd detail pagina**
   - Score invoeren
   - Spelers aanwezig/afwezig markeren
   - Per speler: doelpunten, gele kaarten toevoegen
   - Notities/opmerkingen
   - Admin-only edit button

7. **Seizoen overzicht/statistieken pagina**
   - Tabel: spelers met doelpunten, kaarten, aantal gespeelde matchen
   - Filter options (sorteer op doelpunten/kaarten/matchen)

8. **Admin panel**
   - Spelers beheren (toevoegen/verwijderen)
   - Kalendergebeurtenissen taggen als wedstrijd/event
   - User management (viewers toevoegen)

9. **Mobile responsiveness**
   - Tailwind CSS of similar voor mobile-first design
   - Touch-friendly inputs (grote buttons, swipe navigation)

### Fase 4: Auth & Deployment

10. **Authentication**
    - Simple JWT-based auth (email/password voor admin)
    - Supabase auth helpers gebruiken
    - Public pages: read-only (geen login nodig)
    - Protected pages: admin-only (login vereist)

11. **Deployment**
    - Frontend → Vercel (free tier)
    - Backend → Railway of Render (free tier)
    - Database → Supabase (free tier, PostgreSQL)
    - GitHub Actions voor CI/CD (optioneel)

### Fase 5: Testing & Refinement

12. **Testing**
    - Manueel testen: Google Calendar sync, match data entry, stats berekening
    - Test op iPhone/Android via browser
    - Verifieer permissions (admin edit, viewer read-only)

13. **Performance optimalisatie** (indien nodig)
    - Cachen van statistieken als dataset groter wordt
    - Paginate matches als nodig

---

## Relevant files
*Zullen worden aangemaakt tijdens implementatie:*
- `frontend/src/components/Dashboard.jsx` — overzicht pagina
- `frontend/src/components/MatchDetail.jsx` — match invoer pagina
- `frontend/src/components/Statistics.jsx` — seizoenstatistieken
- `backend/routes/matches.js` — match endpoints
- `backend/routes/calendar.js` — Google Calendar sync
- `backend/db/schema.sql` — database schema
- `.env` files (secrets voor Google API, Supabase, etc.)

---

## Verification

1. **Calendar sync werkt**
   - Google Calendar events verschijnen in app
   - Admin kan event als "wedstrijd" taggen (BBQ blijft event)
   - Tagged events zijn niet vergeten na pagina reload

2. **Match data entry**
   - Admin kan score + spelers + doelpunten/kaarten invoeren
   - Data wordt opgeslagen in database
   - Anderen kunnen data zien maar niet wijzigen

3. **Statistieken kloppen**
   - Doelpunten/kaarten per speler correct geteld
   - "Aantal matchen" = aantal matchen waar speler aanwezig was

4. **Responsief design**
   - App werkt goed op iPhone (testen via browser)
   - Alle inputs zijn touch-friendly

5. **Gratis hosting**
   - Frontend draait op Vercel
   - Backend draait op Railway/Render
   - Database draait op Supabase
   - Geen maandelijkse kosten

---

## Confirmed Requirements

✅ **Calendar:** Openbare link ophaalbaar van https://fcverachtert.jouwweb.be/kalender

✅ **Admin accounts (2):**
- benjamin@fcverachtert.be (hoofd admin)
- lander@fcverachtert.be (medeadmin)
- Overige spelers: read-only access (geen login nodig)

✅ **Spelerslijst (22 startspelers, flexibel uitbreidbaar):**
Tijs, Nathan, Remko, Lander T, Lander V, Benjamin, Tom, Niels, Stef B, Putte, Simon, Karel, Floure, Stan, Jelle, Lukas, Geert, Wout, Jorrit, Arne, Lennert, Jens
- Admin kan te allen tijde spelers toevoegen/verwijderen via admin panel
- Geen vaste rugnummers

---

## Decisions & Scope

**Included:**
- Google Calendar sync (automatisch ophalen van https://fcverachtert.jouwweb.be/kalender)
- Match result entry (score, spelers, doelpunten, kaarten)
- Statistieken (doelpunten, kaarten, aantal matchen per speler)
- Admin-only edit (Benjamin + Lander), public read-only access
- Mobile-responsive web app
- Gratis hosting

**Explicitly excluded (v1):**
- Speelminuten bijhouden
- Assists bijhouden
- Video uploads/match replays
- SMS/push notifications
- Offline-first (app vereist internet)

**Assumptions:**
- Calendar link is openbaar/zonder inloggen toegankelijk (via website)
- 22 spelers + 30-40 matchen/seizoen past gemakkelijk in gratis Supabase tier
- Beide admins kunnen events taggen als wedstrijd/event (via admin panel)

---

## Further Considerations

1. **Calendar parsing**
   - Aanbeveling: Na calendar link ophalen, implementeer iCal parser (Node.js iCalendar library) om events uit te lezen
   - Voor eerste sync: Benjamin + Lander kunnen events manually taggen als wedstrijd (eenmalig)

2. **Gratis tier limiteringen**
   - Railway/Render free tier: 750 uur/maand (voldoende)
   - Supabase free tier: 500 MB storage (voldoende)
   - Aanbeveling: Monitor na 1-2 seizoenen, upgrade if needed