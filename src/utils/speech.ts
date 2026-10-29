/**
 * Enhanced Vietnamese Speech Service (vi-VN)
 * 1. Primary: Server-side Gemini Vietnamese TTS (natural native Vietnamese pronunciation)
 * 2. Secondary: Client Web Speech API (strictly requiring Vietnamese voice; never English)
 * 3. Fallback: Cheerful Web Audio chimes for positive feedback without English voice distortion
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isMuted: boolean = false;
  private speedRate: number = 0.95;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.synth && (!this.voices || this.voices.length === 0)) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  /**
   * Find genuine Vietnamese voice
   */
  public findVietnameseVoice(): SpeechSynthesisVoice | undefined {
    const list = this.getVoices();
    return list.find(v => {
      const l = v.lang.toLowerCase();
      const n = v.name.toLowerCase();
      return (
        l.includes('vi-vn') ||
        l.includes('vi_vn') ||
        l.startsWith('vi') ||
        n.includes('vietnamese') ||
        n.includes('tiếng việt') ||
        n.includes('viet nam') ||
        n.includes('an') ||
        n.includes('linh') ||
        n.includes('hoaimy') ||
        n.includes('mai')
      );
    });
  }

  public hasVietnameseVoice(): boolean {
    return !!this.findVietnameseVoice();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setSpeed(rate: number) {
    this.speedRate = Math.max(0.6, Math.min(1.5, rate));
  }

  public getSpeed(): number {
    return this.speedRate;
  }

  public stop() {
    // Stop server audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Stop browser synth
    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    const audioPlaying = this.currentAudio ? !this.currentAudio.paused : false;
    const synthSpeaking = this.synth ? this.synth.speaking : false;
    return audioPlaying || synthSpeaking;
  }

  /**
   * Speak strictly in Vietnamese
   */
  public async speak(text: string, onEnd?: () => void) {
    if (this.isMuted) return;

    this.stop();

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return;

    // 1. First try Server-side Gemini Vietnamese TTS
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const audio = new Audio(`data:${data.format || 'audio/wav'};base64,${data.audio}`);
          this.currentAudio = audio;
          audio.onended = () => {
            this.currentAudio = null;
            if (onEnd) onEnd();
          };
          audio.onerror = () => {
            this.currentAudio = null;
            this.speakWithClientSynth(cleanText, onEnd);
          };
          await audio.play();
          return;
        }
      }
    } catch (e) {
      // Server TTS unavailable, fallback to client
    }

    // 2. Client Web Speech API fallback
    this.speakWithClientSynth(cleanText, onEnd);
  }

  private speakWithClientSynth(text: string, onEnd?: () => void) {
    if (!this.synth) {
      this.playChime();
      if (onEnd) onEnd();
      return;
    }

    const viVoice = this.findVietnameseVoice();

    // CRITICAL: If no Vietnamese voice exists on this computer, NEVER speak in English!
    // Instead play happy celebratory tone so student does NOT hear mangled English pronunciation!
    if (!viVoice) {
      console.info('Trình duyệt chưa cài giọng đọc vi-VN, phát âm thanh giai điệu khích lệ tiếng Việt.');
      this.playChime();
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.voice = viVoice;
    utterance.rate = this.speedRate;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.currentUtterance = null;
      this.playChime();
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Pleasant chime sound via Web Audio API (never plays foreign words)
   */
  public playChime() {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }

      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // 3 pleasant harmonic notes (C5, E5, G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      // AudioContext not allowed or not supported
    }
  }

  // Pre-configured Praise audio phrases for 4th graders in Vietnamese
  public praiseCorrect() {
    const praises = [
      "Chúc mừng em! Em đã hoàn thành rất tốt nhiệm vụ này!",
      "Giỏi lắm! Câu trả lời của em hoàn toàn chính xác!",
      "Xuất sắc! Chúng mình cùng khám phá câu hỏi tiếp theo nào!",
      "Tuyệt vời! Em có tư duy rất nhạy bén đấy!"
    ];
    const picked = praises[Math.floor(Math.random() * praises.length)];
    this.speak(picked);
    return picked;
  }

  public praiseEncouragement() {
    const encouragements = [
      "Em hãy thử suy nghĩ thêm một chút nhé, sắp đúng rồi!",
      "Đừng lo lắng, Robot AI sẽ gợi ý để em tìm ra đáp án nhé!",
      "Cố lên em! Mỗi lần thử là một lần chúng mình hiểu sâu hơn!"
    ];
    const picked = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.speak(picked);
    return picked;
  }
}

export const speechService = new SpeechService();
