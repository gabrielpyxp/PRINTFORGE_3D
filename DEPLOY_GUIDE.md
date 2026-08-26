# 🚀 Deploy PrintForge 3D - Guia Completo

## 🏗️ Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL (Frontend)                        │
│  https://printforge-3d.vercel.app                               │
│  → Build estático React + Vite                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│  RAILWAY (Backend + DB + Java)                                  │
│  https://api.printforge3d.com                                   │
│   ├── Node.js API (Express)     → Porta 3001                    │
│   ├── PostgreSQL (Neon/Railway)                                │
│   └── Java Calculator (Spring Boot) → Porta 8080               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deploy Rápido (3 Passos)

### 1️⃣ Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Configure VITE_API_URL = https://api.seu-dominio.com/api
```

### 2️⃣ Backend → Railway
```bash
# 1. Acesse railway.app → New Project → GitHub → Seu Repo
# 2. Add Service → Dockerfile (backend-node/Dockerfile.prod)
# 3. Add Service → Dockerfile (backend-java/Dockerfile.prod)
# 4. Add Database → PostgreSQL
```

### 3️⃣ Configure Variáveis
```env
# Railway Variables
NODE_ENV=production
JWT_SECRET=sua_chave_64_chars
CORS_ORIGIN=https://printforge-3d.vercel.app
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://printforge-3d.vercel.app
```

---

## 🔧 Variáveis de Ambiente Obrigatórias

### Vercel (Frontend)
```
VITE_API_URL=https://api.seu-dominio.com/api
```

### Railway (Backend)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:senha@host:5432/printforge?sslmode=require
DATABASE_SSL=true

JWT_SECRET=sua_chave_64_chars_aleatoria
JWT_EXPIRES_IN=8h

CORS_ORIGIN=https://printforge-3d.vercel.app

CALCULATOR_SERVICE_URL=http://calculator:8080
CALCULATOR_TIMEOUT_MS=3000
CALCULATOR_STRICT=false
```

---

## 🚀 Deploy Automatizado (GitHub Actions)

O workflow `.github/workflows/deploy.yml` faz tudo automaticamente no push para `main`:

1. **Test & Lint** → Frontend + Backend Node + Java
2. **Build Images** → Docker multi-stage (GHCR)
3. **Deploy Railway** → Backend + Java + PostgreSQL
4. **Deploy Vercel** → Frontend estático
4. **Health Checks** → Verifica `/health` e `/actuator/health`

---

## 🔐 Secrets Necessários (GitHub Settings → Secrets)

| Secret | Descrição |
|--------|-----------|
| `GHCR_TOKEN` | Token GHCR (packages) |
| `RAILWAY_TOKEN` | Token Railway API |
| `VERCEL_TOKEN` | Token Vercel |
| `DB_PASSWORD` | Senha PostgreSQL |
| `JWT_SECRET` | Chave 64 chars aleatória |
| `RAILWAY_TOKEN` | Token Railway API |

---

## 🚀 Deploy Manual (Primeira vez)

```bash
# 1. Frontend
cd frontend
npx vercel --prod

# 2. Backend (Railway)
# Acesse railway.app → New Project → GitHub → Deploy

# 3. Configure DNS
# API: api.seu-dominio.com → Railway
# Frontend: printforge-3d.vercel.app
```

---

## ✅ Checklist Pós-Deploy

- [ ] Frontend carrega em `https://printforge-3d.vercel.app`
- [ ] Login funciona: `admin@lojap3d.local` / `05051320`
- [ ] API health: `https://api.seu-dominio.com/health` → 200 OK
- [ ] Calculadora: `https://api.seu-dominio.com/calculos/precificacao` → 200
- [ ] Dashboard → % dinâmicos, meta card SVG
- [ ] Configurações → altere margem/estoque mínimo
- [ ] Exclusão de venda → estoque volta
- [ ] Upload imagem produto funciona
- [ ] HTTPS ativo em todos domínios
- [ ] CORS configurado corretamente
- [ ] Logs sem erros 500

---

## 🔧 Comandos Úteis

```bash
# Deploy manual
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Logs
docker logs printforge-api --tail 50
docker logs printforge-frontend --tail 20
docker logs printforge-calculator --tail 20

# Parar tudo
docker compose down

# Atualizar código
git pull && docker compose up -d --build

# Backup DB
docker exec printforge-db pg_dump -U printforge printforge > backup.sql
```

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| 404 no Vercel | Verifique `vercel.json` rewrites |
| CORS Error | `CORS_ORIGIN` no Railway = URL Vercel |
| 500 API | `docker logs printforge-api --tail 50` |
| DB Connection | `DATABASE_URL` com `sslmode=require` |
| Java 500 | `docker logs printforge-calculator` |
| Favicon 404 | `favicon.ico` + `favicon.svg` em `/public` |

---

## 📞 Suporte

- Logs API: `docker logs printforge-api --tail 100`
- Logs Frontend: `docker logs printforge-frontend`
- Logs Java: `docker logs printforge-calculator`
- DB: `docker exec printforge-db psql -U printforge -d printforge`