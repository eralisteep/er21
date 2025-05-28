const { default: axios } = require("axios");

// Ваш ключ OpenAI API
const OPENAI_API_KEY = `${process.env.NEXT_PUBLIC_CHAT_API_KEY}`;

class AI_API {
  async generatequiz(req, res) {
    const { title, description, numQuestions, model = "gpt-3.5-turbo", language = "kaz" } = req.body;
    const finalNumQuestions = numQuestions || 5;

    // Проверка на наличие title и description
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Пожалуйста, предоставьте title и description." });
    }

    // Проверка на валидность количества вопросов (например, не больше 20)
    if (finalNumQuestions < 1 || finalNumQuestions > 20) {
      return res
        .status(400)
        .json({ error: "Количество вопросов должно быть от 1 до 20." });
    }

    if (!OPENAI_API_KEY) {
      console.error(
        "Ключ OpenAI API отсутствует. Проверьте переменные окружения."
      );
      return res.status(500).json({
        error: "Ключ OpenAI API не найден. Обратитесь к администратору.",
      });
    }

    try {
      const prompt = `Создай тест из ${finalNumQuestions} вопросов на тему "${title}". Используй подробное описание: ${description}. 
Каждый вопрос должен быть строго в формате JSON-объекта и включать:
{
  "questionText": "Текст вопроса",
  "answerText1": "Первый вариант",
  "answerText2": "Второй вариант",
  "answerText3": "Третий вариант",
  "answerText4": "Четвертый вариант",
  "isCorrect": 1/2/3/4
}
Ответ должен быть строго в следующем формате:
{
  "questions": [
    {
      "questionText": "Текст вопроса",
      "answerText1": "Первый вариант",
      "answerText2": "Второй вариант",
      "answerText3": "Третий вариант",
      "answerText4": "Четвертый вариант",
      "isCorrect": 1/2/3/4
    },
    ...
  ]
}
Не добавляй лишних комментариев или пояснений — только JSON-объект.`;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model, // Модель теперь может быть указана в запросе
          messages: [
            {
              role: "system",
              content: `Ты помощник, который генерирует тесты на основе предоставленной темы и описания на языке ${language}. Обязательно отвечать на этом языке ${language}`,
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 1500, // увеличиваем количество токенов для большего текста
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      try {
        const quizText = response.data.choices?.[0]?.message?.content;

        if (!quizText) {
          throw new Error("Ответ OpenAI пустой или некорректный.");
        }

        // Попытка распарсить JSON
        const parsedData = JSON.parse(quizText);

        if (!Array.isArray(parsedData.questions)) {
          throw new Error(
            "Формат JSON некорректен: отсутствует массив 'questions'."
          );
        }

        // Отправка данных в ответ
        res.json({ title, description, questions: parsedData.questions });
      } catch (error) {
        console.error("Ошибка обработки ответа:", error.message);
        res
          .status(500)
          .json({ error: "Не удалось обработать ответ от OpenAI." });
      }
    } catch (error) {
      console.error(
        "Ошибка при обращении к OpenAI API:",
        error.response?.data || error.message
      );
      res.status(500).json({
        error:
          error.response?.data?.error?.message ||
          "Не удалось сгенерировать тест.",
      });
    }
  }
}

module.exports = new AI_API();
