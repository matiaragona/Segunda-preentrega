const express = require('express');

//Utilizamos Mongo DB
const productosMongoRouter = require('./routers/mongo/routeProductsM');
const carritoMongoRouter = require('./routers/mongo/routeCartM');

const app = express();
const port = process.env.port || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Mongo DB
app.use('/api/mongo/productos', productosMongoRouter);
app.use('/api/mongo/carrito', carritoMongoRouter);


app.use((req, res) => {
    res.status(404).json({
        error: -2,
        descripcion: `ruta '${req.originalUrl}' método '${req.method}' no implementada`,
    });
});


app.listen(port, () => {
    console.log(`RUN http://localhost:8080`);
});