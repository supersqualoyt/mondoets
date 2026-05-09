# MondoEts

Portale del terzo settore italiano. Progetto di Sesto Potere APS.

Stack: Next.js 15 + Prisma + MySQL + TypeScript + Tailwind v4.

## Setup locale

```powershell
cd D:\sitiweb\MondoEts
npm install
copy .env.example .env
# poi modifica DATABASE_URL nel .env
```

DB MySQL locale (XAMPP / Hetzner CloudPanel / Docker):

```powershell
npx prisma generate
npx prisma db push
npm run seed       # carica 10 ETS dummy
npm run dev        # http://localhost:3020
```

## Import dump RUNTS

Mettere i file CSV scaricati da `servizi.lavoro.gov.it` in `data/runts/`, poi:

```powershell
npm run import-runts -- data/runts/runts-aps.csv data/runts/runts-odv.csv
```

Lo script tenta di rilevare il delimitatore (`,` o `;`) e mappa le intestazioni note. Se il dump usa nomi colonna diversi, modificare `MAP` in `scripts/import-runts.ts`.

## Comandi utili

| Comando | Azione |
|---|---|
| `npm run dev` | dev server porta 3020 |
| `npm run build` | build production |
| `npm run start` | start production |
| `npm run db:push` | sincronizza schema Prisma con MySQL |
| `npm run db:studio` | apri Prisma Studio |
| `npm run seed` | carica ETS dummy |
| `npm run import-runts -- <file>` | import dump RUNTS |
| `npm run lint` | ESLint |

## Struttura

```
src/
  app/
    page.tsx                 # homepage
    cerca/page.tsx           # ricerca ETS
    ets/[slug]/page.tsx      # scheda singolo ETS
    sezione/page.tsx         # indice 7 sezioni RUNTS
    sezione/[sezione]/page.tsx
    regione/page.tsx
    regione/[regione]/page.tsx
    diventa-socio/page.tsx
    sitemap.ts, robots.ts
  components/
    Header.tsx, Footer.tsx, SearchBar.tsx
  lib/
    db.ts                    # Prisma client singleton
    seo.ts                   # buildMetadata + costanti
    format.ts                # slugify, formatDateIt, ...
    sezioni.ts               # le 7 sezioni RUNTS
prisma/
  schema.prisma              # Ets, Regione, Provincia, Comune, NewsletterSubscriber, ToolUsage
scripts/
  seed.ts                    # 10 ETS dummy
  import-runts.ts            # importer CSV RUNTS
data/
  runts/                     # dump CSV (gitignored)
```

## Deploy Hetzner CloudPanel

Vedi `D:\sitiweb\NUOVO-SITO-CHECKLIST.md`. Porta assegnata: **3020**.

Step:
1. SSH server → `adduser mondoets`
2. `git clone` in `/home/mondoets/htdocs/mondoets.it`
3. `.env` con `DATABASE_URL` MySQL CloudPanel + `SITE_URL=https://mondoets.it`
4. `npm install && npx prisma generate && npx prisma db push`
5. `npm run build`
6. `pm2 start node_modules/.bin/next --name mondoets -- start -p 3020 && pm2 save`
7. Nginx reverse proxy → `localhost:3020`
8. `certbot --nginx -d mondoets.it -d www.mondoets.it`
