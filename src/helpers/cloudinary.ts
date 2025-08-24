import { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (
  fileBuffer: Buffer,
  resourceType: 'image' | 'video' = 'image'
): Promise<UploadApiResponse | null> => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error("Missing Cloudinary configuration");
    }
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('No result returned from Cloudinary'));
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error in file upload:', error);
    return null;
  }
};


export default uploadOnCloudinary;