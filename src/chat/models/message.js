import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
	data: {
		type: String,
		required: true,
	},
	config: { type: Map, of: String, required: false },
	chosenBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: false },
});

const messageSchema = new mongoose.Schema(
	{
		sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		type: {
			type: String,
			enum: ['text', 'image', 'voice', 'file', 'location', 'slides', 'poll'],
			required: true,
		},
		course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
		conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: false },
		contents: [contentSchema],
		replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: false },
	},
	{ versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
