import express from 'express';
const router = express.Router();
import { catchAsync } from '../../../utils/index.js';

import CategoryController from '../controllers/category.js';
import CategoryValidator from '../validators/category.js';
import SubjectController from '../controllers/subject.js';
import SubjectValidator from '../validators/subject.js';
import CourseController from '../controllers/course.js';
import CourseValidator from '../validators/course.js';
import ExamController from '../controllers/exam.js';
import ExamValidator from '../validators/exam.js';
import authenticationController from '../../authentication/controllers/authentication.js';

const restrictEditExam = authenticationController.restrictByPermissionId('EDIT_EXAM');
const restrictAttendExam = authenticationController.restrictByPermissionId('ATTEND_EXAM');

router.get(
	'/exam',
	catchAsync(ExamValidator.getList),
	catchAsync(ExamController.getExam)
);
router.post('/exam', catchAsync(restrictEditExam), catchAsync(ExamValidator.create), catchAsync(ExamController.create));

router
	.route('/exam/:id')
	.get(catchAsync(ExamValidator.getById), catchAsync(ExamController.getById))
	.patch(catchAsync(restrictEditExam), catchAsync(ExamValidator.update), catchAsync(ExamController.update))
	.delete(catchAsync(restrictEditExam), catchAsync(ExamValidator.delete), catchAsync(ExamController.delete));

router.post(
	'/attend-exam',
	catchAsync(restrictAttendExam),
	catchAsync(ExamValidator.attendExam),
	catchAsync(ExamController.attendExam)
);
router.get('/user-exam', catchAsync(ExamValidator.getMyUserExam), catchAsync(ExamController.getMyUserExam));
router.get('/evaluation', catchAsync(ExamValidator.getEvaluation), catchAsync(ExamController.getEvaluation));
router.get('/my-evaluation', catchAsync(ExamValidator.getEvaluation), catchAsync(ExamController.getMyEvaluation));
router.get('/user-exam/:id', catchAsync(ExamValidator.getById), catchAsync(ExamController.getUserExamById));
router.get(
	'/all-user-exam',
	catchAsync(restrictEditExam),
	catchAsync(ExamValidator.getAllUserExamList),
	catchAsync(ExamController.getAllUserExam)
);

const CourseUploader = CourseController.courseUploader(true);
const CourseUploaderOptional = CourseController.courseUploader(false);

router.patch('/ask-to-join/:id', catchAsync(CourseValidator.acceptAsk), catchAsync(CourseController.askTojoinCourse));

const restrictEditCourse = authenticationController.restrictByPermissionId('EDIT_COURSE');

router.get(
	'/my-owned',
	catchAsync(restrictEditCourse),
	catchAsync(CourseValidator.getMyOwnedCourse),
	catchAsync(CourseController.getMyOwnedCourse)
);

router.get('/my-all', catchAsync(CourseController.getAllUserCourse));

router.post(
	'/',
	catchAsync(restrictEditCourse),
	catchAsync(CourseUploader),
	catchAsync(CourseValidator.create),
	catchAsync(CourseController.create)
);

router.patch(
	'/add-to-course',
	catchAsync(restrictEditCourse),
	catchAsync(CourseValidator.addUserToCourse),
	catchAsync(CourseController.addUserToCourse)
);

router.patch(
	'/remove-from-course',
	catchAsync(CourseValidator.addUserToCourse),
	catchAsync(CourseController.removeUserFromCourse)
);

router.patch(
	'/set-active',
	catchAsync(restrictEditCourse),
	catchAsync(CourseValidator.setActive),
	catchAsync(CourseController.setActive)
);

router
	.route('/:id')
	.patch(
		catchAsync(restrictEditCourse),
		catchAsync(CourseUploaderOptional),
		catchAsync(CourseValidator.update),
		catchAsync(CourseController.update)
	)
	.delete(catchAsync(restrictEditCourse), catchAsync(CourseValidator.delete), catchAsync(CourseController.delete));

const restrictAcceptCourse = authenticationController.restrictByPermissionId('ACCEPT_COURSE');

router.patch(
	'/accept/:id',
	catchAsync(restrictAcceptCourse),
	catchAsync(CourseValidator.acceptAsk),
	catchAsync(CourseController.accept)
);
router.get(
	'/unaccepted',
	catchAsync(restrictAcceptCourse),
	catchAsync(CourseValidator.getList),
	catchAsync(CourseController.getUnAcceptedCourse)
);

const restrictControlData = authenticationController.restrictByPermissionId('CONTROL_DATA');

router.use(catchAsync(restrictControlData));

const CategoryUploader = CategoryController.categoryUploader(true);
const CategoryUploaderOptional = CategoryController.categoryUploader(false);

router.post(
	'/category',
	catchAsync(CategoryUploader),
	catchAsync(CategoryValidator.create),
	catchAsync(CategoryController.create)
);

router
	.route('/category/:id')
	.patch(
		catchAsync(CategoryUploaderOptional),
		catchAsync(CategoryValidator.update),
		catchAsync(CategoryController.update)
	)
	.delete(catchAsync(CategoryValidator.delete), catchAsync(CategoryController.delete));

const SubjectUploader = SubjectController.subjectUploader(true);
const SubjectUploaderOptional = SubjectController.subjectUploader(false);

router.post(
	'/subject',
	catchAsync(SubjectUploader),
	catchAsync(SubjectValidator.create),
	catchAsync(SubjectController.create)
);

router
	.route('/subject/:id')
	.patch(
		catchAsync(SubjectUploaderOptional),
		catchAsync(SubjectValidator.update),
		catchAsync(SubjectController.update)
	)
	.delete(catchAsync(SubjectValidator.delete), catchAsync(SubjectController.delete));

export default router;
