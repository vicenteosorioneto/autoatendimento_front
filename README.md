# Autoatendimento Frontend

SPA em React para autoatendimento de restaurante, com dois fluxos no mesmo projeto:

- **Cliente da mesa**: acesso por rota da mesa, visualização de cardápio, montagem de carrinho, envio de pedido e consulta de conta.
- **Cozinha**: login com token administrativo, painel de pedidos pendentes/em preparo e atualização de status dos pedidos.

## 1. Descrição da Aplicação

Esta aplicação frontend consome uma API HTTP e entrega:

- navegação por rotas para jornada da mesa (`/mesa/:tableId/*`);
- persistência local de carrinho por mesa;
- recuperação automática de sessão da mesa quando necessário;
- painel da cozinha protegido por token salvo em `localStorage`.

## 2. Stack Tecnológica

- React 19
- TypeScript
- Vite 7
- React Router DOM 7
- Axios
- ESLint 9
- Tailwind CSS (dependência/configuração presente no projeto)

## 3. Estrutura de Pastas

```text
autoatendimento_front/
├─ src/
│  ├─ components/
│  │  ├─ MesaLayout.tsx
│  │  ├─ ErrorState.tsx
│  │  └─ kitchen/RequireAdminAuth.tsx
│  ├─ contexts/
│  │  ├─ CartContext.tsx
│  │  ├─ SessionContext.tsx
│  │  ├─ cartContext.ts
│  │  ├─ sessionContext.ts
│  │  ├─ useCart.ts
│  │  └─ useSession.ts
│  ├─ hooks/
│  │  └─ useAdminToken.ts
│  ├─ lib/
│  │  └─ api.ts
│  ├─ pages/
│  │  ├─ Landing.tsx
│  │  ├─ Menu.tsx
│  │  ├─ Order.tsx
│  │  ├─ Account.tsx
│  │  ├─ Success.tsx
│  │  └─ kitchen/
│  │     ├─ KitchenLogin.tsx
│  │     └─ KitchenDashboard.tsx
│  ├─ types/
│  │  ├─ cart.ts
│  │  ├─ session.ts
│  │  └─ kitchen.ts
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ App.css
│  └─ index.css
├─ package.json
├─ vite.config.ts
├─ tailwind.config.js
└─ postcss.config.js
```

## 4. Variáveis de Ambiente

O frontend usa apenas a variável abaixo no código atual:

- `VITE_API_URL`: URL base da API consumida por `src/lib/api.ts`.

Exemplo de arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

## 5. Como Rodar Localmente

1. Entre na pasta do frontend:

   ```bash
   cd autoatendimento_front
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o `.env` com `VITE_API_URL`.

4. Inicie em desenvolvimento:

   ```bash
   npm run dev
   ```

5. Abra a URL exibida pelo Vite (normalmente `http://localhost:5173`).

## 6. Scripts Disponíveis

Scripts definidos em `package.json`:

- `npm run dev`: inicia servidor de desenvolvimento Vite.
- `npm run build`: executa `tsc -b` e gera build de produção com Vite.
- `npm run lint`: executa ESLint no projeto.
- `npm run preview`: serve localmente o build gerado.

## 7. Fluxo da Aplicação

### Rotas existentes

- `/` → `Landing`
- `/mesa/:tableId` → `Menu`
- `/mesa/:tableId/pedido` → `Order`
- `/mesa/:tableId/conta` → `Account`
- `/mesa/:tableId/sucesso` → `Success`
- `/cozinha/login` → `KitchenLogin`
- `/cozinha` → `KitchenDashboard` (protegida por `RequireAdminAuth`)

### Cliente da Mesa

#### `/mesa/:tableId`

- Carrega cardápio via `GET /tables/:tableId/menu`.
- Salva `sessionId` no `SessionContext` com retorno da API.
- Salva `tableId` atual no `SessionContext`.

#### Carrinho

- Estado global via `CartProvider` (aplicado em `MesaLayout`).
- Persistência por mesa em `localStorage` com chave `mesa_social_cart_${tableId}`.
- Itens podem ser adicionados no `Menu`, ajustados/removidos no `Order`.

#### Envio de pedido

- Em `Order`, envia `POST /sessions/:sessionId/orders` com itens e `clientRequestId`.
- `clientRequestId` pendente é persistido em `localStorage` na chave `mesa_social_pending_request_${tableId}` (idempotência de reenvio).
- Após sucesso: limpa chave pendente, limpa carrinho e redireciona para `/mesa/:tableId/sucesso`.

#### Consulta de conta

- Em `Account`, busca resumo via `GET /sessions/:sessionId/summary`.
- Se não houver `sessionId`, o app permite acionar recuperação de sessão.

### Persistência e recuperação de `sessionId`

- `SessionProvider` detecta `tableId` pela URL (`/mesa/:tableId`).
- Quando há `tableId` e `sessionId` é `null`, tenta recuperar sessão via `GET /tables/:tableId/menu`.
- Existe controle de retry (janela de 5 segundos) para evitar tentativas seguidas.

### Cozinha

#### `/cozinha/login`

- Recebe token no formulário.
- Salva token em `localStorage` com chave `adminToken`.
- Redireciona para `/cozinha`.

#### Autenticação da cozinha

- `RequireAdminAuth` bloqueia `/cozinha` sem token e redireciona para `/cozinha/login`.
- `KitchenDashboard` também valida token em runtime e faz logout automático em `401`.

#### Dashboard e atualização de status

- Polling a cada 5s:
  - `GET /orders?status=PENDING`
  - `GET /orders?status=PREPARING`
- Atualização de status:
  - `PATCH /orders/:orderId/status` com `PREPARING` ou `READY`
- Todas as chamadas administrativas enviam header `x-admin-token`.

## 8. Pontos de Atenção Técnicos

- **Tailwind possivelmente não aplicado corretamente no estado atual**:
  - `tailwind.config.js` e `postcss.config.js` existem;
  - porém `src/index.css` não contém diretivas `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`.
- **`App.tsx` e `App.css` são templates padrão do Vite e não são usados**:
  - o bootstrap real está em `src/main.tsx`;
  - não há import de `App.tsx` no código da aplicação.
- **Testes inexistentes na prática**:
  - `src/__tests__/contexts` e `src/__tests__/pages` estão vazias;
  - `src/test` está vazia;
  - não há arquivos `*.test.*`/`*.spec.*` no frontend;
  - não existe script de teste no `package.json`.
- **Dependência total da API estar ativa**:
  - cardápio, envio de pedido, resumo da conta e painel da cozinha dependem de respostas da API;
  - sem `VITE_API_URL` válido e API online, os fluxos principais não funcionam.
