"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { PROJECTS, Project } from "@/data/projects";

// 辅助函数：根据年月进行权重排序 (降序：最新的在最上面)
const sortProjects = (projects: Project[]): Project[] => {
  return [...projects].sort((a, b) => {
    const timeA = parseInt(String(a.year), 10) * 12 + (Number(a.month) || 0);
    const timeB = parseInt(String(b.year), 10) * 12 + (Number(b.month) || 0);
    return timeB - timeA;
  });
};

function getDeterministicDelay(seedStr: string, index: number): number {
  let hash = 0;
  const combined = `${seedStr}-${index}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 350;
}

export default function ProjectsPage() {
  const sortedProjects = useMemo(() => sortProjects(PROJECTS), []);

  const [activeProject, setActiveProject] = useState<Project>(sortedProjects[0]);
  const [activeImage, setActiveImage] = useState<number>(-1);
  const [fullscreen, setFullscreen] = useState(false);
  const [language, setLanguage] = useState<"FR" | "EN">("FR");
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  // 触摸手势相关的 Ref，记录起点坐标和时间
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // 底部缩略图 Container & Items Refs (支持自动滑动置中)
  const thumbContainerRef = useRef<HTMLDivElement | null>(null);
  const thumbItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 监听 activeImage，确保当前选中的缩略图自动滚动平滑居中
  useEffect(() => {
    const currentIndex = activeImage < 0 ? 0 : activeImage;
    const targetThumb = thumbItemRefs.current[currentIndex];
    
    if (targetThumb) {
      targetThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeImage, fullscreen]);

  // 初始化随机选择项目
  useEffect(() => {
    if (sortedProjects.length > 0) {
      const randomIndex = Math.floor(Math.random() * sortedProjects.length);
      const randomProject = sortedProjects[randomIndex];
      setCoverLoaded(false);
      setActiveProject(randomProject);
      setActiveImage(-1);
      setShowDescription(false);
    }
  }, [sortedProjects]);

  // 图片预加载逻辑
  useEffect(() => {
    const images = activeProject?.images || [];
    if (images.length === 0) return;

    if (activeProject.cover) {
      const coverImg = new window.Image();
      coverImg.src = activeProject.cover;
    }

    images.forEach((src) => {
      if (src) {
        const img = new window.Image();
        img.src = src;
      }
    });
  }, [activeProject]);

  const visibleThumbnails = useMemo(() => {
    return activeProject.images.slice(0, 9);
  }, [activeProject.images]);

  const remainingCount = useMemo(() => {
    return Math.max(0, activeProject.images.length - 9);
  }, [activeProject.images]);

  const randomDelays = useMemo(() => {
    return visibleThumbnails.map((_, index) =>
      getDeterministicDelay(activeProject.id, index)
    );
  }, [activeProject.id, visibleThumbnails]);

  const handleProjectSelect = useCallback((project: Project) => {
    setActiveProject((prev) => {
      if (prev.id !== project.id) {
        setCoverLoaded(false);
        return project;
      }
      return prev;
    });
    setActiveImage(-1);
    setShowDescription(false);
  }, []);

  const handleCoverPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverLoaded(true);
    requestAnimationFrame(() => {
      setActiveImage((current) => {
        const total = activeProject.images.length;
        if (total === 0) return -1;
        if (current <= 0) return total - 1;
        return current - 1;
      });
    });
  }, [activeProject.images.length]);

  const handleCoverNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverLoaded(true);
    requestAnimationFrame(() => {
      setActiveImage((current) => {
        const total = activeProject.images.length;
        if (total === 0) return -1;
        if (current >= total - 1) return 0;
        return current + 1;
      });
    });
  }, [activeProject.images.length]);

  const openFullscreen = useCallback((e?: React.MouseEvent | React.SyntheticEvent) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    if (activeImage === -1) {
      setActiveImage(0);
    }
    setFullscreen(true);
  }, [activeImage]);

  const closeFullscreen = useCallback(() => {
    setFullscreen(false);
  }, []);

  const previousImage = useCallback(() => {
    requestAnimationFrame(() => {
      setActiveImage((current) => {
        if (current <= 0) return activeProject.images.length - 1;
        return current - 1;
      });
    });
  }, [activeProject.images.length]);

  const nextImage = useCallback(() => {
    requestAnimationFrame(() => {
      setActiveImage((current) => {
        const total = activeProject.images.length;
        const currentIndex = current < 0 ? 0 : current;

        if (currentIndex >= total - 1) {
          return total - 1;
        }
        return currentIndex + 1;
      });
    });
  }, [activeProject.images.length]);

  // 手机端主页 Cover 区域专属滑动逻辑
  const handleMobileCoverTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleMobileCoverTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      setCoverLoaded(true);
      if (diffX < 0) {
        setActiveImage((current) => {
          const total = activeProject.images.length;
          if (total === 0) return -1;
          if (current >= total - 1) return 0;
          return current + 1;
        });
      } else {
        setActiveImage((current) => {
          const total = activeProject.images.length;
          if (total === 0) return -1;
          if (current <= 0) return total - 1;
          return current - 1;
        });
      }
    }

    touchStartRef.current = null;
  };

  // 全屏触控手势逻辑（只保留左右滑动手势，移除轻触判定）
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startX;
    const diffY = endY - startY;

    // 仅当水平滑动距离超过 40px 时判定为划动，轻触交给 onClick 独立处理
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        nextImage();
      } else {
        previousImage();
      }
    }

    touchStartRef.current = null;
  };

  useEffect(() => {
    if (!fullscreen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        previousImage();
      } else if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown" ||
        event.key === " "
      ) {
        nextImage();
      } else if (event.key === "Escape") {
        closeFullscreen();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen, previousImage, nextImage, closeFullscreen]);

  const currentCoverSrc = useMemo(() => {
    if (activeImage >= 0 && activeProject.images[activeImage]) {
      return activeProject.images[activeImage];
    }
    return activeProject.cover;
  }, [activeProject, activeImage]);

  const activeDescription =
    language === "FR"
      ? activeProject.descriptionFr
      : activeProject.descriptionEn;

  const activeTitle =
    language === "FR"
      ? activeProject.titleFr || activeProject.title
      : activeProject.titleEn || activeProject.title;

  const isLastImage = activeImage === activeProject.images.length - 1;

  return (
    <main className="min-h-screen md:h-screen w-screen overflow-y-auto md:overflow-hidden bg-white text-black font-['Helvetica','Neue',Helvetica,Arial,sans-serif] flex flex-col justify-between select-none touch-manipulation font-normal">
      <style jsx global>{`
        html, body, main, div, aside, section, header {
          cursor: default !important;
        }

        button, a, [role="button"], .clickable {
          cursor: pointer !important;
        }

        button:active, button:focus, a:active, a:focus {
          cursor: pointer !important;
        }

        .gpu-layer {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: opacity, transform;
        }

        img {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          content-visibility: auto;
        }

        @keyframes randomStaggerFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateZ(0);
          }
          to {
            opacity: 1;
            transform: scale(1) translateZ(0);
          }
        }

        .animate-random-fade {
          opacity: 0;
          animation: randomStaggerFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* HEADER */}
      <header className="fixed top-0 left-0 z-40 w-full px-4 md:px-[2.5vw] py-3 md:py-[3vh] flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 bg-white/90 backdrop-blur-md md:bg-white transform-gpu border-b border-neutral-100 md:border-none">
        <Link
          href="/"
          className="text-xs md:text-sm tracking-[0.18em] text-black hover:opacity-50 transition-opacity whitespace-nowrap font-medium"
        >
          XU JIANGQI
        </Link>

        <nav className="flex items-center gap-4 md:gap-[3vw] text-[10px] md:text-xs tracking-[0.18em] uppercase text-black">
          <Link href="/" className="hover:opacity-50 transition-opacity">
            WORK
          </Link>
          <Link href="/projects" className="opacity-40">
            PROJECTS
          </Link>
          <Link href="/about" className="hover:opacity-50 transition-opacity">
            ABOUT
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <div className="pt-[11vh] md:pt-[15vh] px-4 md:px-[2.5vw] h-full overflow-y-auto md:overflow-hidden flex-1 pb-12 md:pb-[4vh]">
        
        {/* ==================== 移动端专属布局 ==================== */}
        <div className="flex md:hidden flex-col gap-6 w-full">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
              PROJECTS ({sortedProjects.length})
            </span>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-black">
              <button
                type="button"
                onClick={() => setLanguage("FR")}
                className={`transition-opacity duration-200 ${language === "FR" ? "opacity-100" : "opacity-30"}`}
              >
                FR
              </button>
              <span className="text-neutral-300">/</span>
              <button
                type="button"
                onClick={() => setLanguage("EN")}
                className={`transition-opacity duration-200 ${language === "EN" ? "opacity-100" : "opacity-30"}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="flex flex-col w-full">
            {sortedProjects.map((project) => {
              const isActive = activeProject.id === project.id;
              const projectTitle = language === "FR" ? project.titleFr || project.title : project.titleEn || project.title;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    handleProjectSelect(project);
                    setShowDescription(true);
                  }}
                  className={`w-full flex items-baseline justify-between text-left py-2.5 transition-opacity duration-300 border-b border-neutral-50 ${
                    isActive ? "opacity-100 text-black font-medium" : "opacity-30 text-black"
                  }`}
                >
                  <span className="text-sm tracking-wide truncate pr-2">{projectTitle}</span>
                  <span className="text-[11px] tracking-[0.15em] text-neutral-400 ml-2 shrink-0">{project.year}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 mt-2 mb-8 w-full">
            <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-neutral-400">
              <span>{activeProject.category}</span>
              <span>{activeProject.year}</span>
            </div>

            <p className="text-xs md:text-base leading-[1.8] font-light text-neutral-600 whitespace-pre-line">
              {activeDescription}
            </p>

            {/* 手机端主图区域 */}
            <div 
              onTouchStart={handleMobileCoverTouchStart}
              onTouchEnd={handleMobileCoverTouchEnd}
              onClick={openFullscreen}
              className="relative w-full mt-2 cursor-pointer flex items-center justify-center group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openFullscreen(e)}
            >
              <img
                src={currentCoverSrc}
                alt={activeTitle}
                className="w-full h-auto block object-contain"
              />
            </div>
          </div>
        </div>

        {/* ==================== 桌面端专属布局 ==================== */}
        <div className="hidden md:grid grid-cols-12 gap-[2vw] h-full items-start">
          
          {/* 左侧列表 */}
          <aside className="col-span-3 lg:col-span-2 h-full overflow-y-auto no-scrollbar shrink-0 pb-[10vh] pl-2 md:pl-3 pr-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                PROJECTS ({sortedProjects.length})
              </span>
              
              <div className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-black">
                <button
                  type="button"
                  onClick={() => setLanguage("FR")}
                  className={`transition-opacity duration-200 ${
                    language === "FR" ? "opacity-100" : "opacity-30 hover:opacity-100"
                  }`}
                >
                  FR
                </button>
                <span className="text-neutral-300">/</span>
                <button
                  type="button"
                  onClick={() => setLanguage("EN")}
                  className={`transition-opacity duration-200 ${
                    language === "EN" ? "opacity-100" : "opacity-30 hover:opacity-100"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              {sortedProjects.map((project) => {
                const isActive = activeProject.id === project.id;
                const projectTitle = language === "FR" ? project.titleFr || project.title : project.titleEn || project.title;

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setShowDescription((prev) => !prev);
                      } else {
                        setCoverLoaded(false);
                        handleProjectSelect(project);
                        setShowDescription(true);
                      }
                    }}
                    className={`w-full flex items-baseline justify-between text-left py-2 select-none transition-opacity duration-300 ${
                      isActive
                        ? "opacity-100 text-black font-medium"
                        : "opacity-30 hover:opacity-60 text-black"
                    }`}
                  >
                    <span className="text-sm lg:text-base tracking-wide pointer-events-none leading-tight truncate whitespace-nowrap pr-2">
                      {projectTitle}
                    </span>
                    <span className="text-xs tracking-[0.15em] text-neutral-400 pointer-events-none shrink-0">
                      {project.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 中间大图 */}
          <section className="col-span-6 lg:col-span-7 flex flex-col items-center h-full justify-start relative">
            <div className="w-full max-w-[88%] flex flex-col items-center">
              
              <div 
                onClick={openFullscreen}
                className="w-full aspect-[3/2] flex justify-center mt-0 mb-4 relative items-center overflow-hidden group cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openFullscreen(e)}
              >
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-neutral-50 transition-opacity duration-500 pointer-events-none ${
                    coverLoaded ? "opacity-0" : "opacity-100 animate-pulse"
                  }`}
                >
                  <span className="text-[9px] tracking-[0.25em] text-neutral-300 uppercase">
                    {language === "FR" ? "Chargement..." : "Loading..."}
                  </span>
                </div>

                {/* 主 Cover 图片 */}
                <img
                  src={currentCoverSrc}
                  alt={activeTitle}
                  loading="eager"
                  decoding="async"
                  onLoad={() => setCoverLoaded(true)}
                  className={`relative z-10 w-full h-full object-contain transition-all duration-700 ease-out gpu-layer pointer-events-none ${
                    !coverLoaded
                      ? "opacity-0 scale-[0.98] blur-sm"
                      : "opacity-100 scale-100 blur-0"
                  }`}
                />

                {/* 左右导航箭头 */}
                <div
                  onClick={handleCoverPrev}
                  title={language === "FR" ? "Précédent" : "Previous"}
                  className="absolute left-0 top-0 bottom-0 w-[50%] z-20 flex items-center justify-start pl-4 group/left cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-8 h-8 rounded-full bg-black/10 group-hover/left:bg-black/20 flex items-center justify-center text-white/70 group-hover/left:text-white transition-all opacity-0 group-hover/left:opacity-100 backdrop-blur-sm transform-gpu pointer-events-none">
                    ‹
                  </div>
                </div>

                <div
                  onClick={handleCoverNext}
                  title={language === "FR" ? "Suivant" : "Next"}
                  className="absolute right-0 top-0 bottom-0 w-[50%] z-20 flex items-center justify-end pr-4 group/right cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-8 h-8 rounded-full bg-black/10 group-hover/right:bg-black/20 flex items-center justify-center text-white/70 group-hover/right:text-white transition-all opacity-0 group-hover/right:opacity-100 backdrop-blur-sm transform-gpu pointer-events-none">
                    ›
                  </div>
                </div>

                {/* 简介面板 */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDescription(false);
                  }}
                  className={`absolute inset-0 z-30 bg-white px-0 pt-0 pb-8 flex flex-col justify-between transition-all duration-500 ease-out cursor-pointer group/desc ${
                    showDescription 
                      ? "opacity-100 pointer-events-auto" 
                      : "opacity-0 pointer-events-none"
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 leading-none">
                      {activeProject.category} / {activeProject.year}
                    </span>
                  </div>

                  <div className="my-auto py-2 flex flex-row items-center justify-between pr-16">
                    <div className="flex-1 pr-8">
                      <p className="text-base md:text-lg leading-[1.8] font-light text-neutral-600 max-w-2xl whitespace-pre-line">
                        {activeDescription}
                      </p>
                    </div>
                    <div className="text-5xl font-light text-neutral-300 group-hover/desc:text-black transition-all duration-300 group-hover/desc:translate-x-2 shrink-0">
                      ›
                    </div>
                  </div>

                  <div className="border-t border-transparent"></div>
                </div>
              </div>

              <div className="w-full px-0 flex items-center justify-between text-xs tracking-[0.16em] uppercase text-neutral-400 pt-2 border-t border-black/5">
                <span className="text-black tracking-wide truncate max-w-[65%]">
                  {language === "FR"
                    ? activeProject.coverCaptionFr
                    : activeProject.coverCaptionEn}
                </span>
                
                <button
                  type="button"
                  onClick={openFullscreen}
                  className="text-neutral-500 hover:text-black transition-colors tracking-[0.15em] uppercase text-[10px] cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>{language === "FR" ? "Lancer le diaporama" : "Enter Slideshow"}</span>
                  <span>↗</span>
                </button>
              </div>

            </div>
          </section>

          {/* 右侧：缩略图列表 */}
          <aside className="col-span-3 lg:col-span-3 h-full overflow-y-auto no-scrollbar">
            <div className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-6 flex justify-between items-center">
              <span>IMAGES ({activeProject.images.length})</span>
            </div>

            <div className="grid grid-cols-3 gap-2" key={activeProject.id}>
              {visibleThumbnails.map((imgSrc, index) => {
                const isLastItem = index === 8;
                const hasMore = isLastItem && remainingCount > 0;
                const delayMs = randomDelays[index] || 0;
                const isSelected = activeImage === index;

                return (
                  <button
                    key={imgSrc}
                    type="button"
                    onClick={() => {
                      if (hasMore) {
                        openFullscreen();
                      } else {
                        if (activeImage !== index) {
                          setCoverLoaded(false);
                          setActiveImage(index);
                        }
                      }
                    }}
                    style={{ animationDelay: `${delayMs}ms` }}
                    className="relative aspect-square overflow-hidden bg-neutral-100 group gpu-layer animate-random-fade cursor-pointer"
                  >
                    <img
                      src={imgSrc}
                      alt={`${activeTitle} ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover transition-opacity duration-200 ease-out pointer-events-none ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-50 hover:opacity-90"
                      }`}
                    />

                    {hasMore && (
                      <div className="absolute inset-0 bg-black/70 hover:bg-black/60 transition-colors flex flex-col items-center justify-center text-white z-10 pointer-events-none">
                        <span className="text-sm font-light tracking-wider">
                          +{remainingCount}
                        </span>
                        <span className="text-[9px] tracking-[0.15em] opacity-80 uppercase mt-0.5">
                          {language === "FR" ? "VOIR PLUS" : "MORE"}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={activeTitle}
        className={`fixed inset-0 z-[100] bg-black text-white flex flex-col justify-between select-none transition-opacity duration-200 ease-out transform-gpu ${
          fullscreen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="hidden md:flex absolute left-10 top-1/2 -translate-y-1/2 z-40 flex-col items-start gap-1.5 pointer-events-none px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 transform-gpu"
        >
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-neutral-400 uppercase font-light">
            <span>PROJECTS</span>
            <span className="text-neutral-600">•</span>
            <span className="text-white tracking-widest">
              {String((activeImage >= 0 ? activeImage : 0) + 1).padStart(2, "0")} / {String(activeProject.images.length).padStart(2, "0")}
            </span>
          </div>
          <span className="text-sm tracking-[0.16em] text-neutral-200 uppercase truncate max-w-[200px]">
            {activeTitle}
          </span>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="flex md:hidden w-full items-center justify-between px-4 py-3 bg-neutral-900 border-b border-white/10 z-40 shrink-0"
        >
          <span className="text-xs tracking-[0.16em] text-neutral-200 uppercase truncate max-w-[60%]">
            {activeTitle}
          </span>
          <span className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase font-light">
            {String((activeImage >= 0 ? activeImage : 0) + 1).padStart(2, "0")} / {String(activeProject.images.length).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeFullscreen();
          }}
          title={language === "FR" ? "Fermer (ESC)" : "Close (ESC)"}
          className="absolute top-16 right-4 md:top-8 md:right-8 z-50 p-2 md:p-2.5 bg-white/10 hover:bg-white/25 rounded-full text-white transition-all backdrop-blur-sm border border-white/10 transform-gpu cursor-pointer"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 中间大图全屏容器：滑动由 onTouchEnd 管理，单击由 onClick 统一管理 */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}
          className="w-full flex-1 flex items-center justify-center p-4 md:px-28 relative z-20 overflow-hidden cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <img
            src={currentCoverSrc}
            alt={activeTitle}
            decoding="async"
            className="max-w-[90vw] md:max-w-[70vw] max-h-[68vh] md:max-h-[88vh] object-contain gpu-layer transition-opacity duration-200 pointer-events-none select-none"
          />
        </div>

        {/* 底部缩略图/控制栏 */}
        {activeProject.images.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-neutral-900/90 backdrop-blur-md border-t border-white/10 px-4 py-3 z-40 shrink-0 flex items-center justify-center"
          >
            {isLastImage ? (
              /* 到达最后一张图时的选项 */
              <div className="flex items-center justify-center gap-6 w-full py-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(0);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-full text-xs tracking-[0.18em] uppercase text-white transition-all cursor-pointer"
                >
                  {language === "FR" ? "RECOMMENCER" : "RESTART"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFullscreen();
                  }}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 rounded-full text-xs tracking-[0.18em] uppercase font-medium transition-all cursor-pointer"
                >
                  {language === "FR" ? "QUITTER" : "EXIT"}
                </button>
              </div>
            ) : (
              /* 动态缩略图视口：选中的缩略图自动置中 */
              <div
                ref={thumbContainerRef}
                className="w-full overflow-x-auto no-scrollbar flex items-center gap-3 px-[50%]"
              >
                {activeProject.images.map((imgSrc, imgIdx) => {
                  const isActive = (activeImage < 0 ? 0 : activeImage) === imgIdx;
                  return (
                    <button
                      key={`bottom-thumb-${imgIdx}`}
                      ref={(el) => {
                        thumbItemRefs.current[imgIdx] = el;
                      }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage(imgIdx);
                      }}
                      className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden transition-all duration-300 border-2 shrink-0 gpu-layer cursor-pointer ${
                        isActive
                          ? "border-white opacity-100 shadow-lg scale-110 z-10"
                          : "border-transparent opacity-40 hover:opacity-80 scale-100"
                      }`}
                    >
                      <img
                        src={imgSrc}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}