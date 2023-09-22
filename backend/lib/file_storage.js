const RequestError = require('@errors/RequestError');
const firebaseStorage = require('firebase/storage');
const http_status_codes = require('http-status-codes');
const constants = require('@lib/constants');

const storage = firebaseStorage.getStorage(global.firebaseApp);
const { VALID_FOLDERS } = constants;

function getFilePath(folder, file_name) {
    return `${folder}/${file_name}`;
}

async function downloadFile(folder, file_name) {
    return firebaseStorage.getDownloadURL(
        firebaseStorage.ref(storage, getFilePath(folder, file_name)),
    );
}

async function uploadFile(folder, file_name, file) {
    const { mimetype: content_type, buffer } = file;
    if (!content_type || !buffer) {
        throw new RequestError('Mimetype and File Buffer is required');
    }
    if (!Object.values(VALID_FOLDERS).includes(folder)) {
        throw new RequestError('Invalid Upload Folder', http_status_codes.StatusCodes.FORBIDDEN);
    }
    const filePath = getFilePath(folder, file_name);
    const fileUploadResult = await firebaseStorage.uploadBytes(
        firebaseStorage.ref(storage, filePath),
        buffer,
        { contentType: content_type },
    );
    const downloadUrl = await downloadFile(folder, file_name);
    return {
        download_url: downloadUrl,
        file_upload_result: fileUploadResult,
        filepath: filePath,
    };
}

module.exports = {
    uploadFile,
    downloadFile,
};
