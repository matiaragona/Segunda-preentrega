const mongoose = require('mongoose');

const carritoCollection = "carrito"

const carritoSchema = new mongoose.Schema({
    timestamp: String,
    productos: [],
})

const cartModels =   mongoose.model(carritoCollection, carritoSchema)

module.exports = cartModels