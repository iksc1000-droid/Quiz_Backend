#!/usr/bin/env node
/**
 * Test helper to preview email template and verify results URL
 * 
 * Usage: node scripts/test-email-template.js
 * 
 * This will generate a preview HTML file without sending an email
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { getQuizConfig } from '../src/config/quizConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the internal function (we'll need to export it or duplicate the logic)
// For now, let's duplicate the key parts for testing

const getResultsUrlForQuiz = (quizId) => {
  if (quizId === 'divorce_conflict_v1') {
    return 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
  }
  return `https://www.ikscbandhan.in/results?quiz=${encodeURIComponent(quizId)}`;
};

const buildWelcomeEmailHtml = ({ name, quizConfig, resultsUrl, summary }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your IKSC Bandhan ${quizConfig.category} Quiz Results</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.8;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background-color: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                border: 1px solid #e2e8f0;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                background: linear-gradient(135deg, ${quizConfig.color}20 0%, ${quizConfig.color}40 100%);
                padding: 30px;
                border-radius: 12px;
                border-left: 4px solid ${quizConfig.color};
            }
            .header h1 {
                margin: 0 0 10px 0;
                font-size: 24px;
                color: ${quizConfig.color};
                font-weight: 700;
            }
            .header .emoji {
                font-size: 32px;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #1a202c;
            }
            .highlight {
                color: ${quizConfig.color};
                font-weight: 600;
            }
            .strength-section {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                border-left: 4px solid #0ea5e9;
            }
            .glimpse-section {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                border-left: 4px solid #22c55e;
            }
            .glimpse-section h3 {
                color: #166534;
                margin-top: 0;
                font-size: 18px;
            }
            .glimpse-list {
                list-style: none;
                padding: 0;
                margin: 15px 0;
            }
            .glimpse-list li {
                padding: 8px 0;
                position: relative;
                padding-left: 25px;
            }
            .glimpse-list li:before {
                content: "✨";
                position: absolute;
                left: 0;
                top: 8px;
            }
            .cta-section {
                text-align: center;
                margin: 30px 0;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, ${quizConfig.color} 0%, ${quizConfig.color}dd 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 12px ${quizConfig.color}40;
                transition: transform 0.2s ease;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .wish-section {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                border-left: 4px solid #f59e0b;
            }
            .wish-section h3 {
                color: #92400e;
                margin-top: 0;
                font-size: 18px;
            }
            .footer {
                border-top: 2px solid #e2e8f0;
                padding-top: 25px;
                text-align: center;
                color: #64748b;
                font-size: 14px;
                margin-top: 30px;
            }
            .signature {
                margin: 20px 0;
                font-style: italic;
                color: #4a5568;
            }
            .branding {
                font-weight: 600;
                color: ${quizConfig.color};
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="emoji">${quizConfig.emoji}</div>
                <h1>You've Taken the First Step, ${name}!</h1>
                <p>Your IKSC Bandhan ${quizConfig.category} Quiz Result Awaits!</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello <span class="highlight">${name}</span>,
                </div>
                
                <p>Congratulations on completing your IKSC Bandhan <span class="highlight">${quizConfig.category} Quiz</span>! 🎉<br>
                You've taken a meaningful first step — one that only a few people ever take — toward understanding yourself better.</p>
                
                <div class="strength-section">
                    <p>Your responses reveal that your strongest quality is <span class="highlight">${summary?.topCategory || 'Personal Growth'}</span> — a unique strength that shapes how you think, work, and connect with the world around you. ✨</p>
                    
                    <p>But remember — this quiz is just the first <strong>5%</strong> of your journey.<br>
                    The remaining <strong>95%</strong> holds the real transformation — a deeper exploration of your personality, purpose, and potential.<br>
                    That's where growth truly begins… and we're here to help you uncover it. 🌱</p>
                </div>
                
                <div class="glimpse-section">
                    <h3>🌿 A Glimpse of What Awaits in Your Full Report</h3>
                    <ul class="glimpse-list">
                        <li>Personalised insights into how your mind and emotions shape decisions</li>
                        <li>Deeper understanding of your ${quizConfig.description.toLowerCase()}</li>
                        <li>Guidance to turn your strengths into lasting success</li>
                        <li>A clear roadmap to live and work with balance, confidence, and purpose</li>
                    </ul>
                </div>
                
                <div class="cta-section">
                    <h3>🚀 Next Step: See Your Quiz Result</h3>
                    <p>Click below to view your personalised quiz summary and continue your journey of self-discovery:</p>
                    <a href="${resultsUrl}" class="cta-button">See Your Quiz Result</a>
                    <p style="margin-top: 15px; font-size: 14px; color: #64748b;">
                        After viewing your results, don't forget to register for free to unlock your full IKSC Bandhan profile —<br>
                        and discover your complete personality blueprint designed to help you grow from the inside out.
                    </p>
                </div>
                
                <div class="wish-section">
                    <h3>💛 Our Wish for You</h3>
                    <p>May this small beginning lead you to greater clarity, confidence, and calm.<br>
                    Every big change starts with one simple act of self-awareness — and you've already taken that step today. 🌈</p>
                    
                    <p>We'll continue walking beside you — guiding, decoding, and celebrating your progress every step of the way.<br>
                    Over the next few days, you'll also receive a few short, informative emails designed specially for you — inspired by your quiz results — to help you reflect, grow, and stay inspired. ✨</p>
                </div>
                
                <div class="signature">
                    <p>Warm regards,<br>
                    Team IKSC Bandhan — <span class="branding">${quizConfig.branding}</span><br>
                    <em>"Discover Who You Are — Inside and Out."</em></p>
                </div>
            </div>
            
            <div class="footer">
                <p>Sent from: test@ikscbandhan.in</p>
                <p>© ${new Date().getFullYear()} IKSC Bandhan. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Test the email template
const testEmailTemplate = () => {
  console.log('🧪 Testing email template generation...\n');
  
  const quizId = 'divorce_conflict_v1';
  const quizConfig = getQuizConfig(quizId);
  const resultsUrl = getResultsUrlForQuiz(quizId, 'dummyToken123');
  
  console.log('📋 Test Parameters:');
  console.log('  quizId:', quizId);
  console.log('  resultToken: dummyToken123');
  console.log('  email: test@example.com');
  console.log('  name: Test User');
  console.log('  topCategory: Personal Growth\n');
  
  console.log('🔗 Generated Results URL:');
  console.log('  ', resultsUrl);
  console.log('');
  
  // Verify URL is correct
  const expectedUrl = 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
  if (resultsUrl === expectedUrl) {
    console.log('✅ URL is CORRECT!');
  } else {
    console.log('❌ URL is WRONG!');
    console.log('   Expected:', expectedUrl);
    console.log('   Got:     ', resultsUrl);
  }
  console.log('');
  
  // Generate HTML
  const emailHtml = buildWelcomeEmailHtml({
    name: 'Test User',
    quizConfig,
    resultsUrl,
    summary: { topCategory: 'Personal Growth' }
  });
  
  // Check if URL appears in HTML
  if (emailHtml.includes(resultsUrl)) {
    console.log('✅ Results URL found in email HTML');
  } else {
    console.log('❌ Results URL NOT found in email HTML!');
  }
  
  // Check for wrong URL
  if (emailHtml.includes('www.ikscbandhan.in/results?quiz=')) {
    console.log('❌ WARNING: Wrong URL pattern found in HTML!');
  } else {
    console.log('✅ No wrong URL patterns found');
  }
  console.log('');
  
  // Extract button link
  const buttonMatch = emailHtml.match(/<a href="([^"]+)"[^>]*class="cta-button"/);
  if (buttonMatch) {
    const buttonUrl = buttonMatch[1];
    console.log('🔘 Button Link Found:');
    console.log('  ', buttonUrl);
    if (buttonUrl === expectedUrl) {
      console.log('✅ Button link is CORRECT!');
    } else {
      console.log('❌ Button link is WRONG!');
    }
  } else {
    console.log('❌ Could not find button link in HTML!');
  }
  console.log('');
  
  // Save preview file
  try {
    const tmpDir = join(__dirname, '..', 'tmp');
    mkdirSync(tmpDir, { recursive: true });
    const previewPath = join(tmpDir, 'email-preview.html');
    writeFileSync(previewPath, emailHtml, 'utf-8');
    console.log('📄 Email preview saved to:');
    console.log('  ', previewPath);
    console.log('');
    console.log('💡 Open this file in a browser to preview the email');
  } catch (error) {
    console.log('⚠️  Could not save preview file:', error.message);
  }
  
  console.log('\n✅ Test complete!');
};

testEmailTemplate();

