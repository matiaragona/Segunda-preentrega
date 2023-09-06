const mongoose = require('mongoose');

const collectionProductos = "productos"

const schemaProductos = new mongoose.Schema({
    titulo: String,
    descripcion: String,
    codigo: Number,
    precio: Number,
    foto: String,
    stock: Number,
})

const modelProductos = mongoose.model(collectionProductos, schemaProductos)

module.exports = {modelProductos}