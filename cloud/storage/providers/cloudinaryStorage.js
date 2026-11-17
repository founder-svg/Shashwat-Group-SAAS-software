/**
 * Cloudinary Storage Provider
 * Free Tier: 25 GB managed storage & monthly bandwidth
 * Excellent for CRM profile photos, company logos, documents, and contract scans
 */

const cloudinary = require('cloudinary').v2;

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

module.exports = {
  name: 'cloudinary',

  async upload(file, folder = 'shashwat_crm') {
    configureCloudinary();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `shashwat_crm/${folder}`,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Storage Error]:', error.message);
            return reject(error);
          }
          resolve({
            success: true,
            provider: 'cloudinary',
            key: result.public_id,
            url: result.secure_url,
            size: result.bytes || file.size,
            mimeType: file.mimetype,
            originalName: file.originalname,
            format: result.format
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  },

  async delete(publicId) {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === 'ok', result };
  },

  async getUrl(publicId) {
    configureCloudinary();
    return cloudinary.url(publicId, { secure: true });
  }
};
