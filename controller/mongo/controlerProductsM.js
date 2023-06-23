const MongoContainer = require('../../container/mongo/containerMongo');

const Producto = new MongoContainer();


const getProducto = (req, res) => {
    const id = req.params.id
    if (id) {
        Producto.getProducts(id)
            .then(productos => {
                res.json(productos);
            })
            .catch(err => {
                res.json(err);
            })
    }
    else{
        Producto.getProducts()
            .then(productos => {
                res.json(productos);
            })
            .catch(err => {
                res.json(err);
            })
    }
}


const postProducto = (req, res) => {

    const newProducto = {
        timestamp: Date.now(),
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        codigo: req.body.codigo,
        precio: req.body.precio,
        foto: req.body.foto,
        stock: req.body.stock,
    }

    Producto.addProducts(newProducto)
        .then(id => {
            res.json({ id: id });
        })
        .catch(err => {
            res.json(err);
        })
}

const updateProducto = (req, res) => {

    const producto = {
        timestamp: Date.now(),
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        codigo: req.body.codigo,
        precio: req.body.precio,
        foto: req.body.foto,
        stock: req.body.stock,
    }

    Producto.updateProduct(req.params.id, producto)
        .then(id => {
            res.json({ id: id });
        })
        .catch(err => {
            res.json(err);
        })
}

const deleteProducto = (req, res) => {
    Producto.deleteProduc( req.params.id)
        .then(id => {
            res.json({ id: id });
        })
        .catch(err => {
            res.json(err);
        })
}


module.exports = {
    getProducto,
    postProducto,
    updateProducto,
    deleteProducto,
};