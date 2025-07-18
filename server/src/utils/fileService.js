const fs = require('fs').promises;
const path = require('path');

class FileService {
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  static async deleteFiles(filePaths) {
    const deletePromises = filePaths.map(filePath => this.deleteFile(filePath));
    return Promise.all(deletePromises);
  }

  static getFileUrl(filename) {
    if (!filename) return null;
    return `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${filename}`;
  }

  static getMultipleFileUrls(filenames) {
    if (!filenames || !Array.isArray(filenames)) return [];
    return filenames.map(filename => this.getFileUrl(filename));
  }

  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  static isValidImageExtension(filename) {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return validExtensions.includes(this.getFileExtension(filename));
  }

  static isValidDocumentExtension(filename) {
    const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    return validExtensions.includes(this.getFileExtension(filename));
  }
}

module.exports = FileService;
