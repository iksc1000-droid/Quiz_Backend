import { Router } from 'express';
import { QuizController, AttemptController } from '../controllers/quiz.controller.js';

export const createQuizRoutes = (quizService, attemptService, scoringService, mailService) => {
  const router = Router();
  
  const quizController = new QuizController(quizService);
  const attemptController = new AttemptController(attemptService, scoringService, mailService, quizService);

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
