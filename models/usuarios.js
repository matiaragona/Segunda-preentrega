const mongoose = require('mongoose')

const collectionUsuarios = 'usuarios'

const schemaProductos = new mongoose.Schema({
    nombre: String,
    password: String,
    direccion: String,
    telefono: Number,
    email: String,
    edad: Number,
    avatar: String,

})

const modelU = mongoose.model(collectionUsuarios, schemaProductos)

module.exports = { modelU }