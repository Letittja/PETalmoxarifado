const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('API de Patrimônio do Almoxarifado está VIVA!');
});

app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});

// const express = require('express');
// const app = express();
// const port = 3001;

// app.get('/', (req, res) => {
//   res.send('API de Patrimônio do Almoxarifado está VIVA!');
// });

// // OPÇÃO 2 – rota fake só pra testar
// app.get('/categorias', (req, res) => {
//   res.json([
//     { id: 1, nome: 'Eletrônicos' },
//     { id: 2, nome: 'Ferramentas' }
//   ]);
// });

// app.listen(port, () => {
//   console.log(`Rodando na porta ${port}`);
// });
