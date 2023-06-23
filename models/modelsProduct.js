const mongoose = require('mongoose');

const productosCollection = "productos"

const productosSchema = new mongoose.Schema({
    timestamp: String,
    nombre: String,
    descripcion: String,
    codigo: String,
    precio: Number,
    foto: String,
    stock: Number,
})

const modelsProducts = mongoose.model(productosCollection, productosSchema)

module.exports = modelsProducts