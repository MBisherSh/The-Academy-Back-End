import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
	{
		nameAr: {
			type: String,
			required: true,
		},
		nameEn: {
			type: String,
			required: true,
		},
		_id: {
			type: Number,
		},
	},
	{ versionKey: false }
);

const Role = mongoose.model('Role', roleSchema);

export default Role;
