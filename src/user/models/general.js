import mongoose from 'mongoose';

const generalSchema = new mongoose.Schema({
	key: {
		type: String,
		required: true,
		unique: true,
	},
	value: {
		type: String,
		required: true,
	},
	isGeneral: {
		type: Boolean,
		default: true,
		required: true,
	},
});

const General = mongoose.model('General', generalSchema);

export default General;
