const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
const port = 3002;

app.use(express.json());

/**
 * conexão com Postgres (Supabase ou local)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * URL do serviço de patrimônio
 */
const PATRIMONIO_URL =
  process.env.PATRIMONIO_URL || 'http://patrimonio-service:3001';


/**
 * função que valida se o patrimônio existe
 */
async function patrimonioExiste(cod_patrimonio) {

  try {

    await axios.get(
      `${PATRIMONIO_URL}/patrimonios/${encodeURIComponent(cod_patrimonio)}`,
      { timeout: 3000 }
    );

    return true;

  } catch (err) {

    if (err.response && err.response.status === 404)
      return false;

    throw err;
  }
}


/**
 * rota POST /emprestimo
 *
 * registra saída de material
 */
app.post('/emprestimo', async (req, res) => {

  try {

    const {
      matricula,
      cod_patrimonio,
      data_saida,
      data_retorno
    } = req.body;


    /**
     * validação de campos obrigatórios
     */
    if (
      !matricula ||
      !cod_patrimonio ||
      !data_saida ||
      !data_retorno
    ) {
      return res.status(400).json({
        error: 'Campos obrigatórios: matricula, cod_patrimonio, data_saida, data_retorno'
      });
    }


    /**
     * validação de datas
     */
    if (new Date(data_retorno) < new Date(data_saida)) {

      return res.status(400).json({
        error: 'data_retorno não pode ser anterior à data_saida'
      });

    }


    /**
     * validação interna de patrimônio existente
     */
    const existe = await patrimonioExiste(cod_patrimonio);

    if (!existe) {

      return res.status(404).json({
        error: 'Patrimônio não existe'
      });

    }


    /**
     * insert no banco
     */
    const query = `
      INSERT INTO emprestimo.emprestimo
      (matricula, cod_patrimonio, data_saida, data_retorno)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      matricula,
      cod_patrimonio,
      data_saida,
      data_retorno
    ];


    const result = await pool.query(query, values);


    /**
     * sucesso
     */
    return res.status(201).json({
      message: 'Empréstimo registrado com sucesso',
      emprestimo: result.rows[0]
    });


  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: 'Erro interno ao registrar empréstimo'
    });

  }

});


app.listen(port, () => {
  console.log(`emprestimo-service rodando na porta ${port}`);
});
