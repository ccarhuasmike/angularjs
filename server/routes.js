const express = require('express');
const router = express.Router();
const Task = require('./models/task').Task;
const Parametros = require('./models/task').Parametros;
const User = require('./models/task').User;
const jwt = require("jsonwebtoken");
const passport = require('passport');
require('./config/passport')(passport);
router.get('/', async (req, res) => {
    res.render('index');
});
var apiUsuario = {
    ensureAuthorized: function (req, res, next) {
        var bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined') {
            token = bearerHeader.replace('Bearer ', '')
            jwt.verify(token, 'secreto', function (err, decoded) {
                if (err)
                    res.status(401).send({ status: false, msg: 'Token inválido', error: err })
                else
                    next();
            });
        } else
            res.status(403).send({ status: false, msg: 'Es necesario el token de autenticación' });
    },
    signin: function (req, res) {
        User.findOne({ email: req.body.email, password: req.body.password }, function (err, user) {
            if (err) {
                res.json({
                    status: false,
                    data: "Error occured: " + err
                });
            } else {
                if (user) {
                    res.json({
                        status: false,
                        data: "User already exists!"
                    });
                } else {
                    //Metodo registra usuario      
                    var userModel = new User();
                    userModel.email = req.body.email;
                    userModel.password = req.body.password;
                    userModel.save(function (err, user) {
                        //user.token = jwt.sign(user, "abcd1234");
                        user.save(function (err, user1) {
                            res.json({
                                status: true,
                                data: user1,
                            });
                        });
                    });
                }
            }
        });
    },
    authenticateUsuario: function (req, res) {
        User.findOne({
            email: req.body.email
        }, function (err, user) {
            if (err) throw err;
            if (!user)
                res.status(401).send({ status: false, msg: 'Authentication failed. User not found.' });
            else {
                //verificar si la contraseña coincide
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        // si se encuentra el usuario y la contraseña es correcta, cree un token
                        var token = jwt.sign(user.toJSON(), "secreto", {
                            expiresIn: '300' // 1 week
                        });
                        // devolver la información, incluido el token como JSON
                        res.json({
                            status: true,
                            data: user,
                            token: 'JWT ' + token
                        });
                    } else
                        res.status(401).send({ status: false, msg: 'Authentication failed. Wrong password.' });
                });
            }
        });
    },
    listarUsuario: function (req, res) {
        User.find({}, function (err, user) {
            if (err) {
                res.json({
                    status: false,
                    data: "Error occured: " + err
                });
            } else {
                res.json({
                    status: true,
                    data: user
                });
            }
        });
    },
    guardarUsuario: async function (req, res) {
        const user = new User(req.body);
        await user.save(function (error, result) {
            if (error) {
                res.json({
                    status: false,
                    msg: "Ocurrio un error al registrar los datos del usuario: " + err
                });
            } else {
                res.json({
                    status: true,
                    data: result,
                    msg: "Se registraron satisfactoriamente los  datos del usuario"
                });
            }
        });
    },
    editarUsuario: async function (req, res) {
        await User.findByIdAndUpdate({
            _id: req.body._id
        }, req.body, function (error, result) {
            if (error) {
                res.json({
                    status: false,
                    msg: "Ocurrio un error al modificar los datos del usuario: " + error.message
                });
            } else {
                res.json({
                    status: true,
                    data: result,
                    msg: "Se actualizo satisfactoriamente los  datos del usuario"
                });
            }
        });
    },
    eliminarUsuario: async function (req, res) {
        await User.findByIdAndRemove({ _id: req.body._id }, function (error, result) {
            if (error) {
                res.json({
                    status: false,
                    msg: "Ocurrio un error al eliminar los datos del usuario: " + error.message
                });
            } else {
                res.json({
                    status: true,
                    data: result,
                    msg: "Se elimino satisfactoriamente los  datos del usuario"
                });
            }
        });
    },
    obtenerUsuarioPorId: async function (req, res) {
        const user = await User.findOne({ _id: req.query.Id });
        res.json({
            status: true,
            data: user
        });
    }
};
//Api Rest
router.post('/api/authenticateUsuario', apiUsuario.authenticateUsuario);
router.post('/api/signin', apiUsuario.signin);
router.get('/api/listarUsuario', apiUsuario.ensureAuthorized, apiUsuario.listarUsuario);
router.post('/api/guardarUsuario', apiUsuario.ensureAuthorized, apiUsuario.guardarUsuario);
router.post('/api/editarUsuario', apiUsuario.ensureAuthorized, apiUsuario.editarUsuario);
router.post('/api/eliminarUsuario', apiUsuario.ensureAuthorized, apiUsuario.eliminarUsuario);
router.post('/api/obtenerUsuarioPorId', apiUsuario.ensureAuthorized, apiUsuario.obtenerUsuarioPorId);

module.exports = router;