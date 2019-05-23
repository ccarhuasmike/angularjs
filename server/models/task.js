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

const UserSchema   = new Schema({
    email: String,
    password: String,
    token: String
});

const parametos = mongoose.model('parametros', Parametros);
const task = mongoose.model('task', taskSchema);
const user = mongoose.model('users', UserSchema);

module.exports = {
    Task:task,
    Parametros:parametos,
    User:user,
};


//module.exports = mongoose.model('task',taskSchema);
