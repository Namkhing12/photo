'use client';

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import {
  Camera, ChevronDown, Upload, Sparkles,
  RefreshCw, ArrowRight, X, Image as ImageIcon, Trash2, FlipHorizontal
} from 'lucide-react';

// --- 1. ส่วนประกอบไอคอนเฟรม (CSS Drawing) ---
const FrameIcon = ({ type }: { type: string }) => {
  const baseClass = "border border-gray-400 bg-gray-100";
  
  if (type === '2-v') return (
    <div className="flex flex-col gap-[1px] w-3 h-5">
      <div className={`w-full h-1/2 ${baseClass}`}></div>
      <div className={`w-full h-1/2 ${baseClass}`}></div>
    </div>
  );
  if (type === '3-v') return (
    <div className="flex flex-col gap-[1px] w-3 h-5">
      <div className={`w-full h-1/3 ${baseClass}`}></div>
      <div className={`w-full h-1/3 ${baseClass}`}></div>
      <div className={`w-full h-1/3 ${baseClass}`}></div>
    </div>
  );
  if (type === '4-v') return (
    <div className="flex flex-col gap-[1px] w-3 h-5">
      <div className={`w-full h-1/4 ${baseClass}`}></div>
      <div className={`w-full h-1/4 ${baseClass}`}></div>
      <div className={`w-full h-1/4 ${baseClass}`}></div>
      <div className={`w-full h-1/4 ${baseClass}`}></div>
    </div>
  );
  if (type === '4-grid') return (
    <div className="grid grid-cols-2 gap-[1px] w-4 h-4">
      <div className={`aspect-square ${baseClass}`}></div>
      <div className={`aspect-square ${baseClass}`}></div>
      <div className={`aspect-square ${baseClass}`}></div>
      <div className={`aspect-square ${baseClass}`}></div>
    </div>
  );
  if (type === '6-grid') return (
    <div className="grid grid-cols-2 gap-[1px] w-4 h-5">
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
    </div>
  );
  if (type === '8-grid') return (
    <div className="grid grid-cols-2 gap-[1px] w-4 h-6">
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
      <div className={`h-1.5 ${baseClass}`}></div>
    </div>
  );
  if (type === '10-grid') return (
    <div className="grid grid-cols-2 gap-[1px] w-4 h-8">
      {[...Array(10)].map((_, i) => (
        <div key={i} className={`h-1.5 ${baseClass}`}></div>
      ))}
    </div>
  );
  
  return <div className={`w-4 h-4 ${baseClass}`}></div>;
};

// --- 2. ข้อมูลตัวเลือกต่างๆ ---
type FrameOption = {
  id: string;
  label: string;
  count: number; 
  iconType: string;
};

const frameOptions: FrameOption[] = [
  { id: '1-full',  label: '1 รูปภาพ', count: 1, iconType: '1-full' },
  { id: '2-strip', label: '2 รูปภาพ', count: 2, iconType: '2-v' },
  { id: '4-grid',  label: '4 รูปภาพ', count: 4, iconType: '4-grid' },
  { id: '6-grid',  label: '6 รูปภาพ', count: 6, iconType: '6-grid' },
  { id: '8-grid',  label: '8 รูปภาพ', count: 8, iconType: '8-grid' },
  { id: '10-grid', label: '10 รูปภาพ', count: 10, iconType: '10-grid' },
];

const timerOptions = [0, 3, 5, 10];

const filters = [
  { id: 'normal', name: '✨ ปกติ', class: '' },
  { id: 'soft', name: '☁️ นุ่มนวล', class: 'contrast-90 brightness-110 saturate-150' },
  { id: 'country', name: '🤠 คันทรี', class: 'contrast-125 sepia-[.2]' },
  { id: 'bw', name: '🌑 ขาวดำ', class: 'grayscale' },
  { id: 'vintage', name: '🎞️ วินเทจ', class: 'sepia contrast-110 brightness-90' },
  { id: 'old-photo', name: '📜 รูปเก่า', class: 'sepia-[.6] contrast-125 brightness-90 blur-[0.5px]' },
  { id: 'amber', name: '🌅 อำพัน', class: 'sepia-[.4] contrast-110 saturate-150' },
  { id: 'summer', name: '☀️ สดใส', class: 'brightness-110 saturate-150 sepia-[.1]' },
  { id: 'noir', name: '🎬 ฟิล์มดำ', class: 'grayscale contrast-150 brightness-90' },
];

interface PhotoBoothProps {
  onFinish?: (photos: string[], filterClass: string) => void;
}

