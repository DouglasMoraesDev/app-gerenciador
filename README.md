# Lava-Rápido Manager

Sistema de gerenciamento para lava-rápido e estética automotiva.

## Tecnologias
- **Frontend:** HTML, CSS, JavaScript puro (Fetch API)
- **Backend:** Node.js, Express, Prisma (MySQL)
- **PWA:** `manifest.json` para instalador
- **Deploy:** Railway

## Estrutura de Pastas
```bash
/meu-projeto
├── .env
├── .gitignore
├── README.md
├── package.json
├── prisma/
│   └── schema.prisma
├── public/
│   ├── css/
│   ├── html/
│   ├── js/
│   └── manifest.json
└── src/
    ├── index.js
    ├── prismaClient.js
    ├── routes/
    ├── controllers/
    ├── services/
    ├── middlewares/
    └── utils/






 /meu-projeto
 ├── .env
 ├── .gitignore
 ├── README.md
 ├── package.json
 ├── prisma
 │   └── schema.prisma
 ├── public
 │   ├── css
 │   │   └── styles.css
 │   ├── html
 │   │   ├── index.html
 │   │   ├── login.html
 │   │   ├── dashboard.html
 │   │   ├── os.html           ← página de Ordem de Serviço
 │   │   ├── caixa.html        ← página de Caixa
 │   │   ├── clientes.html     ← página de Clientes
 │   │   └── … (outras pages)
 │   └── js
 │       ├── main.js           ← scripts gerais (ex.: para nav, dom)
 │       ├── auth.js           ← login/logout
 │       ├── os.js             ← lógica de OS (fetch, submit)
 │       ├── caixa.js          ← lógica de Caixa
 │       ├── clientes.js       ← lógica de Clientes
 │       └── … (outros módulos)
 └── src
     ├── index.js              ← ponto de entrada do servidor (Express)
     ├── routes
     │   ├── authRoutes.js     ← rotas de autenticação (login, logout)
     │   ├── osRoutes.js       ← rotas de Ordem de Serviço (CRUD)
     │   ├── caixaRoutes.js    ← rotas de Caixa (abrir, fechar, extrato)
     │   ├── clientesRoutes.js ← rotas de Clientes (CRUD)
     │   └── … (outras rotas: estoque, relatórios etc.)
     ├── controllers
     │   ├── authController.js
     │   ├── osController.js
     │   ├── caixaController.js
     │   ├── clientesController.js
     │   └── … (outros controllers)
     ├── services
     │   ├── osService.js       ← lógica de negócio para OS
     │   ├── caixaService.js    ← lógica de negócio para Caixa
     │   ├── clientesService.js ← lógica de negócio para Clientes
     │   └── … (outros services)
     ├── prismaClient.js        ← instanciação do Prisma Client
     ├── middlewares
     │   ├── authMiddleware.js  ← valida token, sessão etc.
     │   └── errorHandler.js    ← tratamento centralizado de erros
     └── utils
         ├── format.js         ← funções utilitárias (ex.: formata datas)
         └── validators.js     ← validações genéricas (ex.: checa campos)
# app-gerenciador
