"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/authContext";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function Login() {
  const { login, role, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  useEffect(() => {
    if (role) {
      router.push(`/`); // Перенаправляем на страницу в зависимости от роли
    }
  }, [role, router]); // Следим за изменением role

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Вход в систему</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Пароль</label>
            <input
              type="password"
              placeholder="Введите ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
