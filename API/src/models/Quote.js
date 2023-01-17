import {Schema, model} from 'mongoose';

/*import QuoteService from './QuoteService';
import ProductService from './QuoteService';
import AddedValue from './AddedValueType';*/

// Methods:
// import * as methods from '../services/Quote';

const QuoteSchema = new Schema({
    doc_number: String,
    products: [{
        product: {type: Schema.Types.ObjectId, ref:'Product'},
        name: {
            type: String,
            required: true
        },
        brand: String,
        model: String,
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
        added_values: [{
            added_value_type: {type: Schema.Types.ObjectId, ref:'AddedValueType'},
            amount: Number
        }]
    }],

    services: [{
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
        added_values: [{
            added_value_type: {type: Schema.Types.ObjectId, ref:'AddedValueType'},
            amount: Number
        }],
    }],

    coin: {type: Schema.Types.ObjectId, ref:'Coin', required: true},

    added_values: [
        {
            added_value_type: {type: Schema.Types.ObjectId, ref:'AddedValueType'},
            amount: Number
        }
    ],
    total: {
        type: Number,
        required: true
    },

    description: String,

    attachments: [String],
    voice_notes: [String],
    notes: [String],

    accepted: {
        type: Boolean,
        required: true,
        default: false
    },

    canceled: {
        type: Boolean,
        required: true,
        default: false
    },

    createdBy:{type: Schema.Types.ObjectId, ref:'User', required: true},
    updatedBy:{type: Schema.Types.ObjectId, ref:'User', required: true}
}, {
    timestamps:true,
    versionKey:false
});

// QuoteSchema.methods.hi = methods.hi;

const QuoteModel = model('Quote', QuoteSchema);
export default QuoteModel;