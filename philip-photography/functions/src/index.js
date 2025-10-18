const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Helper to generate SEO-friendly slugs (mirrors frontend/script logic exactly)
function generateSlugServer(title, scientificName = '', id = '') {
  // Start with the title
  let slug = title || 'untitled';
  
  // Add scientific name if available
  if (scientificName && scientificName.trim()) {
    // Remove italic formatting if present
    const cleanScientificName = scientificName.replace(/<\/?em>/g, '').replace(/<\/?i>/g, '').trim();
    slug += `-${cleanScientificName}`;
  }
  
  // Add ID for uniqueness if provided
  if (id) {
    slug += `-${id}`;
  }
  
  // Convert to lowercase
  slug = slug.toLowerCase();
  
  // Replace spaces and special characters with hyphens
  slug = slug
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]/g, '')        // Remove special characters except hyphens and word chars
    .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
  
  // Ensure slug is not empty
  if (!slug) {
    slug = 'image';
  }
  
  // Add timestamp if still empty or too short
  if (slug.length < 3) {
    slug += `-${Date.now().toString(36)}`;
  }
  
  return slug;
}

// Dynamic sitemap.xml – always reflects current Storage contents
exports.sitemap = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
  try {
    const baseUrl = 'https://jpmorada.photography';
    const lastmod = new Date().toISOString().split('T')[0];

    const bucket = admin.storage().bucket();
    const folderPath = 'gallery';

    // List all files in the gallery folder
    const [files] = await bucket.getFiles({ prefix: `${folderPath}/`, delimiter: '/' });
    const validFiles = files.filter(file => {
      const name = file.name.split('/').pop();
      return name && name.includes('.') && /(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    });

    // Build basic pages
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
      `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n` +
      `  <!-- Homepage -->\n` +
      `  <url>\n` +
      `    <loc>${baseUrl}/</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>1.0</priority>\n` +
      `  </url>\n\n` +
      `  <!-- Gallery Page -->\n` +
      `  <url>\n` +
      `    <loc>${baseUrl}/gallery</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>0.9</priority>\n` +
      `  </url>\n\n` +
      `  <!-- About Page -->\n` +
      `  <url>\n` +
      `    <loc>${baseUrl}/about</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>monthly</changefreq>\n` +
      `    <priority>0.8</priority>\n` +
      `  </url>\n\n` +
      `  <!-- Contact Page -->\n` +
      `  <url>\n` +
      `    <loc>${baseUrl}/contact</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>monthly</changefreq>\n` +
      `    <priority>0.7</priority>\n` +
      `  </url>\n\n` +
      `  <!-- Individual Gallery Images (live) -->\n`;

    // Fetch metadata in parallel to enrich entries
    const metaList = await Promise.all(validFiles.map(async (file) => {
      try {
        const [metadata] = await file.getMetadata();
        const custom = metadata.metadata || metadata.customMetadata || {};
        const filename = file.name.split('/').pop();
        const title = custom.title || filename.replace(/\.[^/.]+$/, ""); // Remove file extension
        const scientificName = custom.scientificName || '';
        const description = custom.description || '';
        const location = custom.location || '';
        
        // Generate clean slug using title, scientific name, and series number
        // Extract series number from filename for clean URLs like "philippine-coucal-centropus-viridis-1"
        const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        const numberMatch = filenameWithoutExt.match(/_(\d+)$/);
        const seriesNumber = numberMatch ? numberMatch[1] : '1';
        
        // Create clean ID using just the series number
        const cleanId = seriesNumber;
        const slug = generateSlugServer(title, scientificName, cleanId);
        const url = `${baseUrl}/gallery/${slug}`;
        return {
          url,
          title: scientificName ? `${title} (${scientificName}) - Wildlife Photography` : `${title} - Wildlife Photography`,
          caption: description || (location ? `Wildlife photograph of ${title} captured in ${location}` : `Wildlife photograph of ${title}`),
          lastmod: lastmod
        };
      } catch (e) {
        return null;
      }
    }));

    for (const entry of metaList.filter(Boolean)) {
      xml += `  <url>\n` +
             `    <loc>${entry.url}</loc>\n` +
             `    <lastmod>${entry.lastmod}</lastmod>\n` +
             `    <changefreq>monthly</changefreq>\n` +
             `    <priority>0.8</priority>\n` +
             `    <image:image>\n` +
             `      <image:loc>${entry.url}</image:loc>\n` +
             `      <image:title>${entry.title}</image:title>\n` +
             `      <image:caption>${entry.caption}</image:caption>\n` +
             `    </image:image>\n` +
             `  </url>\n\n`;
    }

    xml += `</urlset>\n`;

    res.set('Content-Type', 'application/xml');
    // Cache for a day; clients will re-fetch next day
    res.set('Cache-Control', 'public, max-age=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    res.status(500).send('');
  }
});

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
          scientificName: metadata.metadata?.scientificName || '',
          location: metadata.metadata?.location || '',
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

    res.json({
      success: true,
      // Return flat image objects; frontend will group as needed
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

    res.json({
      success: true,
      // Return flat image objects; frontend will group as needed
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

        // Get metadata from either metadata.metadata or metadata.customMetadata
        const customMetadata = metadata.metadata || metadata.customMetadata || {};
        
        return {
          id: file.name,
          name: filename,
          src: url,
          path: file.name,
          title: seriesTitle,
          alt: customMetadata?.alt || filename,
          description: customMetadata?.description || '',
          scientificName: customMetadata?.scientificName || '',
          location: customMetadata?.location || '',
          timeTaken: customMetadata?.timeTaken || '',
          history: customMetadata?.history || '',
          likes: parseInt(customMetadata?.likes || '0'),
          isSeries: isSeries,
          seriesIndex: seriesIndex,
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType,
          // Admin-specific fields
          fullPath: file.name,
          bucket: bucketName,
          metadata: customMetadata
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

        // Get metadata from either metadata.metadata or metadata.customMetadata
        const customMetadata = metadata.metadata || metadata.customMetadata || {};
        
        return {
          id: file.name,
          name: file.name.split('/').pop(),
          src: url,
          path: file.name,
          title: customMetadata?.title || file.name.split('/').pop(),
          alt: customMetadata?.alt || file.name.split('/').pop(),
          description: customMetadata?.description || '',
          scientificName: customMetadata?.scientificName || '',
          location: customMetadata?.location || '',
          timeTaken: customMetadata?.timeTaken || '',
          history: customMetadata?.history || '',
          likes: parseInt(customMetadata?.likes || '0'),
          isSeries: customMetadata?.isSeries === 'true',
          seriesIndex: customMetadata?.seriesIndex ? parseInt(customMetadata.seriesIndex) : 1,
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType,
          // Admin-specific fields
          fullPath: file.name,
          bucket: bucketName,
          metadata: customMetadata
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

        // Get metadata from either metadata.metadata or metadata.customMetadata
        const customMetadata = metadata.metadata || metadata.customMetadata || {};
        
        return {
          id: file.name,
          name: file.name.split('/').pop(),
          src: url,
          path: file.name,
          title: customMetadata?.title || file.name.split('/').pop(),
          alt: customMetadata?.alt || file.name.split('/').pop(),
          description: customMetadata?.description || '',
          scientificName: customMetadata?.scientificName || '',
          location: customMetadata?.location || '',
          timeTaken: customMetadata?.timeTaken || '',
          history: customMetadata?.history || '',
          likes: parseInt(customMetadata?.likes || '0'),
          isSeries: customMetadata?.isSeries === 'true',
          seriesIndex: customMetadata?.seriesIndex ? parseInt(customMetadata.seriesIndex) : 1,
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType,
          // Admin-specific fields
          fullPath: file.name,
          bucket: bucketName,
          metadata: customMetadata
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

// Featured Gallery Management Functions
exports.getFeaturedImages = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
    const folderPath = 'featured';
    
    // List all files in the featured folder
    const [files] = await bucket.getFiles({
      prefix: `${folderPath}/`,
      delimiter: '/'
    });

    // Filter out folder entries and non-image files
    const validFiles = files.filter(file => {
      const name = file.name.split('/').pop();
      return name && name.includes('.') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    });

    // Process all images
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

        return {
          id: file.name,
          name: filename,
          src: url,
          path: file.name,
          title: metadata.metadata?.title || filename,
          alt: metadata.metadata?.alt || filename,
          description: metadata.metadata?.description || '',
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType,
          fullPath: file.name,
          bucket: bucketName,
          metadata: metadata.metadata || {}
        };
      } catch (error) {
        console.error(`Error processing featured file ${file.name}:`, error);
        return null;
      }
    });

    const images = (await Promise.all(imagePromises)).filter(img => img !== null);

    res.json({
      success: true,
      images,
      totalCount: images.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getFeaturedImages:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      images: []
    });
  }
});

exports.getAdminFeaturedImages = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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
    const folderPath = 'featured';
    
    // List all files in the featured folder
    const [files] = await bucket.getFiles({
      prefix: `${folderPath}/`,
      delimiter: '/'
    });

    // Filter out folder entries and non-image files
    const validFiles = files.filter(file => {
      const name = file.name.split('/').pop();
      return name && name.includes('.') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    });

    // Process all images with admin-specific fields
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

        return {
          id: file.name,
          name: filename,
          src: url,
          path: file.name,
          title: metadata.metadata?.title || filename,
          alt: metadata.metadata?.alt || filename,
          description: metadata.metadata?.description || '',
          size: parseInt(metadata.size || '0'),
          timeCreated: metadata.timeCreated,
          contentType: metadata.contentType,
          // Admin-specific fields
          fullPath: file.name,
          bucket: bucketName,
          metadata: metadata.metadata || {}
        };
      } catch (error) {
        console.error(`Error processing admin featured file ${file.name}:`, error);
        return null;
      }
    });

    const images = (await Promise.all(imagePromises)).filter(img => img !== null);

    res.json({
      success: true,
      images,
      totalCount: images.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getAdminFeaturedImages:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      images: []
    });
  }
});


