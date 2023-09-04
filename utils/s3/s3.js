//import aws from 'aws-sdk';
import s3Lib from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from 'config';

const  S3  = s3Lib.S3Client;

const awsConfig = config.get('AWS');
const keys = {
	credentials: {
		accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
		secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY,
		signatureVersion: 'v4',
	},
	region: awsConfig.AWS_REGION,
};
const s3 = new S3(keys);

class AWS {
	/**
	 *
	 * @param {String} Key
	 * @param {ReadStream} Body
	 * @param {Boolean}isPrivate
	 * @param {Function}cb
	 */

	static uploadToS3(Key, Body, isPrivate, cb) {
		let Bucket = isPrivate ? awsConfig.S3.PRIVATE_ASSETS_BUCKET_NAME : awsConfig.S3.PUBLIC_ASSETS_BUCKET_NAME;
		const params = {
			Bucket,
			Key,
			Body,
		};
		let size = 0;

		const upload = s3.upload(params);
		upload.on('httpUploadProgress', function (ev) {
			if (ev.total) size = ev.total;
		});
		upload.send(function (err, result) {
			if (err) return cb(err);
			else {
				cb(null, {
					size,
					bucket: Bucket,
					Key,
					Location: result.Location,
					versionId: result.VersionId,
				});
			}
		});
	}

	/**
	 *
	 * @param {String} Key
	 * @param {Boolean}isPrivate
	 */
	static async deleteFromS3(Key, isPrivate) {
		let Bucket = isPrivate ? awsConfig.S3.PRIVATE_ASSETS_BUCKET_NAME : awsConfig.S3.PUBLIC_ASSETS_BUCKET_NAME;
		console.info(`deleting ${Key} From S3 `);
		const params = {
			Bucket,
			Key,
		};

		return new Promise((resolve, reject) => {
			s3.deleteObject(params, (err, response) => {
				if (err) return reject(err);
				return resolve(response);
			});
		});
	}

	/**
	 *
	 * @param {String}Key
	 * @param {boolean}isPrivate
	 * @param {Number}[Expires]
	 * @return {string}
	 */
	static async getSignedURL(Key, isPrivate, Expires = 100) {
		let Bucket = isPrivate ? awsConfig.S3.PRIVATE_ASSETS_BUCKET_NAME : awsConfig.S3.PUBLIC_ASSETS_BUCKET_NAME;
		return s3.getSignedUrl('getObject', {
			Bucket,
			Key,
			Expires,
		});
	}

	static async getSignedPutURL(Key, isPrivate, Expires = 100) {
		let Bucket = isPrivate ? awsConfig.S3.PRIVATE_ASSETS_BUCKET_NAME : awsConfig.S3.PUBLIC_ASSETS_BUCKET_NAME;
		return s3.getSignedUrl('putObject', {
			Bucket,
			Key,
			Expires,
		});
	}
	static async getSignedPutURLV3(Key, isPrivate, Expires = 100) {
		let Bucket = isPrivate ? awsConfig.S3.PRIVATE_ASSETS_BUCKET_NAME : awsConfig.S3.PUBLIC_ASSETS_BUCKET_NAME;
		const command = new s3Lib.PutObjectCommand({Bucket, Key });
		return await getSignedUrl(s3, command, { expiresIn: Expires });
	}
}

export default AWS;
