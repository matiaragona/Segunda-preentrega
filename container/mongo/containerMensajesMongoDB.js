const { normalize, schema, denormalize } = require('normalizr')
const { model } = require('../models/mensajes.js');
const { connect } = require('../config/mongoDbConfig.js');
const { faker } = require('@faker-js/faker');
faker.locale = 'es'
const logger = require('../logger.js')
class ContenedorMensajesMongoDB {
    constructor() {
        this.mensajes = [];
    }

    async normalizeMessages(data) {

        await connect()

        try {
            const mensajes = {
                id: 'backendCoder09',
                messages: data
            };
            //SCHEMAS
            const authorSchema = new schema.Entity("author", {}, { idAttribute: "id" });
            const messageSchema = new schema.Entity("message", { author: authorSchema });
            const messagesSchema = new schema.Entity("messages", { messages: [messageSchema] });
            const messagesNorm = normalize(mensajes, messagesSchema);
            const messageDes = denormalize(messagesNorm.result, messagesSchema, messagesNorm.entities)
            const original = JSON.stringify(mensajes).length
            const normalized = JSON.stringify(messagesNorm).length
            const porcentage = (100 - (JSON.stringify(messagesNorm).length * 100 / JSON.stringify(mensajes).length)).toFixed(2)

            const valueToReturn = {
                dataNormalized: messagesNorm,
                dataDenormalized: messageDes,
                porcentageCompression: porcentage,
                tamañoNormalizado: normalized,
                tamañoOriginal: original
            }
            return valueToReturn //messagesNorm
        } catch (error) {
            console.log(error)
            logger.error(`Error en la api de mensajes`)
        }
    }

    async crearProducto(id) {
        try {
            return {
                id: id,
                nombre: faker.commerce.product(),
                descripcion: faker.commerce.product(),
                codigo: faker.commerce.product(),
                precio: faker.commerce.price(),
                stock: faker.commerce.price(),
                foto: faker.image.abstract(),
                quantity: faker.datatype.number(),
                idUsuario: faker.datatype.number()
            }
        } catch (error) {
            console.log(error)
            logger.error(`Error en la api de productos ${error}`)
        }
    }

    async save(mensaje) {
        try {
            console.log(mensaje)
            await connect()
            const todosMensajes = JSON.stringify(this.getAll)

            if (todosMensajes === "[]") {

                const mensajeNuevo = {
                    id: 1,
                    author: {
                        id: mensaje.author.email,
                        email: mensaje.author.email,
                        nombre: mensaje.author.nombre,
                        apellido: mensaje.author.apellido,
                        edad: mensaje.author.edad,
                        alias: mensaje.author.alias,
                        avatar: mensaje.author.avatar
                    },
                    text: mensaje.text,
                    timestamp: Date.now()
                }
                const mensajeNew = new model(mensajeNuevo)
                const mensajeGuardado = mensajeNew.save()
                return mensajeGuardado
            } else {
                const todosMensajes = await this.getAll()
                const ids = [];

                for (let i = 0; i < todosMensajes.length; i++) {
                    ids.push(todosMensajes[i].id)
                }

                let objeto = {
                    id: Math.max(...ids) + 1,
                    author: {
                        id: mensaje.author.email,
                        email: mensaje.author.email,
                        nombre: mensaje.author.nombre,
                        apellido: mensaje.author.apellido,
                        edad: mensaje.author.edad,
                        alias: mensaje.author.alias,
                        avatar: mensaje.author.avatar
                    },
                    text: mensaje.text,
                    timestamp: Date.now()
                }
                const mensajeNew = new model(objeto)
                const mensajeGuardado = mensajeNew.save()
                return mensajeGuardado
            }
        } catch (error) {
            console.log(error)
            logger.error('No se pudo guardar el mensaje')
        }
    }

    async getById(id1) {
        try {
            await connect()
            const productos = await model.findById(id1)
            return productos
        } catch (error) {
            console.log('No existe el archivo por ende no hay productos con el ID buscado')
            logger.error('No existe el archivo por ende no hay productos con el ID buscado')
            return 'No se encontro el producto con ese ID'
        }
    }
    async getAll1() {
        try {
            await connect();
            const mensajes1 = await model.find({}, { _id: 0, __v: 0 });
            return mensajes1
        } catch (error) {
            console.log(error)
            logger.error('No hay productos guardados')
            return 'No hay productos guardados'
        }
    }
    async getAll() {
        try {
            await connect();
            const mensajes1 = await model.find();
            return mensajes1
        } catch (error) {
            console.log(error)
            logger.error('No hay productos guardados')
            return 'No hay productos guardados'
        }
    }

    async deleteById(id2) {
        try {
            await connect()
            const producto = await model.findByIdAndDelete(id2)
            return producto
        } catch (error) {
            console.log(`Fallo la lectura `)
            logger.error(`Fallo la lectura `)
            return "Fallo la lectura"
        }
    }

    async updateById(id, mensaje) {
        try {
            await connect();
            const productoActualizado = await model.findByIdAndUpdate(id, mensaje, { new: true });
            return productoActualizado;
        } catch (error) {
            console.log(error);
            logger.error(`No se pudo actualizar el producto con el id ${id}`);
        }
    }
}

module.exports = ContenedorMensajesMongoDB;