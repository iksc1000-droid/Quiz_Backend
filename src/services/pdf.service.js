import PDFDocument from 'pdfkit';
import { logger } from '../utils/logger.js';
import { getQuizConfig } from '../config/quizConfig.js';

export class PDFService {
  constructor(modelFactory) {
    this.modelFactory = modelFactory;
  }

  // Calculate Conflict Resolution Scores (same logic as frontend)
  calculateConflictResolutionScores(answers) {
    const parameterScores = {
      'A': { name: 'Partner Understanding', score: 0, insights: [] },
      'B': { name: 'Communication Issues', score: 0, insights: [] },
      'C': { name: 'Conflict Patterns', score: 0, insights: [] },
      'D': { name: 'Family Dynamics', score: 0, insights: [] },
      'E': { name: 'Emotional Distance', score: 0, insights: [] },
      'F': { name: 'Trust Issues', score: 0, insights: [] }
    };

    const answerPatterns = {
      'A': { a: 0, b: 0, c: 0, d: 0 },
      'B': { a: 0, b: 0, c: 0, d: 0 },
      'C': { a: 0, b: 0, c: 0, d: 0 },
      'D': { a: 0, b: 0, c: 0, d: 0 },
      'E': { a: 0, b: 0, c: 0, d: 0 },
      'F': { a: 0, b: 0, c: 0, d: 0 }
    };

    // Process answers
    answers.forEach((answer) => {
      const category = answer.questionId?.charAt(0);
      const option = answer.selectedOption?.charAt(answer.selectedOption.length - 1);
      
      if (category && parameterScores[category] && option) {
        answerPatterns[category][option]++;
      }
    });

    // Calculate scores (same logic as frontend)
    Object.keys(parameterScores).forEach(param => {
      const patterns = answerPatterns[param];
      const paramData = parameterScores[param];
      
      if (param === 'A') {
        paramData.score = patterns.a * 0 + patterns.b * 1 + patterns.c * 2 + patterns.d * 3;
        if (paramData.score <= 5) {
          paramData.insights.push("You have strong mutual understanding with your partner. Continue nurturing this connection through open communication.");
        } else if (paramData.score <= 10) {
          paramData.insights.push("There are some gaps in understanding. Focus on active listening and expressing your needs clearly.");
        } else if (paramData.score <= 15) {
          paramData.insights.push("Significant communication barriers exist. Consider couples counseling to improve mutual understanding.");
        } else {
          paramData.insights.push("Critical understanding gaps require professional intervention. Relationship therapy can help rebuild connection.");
        }
      }
      
      if (param === 'B') {
        paramData.score = patterns.a * 3 + patterns.b * 2 + patterns.c * 1 + patterns.d * 0;
        if (paramData.score <= 5) {
          paramData.insights.push("Your communication is healthy and effective. Keep practicing active listening and empathy.");
        } else if (paramData.score <= 10) {
          paramData.insights.push("Some communication challenges exist. Focus on 'I' statements and avoiding blame language.");
        } else {
          paramData.insights.push("Communication breakdowns are frequent. Professional guidance can teach effective communication strategies.");
        }
      }
      
      if (param === 'C') {
        const maxPattern = Math.max(patterns.a, patterns.b, patterns.c, patterns.d);
        if (patterns.a === maxPattern) {
          paramData.score = 12;
          paramData.insights.push("You tend to avoid conflicts, which can lead to resentment. Learn healthy conflict resolution techniques.");
        } else if (patterns.b === maxPattern) {
          paramData.score = 10;
          paramData.insights.push("Conflicts often escalate quickly. Practice de-escalation techniques and take breaks during heated discussions.");
        } else if (patterns.c === maxPattern) {
          paramData.score = 11;
          paramData.insights.push("Blame and criticism patterns are present. Focus on problem-solving rather than fault-finding.");
        } else {
          paramData.score = 13;
          paramData.insights.push("Destructive conflict patterns need immediate attention. Professional mediation can help establish healthier dynamics.");
        }
      }
      
      if (param === 'D') {
        const maxPattern = Math.max(patterns.a, patterns.b, patterns.c, patterns.d);
        if (patterns.a === maxPattern) {
          paramData.score = 6;
          paramData.insights.push("Your families provide good support. Maintain healthy boundaries while appreciating their positive influence.");
        } else if (patterns.b === maxPattern) {
          paramData.score = 7;
          paramData.insights.push("Family influence is mixed. Set clear boundaries about what family input is welcome in your relationship.");
        } else if (patterns.c === maxPattern) {
          paramData.score = 5;
          paramData.insights.push("Family interference is affecting your relationship. Establish firm boundaries and prioritize your partnership.");
        } else {
          paramData.score = 8;
          paramData.insights.push("Toxic family dynamics are harming your relationship. Consider limiting contact and seeking family therapy.");
        }
      }
      
      if (param === 'E') {
        paramData.score = patterns.a * 0 + patterns.b * 1 + patterns.c * 2 + patterns.d * 3;
        if (paramData.score <= 5) {
          paramData.insights.push("You maintain strong emotional intimacy. Continue prioritizing quality time and emotional connection.");
        } else if (paramData.score <= 10) {
          paramData.insights.push("Some emotional distance has developed. Focus on rebuilding intimacy through shared activities and deep conversations.");
        } else {
          paramData.insights.push("Significant emotional distance requires attention. Consider couples therapy to rebuild emotional connection.");
        }
      }
      
      if (param === 'F') {
        const maxPattern = Math.max(patterns.a, patterns.b, patterns.c, patterns.d);
        if (patterns.a === maxPattern) {
          paramData.score = 9;
          paramData.insights.push("You have strong trust in your relationship. Continue being transparent and reliable to maintain this foundation.");
        } else if (patterns.b === maxPattern) {
          paramData.score = 8;
          paramData.insights.push("Some trust concerns exist. Focus on consistent behavior and open communication to rebuild confidence.");
        } else if (patterns.c === maxPattern) {
          paramData.score = 7;
          paramData.insights.push("Trust issues are affecting your relationship. Professional counseling can help address underlying causes.");
        } else {
          paramData.score = 6;
          paramData.insights.push("Major trust issues require immediate professional intervention. Consider individual and couples therapy.");
        }
      }
    });

    return parameterScores;
  }

