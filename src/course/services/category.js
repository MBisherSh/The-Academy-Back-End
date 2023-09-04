import Category from '../models/category.js';
import { Exception, S3, statusCodes } from '../../../utils/index.js';
class CategoryService {
	constructor(data) {
		this.image = data.image;
		this.nameAr = data.nameAr;
		this.nameEn = data.nameEn;
	}

	async create() {
		const category = await Category.create(this);
		return { msg: 'added a category.', category };
	}

	static async getCategory(filters) {
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);
		let filter = filters.search
			? {
					$or: [
						{ nameAr: { $regex: filters.search, $options: 'i' } },
						{ nameEn: { $regex: filters.search, $options: 'i' } },
					],
			  }
			: undefined;
		let sort = filters.sort ? { [filters.sort]: 1, _id: -1 } : { _id: -1 };
		let total;
		if (offset === 0) total = await Category.count(filter);
		const data = await Category.find(filter).sort(sort).skip(offset).limit(limit).exec();
		return { msg: 'OK', total, data };
	}

	static async getById(id) {
		const data = await Category.findById(id).exec();
		if (!data) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such category.');
		return { msg: 'OK', data };
	}

	static async update(id, data) {
		let category;
		if (data.image) {
			const oldCategory = await Category.findByIdAndUpdate(id, data, { returnDocument: 'before', lean: true });
			try {
				await S3.deleteFromS3(oldCategory.image, false);
			} catch (e) {}
			category = await Category.findById(id).exec();
		} else category = await Category.findByIdAndUpdate(id, data, { returnDocument: 'after', lean: true }).exec();
		return { msg: 'updated an category.', category };
	}

	static async delete(id) {
		const category = await Category.findByIdAndDelete(id);
		try {
			await S3.deleteFromS3(category.image, false);
		} catch (e) {}
		return { msg: 'deleted a category.', id };
	}
}

export default CategoryService;
