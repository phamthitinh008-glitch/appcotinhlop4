import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    app: 'Ứng Dụng Công Nghệ AI Vào Giảng Dạy Và Học Tập Với Trợ Lý AI Lớp 4 - Smart Class 4C',
    teacher: 'Phạm Thị Tính',
    school: 'Tiểu học Khoái Châu 1',
  });
});

// Helper for Gemini text generation
async function callGemini(prompt: string, systemInstruction?: string, isJson = false): Promise<string> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || 'Bạn là Trợ lý AI giáo dục thân thiện, sư phạm cho học sinh Lớp 4 (9-10 tuổi) và giáo viên Trường Tiểu học Khoái Châu 1 theo Chương trình GDPT 2018.',
      temperature: 0.7,
      ...(isJson ? { responseMimeType: 'application/json' } : {}),
    },
  });

  return response.text || '';
}

// Vietnamese Text-To-Speech Endpoint (gemini-3.8-flash-lite-tts)
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const cleanText = text.replace(/[*#_`]/g, '').trim().slice(0, 350);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Giọng cô giáo tiểu học Việt Nam dịu dàng, chuẩn tiếng Việt, phát âm rõ ràng cho học sinh lớp 4',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned' });
    }

    res.json({ audio: base64Audio, format: 'audio/wav' });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// 1. AI Tutor Endpoint
app.post('/api/gemini/tutor', async (req: Request, res: Response) => {
  try {
    const { question, subject, level = 2, studentName } = req.body;

    const levelGuide = 
      level === 1 ? 'Mức 1 (Gợi ý nhẹ): Đặt câu hỏi gợi mở, khích lệ em suy nghĩ, không đưa ra lời giải trực tiếp.' :
      level === 2 ? 'Mức 2 (Hướng dẫn từng bước): Chia bài toán hoặc vấn đề thành các bước nhỏ dễ hiểu, hỏi em kết quả bước 1 để cùng làm tiếp.' :
      'Mức 3 (Giải thích chi tiết & bài tập tương tự): Giải thích tường minh phương pháp, làm rõ bản chất, và kèm theo một ví dụ hoặc bài tập tương tự để em tự luyện tập.';

    const systemPrompt = `Bạn là Robot AI đôi mắt xanh thông minh, thân thiện của Lớp 4C, Trường Tiểu học Khoái Châu 1.
Đối tượng giao tiếp: Học sinh lớp 4 (9-10 tuổi).
Môn học: ${subject || 'Toán / Tiếng Việt / Khoa học / Lịch sử Địa lí'}.
Mức hỗ trợ yêu cầu: ${levelGuide}
Quy tắc:
- Ngôn ngữ: Tiếng Việt trong sáng, lễ phép, gần gũi, xưng "Thầy/Cô AI" hoặc "Robot AI" và gọi học sinh là "${studentName ? studentName : 'em'}".
- Tuyệt đối KHÔNG đưa đáp án ngay nếu chưa hướng dẫn tư duy.
- Chuẩn chương trình Giáo dục Phổ thông 2018 lớp 4.
- Luôn có câu khen ngợi hoặc động viên ở cuối!`;

    const userPrompt = `Học sinh hỏi: "${question}"`;

    if (!ai) {
      // Fallback response if API key not available
      return res.json({
        reply: `Chào ${studentName || 'em'}! Robot AI rất vui được đồng hành cùng em với môn ${subject || 'học'}. Với câu hỏi "${question}": Hãy nhớ lại quy tắc bài học nhé! Em hãy quan sát kỹ các dữ kiện đã cho và thử tìm xem bước đầu tiên chúng mình cần làm là gì nào? Cố lên nhé!`,
        source: 'fallback',
      });
    }

    const reply = await callGemini(userPrompt, systemPrompt);
    res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in tutor endpoint:', error);
    res.status(500).json({
      error: error.message || 'Lỗi khi kết nối với AI',
      fallbackReply: 'Robot AI đang bận một chút, em hãy kiểm tra lại câu hỏi hoặc thử lại sau vài giây nhé!',
    });
  }
});

// 2. AI Quiz Generator Endpoint
app.post('/api/gemini/quiz', async (req: Request, res: Response) => {
  try {
    const { subject, topic, count = 5, difficulty = 'medium', type = 'multiple_choice' } = req.body;

    if (!ai) {
      return res.json({
        questions: generateDefaultQuestions(subject, topic, count),
        source: 'fallback',
      });
    }

    const systemPrompt = `Bạn là chuyên gia khảo thí tiểu học GDPT 2018. Tạo ngân hàng câu hỏi Lớp 4 chuẩn xác, sư phạm, không sai sót kiến thức.
Trả về định dạng JSON thuần túy là một mảng các object có cấu trúc:
[
  {
    "id": 1,
    "question": "Nội dung câu hỏi tiếng Việt rõ ràng",
    "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
    "correctAnswer": 0, // chỉ số 0, 1, 2 hoặc 3
    "explanation": "Lời giải thích dễ hiểu cho học sinh lớp 4",
    "hint": "Gợi ý nhẹ nếu học sinh cần"
  }
]`;

    const userPrompt = `Hãy tạo ${count} câu hỏi môn ${subject}, chủ đề: "${topic || 'Tổng hợp chương trình lớp 4'}", độ khó: ${difficulty}, dạng bài: ${type}.`;

    const rawJson = await callGemini(userPrompt, systemPrompt, true);
    let parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed) && parsed.questions) {
      parsed = parsed.questions;
    }

    res.json({ questions: parsed, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in quiz endpoint:', error);
    res.json({
      questions: generateDefaultQuestions(req.body.subject, req.body.topic, req.body.count || 5),
      source: 'fallback',
      warning: 'Đã sử dụng bộ câu hỏi mẫu do lỗi kết nối AI: ' + error.message,
    });
  }
});

// 3. AI Lesson Plan (Kế hoạch bài dạy GDPT 2018)
app.post('/api/gemini/lesson-plan', async (req: Request, res: Response) => {
  try {
    const { subject, lessonName, periodCount = 1, grade = 4, bookSeries = 'Kết nối tri thức / Cánh Diều / Chân trời sáng tạo', aiLevel = 'Trung bình' } = req.body;

    const systemPrompt = `Bạn là chuyên gia sư phạm tiểu học phụ trách tập huấn giáo viên tiểu học theo Chương trình GDPT 2018.
Hãy soạn Kế hoạch bài dạy (Giáo án) chi tiết, chuẩn chỉ cho Giáo viên Phạm Thị Tính, Lớp 4C, Trường Tiểu học Khoái Châu 1.
Bắt buộc có đầy đủ 13 mục chuẩn:
1. Yêu cầu cần đạt (về kiến thức, kỹ năng)
2. Năng lực chung (Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo)
3. Năng lực đặc thù của môn học
4. Phẩm chất chủ yếu (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm)
5. Đồ dùng dạy học (Giáo viên và Học sinh, gồm thiết bị AI/máy tính)
6. Hoạt động Khởi động (Mục tiêu, Cách tiến hành, Dự kiến sản phẩm)
7. Hoạt động Hình thành kiến thức mới (Tổ chức theo nhóm 4 tổ: Hoa Ban, Mặt Trời, Sao Sáng, Cầu Vồng)
8. Hoạt động Luyện tập, thực hành
9. Hoạt động Vận dụng, trải nghiệm
10. Công cụ và tiêu chí đánh giá (Rubric)
11. Phân hóa theo năng lực học sinh (Hỗ trợ học sinh cần cố gắng và bồi dưỡng học sinh năng khiếu)
12. Hoạt động ứng dụng công nghệ AI và Smart Class 4C phù hợp
13. Điều chỉnh sau bài dạy`;

    const userPrompt = `Môn học: ${subject}. Tên bài: ${lessonName}. Số tiết: ${periodCount}. Lớp: ${grade}C. Bộ sách: ${bookSeries}. Mức độ ứng dụng AI: ${aiLevel}.`;

    if (!ai) {
      return res.json({
        plan: generateDefaultLessonPlan(subject, lessonName, grade),
        source: 'fallback',
      });
    }

    const plan = await callGemini(userPrompt, systemPrompt);
    res.json({ plan, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in lesson plan endpoint:', error);
    res.json({
      plan: generateDefaultLessonPlan(req.body.subject, req.body.lessonName, 4),
      source: 'fallback',
      warning: 'Sử dụng kế hoạch mẫu do lỗi API: ' + error.message,
    });
  }
});

// 4. AI Mindmap Structure Generator
app.post('/api/gemini/mindmap', async (req: Request, res: Response) => {
  try {
    const { topic, subject } = req.body;
    const systemPrompt = `Bạn là chuyên gia phương pháp sơ đồ tư duy cho học sinh tiểu học (Tony Buzan cho trẻ em).
Tạo cấu trúc sơ đồ tư duy dạng JSON gồm:
{
  "topic": "Tên chủ đề trung tâm",
  "color": "#3B82F6",
  "branches": [
    {
      "id": "b1",
      "title": "Nhánh chính 1",
      "color": "#10B981",
      "subBranches": ["Ý phụ 1.1", "Ý phụ 1.2", "Ý phụ 1.3"]
    },
    ...
  ]
}`;
    const userPrompt = `Hãy tạo sơ đồ tư duy môn ${subject || 'Khoa học'}, chủ đề: "${topic || 'Vòng tuần hoàn của nước trong tự nhiên'}". Có 4-5 nhánh chính, mỗi nhánh 2-4 ý phụ ngắn gọn dễ nhớ.`;

    if (!ai) {
      return res.json({
        mindmap: generateDefaultMindmap(topic),
        source: 'fallback',
      });
    }

    const raw = await callGemini(userPrompt, systemPrompt, true);
    res.json({ mindmap: JSON.parse(raw), source: 'gemini' });
  } catch (error: any) {
    res.json({
      mindmap: generateDefaultMindmap(req.body.topic),
      source: 'fallback',
    });
  }
});

// 5. AI Story Generator (Tranh kể chuyện)
app.post('/api/gemini/story', async (req: Request, res: Response) => {
  try {
    const { title, characters, setting, moral } = req.body;
    const systemPrompt = `Bạn là nhà văn viết truyện thiếu nhi cho học sinh tiểu học lớp 4.
Tạo một câu chuyện ngắn gồm 4 cảnh/trang tranh ý nghĩa, có tính giáo dục phẩm chất cao.
Trả về JSON:
{
  "title": "Tên truyện",
  "moral": "Bài học rút ra",
  "pages": [
    {
      "pageNumber": 1,
      "scene": "Mô tả bối cảnh và hành động",
      "narration": "Lời kể truyện truyền cảm",
      "dialogue": "Lời thoại nhân vật (nếu có)",
      "illustrationPrompt": "Gợi ý hình vẽ minh họa chi tiết"
    }
  ]
}`;
    const userPrompt = `Tên truyện: ${title || 'Chuyến phiêu lưu của Robot Xanh và các bạn Lớp 4C'}. Nhân vật: ${characters || 'Robot AI, bạn Kiều Anh, bạn Gia Bảo'}. Bối cảnh: ${setting || 'Trường Tiểu học Khoái Châu 1'}. Bài học: ${moral || 'Tinh thần đoàn kết, sẻ chia và tự học'}.`;

    if (!ai) {
      return res.json({
        story: generateDefaultStory(title),
        source: 'fallback',
      });
    }

    const raw = await callGemini(userPrompt, systemPrompt, true);
    res.json({ story: JSON.parse(raw), source: 'gemini' });
  } catch (error: any) {
    res.json({
      story: generateDefaultStory(req.body.title),
      source: 'fallback',
    });
  }
});

// 6. AI STEM guidance
app.post('/api/gemini/stem-guide', async (req: Request, res: Response) => {
  try {
    const { modelName } = req.body;
    const systemPrompt = `Bạn là cố vấn phòng thực hành STEM Lớp 4.
Hãy đưa ra:
1. Ý tưởng khoa học đằng sau mô hình
2. 3 câu hỏi khám phá gợi mở cho học sinh lớp 4
3. 3 bước thử nghiệm chế tạo thực tế tại lớp hoặc ở nhà
4. Bài học liên môn (Toán, Khoa học, Mỹ thuật, Tin học)`;
    const userPrompt = `Mô hình STEM: ${modelName}.`;

    if (!ai) {
      return res.json({
        guide: `Mô hình ${modelName} giúp học sinh Lớp 4 khám phá kiến thức khoa học đời sống, phát triển tư duy kỹ thuật và bảo vệ môi trường!`,
        source: 'fallback',
      });
    }

    const guide = await callGemini(userPrompt, systemPrompt);
    res.json({ guide, source: 'gemini' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper Fallbacks
function generateDefaultQuestions(subject = 'Toán', topic = 'Tổng hợp', count = 5) {
  const mathPool = [
    {
      id: 1,
      question: "Để cộng hai phân số khác mẫu số 1/3 và 1/4, bước đầu tiên em cần làm là gì?",
      options: ["A. Cộng trực tiếp tử số với tử số", "B. Quy đồng mẫu số hai phân số", "C. Rút gọn hai phân số", "D. Nhân hai mẫu số với nhau"],
      correctAnswer: 1,
      explanation: "Quy tắc: Muốn cộng hai phân số khác mẫu số, ta quy đồng mẫu số hai phân số rồi cộng hai phân số đó.",
      hint: "Hai phân số này có mẫu số khác nhau là 3 và 4!"
    },
    {
      id: 2,
      question: "Số gồm 5 triệu, 4 trăm nghìn, 2 chục nghìn và 8 đơn vị được viết là:",
      options: ["A. 5 420 008", "B. 5 402 008", "C. 542 008", "D. 5 420 080"],
      correctAnswer: 0,
      explanation: "Chữ số hàng triệu là 5, hàng trăm nghìn là 4, hàng chục nghìn là 2, hàng nghìn và trăm, chục là 0, hàng đơn vị là 8 -> 5 420 008.",
      hint: "Nhớ kiểm tra kỹ các hàng có giá trị bằng 0 nhé!"
    },
    {
      id: 3,
      question: "Một hình chữ nhật có nửa chu vi là 36 cm, chiều rộng kém chiều dài 6 cm. Diện tích hình chữ nhật là:",
      options: ["A. 315 cm²", "B. 320 cm²", "C. 216 cm²", "D. 300 cm²"],
      correctAnswer: 0,
      explanation: "Chiều dài = (36 + 6) : 2 = 21 cm. Chiều rộng = 21 - 6 = 15 cm. Diện tích = 21 x 15 = 315 cm².",
      hint: "Đây là bài toán tìm hai số khi biết Tổng và Hiệu!"
    },
    {
      id: 4,
      question: "Trong các phân số sau, phân số nào bằng phân số 3/5?",
      options: ["A. 9/20", "B. 12/20", "C. 6/15", "D. 15/20"],
      correctAnswer: 1,
      explanation: "Nhân cả tử số và mẫu số của 3/5 với 4 ta được: (3 x 4) / (5 x 4) = 12/20.",
      hint: "Em hãy áp dụng tính chất cơ bản của phân số bằng cách nhân tử và mẫu với cùng một số."
    },
    {
      id: 5,
      question: "Khối lượng một con voi trưởng thành khoảng bao nhiêu?",
      options: ["A. 4 yến", "B. 4 tạ", "C. 4 tấn", "D. 40 kg"],
      correctAnswer: 2,
      explanation: "1 tấn = 1000 kg. Voi là động vật to lớn trên cạn, khối lượng thường từ 3 đến 5 tấn (3000 - 5000 kg).",
      hint: "Đơn vị đo khối lượng lớn nhất em vừa học ở lớp 4 là Tấn!"
    }
  ];

  return mathPool.slice(0, count);
}

function generateDefaultLessonPlan(subject = 'Toán', lessonName = 'Cộng hai phân số khác mẫu số', grade = 4) {
  return `KẾ HOẠCH BÀI DẠY (GIÁO ÁN ĐIỆN TỬ GDPT 2018)
TRƯỜNG TIỂU HỌC KHOÁI CHÂU 1 - LỚP 4C
Giáo viên thực hiện: Phạm Thị Tính
Môn: ${subject} - Lớp: ${grade}C
Tên bài: ${lessonName}
Thời lượng: 1 tiết (35 phút)

I. YÊU CẦU CẦN ĐẠT
1. Kiến thức, kĩ năng:
- Học sinh biết quy đồng mẫu số và thực hiện phép tính thành thạo.
- Vận dụng giải quyết các tình huống thực tế liên quan.
2. Năng lực chung:
- Năng lực tự chủ và tự học: Tự giác sử dụng Trợ lý AI Smart Class 4C để tìm hiểu bài.
- Năng lực giao tiếp và hợp tác: Tương tác thảo luận sôi nổi trong 4 tổ (Hoa Ban, Mặt Trời, Sao Sáng, Cầu Vồng).
- Năng lực giải quyết vấn đề và sáng tạo: Tìm ra cách tính nhanh và chính xác.
3. Phẩm chất:
- Chăm chỉ, cẩn thận, trung thực và yêu thích môn học.

II. ĐỒ DÙNG DẠY HỌC
- Giáo viên: Máy tính, máy chiếu, bảng tương tác, ứng dụng Smart Class 4C.
- Học sinh: Máy tính bảng/vở bài tập, tài liệu học tập.

III. TIẾN TRÌNH DẠY HỌC
1. Khởi động (5 phút): Trò chơi Vòng quay may mắn trên Smart Class 4C.
2. Hình thành kiến thức (12 phút): Thảo luận theo tổ, Robot AI hướng dẫn 3 bước quy đồng.
3. Luyện tập thực hành (13 phút): Trả lời ngân hàng câu hỏi phân hóa, AI chấm điểm tức thời.
4. Vận dụng trải nghiệm (5 phút): Giải quyết bài toán thực tế chia bánh sinh nhật.

IV. ĐÁNH GIÁ VÀ ĐIỀU CHỈNH
- Đánh giá thường xuyên theo Thông tư 27/2020/TT-BGDĐT.
- Ghi nhận tiến bộ trên hệ thống Smart Class 4C.`;
}

function generateDefaultMindmap(topic = 'Vòng tuần hoàn của nước') {
  return {
    topic: topic,
    color: '#2563EB',
    branches: [
      {
        id: 'b1',
        title: 'Bốc hơi',
        color: '#0284C7',
        subBranches: ['Nước biển, sông hồ', 'Nhiệt độ Mặt Trời', 'Hơi nước bay lên cao']
      },
      {
        id: 'b2',
        title: 'Ngưng tụ',
        color: '#7C3AED',
        subBranches: ['Gặp lạnh trên cao', 'Tạo thành các hạt nước nhỏ', 'Hợp thành các đám mây']
      },
      {
        id: 'b3',
        title: 'Mưa & Rơi xuống',
        color: '#059669',
        subBranches: ['Mây nặng hạt', 'Mưa rào, tuyết rơi', 'Nước chảy về nguồn']
      },
      {
        id: 'b4',
        title: 'Ý nghĩa đời sống',
        color: '#D97706',
        subBranches: ['Cung cấp nước ngọt', 'Cây cối phát triển', 'Duy trì sự sống']
      }
    ]
  };
}

function generateDefaultStory(title = 'Chuyến phiêu lưu của Robot AI và Lớp 4C') {
  return {
    title: title,
    moral: 'Tinh thần tương thân tương ái, đam mê khám phá và đoàn kết vượt qua thử thách.',
    pages: [
      {
        pageNumber: 1,
        scene: 'Buổi sáng ngập tràn ánh nắng tại Trường Tiểu học Khoái Châu 1. Các bạn học sinh Lớp 4C bước vào lớp với nụ cười rạng rỡ.',
        narration: 'Hôm nay là một ngày đặc biệt ở Lớp 4C, cô Tính mỉm cười giới thiệu người bạn mới: Chú Robot AI thông minh với đôi mắt xanh lấp lánh.',
        dialogue: 'Robot AI chào: "Xin chào các bạn Lớp 4C! Mình rất vui được đồng hành cùng các bạn!"',
        illustrationPrompt: 'Lớp học tiểu học Việt Nam sáng sủa, cô giáo dịu dàng và chú robot AI thân thiện vẫy tay chào các bạn nhỏ mặc đồng phục.'
      },
      {
        pageNumber: 2,
        scene: 'Giờ học Toán, bạn Gia Bảo và bạn Kiều Anh gặp một bài toán phân số hóc búa.',
        narration: 'Thay vì cho ngay đáp án, chú Robot AI chớp đôi mắt xanh, nhẹ nhàng gợi ý từng bước quy đồng mẫu số.',
        dialogue: 'Robot AI: "Các bạn hãy tìm mẫu số chung nhỏ nhất của 4 và 6 nhé! Chúng mình cùng thử nào!"',
        illustrationPrompt: 'Hai bạn nhỏ chăm chú nhìn màn hình máy tính bảng, chú robot AI tỏa ra những bóng đèn ý tưởng lấp lánh.'
      },
      {
        pageNumber: 3,
        scene: 'Bốn tổ: Hoa Ban, Mặt Trời, Sao Sáng và Cầu Vồng cùng nhau thi đua làm sản phẩm STEM ngôi nhà xanh.',
        narration: 'Cả lớp cùng chung tay lắp ghép tấm pin năng lượng mặt trời mini và mô hình tái chế.',
        dialogue: 'Bạn Chi reo lên: "Nhìn này, bóng đèn ngôi nhà đã sáng lên rồi!"',
        illustrationPrompt: 'Bốn nhóm học sinh vui vẻ cùng nhau hoàn thành mô hình nhà sinh thái 3D với nụ cười tự hào.'
      },
      {
        pageNumber: 4,
        scene: 'Tổng kết tiết học, cô giáo Phạm Thị Tính trao huy hiệu "Nhà Sáng Tạo Nhí" cho cả lớp.',
        narration: 'Các bạn học sinh Lớp 4C hiểu rằng: Với sự kiên trì, tinh thần đoàn kết và sự hỗ trợ của công nghệ, không có bài toán nào là không thể vượt qua.',
        dialogue: 'Cả lớp đồng thanh: "Lớp 4C - Tự học, Sáng tạo, Vượt giới hạn!"',
        illustrationPrompt: 'Cô giáo và toàn thể 36 học sinh cùng giơ cao huy hiệu, robot AI chớp mắt vui sướng giữa những chùm pháo hoa giấy rực rỡ.'
      }
    ]
  };
}

// In development, hook Vite middleware
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // In production (Vercel or Cloud Run container), serve built static files
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart Class 4C Server is running on port ${PORT}`);
});