  // Calculate DISC Scores (same logic as frontend)
  calculateDISCScores(answers) {
    const discScores = { 'D': 0, 'I': 0, 'S': 0, 'C': 0 };
    
    answers.forEach((answer) => {
      if (answer.discMapping && discScores.hasOwnProperty(answer.discMapping)) {
        discScores[answer.discMapping] += answer.score || 0;
      }
    });
    
    Object.keys(discScores).forEach(key => {
      const count = discScores[key];
      discScores[key] = Math.round((count / 15) * 100);
    });
    
    return discScores;
  }

  // Calculate Skill Breakdown (same logic as frontend)
  calculateSkillBreakdown(discScores) {
    const mapDISCToCurrent = (discScore) => (discScore / 100) * 5;
    
    const currentCommunication = mapDISCToCurrent(discScores.I);
    const currentEmpathy = mapDISCToCurrent(discScores.S);
    const currentConflictResolution = mapDISCToCurrent(discScores.D);
    const currentTrust = mapDISCToCurrent(discScores.C);
    const currentIntimacy = mapDISCToCurrent(Math.max(discScores.I, discScores.S));
    
    const calculateImprovementPotential = (currentScore, discScore, skillType) => {
      const remainingPotential = 5 - currentScore;
      const baseImprovement = remainingPotential * 0.7;
      
      let multiplier = 1.0;
      if (discScore < 30) multiplier = 1.5;
      else if (discScore < 50) multiplier = 1.3;
      else multiplier = 1.1;
      
      let skillMultiplier = 1.0;
      switch(skillType) {
        case "Communication": skillMultiplier = 1.4; break;
        case "Empathy": skillMultiplier = 1.3; break;
        case "Conflict Resolution": skillMultiplier = 1.2; break;
        case "Trust": skillMultiplier = 1.5; break;
        case "Intimacy": skillMultiplier = 1.3; break;
      }
      
      const improvement = baseImprovement * multiplier * skillMultiplier;
      const target = Math.min(currentScore + improvement, 10);
      return Math.max(target, currentScore + 2.5);
    };
    
    return [
      { skill: "Communication", current: currentCommunication, target: calculateImprovementPotential(currentCommunication, discScores.I, "Communication"), relationship: 9.2 },
      { skill: "Empathy", current: currentEmpathy, target: calculateImprovementPotential(currentEmpathy, discScores.S, "Empathy"), relationship: 8.8 },
      { skill: "Conflict Resolution", current: currentConflictResolution, target: calculateImprovementPotential(currentConflictResolution, discScores.D, "Conflict Resolution"), relationship: 9.5 },
      { skill: "Trust", current: currentTrust, target: calculateImprovementPotential(currentTrust, discScores.C, "Trust"), relationship: 9.0 },
      { skill: "Intimacy", current: currentIntimacy, target: calculateImprovementPotential(currentIntimacy, Math.max(discScores.I, discScores.S), "Intimacy"), relationship: 8.9 }
    ];
  }

