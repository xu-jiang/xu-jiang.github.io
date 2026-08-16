"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "PORTFOLIOS", href: "/" },
    { name: "PROJECTS", href: "/projects" },
    { name: "ABOUT", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-[100] flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-8 py-3.5 sm:py-8 text-sm sm:text-base tracking-[0.2em] bg-white/90 backdrop-blur-sm pointer-events-auto box-border gap-2 sm:gap-0">
      {/* 手机端第一行：品牌名 */}
      <Link
        href="/"
        className="font-bold text-black uppercase hover:opacity-60 transition-opacity whitespace-nowrap text-sm sm:text-base"
      >
        XU JIANGQI
      </Link>

      {/* 手机端第二行：导航菜单左对齐，使用固定间距 (gap-5) */}
      <nav className="flex justify-start gap-5 sm:gap-8 uppercase text-gray-800 text-xs sm:text-sm tracking-[0.15em] font-semibold">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-opacity ${
                isActive ? "opacity-100 font-bold" : "opacity-60 hover:opacity-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}