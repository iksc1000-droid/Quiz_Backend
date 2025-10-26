export const flattenQuiz = (quiz) => {
  const flattened = [];
  
  quiz.sections.forEach(section => {
    section.questions.forEach(question => {
      flattened.push({
        questionId: question.questionId,
        sectionId: section.sectionId,
        question: question.question,
        options: question.options,
        categoryTag: question.categoryTag,
        weightMapping: question.weightMapping
      });
    });
  });
  
  return flattened;
};
