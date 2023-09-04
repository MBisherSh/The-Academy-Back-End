import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
	questionId: { type: String, required: true },
	choiceId: { type: String, required: true },
});

const userExamSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
		answers: [answerSchema],
		mark: { type: Number },
	},
	{ versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

const UserExam = mongoose.model('UserExam', userExamSchema);

export default UserExam;
