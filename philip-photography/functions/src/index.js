const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Cloud Function to get all gallery images in a single request (asia-southeast1)
exports.getGalleryImages = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // List all files in the folder
    const [files] = await bucket.getFiles({
      prefix: `${folderPath}/`,
      delimiter: '/'
    });

    // Filter out folder entries and non-image files
    const validFiles = files.filter(file => {
      const name = file.name.split('/').pop();
      return name && name.includes('.') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    });

    // Apply pagination
    const totalCount = validFiles.length;
    const paginatedFiles = validFiles.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Process paginated images in parallel
    const imagePromises = paginatedFiles.map(async (file) => {
      try {
        // Only get metadata; construct token-based download URL
        const [metadata] = await file.getMetadata();
        const tokens = metadata?.metadata?.firebaseStorageDownloadTokens || '';
        const token = typeof tokens === 'string' ? tokens.split(',')[0] : '';
        const bucketName = file.bucket.name || (admin.storage().bucket().name);
        const encodedPath = encodeURIComponent(file.name);
        const url = token
          ? `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
          : `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

        const filename = file.name.split('/').pop();
        
        // Auto-detect series based on filename patterns like "test.1", "test.2", etc.
        const seriesMatch = filename.match(/^(.+)\.(\d+)(\.[^.]+)?$/);
        let isSeries = metadata.metadata?.isSeries === 'true';
        let seriesTitle = metadata.metadata?.title || filename;
        let seriesIndex = metadata.metadata?.seriesIndex ? parseInt(metadata.metadata.seriesIndex) : 1;
        
        if (seriesMatch) {
          const [, baseName, index, extension] = seriesMatch;
          isSeries = true;
          seriesTitle = baseName;
          seriesIndex = parseInt(index);
        }

        return {
          id: file.name,
          name: filename,
          src: url,
          path: file.name,
          title: seriesTitle,
          alt: metadata.metadata?.alt || filename,
          description: metadata.metadata?.description || '',
          isSeries: isSeries,
          seriesIndex: seriesIndex,
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType
        };
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return null;
      }
    });

    // Wait for all images to be processed
    const images = (await Promise.all(imagePromises)).filter(img => img !== null);

    // Group images by series with proper sorting
    const groups = {};
    
    images.forEach(img => {
      if (img.isSeries && img.title) {
        if (!groups[img.title]) {
          groups[img.title] = {
            images: [],
            seriesData: [], // Store full image data for sorting
            title: img.title,
            alt: `${img.title} images`,
            isSeries: true,
            description: img.description || ''
          };
        }
        groups[img.title].seriesData.push({
          src: img.src,
          seriesIndex: img.seriesIndex,
          name: img.name
        });
      } else {
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

    // Sort series images by their index and extract src arrays
    Object.values(groups).forEach(group => {
      if (group.isSeries && group.seriesData) {
        group.seriesData.sort((a, b) => a.seriesIndex - b.seriesIndex);
        group.images = group.seriesData.map(item => item.src);
        delete group.seriesData; // Clean up
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
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getGalleryImages:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      images: []
    });
  }
});

// Search endpoint for gallery images
exports.searchGalleryImages = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
    const searchQuery = req.query.q || req.query.query || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // List all files in the folder
    const [files] = await bucket.getFiles({
      prefix: `${folderPath}/`,
      delimiter: '/'
    });

    // Filter out folder entries and non-image files
    const validFiles = files.filter(file => {
      const name = file.name.split('/').pop();
      return name && name.includes('.') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    });

    // Process all images to get metadata for search
    const imagePromises = validFiles.map(async (file) => {
      try {
        const [metadata] = await file.getMetadata();
        const tokens = metadata?.metadata?.firebaseStorageDownloadTokens || '';
        const token = typeof tokens === 'string' ? tokens.split(',')[0] : '';
        const bucketName = file.bucket.name || (admin.storage().bucket().name);
        const encodedPath = encodeURIComponent(file.name);
        const url = token
          ? `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
          : `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

        const filename = file.name.split('/').pop();
        
        // Auto-detect series based on filename patterns like "test.1", "test.2", etc.
        const seriesMatch = filename.match(/^(.+)\.(\d+)(\.[^.]+)?$/);
        let isSeries = metadata.metadata?.isSeries === 'true';
        let seriesTitle = metadata.metadata?.title || filename;
        let seriesIndex = metadata.metadata?.seriesIndex ? parseInt(metadata.metadata.seriesIndex) : 1;
        
        if (seriesMatch) {
          const [, baseName, index, extension] = seriesMatch;
          isSeries = true;
          seriesTitle = baseName;
          seriesIndex = parseInt(index);
        }

        return {
          id: file.name,
          name: filename,
          src: url,
          path: file.name,
          title: seriesTitle,
          alt: metadata.metadata?.alt || filename,
          description: metadata.metadata?.description || '',
          isSeries: isSeries,
          seriesIndex: seriesIndex,
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType
        };
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return null;
      }
    });

    // Wait for all images to be processed
    const allImages = (await Promise.all(imagePromises)).filter(img => img !== null);

    // Filter by search query if provided
    let filteredImages = allImages;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredImages = allImages.filter(img => {
        const title = (img.title || '').toLowerCase();
        const description = (img.description || '').toLowerCase();
        const alt = (img.alt || '').toLowerCase();
        const name = (img.name || '').toLowerCase();
        
        return title.includes(query) || 
               description.includes(query) || 
               alt.includes(query) || 
               name.includes(query);
      });
    }

    // Apply pagination to filtered results
    const totalCount = filteredImages.length;
    const paginatedImages = filteredImages.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Group images by series with proper sorting
    const groups = {};
    
    paginatedImages.forEach(img => {
      if (img.isSeries && img.title) {
        if (!groups[img.title]) {
          groups[img.title] = {
            images: [],
            seriesData: [], // Store full image data for sorting
            title: img.title,
            alt: `${img.title} images`,
            isSeries: true,
            description: img.description || ''
          };
        }
        groups[img.title].seriesData.push({
          src: img.src,
          seriesIndex: img.seriesIndex,
          name: img.name
        });
      } else {
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

    // Sort series images by their index and extract src arrays
    Object.values(groups).forEach(group => {
      if (group.isSeries && group.seriesData) {
        group.seriesData.sort((a, b) => a.seriesIndex - b.seriesIndex);
        group.images = group.seriesData.map(item => item.src);
        delete group.seriesData; // Clean up
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
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit)
      },
      searchQuery,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in searchGalleryImages:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      images: []
    });
  }
});

