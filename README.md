# API de Eventos e Palestrantes

Node.js + Express + Prisma + MySQL.

## Como rodar

1. `npm install`
2. Copie `.env.example` para `.env` e ajuste a `DATABASE_URL`.
3. Crie as tabelas: rode seu script `.sql` no MySQL **ou** execute `npx prisma db push`.
4. `npx prisma generate`
5. `npm run dev`

A API sobe em http://localhost:3000. Teste pelo arquivo `requisicoes.http` (extensão REST Client).

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | /eventos | Lista eventos com palestrantes |
| GET | /eventos/:id | Busca um evento |
| POST | /eventos | Cadastra evento (`nome`, `descricao`, `local`, `palestrantes` opcional) |
| PUT | /eventos/:id | Altera evento |
| DELETE | /eventos/:id | Exclui evento |
| POST | /eventos/:id/palestrantes/:palestranteId | Adiciona palestrante ao evento |
| DELETE | /eventos/:id/palestrantes/:palestranteId | Remove palestrante do evento |
| GET | /palestrantes | Lista palestrantes com seus eventos |
| GET | /palestrantes/:id | Busca um palestrante |
| POST | /palestrantes | Cadastra palestrante (`nome`, `email`) |
| PUT | /palestrantes/:id | Altera palestrante |
| DELETE | /palestrantes/:id | Exclui palestrante |
