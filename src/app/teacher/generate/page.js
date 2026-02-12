"use client";

import React, { useEffect, useState } from "react";
import styles from "@/src/app/admin.module.css";
import { useAuth } from "@/src/context/authContext";
import ZapButton from "@/src/components/buttons/Zap";

const GeneratePage = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("Казахский");
  // const [model, setModel] = useState("gpt-3.5-turbo");
  const [numQuestions, setNumQuestions] = useState(3);
  const [description, setDescription] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.localId) {
      console.error("Пользователь не авторизован");
      setLoading(false);
      return;
    }
    fetchTests();
  }, [user?.localId]);

  const fetchTests = async () => {
    try {
      const response = await fetch(`/api/teacher/tests?teacherId=${user.localId}`);
      if (!response.ok) throw new Error("Ошибка при загрузке тестов");
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Ошибка при загрузке тестов:", error);
      setError("Не удалось загрузить тесты.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestSelect = (event) => {
    const test = tests.find((t) => t.id === event.target.value);
    setSelectedTest(test || null);
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedTest) {
      setError("Выберите тест.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generatequiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTest: selectedTest.name,
          description,
          numQuestions,
          model,
          language,
        }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        const errMsg = errBody?.message || (errBody && JSON.stringify(errBody)) || response.statusText || "Ошибка при генерации";
        throw new Error(errMsg);
      }
      const data = await response.json();

      // Преобразуем данные в нужный формат
      const formattedQuestions = data.questions.map((q, index) => ({
        id: `${selectedTest.id}-${index}`, // Генерируем уникальный ID
        question: q.questionText,
        answers: [q.answerText1, q.answerText2, q.answerText3, q.answerText4],
        answer: q[`answerText${q.isCorrect}`],
        testId: selectedTest.id,
      }));

      setQuizData(formattedQuestions);
    } catch (error) {
      console.error("Ошибка при генерации викторины:", error);
      setError(error?.message || String(error) || "Не удалось сгенерировать викторину.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAddQuestions = async () => {
    if (!quizData || !selectedTest) return;
  
    try {
      for (const question of quizData) {
        const response = await fetch(`/api/teacher/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(question), // Отправляем каждый вопрос как отдельный объект
        });
  
        if (!response.ok) {
          throw new Error("Ошибка при добавлении вопроса.");
        }
      }
  
      alert("Все вопросы успешно добавлены!");
      setQuizData(null); // Очищаем сгенерированные вопросы
    } catch (error) {
      console.error("Ошибка при добавлении вопросов:", error.message);
      setError("Не удалось добавить вопросы.");
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <form onSubmit={handleGenerateQuiz}>
        <div className={styles.adminHeader}>
          <h2>Редактирование вопросов c AI</h2>
          <div className={styles.adminFilters}>
            <select onChange={handleTestSelect} value={selectedTest?.id || ""} className={styles.adminInput}>
              <option value="" disabled>Выберите тест</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>{test.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.generateBlock}>
          <div className={styles.textareBlock}>
            <p>Введите список тем и/или разделов:</p>
            <textarea
              className={styles.adminInput}
              placeholder="Описание теста, разделы и подразделы"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className={styles.inputBlock}>
            <div>
              <p>Определите количество вопросов:</p>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                placeholder="Количество вопросов"
                className={styles.adminInput}
                min="1"
                required
              />
            </div>
            <div>
              <p>Выберите язык:</p>
              <select value={language} className={styles.adminInput} onChange={(e) => setLanguage(e.target.value)}>
                <option value="Казахский">Казахский</option>
                <option value="Русский">Русский</option>
                <option value="english">Английский</option>
              </select>
            </div>
            {/* <div>
              <p>Выберите модель:</p>
              <select value={model} className={styles.adminInput} onChange={(e) => setModel(e.target.value)}>
                <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
                <option value="gpt-4-turbo">GPT-4-turbo</option>
              </select>
            </div> */}
            <div>
              <ZapButton type="submit" disabled={!selectedTest || loading} />
            </div>
            {quizData && (
            <button onClick={handleConfirmAddQuestions}>
            Подтвердить добавление вопросов
            </button>
            )}
          </div>
        </div>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      {quizData && (
        <div className={styles.quizPreview}>
          <h3>Сгенерированные вопросы:</h3>
          <ul>
            {quizData.map((question, index) => (
              <li key={index}>
                <p><strong>{question.question}</strong></p>
                <ul>
                  {question.answers.map((answer, i) => (
                    <li key={i}>{answer}</li>
                  ))}
                </ul>
                <p>Правильный ответ: {question.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GeneratePage;