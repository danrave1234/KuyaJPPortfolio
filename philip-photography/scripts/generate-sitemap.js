#!/usr/bin/env node

/**
 * Sitemap Generator Script
 * 
 * This script generates individual image URLs for the sitemap.xml
 * by fetching gallery images from Firebase Storage and creating
 * SEO-friendly URLs using the slugify utility.
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  images.forEach(image => {
    const slug = generateSlug(image.title, image.scientificName, image.id);
    const url = `https://jpmorada.photography/gallery/${slug}`;
    
    // Create title with scientific name if available
    const title = image.scientificName 
      ? `${image.title} (${image.scientificName}) - Wildlife Photography`
      : `${image.title} - Wildlife Photography`;
    
    // Create description/caption
    const caption = image.description || 
      `Beautiful wildlife photography of ${image.title}${image.location ? ` captured in ${image.location}` : ''}`;
    
    entries.push({
      url,
      title,
      caption,
      lastmod: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      priority: '0.8'
    });
  });
  
  return entries;
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
      <image:title>Kuya JP Photography - Wildlife Photography</image:title>
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
    
    // For now, we'll create a template with example entries
    // In the future, this could fetch actual images from Firebase
    const exampleImages = [
      {
        id: 'philippine-eagle-001',
        title: 'Philippine Eagle',
        scientificName: 'Pithecophaga jefferyi',
        description: 'Stunning photograph of the Philippine Eagle, one of the rarest and most powerful birds of prey in the world',
        location: 'Davao Oriental, Philippines'
      },
      {
        id: 'kingfisher-001',
        title: 'Common Kingfisher',
        scientificName: 'Alcedo atthis',
        description: 'Beautiful close-up of a Common Kingfisher in its natural habitat',
        location: 'Metro Manila, Philippines'
      },
      {
        id: 'hornbill-001',
        title: 'Visayan Hornbill',
        scientificName: 'Penelopides panini',
        description: 'Rare Visayan Hornbill captured in its natural forest habitat',
        location: 'Negros Island, Philippines'
      }
    ];
    
    const imageEntries = generateImageSitemapEntries(exampleImages);
    const sitemapXML = generateSitemapXML(imageEntries);
    
    // Write to public/sitemap.xml
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
    
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