  // Get Archetype (same logic as frontend)
  getArchetype(discScores) {
    const maxScore = Math.max(discScores.D, discScores.I, discScores.S, discScores.C);
    if (maxScore === discScores.D) return {emoji:"🎯", name:"The Resolver", desc:"Direct and solution-focused"};
    if (maxScore === discScores.I) return {emoji:"💬", name:"The Communicator", desc:"Expressive and social"};
    if (maxScore === discScores.S) return {emoji:"🤝", name:"The Supporter", desc:"Steady and empathetic"};
    return {emoji:"📊", name:"The Analyzer", desc:"Thoughtful and systematic"};
  }

  async generateReportPDF({ email, quizId, resultToken }) {
    try {
      logger.info(`📄 [PDF] Generating report for: ${email}, quizId: ${quizId}`);

      // Fetch result from database
      const resultModel = this.modelFactory.getResultModel(quizId);
      const result = await resultModel.findOne({ 
        email, 
        quizId,
        ...(resultToken ? { resultToken } : {})
      }).sort({ createdAt: -1 });

      if (!result) {
        throw new Error('Result not found');
      }

      const quizConfig = getQuizConfig(quizId);
      const name = result.name || email.split('@')[0];
      const topCategory = result.summary?.topCategory || 'General';
      const answers = result.raw?.answers || [];

      // Calculate all scores (same as frontend)
      const conflictResolutionScores = this.calculateConflictResolutionScores(answers);
      const discScores = this.calculateDISCScores(answers);
      const skillBreakdown = this.calculateSkillBreakdown(discScores);
      const archetype = this.getArchetype(discScores);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Collect PDF data and set up promise
      const chunks = [];
      const pdfPromise = new Promise((resolve, reject) => {
        doc.on('data', chunk => chunks.push(chunk));
        
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          logger.info(`✅ [PDF] Report generated successfully for ${email}`);
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          logger.error(`❌ [PDF] Error generating report:`, error);
          reject(error);
        });
      });

      let yPos = 50;

      // ===== HERO SECTION =====
      doc.fontSize(24)
         .fillColor('#D3212D')
         .text('IKSC Bandhan', 50, yPos, { align: 'center', width: 500 });
      
      yPos += 30;
      doc.fontSize(16)
         .fillColor('#333333')
         .text(`${quizConfig.category} Quiz Report`, 50, yPos, { align: 'center', width: 500 });

      // Progress Circle (5% unlocked) - Simplified representation
      yPos += 40;
      const circleX = 300;
      const circleY = yPos;
      const circleRadius = 35;
      
      // Background circle
      doc.circle(circleX, circleY, circleRadius)
         .strokeColor('#e5e7eb')
         .lineWidth(6)
         .stroke();
      
      // 5% progress arc (simplified - draw small arc)
      const startAngle = -90; // Start from top
      const endAngle = -90 + (5 / 100) * 360; // 5% of circle
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      doc.moveTo(
        circleX + circleRadius * Math.cos(startRad),
        circleY + circleRadius * Math.sin(startRad)
      )
      .arc(circleX, circleY, circleRadius, startRad, endRad)
      .strokeColor('#8b5cf6')
      .lineWidth(6)
      .stroke();
      
