import { useQuery } from "@tanstack/react-query";
import { db } from "@/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// Функция получения доступных тестов
const fetchAvailableTests = async () => {
  // Загружаем список доступных тестов
  const accessSnapshot = await getDocs(collection(db, "test_access"));
  const accessList = accessSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // console.log(accessList);
    
  // Загружаем полные данные по каждому testId из "tests"
  const testsData = await Promise.all(
    accessList.map(async (access) => {
      const testDoc = await getDoc(doc(db, "tests", access.testId));
      return testDoc.exists() ? { id: testDoc.id, ...testDoc.data() } : null;
    })
  );
//   console.log(testsData);
  // Фильтруем, если какой-то тест не найден
  return testsData.filter(test => test !== null);
};

// Экспортируем хук
export const useAvailableTests = () => {
  return useQuery({
    queryKey: ["availableTests"],
    queryFn: fetchAvailableTests,
  });
};