// Admin endpoints for gallery management
exports.getAdminGalleryImages = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Larger limit for admin
    const offset = (page - 1) * limit;
    
    // List all files in the folder
    const [files] = await bucket.getFiles({
      prefix: `${folderPath}/`,
      delimiter: '/'
    });

    // Filter out folder entries and non-image files
    const validFiles = files.filter(file => {
      const name = file.name.split('/').pop();
      return name && name.includes('.') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    });

    // Apply pagination
    const totalCount = validFiles.length;
    const paginatedFiles = validFiles.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Process paginated images in parallel
    const imagePromises = paginatedFiles.map(async (file) => {
      try {
        const [metadata] = await file.getMetadata();
        const tokens = metadata?.metadata?.firebaseStorageDownloadTokens || '';
        const token = typeof tokens === 'string' ? tokens.split(',')[0] : '';
        const bucketName = file.bucket.name || (admin.storage().bucket().name);
        const encodedPath = encodeURIComponent(file.name);
        const url = token
          ? `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
          : `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

        const filename = file.name.split('/').pop();
        
        // Auto-detect series based on filename patterns like "test.1", "test.2", etc.
        const seriesMatch = filename.match(/^(.+)\.(\d+)(\.[^.]+)?$/);
        let isSeries = metadata.metadata?.isSeries === 'true';
        let seriesTitle = metadata.metadata?.title || filename;
        let seriesIndex = metadata.metadata?.seriesIndex ? parseInt(metadata.metadata.seriesIndex) : 1;
        
        if (seriesMatch) {
          const [, baseName, index, extension] = seriesMatch;
          isSeries = true;
          seriesTitle = baseName;
          seriesIndex = parseInt(index);
        }

        return {
          id: file.name,
          name: filename,
          src: url,
          path: file.name,
          title: seriesTitle,
          alt: metadata.metadata?.alt || filename,
          description: metadata.metadata?.description || '',
          isSeries: isSeries,
          seriesIndex: seriesIndex,
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType,
          // Admin-specific fields
          fullPath: file.name,
          bucket: bucketName,
          metadata: metadata.metadata || {}
        };
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return null;
      }
    });

    const images = (await Promise.all(imagePromises)).filter(img => img !== null);

    res.json({
      success: true,
      images,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getAdminGalleryImages:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      images: []
    });
  }
});

