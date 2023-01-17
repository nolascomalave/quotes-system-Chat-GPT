import {Schema, model} from 'mongoose';
//import Role from './Role';

export const UserSchema=new Schema({
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
    gender:{
        type:String,
        required:true
    },
    SSN:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type: String,
        required:true
    },
    phones:{
        primary:{type:String, required:true},
        secondary:{type:String}
    },
    adress:{
        type: String,
        required:true
    },
    photo:{type:String},
    password:{
        type:String,
        required:true
    },
    roles:[{type: Schema.Types.ObjectId, ref:'Role'}],
    _enable:{type:Boolean, required:true},
    createdBy:{type:Schema.Types.ObjectId, ref:'User'},
    updatedBy:{type:Schema.Types.ObjectId, ref:'User'}
},{
    timestamps:true,
    versionKey:false
});

export default model('User', UserSchema);