require('dotenv').config();
const express = require('express');
const cors = require('cors');
const eventosRoutes = require('./routes/eventos');
const palestrantesRoutes = require('./routes/palestrantes');

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Eventos e Palestrantes funcionando!' });
});

app.use('/eventos', eventosRoutes);
app.use('/palestrantes', palestrantesRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Tratamento central de erros (Express 5 captura erros de funções async automaticamente)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado.' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ erro: 'Já existe um registro com esse valor (ex.: e-mail já cadastrado).' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
