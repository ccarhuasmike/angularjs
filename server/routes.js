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

router.post('/api/authenticate', function (req, res) {
    // User.findOne({
    //     email: req.body.email
    // }, function (err, user) {
    //     if (err) throw err;

    //     if (!user) {
    //         res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    //     } else {
    //         //check if password matches

    //         user.comparePassword(req.body.password, function (err, isMatch) {

    //             if (isMatch && !err) {
    //                 // if user is found and password is right create a token
    //                 var token = jwt.sign(user.toJSON(), "secreto", {
    //                     expiresIn: '1m' // 1 week
    //                 });
    //                 // return the information including token as JSON
    //                 res.json({
    //                     type: true,
    //                     data: user,
    //                     token: 'JWT ' + token
    //                 });
    //                 //res.json({ success: true, token: 'JWT ' + token });
    //             } else {
    //                 res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
    //             }
    //         });
    //     }
    // });
    User.findOne({ email: req.body.email, password: req.body.password }, function (err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: true,
                    data: user,
                    token: user.token
                });
            } else {
                res.json({
                    type: false,
                    data: "Incorrect email/password"
                });
            }
        }
    });
});

router.post('/api/signin', function (req, res) {

    User.findOne({ email: req.body.email, password: req.body.password }, function (err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
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
                            type: true,
                            data: user1,
                            //token: user1.token
                        });
                    });
                });
            }
        }
    });
});

router.get('/api/me', ensureAuthorized, function (req, res) {
    var token = getToken(req.headers);
    if (token) {
        User.findOne({ token: req.token }, function (err, user) {
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                res.json({
                    type: true,
                    data: user
                });
            }
        });
    } else {
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    }
});

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};
//Api Rest
router.get('/api/getParametros', ensureAuthorized, async (req, res) => {
    const parametros = await Parametros.find({ descripcion: req.query.descripcion })
    res.json(parametros);
});
router.get('/api/getdatos', ensureAuthorized, async (req, res) => {
    // const parametros = new Parametros();
    // parametros.descripcion = "Marca";
    // parametros.estado = 1;
    // parametros.valor = [
    //     {
    //         descripcionCab: "Kia",
    //         ListDetalle: [
    //             {descripcionDet:"Rio"},
    //             {descripcionDet:"Cerato"},
    //             {descripcionDet:"Picanto"}            
    //         ]
    //     },
    //     {
    //         descripcionCab: "Toyota",
    //         ListDetalle: [
    //             {descripcionDet:"Yaris"},
    //             {descripcionDet:"Hilux"},
    //             {descripcionDet:"Corola"}             
    //         ]
    //     }
    // ]
    // await parametros.save();
    var token = getToken(req.headers);
    
    if (token) {
        var pagination = JSON.parse(req.query.pagination);
        ListarTask(pagination).then(function (result) {
            res.json(result);
        });
    } else {
        res.json({
            type: false,
            data: {},
            msg: 'Unauthorized.'             
        });
        //return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    }

});
ListarTask = function (req) {
    var promise = new Promise(function (resolve, reject) {
        var _pageNumber = parseInt(req.currentPage);
        _pageSize = parseInt(req.itemsPerPage);
        Task.count({}, function (err, count) {
            Task.find({}, null, {
                sort: {
                    title: 1
                }
            }).skip(_pageNumber > 0 ? ((_pageNumber - 1) * _pageSize) : 0).limit(_pageSize).exec(function (err, docs) {
                if (err)
                    resolve(err);
                else {
                    var objeto = {
                        "totalItems": count,
                        "_List": docs
                    }
                    resolve(objeto);
                }
            });
        });
    });
    return promise;
};

router.get('/api/getdatosPorId', ensureAuthorized, async (req, res) => {
    const task = await Task.findOne({ _id: req.query.Id });
    const ListParametros = await Parametros.find({ 'descripcion': "Marca" });
    const result = {
        objectTask: task,
        Listmarcas: ListParametros
    }
    res.json(result);
});

router.post('/api/editar', ensureAuthorized, async (req, res) => {
    var response = {}
    await Task.findByIdAndUpdate({
        _id: req.body.datos._id
    }, req.body.datos, function (error) {
        if (error) {
            response.result = false;
            response.mensaje = error.message;
        } else {
            ListarTask(req.body.pagination).then(function (result) {
                res.json(result);
            });
        }
    });
});

router.post('/api/add', ensureAuthorized, async (req, res) => {
    const task = new Task(req.body.datos);
    await task.save();
    ListarTask(req.body.pagination).then(function (result) {
        res.json(result);
    });
});
router.post('/api/delete', ensureAuthorized, async (req, res) => {
    await Task.remove({ _id: req.body.Id });
    ListarTask(req.body.pagination).then(function (result) {
        res.json(result);
    });
});

module.exports = router;