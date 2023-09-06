const { modelCarrito } = require('../models/carrito.js');
const { connect } = require('../config/mongoDbConfig.js');
const { faker } = require('@faker-js/faker');
faker.locale = 'es'
const logger = require('../logger.js')
class ContenedorCarritosMongoDB {
    constructor() {
        this.mensajes = [];
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
    async saveProductos(producto) {
        await connect()

        //si ya esta el producto en la base de datos, y coincide el idUsuario, sumarle la cantidad de quantity sino agregarlo
        const productoEncontrado = await modelCarrito.findOne({ titulo: producto.titulo, idUsuario: producto.idUsuario })
        if (productoEncontrado) {
            const productoActualizado = await modelCarrito.findOneAndUpdate({ titulo: producto.titulo, idUsuario: producto.idUsuario }, { $inc: { quantity: producto.quantity } }, { new: true })
            return productoActualizado
        } else {
            const productoNuevo = new modelCarrito(producto)
            const productoGuardado = productoNuevo.save()
            return productoGuardado
        }
    }

    async getAllProductos() {
        try {
            await connect();
            const productos = await modelCarrito.find({}, { _id: 0, __v: 0 });
            return productos
        } catch (error) {
            console.log(error)
            logger.error('No hay productos guardados')
            return 'No hay productos guardados'
        }
    }

    async getAllProductosByIdUsuario(idUsuario) {
        try {
            await connect();
            const productos = await modelCarrito.find({ idUsuario: idUsuario }, { _id: 0, __v: 0 });
            return productos
        } catch (error) {
            console.log(error)
            logger.error('No hay productos guardados')
            return 'No hay productos guardados'
        }
    }

    async deleteProductoById(product) {
        try {
            await connect()
           //busco el producto por el titulo y el idUsuario
            const producto = await modelCarrito.findOneAndDelete({ titulo: product.titulo, idUsuario: product.idUsuario })
            return producto
            
        } catch (error) {
            console.log(`Fallo la lectura `)
            logger.error(`Fallo la lectura `)
            return "Fallo la lectura"
        }
    }

}

module.exports = ContenedorCarritosMongoDB;