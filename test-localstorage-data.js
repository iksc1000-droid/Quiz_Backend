// Test script to check what data format is expected
console.log('🔍 Testing localStorage data format...')

// Simulate the data structure that should be in localStorage
const mockQuizAnswers = [
  {
    questionId: "A1",
    selectedOption: "A1a", 
    score: 2,
    discMapping: "D",
    wpdMapping: "Political"
  },
  {
    questionId: "A2", 
    selectedOption: "A2b",
    score: 1,
    discMapping: "I", 
    wpdMapping: "Economic"
  },
  {
    questionId: "A3",
    selectedOption: "A3c",
    score: 0,
    discMapping: "S",
    wpdMapping: "Altruistic"
  }
]

console.log('📋 Mock quiz answers:', JSON.stringify(mockQuizAnswers, null, 2))

// Test the API processing logic
const answers = Array.isArray(mockQuizAnswers) ? mockQuizAnswers : Object.entries(mockQuizAnswers).map(([questionId, answer]) => ({
  questionId: parseInt(questionId),
  optionKey: 'a',
  optionValue: Array.isArray(answer) ? answer[0] : answer
}))

console.log('🔄 Processed answers:', answers)

// Test individual answer processing
for (const answer of answers) {
  const questionId = typeof answer.questionId === 'string' ? 
    parseInt(answer.questionId.replace(/[^\d]/g, '')) : 
    answer.questionId
  
  const optionKey = answer.selectedOption || answer.optionKey || 'a'
  const optionValue = answer.selectedOption || answer.optionValue || 'default'
  
  console.log(`Question ${questionId}:`, { optionKey, optionValue })
}

console.log('✅ Test completed')



