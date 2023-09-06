const mongoose = require('mongoose');

const collectionCarritos = "carrito"

const schemaProductos = new mongoose.Schema({
    titulo: String,
    descripcion: String,
    codigo: Number,
    precio: Number,
    foto: String,
    stock: Number,
    quantity: Number,
    idUsuario: String,
})

const modelCarrito = mongoose.model(collectionCarritos, schemaProductos)

module.exports = {modelCarrito}