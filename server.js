//Class containerMensajesMongoDB.js
const ContenedorMensajesMongoDB = require('./containers/containerMensajesMongoDB')
const ContenedorUsuariosMongoDB = require('./containers/containerUsuariosMongoDB')
const ContenedorProductosMongoDB = require('./containers/containerProductosMongoDB')
const mensajesMongoDB = new ContenedorMensajesMongoDB()
const productosMongoDB = new ContenedorProductosMongoDB()
const usuariosMongoDB = new ContenedorUsuariosMongoDB()
const { modelU } = require('./models/usuarios')

//SERVIDOR
const dotenv = require('dotenv')
const express = require('express')
const session = require('express-session')
const cookieParser = require("cookie-parser")
const MongoStore = require("connect-mongo")
const { registrar, login, datos, logout, raiz, datosProcess, numerosRandoms, carrito, deleteProducto, checkout } = require('./routers/routers');
const parseArgs = require('yargs/yargs')

const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const passport = require("passport")
const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
const cluster = require("cluster");
const logger = require('./logger')
const fileUpload = require('express-fileupload')
const path = require('path');


app.set('view engine', 'ejs')

app.use(cookieParser())
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL || "mongodb+srv://ezequiel:ezequiel@backendcodercurso.y3plhcv.mongodb.net/TP3?retryWrites=true&w=majority",
        mongoOptions: advancedOptions
    }),
    secret: "coderhouse",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 60000 }
}))
app.use(express.static("./public"))
app.use('/avatars', express.static(path.join(__dirname, 'public', 'avatars')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())
app.use(fileUpload())

let userName = ""

app.use((req, res, next) => {
    req.isAuthenticated = () => {
        if (req.session.nombre) {
            //lo guardo en una variable para que no se ejecute cada vez que se llama a la funcion
            userName = req.session.nombre
            return true
        }
        return false
    }

    req.logout = callback => {
        req.session.destroy(callback)
    }

    next()
})

app.get('/', async (req, res) => {
    if (req.session.nombre) {
        res.redirect('/datos')
    } else {
        res.render('login')
    }
})

app.use('/', registrar)
app.use('/', login)
app.use('/', datos)
app.use('/', logout)
app.use('/', raiz)
app.use('/', datosProcess)
app.use('/', numerosRandoms)
app.use('/', carrito)
app.use('/', deleteProducto)
app.use('/', checkout)


app.get('/test', async (req, res) => {
    res.render("productos")
})
//ruta inexistentes usar el logger warning
app.get('*', (req, res) => {
    const { url, method } = req

    logger.warn(`Ruta ${method} ${url} no esta implementada`)
    res.send(`Ruta ${method} ${url} no esta implementada`)
})
//errores lanzados por las apis de mensajes y productos, únicamente (error) con el logger error
io.on("connection", async (socket) => {
    const mensajes = await mensajesMongoDB.getAll()

    const stringifyData = JSON.stringify(mensajes)
    const parseData = JSON.parse(stringifyData)

    const normalizado = await mensajesMongoDB.normalizeMessages(parseData)

    socket.emit('mensajes', normalizado)

    socket.on('new-msj', async (message) => {
        if (message.author.email && message.author.nombre && message.author.apellido && message.author.edad && message.author.alias && message.author.avatar
            && message.text) {
            await mensajesMongoDB.save(message)

            let todosmensajes = await mensajesMongoDB.getAll()

            const stringifyData = JSON.stringify(todosmensajes)
            const parseData = JSON.parse(stringifyData)

            const normalizado = await mensajesMongoDB.normalizeMessages(parseData)

            io.sockets.emit('mensajes', normalizado)
        } else {
            logger.error(`Error en la api de mensajes, faltan campos`)
        }
    })
    
/* -----------------------------------productos-------------------------------------------- */
    let productos = await productosMongoDB.getAllProductos()
    socket.emit('productos', productos)

    socket.on('new-product', async (data) => {
        let todosProductos = data

        if (data.titulo && data.descripcion && data.codigo && data.precio && data.foto && data.stock) {
            await productosMongoDB.saveProductos(todosProductos)

            const productos = await productosMongoDB.getAllProductos()

            io.sockets.emit('productos', productos)
        }
        else {
            logger.error(`Error en la api de productos, faltan campos`)
        }
    })


    let productosFaker = []

    for (let i = 0; i < 5; i++) {
        productosFaker.push(await mensajesMongoDB.crearProducto(i + 1))
    }

    socket.emit('faker', productosFaker)
})

//PORT
const argv = parseArgs(process.argv.slice(2)).argv
const PORT = argv.PORT || 8080
const MODE = argv.MODE || 'FORK'
const numCPUs = require('os').cpus().length

if (MODE === 'CLUSTER' && cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    logger.info(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        logger.info(`worker ${worker.process.pid} died`);
    });
}
else {
    httpServer.listen(PORT, () => {
        logger.info(`Servidor http escuchando en el puerto ${PORT}`)
    })
    httpServer.on("error", error => logger.error(`Error en servidor ${error}`))
}