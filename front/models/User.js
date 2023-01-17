import {Schema, model, Types, models} from 'mongoose';

const userSchema=new Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    names:{
        first:{type: String, required:true},
        second:{type: String}
    },
    lastnames:{
        first:{type: String, required:true},
        second:{type: String}
    },
    /* id_document:{
        number:{type:Number, required:true},
        type:{type:String, required:true}
    }, */
    email:{
        type: String,
        required:true
    },
    phones:{
        primary:{type:String, required:true},
        secondary:{type:String}
    },
    photo:{type:String},
    password:{
        type:String,
        required:true
    },
    roles:[{type:Types.ObjectId, ref: 'Roles'}],
    _enable:{type:Boolean, required:true}
},{
    timestamps:true,
    versionKey:false
});

const User = models.User || model('User', userSchema);

export default User;