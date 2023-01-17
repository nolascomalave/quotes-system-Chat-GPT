import {Schema, model} from 'mongoose';

import AddedValue from './AddedValueType';

const quoteProdSchema=new Schema({
    product: {type: Schema.Types.ObjectId, ref:'Product'},
    name:String,
    brand:{
        type:String
    },
    model:{
        type:String
    },
    quantity: {
        type: Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    added_values: [AddedValue],
    description: String
});

export default model('quoteProd', quoteProdSchema);