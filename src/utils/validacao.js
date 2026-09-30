// Retorna mensagem de erro se algum campo obrigatório estiver vazio, ou null se estiver tudo ok
function validarCampos(body, campos) {
  const faltando = campos.filter(
    (campo) => typeof body[campo] !== 'string' || body[campo].trim() === ''
  );
  return faltando.length
    ? `Campos obrigatórios não preenchidos: ${faltando.join(', ')}.`
    : null;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Converte o parâmetro da URL em inteiro positivo (ou null se for inválido)
function lerId(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

// Middleware para validar parâmetros de ID na rota (ex.: /:id)
function paramId(nomeCampo) {
  return (req, res, next, valor) => {
    const id = lerId(valor);
    if (!id) return res.status(400).json({ erro: `Parâmetro ${nomeCampo} inválido.` });
    req[nomeCampo] = id;
    next();
  };
}

module.exports = { validarCampos, emailValido, lerId, paramId };
