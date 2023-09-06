const { modelProductos } = require('../models/productos.js');
const { connect } = require('../config/mongoDbConfig.js');
const { faker } = require('@faker-js/faker');
faker.locale = 'es'
const logger = require('../logger.js')
class ContenedorProductosMongoDB {
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

        //guardar producto en base de datos mongo
        const productoNuevo = new modelProductos(producto)
        const productoGuardado = productoNuevo.save()
        return productoGuardado

    }

    async getAllProductos() {
        try {
            await connect();
            const productos = await modelProductos.find({}, { _id: 0, __v: 0 });
            return productos
        } catch (error) {
            console.log(error)
            logger.error('No hay productos guardados')
            return 'No hay productos guardados'
        }
    }

    async getProductosById(id) {
        //busco el producto por el _id en mongodb
        try {
            await connect()
            const producto = await modelProductos.findOne({ _id: id }, { _id: 0, __v: 0 })
            return producto
        } catch (error) {
            console.log(error)
            logger.error(`No hay productos con el id ${id}`)
            return `No hay productos con el id ${id}`
        }
    }

    async deleteProductoById(product) {
        try {
            await connect()
            //busco el producto por el _id
            const producto = await modelProductos.findOneAndDelete({ _id: product._id })
            return producto

        } catch (error) {
            console.log(`Fallo la lectura `)
            logger.error(`Fallo la lectura `)
            return "Fallo la lectura"
        }
    }

}

module.exports = ContenedorProductosMongoDB;