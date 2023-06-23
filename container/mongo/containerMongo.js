const mongoose = require('mongoose');
const modelsProducts = require('../../models/modelsProduct')
const cartModels = require('../../models/modelsCart')

mongoose.connect("mongodb+srv://matiaragona:<password>@cluster0.tqfbx69.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('MongoDB Connected');
    }
});


class MongoContainer {

    async addProducts(data){
        const dataAdd = new modelsProducts(data)
        const productoAdd = await dataAdd.save()
        return productoAdd
    }

    async addCarrito(data){
        const dataAdd = new cartModels(data)
        const carritoadd = await dataAdd.save()
        return carritoadd
    }

    async getProducts(id){
        const idProduct = id
        if (idProduct) {
            const produc = await modelsProducts.findById(idProduct)
            return produc
        }
        else{
            const produc = await modelsProducts.find()
            return produc
        }
    }

    async getCart (id){
        const idCart = id
        if (idCart) {
            const cart = await cartModels.find({_id: idCart})
            return cart
        }
        else{
            const produc = await cartModels.find()
            return produc
        }
    }

    async updateProduct(id, data){
        const producUpdate = await modelsProducts.updateOne({_id: id}, data)
        return producUpdate
    }

    async updateCart(id, data){
        const producUpdate = await cartModels.updateOne({_id: id}, data)
        return producUpdate
    }

    async deleteProduc(id){
        const producDelete = await modelsProducts.deleteOne({_id : id})
        return producDelete
    }

    async deleteCart(id){
        const producDelete = await cartModels.deleteOne({_id : id})
        return producDelete
    }
}

module.exports = MongoContainer;