      // Percentage text
      doc.fontSize(16)
         .fillColor('#333333')
         .text('5%', circleX - 12, circleY - 10);
      doc.fontSize(9)
         .fillColor('#666666')
         .text('Unlocked', circleX - 20, circleY + 8);

      yPos += 100;
      doc.fontSize(18)
         .fillColor('#1a202c')
         .text('Understanding your relationship patterns is the first step toward healing.', 50, yPos, { width: 500, align: 'left' });

      yPos += 30;
      doc.fontSize(11)
         .fillColor('#64748b')
         .text(`Hi ${name}, this quiz on Conflict Resolution reveals 5% of your relationship dynamics and communication patterns. Do consider registering and taking the comprehensive Conflict Resolution assessment to unlock 100% of your relationship potential.`, 50, yPos, { width: 500, align: 'left' });

      // ===== RELATIONSHIP HEALTH ASSESSMENT =====
      yPos += 60;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(16)
         .fillColor('#8b5cf6')
         .text('Relationship Health Assessment', 50, yPos);
      
      yPos += 25;
      doc.fontSize(10)
         .fillColor('#64748b')
         .text('Visual analysis of your relationship dynamics across key dimensions', 50, yPos);

      // Bar Chart for Parameters
      yPos += 30;
      const colors = {
        'A': '#ef4444', 'B': '#f97316', 'C': '#eab308',
        'D': '#22c55e', 'E': '#06b6d4', 'F': '#8b5cf6'
      };
      const paramNames = {
        'A': 'Partner Understanding',
        'B': 'Communication Issues',
        'C': 'Conflict Patterns',
        'D': 'Family Dynamics',
        'E': 'Emotional Distance',
        'F': 'Trust Issues'
      };

      Object.keys(conflictResolutionScores).forEach((param, index) => {
        if (yPos > 700) { doc.addPage(); yPos = 50; }
        
        const score = conflictResolutionScores[param].score || 0;
        const barWidth = (score / 15) * 200;
        const barHeight = 15;
        
        // Parameter name
        doc.fontSize(9)
           .fillColor('#333333')
           .text(paramNames[param], 50, yPos + 3, { width: 120 });
        
        // Bar background
        doc.rect(180, yPos, 200, barHeight)
           .fillColor('#e5e7eb')
           .fill();
        
        // Bar fill
        doc.rect(180, yPos, barWidth, barHeight)
           .fillColor(colors[param])
           .fill();
        
        // Score text
        doc.fontSize(8)
           .fillColor('#ffffff')
           .text(`${score}/x`, 180 + barWidth - 25, yPos + 3, { width: 20 });
        
        yPos += 25;
      });

      // Parameter Details
      yPos += 20;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(12)
         .fillColor('#8b5cf6')
         .text('Parameter Insights', 50, yPos);
      
      yPos += 20;
      Object.keys(conflictResolutionScores).forEach((param) => {
        if (yPos > 700) { doc.addPage(); yPos = 50; }
        
        const data = conflictResolutionScores[param];
        doc.fontSize(10)
           .fillColor('#1a202c')
           .text(`${paramNames[param]}: ${data.score}/x`, 50, yPos, { width: 500 });
        
        yPos += 15;
        doc.fontSize(9)
           .fillColor('#64748b')
           .text(data.insights[0] || 'No insight available', 70, yPos, { width: 450 });
        
        yPos += 25;
      });

      // ===== RELATIONSHIP SKILLS PROGRESS =====
      yPos += 20;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(14)
         .fillColor('#8b5cf6')
         .text('Relationship Skills Progress', 50, yPos);
      
      yPos += 25;
      skillBreakdown.forEach((skill) => {
        if (yPos > 700) { doc.addPage(); yPos = 50; }
        
        // Skill name
        doc.fontSize(9)
           .fillColor('#333333')
           .text(skill.skill, 50, yPos, { width: 150 });
        
        // Current level bar (purple)
        const currentBarWidth = (skill.current / 10) * 200;
        doc.rect(200, yPos, currentBarWidth, 12)
           .fillColor('#8b5cf6')
           .fill();
        
        // Target level bar (green)
        const targetBarWidth = (skill.target / 10) * 200;
        doc.rect(200, yPos + 15, targetBarWidth, 12)
           .fillColor('#22c55e')
           .fill();
        
        // Healthy relationship line (emerald)
        const relationshipX = 200 + (skill.relationship / 10) * 200;
        doc.moveTo(relationshipX, yPos - 2)
           .lineTo(relationshipX, yPos + 30)
           .strokeColor('#10b981')
           .lineWidth(2)
           .stroke();
        
        yPos += 35;
      });

