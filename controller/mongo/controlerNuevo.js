const ContenedorUsuarioMongoDB = require('../containers/containerUsuariosMongoDB')
const ContenedorProductosMongoDB = require('../containers/containerMensajesMongoDB')
const ContenedorCarritosMongoDB = require('../containers/containerCarritosMongoDb')
const usuariosMongoDB = new ContenedorUsuarioMongoDB()
const productosMongoDB = new ContenedorProductosMongoDB()
const carritosMongoDB = new ContenedorCarritosMongoDB()
const dotenv = require('dotenv')
const { fork } = require('child_process')
const path = require('path')
const os = require('os')
const logger = require('../logger')
const nodemailer = require("nodemailer");
dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//-----------------------------NODEMAILER--------------------------//
let VARIABLE_GLOBAL_ALL_MAILS = [];

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'hilbert2@ethereal.email',
        pass: 'vMRjyhCpGWfD6uHK7T'
    }
});
//---------------------------------------------------------------//

//-------------------------------twilio-----------------//
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
//-----------------------------------------------------//

// Rutas de registro //
const getRegistrar = async (req, res) => {
    if (req.session.nombre) {
        res.redirect('/datos')
    } else {
        res.render('register')
    }
}

// Rutas de login //
const getLogin = async (req, res) => {
    if (req.session.nombre) {
        res.redirect('/datos')
    } else {
        res.render('login')
    }
}

const postLogin = async (req, res, next) => {
    if (req.user == undefined) {
        return next()
    }
    req.session.nombre = req.user.nombre
    req.session.contador = 0
    next()
}

// Rutas de datos //
const getDatos = async (req, res) => {
    const nombre = req.session.nombre
    const usuarios = await usuariosMongoDB.getAll1()

    if (req.session.nombre) {
        let user = await usuarios.find(usuario => usuario.nombre == nombre)
        req.session.contador++
        res.render('datos', {
            user,
            contador: req.session.contador
        })
    } else {
        req.session.destroy()
        res.redirect('/login')
    }
}

// Ruta Datos del Process //
const getDatosProcess = async (req, res) => {
    const argumentos = process.argv.slice(2)
    const plataforma = process.platform
    const version = process.version
    const memoria = process.memoryUsage().rss
    const path = process.execPath
    const id = process.pid
    const carpeta = process.cwd()
    //numeros de procesadores presentes en el servidor
    const cpus = os.cpus().length

    if (req.session.nombre) {
        logger.info('Se accedió a la ruta /info')
        res.render('data-process', {
            argumentos,
            plataforma,
            version,
            memoria,
            path,
            id,
            carpeta,
            cpus
        })
    } else {
        req.session.destroy()
        res.redirect('/login')
        logger.info('Se intentó acceder a la ruta /info sin estar logueado')
    }
}

//Ruta de numeros random //
const getNumerosRandom = async (req, res) => {
    //recibo por params la cantidad de numeros random que quiero
    const cantidad = req.params.cant || 100000000;

    const calculo = fork(path.resolve(process.cwd(), './middleware/calculo.js'));
    calculo.on('message', result => {
        if (result == 'listo') {
            calculo.send(cantidad);
        } else {
            res.json(result);
        };
    });
};

// Ruta de logout //
const getLogout = async (req, res) => {
    req.logout(err => {
        res.redirect('/login')
    })
}

// Ruta raiz //
const getRaiz = async (req, res) => {
    res.redirect('/datos')
}

//Ruta carrito //
const getCarrito = async (req, res) => {
    const nombre = req.session.nombre
    const usuarios = await usuariosMongoDB.getAll1()

    if (req.session.nombre) {
        let user = await usuarios.find(usuario => usuario.nombre == nombre)

        const productos = await carritosMongoDB.getAllProductosByIdUsuario(user.email)
        res.render('carrito', {
            user,
            productos
        })
    } else {
        req.session.destroy()
        res.redirect('/login')
    }
}

//Ruta de eliminar producto del carrito //
const deleteProductoCarrito = async (req, res) => {

    const nombre = req.session.nombre
    const usuarios = await usuariosMongoDB.getAll1()

    if (req.session.nombre) {

        let user = await usuarios.find(usuario => usuario.nombre == nombre)
        const productos = await carritosMongoDB.getAllProductosByIdUsuario(user.email)
        const producto = await productos.find(producto => producto.codigo == req.params.id)
        await carritosMongoDB.deleteProductoById(producto)
        res.redirect('/carrito')
    } else {
        req.session.destroy()
        res.redirect('/login')
    }
}

//Ruta para checkout con los productos del carrito  y datos del usuario//
const getCheckout = async (req, res) => {
    const nombre = req.session.nombre
    const usuarios = await usuariosMongoDB.getAll1()

    if (req.session.nombre) {
        let user = await usuarios.find(usuario => usuario.nombre == nombre)
        const productos = await carritosMongoDB.getAllProductosByIdUsuario(user.email)
        res.render('checkout', {
            user,
            productos
        })

        //envio de mails
        const mailOptions = {
            from: 'No-Replay <hilbert2@ethereal.email>',
            to: 'Dear Developer <hilbert2@ethereal.email>', /* user.email en realidad */
            subject: `Nuevo pedido de ${user.nombre}, email: ${user.email}`,
            text: `Se ha realizado un nuevo pedido. Los productos comprados son: ${productos.map(producto => producto.titulo).join(', ')}`,
            html: `
                <h1>Compra realizada</h1>
                <p>Gracias por su compra</p>
                <p>Los productos comprados son:</p>
                <ul>
                    ${productos.map(producto => `<li>${producto.titulo}</li>`).join('')}
                </ul>
            `
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error al enviar el mail:', err);
                return;
            }
            console.log('Mail enviado correctamente', info.messageId);
            console.log('URL del mail:', nodemailer.getTestMessageUrl(info));
            //guardar en variable global el email de prueba
            VARIABLE_GLOBAL_ALL_MAILS.push(nodemailer.getTestMessageUrl(info));
            console.log('VARIABLE_GLOBAL_ALL_MAILS', VARIABLE_GLOBAL_ALL_MAILS)
        });

        //envio mismo mensaje por whatsapp
        client.messages
            .create({
                body: `Se ha realizado un nuevo pedido. Los productos comprados son: ${productos.map(producto => producto.titulo).join(', ')}`,
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:' + '+' + user.telefono
            })
            .then(message => console.log('Whatsapp enviado: ', message.sid))

        //elimino los productos del carrito
        for (let i = 0; i < productos.length; i++) {
            await carritosMongoDB.deleteProductoById(productos[i])
        }

    } else {
        req.session.destroy()
        res.redirect('/login')
    }
}

module.exports = {
    getRegistrar,
    getLogin,
    postLogin,
    getDatos,
    getLogout,
    getRaiz,
    getDatosProcess,
    getNumerosRandom,
    getCarrito,
    deleteProductoCarrito,
    getCheckout
};