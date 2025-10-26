import dotenv from 'dotenv';

console.log('🔍 Testing environment variable loading...');

// Load .env file
const result = dotenv.config();

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully');
}

console.log('Environment variables:');
console.log('MONGO_URI_SOURCE:', process.env.MONGO_URI_SOURCE ? 'Present' : 'Missing');
console.log('MONGO_URI_RESULTS:', process.env.MONGO_URI_RESULTS ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT || 'Not set');

// Test direct file reading
import fs from 'fs';
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('\n📄 .env file content:');
  console.log(envContent);
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
}
