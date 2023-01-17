import { Schema, model } from 'mongoose';

import AddedValue from './AddedValueType';

const quoteJobSchema = new Schema({
    job: {type: Schema.Types.ObjectId, ref:'Job'},

    name: {
        type: String,
        required: true
    },

    estimated_time: Number,

    areas:[{type:Schema.Types.ObjectId, ref:'Area'}],

    price: {
        type: Number,
        required: true
    },
    added_values: [AddedValue],
}, {
    timestamps:true,
    versionKey:false
});

export default model('QuoteJob', quoteJobSchema);