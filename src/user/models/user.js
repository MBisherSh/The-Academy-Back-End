import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please tell us your name!'],
		},
		email: {
			type: String,
			required: [true, 'Please provide your email'],
			unique: true,
		},
		role: { type: Number, ref: 'Role' },
		passwordHash: {
			type: String,
			required: [true, 'Please confirm your password'],
		},
		changedPasswordAt: Date,
		passwordResetCode: Number,
		passwordResetCodeAt: Date,
		profileImage: String,
		isOnline: { type: Boolean, default: false },
		balance: { type: Number, default: 0 },
	},
	{ versionKey: false }
);

const User = mongoose.model('User', userSchema);

export default User;
