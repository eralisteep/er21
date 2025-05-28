"use client";

import React, { useEffect, useState } from "react";
import styles from "@/src/app/admin.module.css";
import { useAuth } from "@/src/context/authContext";
import QuestionForm from "./questionForm";
import Question from "./question";
import AddButton from "@/src/components/buttons/AddButton";
import EditButton from "@/src/components/buttons/EditButton";
import DeleteButton from "@/src/components/buttons/DeleteButton";
import ZapButton from "@/src/components/buttons/Zap";
import Link from "next/link";
import * as XLSX from "xlsx"; // Для работы с Excel
import { saveAs } from "file-saver"; // Для сохранения файлов
import { Document, Packer, Paragraph, TextRun } from "docx"; // Для работы с Word
import { Download } from "lucide-react";

const Questions = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [mode, setMode] = useState("show");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.localId) {
      console.error(user);
      console.error("Пользователь не авторизован");
      setLoading(false);
      return;
    }
    fetchTests();
  }, [user?.localId]);

  useEffect(() => {
    if (selectedTest) {
      fetchQuestions(selectedTest.id);
    }
  }, [selectedTest]);

  const fetchTests = async () => {
    try {
      const response = await fetch(`/api/teacher/tests?teacherId=${user.localId}`);
      if (!response.ok) throw new Error("Ошибка при загрузке тестов");
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Ошибка при загрузке тестов:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (testId) => {
    try {
      const response = await fetch(`/api/teacher/questions?testId=${testId}`);
      if (!response.ok) throw new Error("Ошибка при загрузке вопросов");
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Ошибка при загрузке вопросов:", error);
    }
  };

  const handleTestSelect = (event) => {
    const test = tests.find((t) => t.id === event.target.value);
    setSelectedTest(test);
    setSelectedQuestion(null);
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
  };

  const handleQuestionSaved = () => {
    if (selectedTest) {
      fetchQuestions(selectedTest.id);
    }
    setMode("show");
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/teacher/questions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Ошибка при удалении вопроса");
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id)); // Обновление локального состояния
    } catch (error) {
      console.error(`Ошибка удаления: ${error.message}`);
    }
  };

  const downloadExcel = () => {
    if (!selectedTest || questions.length === 0) {
      alert("Выберите тест и убедитесь, что есть вопросы.");
      return;
    }
  
    const data = questions.map((q, index) => ({
      "№": index + 1,
      Вопрос: q.question,
      Ответы: q.answers.join(", "),
      // "Правильный ответ": q.answer,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    // Вычисляем ширину столбцов на основе содержимого
    const columnWidths = Object.keys(data[0]).map((key) => {
      const maxLength = Math.max(
        ...data.map((row) => (row[key] ? row[key].toString().length : 0)), // Длина текста в каждой ячейке
        key.length // Длина заголовка
      );
      return { wch: maxLength + 2 }; // Добавляем небольшой отступ
    });
  
    worksheet["!cols"] = columnWidths; // Устанавливаем ширину столбцов
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedTest.name);
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${selectedTest.name}.xlsx`);
  };
  
  const downloadWord = async () => {
    if (!selectedTest || questions.length === 0) {
      alert("Выберите тест и убедитесь, что есть вопросы.");
      return;
    }
  
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Тест: ${selectedTest.name}`,
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            ...questions.flatMap((q, index) => {
              const answerLabels = ["а.", "б.", "в.", "г."]; // Метки для ответов
  
              return [
                // Индекс и вопрос на одной строке
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. ${q.question}`,
                      bold: true,
                    }),
                  ],
                }),
                // Каждый вариант ответа на своей строке с меткой
                ...q.answers.map((answer, i) =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${answerLabels[i] || ""} ${answer}`, // Добавляем метку перед ответом
                      }),
                    ],
                  })
                ),
                // Правильный ответ на отдельной строке
                // new Paragraph({
                //   children: [
                //     new TextRun({
                //       text: `Правильный ответ: ${q.answer}`,
                //       italics: true,
                //       bold: true,
                //     }),
                //   ],
                // }),
                // Добавляем пустую строку между вопросами
                new Paragraph({}),
              ];
            }),
          ],
        },
      ],
    });
  
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${selectedTest.name}.docx`);
  };
  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <div className={styles.adminHeader}>
        <h2>Редактирование вопросов</h2>
        <div className={styles.adminFilters}>
          <select
            onChange={handleTestSelect}
            value={selectedTest?.id || ""}
            className={styles.adminInput}
          >
            <option value="" disabled>
              Выберите тест
            </option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTest && (
        <div className={styles.adminContainer}>
          <div className={styles.buttonGroup}>
            <p onClick={downloadExcel} className={styles.submit}>Скачать в Excel</p>
            <p onClick={downloadWord} className={styles.submit}>Скачать в Word</p>
          </div>

          <div className={[styles.adminSidebar, styles.adminQuestionSideBar].join(" ")}>
            <div className={styles.adminSidebarHeader}>
              <div>
                <strong>Вопросы теста: {selectedTest.name}</strong>
              </div>
              <div className={styles.buttonGroup}>
                <Link href="/teacher/generate">
                  <ZapButton />
                </Link>

                <AddButton onClick={() => setMode("append")} />
              </div>
            </div>
            <ul className={styles.list}>
              {questions.map((question) => (
                <li
                  key={question.id}
                  className={[styles.listItem, styles.listQuestion].join(" ")}
                  onClick={() => handleQuestionSelect(question)}
                  onMouseOver={() => setSelectedQuestion(question)}
                >
                  <p>{question.question}</p>

                  <div className={styles.buttonGroup}>
                    <EditButton
                      onClick={() => {
                        setMode("edit");
                      }}
                    />
                    <DeleteButton
                      onClick={() => {
                        handleDelete(question.id);
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {mode === "show" && <Question selectedQuestion={selectedQuestion} />}

          {(mode === "append" || mode === "edit") && (
            <QuestionForm
              mode={mode}
              selectedQuestion={selectedQuestion}
              testId={selectedTest?.id} // Передаем testId из selectedTest
              onQuestionSaved={handleQuestionSaved}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Questions;