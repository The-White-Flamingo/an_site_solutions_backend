import { v2 as cloudinary} from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer and cloudinary storage setup
export const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'surveyor_app',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
});


// const profileImageStorage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'profile_images',
//         allowed_formats: ['jpg', 'jpeg', 'png'],
//         transformation: [{ width: 500, height: 500, crop: 'limit' }],
//     },
// });

// const documentStorage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'documents',
//         allowed_formats: ['pdf', 'doc', 'docx'],
//         transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
//     },
// });

// const uploadDocument = multer({ storage: documentStorage });

// const uploadProfileImage = multer({ storage: profileImageStorage });

// export { uploadProfileImage, uploadDocument };
export default cloudinary;