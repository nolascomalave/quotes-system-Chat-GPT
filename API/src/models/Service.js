import { Schema, model } from 'mongoose';

export const ServiceSchema = new Schema({
    code: String,
    category: String,
    name:{
        type: String,
        required:true
    },

    areas: [{type:Schema.Types.ObjectId, ref:'Area'}],

    unit_measurement: {type: Schema.Types.ObjectId, ref:'UnitMasurement'},
    unit_value: Number,

    description: String,

    photo: String,

    createdBy:{type:Schema.Types.ObjectId, ref:'User'},
    updatedBy:{type:Schema.Types.ObjectId, ref:'User'}
},{
    timestamps:true,
    versionKey:false
});

export default model('Service', ServiceSchema);