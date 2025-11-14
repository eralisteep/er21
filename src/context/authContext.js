"use client";
import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // 🔹 Проверяем авторизацию (ME API)
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/me");
      return data;
    },
    retry: false, // Не перезапрашиваем при ошибке
    staleTime: 1000 * 60 * 60 * 12, // Кешируем данные на 12 часов
  });
  const role = user?.role;
  // 🔹 Регистрация
  const registerMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await axios.post("/api/auth/register", { email, password });
      return data;
    },
    onSuccess: () => refetch(),
  });

  // 🔹 Логин
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      // console.log(email);
      
      const { data } = await axios.post("/api/auth/login", { email, password });
      // console.log(data);
      
      return data;
    },
    onSuccess: () => refetch(),
  });

  // 🔹 Выход
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries(["authUser"]); // Удаляем кеш
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
