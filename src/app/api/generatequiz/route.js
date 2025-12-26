import axios from "axios";

const OPENAI_API_KEY = process.env.CHAT_API_KEY;
// console.log("OPENAI_API_KEY:", OPENAI_API_KEY);
export async function POST(req) {
  try {
    const body = await req.json();
    // console.log("Запрос на генерацию:", body);
    const { selectedTest = "html", description, numQuestions, model = "gpt-3.5-turbo", language = "kaz" } = body;

    const finalNumQuestions = numQuestions || 5;

    if (!selectedTest || !description) {
      return Response.json({ error: "Нужно указать тему и описание" }, { status: 400 });
    }

    if (finalNumQuestions < 1) {
      return Response.json({ error: "Число вопросов должно быть больше нуля" }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      console.error("Ключ OpenAI API отсутствует.");
      return Response.json({ error: "Ключ OpenAI API не найден." }, { status: 500 });
    }

    const prompt = `Создай тест из ${finalNumQuestions} вопросов на тему "${selectedTest}". Описание: ${description}.
Формат ответа (только JSON):
{
  "questions": [
    {
      "questionText": "Текст вопроса",
      "answerText1": "Первый вариант",
      "answerText2": "Второй вариант",
      "answerText3": "Третий вариант",
      "answerText4": "Четвертый вариант",
      "isCorrect": 1/2/3/4
    }
  ]
}`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: [
          { role: "system", content: `Ты помощник, который генерирует тесты на основе темы и описания на языке ${language}. Всегда отвечай ЧИСТЫМ JSON БЕЗ форматирования и пояснений. Обязательно отвечать на этом языке ${language}` },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Ответ:", response.data);
    
    const quizText = response.data.choices?.[0]?.message?.content.trim();

    // Убираем Markdown-разметку ```json ... ```
    const cleanQuizText = quizText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    
    console.log("Чистый JSON:", cleanQuizText);
    
    const parsedData = JSON.parse(cleanQuizText);

    if (!Array.isArray(parsedData.questions)) {
      throw new Error("Неверный формат ответа OpenAI.");
    }

    return Response.json({ selectedTest, description, questions: parsedData.questions });
  } catch (error) {
    console.error("Ошибка запроса к OpenAI:", error.response?.data || error.message);
    return Response.json({ error: "Ошибка при запросе к OpenAI." }, { status: 500 });
  }
}
