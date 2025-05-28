"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { useAuth } from "@/src/context/authContext"; 
import styles from "./questions.css";
import { CircleArrowRight, CircleArrowLeft } from "lucide-react";

function QuestionsContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId"); 
  const router = useRouter();
  const { user } = useAuth(); 
  const [questions, setQuestions] = useState([]);
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!testId) {
      setError("Тест не найден.");
      return;
    }

    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (test && test.selectedQuestions) {
      fetchQuestions();
    }
  }, [test]);

  
  const shuffleArray = (array) => {
    return array
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  };

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/student/test_access?testId=${testId}`);
      if (!response.ok) throw new Error("Ошибка при загрузке данных теста");
      const data = await response.json();

      if (!data || data.length === 0) {
        setError("Доступ к тесту не найден.");
        return;
      }

      const testData = data[0];
      if (!testData.test_accessId) {
        setError("Доступ к тесту не найден.");
        return;
      }

      setTest(testData);
    } catch (error) {
      setError("Не удалось загрузить данные теста.");
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/student/questions?testId=${testId}&selectedQuestions=${test?.selectedQuestions}`);
      if (!response.ok) throw new Error("Ошибка при загрузке вопросов");
      const data = await response.json();

      // Перемешиваем вопросы и их ответы
      const shuffledQuestions = data.map((question) => ({
        ...question,
        answers: shuffleArray(question.answers), // Перемешиваем ответы
      }));

      setQuestions(shuffleArray(shuffledQuestions)); // Перемешиваем вопросы
    } catch (error) {
      setError("Не удалось загрузить вопросы.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishTest = async () => {
    const allAnswered = questions.every((_, index) => answers[index] !== undefined);

    if (!allAnswered) {
      alert("Вы должны ответить на все вопросы перед завершением теста.");
      return;
    }

    if (!test || !test.test_accessId) {
      alert("Данные теста или доступ к тесту не загружены.");
      return;
    }

    const results = questions.map((question, index) => ({
      questionId: question.id,
      question: question.question,
      answers: question.answers,
      answer: answers[index],
      IsRight: question.answer === answers[index] ? 100 : 0,
      rightAnswer: question.answer,
      testId,
      test_accessId: test.test_accessId,
      studentName: user?.name || user?.displayName,
      studentId: user?.localId || user?.uid,
      groupId: user?.groupId,
      date: new Date().toISOString(),
    }));

    try {
      const response = await fetch(`/api/student/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });

      if (!response.ok) throw new Error("Ошибка при сохранении результатов");

      alert("Тест завершен! Ваши ответы сохранены.");
      router.push("/student/tests");
    } catch (error) {
      alert("Не удалось сохранить результаты.");
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (questions.length === 0) return <p>Вопросы не найдены.</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Вопрос {currentQuestionIndex + 1} из {questions.length}
      </h2>
      <p className={styles.question}>{currentQuestion.question}</p>
      <ul className={styles.answers}>
        {currentQuestion.answers.map((answer, index) => (
          <li
            key={index}
            className={`${styles.answer} ${answers[currentQuestionIndex] === answer ? styles.selected : ""}`}
            onClick={() => handleAnswerSelect(answer)}
            style={{
              fontWeight: answers[currentQuestionIndex] === answer ? "bold" : "normal",
            }}
          >
            {answer}
          </li>
        ))}
      </ul>
      <div className={styles.navigationButtons}>
        <CircleArrowLeft
          className={styles.button}
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        />
        {currentQuestionIndex < questions.length - 1 ? (
          <CircleArrowRight
            className={styles.button}
            onClick={handleNextQuestion}
            disabled={!answers[currentQuestionIndex]}
          />
        ) : (
          <button
            className='submit'
            onClick={handleFinishTest}
            disabled={!answers[currentQuestionIndex]}
          >
            Завершить тест
          </button>
        )}
      </div>
    </div>
  );
}
//vgbbgf
export default function QuestionsPage() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <QuestionsContent />
    </Suspense>
  );
}
