#!/usr/bin/env node

/**
 * Sitemap Generator Script
 * 
 * This script generates individual image URLs for the sitemap.xml
 * by fetching gallery images from Firebase (via Cloud Functions)
 * and creating SEO-friendly URLs using the slugify utility.
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to escape XML characters for sitemap
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Import the slugify utility (we'll need to create a Node.js version)
function generateSlug(title, scientificName = '', id = '') {
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

/**
 * Generate sitemap entries for individual images
 */
function generateImageSitemapEntries(images) {
  const entries = [];
  
  // Group images by series first
  const seriesGroups = {};
  const singleImages = [];
  
  images.forEach((image) => {
    if (image.isSeries && image.title) {
      if (!seriesGroups[image.title]) {
        seriesGroups[image.title] = [];
      }
      seriesGroups[image.title].push(image);
    } else {
      singleImages.push(image);
    }
  });
  
  // Process series images - create individual entry for each image in the series
  Object.values(seriesGroups).forEach(seriesImages => {
    // Sort by seriesIndex to ensure correct order
    seriesImages.sort((a, b) => (a.seriesIndex || 0) - (b.seriesIndex || 0));
    
    // Create individual entry for each image in the series
    seriesImages.forEach(image => {
      const title = image.title || 'untitled';
      const scientificName = image.scientificName || '';
      const seriesNumber = String(image.seriesIndex || 1);
      
      // Generate slug using title, scientific name, and series number
      const slug = generateSlug(title, scientificName, seriesNumber);
      const url = `https://jpmorada.photography/gallery/${slug}`;
      
      // Create title with scientific name if available
      const fullTitle = scientificName 
        ? `${title} (${scientificName}) - Wildlife Photography`
        : `${title} - Wildlife Photography`;
      
      // Create description/caption
      const caption = image.description || 
        `Beautiful wildlife photography of ${title}${image.location ? ` captured in ${image.location}` : ''}`;
      
      entries.push({
        url,
        title: escapeXml(fullTitle),
        caption: escapeXml(caption),
        lastmod: new Date().toISOString().split('T')[0],
        priority: '0.8'
      });
    });
  });
  
  // Process single images
  singleImages.forEach((image) => {
    const title = image.title || image.name || 'untitled';
    const scientificName = image.scientificName || '';
    
    // Extract series number from filename for clean URLs
    const filename = image.name || image.path?.split('/').pop() || '';
    const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const numberMatch = filenameWithoutExt.match(/_(\d+)$/);
    const seriesNumber = numberMatch ? numberMatch[1] : '1';
    
    // Generate slug using title, scientific name, and series number
    const slug = generateSlug(title, scientificName, seriesNumber);
    const url = `https://jpmorada.photography/gallery/${slug}`;
    
    // Create title with scientific name if available
    const fullTitle = scientificName 
      ? `${title} (${scientificName}) - Wildlife Photography`
      : `${title} - Wildlife Photography`;
    
    // Create description/caption
    const caption = image.description || 
      `Beautiful wildlife photography of ${title}${image.location ? ` captured in ${image.location}` : ''}`;
    
    entries.push({
      url,
      title: escapeXml(fullTitle),
      caption: escapeXml(caption),
      lastmod: new Date().toISOString().split('T')[0],
      priority: '0.8'
    });
  });
  
  return entries;
}

/**
 * Fetch all gallery images from Cloud Functions API with pagination
 * This matches the deployed sitemap generation logic
 */
async function fetchAllGalleryImages(folder = 'gallery', pageSize = 100) {
  const functionsURL = 'https://asia-southeast1-kuyajp-portfolio.cloudfunctions.net';
  let page = 1;
  let allImages = [];
  let hasMore = true;

  while (hasMore) {
    const url = `${functionsURL}/getGalleryImages?folder=${encodeURIComponent(folder)}&page=${page}&limit=${pageSize}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch gallery images: HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data?.success && Array.isArray(data.images)) {
      allImages = allImages.concat(data.images);
      hasMore = Boolean(data.pagination?.hasMore);
      page += 1;
    } else {
      // Stop if unexpected shape
      hasMore = false;
    }
  }

  // De-duplicate by id/path in case of overlaps
  const seen = new Set();
  const unique = [];
  for (const img of allImages) {
    const key = img.id || img.path || img.src;
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(img);
    }
  }
  return unique;
}

/**
 * Generate XML sitemap content
 */
function generateSitemapXML(imageEntries) {
  const baseUrl = 'https://jpmorada.photography';
  const lastmod = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/Hero.jpg</image:loc>
      <image:title>John Philip Morada Photography - Wildlife Photography</image:title>
      <image:caption>Professional wildlife and nature photography</image:caption>
    </image:image>
  </url>
  
  <!-- Gallery Page -->
  <url>
    <loc>${baseUrl}/gallery</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- About Page -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Services Page -->
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  
  <!-- Contact Page -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Individual Gallery Images -->
  <!-- Generated automatically from Firebase Storage gallery images -->
  
`;

  // Add individual image entries
  imageEntries.forEach(entry => {
    xml += `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${entry.priority}</priority>
    <image:image>
      <image:loc>${entry.url}</image:loc>
      <image:title>${entry.title}</image:title>
      <image:caption>${entry.caption}</image:caption>
    </image:image>
  </url>
  
`;
  });

  xml += `</urlset>
`;

  return xml;
}

/**
 * Main function to generate sitemap
 */
async function generateSitemap() {
  try {
    console.log('🔄 Generating sitemap...');
    // Fetch all images from Firebase Functions API
    const images = await fetchAllGalleryImages('gallery', 100);
    console.log(`📷 Retrieved ${images.length} images from Cloud Functions`);

    const imageEntries = generateImageSitemapEntries(images);
    const sitemapXML = generateSitemapXML(imageEntries);
    
    // Write to public/sitemap.xml and out/sitemap.xml
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    const outSitemapPath = path.join(__dirname, '..', 'out', 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
    
    // Also write to out directory if it exists (for immediate deployment after build)
    if (fs.existsSync(path.join(__dirname, '..', 'out'))) {
      fs.writeFileSync(outSitemapPath, sitemapXML, 'utf8');
      console.log(`📁 Sitemap also saved to: ${outSitemapPath}`);
    }
    
    console.log(`✅ Sitemap generated successfully with ${imageEntries.length} image entries`);
    console.log(`📁 Sitemap saved to: ${sitemapPath}`);
    
    // Log the generated URLs for verification
    console.log('\n🔗 Generated individual image URLs:');
    imageEntries.forEach(entry => {
      console.log(`   ${entry.url}`);
    });
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  console.log('Running generateSitemap...');
  generateSitemap();
}

export {
  generateSlug,
  generateImageSitemapEntries,
  generateSitemapXML,
  generateSitemap
};
