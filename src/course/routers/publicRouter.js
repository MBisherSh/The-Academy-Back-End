import express from 'express';
const router = express.Router();
import { catchAsync } from '../../../utils/index.js';

import CategoryController from '../controllers/category.js';
import CategoryValidator from '../validators/category.js';
import SubjectController from '../controllers/subject.js';
import SubjectValidator from '../validators/subject.js';
import CourseController from '../controllers/course.js';
import CourseValidator from '../validators/course.js';

router.get('/category', catchAsync(CategoryValidator.getList), catchAsync(CategoryController.getCategory));
router.get('/category/:id', catchAsync(CategoryValidator.getById), catchAsync(CategoryController.getById));

router.get('/subject', catchAsync(SubjectValidator.getList), catchAsync(SubjectController.getSubject));
router.get('/subject/:id', catchAsync(SubjectValidator.getById), catchAsync(SubjectController.getById));

router.get('/', catchAsync(CourseValidator.getList), catchAsync(CourseController.getCourse));
router.get('/:id', catchAsync(CourseValidator.getById), catchAsync(CourseController.getById));
export default router;
