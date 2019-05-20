const express = require('express');
const router = express.Router();
const Task = require('./models/task').Task;
const Parametros = require('./models/task').Parametros;
//const Parametros = require('./models/task');
router.get('/', async (req, res) => {
    res.render('index');
});

//Api Rest
router.get('/api/getParametros', async (req, res) => {
    const parametros = await Parametros.find({ descripcion: req.query.descripcion })
    res.json(parametros);
});
router.get('/api/getdatos', async (req, res) => {
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

    var pagination = JSON.parse(req.query.pagination);
    ListarTask(pagination).then(function (result) {
        res.json(result);
    });
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

router.get('/api/getdatosPorId', async (req, res) => {    
    const task = await Task.findOne({ _id: req.query.Id });
    const ListParametros =  await Parametros.find({'descripcion':"Marca"});
    const result = {
        objectTask: task,
        Listmarcas: ListParametros
    }
    res.json(result);
});

router.post('/api/editar', async (req, res) => {
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

router.post('/api/add', async (req, res) => {
    const task = new Task(req.body.datos);
    await task.save();
    ListarTask(req.body.pagination).then(function (result) {
        res.json(result);
    });
});
router.post('/api/delete', async (req, res) => {
    await Task.remove({ _id: req.body.Id });
    ListarTask(req.body.pagination).then(function (result) {
        res.json(result);
    });
});

module.exports = router;