// Like a photo function
exports.likePhoto = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
  // Enable CORS for your frontend domain
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        error: 'Image path is required'
      });
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(imagePath);
    
    // Get current metadata
    const [metadata] = await file.getMetadata();
    const currentLikes = parseInt(metadata.metadata?.likes || '0');
    
    // Update likes count
    const newMetadata = {
      ...metadata.metadata,
      likes: (currentLikes + 1).toString()
    };
    
    await file.setMetadata({
      metadata: newMetadata
    });

    res.json({
      success: true,
      newLikesCount: currentLikes + 1,
      message: 'Photo liked successfully'
    });

  } catch (error) {
    console.error('Error liking photo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analytics Functions
const db = admin.firestore();

// Get analytics dashboard data
exports.getAnalyticsData = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
  // Enable CORS for your frontend domain
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const timeRange = req.query.timeRange || '7d';
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get page views
    let pageViews = [];
    try {
      const pageViewsSnapshot = await db.collection('analytics_visits')
        .where('timestamp', '>=', startDate)
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();

      pageViews = pageViewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No page views data found:', error.message);
      pageViews = [];
    }

    // Get image views
    let imageViews = [];
    try {
      const imageViewsSnapshot = await db.collection('analytics_image_views')
        .where('timestamp', '>=', startDate)
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();

      imageViews = imageViewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No image views data found:', error.message);
      imageViews = [];
    }

    // Get interactions
    let interactions = [];
    try {
      const interactionsSnapshot = await db.collection('analytics_interactions')
        .where('timestamp', '>=', startDate)
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();

      interactions = interactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No interactions data found:', error.message);
      interactions = [];
    }

    // Filter out admin page views before processing
    const nonAdminPageViews = pageViews.filter(pv => 
      pv.pageName && pv.pageName.toLowerCase() !== 'admin'
    );

    // Calculate metrics (using non-admin data only)
    const metrics = {
      totalPageViews: nonAdminPageViews.length,
      totalImageViews: imageViews.length,
      totalInteractions: interactions.length,
      uniqueVisitors: new Set(nonAdminPageViews.map(pv => pv.visitorId)).size,
      uniqueSessions: new Set(nonAdminPageViews.map(pv => pv.sessionId)).size,
      popularPages: {},
      popularImages: {},
      trafficSources: {},
      deviceTypes: {},
      interactionsByType: {}
    };

    // Process page views (excluding admin)
    nonAdminPageViews.forEach(pv => {
      // Popular pages
      metrics.popularPages[pv.pageName] = (metrics.popularPages[pv.pageName] || 0) + 1;
      
      // Traffic sources
      const source = pv.referrer === 'direct' ? 'direct' : 'referral';
      metrics.trafficSources[source] = (metrics.trafficSources[source] || 0) + 1;
      
      // Device types
      const isMobile = pv.userAgent && /Mobile|Android|iPhone|iPad/.test(pv.userAgent);
      const deviceType = isMobile ? 'mobile' : 'desktop';
      metrics.deviceTypes[deviceType] = (metrics.deviceTypes[deviceType] || 0) + 1;
    });

    // Process image views
    imageViews.forEach(iv => {
      metrics.popularImages[iv.imageTitle] = (metrics.popularImages[iv.imageTitle] || 0) + 1;
    });

    // Process interactions
    interactions.forEach(interaction => {
      const type = interaction.interactionType;
      metrics.interactionsByType[type] = (metrics.interactionsByType[type] || 0) + 1;
    });

    // Sort popular pages and images
    metrics.popularPages = Object.entries(metrics.popularPages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    metrics.popularImages = Object.entries(metrics.popularImages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    res.json({
      success: true,
      data: {
        metrics,
        pageViews: nonAdminPageViews, // Only return non-admin page views
        imageViews,
        interactions,
        timeRange,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting analytics data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Get image statistics
exports.getImageStats = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
  // Enable CORS for your frontend domain
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    
    let imageStats = [];
    try {
      const imageStatsSnapshot = await db.collection('analytics_image_stats')
        .orderBy('views', 'desc')
        .limit(limit)
        .get();

      imageStats = imageStatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No image stats data found:', error.message);
      imageStats = [];
    }

    res.json({
      success: true,
      data: imageStats
    });

  } catch (error) {
    console.error('Error getting image stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Get daily statistics
exports.getDailyStats = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
  // Enable CORS for your frontend domain
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let dailyStats = [];
    try {
      const dailyStatsSnapshot = await db.collection('analytics_daily_stats')
        .where('date', '>=', startDate.toISOString().split('T')[0])
        .orderBy('date', 'desc')
        .get();

      dailyStats = dailyStatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('No daily stats data found:', error.message);
      dailyStats = [];
    }

    res.json({
      success: true,
      data: dailyStats
    });

  } catch (error) {
    console.error('Error getting daily stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Get real-time analytics summary
exports.getAnalyticsSummary = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
  // Enable CORS for your frontend domain
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Today's stats
    let todayPageViewsSnapshot, todayImageViewsSnapshot, todayInteractionsSnapshot;
    let yesterdayPageViewsSnapshot, yesterdayImageViewsSnapshot, yesterdayInteractionsSnapshot;
    let lastWeekPageViewsSnapshot;

    try {
      todayPageViewsSnapshot = await db.collection('analytics_visits')
        .where('timestamp', '>=', today)
        .get();
    } catch (error) {
      console.warn('No today page views data found:', error.message);
      todayPageViewsSnapshot = { size: 0, docs: [] };
    }

    try {
      todayImageViewsSnapshot = await db.collection('analytics_image_views')
        .where('timestamp', '>=', today)
        .get();
    } catch (error) {
      console.warn('No today image views data found:', error.message);
      todayImageViewsSnapshot = { size: 0, docs: [] };
    }

    try {
      todayInteractionsSnapshot = await db.collection('analytics_interactions')
        .where('timestamp', '>=', today)
        .get();
    } catch (error) {
      console.warn('No today interactions data found:', error.message);
      todayInteractionsSnapshot = { size: 0, docs: [] };
    }

    // Yesterday's stats for comparison
    try {
      yesterdayPageViewsSnapshot = await db.collection('analytics_visits')
        .where('timestamp', '>=', yesterday)
        .where('timestamp', '<', today)
        .get();
    } catch (error) {
      console.warn('No yesterday page views data found:', error.message);
      yesterdayPageViewsSnapshot = { size: 0, docs: [] };
    }

    try {
      yesterdayImageViewsSnapshot = await db.collection('analytics_image_views')
        .where('timestamp', '>=', yesterday)
        .where('timestamp', '<', today)
        .get();
    } catch (error) {
      console.warn('No yesterday image views data found:', error.message);
      yesterdayImageViewsSnapshot = { size: 0, docs: [] };
    }

    try {
      yesterdayInteractionsSnapshot = await db.collection('analytics_interactions')
        .where('timestamp', '>=', yesterday)
        .where('timestamp', '<', today)
        .get();
    } catch (error) {
      console.warn('No yesterday interactions data found:', error.message);
      yesterdayInteractionsSnapshot = { size: 0, docs: [] };
    }

    // Last week's stats
    try {
      lastWeekPageViewsSnapshot = await db.collection('analytics_visits')
        .where('timestamp', '>=', lastWeek)
        .get();
    } catch (error) {
      console.warn('No last week page views data found:', error.message);
      lastWeekPageViewsSnapshot = { size: 0, docs: [] };
    }

    // Filter out admin page views
    const todayNonAdmin = todayPageViewsSnapshot.docs.filter(doc => 
      doc.data().pageName && doc.data().pageName.toLowerCase() !== 'admin'
    );
    const yesterdayNonAdmin = yesterdayPageViewsSnapshot.docs.filter(doc => 
      doc.data().pageName && doc.data().pageName.toLowerCase() !== 'admin'
    );
    const lastWeekNonAdmin = lastWeekPageViewsSnapshot.docs.filter(doc => 
      doc.data().pageName && doc.data().pageName.toLowerCase() !== 'admin'
    );

    const summary = {
      today: {
        pageViews: todayNonAdmin.length,
        imageViews: todayImageViewsSnapshot.size,
        interactions: todayInteractionsSnapshot.size,
        uniqueVisitors: new Set(todayNonAdmin.map(doc => doc.data().visitorId)).size
      },
      yesterday: {
        pageViews: yesterdayNonAdmin.length,
        imageViews: yesterdayImageViewsSnapshot.size,
        interactions: yesterdayInteractionsSnapshot.size,
        uniqueVisitors: new Set(yesterdayNonAdmin.map(doc => doc.data().visitorId)).size
      },
      lastWeek: {
        pageViews: lastWeekNonAdmin.length,
        uniqueVisitors: new Set(lastWeekNonAdmin.map(doc => doc.data().visitorId)).size
      }
    };

    // Calculate growth percentages
    summary.today.pageViewsGrowth = calculateGrowth(summary.today.pageViews, summary.yesterday.pageViews);
    summary.today.imageViewsGrowth = calculateGrowth(summary.today.imageViews, summary.yesterday.imageViews);
    summary.today.interactionsGrowth = calculateGrowth(summary.today.interactions, summary.yesterday.interactions);
    summary.today.visitorsGrowth = calculateGrowth(summary.today.uniqueVisitors, summary.yesterday.uniqueVisitors);

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Helper function to calculate growth percentage
function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Clear all analytics data (admin only)
exports.clearAnalyticsData = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
  // Enable CORS for your frontend domain
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const collectionsToDelete = [
      'analytics_visits',
      'analytics_image_views',
      'analytics_interactions',
      'analytics_sessions',
      'analytics_image_stats',
      'analytics_daily_stats'
    ];

    let totalDeleted = 0;
    const results = {};

    // Delete all documents from each collection
    for (const collectionName of collectionsToDelete) {
      try {
        const snapshot = await db.collection(collectionName).get();
        const deletePromises = [];
        
        snapshot.docs.forEach(doc => {
          deletePromises.push(doc.ref.delete());
        });

        await Promise.all(deletePromises);
        
        results[collectionName] = snapshot.size;
        totalDeleted += snapshot.size;
        
        console.log(`Deleted ${snapshot.size} documents from ${collectionName}`);
      } catch (error) {
        console.warn(`Error deleting from ${collectionName}:`, error.message);
        results[collectionName] = 0;
      }
    }

    res.json({
      success: true,
      message: 'Analytics data cleared successfully',
      totalDeleted,
      results
    });

  } catch (error) {
    console.error('Error clearing analytics data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
