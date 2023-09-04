import multer from 'multer';
import path from 'path';
import mkdirp from 'mkdirp';
import statusCodes from '../statusCodes.js';
import Exception from '../errorHandlers/exception.js';
import multerS3 from 'multer-s3';
// import aws from 'aws-sdk';
// const { S3 } = aws;
import s3Lib from '@aws-sdk/client-s3';
const S3 = s3Lib.S3Client;
import config from 'config';
import { v4 as uuid } from 'uuid';

const awsConfig = config.get('AWS');

const privateBucket = awsConfig.S3.PRIVATE_ASSETS_BUCKET_NAME;
const publicBucket = awsConfig.S3.PUBLIC_ASSETS_BUCKET_NAME;
const keys = {
	credentials: {
		accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
		secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY,
		signatureVersion: 'v4',
	},

	region: awsConfig.AWS_REGION,
};
const s3 = new S3(keys);
/**
 *
 * @param {Array<String>} types
 * @param {File}file
 * @param {Function}cb
 * @return {Function}
 */
// function checkFileType(types, file, cb) {
// 	const fileTypes = new RegExp(types.join('|'));
// 	const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
// 	const mimeType = fileTypes.test(file.mimetype);
// 	if (mimeType && extName) {
// 		return cb(null, true);
// 	} else {
// 		cb(new Exception(statusCodes.BAD_REQUEST, `File type not allowed, only ${types.join(', ')} are allowed`));
// 	}
// }
/**
 * Generates files uploading middleware,
 * Uploaded assets are found in the map object: res.locals.assets
 *
 * @param {Object} options
 * @param {Array<{name: String , maxCount: Number,  required: Boolean}>} [options.fields] name is the key, maxCount is the max number of files
 * @param {Number} [options.maxFileSize] Megabytes
 * @param {Array<String>} [options.allowedFileTypes]
 * @param {boolean} [options.isPrivate]
 */
const middlewareGenerator = ({ fields, maxFileSize, allowedFileTypes, isPrivate = false, isLocal = false }) => {
	let bucket = isPrivate ? privateBucket : publicBucket;

	if (process.env.NODE_ENV == 'dev') {
		isLocal = true;
		mkdirp.sync(path.join('assets'));
	}

	const storage = isLocal
		? multer.diskStorage({
				destination: function (req, file, cb) {
					cb(null, process.cwd() + '/assets');
				},
				filename: function (req, file, cb) {
					cb(null, file.fieldname + '-' + uuid() + path.extname(file.originalname));
				},
		  })
		: multerS3({
				s3,
				bucket: function (req, file, cb) {
					let bucketName = file.fieldname === 'pdf' || file.fieldname === 'autoCad' ? privateBucket : bucket;
					cb(null, bucketName);
				},
				key: function (req, file, cb) {
					cb(null, file.fieldname + '-' + uuid() + path.extname(file.originalname));
				},
		  });

	const upload = multer({
		storage,
		limits: { fileSize: maxFileSize * 1024 * 1024 },
	}).fields(fields);

	return (req, res, next) => {
		upload(req, res, async (err) => {
			if (err) {
				if (err.code == 'LIMIT_FILE_SIZE') {
					next(
						new Exception(statusCodes.BAD_REQUEST, `File size limit exceeded, maximum is ${maxFileSize}MB`)
					);
				} else if (err.code == 'LIMIT_UNEXPECTED_FILE') {
					next(new Exception(statusCodes.BAD_REQUEST, `Unexpected File key`));
				} else {
					next(err);
				}
			} else {
				if (req.files == undefined) {
					next();
				} else {
					if (!res.locals) res.locals = {};
					if (!res.locals.assets) res.locals.assets = {};
					await Promise.all(
						fields.map(async (field) => {
							if (req.files[field.name]) {
								await Promise.all(
									req.files[field.name].map(async (file) => {
										//console.log(file);
										const asset = {
											filename: file.originalname,
											url: isLocal ? file.path : file.location,
											sizeInBytes: file.size,
											isPrivate,
											key: isLocal ? file.filename : file.key,
										};
										if (!res.locals.assets[field.name]) res.locals.assets[field.name] = [];
										res.locals.assets[field.name].push(asset);
									})
								);
							} else if (field.required) {
								next(new Exception(statusCodes.BAD_REQUEST, `${field.name} is required`));
							}
						})
					);
					next();
				}
			}
		});
	};
};

export default middlewareGenerator;