      // ===== DISC RADAR (simplified as table) =====
      yPos += 20;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(14)
         .fillColor('#8b5cf6')
         .text('Relationship Dynamics Analysis (DISC)', 50, yPos);
      
      yPos += 25;
      const discLabels = {
        'D': 'Dominance',
        'I': 'Influence',
        'S': 'Steadiness',
        'C': 'Conscientiousness'
      };
      
      Object.keys(discScores).forEach((key) => {
        if (yPos > 700) { doc.addPage(); yPos = 50; }
        
        const score = discScores[key];
        const barWidth = (score / 100) * 300;
        
        doc.fontSize(9)
           .fillColor('#333333')
           .text(discLabels[key], 50, yPos, { width: 120 });
        
        doc.rect(180, yPos, barWidth, 15)
           .fillColor('#8b5cf6')
           .fill();
        
        doc.fontSize(8)
           .fillColor('#ffffff')
           .text(`${score}%`, 180 + barWidth - 30, yPos + 3, { width: 25 });
        
        yPos += 25;
      });

      // ===== STRENGTH & GROWTH =====
      yPos += 20;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(14)
         .fillColor('#8b5cf6')
         .text('Strength & Growth', 50, yPos);
      
      yPos += 25;
      doc.fontSize(10)
         .fillColor('#16a34a')
         .text('💪 Top Strength: Communication Skills', 50, yPos);
      
      yPos += 20;
      doc.fontSize(10)
         .fillColor('#f59e0b')
         .text('⚡ Growth Zone: Conflict Resolution', 50, yPos);

      // ===== ARCHETYPE =====
      yPos += 30;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(14)
         .fillColor('#8b5cf6')
         .text('Your Profile', 50, yPos);
      
      yPos += 25;
      doc.fontSize(12)
         .fillColor('#1a202c')
         .text(`${archetype.emoji} ${archetype.name}`, 50, yPos);
      
      yPos += 15;
      doc.fontSize(10)
         .fillColor('#64748b')
         .text(archetype.desc, 50, yPos);

      // ===== COMPREHENSIVE SUMMARY =====
      yPos += 40;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(14)
         .fillColor('#8b5cf6')
         .text('Your Complete Conflict Resolution Analysis', 50, yPos, { align: 'center', width: 500 });
      
      yPos += 30;
      const avgSkill = skillBreakdown.reduce((sum, s) => sum + s.current, 0) / skillBreakdown.length;
      const avgTarget = skillBreakdown.reduce((sum, s) => sum + s.target, 0) / skillBreakdown.length;
      
      const approach = discScores.D > discScores.I && discScores.D > discScores.S && discScores.D > discScores.C 
        ? 'direct and solution-focused'
        : discScores.I > discScores.D && discScores.I > discScores.S && discScores.I > discScores.C
        ? 'expressive and communicative'
        : discScores.S > discScores.D && discScores.S > discScores.I && discScores.S > discScores.C
        ? 'steady and empathetic'
        : 'thoughtful and systematic';
      
      const summaryText = `Based on your responses, you demonstrate a ${approach} approach to relationship challenges. ` +
        `Your communication patterns show ${conflictResolutionScores.B.score <= 5 ? 'healthy and effective' : conflictResolutionScores.B.score <= 10 ? 'some challenges that can be improved' : 'significant barriers that need attention'} dynamics. ` +
        `Your current relationship skills show ${Math.round(avgSkill * 2) <= 3 ? 'beginner to intermediate' : Math.round(avgSkill * 2) <= 6 ? 'intermediate to advanced' : 'advanced'} level capabilities, ` +
        `with the potential to reach ${Math.round(avgTarget * 2) <= 6 ? 'advanced' : Math.round(avgTarget * 2) <= 8 ? 'expert' : 'healthy relationship'} level performance.`;
      
