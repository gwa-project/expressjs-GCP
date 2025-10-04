import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL || 'cloudinary://665131191341998:E02OBVzeU1etidZ-1ck4hMl8Qq4@divqjx3ac'
});

export default cloudinary;
