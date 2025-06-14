const express = require('express');
const ingredientesRouter = require('./routes/ingredientes');
const postresRouter = require('./routes/postres');
const postresIngredientesRouter = require('./routes/postresIngredientes');
const authRouter = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// Endpoint de prueba
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

// Rutas de autenticación (públicas)
app.use('/auth', authRouter);

// Rutas temporalmente sin autenticación para pruebas
// NOTA: Reactivar autenticación en producción
app.use('/ingredientes', ingredientesRouter);
app.use('/postres', postresRouter);
app.use('/postres-ingredientes', postresIngredientesRouter);

// Rutas protegidas (requieren autenticación) - Comentadas temporalmente
// app.use('/ingredientes', authenticateToken, ingredientesRouter);
// app.use('/postres', authenticateToken, postresRouter);
// app.use('/postres-ingredientes', authenticateToken, postresIngredientesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
}); 