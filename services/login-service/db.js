const { Pool } = require('pg');

// Conecta ao Postgres do serviço `postgres-login` (definido no docker-compose)
const pool = new Pool({
  host: 'postgres-login',
  user: 'login_user',
  password: 'login_pass',
  database: 'login_db',
  port: 5432
});

// Teste de conexão ao iniciar
pool.query('SELECT 1')
  .then(() => console.log('Postgres (login) conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar no Postgres (login):', err.message));

module.exports = pool;
