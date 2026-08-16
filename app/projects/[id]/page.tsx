"use client";

import Link from "next/link";
// 使用相对路径引用，确保能找到 app/components/Header.tsx
import Header from "../../components/Header"; 

const PROJECTS_LIST = [
  { id: "le-jardin-humain", title: "Le Jardin Humain", year: "2026" },
  { id: "une-realite-possible", title: "Une Réalité Possible", year: "2026" },
  { id: "les-poissons-de-l-er...", title: "Les Poissons de l'Er...", year: "2024", active: true },
  { id: "le-vent-souffle", title: "Le Vent Souffle", year: "2022–2025" },
  { id: "portraits", title: "Portraits", year: "2021–" },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-white text-black font-sans box-border selection:bg-none">
      <Header />

      {/* 外层移除 justify-center，改为自然靠左 */}
      <div className="pt-[20vh] pb-[12vh] px-4 md:px-[2vw] w-full box-border">
        
        <div className="w-full max-w-xl md:max-w-2xl pl-[2vw] md:pl-[5vw] space-y-8">
          
          {/* 小标题栏 */}
          <div className="flex justify-between items-center text-xs tracking-[0.2em] text-neutral-400 uppercase pb-2">
            <span>PROJECTS ({PROJECTS_LIST.length})</span>
            <div className="space-x-2 text-[11px]">
              <span className="font-bold text-black">FR</span>
              <span>/</span>
              <span>EN</span>
            </div>
          </div>

          {/* 项目列表 */}
          <div className="space-y-4">
            {PROJECTS_LIST.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex justify-between items-baseline group py-1"
              >
                <span
                  className={`text-base md:text-lg tracking-wide transition-colors ${
                    project.active
                      ? "font-bold text-black"
                      : "text-neutral-400 hover:text-black font-normal"
                  }`}
                >
                  {project.title}
                </span>

                <span className="text-xs md:text-sm tracking-widest text-neutral-300 font-light ml-8 shrink-0">
                  {project.year}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}