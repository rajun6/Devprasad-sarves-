const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'csludy',
  api_key: '857985573477172',
  api_secret: 'Sek 857985573477172'
});

const uploadFile = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'service-center',
      resource_type: 'auto'
    });
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.log('☁️ Cloudinary:', result.secure_url);
    return { public_id: result.public_id, url: result.secure_url };
  } catch (error) {
    console.log('Cloudinary error, using local:', error.message);
    const path = require('path');
    const fileName = Date.now() + '-' + path.basename(filePath);
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const newPath = path.join(uploadDir, fileName);
    if (filePath !== newPath && fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, newPath);
      fs.unlinkSync(filePath);
    }
    return { public_id: fileName, url: 'http://localhost:5000/uploads/' + fileName };
  }
};

module.exports = { uploadFile, uploadToCloudinary: uploadFile };
