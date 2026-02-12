const express = require('express');
const path = require('path');
const app = express();
const PORT = 5173;

// Serve todos os arquivos da pasta (HTML, CSS, JS, Imagens)
app.use(express.static(__dirname));

// Rota principal entrega o seu index.html (login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend rodando em http://localhost:${PORT}`);
});