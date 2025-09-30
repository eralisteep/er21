"use client";

import React, { useEffect, useState } from 'react';
import styles from '@/src/app/admin.module.css';

const Question = ({ selectedQuestion }) => {
  if (!selectedQuestion) return <p>Выберите вопрос для просмотра.</p>;

  return (
    <div 
        className={styles.questionDetails}
        style={{
            width: "647px" // Выделяем правильный ответ
        }}
      >
      <h3>{selectedQuestion.question}</h3>
      <h4>Тип вопроса: {selectedQuestion.type}</h4>
      {selectedQuestion.type === 'text' ? (
        <p><i>Правильный ответ: {selectedQuestion.answer}</i></p>
      ) : null}
      {selectedQuestion.type === 'choice' || selectedQuestion.type === undefined || selectedQuestion.type === null ? (
      <ul>
        {selectedQuestion.answers.map((answer, index) => (
          <li
            key={index}
            style={{
              fontWeight: answer === selectedQuestion.answer ? "bold" : "normal", // Выделяем правильный ответ
            }}
          >
            {answer}
          </li>
        ))}
      </ul>
    ) : null}
    </div>
  );
};

export default Question;