export default function PhotoBooth({ onFinish }: PhotoBoothProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [photos, setPhotos] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Settings
  const [selectedFrame, setSelectedFrame] = useState<FrameOption>(frameOptions[0]);
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [timerSetting, setTimerSetting] = useState<number>(3);
  
  // UI Controls
  const [countDown, setCountDown] = useState<number | null>(null);
  const [showFrameMenu, setShowFrameMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  // --- Functions ---

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  const startCapture = useCallback(() => {
    setShowFrameMenu(false);
    setShowTimerMenu(false);

    const takePhoto = () => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setPhotos(prev => [...prev, imageSrc]);
      }
      setCountDown(null);
    };

    if (timerSetting === 0) {
      takePhoto();
      return;
    }

    let time = timerSetting;
    setCountDown(time);
    
    const interval = setInterval(() => {
      time -= 1;
      setCountDown(time);
      if (time === 0) {
        clearInterval(interval);
        takePhoto();
      }
    }, 1000);
  }, [webcamRef, timerSetting]);

  const resetAll = () => {
    setPhotos([]);
  };

  const deletePhoto = (indexToDelete: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const activeFilterClass = filters.find(f => f.id === selectedFilter)?.class || '';
  const isComplete = photos.length >= selectedFrame.count;

  return (
    <div 
      className="w-full min-h-[100dvh] bg-[#FFF0F5] relative font-sans selection:bg-pink-200 overflow-x-hidden flex flex-col"
      onClick={() => {
        if(showFrameMenu) setShowFrameMenu(false);
        if(showTimerMenu) setShowTimerMenu(false);
      }}
    >
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center p-2 md:p-8">
        
        <div 
          className="bg-white/60 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/50 p-4 md:p-8 w-full max-w-5xl flex flex-col md:flex-row gap-4 md:gap-8 items-start justify-center transition-all"
          onClick={(e) => e.stopPropagation()} 
        >
          {/* LEFT SIDE: Camera & Controls */}
          <div className="flex-1 w-full flex flex-col items-center">
            
            <div className="md:hidden text-center mb-2">
               <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 justify-center">
                 <Sparkles className="text-pink-500" size={18} /> Photo Booth
               </h1>
            </div>

            {/* Top Bar Controls */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center w-full z-50">
               <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowFrameMenu(!showFrameMenu); setShowTimerMenu(false); }}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs md:text-sm font-bold hover:border-pink-300 transition-all shadow-sm min-w-[110px] md:min-w-[130px] justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FrameIcon type={selectedFrame.iconType} />
                      <span>{selectedFrame.label}</span>
                    </div>
                    <ChevronDown size={14} className={`opacity-50 ${showFrameMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showFrameMenu && (
                    <div className="absolute top-full left-0 mt-2 w-[240px] md:w-[280px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-2 grid grid-cols-2 gap-1 z-50 animate-in fade-in zoom-in-95">
                      {frameOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => { 
                             setSelectedFrame(option); 
                             setPhotos([]); 
                             setShowFrameMenu(false); 
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm transition-colors text-left ${selectedFrame.id === option.id ? 'bg-gray-100 font-bold text-gray-900' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <FrameIcon type={option.iconType} />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
               </div>

               <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowTimerMenu(!showTimerMenu); setShowFrameMenu(false); }}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs md:text-sm font-bold hover:border-pink-300 transition-all shadow-sm min-w-[100px] md:min-w-[120px] justify-between"
                  >
                    <span>{timerSetting === 0 ? 'ไม่นับ' : `${timerSetting}s`}</span>
                    <ChevronDown size={14} className={`opacity-50 ${showTimerMenu ? 'rotate-180' : ''}`} />
                  </button>

                   {showTimerMenu && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-1 z-50">
                      {timerOptions.map((time) => (
                        <button
                          key={time}
                          onClick={() => { setTimerSetting(time); setShowTimerMenu(false); }}
                          className={`flex justify-between w-full px-3 py-2 text-xs md:text-sm rounded-lg ${timerSetting === time ? 'bg-pink-50 text-pink-500 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <span>{time === 0 ? 'ปิด' : `${time} วินาที`}</span>
                        </button>
                      ))}
                    </div>
                  )}
               </div>

               <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
               <button 
                 onClick={handleUploadClick}
                 className="flex items-center gap-2 bg-white border border-pink-200 px-3 py-2 rounded-xl text-pink-500 text-xs md:text-sm font-bold hover:bg-pink-50 shadow-sm transition-all"
               >
                 <Upload size={14} />
                 <span>อัปโหลด</span>
               </button>
            </div>

            {/* Camera Area */}
            <div className="relative w-full max-w-[420px] aspect-[3/4] bg-white rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-3 shadow-2xl border border-gray-100 mb-4 md:mb-6 group">
               <div className="relative w-full h-full rounded-[1rem] md:rounded-[1.5rem] overflow-hidden bg-gray-900">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    mirrored={facingMode === 'user'}
                    videoConstraints={{ 
                      facingMode: facingMode,
                      // ใช้ค่าความละเอียดสูงเพื่อความชัดเจนเวลาขยายเต็มกรอบ
                      width: { ideal: 1440 },
                      height: { ideal: 1920 },
                      aspectRatio: 3/4 
                    }}
                    // ใช้ object-cover เพื่อให้ภาพเต็มกรอบ (Full Bleed)
                    className={`w-full h-full object-cover transition-all duration-700 ${activeFilterClass}`}
                  />
                  
                  {/* Floating Flip Camera Button */}
                  <button 
                    onClick={toggleCamera}
                    className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-pink-500 transition-all z-40 active:scale-90 border border-white/20"
                    title="สลับกล้องหน้า/หลัง"
                  >
                    <RefreshCw size={18} className={facingMode === 'environment' ? 'rotate-180' : ''} />
                  </button>
                  
                  {/* Countdown Overlay */}
                  {countDown !== null && countDown > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30">
                      <span className="text-8xl md:text-9xl font-bold text-white drop-shadow-lg animate-bounce">
                        {countDown}
                      </span>
                    </div>
                  )}
               </div>
               
               {/* Progress Dots */}
               <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                 {Array.from({ length: selectedFrame.count }).map((_, i) => (
                   <div 
                     key={i} 
                     className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${i < photos.length ? 'bg-pink-500 scale-110' : 'bg-white/50'}`}
                   ></div>
                 ))}
               </div>
            </div>

            {/* Filters Slider */}
            <div className="w-full max-w-[420px]">
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-3 px-2 scrollbar-hide">
                {filters.map((filter) => {
                  const isActive = selectedFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`relative px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${isActive ? 'bg-pink-50 border-pink-400 text-pink-500' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {filter.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 md:mt-4 flex flex-col items-center gap-3 w-full">
              {!isComplete ? (
                <button 
                  onClick={startCapture}
                  disabled={countDown !== null}
                  className="bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white text-base md:text-lg font-bold px-10 py-3.5 md:px-12 md:py-4 rounded-full shadow-lg shadow-pink-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70"
                >
                  <Camera className="w-5 h-5 md:w-6 md:h-6" />
                  <span>{photos.length === 0 ? 'เริ่มจับภาพ' : `ถ่ายรูปที่ ${photos.length + 1}/${selectedFrame.count}`}</span>
                </button>
              ) : (
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center w-full justify-center">
                    <button 
                      onClick={() => deletePhoto(photos.length - 1)}
                      className="bg-gray-100 text-gray-600 px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2 shadow-sm w-full md:w-auto justify-center"
                    >
                      <RefreshCw size={16} /> ถ่ายใหม่
                    </button>

                    <button 
                      onClick={() => onFinish?.(photos, activeFilterClass)}
                      className="bg-gradient-to-r from-[#FF5C8D] to-[#FF8FAB] text-white text-base md:text-lg font-bold px-10 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 animate-pulse w-full md:w-auto justify-center"
                    >
                      <span>ต่อไป</span>
                      <ArrowRight size={20} />
                    </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Preview Strip */}
          <div className="hidden md:flex flex-col gap-4 w-[140px] sticky top-8 h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin">
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider text-center mb-1 sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-10">
                Previews
              </div>
              
              <div className="flex flex-col gap-3 pb-4">
                {Array.from({ length: selectedFrame.count }).map((_, i) => {
                  const photo = photos[i];
                  return (
                    <div key={i} className="relative w-full aspect-[3/4] bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group flex-shrink-0">
                       {photo ? (
                         <>
                           <img src={photo} className={`w-full h-full object-cover ${activeFilterClass}`} />
                           <button 
                             onClick={() => deletePhoto(i)}
                             className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white font-bold text-xs z-10"
                           >
                             <Trash2 size={20} className="text-white hover:text-red-400" />
                           </button>
                         </>
                       ) : (
                         <span className="text-gray-300 font-bold text-xl">{i + 1}</span>
                       )}
                    </div>
                  );
                })}
              </div>
              
              {photos.length > 0 && (
                <button onClick={resetAll} className="text-gray-400 text-xs underline hover:text-red-400 transition-colors text-center pb-4">
                  รีเซ็ตทั้งหมด
                </button>
              )}
          </div>
        </div>

        <div className="mt-6 md:mt-8 text-pink-300/80 text-[10px] md:text-xs font-medium text-center">
          Powered by Next.js & Love 💖
        </div>
      </div>
    </div>
  );
}