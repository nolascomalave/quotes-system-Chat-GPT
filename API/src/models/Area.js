import { Schema, model } from 'mongoose';

const areaSchema=new Schema({
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
    multi_environment:{
        type:Boolean,
        required:true
    },
    internal_area:Boolean,
    description:String,
    photo:String,
    createdBy:{type:Schema.Types.ObjectId, ref:'User'},
    updatedBy:{type:Schema.Types.ObjectId, ref:'User'}
}, {
    timestamps:true,
    versionKey:false
});

export default model('Area', areaSchema);