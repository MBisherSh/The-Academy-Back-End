import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
		},
		nameAr: {
			type: String,
			required: true,
		},
		nameEn: {
			type: String,
			required: true,
		},
		roles: { type: [Number], ref: 'Role' },
	},
	{ versionKey: false }
);

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
