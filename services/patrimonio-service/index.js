const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3001;

// middleware
app.use(express.json());

// conexão com o Postgres
const db = new Pool({
  host: 'postgres-patrimonio',
  user: 'patrimonio_user',
  password: 'patrimonio_pass',
  database: 'patrimonio',
  port: 5432
});

// teste de conexão
db.query('SELECT 1')
  .then(() => console.log('Postgres conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar no Postgres', err));


// Rota raiz
app.get('/', (req, res) => {
  res.send('API de Patrimônio do Almoxarifado está VIVA!');
});


// GET /itens
app.get('/itens', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.id,
        i.nome,
        i.descricao,
        c.nome AS categoria,
        l.nome AS local
      FROM public.itens i
      LEFT JOIN public.categorias c ON i.categoria_id = c.id
      LEFT JOIN public.locais l ON i.local_id = l.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar itens' });
  }
});



// POST /itens
app.post('/itens', async (req, res) => {
  const { nome, descricao, categoria_id, local_id } = req.body;

  if (!nome || !local_id) {
    return res.status(400).json({
      erro: 'nome e local_id são obrigatórios'
    });
  }

  try {
    const result = await db.query(
      `
      INSERT INTO itens (nome, descricao, categoria_id, local_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [nome, descricao || null, categoria_id || null, local_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro detalhado:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

// PUT /itens/:id
app.put('/itens/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, categoria_id, local_id } = req.body;

  if (!nome || !local_id) {
    return res.status(400).json({
      erro: 'nome e local_id são obrigatórios'
    });
  }

  try {
    const result = await db.query(
      `UPDATE itens SET nome = $1, descricao = $2, categoria_id = $3, local_id = $4 
       WHERE id = $5 RETURNING *`,
      [nome, descricao || null, categoria_id || null, local_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /itens/:id
app.delete('/itens/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM itens WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    res.json({ mensagem: 'Item removido com sucesso', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});



// CATEGORIAS

// GET /categorias
app.get('/categorias', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM public.categorias');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

// POST /categorias
app.post('/categorias', async (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'nome é obrigatório' });
  }

  try {
    const result = await db.query(
      'INSERT INTO categorias (nome) VALUES ($1) RETURNING *',
      [nome]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// PUT /categorias/:id
app.put('/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'nome é obrigatório' });
  }

  try {
    const result = await db.query(
      'UPDATE categorias SET nome = $1 WHERE id = $2 RETURNING *',
      [nome, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /categorias/:id
app.delete('/categorias/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM categorias WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }

    res.json({ mensagem: 'Categoria removida com sucesso', categoria: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});



// LOCAIS

// GET /locais
app.get('/locais', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM public.locais');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar locais' });
  }
});

// POST /locais
app.post('/locais', async (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'nome é obrigatório' });
  }

  try {
    const result = await db.query(
      'INSERT INTO locais (nome) VALUES ($1) RETURNING *',
      [nome]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// PUT /locais/:id
app.put('/locais/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'nome é obrigatório' });
  }

  try {
    const result = await db.query(
      'UPDATE locais SET nome = $1 WHERE id = $2 RETURNING *',
      [nome, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Local não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /locais/:id
app.delete('/locais/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM locais WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Local não encontrado' });
    }

    res.json({ mensagem: 'Local removido com sucesso', local: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});



// servidor
app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});