// Admin search endpoint with more detailed results
exports.searchAdminGalleryImages = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
    const searchQuery = req.query.q || req.query.query || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // List all files in the folder
    const [files] = await bucket.getFiles({
      prefix: `${folderPath}/`,
      delimiter: '/'
    });

    // Filter out folder entries and non-image files
    const validFiles = files.filter(file => {
      const name = file.name.split('/').pop();
      return name && name.includes('.') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    });

    // Process all images to get metadata for search
    const imagePromises = validFiles.map(async (file) => {
      try {
        const [metadata] = await file.getMetadata();
        const tokens = metadata?.metadata?.firebaseStorageDownloadTokens || '';
        const token = typeof tokens === 'string' ? tokens.split(',')[0] : '';
        const bucketName = file.bucket.name || (admin.storage().bucket().name);
        const encodedPath = encodeURIComponent(file.name);
        const url = token
          ? `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
          : `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

        return {
          id: file.name,
          name: file.name.split('/').pop(),
          src: url,
          path: file.name,
          title: metadata.metadata?.title || file.name.split('/').pop(),
          alt: metadata.metadata?.alt || file.name.split('/').pop(),
          description: metadata.metadata?.description || '',
          isSeries: metadata.metadata?.isSeries === 'true',
          seriesIndex: metadata.metadata?.seriesIndex ? parseInt(metadata.metadata.seriesIndex) : 1,
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType,
          // Admin-specific fields
          fullPath: file.name,
          bucket: bucketName,
          metadata: metadata.metadata || {}
        };
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return null;
      }
    });

    // Wait for all images to be processed
    const allImages = (await Promise.all(imagePromises)).filter(img => img !== null);

    // Filter by search query if provided
    let filteredImages = allImages;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredImages = allImages.filter(img => {
        const title = (img.title || '').toLowerCase();
        const description = (img.description || '').toLowerCase();
        const alt = (img.alt || '').toLowerCase();
        const name = (img.name || '').toLowerCase();
        
        return title.includes(query) || 
               description.includes(query) || 
               alt.includes(query) || 
               name.includes(query);
      });
    }

    // Apply pagination to filtered results
    const totalCount = filteredImages.length;
    const paginatedImages = filteredImages.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    res.json({
      success: true,
      images: paginatedImages,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit)
      },
      searchQuery,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in searchAdminGalleryImages:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      images: []
    });
  }
});

// Alternative: HTTP Callable Function (more secure) - asia-southeast1
exports.getGalleryImagesCallable = functions.region('asia-southeast1').https.onCall(async (data, context) => {
  try {
    const bucket = admin.storage().bucket();
    const folderPath = data.folder || 'gallery';
    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 20;
    const offset = (page - 1) * limit;
    
    const [files] = await bucket.getFiles({
      prefix: `${folderPath}/`,
      delimiter: '/'
    });

    // Filter out folder entries and non-image files
    const validFiles = files.filter(file => {
      const name = file.name.split('/').pop();
      return name && name.includes('.') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    });

    // Apply pagination
    const totalCount = validFiles.length;
    const paginatedFiles = validFiles.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    // Process paginated images in parallel
    const imagePromises = paginatedFiles.map(async (file) => {
      try {
        const [metadata] = await file.getMetadata();
        const tokens = metadata?.metadata?.firebaseStorageDownloadTokens || '';
        const token = typeof tokens === 'string' ? tokens.split(',')[0] : '';
        const bucketName = file.bucket.name || (admin.storage().bucket().name);
        const encodedPath = encodeURIComponent(file.name);
        const url = token
          ? `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`
          : `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

        return {
          id: file.name,
          name: file.name.split('/').pop(),
          src: url,
          path: file.name,
          title: metadata.metadata?.title || file.name.split('/').pop(),
          alt: metadata.metadata?.alt || file.name.split('/').pop(),
          description: metadata.metadata?.description || '',
          isSeries: metadata.metadata?.isSeries === 'true',
          seriesIndex: metadata.metadata?.seriesIndex ? parseInt(metadata.metadata.seriesIndex) : 1,
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType
        };
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return null;
      }
    });

    const images = (await Promise.all(imagePromises)).filter(img => img !== null);

    return {
      success: true,
      images,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit)
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in getGalleryImagesCallable:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
