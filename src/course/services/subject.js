import Subject from '../models/subject.js';
import { Exception, S3, statusCodes } from '../../../utils/index.js';
class SubjectService {
	constructor(data) {
		this.image = data.image;
		this.nameAr = data.nameAr;
		this.nameEn = data.nameEn;
		this.category = data.categoryId;
	}

	async create() {
		const subject = await Subject.create(this);
		return { msg: 'added a subject.', subject };
	}

	static async getSubject(filters) {
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);
		let filter = filters.search
			? {
					$or: [
						{ nameAr: { $regex: filters.search, $options: 'i' } },
						{ nameEn: { $regex: filters.search, $options: 'i' } },
					],
			  }
			: {};
		if (filters.categoryId) filter.category = filters.categoryId;
		let sort = filters.sort ? { [filters.sort]: 1, _id: -1 } : { _id: -1 };
		let total;
		if (offset === 0) total = await Subject.count(filter);
		const data = await Subject.find(filter).sort(sort).skip(offset).limit(limit).populate('category').exec();
		return { msg: 'OK', total, data };
	}

	static async getById(id) {
		const data = await Subject.findById(id).populate('category').exec();
		if (!data) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such subject.');
		return { msg: 'OK', data };
	}

	static async update(id, data) {
		let subject;
		if (data.categoryId) data.category = data.categoryId;
		if (data.image) {
			const oldSubject = await Subject.findByIdAndUpdate(id, data, { returnDocument: 'before', lean: true });
			try {
				await S3.deleteFromS3(oldSubject.image, false);
			} catch (e) {}
			subject = await Subject.findById(id).populate('category').exec();
		} else
			subject = await Subject.findByIdAndUpdate(id, data, { returnDocument: 'after', lean: true })
				.populate('category')
				.exec();
		return { msg: 'updated an subject.', subject };
	}

	static async delete(id) {
		const subject = await Subject.findByIdAndDelete(id);
		try {
			await S3.deleteFromS3(subject.image, false);
		} catch (e) {}
		return { msg: 'deleted a subject.', id };
	}
}

export default SubjectService;
