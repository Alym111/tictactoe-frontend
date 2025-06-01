"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative z-50">
      {/* Кнопка меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 m-4 rounded-xl bg-[#3E2D1F] text-white hover:bg-[#5A3C2C] transition-colors duration-200"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Меню */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 left-0 h-full w-64 bg-[#FDFBF6] text-[#3E2D1F] p-6 shadow-2xl rounded-tr-3xl rounded-br-3xl border-r border-[#D6C6B8]"
        >
          <h2 className="text-xl font-semibold mb-8 text-[#8B6B4A] tracking-wide">Меню</h2>
          <nav className="flex flex-col gap-4 text-base font-medium">
            <SidebarLink href="/lobby" label="🎮 Лобби" close={() => setIsOpen(false)} />
            <SidebarLink href="/statistics" label="📊 Статистика" close={() => setIsOpen(false)} />
            <SidebarLink href="/rating" label="🏆 Рейтинг" close={() => setIsOpen(false)} />
            <SidebarLink href="/login" label="🚪 Выйти" close={() => setIsOpen(false)} />
          </nav>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ href, label, close }: { href: string; label: string; close: () => void }) {
  return (
    <Link href={href}>
      <span
        onClick={close}
        className="block px-4 py-2 rounded-lg hover:bg-[#EAE8DF] hover:text-[#3E2D1F] transition-all duration-200 cursor-pointer"
      >
        {label}
      </span>
    </Link>
  );
}
