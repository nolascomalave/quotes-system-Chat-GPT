import {Schema, model} from 'mongoose';

const clientSchema=new Schema({
    doc:{
        type:String,
        required:true
    },
    name:String,
    email:{
        type: String,
        required:true
    },
    phones:{
        primary:{type:String, required:true},
        secondary:{type:String}
    },
    description:String,
    adress:{
        type: String,
        required:true
    },
    photo:{type:String},
    quotes:[{type: Schema.Types.ObjectId, ref:'Quote'}],
    createdBy:{type:Schema.Types.ObjectId, ref:'User'},
    updatedBy:{type:Schema.Types.ObjectId, ref:'User'}
},{
    timestamps:true,
    versionKey:false
});

export default model('Client', clientSchema);