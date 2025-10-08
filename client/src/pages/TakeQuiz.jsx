import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getQuizDetails, submitQuiz, resetQuiz } from '../features/student/studentSlice';

function TakeQuiz() {
  const { id } = useParams(); // Get quiz ID from URL
  const dispatch = useDispatch();

  const { currentQuiz, quizResult, isLoading } = useSelector((state) => state.student);
  const [answers, setAnswers] = useState({}); // Stores answers as { questionId: selectedOptionId }

  useEffect(() => {
    dispatch(getQuizDetails(id));
    // Cleanup function to reset quiz state when leaving the page
    return () => {
      dispatch(resetQuiz());
    };
  }, [dispatch, id]);

  const handleOptionChange = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      selectedOptionId: answers[questionId],
    }));
    dispatch(submitQuiz({ quizId: id, answers: formattedAnswers }));
  };

  if (isLoading || !currentQuiz) {
    return <p>Loading Quiz...</p>;
  }

  // If quiz is submitted, show the result view
  if (quizResult) {
    return (
      <div className='container'>
        <section className='heading'>
          <h1>Quiz Complete!</h1>
          <p>Your Score: {quizResult.score} / {quizResult.totalQuestions}</p>
          <Link to="/" className='btn'>Back to Dashboard</Link>
        </section>
      </div>
    );
  }

  // Otherwise, show the quiz questions
  return (
    <div className='container'>
      <section className='heading'>
        <h1>{currentQuiz.quiz.title}</h1>
      </section>
      <form onSubmit={handleSubmit} className='form'>
        {currentQuiz.questions.map((q, index) => (
          <div key={q._id} style={{marginBottom: '20px'}}>
            <h4>{index + 1}. {q.text}</h4>
            {q.options.map(opt => (
              <div key={opt._id} className='form-group'>
                <input
                  type="radio"
                  name={q._id}
                  id={opt._id}
                  value={opt._id}
                  onChange={() => handleOptionChange(q._id, opt._id)}
                  checked={answers[q._id] === opt._id}
                />
                <label htmlFor={opt._id} style={{marginLeft: '10px'}}>{opt.text}</label>
              </div>
            ))}
          </div>
        ))}
        <button type='submit' className='btn'>Submit Quiz</button>
      </form>
    </div>
  );
}

export default TakeQuiz;