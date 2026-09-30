const { Router } = require('express');
const prisma = require('../prisma');
const { validarCampos, lerId, paramId } = require('../utils/validacao');

const router = Router();

router.param('id', paramId('id'));
router.param('palestranteId', paramId('palestranteId'));

const incluirPalestrantes = {
  palestrantes: {
    include: { palestrante: true },
    orderBy: { palestrante: { nome: 'asc' } },
  },
};

// Deixa a resposta "limpa": palestrantes: [{ id, nome, email }]
function formatar(evento) {
  const { palestrantes, ...dados } = evento;
  return { ...dados, palestrantes: palestrantes.map((ep) => ep.palestrante) };
}

async function buscarEvento(id) {
  const evento = await prisma.evento.findUnique({ where: { id }, include: incluirPalestrantes });
  return evento ? formatar(evento) : null;
}

// LISTAR todos os eventos com seus palestrantes
router.get('/', async (req, res) => {
  const eventos = await prisma.evento.findMany({
    include: incluirPalestrantes,
    orderBy: { id: 'asc' },
  });
  res.json(eventos.map(formatar));
});

// BUSCAR um evento
router.get('/:id', async (req, res) => {
  const evento = await buscarEvento(req.id);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });
  res.json(evento);
});

// CADASTRAR evento (opcionalmente já com uma lista de IDs de palestrantes)
router.post('/', async (req, res) => {
  const erro = validarCampos(req.body, ['nome', 'descricao', 'local']);
  if (erro) return res.status(400).json({ erro });

  const { nome, descricao, local, palestrantes = [] } = req.body;

  if (!Array.isArray(palestrantes) || !palestrantes.every((id) => lerId(id))) {
    return res.status(400).json({ erro: 'O campo palestrantes deve ser uma lista de IDs válidos.' });
  }

  const ids = [...new Set(palestrantes.map(Number))];
  if (ids.length) {
    const encontrados = await prisma.palestrante.count({ where: { id: { in: ids } } });
    if (encontrados !== ids.length) {
      return res.status(404).json({ erro: 'Um ou mais palestrantes informados não existem.' });
    }
  }

  const evento = await prisma.evento.create({
    data: {
      nome: nome.trim(),
      descricao: descricao.trim(),
      local: local.trim(),
      palestrantes: { create: ids.map((palestranteId) => ({ palestranteId })) },
    },
    include: incluirPalestrantes,
  });

  res.status(201).json(formatar(evento));
});

// ALTERAR evento
router.put('/:id', async (req, res) => {
  const erro = validarCampos(req.body, ['nome', 'descricao', 'local']);
  if (erro) return res.status(400).json({ erro });

  const { nome, descricao, local } = req.body;

  const evento = await prisma.evento.update({
    where: { id: req.id },
    data: { nome: nome.trim(), descricao: descricao.trim(), local: local.trim() },
    include: incluirPalestrantes,
  });

  res.json(formatar(evento));
});

// EXCLUIR evento (os vínculos com palestrantes são removidos em cascata)
router.delete('/:id', async (req, res) => {
  await prisma.evento.delete({ where: { id: req.id } });
  res.status(204).send();
});

// ADICIONAR palestrante ao evento
router.post('/:id/palestrantes/:palestranteId', async (req, res) => {
  const [evento, palestrante] = await Promise.all([
    prisma.evento.findUnique({ where: { id: req.id } }),
    prisma.palestrante.findUnique({ where: { id: req.palestranteId } }),
  ]);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });
  if (!palestrante) return res.status(404).json({ erro: 'Palestrante não encontrado.' });

  try {
    await prisma.eventoPalestrante.create({
      data: { eventoId: req.id, palestranteId: req.palestranteId },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ erro: 'Este palestrante já está vinculado ao evento.' });
    }
    throw err;
  }

  res.status(201).json(await buscarEvento(req.id));
});

// REMOVER palestrante do evento
router.delete('/:id/palestrantes/:palestranteId', async (req, res) => {
  try {
    await prisma.eventoPalestrante.delete({
      where: {
        eventoId_palestranteId: { eventoId: req.id, palestranteId: req.palestranteId },
      },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ erro: 'Este palestrante não está vinculado ao evento.' });
    }
    throw err;
  }

  res.json(await buscarEvento(req.id));
});

module.exports = router;
