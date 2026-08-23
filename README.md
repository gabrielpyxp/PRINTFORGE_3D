# PrintForge — Gestão para Loja de Impressão 3D

Sistema completo (dashboard) para gerenciar sua loja de impressão 3D: cadastro de produtos, controle de vendas, catálogo visual e calculadora de precificação inteligente.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18 + Vite (SPA) — tema escuro preto/vermelho |
| **API Principal** | Node.js 20 + Express 5 + PostgreSQL (Neon) |
| **Microsserviço Cálculo** | Java 21 + Spring Boot 4 |
| **Banco de Dados** | PostgreSQL 16 (Neon) |
| **Containerização** | Docker Compose |

---

## Estrutura do Projeto

```
printforge-3d/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── App.jsx        # App completo (todas as páginas)
│   │   ├── api.js         # Cliente da API
│   │   ├── main.jsx
│   │   └── styles.css     # Tema escuro preto/vermelho
│   └── package.json
│
├── backend-node/          # API Express (Node.js)
│   ├── src/
│   │   ├── config/        # Configuração de ambiente
│   │   ├── controllers/   # Controllers (produtos, vendas, catálogo, etc)
│   │   ├── db/            # Pool PostgreSQL + transactions
│   │   ├── middleware/    # Auth, validação, error handling
│   │   ├── routes/        # Rotas REST
│   │   ├── schemas/       # Validação Zod
│   │   ├── services/      # Integração com calculadora Java
│   │   ├── utils/         # Helpers
│   │   ├── app.js         # Express app
│   │   └── server.js      # Entry point
│   ├── scripts/
│   │   └── create-admin.js
│   ├── Dockerfile
│   └── package.json
│
├── backend-java/          # Microsserviço Calculadora (Spring Boot)
│   ├── src/main/java/com/loja3d/calculadora/
│   │   ├── CalculadoraApplication.java
│   │   ├── precificacao/  # Controller, Service, DTOs
│   │   ├── config/        # CORS
│   │   └── exception/     # Global exception handler
│   ├── pom.xml
│   └── Dockerfile
│
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── docker-compose.yml
└── README.md
```

---

## Requisitos

