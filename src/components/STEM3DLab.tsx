import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, HelpCircle, Lightbulb, Play, Layers, Compass, CheckCircle2 } from 'lucide-react';
import { speechService } from '../utils/speech';

export type STEMTopic = 
  | 'house'     // Ngôi nhà xanh
  | 'bridge'    // Cầu vượt mini
  | 'solar'     // Hệ Mặt Trời
  | 'circuit'   // Mạch điện cơ bản
  | 'garden'    // Vườn cây thông minh
  | 'city';     // Thành phố tương lai

interface TopicInfo {
  id: STEMTopic;
  title: string;
  badge: string;
  desc: string;
  scienceFocus: string;
}

const TOPICS: TopicInfo[] = [
  { id: 'house', title: 'Ngôi nhà xanh', badge: '🏡', desc: 'Mô hình nhà sinh thái với pin năng lượng mặt trời và thu nước mưa', scienceFocus: 'Năng lượng tái tạo & Tiết kiệm tài nguyên' },
  { id: 'bridge', title: 'Cầu vượt mini', badge: '🌉', desc: 'Kết cấu chịu lực vòm và dầm chống rung lắc giao thông', scienceFocus: 'Kỹ thuật kết cấu & An toàn giao thông' },
  { id: 'solar', title: 'Hệ Mặt Trời', badge: '🪐', desc: 'Mô phỏng 8 hành tinh quay quanh Mặt Trời theo quỹ đạo', scienceFocus: 'Vũ trụ học & Trọng lực' },
  { id: 'circuit', title: 'Mạch điện cơ bản', badge: '💡', desc: 'Mạch kín gồm nguồn điện (pin), công tắc và bóng đèn phát sáng', scienceFocus: 'Dòng điện & Vật liệu dẫn điện' },
  { id: 'garden', title: 'Vườn cây thông minh', badge: '🌱', desc: 'Hệ thống tưới ẩm tự động với cảm biến độ ẩm đất', scienceFocus: 'Nông nghiệp công nghệ cao & Sinh thái' },
  { id: 'city', title: 'Thành phố tương lai', badge: '🏙️', desc: 'Đô thị xanh phát triển bền vững với tuabin gió và xe điện', scienceFocus: 'Bảo vệ môi trường & Quy hoạch đô thị' },
];

