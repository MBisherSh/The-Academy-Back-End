import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
	{
		firstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		secondUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{ versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
