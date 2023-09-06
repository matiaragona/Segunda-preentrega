const mongoose = require('mongoose');

const mensajeCollection = "mensajes";

const mensajeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    author: {
        id: { type: String, required: true },
        nombre: { type: String },
        apellido: { type: String, required: true },
        edad: { type: Number, required: true },
        alias: { type: String, required: true },
        avatar: { type: String, required: true },
    },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
});

const model = mongoose.model(mensajeCollection, mensajeSchema)
module.exports = { model }