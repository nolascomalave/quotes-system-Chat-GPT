import { Schema, model } from 'mongoose';

export const JobSchema = new Schema({
    code:{
        type:String,
        unique:true,
        required:true
    },
    name:{
        type:String,
        unique:true,
        required:true
    },
    areas:[{type:Schema.Types.ObjectId, ref:'Area'}],
    description:String,
    photo:String,
    createdBy:{type:Schema.Types.ObjectId, ref:'User'},
    updatedBy:{type:Schema.Types.ObjectId, ref:'User'}
}, {
    timestamps:true,
    versionKey:false
});

export default model('Job', JobSchema);