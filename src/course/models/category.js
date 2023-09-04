import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
	{
		nameAr: { type: String, required: true },
		nameEn: { type: String, required: true },
		image: String,
	},
	{ versionKey: false }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
