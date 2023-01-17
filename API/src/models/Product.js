import { Schema, model } from 'mongoose';

export const ProductSchema = new Schema({
    code:{
        type:String
    },
    supplier:{type: Schema.Types.ObjectId, ref:'Supplier'},
    category:{
        type:String
    },
    name:{
        type:String,
        required:true
    },
    brand:{
        type:String
    },
    sale_price:{
        type:String
    },
    cost_price:String,
    stock:{
        type:Number
    },
    min_stock:{
        type:Number
    },
    max_stock:{
        type:Number
    },
    unit_measurement:{
        type:String
    },
    description:String,
    photo:String,
    createdBy:{type:Schema.Types.ObjectId, ref:'User'},
    updatedBy:{type:Schema.Types.ObjectId, ref:'User'}
},{
    timestamps:true,
    versionKey:false
});

export default model('Product', ProductSchema);