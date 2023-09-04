import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
	{
		nameAr: { type: String, required: true },
		nameEn: { type: String, required: true },
		image: String,
		category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
	},
	{ versionKey: false }
);

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
