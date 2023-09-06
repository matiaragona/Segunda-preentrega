const ContenedorUsuarioMongoDB = require('../containers/containerUsuariosMongoDB')
const LocalStrategy = require("passport-local").Strategy
const passport = require("passport")
const usuariosMongoDB = new ContenedorUsuarioMongoDB()
const bCrypt = require('bcrypt')
const {
    getLogin,
    postLogin,
    getDatos,
    getLogout,
    getRaiz,
    getDatosProcess,
    getNumerosRandom,
    getCarrito,
    deleteProductoCarrito,
    getCheckout,
} = require('../controllers/controlerNuevo')
const { Router } = require('express')
const registrar = Router()
const login = Router()
const datos = Router()
const logout = Router()
const raiz = Router()
const datosProcess = Router()
const numerosRandoms = Router()
const carrito = Router()
const deleteProducto = Router()
const checkout = Router()
const compression = require('compression')
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//-----------------------------BCRYPT----------------------------------//
function createHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
}
//--------------------------------------------------------------------//

//-----------------------------NODEMAILER--------------------------//
let VARIABLE_GLOBAL_ALL_MAILS = [];

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'susie53@ethereal.email',
        pass: 'bMFwZuqeU3X4cDPN2v'
    }
});

//----------------------------PASSPORT LOCAL--------------------------//

// Registro //

passport.use("register", new LocalStrategy({
    passReqToCallback: true,
}, async (req, username, password, done) => {
    const usuario = await usuariosMongoDB.getAll(username);
    const { direccion, codigo, telefono, email, edad } = req.body;

    const newUser = {
        nombre: username,
        password: createHash(password),
        direccion,
        telefono: codigo + telefono,
        email,
        edad,
    };

    // Si hay un archivo de imagen, lo guardamos
    if (req.files && req.files.avatar) {
        const avatarFile = req.files.avatar;
        //usar el username para el nombre del archivo
        const avatarName = `${email}${path.extname(avatarFile.name)}`;
        const avatarPath = path.join(__dirname, '..', 'public', 'avatars', avatarName);

        if (!fs.existsSync(path.join(__dirname, '..', 'public', 'avatars'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'public', 'avatars'));
        }

        // Guardamos la imagen en la carpeta pública
        avatarFile.mv(avatarPath, async (err) => {
            if (err) {
                console.error('Error al guardar la imagen:', err);
                return done(err);
            }

            // Agregamos la ruta de la imagen al objeto usuario
            newUser.avatar = `/avatars/${avatarName}`;

            try {
                // Guardamos el objeto usuario en MongoDB
                const usuarioGuardado = await usuariosMongoDB.guardarUsuario(newUser);
                done(null, usuarioGuardado);

                // Enviamos el mail de bienvenida
                const mailOptions = {
                    from: 'No-Replay <susie53@ethereal.email>',
                    to: 'Dear Developer <susie53@ethereal.email>',
                    subject: 'Nuevo registro​',
                    text: `Bienvenido ${username}!, gracias por registrarse, ya puede loguearse y hacer su compra. Saludos, Tienda Online`,
                    html: `
                    <h1 style="color: #5e9ca0;">Bienvenido ${username}!</h1>
                    <p>Gracias por registrarse, ya puede loguearse y hacer su compra.</p>
                    <p>Saludos, Tienda Online</p>
                    `
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error('Error al enviar el mail:', err);
                        return;
                    }
                    console.log('Email enviado:', info.messageId);
                    console.log('URL del email:', nodemailer.getTestMessageUrl(info));
                    //guardar en variable global el email de prueba
                    VARIABLE_GLOBAL_ALL_MAILS.push(nodemailer.getTestMessageUrl(info));
                    console.log('VARIABLE_GLOBAL_ALL_MAILS', VARIABLE_GLOBAL_ALL_MAILS)
                });

            } catch (err) {
                console.error('Error al guardar el usuario en la base de datos:', err);
                done(err);
            }
        });
    } else {
        try {
            // Si no hay archivo de imagen, guardamos solo los datos del usuario
            const usuarioGuardado = await usuariosMongoDB.guardarUsuario(newUser);
            done(null, usuarioGuardado);
        } catch (err) {
            console.error('Error al guardar el usuario en la base de datos:', err);
            done(err);
        }
    }
}));

// Login //
passport.use("login", new LocalStrategy(async (username, password, done) => {
    const usuario = await usuariosMongoDB.getAll(username);
    if (!usuario) {
        return done(false);
    };

    if (!isValidPassword(usuario, password)) {
        return done(false)
    };

    return done(null, usuario);
}));

passport.serializeUser((user, done) => {
    done(null, user.nombre);
});

passport.deserializeUser(async (username, done) => {
    const usuario = await usuariosMongoDB.getAll(username);
    done(null, usuario);
});

//--------------------------------------------------------------------//

// Rutas Registro //
registrar.get("/register", (req, res) => { res.render('../views/register.ejs') })
registrar.post("/register", passport.authenticate("register", { failureRedirect: '/failregister', successRedirect: "/login" }))
registrar.get('/failregister', (req, res) => { res.render('registe-error') })

// Rutas Loguin //
login.get("/login", getLogin)
login.post("/login", passport.authenticate("login", { failureRedirect: '/faillogin', successRedirect: "/datos" }))
login.get('/faillogin', (req, res) => { res.render('login-error') })

// Ruta Datos //
datos.get('/datos', postLogin, getDatos)

// Ruta Datos del Process //
datosProcess.get('/info', compression(), getDatosProcess)

// Ruta números randoms con cantidad desde el params //
numerosRandoms.get('/api/randoms/:cant?', getNumerosRandom)

// Ruta Logout //
logout.get('/logout', getLogout)

// Ruta Raiz //
raiz.get('/', getRaiz)

// Ruta Carrito //
carrito.get('/carrito', getCarrito)

// Ruta Eliminar Producto del Carrito con id params //
deleteProducto.get('/carrito/borrar/:id', deleteProductoCarrito)

// Ruta checkout //
checkout.get('/checkout', getCheckout)

module.exports = { registrar, login, datos, logout, raiz, datosProcess, numerosRandoms, carrito, deleteProducto, checkout };