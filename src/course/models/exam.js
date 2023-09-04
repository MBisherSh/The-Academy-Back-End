import mongoose from 'mongoose';

const choiceSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	isTrueAnswer: {
		type: Boolean,
		required: true,
	},
});

const questionSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	choices: [choiceSchema],
});

const examSchema = new mongoose.Schema(
	{
		nameAr: { type: String, required: true },
		nameEn: { type: String, required: true },
		language: { type: String, enum: ['ar', 'en'], required: true },
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
		questions: [questionSchema],
	},
	{ versionKey: false }
);

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
