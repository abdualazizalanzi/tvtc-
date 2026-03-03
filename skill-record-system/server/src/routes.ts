import express from 'express';
import multer from 'multer';
import { uploadProfileImage, uploadActivityImage, uploadCourseImage, deleteImage } from './storage';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload profile image
router.post('/upload/profile-image', upload.single('file'), uploadProfileImage);

// Upload activity image
router.post('/upload/activity-image', upload.single('file'), uploadActivityImage);

// Upload course image
router.post('/upload/course-image', upload.single('image'), uploadCourseImage);

// Delete image
router.delete('/upload/:filename', deleteImage);

export default router;