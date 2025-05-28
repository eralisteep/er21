"use client";

import React, { useEffect, useState } from "react";
import styles from "@/src/app/admin.module.css";
import { useAuth } from "@/src/context/authContext";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const QuestionForm = ({ mode, selectedQuestion, testId, onQuestionSaved }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    question: "",
    answers: ["", "", "", ""], // 4 варианта ответа
    answer: "", // Правильный ответ (сам текст, а не индекс)
    testId: testId, // ID теста
  });

  useEffect(() => {
    if (mode === "edit" && selectedQuestion) {
      setFormData({
        question: selectedQuestion.question || "",
        answers: selectedQuestion.answers || ["", "", "", ""],
        answer: selectedQuestion.answer || "",
        testId: selectedQuestion.testId || testId,
      });
    }
  }, [mode, selectedQuestion, testId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...formData.answers];
    updatedAnswers[index] = value;
    setFormData({ ...formData, answers: updatedAnswers });
  };

  

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
  
    // Проверка данных перед сохранением
    if (!formData.question.trim() || !formData.answer.trim() || formData.answers.some(a => !a.trim())) {
      alert("Ошибка: Все поля должны быть заполнены.");
      return;
    }
    if (!formData.answers.includes(formData.answer)) {
      console.error("Ошибка: Правильный ответ должен быть в списке вариантов.");
      return;
    }
  
    try {
      if (mode === "edit" && selectedQuestion?.id) {
        // Обновление существующего вопроса
        const questionRef = doc(db, "Questions", selectedQuestion.id);
        await updateDoc(questionRef, formData);
      } else {
        // Добавление нового вопроса, вручную добавляем testId
        await addDoc(collection(db, "Questions"), { ...formData, testId });
      }
  
      onQuestionSaved(); // Колбэк для обновления списка
    } catch (error) {
      console.error("Ошибка при сохранении вопроса:", error);
    }
  };
  

  return (
    <div className={styles.adminFormContainer}>
      <h3>{mode === "edit" ? "Редактировать вопрос" : "Добавить новый вопрос"}</h3>
      <form className={styles.form} onSubmit={handleSaveQuestion}>
        <input
          type="text"
          name="question"
          value={formData.question}
          onChange={handleInputChange}
          placeholder="Текст вопроса"
          className={styles.adminInput}
        />

        <div>
          {formData.answers.map((answer, index) => (
            <div key={index} className={styles.answerInputContainer}>
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder={`Вариант ${index + 1}`}
                className={styles.adminInput}
              />
              <input
                type="radio"
                name="answer"
                value={answer}
                checked={formData.answer === answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button className={styles.submit} type="submit">
          {mode === "edit" ? "Сохранить изменения" : "Добавить вопрос"}
        </button>
      </form>
    </div>
  );
};

export default QuestionForm;
