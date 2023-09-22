const router = require('@util/routerUtility').Router();
const RequestError = require('@errors/RequestError');
const file_storage = require('@lib/file_storage');
const commonUtility = require('@util/commonUtility');

router.post('/upload/:folder', async (req, res, logger, next) => {
    const { folder } = req.params;
    if (!folder) {
        throw new RequestError('Folder is required');
    }
    const [file] = req.files;
    const fileUUID = commonUtility.getUuid();
    const { download_url, filepath } = await file_storage.uploadFile(
        folder,
        fileUUID,
        file,
    );
    return res.json({
        data:
        {
            message: 'uploaded file',
            download_url,
            filepath,
        },
    });
});

router.get('/download/:folder/:filename', async (req, res, logger) => {
    const { folder, filename } = req.params;
    const download_url = await file_storage.downloadFile(folder, filename);
    return res.json(
        {
            data: {
                download_url,
            },
        },
    );
});

module.exports = router;
