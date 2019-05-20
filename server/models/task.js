const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: String,
    descripcion :String,
    marca:String,
    modelo:String,
    comentario:String,
    fecha:Date
    // Marca:[
    //     String
    // ],
    // status : {
    //     type:Boolean,
    //     default:false
    // }
});

const Parametros = new Schema({
    descripcion : String,
    estado:Number,
    valor :[{
         descripcionCab:String,
         ListDetalle :[{
            descripcionDet:String            
       }]
    }]    
});

const parametos = mongoose.model('parametros', Parametros);
const task = mongoose.model('task', taskSchema);

module.exports = {
    Task:task,
    Parametros:parametos,
};


//module.exports = mongoose.model('task',taskSchema);
