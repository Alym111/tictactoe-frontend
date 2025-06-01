'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрыть меню при клике вне области меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Кнопка-бургер */}
      <button
        className="p-2 m-2 text-white bg-gray-800 rounded-md z-30 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        {"menu"}
      </button>

      {/* Меню */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 z-40 shadow-lg"
        >
          <ul className="space-y-4">
             <li><Link href="/lobby"><span onClick={() => setIsOpen(false)}>🎮 Лобби</span></Link></li>
            <li><Link href="/statistics"><span onClick={() => setIsOpen(false)}>Statistic</span></Link></li>
            <li><Link href="/rating"><span onClick={() => setIsOpen(false)}>Rating</span></Link></li>
            <li><Link href="/login"><span onClick={() => setIsOpen(false)}>Logout</span></Link></li>
          </ul>
        </div>
      )}
    </div>
  );
}