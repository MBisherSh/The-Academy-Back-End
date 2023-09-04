import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
	{
		nameAr: { type: String, required: true },
		nameEn: { type: String, required: true },
		descriptionAr: { type: String, required: true },
		descriptionEn: { type: String, required: true },
		image: String,
		subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		accepted: {
			type: Boolean,
			default: false,
		},
		isPrivate: {
			type: Boolean,
			default: false,
		},
		users: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: false },
		pendingUsers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: false },
		active: {
			type: Boolean,
			default: true,
		},
	},
	{ versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
