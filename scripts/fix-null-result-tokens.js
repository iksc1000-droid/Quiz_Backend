/**
 * Database Cleanup Script: Fix null resultToken values
 * 
 * This script fixes existing documents in the divorce_conflict_results collection
 * that have null resultToken values by generating unique tokens for them.
 * 
 * Run this script on your VPS where the database is located:
 * node scripts/fix-null-result-tokens.js
 * 
 * The script will:
 * 1. Find all documents with null or missing resultToken
 * 2. Generate unique tokens for each
 * 3. Update them in batches
 * 4. Verify the fix
 * 5. Report statistics
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

// Database connection string - use MONGO_URI_RESULTS from .env
const MONGODB_URI = process.env.MONGO_URI_RESULTS || process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI_RESULTS not found in environment variables');
  console.error('   Please set MONGO_URI_RESULTS in your .env file');
  process.exit(1);
}

// Collection name - can be overridden via environment variable
const COLLECTION_NAME = process.env.RESULTS_COLLECTION || 'divorce_conflict_results';

// Batch size for updates
const BATCH_SIZE = 100;

// Generate a unique token
function generateUniqueToken() {
  try {
    return new mongoose.Types.ObjectId().toString();
  } catch (error) {
    // Fallback if ObjectId fails
    return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

async function fixNullResultTokens() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   Database: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`); // Hide credentials
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection(COLLECTION_NAME);

    // Verify collection exists
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    if (collections.length === 0) {
      console.error(`❌ Collection "${COLLECTION_NAME}" does not exist`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Find all documents with null or missing resultToken
    console.log(`\n🔍 Searching for documents with null resultToken in "${COLLECTION_NAME}"...`);
    const documentsWithNullToken = await collection.find({
      $or: [
        { resultToken: null },
        { resultToken: { $exists: false } },
        { resultToken: '' }
      ]
    }).toArray();

    console.log(`📊 Found ${documentsWithNullToken.length} documents with null/missing/empty resultToken`);

    if (documentsWithNullToken.length === 0) {
      console.log('✅ No documents need fixing. Database is clean!');
      await mongoose.disconnect();
      return;
    }

    // Generate unique tokens for each document
    console.log(`\n🔧 Generating unique tokens and updating documents in batches of ${BATCH_SIZE}...`);
    let updated = 0;
    let errors = 0;
    const errorDetails = [];

    // Process in batches
    for (let i = 0; i < documentsWithNullToken.length; i += BATCH_SIZE) {
      const batch = documentsWithNullToken.slice(i, i + BATCH_SIZE);
      console.log(`\n   Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(documentsWithNullToken.length / BATCH_SIZE)} (${batch.length} documents)...`);

      for (const doc of batch) {
        try {
          // Generate unique token
          let newToken = generateUniqueToken();
          let retries = 3;
          let success = false;

          // Retry if duplicate token (unlikely but possible)
          while (retries > 0 && !success) {
            try {
              const updateResult = await collection.updateOne(
                { _id: doc._id },
                { $set: { resultToken: newToken } }
              );

              if (updateResult.modifiedCount === 1) {
                updated++;
                success = true;
                if (i < 5) { // Only log first few for brevity
                  console.log(`     ✅ Updated document ${doc._id.toString().substring(0, 8)}...`);
                }
              } else {
                throw new Error('Update did not modify any documents');
              }
            } catch (updateError) {
              // If duplicate key error, try new token
              if (updateError.code === 11000 || updateError.message.includes('duplicate')) {
                retries--;
                if (retries > 0) {
                  newToken = generateUniqueToken();
                } else {
                  throw new Error('Failed after multiple retries due to duplicate token');
                }
              } else {
                throw updateError;
              }
            }
          }
        } catch (error) {
          errors++;
          const errorMsg = `Failed to update document ${doc._id}: ${error.message}`;
          errorDetails.push({ docId: doc._id, error: errorMsg });
          console.error(`     ❌ ${errorMsg}`);
        }
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Successfully updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    if (errorDetails.length > 0 && errorDetails.length <= 10) {
      console.log(`\n   Error details:`);
      errorDetails.forEach(e => console.log(`     - ${e.error}`));
    } else if (errorDetails.length > 10) {
      console.log(`\n   (${errorDetails.length} errors - too many to display)`);
    }
    console.log(`\n✅ Cleanup completed!`);

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const remainingNull = await collection.countDocuments({
      $or: [
        { resultToken: null },
        { resultToken: { $exists: false } },
        { resultToken: '' }
      ]
    });

    if (remainingNull === 0) {
      console.log('✅ Verification passed: No documents with null/empty resultToken remain');
    } else {
      console.log(`⚠️  Warning: ${remainingNull} documents still have null/empty resultToken`);
      console.log('   You may need to run this script again or investigate further.');
    }

    // Check for duplicate tokens (shouldn't happen but verify)
    console.log('\n🔍 Checking for duplicate tokens...');
    const duplicates = await collection.aggregate([
      { $match: { resultToken: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$resultToken', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicates.length === 0) {
      console.log('✅ No duplicate tokens found');
    } else {
      console.log(`⚠️  Warning: Found ${duplicates.length} duplicate tokens`);
      console.log('   This should not happen. Please investigate.');
    }

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    if (error.message) {
      console.error('   Error message:', error.message);
    }
    if (error.stack) {
      console.error('   Stack trace:', error.stack);
    }
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
}

// Run the cleanup
fixNullResultTokens();

