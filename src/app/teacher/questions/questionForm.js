"use client";

import React, { useEffect, useState } from "react";
import styles from "@/src/app/admin.module.css";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const QuestionForm = ({ mode, selectedQuestion, testId, onQuestionSaved }) => {
  const [formData, setFormData] = useState({
    type: "choice",
    question: "",
    answers: ["", "", "", ""],
    answer: "",
    testId: testId,
  });

  useEffect(() => {
    if (mode === "edit" && selectedQuestion) {
      setFormData({
        type: selectedQuestion.type || "choice",
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

    if (!formData.question.trim() || !formData.answer.trim() ||
      (formData.type === "choice" && formData.answers.some(a => !a.trim()))) {
      alert("Ошибка: Все поля должны быть заполнены.");
      return;
    }
    if (formData.type === "choice" && !formData.answers.includes(formData.answer)) {
      alert("Ошибка: Правильный ответ должен быть в списке вариантов.");
      return;
    }

    try {
      if (mode === "edit" && selectedQuestion?.id) {
        const questionRef = doc(db, "Questions", selectedQuestion.id);
        await updateDoc(questionRef, formData);
      } else {
        await addDoc(collection(db, "Questions"), { ...formData, testId });
      }
      onQuestionSaved();
    } catch (error) {
      console.error("Ошибка при сохранении вопроса:", error);
    }
  };

  return (
    <div className={styles.adminFormContainer}>
      <h3>{mode === "edit" ? "Редактировать вопрос" : "Добавить новый вопрос"}</h3>
      <form className={styles.form} onSubmit={handleSaveQuestion}>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className={styles.adminInput}
        >
          <option value="choice">Выбор из нескольких вариантов</option>
          <option value="text">Ввод текста / короткий ответ</option>
        </select>
        <input
          type="text"
          name="question"
          value={formData.question}
          onChange={handleInputChange}
          placeholder="Текст вопроса"
          className={styles.adminInput}
        />
        {formData.type === "text" ? (
          <input
            type="text"
            name="answer"
            value={formData.answer}
            onChange={handleInputChange}
            placeholder="Правильный ответ"
            className={styles.adminInput}
          />
        ) : null}
        {formData.type === "choice" ? (
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
        ) : null}
        <button className={styles.submit} type="submit">
          {mode === "edit" ? "Сохранить изменения" : "Добавить вопрос"}
        </button>
      </form>
    </div>
  );
};

export default QuestionForm;
