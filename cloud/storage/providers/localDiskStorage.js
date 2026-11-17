const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'local_uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

module.exports = {
  name: 'local',

  async upload(file, folder = 'general') {
    const targetFolder = path.join(UPLOAD_DIR, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFilename = `${uniqueSuffix}-${sanitizedFilename}`;
    const destinationPath = path.join(targetFolder, finalFilename);

    if (file.buffer) {
      await fs.promises.writeFile(destinationPath, file.buffer);
    }

    const relativePath = `/uploads/${folder}/${finalFilename}`;

    return {
      success: true,
      provider: 'local',
      key: `${folder}/${finalFilename}`,
      url: relativePath,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname
    };
  },

  async delete(fileKey) {
    const targetPath = path.join(UPLOAD_DIR, fileKey);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      return { success: true };
    }
    return { success: false, message: 'File not found on local disk' };
  },

  async getUrl(fileKey) {
    return `/uploads/${fileKey}`;
  }
};
