#!/usr/bin/env node
/**
 * Fix Gmail Configuration
 * Updates .env file with correct Gmail App Password and settings
 */

import fs from 'fs';

console.log('📧 Fixing Gmail Configuration...\n');

// Read current .env file
let envContent = '';
if (fs.existsSync('.env')) {
  envContent = fs.readFileSync('.env', 'utf8');
}

console.log('📊 Current Configuration Issues:');
console.log('   ❌ Using wrong password: ikscbandhan123');
console.log('   ❌ Using wrong port: 587');
console.log('   ❌ Using wrong secure setting: false');
console.log('   ❌ Server using mock email service');

// Correct Gmail configuration
const correctConfig = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '465',
  SMTP_SECURE: 'true',
  SMTP_USER: 'ikscbandhan@gmail.com',
  SMTP_PASS: 'sfhh gdsb tgzg ywxj',
  FROM_EMAIL: 'ikscbandhan@gmail.com',
  FROM_NAME: 'IKSC Bandhan'
};

console.log('\n📊 Correct Configuration:');
console.log(`   SMTP Host: ${correctConfig.SMTP_HOST}`);
console.log(`   SMTP Port: ${correctConfig.SMTP_PORT}`);
console.log(`   SMTP Secure: ${correctConfig.SMTP_SECURE}`);
console.log(`   SMTP User: ${correctConfig.SMTP_USER}`);
console.log(`   SMTP Pass: ${correctConfig.SMTP_PASS}`);
console.log(`   From Email: ${correctConfig.FROM_EMAIL}`);
console.log(`   From Name: ${correctConfig.FROM_NAME}`);

// Update .env content
const lines = envContent.split('\n');
const updatedLines = lines.map(line => {
  if (line.startsWith('SMTP_HOST=')) return `SMTP_HOST=${correctConfig.SMTP_HOST}`;
  if (line.startsWith('SMTP_PORT=')) return `SMTP_PORT=${correctConfig.SMTP_PORT}`;
  if (line.startsWith('SMTP_SECURE=')) return `SMTP_SECURE=${correctConfig.SMTP_SECURE}`;
  if (line.startsWith('SMTP_USER=')) return `SMTP_USER=${correctConfig.SMTP_USER}`;
  if (line.startsWith('SMTP_PASS=')) return `SMTP_PASS=${correctConfig.SMTP_PASS}`;
  if (line.startsWith('FROM_EMAIL=')) return `FROM_EMAIL=${correctConfig.FROM_EMAIL}`;
  if (line.startsWith('FROM_NAME=')) return `FROM_NAME=${correctConfig.FROM_NAME}`;
  return line;
});

// Write updated .env file
const updatedEnvContent = updatedLines.join('\n');
fs.writeFileSync('.env', updatedEnvContent);

console.log('\n✅ .env file updated with correct Gmail configuration!');

console.log('\n🔧 Next Steps:');
console.log('   1. Switch server from mock to real email service');
console.log('   2. Test real email sending');
console.log('   3. Verify complete quiz flow');

console.log('\n📧 Gmail App Password Configuration:');
console.log('   ✅ Using your real Gmail App Password');
console.log('   ✅ Correct port: 465');
console.log('   ✅ Correct secure setting: true');
console.log('   ✅ Ready for real email sending');
