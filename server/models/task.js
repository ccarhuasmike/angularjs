const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
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
UserSchema.pre('save', function (next) {
    var user = this;
    
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }            
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
UserSchema.methods.comparePassword = function (passw, cb) {
    
    bcrypt.compare(passw, this.password,function  (err, result){        
        if (err) {
            return cb(err);
        }
        cb(null, result);
    });
};

const parametos = mongoose.model('parametros', Parametros);
const task = mongoose.model('task', taskSchema);
const user = mongoose.model('users', UserSchema);

module.exports = {
    Task:task,
    Parametros:parametos,
    User:user,
};
//module.exports = mongoose.model('task',taskSchema);
