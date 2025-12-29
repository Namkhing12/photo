'use client';

import React, { useState } from 'react';
// เช็ค Path ให้ตรงนะครับ (ถ้าอยู่ในโฟลเดอร์ screen ให้ใช้ตามนี้)
import PhotoBooth from './screen/PhotoBooth'; 
import PhotoEditor from './screen/PhotoEditor'; 

export default function Home() {
  const [isFinished, setIsFinished] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  

  const [currentFilter, setCurrentFilter] = useState<string>(''); 


  const handleFinish = (capturedPhotos: string[], filterClass: string) => {
    // console.log("ได้รับฟิลเตอร์:", filterClass); // เช็คค่าได้ที่นี่
    setPhotos(capturedPhotos);
    setCurrentFilter(filterClass); // บันทึกชื่อฟิลเตอร์
    setIsFinished(true);
  };

  const resetAll = () => {
    setPhotos([]);
    setCurrentFilter(''); // ล้างค่าฟิลเตอร์ตอนเริ่มใหม่
    setIsFinished(false);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (isFinished) {
    return (
      <PhotoEditor 
        photos={photos} 
        onRetake={resetAll} 
        onRemovePhoto={handleRemovePhoto}
        filterClass={currentFilter} // 3. [สำคัญ] ส่งฟิลเตอร์ไปให้หน้าแต่งรูปใช้
      />
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <PhotoBooth onFinish={handleFinish} />
    </main>
  );
}