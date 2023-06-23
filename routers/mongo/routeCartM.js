const { postCarrito, getCarrito, postProductoCarrito, deleteProductoCarrito, deleteCarrito } = require('../../controller/mongo/controlerCartM');



const { Router } = require('express');
const logRequestInfo = require('../../middlewares/logRequestInfo');

const carritoMongoRouter = Router();

carritoMongoRouter.use(logRequestInfo);

carritoMongoRouter.post('/', logRequestInfo, postCarrito);
carritoMongoRouter.delete('/:id', logRequestInfo, deleteCarrito);
carritoMongoRouter.get('/:id?', logRequestInfo, getCarrito);
carritoMongoRouter.post('/:id', logRequestInfo, postProductoCarrito);
carritoMongoRouter.delete('/:id/:id_prod', logRequestInfo, deleteProductoCarrito);

module.exports = carritoMongoRouter;