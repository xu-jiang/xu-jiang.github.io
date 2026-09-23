"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PROJECTS, Project } from "@/data/projects";

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
  const router = useRouter();
  const sortedProjects = useMemo(() => sortProjects(PROJECTS), []);

  const [activeProject, setActiveProject] = useState<Project>(sortedProjects[0]);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [language, setLanguage] = useState<"FR" | "EN">("FR");
  const [coverLoaded, setCoverLoaded] = useState(false);

  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);

  // 跳转过渡
  const [transitioning, setTransitioning] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const thumbContainerRef = useRef<HTMLDivElement | null>(null);
  const thumbItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const totalSlides = activeProject.images.length + 2;
  const imageIndex = slideIndex - 2;
  const isCoverSlide = slideIndex === 0;
  const isInfoSlide = slideIndex === 1;
  const isImageSlide = slideIndex >= 2;

  const currentImageSrc = useMemo(() => {
    if (isCoverSlide) return activeProject.cover;
    if (isImageSlide && activeProject.images[imageIndex]) return activeProject.images[imageIndex];
    return activeProject.cover;
  }, [activeProject, isCoverSlide, isImageSlide, imageIndex]);

  const selectedThumbIndex = isImageSlide ? imageIndex : -1;

  useEffect(() => {
    if (!isImageSlide) return;
    const targetThumb = thumbItemRefs.current[selectedThumbIndex];
    if (targetThumb) {
      targetThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [selectedThumbIndex, fullscreen, isImageSlide]);

  useEffect(() => {
    if (sortedProjects.length > 0) {
      const randomIndex = Math.floor(Math.random() * sortedProjects.length);
      setCoverLoaded(false);
      setActiveProject(sortedProjects[randomIndex]);
      setSlideIndex(0);
    }
  }, [sortedProjects]);

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

  const visibleThumbnails = useMemo(() => activeProject.images.slice(0, 9), [activeProject.images]);
  const remainingCount = useMemo(() => Math.max(0, activeProject.images.length - 9), [activeProject.images]);
  const randomDelays = useMemo(
    () => visibleThumbnails.map((_, index) => getDeterministicDelay(activeProject.id, index)),
    [activeProject.id, visibleThumbnails]
  );

  const handleProjectSelect = useCallback((project: Project) => {
    setActiveProject((prev) => {
      if (prev.id !== project.id) {
        setCoverLoaded(false);
        return project;
      }
      return prev;
    });
    setSlideIndex(0);
  }, []);

  const handleMobileProjectClick = useCallback(
    (project: Project) => {
      setMobileExpandedId((prev) => {
        if (prev === project.id) {
          return null;
        } else {
          if (activeProject.id !== project.id) {
            setCoverLoaded(false);
            setActiveProject(project);
            setSlideIndex(0);
          }
          return project.id;
        }
      });
    },
    [activeProject.id]
  );

  const handleMobileCoverClick = useCallback(
    (project: Project) => {
      if (activeProject.id !== project.id) {
        setActiveProject(project);
      }
      setSlideIndex(0);
      setFullscreen(true);
    },
    [activeProject.id]
  );

  // 带淡出过渡的跳转
  const goToInteraction = useCallback(
    (e?: React.MouseEvent | React.SyntheticEvent) => {
      if (e && typeof e.stopPropagation === "function") e.stopPropagation();
      setTransitioning(true);
      setTimeout(() => {
        router.push("/fusion-face");
      }, 300);
    },
    [router]
  );

  const goNext = useCallback(() => {
    setCoverLoaded(true);
    setSlideIndex((current) => {
      if (totalSlides <= 0) return 0;
      if (current >= totalSlides - 1) return 0;
      return current + 1;
    });
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCoverLoaded(true);
    setSlideIndex((current) => {
      if (totalSlides <= 0) return 0;
      if (current <= 0) return totalSlides - 1;
      return current - 1;
    });
  }, [totalSlides]);

  const openFullscreen = useCallback((e?: React.MouseEvent | React.SyntheticEvent) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    setFullscreen(true);
  }, []);

  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) goNext();
      else goPrev();
    }
    touchStartRef.current = null;
  };

  useEffect(() => {
    if (!fullscreen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") goPrev();
      else if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") goNext();
      else if (event.key === "Escape") closeFullscreen();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen, goNext, goPrev, closeFullscreen]);

  const activeDescription = language === "FR" ? activeProject.descriptionFr : activeProject.descriptionEn;
  const activeTitle =
    language === "FR"
      ? activeProject.titleFr || activeProject.title
      : activeProject.titleEn || activeProject.title;

  const slideLabel = `${String(slideIndex + 1).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;

  const renderMainContent = () => {
    if (isCoverSlide) {
      return (
        <img
          src={activeProject.cover}
          alt={activeTitle}
          loading="eager"
          decoding="async"
          onLoad={() => setCoverLoaded(true)}
          className={`relative z-10 w-full h-full object-contain transition-all duration-700 ease-out gpu-layer pointer-events-none ${
            !coverLoaded ? "opacity-0 scale-[0.98] blur-sm" : "opacity-100 scale-100 blur-0"
          }`}
        />
      );
    }
    if (isInfoSlide) {
      return (
        <div className="relative z-10 w-full h-full bg-white flex flex-col justify-between px-2 md:px-6 py-4 md:py-8">
          <div className="flex items-center justify-between border-b border-black/10 pb-3">
            <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 leading-none">
              {activeProject.category} / {activeProject.year}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 leading-none">INTRO</span>
          </div>
          <div className="my-auto py-2 flex flex-row items-center justify-between pr-12 md:pr-16">
            <div className="flex-1 pr-6 md:pr-8 overflow-y-auto max-h-full">
              <p className="text-sm md:text-lg leading-[1.8] font-light text-neutral-600 max-w-2xl whitespace-pre-line">
                {activeDescription}
              </p>
            </div>
            <div className="text-5xl font-light text-neutral-300 shrink-0">›</div>
          </div>
          <div className="border-t border-transparent"></div>
        </div>
      );
    }
    return (
      <img
        src={currentImageSrc}
        alt={activeTitle}
        loading="eager"
        decoding="async"
        onLoad={() => setCoverLoaded(true)}
        className={`relative z-10 w-full h-full object-contain transition-all duration-700 ease-out gpu-layer pointer-events-none ${
          !coverLoaded ? "opacity-0 scale-[0.98] blur-sm" : "opacity-100 scale-100 blur-0"
        }`}
      />
    );
  };

  const renderFullscreenContent = () => {
    if (isCoverSlide) {
      return (
        <img
          src={activeProject.cover}
          alt={activeTitle}
          decoding="async"
          className="max-w-[90vw] md:max-w-[70vw] max-h-[68vh] md:max-h-[88vh] object-contain gpu-layer transition-opacity duration-200 pointer-events-none select-none"
        />
      );
    }
    if (isInfoSlide) {
      return (
        <div className="w-full h-full flex items-center justify-center px-6 md:px-20 py-6 md:py-10 pointer-events-none select-none">
          <div className="max-w-3xl w-full">
            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-6">
              <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-neutral-400 leading-none">
                {activeProject.category} / {activeProject.year}
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-neutral-400 leading-none">
                INTRO
              </span>
            </div>
            <p className="text-sm md:text-lg leading-[1.8] font-light text-white whitespace-pre-line">
              {activeDescription}
            </p>
          </div>
        </div>
      );
    }
    return (
      <img
        src={currentImageSrc}
        alt={activeTitle}
        decoding="async"
        className="max-w-[90vw] md:max-w-[70vw] max-h-[68vh] md:max-h-[88vh] object-contain gpu-layer transition-opacity duration-200 pointer-events-none select-none"
      />
    );
  };

  const isFusionActive = activeProject.id === "fusion-face";

  return (
    <main
      className={`min-h-screen md:h-screen w-screen overflow-y-auto md:overflow-hidden bg-white text-black font-['Helvetica','Neue',Helvetica,Arial,sans-serif] flex flex-col justify-between select-none touch-manipulation font-normal transition-opacity duration-300 ${
        transitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      <style jsx global>{`
        html, body, main, div, aside, section, header { cursor: default !important; }
        button, a, [role="button"], .clickable { cursor: pointer !important; }
        button:active, button:focus, a:active, a:focus { cursor: pointer !important; }
        .gpu-layer { transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; will-change: opacity, transform; }
        img { transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; content-visibility: auto; }
        @keyframes randomStaggerFadeIn {
          from { opacity: 0; transform: scale(0.96) translateZ(0); }
          to { opacity: 1; transform: scale(1) translateZ(0); }
        }
        .animate-random-fade { opacity: 0; animation: randomStaggerFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* 跳转按钮的下划线动画 */
        .ff-open-btn {
          position: relative;
        }
        .ff-open-btn::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 100%;
          height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.3s ease;
        }
        .ff-open-btn:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      <div className="pt-16 md:pt-[12vh] px-4 md:px-[2.5vw] h-full overflow-y-auto md:overflow-hidden flex-1 pb-12 md:pb-[4vh]">

        {/* ==================== 移动端专属布局（手风琴） ==================== */}
        <div className="flex md:hidden flex-col w-full">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-2">
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
              const isExpanded = mobileExpandedId === project.id;
              const projectTitle =
                language === "FR"
                  ? project.titleFr || project.title
                  : project.titleEn || project.title;
              const projectDescription =
                language === "FR"
                  ? project.descriptionFr
                  : project.descriptionEn;
              const isFusion = project.id === "fusion-face";

              return (
                <div key={project.id} className="w-full border-b border-neutral-50">
                  <button
                    type="button"
                    onClick={() => handleMobileProjectClick(project)}
                    className={`w-full flex items-baseline justify-between text-left py-2.5 transition-opacity duration-300 ${
                      isExpanded ? "opacity-100 text-black font-medium" : "opacity-60 text-black"
                    }`}
                  >
                    <span className="text-sm tracking-wide truncate pr-2">{projectTitle}</span>
                    <span className="text-[11px] tracking-[0.15em] text-neutral-400 ml-2 shrink-0">
                      {project.year}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pb-6 pt-2 flex flex-col gap-3 w-full">
                      <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                        <span>{project.category}</span>
                        <span>{project.year}</span>
                      </div>

                      <p className="text-xs leading-[1.8] font-light text-neutral-600 whitespace-pre-line">
                        {projectDescription}
                      </p>

                      {isFusion ? (
                        <div className="flex flex-col gap-2 mt-1">
                          <div
                            onClick={() => handleMobileCoverClick(project)}
                            className="relative w-full cursor-pointer flex items-center justify-center group"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleMobileCoverClick(project)
                            }
                          >
                            <img
                              src={project.cover}
                              alt={projectTitle}
                              className="w-full h-auto block object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={goToInteraction}
                            className="ff-open-btn self-end text-[10px] tracking-[0.2em] uppercase text-black hover:opacity-70 transition-opacity"
                          >
                            {language === "FR" ? "Ouvrir l'interaction" : "Open Interaction"} ↗
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleMobileCoverClick(project)}
                          className="relative w-full mt-1 cursor-pointer flex items-center justify-center group"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleMobileCoverClick(project)
                          }
                        >
                          <img
                            src={project.cover}
                            alt={projectTitle}
                            className="w-full h-auto block object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== 桌面端专属布局 ==================== */}
        <div className="hidden md:grid grid-cols-12 gap-[2vw] h-full items-start">
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
                const projectTitle =
                  language === "FR"
                    ? project.titleFr || project.title
                    : project.titleEn || project.title;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      if (!isActive) {
                        setCoverLoaded(false);
                        handleProjectSelect(project);
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

          <section className="col-span-6 lg:col-span-7 flex flex-col items-center h-full justify-start relative">
            <div className="w-full max-w-[88%] flex flex-col items-center">
              <div
                onClick={goNext}
                className="w-full aspect-[3/2] flex justify-center mt-0 mb-4 relative items-center overflow-hidden group cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && goNext()}
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
                {renderMainContent()}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  title={language === "FR" ? "Suivant" : "Next"}
                  className="absolute right-0 top-0 bottom-0 w-[50%] z-20 flex items-center justify-end pr-4 group/right cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <div className="w-8 h-8 rounded-full bg-black/10 group-hover/right:bg-black/20 flex items-center justify-center text-white/70 group-hover/right:text-white transition-all opacity-0 group-hover/right:opacity-100 backdrop-blur-sm transform-gpu pointer-events-none">
                    ›
                  </div>
                </div>
              </div>

              <div className="w-full px-0 flex items-center justify-between text-xs tracking-[0.16em] uppercase text-neutral-400 pt-2 border-t border-black/5">
                <span className="text-black tracking-wide truncate max-w-[65%]">
                  {language === "FR"
                    ? activeProject.coverCaptionFr
                    : activeProject.coverCaptionEn}
                </span>

                {isFusionActive ? (
                  <button
                    type="button"
                    onClick={goToInteraction}
                    className="ff-open-btn text-neutral-500 hover:text-black transition-colors tracking-[0.15em] uppercase text-[10px] cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>
                      {language === "FR" ? "Ouvrir l'interaction" : "Open Interaction"}
                    </span>
                    <span>↗</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openFullscreen}
                    className="text-neutral-500 hover:text-black transition-colors tracking-[0.15em] uppercase text-[10px] cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>
                      {language === "FR" ? "Lancer le diaporama" : "Enter Slideshow"}
                    </span>
                    <span>↗</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="col-span-3 lg:col-span-3 h-full overflow-y-auto no-scrollbar">
            <div className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-6 flex justify-between items-center">
              <span>IMAGES ({activeProject.images.length})</span>
            </div>
            <div className="grid grid-cols-3 gap-2" key={activeProject.id}>
              {visibleThumbnails.map((imgSrc, index) => {
                const isLastItem = index === 8;
                const hasMore = isLastItem && remainingCount > 0;
                const delayMs = randomDelays[index] || 0;
                const isSelected = selectedThumbIndex === index;
                return (
                  <button
                    key={imgSrc}
                    type="button"
                    onClick={() => {
                      if (hasMore) {
                        openFullscreen();
                      } else {
                        if (selectedThumbIndex !== index) {
                          setCoverLoaded(false);
                          setSlideIndex(index + 2);
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
                        isSelected ? "opacity-100" : "opacity-50 hover:opacity-90"
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
          fullscreen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="hidden md:flex absolute left-10 top-1/2 -translate-y-1/2 z-40 flex-col items-start gap-1.5 pointer-events-none px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 transform-gpu"
        >
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-neutral-400 uppercase font-light">
            <span>PROJECTS</span>
            <span className="text-neutral-600">•</span>
            <span className="text-white tracking-widest">{slideLabel}</span>
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
            {slideLabel}
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

        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width / 2) {
              goPrev();
            } else {
              goNext();
            }
          }}
          className="w-full flex-1 flex items-center justify-center p-4 md:px-28 relative z-20 overflow-hidden cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          {renderFullscreenContent()}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            title={language === "FR" ? "Précédent" : "Previous"}
            aria-label={language === "FR" ? "Précédent" : "Previous"}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 bg-white/10 hover:bg-white/25 active:bg-white/40 rounded-full text-white transition-all backdrop-blur-sm border border-white/10 transform-gpu cursor-pointer opacity-70 hover:opacity-100"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            title={language === "FR" ? "Suivant" : "Next"}
            aria-label={language === "FR" ? "Suivant" : "Next"}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 bg-white/10 hover:bg-white/25 active:bg-white/40 rounded-full text-white transition-all backdrop-blur-sm border border-white/10 transform-gpu cursor-pointer opacity-70 hover:opacity-100"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {activeProject.images.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-neutral-900/90 backdrop-blur-md border-t border-white/10 px-4 py-3 z-40 shrink-0 flex items-center justify-center"
          >
            <div
              ref={thumbContainerRef}
              className="w-full overflow-x-auto no-scrollbar flex items-center gap-3 px-[50%] py-2"
            >
              {activeProject.images.map((imgSrc, imgIdx) => {
                const isActive = selectedThumbIndex === imgIdx;
                return (
                  <button
                    key={`bottom-thumb-${imgIdx}`}
                    ref={(el) => {
                      thumbItemRefs.current[imgIdx] = el;
                    }}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIndex(imgIdx + 2);
                    }}
                    className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden transition-all duration-300 shrink-0 gpu-layer cursor-pointer ${
                      isActive
                        ? "ring-2 ring-white opacity-100 shadow-lg scale-110 z-10"
                        : "ring-0 opacity-40 hover:opacity-80 scale-100"
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={`${activeTitle} thumb ${imgIdx + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}