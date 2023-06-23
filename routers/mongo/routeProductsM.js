const { getProducto, postProducto, updateProducto, deleteProducto } = require('../../controller/mongo/controlerProductsM');

const { Router } = require('express');
const validateAdmin = require('../../middlewares/validAdmin');

//crear una variable admin y pasarla por parámetro en el router
const admin = true;

const productosMongoRouter = Router();

productosMongoRouter.get('/:id?', getProducto);
productosMongoRouter.post('/', validateAdmin(admin), postProducto);
productosMongoRouter.put('/:id', validateAdmin(admin), updateProducto);
productosMongoRouter.delete('/:id', validateAdmin(admin), deleteProducto);

module.exports = productosMongoRouter;