"use client";
// 786
import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/authContext"; // Для получения данных учителя
import styles from "./results.module.css";
import { ArrowBigDown, ArrowBigUp, Search } from "lucide-react";
import * as XLSX from "xlsx"; // Для работы с Excel
import { saveAs } from "file-saver"; // Для сохранения файлов
import { Document, Packer, Paragraph, TextRun } from "docx"; // Для работы с Word
import { Download } from "lucide-react"; // Иконка для скачивания

export default function ResultsPage() {
  const { user } = useAuth(); // Получаем данные текущего пользователя
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testAccesses, setTestAccesses] = useState([]); // Список всех test_access
  const [filteredTestAccesses, setFilteredTestAccesses] = useState([]); // Фильтрованные test_access
  const [selectedTestAccess, setSelectedTestAccess] = useState(null); // Выбранный test_access
  const [groups, setGroups] = useState([]); // Список групп
  const [selectedGroup, setSelectedGroup] = useState(null); // Выбранная группа
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null); // Выбранный ученик
  const [results, setResults] = useState([]);
  const [studentResults, setStudentResults] = useState([]); // Ответы выбранного ученика
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortType, setSortType] = useState("alphabetical");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchTests();
    fetchTestAccesses();
    fetchGroups();
    fetchStudents();
    fetchResults();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/tests`);
      if (!response.ok) throw new Error("Ошибка при загрузке тестов");
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Ошибка загрузки тестов:", error);
      setError("Не удалось загрузить тесты.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestAccesses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/test_access`);
      if (!response.ok) throw new Error("Ошибка при загрузке доступа тестов");
      const data = await response.json();
      setTestAccesses(data);
    } catch (error) {
      console.error("Ошибка загрузки доступа тестов:", error);
      setError("Не удалось загрузить доступы тестов.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/groups`);
      if (!response.ok) throw new Error("Ошибка при загрузке групп");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Ошибка загрузки групп:", error);
      setError("Не удалось загрузить группы.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (groupId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/students?groupId=${groupId}`);
      if (!response.ok) throw new Error("Ошибка при загрузке студентов");
      const data = await response.json();
      setStudents(data.students);
    } catch (error) {
      console.error("Ошибка загрузки студентов:", error);
      setError("Не удалось загрузить студентов.");
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (testId, groupId, studentId, testAccessId) => {
    try {
      setLoading(true);

      let endpoint = `/api/teacher/results?`;
      if (testId) endpoint += `testId=${testId}&`;
      if (groupId) endpoint += `groupId=${groupId}&`;
      if (studentId) endpoint += `studentId=${studentId}&`;
      if (testAccessId) endpoint += `testAccessId=${testAccessId}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Ошибка при загрузке результатов");
      const data = await response.json();

      setResults(data);
    } catch (error) {
      console.error("Ошибка загрузки результатов:", error);
      setError("Не удалось загрузить результаты.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestSelect = (testId) => {
    setSelectedTest(testId);
    setSelectedTestAccess(null); // Сбрасываем выбранный доступ

    // Фильтруем доступы для выбранного теста
    const filteredAccesses = testAccesses.filter(
      (access) => access.testId === testId
    );
    setFilteredTestAccesses(filteredAccesses);
    fetchResults(testId, selectedGroup, selectedStudent, selectedTestAccess);
  };

  const handleTestAccessSelect = (testAccessId) => {
    setSelectedTestAccess(testAccessId);
    fetchResults(selectedTest, selectedGroup, selectedStudent, testAccessId);
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
    fetchStudents(groupId);
    setSelectedStudent(null); // Сбрасываем выбранного студента
    fetchResults(selectedTest, groupId, selectedStudent, selectedTestAccess);
  };
  
  const handleStudentSelect = async (studentId) => {
    setSelectedStudent(studentId);

    // Загружаем ответы выбранного ученика
    await fetchResults(selectedTest, selectedGroup, studentId, selectedTestAccess);
    const studentFilteredResults = results.filter(
      (result) => result.studentId === studentId
    );
    setStudentResults(studentFilteredResults);
    fetchResults(selectedTest, selectedGroup, studentId, selectedTestAccess);
  };

  const handleStudentClick = async (studentId) => {
    setSelectedStudent(studentId);

    // Загружаем ответы выбранного ученика
    await fetchResults(selectedTest, selectedGroup, studentId, selectedTestAccess);
    const studentFilteredResults = results.filter(
      (result) => result.studentId === studentId
    );
    setStudentResults(studentFilteredResults);
    fetchResults(selectedTest, selectedGroup, studentId, selectedTestAccess);
  };

  const handleResults = () => {
    fetchResults(selectedTest, selectedGroup, selectedStudent, selectedTestAccess);
    fetchStudents(selectedGroup);
  };

  const calculateCorrectPercentage = (results) => {
    if (results.length === 0) return 0;
    const correctAnswers = results.filter((result) => result.IsRight === 100).length;
    return ((correctAnswers / results.length) * 100).toFixed(2);
  };

  const sortStudents = (students) => {
    const sortedStudents = [...students];
    switch (sortType) {
      case "lastModified":
        sortedStudents.sort((a, b) => {
          const aLast = results
            .filter((r) => r.studentId === a.id)
            .reduce((latest, r) => (new Date(r.date) > new Date(latest) ? r.date : latest), null);
      
          const bLast = results
            .filter((r) => r.studentId === b.id)
            .reduce((latest, r) => (new Date(r.date) > new Date(latest) ? r.date : latest), null);
      
          if (!aLast && !bLast) return 0; // Если у обоих нет результатов
          if (!aLast) return 1; // Если у "a" нет результатов, он идет ниже
          if (!bLast) return -1; // Если у "b" нет результатов, он идет ниже
      
          return new Date(bLast) - new Date(aLast); // Сортировка по убыванию даты
        });
        break;
      case "correctPercentage":
        sortedStudents.sort((a, b) => {
          const aResults = results.filter((result) => result.studentId === a.id);
          const bResults = results.filter((result) => result.studentId === b.id);
          return calculateCorrectPercentage(bResults) - calculateCorrectPercentage(aResults);
        });
        break;
      case "alphabetical":
        sortedStudents.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    if (sortOrder === "desc") {
      sortedStudents.reverse();
    }
    return sortedStudents;
  };

  const downloadExcel = async () => {
    if (!selectedGroup && !selectedTest && !selectedTestAccess && !selectedStudent) {
      alert("Выберите хотя бы один параметр для скачивания.");
      return;
    }
  
    try {
      let data = [];
      if (selectedGroup && !selectedTest && !selectedTestAccess && !selectedStudent) {
        // Если выбрана только группа
        data = students.map((student) => {
          const studentResults = results.filter((result) => result.studentId === student.id);
          const averageScore = calculateCorrectPercentage(studentResults);
          return {
            Ученик: student.name,
            "Средний балл": `${averageScore}%`,
          };
        });
      } else if (selectedTestAccess && selectedGroup && !selectedStudent) {
        // Если выбраны группа и доступ
        data = students.map((student) => {
          const accessResults = results.filter(
            (result) => result.test_accessId === selectedTestAccess && result.groupId === selectedGroup && result.studentId === student.id
          );
          const averageScore = calculateCorrectPercentage(accessResults);
          return {
            студент: student.name,
            "Средний балл": `${averageScore}%`,
          };
        });
      } else if (selectedTest && selectedStudent && !selectedTestAccess) {
        // Если выбраны тест и ученик
        const groupAccesses = testAccesses.filter((access) => access.groupId === selectedGroup);
        data = groupAccesses.map((access) => {
          const accessResults = results.filter(
            (result) => result.test_accessId === access.id && result.studentId === selectedStudent && result.testId === selectedTest
          );
          const averageScore = calculateCorrectPercentage(accessResults);
          return {
            Доступ: access.name || `Доступ ${access.id}`,
            "Средний балл": `${averageScore}%`,
          };
        });
      } else if (selectedStudent && !selectedTest && !selectedTestAccess) {
        // Если выбран только ученик
        data = tests.map((test) =>{
          const studentResults = results.filter(
            (result) => result.studentId === selectedStudent && result.testId === test.id
          );
          const averageScore = calculateCorrectPercentage(studentResults);
          return {
            Тест: test.name,
            "Средний балл": `${averageScore}%`,
          };
        });
      } else if (selectedGroup && selectedTest && !selectedTestAccess && !selectedStudent) {
        // Если выбраны группа и тест
        data = students.map((student) => {
          const studentResults = results.filter(
            (result) => result.studentId === student.id && result.testId === selectedTest
          );
          const averageScore = calculateCorrectPercentage(studentResults);
          return {
            Ученик: student.name,
            "Средний балл по тесту": `${averageScore}%`,
          };
        });
      } else if (selectedTest && !selectedGroup && !selectedTestAccess) {
        // Если выбран только тест
        data = testAccesses.map((access) => {
          const accessResults = results.filter((result) => result.test_accessId === access.id);
          const averageScore = calculateCorrectPercentage(accessResults);
          return {
            Доступ: access.name || `Доступ ${access.id}`,
            "Средний балл по доступу": `${averageScore}%`,
          };
        });
      } else if (selectedTestAccess && !selectedStudent) {
        // Если выбран доступ
        data = students.map((student) => {
          const studentResults = results.filter(
            (result) => result.studentId === student.id && result.test_accessId === selectedTestAccess
          );
          const averageScore = calculateCorrectPercentage(studentResults);
          return {
            Ученик: student.name,
            "Средний балл по доступу": `${averageScore}%`,
          };
        });
      } else if (selectedTestAccess && selectedStudent) {
        // Если выбраны доступ и ученик 
        const studentResults = results.filter(
          (result) => result.studentId === selectedStudent && result.test_accessId === selectedTestAccess
        );
        data = studentResults.map((result, index) => ({
          "№": index + 1,
          Вопрос: result.question,
          "Ответ ученика": result.answer,
          Ответы: Array.isArray(result.answers) ? result.answers.join(", ") : "Нет данных",
          Правильность: result.IsRight === 100 ? "Правильно" : "Неправильно",
        }));
      }
  
      if (data.length === 0) {
        alert("Нет данных для скачивания.");
        return;
      }
  
      // Генерация Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Результаты");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const excelBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(excelBlob, "Результаты.xlsx");
    } catch (error) {
      console.error("Ошибка при скачивании Excel:", error);
      alert("Произошла ошибка при скачивании Excel.");
    }
  };
  
  const downloadWord = async () => {
    if (!selectedGroup && !selectedTest && !selectedTestAccess && !selectedStudent) {
      alert("Выберите хотя бы один параметр для скачивания.");
      return;
    }
  
    try {
      let data = [];
      if (selectedGroup && !selectedTest && !selectedTestAccess && !selectedStudent) {
        // Если выбрана только группа
        data = students.map((student) => {
          const studentResults = results.filter((result) => result.studentId === student.id);
          const averageScore = calculateCorrectPercentage(studentResults);
          return {
            Ученик: student.name,
            "Средний балл": `${averageScore}%`,
          };
        });
      } else if (selectedTestAccess && selectedGroup && !selectedStudent) {
        // Если выбраны группа и доступ
        data = students.map((student) => {
          const accessResults = results.filter(
            (result) => result.test_accessId === selectedTestAccess && result.groupId === selectedGroup && result.studentId === student.id
          );
          const averageScore = calculateCorrectPercentage(accessResults);
          return {
            студент: student.name,
            "Средний балл": `${averageScore}%`,
          };
        });
      } else if (selectedTest && selectedStudent && !selectedTestAccess) {
        // Если выбраны тест и ученик
        const groupAccesses = testAccesses.filter((access) => access.groupId === selectedGroup);
        data = groupAccesses.map((access) => {
          const accessResults = results.filter(
            (result) => result.test_accessId === access.id && result.studentId === selectedStudent && result.testId === selectedTest
          );
          const averageScore = calculateCorrectPercentage(accessResults);
          return {
            Доступ: access.name || `Доступ ${access.id}`,
            "Средний балл": `${averageScore}%`,
          };
        });
      } else if (selectedStudent && !selectedTest && !selectedTestAccess) {
        // Если выбран только ученик
        data = tests.map((test) =>{
          const studentResults = results.filter(
            (result) => result.studentId === selectedStudent && result.testId === test.id
          );
          const averageScore = calculateCorrectPercentage(studentResults);
          return {
            Тест: test.name,
            "Средний балл": `${averageScore}%`,
          };
        });
      } else if (selectedGroup && selectedTest && !selectedTestAccess && !selectedStudent) {
        // Если выбраны группа и тест
        data = students.map((student) => {
          const studentResults = results.filter(
            (result) => result.studentId === student.id && result.testId === selectedTest
          );
          const averageScore = calculateCorrectPercentage(studentResults);
          return {
            Ученик: student.name,
            "Средний балл по тесту": `${averageScore}%`,
          };
        });
      } else if (selectedTest && !selectedGroup && !selectedTestAccess) {
        // Если выбран только тест
        data = testAccesses.map((access) => {
          const accessResults = results.filter((result) => result.test_accessId === access.id);
          const averageScore = calculateCorrectPercentage(accessResults);
          return {
            Доступ: access.name || `Доступ ${access.id}`,
            "Средний балл по доступу": `${averageScore}%`,
          };
        });
      } else if (selectedTestAccess && !selectedStudent) {
        // Если выбран доступ
        data = students.map((student) => {
          const studentResults = results.filter(
            (result) => result.studentId === student.id && result.test_accessId === selectedTestAccess
          );
          const averageScore = calculateCorrectPercentage(studentResults);
          return {
            Ученик: student.name,
            "Средний балл по доступу": `${averageScore}%`,
          };
        });
      } else if (selectedTestAccess && selectedStudent) {
        // Если выбраны доступ и ученик
        const studentResults = results.filter(
          (result) => result.studentId === selectedStudent && result.test_accessId === selectedTestAccess
        );
        data = studentResults.map((result, index) => ({
          "№": index + 1,
          Вопрос: result.question,
          "Ответ ученика": result.answer,
          Ответы: Array.isArray(result.answers) ? result.answers.join(", ") : "Нет данных",
          Правильность: result.IsRight === 100 ? "Правильно" : "Неправильно",
        }));
      }
  
      if (data.length === 0) {
        alert("Нет данных для скачивания.");
        return;
      }
  
      // Генерация Word
      const doc = new Document({
        sections: [
          {
            children: data.map((row) =>
              new Paragraph({
                children: Object.entries(row).map(
                  ([key, value]) =>
                    new TextRun({
                      text: `${key}: ${value}`,
                      break: 1,
                    })
                ),
              })
            ),
          },
        ],
      });
      const wordBuffer = await Packer.toBlob(doc);
      saveAs(wordBuffer, "Результаты.docx");
    } catch (error) {
      console.error("Ошибка при скачивании Word:", error);
      alert("Произошла ошибка при скачивании Word.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Результаты тестов</h1>

      <div className={styles.selection}>
        <div className={styles.section}>
          <h2>Выберите тест</h2>
          <select
            className={styles.select}
            onChange={(e) => handleTestSelect(e.target.value)}
            value={selectedTest || ""}
          >
            <option className={styles.option} value="">
              Выберите тест
            </option>
            {tests.map((test) => (
              <option className={styles.option} key={test.id} value={test.id}>
                {test.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <h2>Выберите группу</h2>
          <select
            className={styles.select}
            onChange={(e) => handleGroupSelect(e.target.value)}
            value={selectedGroup || ""}
          >
            <option className={styles.option} value="">
              Выберите группу
            </option>
            {groups.map((group) => (
              <option className={styles.option} key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <h2>Выберите доступ</h2>
          <select
            className={styles.select}
            onChange={(e) => handleTestAccessSelect(e.target.value)}
            value={selectedTestAccess || ""}
          >
            <option className={styles.option} value="">
              Выберите доступ
            </option>
            {filteredTestAccesses.map((access) => (
              <option className={styles.option} key={access.id} value={access.id}>
                {access.name || `Доступ ${access.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <h2>Выберите ученика</h2>
          <select
            className={styles.select}
            onChange={(e) => handleStudentSelect(e.target.value)}
            value={selectedStudent || ""}
          >
            <option className={styles.option} value="">
              Выберите ученика
            </option>
            {students.map((student) => (
              <option className={styles.option} key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={downloadExcel} className={styles.submit}>
            Скачать Excel
          </button>
        </div>
        <div className={styles.buttonGroup}>
        <button onClick={downloadWord} className={styles.submit}>
            Скачать Word
          </button>
        </div>
      </div>

      <div className={styles.section + " " + styles.results}>
        <Search className={styles.search} onClick={handleResults}></Search>
        {results.length > 0 ? (
          <>
            <h2>Процент правильных ответов: {calculateCorrectPercentage(results)}%</h2>
            {!selectedStudent && (
              <>
                <h3>Список учеников:</h3>
                <div className={styles.sorting}>
                  <label htmlFor="sortType">Сортировать по:</label>
                  <select
                    id="sortType"
                    className={styles.select}
                    onChange={(e) => setSortType(e.target.value)}
                    value={sortType}
                  >
                    {/* <option value="lastModified">По последнему изменению</option> */}
                    <option value="alphabetical">По алфавиту</option>
                    <option value="correctPercentage">По проценту правильных ответов</option>
                  </select>
                  {sortOrder === "asc" ? (
                    <ArrowBigUp
                      className={styles.button}
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                      Прямой порядок
                    </ArrowBigUp>
                  ) : (
                    <ArrowBigDown
                      className={styles.button}
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                      Обратный порядок
                    </ArrowBigDown>
                  )}
                </div>
                <ul className={styles.resultsList}>
                  {sortStudents(students).map((student) => {
                    const studentResults = results.filter(
                      (result) => result.studentId === student.id
                    );
                    return (
                      <li
                        key={student.id}
                        className={styles.resultItem}
                        onClick={() => handleStudentClick(student.id)}
                      >
                        <p>
                          <strong>{student.name}</strong>:{" "}
                          {calculateCorrectPercentage(studentResults)}%
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {/* <div className={styles.listsContainer}>
              <div className={styles.listSection}>
                <h3>Список тестов:</h3>
                <div className={styles.sorting}>
                  <label htmlFor="testSortType">Сортировать по:</label>
                  <select
                    id="testSortType"
                    className={styles.select}
                    onChange={(e) => setSortType(e.target.value)}
                    value={sortType}
                  >
                    <option value="alphabetical">По алфавиту</option>
                  </select>
                  {sortOrder === "asc" ? (
                    <ArrowBigUp
                      className={styles.button}
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                      Прямой порядок
                    </ArrowBigUp>
                  ) : (
                    <ArrowBigDown
                      className={styles.button}
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                      Обратный порядок
                    </ArrowBigDown>
                  )}
                </div>
                <ul className={styles.resultsList}>
                  {sortStudents(tests).map((test) => (
                    <li
                      key={test.id}
                      className={styles.resultItem}
                      onClick={() => handleTestSelect(test.id)}
                    >
                      <p>
                        <strong>{test.name}</strong>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.listSection}>
                <h3>Список групп:</h3>
                <div className={styles.sorting}>
                  <label htmlFor="groupSortType">Сортировать по:</label>
                  <select
                    id="groupSortType"
                    className={styles.select}
                    onChange={(e) => setSortType(e.target.value)}
                    value={sortType}
                  >
                    <option value="alphabetical">По алфавиту</option>
                  </select>
                  {sortOrder === "asc" ? (
                    <ArrowBigUp
                      className={styles.button}
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                      Прямой порядок
                    </ArrowBigUp>
                  ) : (
                    <ArrowBigDown
                      className={styles.button}
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                      Обратный порядок
                    </ArrowBigDown>
                  )}
                </div>
                <ul className={styles.resultsList}>
                  {sortStudents(groups).map((group) => (
                    <li
                      key={group.id}
                      className={styles.resultItem}
                      onClick={() => handleGroupSelect(group.id)}
                    >
                      <p>
                        <strong>{group.name}</strong>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.listSection}>
                <h3>Список доступов:</h3>
                <div className={styles.sorting}>
                  <label htmlFor="accessSortType">Сортировать по:</label>
                  <select
                    id="accessSortType"
                    className={styles.select}
                    onChange={(e) => setSortType(e.target.value)}
                    value={sortType}
                  >
                    <option value="alphabetical">По алфавиту</option>
                  </select>
                  {sortOrder === "asc" ? (
                    <ArrowBigUp
                      className={styles.button}
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                      Прямой порядок
                    </ArrowBigUp>
                  ) : (
                    <ArrowBigDown
                      className={styles.button}
                      onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                      Обратный порядок
                    </ArrowBigDown>
                  )}
                </div>
                <ul className={styles.resultsList}>
                  {sortStudents(testAccesses).map((access) => (
                    <li
                      key={access.id}
                      className={styles.resultItem}
                      onClick={() => handleTestAccessSelect(access.id)}
                    >
                      <p>
                        <strong>{access.name || `Доступ ${access.id}`}</strong>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div> */}
            {selectedStudent && selectedTestAccess && (
              <>
                <h3>Ответы ученика:</h3>
                <ul className={styles.resultsList}>
                  {studentResults.map((result, index) => (
                    <li key={index} className={styles.resultItem}>
                      <p>
                        <strong>Вопрос:</strong> {result.question}
                      </p>
                      <p>
                        <strong>Ответы:</strong> {Array.isArray(result.answers) ? result.answers.join(", ") : "Нет данных"}
                      </p>
                      <p
                        style={{
                          color: result.IsRight === 100 ? "green" : "red", // Условное изменение цвета текста
                        }}
                      >
                        <strong>Ответ ученика:</strong> {result.answer}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <div className={styles.section + " " + styles.results}>
            <p>Нет результатов</p>
          </div>
        )}
      </div>

      {loading && <p>Загрузка...</p>}
      
    </div>
  );
}