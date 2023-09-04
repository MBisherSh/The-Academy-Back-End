import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			required: true,
			enum: ['deposit', 'fee'],
		},
		amount: {
			type: Number,
			required: true,
		},
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		details: String,
	},
	{ versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
