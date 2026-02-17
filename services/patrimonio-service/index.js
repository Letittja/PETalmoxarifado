const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('API de Patrimônio do Almoxarifado está VIVA!');
});

/**
 * Endpoint mínimo de validação:
 * GET /patrimonios/:cod_patrimonio  -> 200 se existe, 404 se não existe
 *
 * Por enquanto (como não há DB implementado), usamos um "mock" em memória.
 * Depois você troca isso por consulta no Supabase/Postgres do patrimonio-service.
 */
const PATRIMONIOS_MOCK = new Set(['AAAAAA', '111111', '000000']); // Exemplo de códigos de patrimônio válidos

app.get('/patrimonios/:cod', (req, res) => {
  const cod = String(req.params.cod).trim();

  if (!cod) {
    return res.status(400).json({ error: 'cod_patrimonio é obrigatório' });
  }

  if (!PATRIMONIOS_MOCK.has(cod)) {
    return res.status(404).json({ error: 'Patrimônio não encontrado' });
  }

  return res.status(200).json({ cod_patrimonio: cod, exists: true });
});

app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});