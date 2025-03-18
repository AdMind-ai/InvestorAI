const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 5000; // Escolha uma porta que funciona para você

app.use(express.json());

app.post('/api/perplexity', async (req, res) => {
  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', req.body, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Erro ao se conectar à API Perplexity');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});