const { Router } = require('express');
const prisma = require('../prisma');
const { validarCampos, emailValido, paramId } = require('../utils/validacao');

const router = Router();

router.param('id', paramId('id'));

const incluirEventos = {
  eventos: { include: { evento: true }, orderBy: { evento: { nome: 'asc' } } },
};

function formatar(palestrante) {
  const { eventos, ...dados } = palestrante;
  return { ...dados, eventos: eventos.map((ep) => ep.evento) };
}

function validar(body) {
  const erro = validarCampos(body, ['nome', 'email']);
  if (erro) return erro;
  if (!emailValido(body.email.trim())) return 'E-mail inválido.';
  return null;
}

// LISTAR palestrantes (com os eventos em que participam)
router.get('/', async (req, res) => {
  const palestrantes = await prisma.palestrante.findMany({
    include: incluirEventos,
    orderBy: { nome: 'asc' },
  });
  res.json(palestrantes.map(formatar));
});

// BUSCAR um palestrante
router.get('/:id', async (req, res) => {
  const palestrante = await prisma.palestrante.findUnique({
    where: { id: req.id },
    include: incluirEventos,
  });
  if (!palestrante) return res.status(404).json({ erro: 'Palestrante não encontrado.' });
  res.json(formatar(palestrante));
});

// CADASTRAR palestrante
router.post('/', async (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  const palestrante = await prisma.palestrante.create({
    data: { nome: req.body.nome.trim(), email: req.body.email.trim().toLowerCase() },
    include: incluirEventos,
  });
  res.status(201).json(formatar(palestrante));
});

// ALTERAR palestrante
router.put('/:id', async (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  const palestrante = await prisma.palestrante.update({
    where: { id: req.id },
    data: { nome: req.body.nome.trim(), email: req.body.email.trim().toLowerCase() },
    include: incluirEventos,
  });
  res.json(formatar(palestrante));
});

// EXCLUIR palestrante (sai automaticamente dos eventos em que estava)
router.delete('/:id', async (req, res) => {
  await prisma.palestrante.delete({ where: { id: req.id } });
  res.status(204).send();
});

module.exports = router;
