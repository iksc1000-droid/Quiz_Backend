#!/usr/bin/env node
/**
 * Diagnostic script to check email URL configuration
 * Run this on VPS to verify what URL is actually being used
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = join(__dirname, '..');

console.log('🔍 DIAGNOSING EMAIL URL CONFIGURATION\n');
console.log('=' .repeat(60));

// 1. Check mailer.js file
console.log('\n1️⃣ Checking mailer.js file...');
try {
  const mailerPath = join(backendRoot, 'src', 'config', 'mailer.js');
  const mailerContent = readFileSync(mailerPath, 'utf-8');
  
  // Find resultsUrl line
  const resultsUrlMatch = mailerContent.match(/const resultsUrl\s*=\s*['"`]([^'"`]+)['"`]/);
  if (resultsUrlMatch) {
    console.log('   ✅ Found resultsUrl:', resultsUrlMatch[1]);
    
    if (resultsUrlMatch[1].includes('conflict-resolution-quiz.ikscbandhan.in/divorce-email')) {
      console.log('   ✅ URL is CORRECT!');
    } else if (resultsUrlMatch[1].includes('www.ikscbandhan.in')) {
      console.log('   ❌ URL is WRONG - still using www.ikscbandhan.in');
      console.log('   ⚠️  This is the problem!');
    } else {
      console.log('   ⚠️  URL is:', resultsUrlMatch[1]);
    }
  } else {
    console.log('   ❌ Could not find resultsUrl in mailer.js');
  }
  
  // Check if BRAND_SITE is being used
  if (mailerContent.includes('config.branding.site') && !mailerContent.includes('// ✅ FINAL: Divorce quiz result page')) {
    console.log('   ⚠️  WARNING: Code might be using BRAND_SITE instead of hardcoded URL');
  }
  
} catch (error) {
  console.log('   ❌ Error reading mailer.js:', error.message);
}

// 2. Check .env file
console.log('\n2️⃣ Checking .env file...');
try {
  const envPath = join(backendRoot, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  
  const brandSiteMatch = envContent.match(/BRAND_SITE\s*=\s*(.+)/);
  if (brandSiteMatch) {
    console.log('   📝 BRAND_SITE in .env:', brandSiteMatch[1].trim());
    if (brandSiteMatch[1].includes('www.ikscbandhan.in')) {
      console.log('   ⚠️  BRAND_SITE is set to www.ikscbandhan.in (but should not affect hardcoded URL)');
    }
  } else {
    console.log('   ℹ️  BRAND_SITE not found in .env');
  }
} catch (error) {
  console.log('   ⚠️  Could not read .env file (might not exist or no permission)');
}

// 3. Check if file was recently modified
console.log('\n3️⃣ Checking file modification time...');
try {
  const { statSync } = await import('fs');
  const mailerPath = join(backendRoot, 'src', 'config', 'mailer.js');
  const stats = statSync(mailerPath);
  const modifiedDate = new Date(stats.mtime);
  const now = new Date();
  const hoursAgo = (now - modifiedDate) / (1000 * 60 * 60);
  
  console.log('   📅 File last modified:', modifiedDate.toLocaleString());
  console.log('   ⏰ Modified', hoursAgo.toFixed(1), 'hours ago');
  
  if (hoursAgo > 24) {
    console.log('   ⚠️  File was modified more than 24 hours ago - might need update');
  } else {
    console.log('   ✅ File was recently modified');
  }
} catch (error) {
  console.log('   ⚠️  Could not check modification time');
}

// 4. Check PM2 status
console.log('\n4️⃣ PM2 Status Check...');
console.log('   Run these commands manually:');
console.log('   pm2 list');
console.log('   pm2 logs --lines 50 | grep -i "resultsUrl\\|EMAIL CTA\\|results"');

// 5. Recommendations
console.log('\n' + '='.repeat(60));
console.log('\n📋 RECOMMENDATIONS:\n');

console.log('If URL is wrong in mailer.js:');
console.log('   1. Edit src/config/mailer.js');
console.log('   2. Find line with: const resultsUrl = ...');
console.log('   3. Change to: const resultsUrl = \'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email\';');
console.log('   4. Save file');
console.log('   5. Run: pm2 restart all');
console.log('   6. Check logs: pm2 logs --lines 20');

console.log('\nTo verify fix:');
console.log('   1. Send a test email');
console.log('   2. Check email HTML source');
console.log('   3. Look for href="..." in the button link');
console.log('   4. Should be: href="https://conflict-resolution-quiz.ikscbandhan.in/divorce-email"');

console.log('\n' + '='.repeat(60));

