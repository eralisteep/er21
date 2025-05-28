"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/authContext"; // Для получения данных пользователя
import styles from "./page.module.css";

export default function ProfilePage() {
  const { user, role } = useAuth(); // Получаем данные пользователя и его роль
  const [groupName, setGroupName] = useState(""); // Название группы
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (role === "student" && user?.groupId) {
      fetchGroupName(user.groupId);
    }
  }, [role, user?.groupId]);

  const fetchGroupName = async (groupId) => {
    try {
      const response = await fetch(`/api/student/group`);
      if (!response.ok) throw new Error("Ошибка при загрузке группы");
      const group = await response.json();
      setGroupName(group?.name || "Не указано");
    } catch (error) {
      console.error("Ошибка загрузки группы:", error);
      setGroupName("Не указано");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Новый пароль и подтверждение пароля не совпадают.");
      return;
    }

    try {
      const response = await fetch("/api/auth/changepassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при изменении пароля.");
      }

      setMessage("Пароль успешно изменен.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Профиль пользователя</h1>

      <div className={styles.info}>
        <p>
          <strong>Имя:</strong> {user?.name || user?.displayName ||"Не указано"}
        </p>
        {role === "student" && (
          <p>
            <strong>Группа:</strong> {groupName}
          </p>
        )}
        <p>
          <strong>Email:</strong> {user?.email || "Не указано"}
        </p>
      </div>

      <div className={styles.passwordChange}>
        <h2>Изменение пароля</h2>
        <form onSubmit={handlePasswordChange} className={styles.form}>
          <div className={styles.inputGroupContainer}>
            <div className={styles.inputGroup}>
              <label htmlFor="oldPassword">Старый пароль</label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">Новый пароль</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Подтверждение нового пароля</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className={styles.submit}>
            Изменить пароль
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}