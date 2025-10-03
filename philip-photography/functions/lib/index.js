"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGalleryImagesCallable = exports.getGalleryImages = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
// Cloud Function to get all gallery images in a single request
exports.getGalleryImages = functions.https.onRequest(async (req, res) => {
    // Enable CORS for your frontend domain
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        const bucket = admin.storage().bucket();
        const folderPath = req.query.folder || 'gallery';
        // List all files in the folder
        const [files] = await bucket.getFiles({
            prefix: `${folderPath}/`,
            delimiter: '/'
        });
        // Process all images in parallel
        const imagePromises = files.map(async (file) => {
            var _a, _b, _c, _d, _e;
            try {
                // Get download URL and metadata in parallel
                const [url, metadata] = await Promise.all([
                    file.getSignedUrl({
                        action: 'read',
                        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
                    }).then(urls => urls[0]),
                    file.getMetadata()
                ]);
                return {
                    id: file.name,
                    name: file.name.split('/').pop(),
                    src: url,
                    path: file.name,
                    title: ((_a = metadata.metadata) === null || _a === void 0 ? void 0 : _a.title) || file.name.split('/').pop(),
                    alt: ((_b = metadata.metadata) === null || _b === void 0 ? void 0 : _b.alt) || file.name.split('/').pop(),
                    description: ((_c = metadata.metadata) === null || _c === void 0 ? void 0 : _c.description) || '',
                    isSeries: ((_d = metadata.metadata) === null || _d === void 0 ? void 0 : _d.isSeries) === 'true',
                    seriesIndex: ((_e = metadata.metadata) === null || _e === void 0 ? void 0 : _e.seriesIndex) ? parseInt(metadata.metadata.seriesIndex) : 1,
                    size: parseInt(metadata.size || '0'),
                    timeCreated: metadata.timeCreated,
                    contentType: metadata.contentType
                };
            }
            catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                return null;
            }
        });
        // Wait for all images to be processed
        const images = (await Promise.all(imagePromises)).filter((img) => img !== null);
        // Group images by series (same logic as frontend)
        const groups = {};
        images.forEach(img => {
            if (img.isSeries && img.title) {
                if (!groups[img.title]) {
                    groups[img.title] = {
                        images: [],
                        title: img.title,
                        alt: `${img.title} images`,
                        isSeries: true,
                        description: img.description || ''
                    };
                }
                groups[img.title].images.push(img.src);
            }
            else {
                const individualName = `individual_${img.title || img.name}`;
                groups[individualName] = {
                    images: [img.src],
                    title: img.title || img.name,
                    alt: img.alt || img.name,
                    isSeries: false,
                    description: img.description || ''
                };
            }
        });
        const groupedImages = Object.values(groups);
        // Convert to artwork format
        const artworkArray = groupedImages.map((group, index) => ({
            id: index + 1,
            images: group.images,
            title: group.title,
            alt: group.alt,
            isSeries: group.isSeries,
            description: group.description || ''
        }));
        res.json({
            success: true,
            images: artworkArray,
            totalCount: artworkArray.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error in getGalleryImages:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            images: []
        });
    }
});
// Alternative: HTTP Callable Function (more secure)
exports.getGalleryImagesCallable = functions.https.onCall(async (data, context) => {
    try {
        const bucket = admin.storage().bucket();
        const folderPath = data.folder || 'gallery';
        const [files] = await bucket.getFiles({
            prefix: `${folderPath}/`,
            delimiter: '/'
        });
        const imagePromises = files.map(async (file) => {
            var _a, _b, _c, _d, _e;
            try {
                const [url, metadata] = await Promise.all([
                    file.getSignedUrl({
                        action: 'read',
                        expires: Date.now() + 24 * 60 * 60 * 1000,
                    }).then(urls => urls[0]),
                    file.getMetadata()
                ]);
                return {
                    id: file.name,
                    name: file.name.split('/').pop(),
                    src: url,
                    path: file.name,
                    title: ((_a = metadata.metadata) === null || _a === void 0 ? void 0 : _a.title) || file.name.split('/').pop(),
                    alt: ((_b = metadata.metadata) === null || _b === void 0 ? void 0 : _b.alt) || file.name.split('/').pop(),
                    description: ((_c = metadata.metadata) === null || _c === void 0 ? void 0 : _c.description) || '',
                    isSeries: ((_d = metadata.metadata) === null || _d === void 0 ? void 0 : _d.isSeries) === 'true',
                    seriesIndex: ((_e = metadata.metadata) === null || _e === void 0 ? void 0 : _e.seriesIndex) ? parseInt(metadata.metadata.seriesIndex) : 1,
                    size: parseInt(metadata.size || '0'),
                    timeCreated: metadata.timeCreated,
                    contentType: metadata.contentType
                };
            }
            catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                return null;
            }
        });
        const images = (await Promise.all(imagePromises)).filter((img) => img !== null);
        return {
            success: true,
            images,
            totalCount: images.length,
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error('Error in getGalleryImagesCallable:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=index.js.map