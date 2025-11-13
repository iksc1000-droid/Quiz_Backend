import { Router } from 'express';
import { QuizController, AttemptController } from '../controllers/quiz.controller.js';
import { PDFService } from '../services/pdf.service.js';
import { logger } from '../utils/logger.js';

export const createQuizRoutes = (quizService, attemptService, scoringService, mailService, modelFactory) => {
  const router = Router();
  
  const quizController = new QuizController(quizService);
  const attemptController = new AttemptController(attemptService, scoringService, mailService, quizService);
  const pdfService = new PDFService(modelFactory);

  // GET /api/quizzes/download-report - download PDF report
  router.get('/download-report', async (req, res) => {
    try {
      const { email, quizId, token } = req.query;
      
      if (!email || !quizId) {
        return res.status(400).json({
          success: false,
          message: 'Email and quizId are required'
        });
      }

      const pdfBuffer = await pdfService.generateReportPDF({
        email: decodeURIComponent(email),
        quizId,
        resultToken: token ? decodeURIComponent(token) : null
      });

      const name = email.split('@')[0];
      const filename = `IKSC_Bandhan_Report_${name}_${Date.now()}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      logger.error('❌ [PDF] Download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF report',
        error: error.message
      });
    }
  });

  // GET /api/quizzes/results - get results by email and quizId (MUST be before /:quizId route)
  router.get('/results', attemptController.getResultsByEmail.bind(attemptController));
  
  // Debug route to list available quizzes
  router.get('/list', async (req, res) => {
    try {
      // Return list of expected quizIds
      const availableQuizzes = [
        'divorce_conflict_v1',
        'pre_marriage_compat_v1',
        'happiness_index_v1',
        'pre_marriage_prep_v1',
        'senior_citizen_v1',
        'unemployed_career_v1',
        'career_school_v1'
      ];
      res.json({ success: true, quizzes: availableQuizzes });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET /api/quizzes/:quizId - fetch all questions & options
  router.get('/:quizId', quizController.getQuiz.bind(quizController));

  // POST /api/quizzes/:quizId/register - register user with name, email, phone
  router.post('/:quizId/register', attemptController.registerUser.bind(attemptController));

  // POST /api/quizzes/:quizId/answer - save one answer (partial; for autosave each Q)
  router.post('/:quizId/answer', attemptController.saveAnswer.bind(attemptController));

  // POST /api/quizzes/:quizId/finalize - submit all answers + user info (after Q15 form)
  router.post('/:quizId/finalize', attemptController.finalizeAttempt.bind(attemptController));

  return router;
};
