const express = require('express');
const app = express();
const port = 3001;

app.use(express.json()); // 👈 necessário pro POST

// Banco fake em memória (por enquanto)
let itens = [
  { id: 1, nome: 'Notebook', categoria: 'Eletrônicos', local: 'Armário A' }
];

// Rota raiz
app.get('/', (req, res) => {
  res.send('API de Patrimônio do Almoxarifado está VIVA!');
});

// GET /itens – listar itens
app.get('/itens', (req, res) => {
  res.json(itens);
});

// POST /itens – cadastrar item
app.post('/itens', (req, res) => {
  const { nome, categoria, local } = req.body;

  if (!nome || !categoria || !local) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  const novoItem = {
    id: itens.length + 1,
    nome,
    categoria,
    local
  };

  itens.push(novoItem);

  res.status(201).json(novoItem);
});

// (opcional) rota fake de categorias
app.get('/categorias', (req, res) => {
  res.json([
    { id: 1, nome: 'Eletrônicos' },
    { id: 2, nome: 'Ferramentas' }
  ]);
});

app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});
