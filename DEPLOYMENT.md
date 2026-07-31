# 🚀 Deployment Guide - FC Verachtert Wedstrijdtracker

## STAP 1: GitHub Repository Setup

### 1.1 Create GitHub Repository
1. Ga naar https://github.com/new
2. Repository name: `fc-verachtert`
3. Description: `Wedstrijdtracker app voor FC Verachtert`
4. Kies: **Public** (gratis deployment)
5. Click "Create repository"

### 1.2 Push Code to GitHub
```powershell
cd "C:\Users\bvaneynde\OneDrive - Batenburg Techniek N.V\Documenten\Privé\FcVerachtert"
git add .
git commit -m "Initial commit: Werkende wedstrijdtracker app"
git branch -M main
git remote add origin https://github.com/[JE_USERNAME]/fc-verachtert.git
git push -u origin main
```

---

## STAP 2: Backend Deployment (Railway of Render)

### 2.1 Kies Railway (sneller & makkelijker)
1. Ga naar https://railway.app
2. Sign up met GitHub account
3. Click "Create New Project"
4. Kies "Deploy from GitHub repo"
5. Selecteer `fc-verachtert` repo
6. Railway detecteert Node.js automatisch

### 2.2 Environment Variables configureren
In Railway dashboard, ga naar "Variables":
```
BACKEND_PORT=5000
NODE_ENV=production
SUPABASE_URL=https://kfiojvijdzwmvywxchsi.supabase.co
SUPABASE_ANON_KEY=sb_publishable_0h9xYceJo9GNqxnHwre50Q_bPFDZDXB
SUPABASE_SERVICE_ROLE_KEY=sb_secret_gEKTrzj9le27mSeVpA1DPA_z0WkBaGe
JWT_SECRET=afa323b4d91da25091148fc16bcbd214d17948811d420d0e5bec6526f6db17b1
GOOGLE_CALENDAR_URL=https://calendar.google.com/calendar/ical/fcverachtert%40gmail.com/public/basic.ics
```

### 2.3 Deploy
- Railway deployed automatisch
- Je krijgt URL: `https://[project-name].up.railway.app`
- Kopieer deze URL - nodig voor frontend!

---

## STAP 3: Frontend Deployment (Vercel)

### 3.1 Update Environment Variables
Bewerk `.env` file:
```
VITE_BACKEND_URL=https://[railway-backend-url]  # Vervang met je Railway URL
VITE_SUPABASE_URL=https://kfiojvijdzwmvywxchsi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_0h9xYceJo9GNqxnHwre50Q_bPFDZDXB
GOOGLE_CALENDAR_URL=https://calendar.google.com/calendar/ical/fcverachtert%40gmail.com/public/basic.ics
```

### 3.2 Push naar GitHub
```powershell
git add .env frontend/
git commit -m "Update backend URL for production"
git push
```

### 3.3 Deploy op Vercel
1. Ga naar https://vercel.com
2. Sign up met GitHub
3. Click "Import Project"
4. Selecteer `fc-verachtert` repo
5. Environment variables instellen:
   - `VITE_BACKEND_URL` = je Railway backend URL
   - `VITE_SUPABASE_URL` = hierboven
   - `VITE_SUPABASE_ANON_KEY` = hierboven

6. Click "Deploy"
7. Wacht ~3-5 minuten
8. Je krijgt URL: `https://[project-name].vercel.app`

---

## STAP 4: Testing

### 4.1 Desktop Browser
```
https://[project-name].vercel.app
Login: benjamin@fcverachtert.be
Wachtwoord: FCV_Benjamin
```

### 4.2 iPhone Testing
1. Op dezelfde WiFi als laptop
2. Open Safari: `https://[vercel-url].vercel.app`
3. Test responsive design
4. Test touch inputs (checkboxes, number inputs)

### 4.3 Checklist
- [ ] Dashboard laadt
- [ ] Wedstrijden zichtbaar
- [ ] Login werkt
- [ ] Admin panel beschikbaar
- [ ] Google Calendar sync werkt
- [ ] Wedstrijddata opslaan werkt
- [ ] Statistieken tonen correct
- [ ] Mobile responsive

---

## STAP 5: Maintenance

### Updates pushen
```powershell
# Maak wijzigingen in je code
git add .
git commit -m "Fix: [beschrijving]"
git push

# Vercel/Railway auto-deploy na push!
```

### Database backups
- Supabase maakt automatisch backups
- Dashboard: https://supabase.com/dashboard

---

## 🎉 Je app is live!

**Live URL:** `https://[vercel-url].vercel.app`

**Wat nu?**
- Deel link met team
- Voeg meer wedstrijden toe
- Invullen speler data na elke wedstrijd
- Monitor performance

**Support:**
- Vercel logs: https://vercel.com/dashboard
- Railway logs: https://railway.app/dashboard
- Supabase logs: https://supabase.com/dashboard

---

## Troubleshooting

### Fout: "Cannot find module"
→ Railway: Zorg dat alle env vars ingesteld zijn
→ Vercel: Rebuild project (Settings → Deployments → Rebuild)

### Fout: "Cannot connect to backend"
→ Controleer VITE_BACKEND_URL in Vercel
→ Zorg dat Railway backend draait (check logs)

### Fout: "Database connection failed"
→ Controleer SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY
→ Test in Supabase dashboard zelf

---

**Succes met deployment! 🚀**
