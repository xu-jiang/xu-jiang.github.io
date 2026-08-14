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
    <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 py-8 text-sm sm:text-base tracking-[0.2em] bg-white/80 backdrop-blur-sm pointer-events-auto">
      <Link
        href="/"
        className="font-bold text-black uppercase hover:opacity-60 transition-opacity"
      >
        XU JIANGQI
      </Link>
      <nav className="flex gap-8 uppercase text-gray-800 text-xs sm:text-sm tracking-[0.15em] font-semibold">
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