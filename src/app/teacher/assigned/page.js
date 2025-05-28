"use client";

import { useState, useEffect } from "react";
import styles from "@/src/app/admin.module.css";
import AddButton from "@/src/components/buttons/AddButton";
import DeleteButton from "@/src/components/buttons/DeleteButton";

export default function TestAccessPage() {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const today = new Date().toISOString().split("T")[0];
  const [message, setMessage] = useState("");
  const [tests, setTests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [testAccess, setTestAccess] = useState([]);
  const [formData, setFormData] = useState({
    date: today,
    startTime: "08:00",
    endTime: "17:00",
    testId: "",
    groupId: "",
    testName: "",
    name: "", // Добавлено поле для имени доступа
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const testsResponse = await fetch("/api/teacher/tests");
        const groupsResponse = await fetch("/api/teacher/groups");
        const accessResponse = await fetch("/api/teacher/test_access");

        if (!testsResponse.ok || !groupsResponse.ok || !accessResponse.ok) {
          throw new Error("Ошибка при загрузке данных");
        }

        const testsData = await testsResponse.json();
        const groupsData = await groupsResponse.json();
        const accessData = await accessResponse.json();

        setTests(testsData);
        setGroups(groupsData);
        setTestAccess(accessData);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setMessage(`Ошибка: ${error.message}`);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.testId || !formData.groupId || !formData.date || !formData.startTime || !formData.endTime || !formData.name) {
        alert("Заполните все поля");
        return;
      }

      if (selectedQuestions.length === 0) {
        alert("Выберите хотя бы один вопрос");
        return;
      }

      const selectedTest = tests.find((test) => test.id === formData.testId);
      const testName = selectedTest ? selectedTest.name : "Неизвестный тест";

      const response = await fetch("/api/teacher/test_access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, testName, selectedQuestions }),
      });

      if (!response.ok) throw new Error("Ошибка при добавлении доступа");

      const newAccess = await response.json();
      setTestAccess([...testAccess, { id: newAccess.id, ...formData, testName, selectedQuestions }]);
      setNullFormData();
      alert("Доступ открыт");
    } catch (error) {
      setMessage(`Ошибка: ${error.message}`);
    }
  };

  const setNullFormData = () => {
    setFormData({
      date: today,
      startTime: "08:00",
      endTime: "17:00",
      testId: "",
      groupId: "",
      testName: "",
      name: "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/teacher/test_access/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Ошибка при удалении доступа");

      setTestAccess(testAccess.filter((item) => item.id !== id));
      setNullFormData();
    } catch (error) {
      setMessage(`Ошибка удаления: ${error.message}`);
    }
  };

  const handleTestChange = async (testId) => {
    setFormData({ ...formData, testId });
    setSelectedQuestions([]); // Сброс выбранных вопросов
  
    if (testId) {
      try {
        const response = await fetch(`/api/teacher/questions?testId=${testId}`);
        if (!response.ok) throw new Error("Ошибка при загрузке вопросов");
        const data = await response.json();
        setQuestions(data);

        // Устанавливаем все вопросы как выбранные
        const allQuestionIds = data.map((question) => question.id);
        setSelectedQuestions(allQuestionIds);
      } catch (error) {
        console.error("Ошибка при загрузке вопросов:", error);
        setQuestions([]);
      }
    } else {
      setQuestions([]);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminAssignedSidebar}>
        <div className={styles.adminSidebarHeader}>
          <div>
            <strong>Список тестов преподавателя</strong>
          </div>
        </div>

        <form className={styles.adminTestAssignedContainer} onSubmit={handleSubmit}>
          <input
            className={styles.adminInput}
            type="text"
            placeholder="Введите имя доступа"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <select
            className={styles.adminInput}
            value={formData.testId}
            onChange={(e) => handleTestChange(e.target.value)}
          >
            <option value="">Выберите тест</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name}
              </option>
            ))}
          </select>
          <select
            className={styles.adminInput}
            value={formData.groupId}
            onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
          >
            <option value="">Выберите группу</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <input
            className={styles.adminInput}
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <input
            className={styles.adminInput}
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
          <input
            className={styles.adminInput}
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
          <AddButton type="submit" />
        </form>
        <div className={styles.adminTestAccessList}>
          <h3>Доступные тесты</h3>
          <ul>
            {testAccess.map((item) => {
              const test = tests.find((test) => test.id === item.testId);
              const group = groups.find((group) => group.id === item.groupId);

              return (
                <li key={item.id} className={styles.adminTestAccessItem}>
                  <span>
                    {item.date} | {item.startTime} - {item.endTime} | Имя доступа: {item.name} | Тест: {test ? test.name : "Не найден"} | Группа:{" "}
                    {group ? group.name : "Не найдена"}
                  </span>
                  <DeleteButton onClick={() => handleDelete(item.id)} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {questions.length > 0 && (
        <div className={styles.questionsContainer}>
          <h4>Выберите вопросы:</h4>
          <ul>
            {questions.map((question) => (
              <li key={question.id}>
                <label>
                  <input
                    type="checkbox"
                    value={question.id}
                    checked={selectedQuestions.includes(question.id)}
                    onChange={(e) => {
                      const questionId = e.target.value;
                      setSelectedQuestions((prev) =>
                        e.target.checked
                          ? [...prev, questionId]
                          : prev.filter((id) => id !== questionId)
                      );
                    }}
                  />
                  {question.question}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}