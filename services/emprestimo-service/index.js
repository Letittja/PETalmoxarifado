const express = require('express');
const app = express();
const port = 3002; 

app.get('/', (req, res) => {
  res.send('API de Empréstimo do Almoxarifado está VIVA!');
});

app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});