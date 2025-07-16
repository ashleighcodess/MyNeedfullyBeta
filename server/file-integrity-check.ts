import fs from 'fs';
import path from 'path';
import { db } from './db';
import { wishlists } from '../shared/schema';
import { sql } from 'drizzle-orm';

// CRITICAL DATA PROTECTION: File integrity monitoring system
export async function performFileIntegrityCheck(): Promise<void> {
  console.log('🔍 STARTING CRITICAL FILE INTEGRITY CHECK...');
  
  try {
    // Get all wishlists with story images
    const results = await db.select({
      id: wishlists.id,
      title: wishlists.title,
      storyImages: wishlists.storyImages
    })
    .from(wishlists)
    .where(sql`story_images IS NOT NULL AND story_images != '{}'`);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const backupDir = path.join(uploadsDir, 'backup');
    let missingFiles = 0;
    let recoveredFiles = 0;

    for (const wishlist of results) {
      const storyImages = Array.isArray(wishlist.storyImages) 
        ? wishlist.storyImages 
        : typeof wishlist.storyImages === 'string' && wishlist.storyImages.startsWith('{')
          ? wishlist.storyImages.slice(1, -1).split(',').map(img => img.trim().replace(/"/g, ''))
          : [];

      for (const imagePath of storyImages) {
        if (imagePath.startsWith('/uploads/')) {
          const filename = path.basename(imagePath);
          const fullPath = path.join(uploadsDir, filename);
          const backupPath = path.join(backupDir, filename);

          if (!fs.existsSync(fullPath)) {
            console.error(`❌ MISSING FILE: ${imagePath} for wishlist ${wishlist.id} (${wishlist.title})`);
            missingFiles++;

            // Try to recover from backup
            if (fs.existsSync(backupPath)) {
              try {
                fs.copyFileSync(backupPath, fullPath);
                console.log(`🔄 RECOVERED: ${filename} from backup for wishlist ${wishlist.id}`);
                recoveredFiles++;
              } catch (error) {
                console.error(`❌ RECOVERY FAILED: ${filename}`, error);
              }
            } else {
              console.error(`❌ NO BACKUP AVAILABLE: ${filename}`);
            }
          } else {
            // Verify file integrity
            const stats = fs.statSync(fullPath);
            if (stats.size === 0) {
              console.error(`❌ CORRUPTED FILE (0 bytes): ${imagePath} for wishlist ${wishlist.id}`);
            }
          }
        }
      }
    }

    console.log(`🔍 FILE INTEGRITY CHECK COMPLETE:`);
    console.log(`   📊 Total wishlists checked: ${results.length}`);
    console.log(`   ❌ Missing files found: ${missingFiles}`);
    console.log(`   🔄 Files recovered: ${recoveredFiles}`);
    console.log(`   ⚠️  Files still missing: ${missingFiles - recoveredFiles}`);

    if (missingFiles > 0) {
      console.error(`🚨 CRITICAL: ${missingFiles} files missing from user uploads! Data loss detected!`);
    }

  } catch (error) {
    console.error('❌ FILE INTEGRITY CHECK FAILED:', error);
  }
}

// Run integrity check on startup
export function startFileIntegrityMonitoring(): void {
  // Run check immediately
  performFileIntegrityCheck();
  
  // Run check every hour
  setInterval(performFileIntegrityCheck, 60 * 60 * 1000);
  
  console.log('✅ File integrity monitoring started');
}