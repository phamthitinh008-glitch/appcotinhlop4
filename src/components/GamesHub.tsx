import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Gamepad2, 
  RotateCw, 
  Sparkles, 
  Volume2, 
  Play, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Award,
  Zap,
  PlusCircle,
  RefreshCw,
  Shuffle
} from 'lucide-react';
import { Subject, QuizQuestion } from '../types';
import { speechService } from '../utils/speech';
import confetti from 'canvas-confetti';

export type GameType = 
  | 'millionaire'  // 1. Ai là triệu phú
  | 'wheel'        // 2. Vòng quay may mắn
  | 'doors'        // 3. Ô cửa bí mật
  | 'matching'     // 4. Ghép đôi thông minh
  | 'fill'         // 5. Điền từ còn thiếu
  | 'rescue'       // 6. Giải cứu Robot AI
  | 'race'         // 7. Đua xe tri thức
  | 'sort';        // 8. Sắp xếp đáp án

const GAME_LIST = [
  { id: 'millionaire', name: 'Ai là triệu phú', icon: '🏆', color: 'from-amber-500 to-yellow-600', desc: 'Leo thang 15 mốc điểm với trợ giúp 50:50 và gợi ý AI' },
  { id: 'wheel', name: 'Vòng quay may mắn', icon: '🎡', color: 'from-pink-500 to-rose-600', desc: 'Quay vòng số điểm và trả lời câu hỏi bất ngờ' },
  { id: 'doors', name: 'Ô cửa bí mật', icon: '🚪', color: 'from-purple-500 to-indigo-600', desc: 'Mở 4 cánh cửa giải mã bức tranh bí ẩn' },
  { id: 'matching', name: 'Ghép đôi thông minh', icon: '🃏', color: 'from-blue-500 to-cyan-600', desc: 'Ghép cặp khái niệm tương ứng' },
  { id: 'fill', name: 'Điền từ còn thiếu', icon: '✏️', color: 'from-emerald-500 to-teal-600', desc: 'Chọn từ chính xác điền vào ô trống' },
  { id: 'rescue', name: 'Giải cứu Robot AI', icon: '🤖', color: 'from-sky-500 to-blue-700', desc: 'Nạp năng lượng pin 100% để giải cứu Robot' },
  { id: 'race', name: 'Đua xe tri thức', icon: '🏎️', color: 'from-red-500 to-orange-600', desc: 'Tăng tốc về đích khi trả lời đúng liên tiếp' },
  { id: 'sort', name: 'Sắp xếp đáp án đúng', icon: '🔢', color: 'from-violet-500 to-purple-700', desc: 'Sắp xếp các bước giải hoặc thứ tự sự kiện' },
];

