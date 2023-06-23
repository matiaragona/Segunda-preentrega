const MongoContainer = require('../../container/mongo/containerMongo');

const Carrito = new MongoContainer();
const Producto = new MongoContainer();

const postCarrito = (req, res) => {

    Carrito.addCarrito({
        timestamp: Date.now(),
        productos: []
    })
        .then(id => {
            res.json({id: id});
        })
        .catch(err => {
            res.json(err);
        })
}

const getCarrito = (req, res) => {
    const id = req.params.id

    if (id) {
        Carrito.getCart(id)
        .then(carritos => {
            res.json(carritos);
        })
        .catch(err => {
            res.json(err);
        })
    }
    else{
        Carrito.getCart()
            .then(carritos => {
                res.json(carritos);
            })
            .catch(err => {
                res.json(err);
            })
    }
}

const postProductoCarrito = (req, res) => {
    const idProducto = req.body.id;
    const idCarrito = req.params.id;

    Producto.getProducts(idProducto)
        .then(producto => {
            let product = producto
            Carrito.updateCart(idCarrito, {$push:  {productos: product} })
                .then(carrito =>{
                    res.json(carrito);
                })
                .catch(err => {
                    res.json(err);
                })
        })
        .catch(err => {
            res.json(err);
        })
}

const deleteProductoCarrito = (req, res) => {
    const idProducto = req.params.id_prod;
    const idCarrito = req.params.id;
   
    Producto.getProducts(idProducto)
        .then(producto => {
            let product = producto
            Carrito.updateCart(idCarrito, {$pull: {productos: product} })
                .then(carrito =>{
                    res.json(carrito);
                })
                .catch(err => {
                    res.json(err);
                })
        })
        .catch(err => {
            res.json(err);
        })
}

const deleteCarrito = (req, res) => {
    Carrito.deleteCart(req.params.id)
        .then(id => {
            res.json({id: id});
        })
        .catch(err => {
            res.json(err);
        })
}



module.exports = {
    postCarrito,
    getCarrito,
    postProductoCarrito,
    deleteProductoCarrito,
    deleteCarrito
}