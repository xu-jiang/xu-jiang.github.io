"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "PORTFOLIOS", href: "/" },
    { name: "PROJECTS", href: "/projects" },
    { name: "CONTACT", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-[100] flex flex-row items-center justify-between px-4 md:px-[2vw] py-4 sm:py-6 bg-white border-b border-neutral-100 pointer-events-auto">
      {/* 品牌名 */}
      <Link
        href="/"
        className="font-bold text-black uppercase hover:opacity-60 transition-opacity whitespace-nowrap text-xs sm:text-base tracking-[0.2em] leading-none shrink-0"
      >
        XU JIANGQI
      </Link>

      {/* 导航菜单 */}
      <nav className="flex justify-end items-center gap-3.5 sm:gap-8 uppercase text-gray-800 text-[10px] sm:text-sm tracking-[0.15em] font-semibold leading-none shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-opacity whitespace-nowrap ${
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