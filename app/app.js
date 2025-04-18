const express = require('express');
const { DataTypes } = require('sequelize');
const db = require('./models/db');  // Importa a configuração do banco

const app = express();
const port = 3000;

// Modelo People com configurações avançadas
const People = db.define('people', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]  // Nome deve ter entre 2 e 255 caracteres
    }
  }
}, {
  timestamps: true,    // Habilita created_at automático
  createdAt: 'created_at',
  updatedAt: false,    // Não precisamos do updated_at
  tableName: 'people', // Nome explícito da tabela
  paranoid: false      // Não usar deleted_at
});

// Middleware para tratamento de erros
app.use(express.json());

// Rota principal
app.get('/', async (req, res) => {
  try {
    // Sincroniza o modelo (cria tabela se não existir)
    await People.sync({ alter: true });
    
    // Adiciona um novo registro
    const newPerson = await People.create({ 
      name: "FullCycle Rocks!" 
    });
    
    // Busca todos os registros ordenados pelos mais recentes
    const people = await People.findAll({
      attributes: ['id', 'name', 'created_at'],
      order: [['created_at', 'DESC']],  // Ordena do mais recente
      raw: true                         // Retorna objetos simples
    });

    // Formata a lista de nomes
    const namesList = people.map(person => 
      `<li>${person.name} (ID: ${person.id}) - ${new Date(person.created_at).toLocaleString()}</li>`
    ).join('');

    // Resposta HTML formatada
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Full Cycle</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          ul { list-style-type: none; padding: 0; }
          li { padding: 8px; margin: 4px; background: #f0f0f0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Full Cycle Rocks!</h1>
        <h2>Nomes cadastrados no banco:</h2>
        <ul>${namesList}</ul>
        <p>Total de registros: ${people.length}</p>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Erro na rota principal:', error);
    res.status(500).send(`
      <h1>Erro no servidor</h1>
      <p>${error.message}</p>
    `);
  }
});

// Rota de saúde para o healthcheck
app.get('', async (req, res) => {
  try {
    await db.authenticate();
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Acesse: http://localhost:${port}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});