      doc.fontSize(10)
         .fillColor('#64748b')
         .text(summaryText, 50, yPos, { width: 500, align: 'left' });

      // ===== ISSUES IDENTIFIED =====
      yPos += 80;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(12)
         .fillColor('#dc2626')
         .text('⚠️ Issues Identified', 50, yPos);
      
      yPos += 20;
      
      // Communication Barriers
      doc.fontSize(9)
         .fillColor('#991b1b')
         .text('Communication Barriers', 50, yPos);
      yPos += 12;
      const commText = conflictResolutionScores.B.score <= 5 
        ? 'Your communication is healthy and effective. Keep practicing active listening and empathy.'
        : conflictResolutionScores.B.score <= 10 
        ? 'Some communication challenges exist. Focus on "I" statements and avoiding blame language.'
        : 'Communication breakdowns are frequent. Professional guidance can teach effective communication strategies.';
      doc.fontSize(8)
         .fillColor('#7f1d1d')
         .text(commText, 70, yPos, { width: 450 });
      
      yPos += 25;
      
      // Conflict Resolution Gap
      doc.fontSize(9)
         .fillColor('#991b1b')
         .text('Conflict Resolution Gap', 50, yPos);
      yPos += 12;
      const conflictText = conflictResolutionScores.C.score <= 5 
        ? 'You handle conflicts constructively. Continue using healthy resolution techniques.'
        : conflictResolutionScores.C.score <= 10 
        ? 'Some conflict patterns need improvement. Learn de-escalation techniques and problem-solving approaches.'
        : 'Destructive conflict patterns need immediate attention. Professional mediation can help establish healthier dynamics.';
      doc.fontSize(8)
         .fillColor('#7f1d1d')
         .text(conflictText, 70, yPos, { width: 450 });
      
      yPos += 25;
      
      // Relationship Skills Needs
      doc.fontSize(9)
         .fillColor('#991b1b')
         .text('Relationship Skills Needs', 50, yPos);
      yPos += 12;
      doc.fontSize(8)
         .fillColor('#7f1d1d')
         .text('Current relationship skill level shows significant improvement potential. With proper guidance and structured learning, you can achieve healthy relationship capabilities across all key areas.', 70, yPos, { width: 450 });

      // ===== SOLUTIONS & SUPPORT =====
      yPos += 50;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
      
      doc.fontSize(12)
         .fillColor('#16a34a')
         .text('✅ Solutions & Support', 50, yPos);
      
      yPos += 20;
      
      doc.fontSize(9)
         .fillColor('#166534')
         .text('🤖 AI Relationship Coach', 50, yPos);
      yPos += 12;
      doc.fontSize(8)
         .fillColor('#14532d')
         .text('24/7 personalized guidance, communication techniques, and conflict resolution strategies', 70, yPos, { width: 450 });
      
      yPos += 25;
      
      doc.fontSize(9)
         .fillColor('#166534')
         .text('👨‍🏫 Expert Counselors', 50, yPos);
      yPos += 12;
      doc.fontSize(8)
         .fillColor('#14532d')
         .text('Licensed therapists providing structured relationship guidance and conflict resolution insights', 70, yPos, { width: 450 });
      
      yPos += 25;
      
      doc.fontSize(9)
         .fillColor('#166534')
         .text('📈 Growth Potential', 50, yPos);
      yPos += 12;
      const improvement = Math.round(((avgTarget - avgSkill) / avgSkill) * 100);
      doc.fontSize(8)
         .fillColor('#14532d')
         .text(`Target Level: ${Math.round(avgTarget * 2)}/10 - ${improvement}% improvement achievable`, 70, yPos, { width: 450 });

      // Footer on all pages
      const pageCount = doc.bufferedPageRange();
      for (let i = 0; i < pageCount.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .fillColor('#999999')
           .text(
             `© ${new Date().getFullYear()} IKSC Bandhan. All rights reserved. | Generated on ${new Date().toLocaleDateString()}`,
             50, doc.page.height - 30, { align: 'center', width: 500 }
           );
      }

      // Finalize PDF
      doc.end();

      return pdfPromise;
    } catch (error) {
      logger.error(`❌ [PDF] Failed to generate report:`, error);
      throw error;
    }
  }
}