export const STEM3DLab: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<STEMTopic>('house');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [rotX, setRotX] = useState<number>(25);
  const [rotY, setRotY] = useState<number>(45);
  const [interactiveState, setInteractiveState] = useState<{ [key: string]: boolean }>({
    lightOn: true,
    solarActive: true,
    pumpActive: false,
    carMoving: true,
  });

  const [aiGuide, setAiGuide] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fetch AI STEM guide when topic changes
  const fetchStemGuide = async (topicId: STEMTopic) => {
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return;

    setLoadingAi(true);
    setAiGuide('');
    try {
      const res = await fetch('/api/gemini/stem-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelName: topic.title }),
      });
      const data = await res.json();
      if (data.guide) {
        setAiGuide(data.guide);
      }
    } catch (e) {
      setAiGuide(`Robot AI gợi ý: Với mô hình ${topic.title}, em hãy quan sát xem các bộ phận phối hợp với nhau thế nào để tạo ra hiệu quả cao nhất nhé!`);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchStemGuide(selectedTopic);
  }, [selectedTopic]);

  // Canvas 3D rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (selectedTopic === 'solar') {
        bgGrad.addColorStop(0, '#0B0F19');
        bgGrad.addColorStop(1, '#1E1B4B');
      } else {
        bgGrad.addColorStop(0, '#F0F9FF');
        bgGrad.addColorStop(1, '#E0F2FE');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Auto rotation
      if (isRotating) {
        setRotY(prev => (prev + 0.5) % 360);
      }

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);

      // Convert angles to radians
      const radY = (rotY * Math.PI) / 180;
      const radX = (rotX * Math.PI) / 180;

      // Project 3D point (x, y, z) -> 2D (px, py)
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        const x1 = x * Math.cos(radY) + z * Math.sin(radY);
        const z1 = -x * Math.sin(radY) + z * Math.cos(radY);
        // Rotate around X
        const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);
        return { x: x1, y: y2, z: z2 };
      };

      // Draw Grid ground
      if (selectedTopic !== 'solar') {
        ctx.strokeStyle = '#BAE6FD';
        ctx.lineWidth = 1;
        const gridSize = 160;
        const step = 40;
        for (let i = -gridSize; i <= gridSize; i += step) {
          const p1 = project(i, 80, -gridSize);
          const p2 = project(i, 80, gridSize);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          const p3 = project(-gridSize, 80, i);
          const p4 = project(gridSize, 80, i);
          ctx.beginPath();
          ctx.moveTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.stroke();
        }
      }

      // Draw Specific Model
      if (selectedTopic === 'house') {
        // Ngôi nhà xanh
        // Base house cube
        draw3DCube(ctx, project, 0, 30, 0, 100, 80, 100, '#FEF08A', '#FDE047', '#EAB308');
        // Green Roof
        draw3DRoof(ctx, project, 0, -25, 0, 110, 50, 110, '#22C55E');
        // Solar panel on roof
        const panelP1 = project(-30, -35, 20);
        const panelP2 = project(30, -35, 20);
        const panelP3 = project(30, -10, 52);
        const panelP4 = project(-30, -10, 52);
        ctx.fillStyle = interactiveState.solarActive ? '#38BDF8' : '#64748B';
        ctx.beginPath();
        ctx.moveTo(panelP1.x, panelP1.y);
        ctx.lineTo(panelP2.x, panelP2.y);
        ctx.lineTo(panelP3.x, panelP3.y);
        ctx.lineTo(panelP4.x, panelP4.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0284C7';
        ctx.stroke();

        // Rainwater barrel
        draw3DCylinder(ctx, project, 65, 45, 20, 20, 45, '#3B82F6');

        // Door & Window
        const door = project(0, 50, 51);
        ctx.fillStyle = '#92400E';
        ctx.fillRect(door.x - 12, door.y - 20, 24, 35);

        // Eco-badge glowing
        ctx.fillStyle = '#16A34A';
        ctx.font = 'bold 12px sans-serif';
        const label = project(0, -60, 0);
        ctx.fillText('☀️ Pin Mặt Trời & Nước Mưa', label.x - 70, label.y);

      } else if (selectedTopic === 'circuit') {
        // Mạch điện cơ bản
        // Battery
        draw3DCylinder(ctx, project, -80, 20, 0, 25, 60, '#EF4444');
        // Lightbulb
        const bulbP = project(70, 20, 0);
        ctx.beginPath();
        ctx.arc(bulbP.x, bulbP.y - 30, 24, 0, Math.PI * 2);
        ctx.fillStyle = interactiveState.lightOn ? '#FDE047' : '#94A3B8';
        ctx.shadowColor = interactiveState.lightOn ? '#FBBF24' : 'transparent';
        ctx.shadowBlur = interactiveState.lightOn ? 25 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Switch
        const switchP = project(0, 60, 50);
        ctx.fillStyle = '#334155';
        ctx.fillRect(switchP.x - 20, switchP.y - 10, 40, 20);
        ctx.fillStyle = interactiveState.lightOn ? '#22C55E' : '#EF4444';
        ctx.beginPath();
        ctx.arc(switchP.x, switchP.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Copper wires
        ctx.strokeStyle = interactiveState.lightOn ? '#F59E0B' : '#64748B';
        ctx.lineWidth = 4;
        const bTop = project(-80, -10, 0);
        const bulbBottom = project(70, 30, 0);
        const bBottom = project(-80, 50, 0);
        ctx.beginPath();
        ctx.moveTo(bTop.x, bTop.y);
        ctx.lineTo(bulbP.x, bulbP.y - 50);
        ctx.lineTo(bulbBottom.x, bulbBottom.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bulbBottom.x, bulbBottom.y);
        ctx.lineTo(switchP.x + 15, switchP.y);
        ctx.moveTo(switchP.x - 15, switchP.y);
        ctx.lineTo(bBottom.x, bBottom.y);
        ctx.stroke();

      } else if (selectedTopic === 'solar') {
        // Hệ Mặt Trời
        // Sun
        const sun = project(0, 0, 0);
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, 32, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Orbits and planets
        const planets = [
          { name: 'Thủy tinh', r: 60, size: 5, color: '#94A3B8', speed: 2 },
          { name: 'Kim tinh', r: 90, size: 7, color: '#FDE047', speed: 1.5 },
          { name: 'Trái Đất', r: 130, size: 8, color: '#38BDF8', speed: 1.1 },
          { name: 'Hỏa tinh', r: 170, size: 6, color: '#EF4444', speed: 0.9 },
        ];

        planets.forEach((p, idx) => {
          // Orbit circle
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.2) {
            const op = project(Math.cos(a) * p.r, 0, Math.sin(a) * p.r);
            if (a === 0) ctx.moveTo(op.x, op.y);
            else ctx.lineTo(op.x, op.y);
          }
          ctx.closePath();
          ctx.stroke();

          // Planet position
          const angle = (Date.now() / 1000 * p.speed + idx * 2) % (Math.PI * 2);
          const pos = project(Math.cos(angle) * p.r, 0, Math.sin(angle) * p.r);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '10px sans-serif';
          ctx.fillText(p.name, pos.x - 15, pos.y - 10);
        });

      } else if (selectedTopic === 'bridge') {
        // Cầu vượt mini
        // Piers (Trụ cầu)
        draw3DCylinder(ctx, project, -70, 40, 0, 16, 80, '#94A3B8');
        draw3DCylinder(ctx, project, 70, 40, 0, 16, 80, '#94A3B8');
        // Road deck (Mặt cầu)
        draw3DCube(ctx, project, 0, -5, 0, 220, 14, 60, '#64748B', '#475569', '#334155');
        // Guardrails
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        const g1 = project(-110, -15, 25);
        const g2 = project(110, -15, 25);
        ctx.beginPath();
        ctx.moveTo(g1.x, g1.y);
        ctx.lineTo(g2.x, g2.y);
        ctx.stroke();

      } else if (selectedTopic === 'garden') {
        // Vườn cây thông minh
        draw3DCube(ctx, project, 0, 40, 0, 160, 40, 120, '#854D0E', '#713F12', '#582F0E');
        // 3 Plants
        [-40, 0, 40].forEach((px) => {
          const stem = project(px, 15, 0);
          ctx.strokeStyle = '#15803D';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(stem.x, stem.y + 10);
          ctx.lineTo(stem.x, stem.y - 30);
          ctx.stroke();

          ctx.fillStyle = '#22C55E';
          ctx.beginPath();
          ctx.arc(stem.x - 10, stem.y - 25, 12, 0, Math.PI * 2);
          ctx.arc(stem.x + 10, stem.y - 25, 12, 0, Math.PI * 2);
          ctx.arc(stem.x, stem.y - 38, 14, 0, Math.PI * 2);
          ctx.fill();
        });

        // Moisture Sensor & Pipe
        const sensor = project(60, 20, 20);
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(sensor.x - 8, sensor.y - 25, 16, 30);

      } else {
        // Thành phố tương lai
        // Wind turbine
        draw3DCylinder(ctx, project, -80, 20, -40, 8, 100, '#E2E8F0');
        const bladeHub = project(-80, -35, -40);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 4;
        const t = Date.now() / 400;
        for (let b = 0; b < 3; b++) {
          const bAngle = t + (b * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.moveTo(bladeHub.x, bladeHub.y);
          ctx.lineTo(bladeHub.x + Math.cos(bAngle) * 45, bladeHub.y + Math.sin(bAngle) * 45);
          ctx.stroke();
        }

        // Green Towers
        draw3DCube(ctx, project, 10, 10, 0, 60, 120, 60, '#10B981', '#059669', '#047857');
        draw3DCube(ctx, project, 75, 25, -20, 50, 90, 50, '#3B82F6', '#2563EB', '#1D4ED8');
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [selectedTopic, isRotating, zoom, rotX, rotY, interactiveState]);

  // Helper 3D geometry drawing functions
  function draw3DCube(
    ctx: CanvasRenderingContext2D,
    project: (x: number, y: number, z: number) => { x: number; y: number },
    cx: number, cy: number, cz: number,
    w: number, h: number, d: number,
    topColor: string, frontColor: string, sideColor: string
  ) {
    const hw = w / 2;
    const hh = h / 2;
    const hd = d / 2;

    const p = [
      project(cx - hw, cy - hh, cz - hd),
      project(cx + hw, cy - hh, cz - hd),
      project(cx + hw, cy + hh, cz - hd),
      project(cx - hw, cy + hh, cz - hd),
      project(cx - hw, cy - hh, cz + hd),
      project(cx + hw, cy - hh, cz + hd),
      project(cx + hw, cy + hh, cz + hd),
      project(cx - hw, cy + hh, cz + hd),
    ];

    // Top face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    ctx.lineTo(p[1].x, p[1].y);
    ctx.lineTo(p[5].x, p[5].y);
    ctx.lineTo(p[4].x, p[4].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.stroke();

    // Front face
    ctx.fillStyle = frontColor;
    ctx.beginPath();
    ctx.moveTo(p[4].x, p[4].y);
    ctx.lineTo(p[5].x, p[5].y);
    ctx.lineTo(p[6].x, p[6].y);
    ctx.lineTo(p[7].x, p[7].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Side face
    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.moveTo(p[1].x, p[1].y);
    ctx.lineTo(p[2].x, p[2].y);
    ctx.lineTo(p[6].x, p[6].y);
    ctx.lineTo(p[5].x, p[5].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function draw3DRoof(
    ctx: CanvasRenderingContext2D,
    project: (x: number, y: number, z: number) => { x: number; y: number },
    cx: number, cy: number, cz: number,
    w: number, h: number, d: number,
    roofColor: string
  ) {
    const hw = w / 2;
    const hd = d / 2;
    const p1 = project(cx - hw, cy + h / 2, cz - hd);
    const p2 = project(cx + hw, cy + h / 2, cz - hd);
    const p3 = project(cx + hw, cy + h / 2, cz + hd);
    const p4 = project(cx - hw, cy + h / 2, cz + hd);
    const peakFront = project(cx, cy - h / 2, cz + hd);
    const peakBack = project(cx, cy - h / 2, cz - hd);

    ctx.fillStyle = roofColor;
    // Front triangle
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(peakFront.x, peakFront.y);
    ctx.closePath();
    ctx.fill();

    // Side roof slope
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(peakFront.x, peakFront.y);
    ctx.lineTo(peakBack.x, peakBack.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fill();
  }

  function draw3DCylinder(
    ctx: CanvasRenderingContext2D,
    project: (x: number, y: number, z: number) => { x: number; y: number },
    cx: number, cy: number, cz: number,
    r: number, h: number,
    color: string
  ) {
    const top = project(cx, cy - h / 2, cz);
    const bottom = project(cx, cy + h / 2, cz);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(top.x, top.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(top.x - r, top.y, r * 2, bottom.y - top.y);

    ctx.beginPath();
    ctx.arc(bottom.x, bottom.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouse drag handlers for rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setIsRotating(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    setRotY(prev => (prev + deltaX * 0.8) % 360);
    setRotX(prev => Math.max(-60, Math.min(60, prev - deltaY * 0.6)));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const currentTopic = TOPICS.find(t => t.id === selectedTopic)!;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold mb-1 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            PHÒNG THỰC HÀNH STEM 3D TƯƠNG TÁC
          </div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <span>{currentTopic.badge}</span>
            <span>{currentTopic.title}</span>
          </h2>
          <p className="text-sm text-slate-500">{currentTopic.desc}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
              isRotating ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            {isRotating ? 'Tự Xoay: BẬT' : 'Tự Xoay: TẮT'}
          </button>

          <button
            onClick={() => setZoom(prev => Math.min(1.8, prev + 0.15))}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Special Toggle for Circuit / Solar */}
          {selectedTopic === 'circuit' && (
            <button
              onClick={() => {
                setInteractiveState(prev => ({ ...prev, lightOn: !prev.lightOn }));
                speechService.speak(interactiveState.lightOn ? 'Đã ngắt công tắc! Mạch hở, bóng đèn tắt.' : 'Đã đóng công tắc! Mạch kín, bóng đèn phát sáng!');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                interactiveState.lightOn ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-700'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {interactiveState.lightOn ? 'Bật Đèn' : 'Tắt Đèn'}
            </button>
          )}
        </div>
      </div>

      {/* Topic Switcher Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 my-4">
        {TOPICS.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition border-2 ${
              selectedTopic === t.id
                ? 'border-blue-500 bg-blue-50/80 shadow-md text-blue-700 font-bold scale-[1.02]'
                : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <span className="text-2xl mb-1">{t.badge}</span>
            <span className="text-xs leading-tight">{t.title}</span>
          </button>
        ))}
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden border border-blue-100 bg-slate-900 shadow-inner">
        <canvas
          ref={canvasRef}
          width={760}
          height={400}
          className="w-full h-[360px] md:h-[420px] cursor-grab active:cursor-grabbing block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          Kéo chuột hoặc ngón tay để xoay 360 độ • Cuộn để phóng to
        </div>

        {/* Scientific Focus Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs px-3 py-1.5 rounded-xl font-bold shadow-sm flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          {currentTopic.scienceFocus}
        </div>
      </div>

      {/* AI Guiding Questions and STEM Guide */}
      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              AI
            </div>
            <h4 className="font-bold text-slate-800 text-sm">
              Cố Vấn STEM AI: Câu hỏi khám phá & Hướng dẫn sáng tạo
            </h4>
          </div>

          <button
            onClick={() => speechService.speak(aiGuide || currentTopic.desc)}
            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 flex items-center gap-1 shadow-xs"
          >
            <Play className="w-3 h-3" />
            Nghe đọc tiếng Việt
          </button>
        </div>

        {loadingAi ? (
          <div className="text-xs text-slate-500 py-3 flex items-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
            Robot AI đang tải câu hỏi định hướng cho mô hình {currentTopic.title}...
          </div>
        ) : (
          <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-2">
            {aiGuide || (
              <>
                <p className="font-semibold text-blue-800 mb-1">Ý tưởng khoa học Lớp 4:</p>
                <p className="mb-2">Mô hình này giúp em hiểu cách thức vận hành của {currentTopic.title}. Em hãy thử trả lời các câu hỏi sau:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Bộ phận quan trọng nhất trong mô hình này là gì?</li>
                  <li>Nếu thay đổi kích thước hoặc nguồn năng lượng, kết quả sẽ ra sao?</li>
                  <li>Em có thể tận dụng vật liệu tái chế nào trong gia đình để tự làm mô hình này?</li>
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