- **Docker** + **Docker Compose** (recomendado)
- Ou localmente:
  - Node.js ≥ 20
  - Java 21 + Maven
  - PostgreSQL 16 (ou conta no [Neon](https://neon.tech))

---

## Início Rápido (Docker)

```bash
# 1. Clone o repositório
git clone https://github.com/gabrielpyxp/PRINTFORGE_3D.git
cd PRINTFORGE_3D

# 2. Configure variáveis de ambiente
cp backend-node/.env.example backend-node/.env
# Edite backend-node/.env com suas credenciais (JWT_SECRET, DATABASE_URL, etc)

# 3. Suba tudo
docker compose up --build

# 4. Acesse
# Frontend:  http://localhost:5173
# API Node:  http://localhost:3001
# Java Calc: http://localhost:8080
```

---

## Desenvolvimento Local (sem Docker)

### 1. Banco de Dados (Neon)

1. Crie um projeto no [Neon](https://neon.tech)
2. Copie a *connection string pooled*
3. Rode as migrations:

```bash
psql "SUA_CONNECTION_STRING" -f database/migrations/001_initial_schema.sql
```

### 2. Backend Node

```bash
cd backend-node
cp .env.example .env
# Edite .env com DATABASE_URL (do Neon), JWT_SECRET (mín. 32 chars), etc
npm install
npm run create:admin   # Cria usuário admin
npm run dev            # http://localhost:3001
```

### 3. Backend Java (Calculadora)

```bash
cd backend-java
./mvnw spring-boot:run   # http://localhost:8080
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

---

## Variáveis de Ambiente

### backend-node/.env

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | `development` |
| `PORT` | Porta da API | `3001` |
| `DATABASE_URL` | Connection string PostgreSQL (Neon) | `postgresql://user:pass@host/db?sslmode=require` |
| `DATABASE_SSL` | Usar SSL | `true` |
| `JWT_SECRET` | Segredo JWT (mín. 32 chars) | `gere-uma-chave-forte-aqui` |
| `JWT_EXPIRES_IN` | Expiração token | `8h` |
| `CORS_ORIGIN` | Origens permitidas | `http://localhost:5173` |
| `CALCULATOR_SERVICE_URL` | URL do microsserviço Java | `http://localhost:8080` |
| `CALCULATOR_TIMEOUT_MS` | Timeout chamada Java | `3000` |
| `CALCULATOR_STRICT` | Falhar se Java indisponível | `false` |

### frontend/.env

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API Node | `http://localhost:3001/api` |

---

## Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Login (retorna JWT) |

### Produtos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/produtos` | Lista com paginação/filtros |
| `POST` | `/api/produtos` | Cria produto |
| `GET` | `/api/produtos/:id` | Detalha produto |
| `PUT` | `/api/produtos/:id` | Atualiza produto |
| `DELETE` | `/api/produtos/:id` | Remove produto |

### Vendas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/vendas` | Lista com filtros (data, produto, valor) |
| `POST` | `/api/vendas` | Registra venda (auto-cria produto se não existir) |

### Catálogo
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/catalogo` | Lista pública (filtros: busca, categoria, material, preço máx) |

### Configurações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/configuracoes` | Obtém configurações |
| `PUT` | `/api/configuracoes` | Atualiza configurações |

### Calculadora
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/calculos/precificacao` | Calcula preço (usa Java se disponível) |
| `POST` | `/api/calculos` | Salva cálculo no histórico |

---

## Modelo de Dados

```mermaid
erDiagram
    USUARIOS ||--o{ PRODUTOS : "cria"
    FILAMENTOS ||--o{ PRODUTOS : "usado em"
    PRODUTOS ||--o{ VENDAS : "vendido em"
    PRODUTOS ||--o{ CALCULOS : "calculado para"
    CONFIGURACOES }|--|| PRODUTOS : "usa defaults"
```

### Tabelas Principais

- **usuarios** — id, nome, email, senha_hash, papel
- **filamentos** — id, nome, cor, tipo (PLA/ABS/PETG/TPU/Resina), custo_kg
- **produtos** — id, sku, nome, categoria, filamento_id, peso_g, tempo_impressao_h, custo_producao, preco_venda, estoque, imagem_url, ativo
- **vendas** — id, produto_id, quantidade, preco_unitario, margem_lucro_aplicada, data_venda, produto_nome
- **calculos** — id, produto_id, custo_filamento, custo_energia, margem_aplicada, valor_lucro, preco_final
- **configuracoes** — singleton: custo_kwh, margem_lucro_padrao, potencia_impressora_w, estoque_baixo_limite

---

## Calculadora de Precificação

### Fórmulas

```
Custo Filamento = (peso_g / 1000) × custo_kg
Custo Energia   = tempo_h × (potencia_w / 1000) × custo_kwh
Custo Total     = Custo Filamento + Custo Energia
Lucro           = Custo Total × (margem_% / 100)
Preço Final     = Custo Total + Lucro
```

### Entradas
- Peso do filamento (g)
- Custo do filamento (R$/kg)
- Tempo de impressão (h)
- Potência da impressora (W)
- Custo do kWh (R$)
- Margem de lucro desejada (%)

### Saídas (tempo real)
- Custo do filamento
- Custo de energia
- Custo total de produção
- Valor do lucro
- Preço final sugerido

> O microsserviço Java (`backend-java`) executa o cálculo com `BigDecimal` para precisão monetária. Se indisponível, o Node.js replica a mesma fórmula localmente.

---

## Funcionalidades Principais

### 1. Cadastro de Produtos (CRUD)
- Nome, SKU, categoria, filamento, peso, tempo, custos, preço, estoque, imagem
- Status de estoque: Disponível / Baixo / Esgotado

### 2. Módulo de Vendas
- Registro rápido com seleção de produto ou cadastro inline
- **Verificação de duplicidade**: busca por SKU ou nome antes de criar
- Atualização automática de estoque
- Histórico com filtros por data, produto, valor

### 3. Catálogo Visual
- Grade responsiva de cards com imagem, nome, preço
- Filtros: busca, categoria, material, faixa de preço
- Badges de disponibilidade

### 4. Dashboard
- Faturamento, peças vendidas, lucro estimado, alerta de estoque
- Gráfico de faturamento (12 meses)
- Meta do mês, top produtos, vendas recentes

### 5. Configurações
- Potência da impressora, custo kWh, margem padrão, limite estoque baixo
- Persistidas no banco (singleton)

---

## Autenticação

- JWT em header `Authorization: Bearer <token>`
- Expiração configurável (`JWT_EXPIRES_IN`)
- Criar admin: `npm run create:admin` (usa `ADMIN_EMAIL`, `ADMIN_PASSWORD` do .env)

---

## Deploy em Produção

### Neon (Banco)
- Use a *pooled connection string* do Neon
- `DATABASE_SSL=true`

### Variáveis Críticas
```env
NODE_ENV=production
JWT_SECRET=chave-muito-forte-com-64-caracteres-aleatorios
CORS_ORIGIN=https://seu-dominio.com
CALCULATOR_STRICT=true
```

### Docker Produção
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Scripts Úteis

```bash
# Backend Node
cd backend-node
npm run dev           # Dev com watch
npm run start         # Produção
npm run check         # Type-check (syntax)
npm run create:admin  # Cria usuário admin

# Backend Java
cd backend-java
./mvnw test           # Testes
./mvnw package        # Build JAR

# Frontend
cd frontend
npm run dev           # Dev server
npm run build         # Build produção (dist/)
npm run preview       # Preview build
```

---

## Licença

MIT — uso livre para sua loja de impressão 3D.