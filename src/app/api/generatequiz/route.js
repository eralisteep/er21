import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();
    // console.log("Запрос на генерацию:", body);
    const { selectedTest, description, numQuestions, language = "kaz" } = body;

    const finalNumQuestions = numQuestions || 5;

    if (!selectedTest || !description) {
      return Response.json({ error: "Нужно указать тему и описание" }, { status: 400 });
    }

    if (finalNumQuestions < 1) {
      return Response.json({ error: "Число вопросов должно быть больше нуля" }, { status: 400 });
    }

    if (!process.env.AI_KEY) {
      console.error("Ключ AI API отсутствует.");
      return Response.json({ error: "Ключ AI API не найден." }, { status: 500 });
    }

    let prompt = `Создай тест из ${finalNumQuestions} вопросов. Обязательно вопросы по этому описанию: ${description}.
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

    let adminPrompt = `Ты помощник, который генерирует тесты на основе темы и описания на языке ${language}. Всегда отвечай ЧИСТЫМ JSON БЕЗ форматирования и пояснений. Обязательно отвечать на этом языке ${language}. Любое отклонение от структуры считается ошибкой.
НЕ переводить имена полей.
НЕ изменять формат.
Ответ должен проходить JSON.parse().
. Ты — JSON генератор. Отвечай ТОЛЬКО валидным JSON.
Если не уверен — повтори структуру без изменений.
`
    console.log(prompt)
    
    let response = await fetch("https://ai.collegeit.edu.kz/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_KEY}`
      },
      body: JSON.stringify({
        model: "hoangquan456/qwen3-nothink:8b",
        messages: [
            {
                "role": "user",
                "content": prompt
            },
            {
              "role": "admin",
              "content": adminPrompt
            }
        ]
      }),
    })

    // let response = await axios.post(
    //   "https://api.openai.com/v1/chat/completions",
    //   {
    //     model,
    //     messages: [
    //       { role: "system", content: `Ты помощник, который генерирует тесты на основе темы и описания на языке ${language}. Всегда отвечай ЧИСТЫМ JSON БЕЗ форматирования и пояснений. Обязательно отвечать на этом языке ${language}` },
    //       { role: "user", content: prompt },
    //     ],
    //     max_tokens: 1500,
    //     temperature: 0.7,
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${OPENAI_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    if (!response.ok) {
      return Response.json(
        { error: "Ошибка при обращении к Ollama" },
        { status: response.status }
      )
    }

    let data = await response.json()
    let quizText = data.choices[0].message.content
    console.log("1-ый:" + quizText)
    // Убираем Markdown-разметку ```json ... ```
    function cleanQuizText(quizText) {
      const start = quizText.indexOf('{');
      const end = quizText.lastIndexOf('}');

      if (start === -1 || end === -1) {
        throw new Error("JSON not found in response");
      }

      return quizText.slice(start, end + 1);
    }

//     //2-ой запрос
//     prompt = `${quizText} .сделай это в Формат ответа (только JSON):
// {
//   "questions": [
//     {
//       "questionText": "Текст вопроса",
//       "answerText1": "Первый вариант",
//       "answerText2": "Второй вариант",
//       "answerText3": "Третий вариант",
//       "answerText4": "Четвертый вариант",
//       "isCorrect": 1/2/3/4
//     }
//   ]
// }`

//      adminPrompt = `Ты помощник, который парсит данные в JSON. Всегда отвечай ЧИСТЫМ JSON БЕЗ форматирования и пояснений. Любое отклонение от структуры считается ошибкой.
// НЕ переводить имена полей.
// НЕ изменять формат.
// Ответ должен проходить JSON.parse().
// . Ты — JSON генератор. Отвечай ТОЛЬКО валидным JSON.
// Если не уверен — повтори структуру без изменений.
// `

//     response = await fetch("https://ai.collegeit.edu.kz/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.AI_KEY}`
//       },
//       body: JSON.stringify({
//         model: "hoangquan456/qwen3-nothink:8b",
//         messages: [
//             {
//                 "role": "user",
//                 "content": prompt
//             },
//             {
//               "role": "admin",
//               "content": adminPrompt
//             }
//         ]
//       }),
//     })

    
//     data = await response.json()
//     quizText = data.choices[0].message.content
//     // Убираем Markdown-разметку ```json ... ```
    let clean = cleanQuizText(quizText)
        
    let parsedData = JSON.parse(clean);
    
    console.log("почти-Финал:" + clean)
    console.log("Финал:" + parsedData)


    if (!Array.isArray(parsedData.questions)) {
      throw new Error("Неверный формат ответа OpenAI.");
    }

    return Response.json({
      selectedTest, description, questions: parsedData.questions
    })

    // // Убираем Markdown-разметку ```json ... ```
    // const cleanQuizText = quizText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    
    // console.log("Чистый JSON:", cleanQuizText);
    
    // const parsedData = JSON.parse(cleanQuizText);

    // if (!Array.isArray(parsedData.questions)) {
    //   throw new Error("Неверный формат ответа OpenAI.");
    // }

    // return Response.json({ selectedTest, description, questions: parsedData.questions });
  } catch (error) {
    console.error("Ошибка запроса к OpenAI:", error.response?.data || error.message);
    return Response.json({ error: "Ошибка при запросе к OpenAI." }, { status: 500 });
  }
}
