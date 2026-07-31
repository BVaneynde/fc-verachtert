# FC Verachtert Wedstrijdtracker

Een mobiel-responsive web app om wedstrijdgegevens van FC Verachtert centraal bij te houden. Automatische Google Calendar sync, statistieken per speler, admin-only data entry.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm of yarn
- Supabase account (gratis)

### Installation

1. **Clone & setup**
```bash
cd FcVerachtert
npm install -g nodemon
```

2. **Backend setup**
```bash
cd backend
npm install
cp ../.env.example ../.env
# Edit .env with Supabase credentials
npm run dev
```

3. **Frontend setup** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Database setup**
- Maak Supabase project aan: https://supabase.com
- Voer de SQL schema uit: `backend/db/schema.sql` in Supabase SQL editor
- Kopieer SUPABASE_URL en SUPABASE_ANON_KEY naar `.env`

5. **Open browser**
- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

## 📁 Project Structure

```
FcVerachtert/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components (Dashboard, MatchDetail, etc)
│   │   ├── utils/        # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/              # Node.js + Express API
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── db/              # Database schema
│   ├── server.js
│   └── package.json
├── .env.example         # Environment variables template
└── README.md
```

## 🔑 Admin Credentials

- **benjamin@fcverachtert.be** - Hoofd admin
- **lander@fcverachtert.be** - Medeadmin

Setup via: `POST /api/auth/register` (eenmalig)

## 📊 Features

✅ Dashboard - Komende/afgelopen wedstrijden  
✅ Match Detail - Score, spelers, doelpunten, kaarten invoeren  
✅ Statistieken - Doelpunten, kaarten per speler  
✅ Google Calendar - Automatisch ophalen en synchroniseren  
✅ Admin Panel - Spelers & events beheren  
✅ Mobile Responsive - Optimized voor iPhone/Android  

## 🗂️ Database Schema

- **users** - Admin authentication
- **players** - Spelerslijst
- **matches** - Wedstrijdgegevens
- **match_appearances** - Aanwezigheid + stats per speler
- **calendar_events** - Google Calendar sync

## 🌐 Deployment

- **Frontend**: Vercel (free)
- **Backend**: Railway/Render (free)
- **Database**: Supabase (free)

## 📝 Next Steps

1. Supabase project aanmaken
2. Database schema draaien
3. Admin accounts setup
4. Google Calendar link configureren
5. Frontend styling afmaken
6. Testing op iPhone

## 📞 Support

Voor vragen: benjamin@fcverachtert.be
