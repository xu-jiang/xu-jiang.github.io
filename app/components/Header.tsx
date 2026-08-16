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
    <header className="fixed top-0 inset-x-0 z-[100] flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-[2vw] py-3.5 sm:py-8 bg-white/90 backdrop-blur-sm border-b border-neutral-100 sm:border-none pointer-events-auto gap-3.5 sm:gap-0">
      {/* 品牌名 */}
      <Link
        href="/"
        className="font-bold text-black uppercase hover:opacity-60 transition-opacity whitespace-nowrap text-xs sm:text-base tracking-[0.2em] leading-none"
      >
        XU JIANGQI
      </Link>

      {/* 导航菜单 */}
      <nav className="flex justify-start items-center gap-5 sm:gap-8 uppercase text-gray-800 text-[10px] sm:text-sm tracking-[0.15em] font-semibold leading-none">
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