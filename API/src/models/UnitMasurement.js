import { Schema, model } from 'mongoose';

export const UnitMasurementSchema = new Schema({
    anglo_saxon: {
        type: Boolean,
        default: false,
        required: true
    },

    type: {
        type: String,
        required: true
    },
    subtype: {
        type: String,
        required: true,
        unique: true
    },

    symbol: {
        type: String,
        required: true,
        unique: true
    },

    name:{
        type:String,
        required:true
    },

    description:String
});

export default model('UnitMasurement', UnitMasurementSchema);