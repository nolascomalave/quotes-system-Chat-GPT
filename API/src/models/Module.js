import { Schema, model } from 'mongoose';

const moduleSchema = new Schema({
	name: {
		unique: true,
		type: String,
		required: true
	},
	
	active: {
		required: true,
		type: Boolean
	}
}, {
    timestamps:true,
    versionKey:false
});

export default model('Module', moduleSchema);