export const GamesHub: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>('millionaire');
  const [subject, setSubject] = useState<Subject>('Toán');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topic, setTopic] = useState('Phân số & Số tự nhiên Lớp 4');

  // Questions Bank
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 1,
      question: "Để cộng hai phân số khác mẫu số 1/3 và 1/4, bước đầu tiên em cần làm là gì?",
      options: ["A. Cộng trực tiếp tử số với tử số", "B. Quy đồng mẫu số hai phân số", "C. Rút gọn hai phân số", "D. Lấy mẫu số nhân tử số"],
      correctAnswer: 1,
      explanation: "Quy tắc: Muốn cộng hai phân số khác mẫu số, ta quy đồng mẫu số hai phân số rồi cộng các tử số với nhau.",
      hint: "Hai phân số này đang có mẫu số khác nhau là 3 và 4."
    },
    {
      id: 2,
      question: "Số gồm 5 triệu, 4 trăm nghìn, 2 chục nghìn và 8 đơn vị được viết là:",
      options: ["A. 5 420 008", "B. 5 402 008", "C. 542 008", "D. 5 420 080"],
      correctAnswer: 0,
      explanation: "Chữ số hàng triệu là 5, hàng trăm nghìn là 4, hàng chục nghìn là 2, các hàng còn lại là 0 ngoại trừ đơn vị là 8 -> 5 420 008.",
      hint: "Hãy chú ý hàng nghìn, hàng trăm và hàng chục đều là 0."
    },
    {
      id: 3,
      question: "Một hình chữ nhật có nửa chu vi là 36 cm, chiều rộng kém chiều dài 6 cm. Diện tích là:",
      options: ["A. 315 cm²", "B. 320 cm²", "C. 216 cm²", "D. 300 cm²"],
      correctAnswer: 0,
      explanation: "Chiều dài = (36 + 6) : 2 = 21 cm. Chiều rộng = 21 - 6 = 15 cm. Diện tích = 21 x 15 = 315 cm².",
      hint: "Bài toán tìm hai số khi biết Tổng và Hiệu."
    },
    {
      id: 4,
      question: "Trong các phân số sau, phân số nào bằng phân số 3/5?",
      options: ["A. 9/20", "B. 12/20", "C. 6/15", "D. 15/20"],
      correctAnswer: 1,
      explanation: "Nhân cả tử số và mẫu số của 3/5 với 4 ta được: (3 x 4) / (5 x 4) = 12/20.",
      hint: "Thử nhân hoặc chia cả tử và mẫu với cùng một số tự nhiên."
    },
    {
      id: 5,
      question: "Dãy Hoàng Liên Sơn nằm ở vùng nào của nước ta?",
      options: ["A. Trung du và miền núi Bắc Bộ", "B. Đồng bằng Bắc Bộ", "C. Duyên hải miền Trung", "D. Tây Nguyên"],
      correctAnswer: 0,
      explanation: "Hoàng Liên Sơn là dãy núi cao và đồ sộ nhất Việt Nam, nằm ở vùng Trung du và miền núi Bắc Bộ.",
      hint: "Nơi có đỉnh Fansipan - nóc nhà Đông Dương."
    }
  ]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Wheel State
  const [wheelAngle, setWheelAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Rescue robot energy
  const [robotEnergy, setRobotEnergy] = useState(40);

  // Race progress (0 to 100)
  const [carPosition, setCarPosition] = useState(10);

  // Bulk Generator
  const handleGenerateQuestions = async (count: number) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          count,
          difficulty,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setScore(0);
        setStreak(0);
        setIsAnswered(false);
        setSelectedOption(null);
        speechService.speak(`Robot AI đã tạo xong ${data.questions.length} câu hỏi mới cho em!`);
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelectAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
      setRobotEnergy(prev => Math.min(100, prev + 20));
      setCarPosition(prev => Math.min(100, prev + 18));
      confetti({ particleCount: 60, spread: 60 });
      speechService.praiseCorrect();
    } else {
      setStreak(0);
      setRobotEnergy(prev => Math.max(10, prev - 10));
      speechService.praiseEncouragement();
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setShowExplanation(false);
      setHiddenOptions([]);
    } else {
      speechService.speak(`Chúc mừng em đã hoàn thành toàn bộ bài tập với số điểm ${score + (selectedOption === currentQ.correctAnswer ? 10 : 0)} điểm!`);
      confetti({ particleCount: 100, spread: 90 });
    }
  };

  // 50:50 Lifeline
  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || isAnswered) return;
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== currentQ.correctAnswer);
    // Hide 2 incorrect
    const toHide = incorrectIndices.slice(0, 2);
    setHiddenOptions(toHide);
    setFiftyFiftyUsed(true);
    speechService.speak('Robot AI đã loại bỏ 2 phương án sai cho em rồi nhé!');
  };

  // Lucky Wheel Spin
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const newAngle = wheelAngle + 720 + Math.floor(Math.random() * 360);
    setWheelAngle(newAngle);
    setTimeout(() => {
      setIsSpinning(false);
      speechService.speak('Vòng quay đã dừng lại! Hãy trả lời câu hỏi để nhận điểm thưởng nhé!');
    }, 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold mb-1 border border-amber-200">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            ĐẤU TRƯỜNG KIẾN THỨC LỚP 4C
          </div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <span>Trò Chơi Học Tập Tương Tác</span>
          </h2>
          <p className="text-sm text-slate-500">
            8 thể thức thi đấu sinh động, chấm điểm thực và tạo câu hỏi tự động bằng AI
          </p>
        </div>

        {/* Score & Streak Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-[10px] text-amber-700 uppercase font-bold">Điểm số</div>
              <div className="text-lg font-black text-amber-900">{score} điểm</div>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-[10px] text-orange-700 uppercase font-bold">Chuỗi đúng</div>
              <div className="text-lg font-black text-orange-900">{streak} liên tiếp</div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Game Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {GAME_LIST.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setSelectedGame(g.id as GameType);
              setCurrentIdx(0);
              setIsAnswered(false);
              setSelectedOption(null);
              setShowExplanation(false);
            }}
            className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition border-2 ${
              selectedGame === g.id
                ? 'border-blue-500 bg-blue-50/80 shadow-md text-blue-700 font-bold scale-[1.03]'
                : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <span className="text-2xl mb-1">{g.icon}</span>
            <span className="text-xs leading-tight">{g.name}</span>
          </button>
        ))}
      </div>

      {/* AI Bulk Generation Action Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Ngân hàng câu hỏi AI:</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-700"
          >
            <option value="Toán">Toán Lớp 4</option>
            <option value="Tiếng Việt">Tiếng Việt Lớp 4</option>
            <option value="Khoa học">Khoa học Lớp 4</option>
            <option value="Lịch sử và Địa lí">Lịch sử & Địa lí</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="Tin học">Tin học</option>
          </select>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Chủ đề bài học..."
            className="text-xs px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-700 min-w-[160px]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleGenerateQuestions(5)}
            disabled={loadingQuestions}
            className="px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-blue-700 font-bold text-xs hover:bg-blue-50 flex items-center gap-1 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingQuestions ? 'animate-spin' : ''}`} />
            Bộ 5 câu
          </button>
          <button
            onClick={() => handleGenerateQuestions(10)}
            disabled={loadingQuestions}
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Tạo Thêm 10 Câu
          </button>
          <button
            onClick={() => handleGenerateQuestions(20)}
            disabled={loadingQuestions}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Tạo 20 Câu
          </button>
        </div>
      </div>

      {/* Specific Game Displays */}

      {/* 1. Rescue Robot Energy Bar Display */}
      {selectedGame === 'rescue' && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <div className="text-xs font-bold text-sky-800">Năng lượng cứu viện Robot AI</div>
              <div className="text-xs text-sky-600">Trả lời đúng để nạp đầy pin 100%!</div>
            </div>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-sky-300">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  robotEnergy > 70 ? 'bg-emerald-500' : robotEnergy > 30 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${robotEnergy}%` }}
              />
            </div>
            <div className="text-right text-[11px] font-bold text-sky-800 mt-1">{robotEnergy}% Năng lượng</div>
          </div>
        </div>
      )}

      {/* 2. Race Track Progress Display */}
      {selectedGame === 'race' && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-red-800">
            <span>Đường đua tri thức Lớp 4C</span>
            <span>Khoảng cách về đích: {100 - carPosition}%</span>
          </div>
          <div className="relative h-10 bg-slate-800 rounded-xl overflow-hidden flex items-center px-4 border-2 border-dashed border-yellow-400">
            <div
              className="absolute transition-all duration-500 text-2xl"
              style={{ left: `calc(${carPosition}% - 24px)` }}
            >
              🏎️
            </div>
            <div className="absolute right-2 text-xl">🏁</div>
          </div>
        </div>
      )}

      {/* 3. Lucky Wheel Display */}
      {selectedGame === 'wheel' && (
        <div className="flex flex-col items-center justify-center p-6 bg-pink-50 rounded-2xl border border-pink-200">
          <div
            className="w-44 h-44 rounded-full border-8 border-white shadow-xl flex items-center justify-center text-4xl font-black bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 text-white transition-transform duration-[2500ms] ease-out"
            style={{ transform: `rotate(${wheelAngle}deg)` }}
          >
            🎁
          </div>
          <button
            onClick={handleSpinWheel}
            disabled={isSpinning}
            className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-sm shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Đang quay...' : 'QUAY NGAY!'}
          </button>
        </div>
      )}

      {/* Active Question Box */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-black">
              Câu {currentIdx + 1} / {questions.length}
            </span>
            <span className="text-xs font-bold text-slate-500">Môn {subject}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* 50:50 Lifeline Button */}
            {selectedGame === 'millionaire' && (
              <button
                onClick={handleFiftyFifty}
                disabled={fiftyFiftyUsed || isAnswered}
                className="px-3 py-1 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-xs hover:bg-amber-600 disabled:opacity-40"
              >
                50:50
              </button>
            )}

            <button
              onClick={() => speechService.speak(currentQ.question)}
              className="text-xs px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              Đọc câu hỏi
            </button>
          </div>
        </div>

        {/* Question Content */}
        <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
          {currentQ.question}
        </h3>

        {/* Hint if available */}
        {currentQ.hint && !isAnswered && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Gợi ý AI:</strong> {currentQ.hint}</span>
          </div>
        )}

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {currentQ.options.map((opt, idx) => {
            const isHidden = hiddenOptions.includes(idx);
            if (isHidden) {
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100 opacity-40 text-center text-xs font-bold text-slate-400"
                >
                  Đã loại bỏ bởi 50:50
                </div>
              );
            }

            let btnStyle = 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 text-slate-800';
            if (isAnswered) {
              if (idx === currentQ.correctAnswer) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
              } else if (idx === selectedOption) {
                btnStyle = 'border-red-500 bg-red-50 text-red-900 font-bold';
              } else {
                btnStyle = 'border-slate-200 bg-white opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectAnswer(idx)}
                className={`p-4 rounded-2xl border-2 text-left text-sm md:text-base font-medium transition shadow-2xs flex items-center justify-between ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && idx === currentQ.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== currentQ.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Button */}
        {showExplanation && (
          <div className="mt-4 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Giải thích chi tiết:
              </span>
              <button
                onClick={() => speechService.speak(currentQ.explanation)}
                className="text-xs text-blue-700 hover:underline font-bold flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Nghe giải thích
              </button>
            </div>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
              {currentQ.explanation}
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md flex items-center gap-2"
              >
                <span>{currentIdx < questions.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả tổng kết 🏆'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
