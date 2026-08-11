# 🍔 Biglee Burguer

Sistema de pedidos online para a hamburgueria Biglee Burguer.

## Stack

- **Back-end**: Node.js + Express + SQLite (better-sqlite3)
- **Front-end cliente**: HTML/CSS/JS puro, sem framework
- **Front-end admin**: HTML/CSS/JS puro
- **Auth**: JWT
- **Pagamento**: Mercado Pago (opcional - funciona em modo simulação)

## Como rodar

### 1. Instalar dependências
```bash
cd Back-End
npm install
```

### 2. Iniciar o servidor
```bash
npm start
```
ou duplo-clique em `iniciar.bat` na raiz do projeto.

### 3. Acessar
- **Cliente**: http://localhost:3000/cliente/
- **Admin**: http://localhost:3000/admin/login.html

Login admin padrão (trocar no primeiro acesso):
- E-mail: `admin@bigleeburger.com`
- Senha: `admin123`

## Estrutura

```
Biglee Burguer/
├── Back-End/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   │   ├── database.js      # conexão + migrations + seeds
│   │   │   ├── biglee.db        # banco SQLite (gerado)
│   │   │   └── migrations/      # scripts pontuais
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env                     # configuração local (não versionado)
│   ├── .env.example             # template do .env
│   └── package.json
├── Front-End/
│   ├── cliente/                 # cardápio, checkout, index
│   └── admin/                   # login + dashboard
├── iniciar.bat                  # atalho Windows pra subir tudo
└── README.md
```

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/categorias | Lista categorias |
| GET | /api/produtos | Lista produtos (filtro `?categoria=slug`) |
| POST | /api/auth/login | Login admin (retorna JWT) |
| POST | /api/pedidos | Cria pedido (público) |
| GET | /api/pedidos/:codigo | Consulta pedido por código |
| GET | /api/pedidos | Lista pedidos (admin) |
| PATCH | /api/pedidos/:id/status | Atualiza status (admin) |
| GET | /api/admin/dashboard | Métricas do dia (admin) |

## Migrações

Scripts em `Back-End/src/database/migrations/` rodam **uma vez** quando chamados via `node`:

```bash
cd Back-End
node src/database/migrations/002-novo-cardapio.js
```

O `database.js` já roda migrations + seeds automaticamente no startup, então bancos novos já vêm com o cardápio preenchido.

## Backup

O banco fica em `Back-End/src/database/biglee.db`. Pra restaurar um backup, basta parar o servidor e substituir o arquivo.

## Produção

Antes de subir pra produção:
1. Trocar `JWT_SECRET` por uma chave forte
2. Trocar a senha do admin
3. Configurar `MP_ACCESS_TOKEN` do Mercado Pago
4. Servir atrás de HTTPS (Nginx, Caddy, etc.)
5. Trocar `localhost` nas meta tags `og:url` pelo domínio real
