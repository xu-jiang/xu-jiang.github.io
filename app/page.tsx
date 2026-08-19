"use client";

import { useState, useEffect } from "react";
import { PORTFOLIO_IMAGES } from "@/data/portfolio";

type PhotoBase = {
  id: number;
  src: string;
  title: string;
};

type Photo = PhotoBase & {
  delay: number;
  duration: number;
};

/* --- 电脑端 (>= 1024px): 3 ~ 5 列比例预设池 --- */
const DESKTOP_PATTERNS: number[][] = [
  [38, 16, 28, 18],
  [14, 42, 26, 18],
  [22, 18, 15, 45],
  [32, 20, 32, 16],
  [16, 28, 40, 16],
  [48, 22, 30],
  [18, 52, 30],
  [12, 36, 16, 24, 12],
  [26, 14, 34, 14, 12],
];

/* --- 平板端 (768px ~ 1023px): 严格 2 列比例预设池 --- */
const TABLET_PATTERNS: number[][] = [
  [50, 50],
  [55, 45],
  [60, 40],
];

/* --- 手机端 (< 768px): 严格 2 列比例预设池 --- */
const MOBILE_PATTERNS: number[][] = [
  [50, 50],
  [56, 44],
  [46, 54],
];

// Fisher-Yates 随机打乱算法
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [colWidths, setColWidths] = useState<number[]>([50, 50]);
  const [isReady, setIsReady] = useState(false);

  const handlePageRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    // 1. 根据当前屏幕宽度自动选择对应的列数与比例策略
    const getResponsivePattern = () => {
      const width = window.innerWidth;
      if (width < 768) {
        return MOBILE_PATTERNS[Math.floor(Math.random() * MOBILE_PATTERNS.length)];
      } else if (width < 1024) {
        return TABLET_PATTERNS[Math.floor(Math.random() * TABLET_PATTERNS.length)];
      } else {
        return DESKTOP_PATTERNS[Math.floor(Math.random() * DESKTOP_PATTERNS.length)];
      }
    };

    const pattern = getResponsivePattern();
    setColWidths(pattern);

    // 2. 去重与洗牌
    const uniqueImageSrcs = Array.from(new Set(PORTFOLIO_IMAGES));
    const shuffledSrcs = shuffleArray(uniqueImageSrcs);

    const colsCount = pattern.length;

    // 找出第一行中宽度最大（大图）的列索引
    let maxColWidth = -1;
    let mainBigImageColIndex = 0;
    pattern.forEach((w, idx) => {
      if (w > maxColWidth) {
        maxColWidth = w;
        mainBigImageColIndex = idx;
      }
    });

    // 3. 计算渐显延迟与时长
    const photosWithAnimation: Photo[] = shuffledSrcs.map((src, index) => {
      let delay = 0;

      if (index < colsCount) {
        // 【第一行首批图片逻辑】
        if (index === mainBigImageColIndex) {
          delay = 1800;
        } else {
          delay = 2000 + Math.floor(Math.random() * 800);
        }
      } else {
        // 【后续图片逻辑】
        const baseOffset = 2400;
        const randomJitter = Math.floor(Math.random() * 2800);
        delay = baseOffset + randomJitter;
      }

      // 淡入时长：1400ms ~ 2600ms
      const duration = 1400 + Math.floor(Math.random() * 1200);

      return {
        id: index + 1,
        src,
        title: "",
        delay,
        duration,
      };
    });

    setPhotos(photosWithAnimation);

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 60);

    // 4. 监听 resize 动态调整列数与布局比例
    const handleResize = () => {
      setColWidths(getResponsivePattern());
    };
    window.addEventListener("resize", handleResize);

    // 5. 监听手机端上下滑动：滑动距离超过 40px 即刷新页面
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const distance = Math.abs(touchEndY - touchStartY);
      if (distance > 40) {
        handlePageRefresh();
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  /* 渲染单图卡片 */
  const renderPhotoCard = (photo: Photo) => {
    if (!photo) return null;

    return (
      <div
        key={photo.id}
        className="relative overflow-hidden rounded-none w-full flex-shrink-0"
        style={{
          transitionProperty: "opacity, transform",
          transitionDuration: `${photo.duration}ms`,
          transitionDelay: `${photo.delay}ms`,
          transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
          opacity: isReady ? 1 : 0,
          transform: isReady ? "translateY(0px) scale(1)" : "translateY(20px) scale(0.97)",
        }}
      >
        <img
          src={photo.src}
          alt={photo.title}
          loading="eager"
          /* 当图片路径在服务器上不存在（如 404） 时，静默隐去该卡片容器 */
          onError={(e) => {
            const container = (e.target as HTMLElement).parentElement;
            if (container) {
              container.style.display = "none";
            }
          }}
          className="w-full h-auto block rounded-none select-none transition-transform duration-1000 ease-out hover:scale-[1.02]"
        />
      </div>
    );
  };

  if (photos.length === 0) {
    return (
      <main className="w-screen h-screen bg-white flex items-center justify-center">
        <span className="text-xs tracking-[0.2em] text-neutral-300 uppercase animate-pulse">
          Loading...
        </span>
      </main>
    );
  }

  const CONTAINER_PADDING = "px-4 md:px-[2vw]";
  const currentColumnCount = colWidths.length;

  const columnsData: Photo[][] = Array.from({ length: currentColumnCount }, () => []);
  photos.forEach((photo, index) => {
    const targetColIndex = index % currentColumnCount;
    columnsData[targetColIndex].push(photo);
  });

  return (
    <main
      onClick={handlePageRefresh}
      className="
        fixed
        inset-0
        w-screen
        h-screen
        overflow-hidden
        bg-white
        text-black
        font-sans
        selection:bg-none
        cursor-pointer
        box-border
        touch-none
      "
    >
      <div
        className={`
          w-full h-full
          pt-16 sm:pt-20 md:pt-[11vh] pb-5 md:pb-8
          ${CONTAINER_PADDING}
          box-border
          overflow-hidden
        `}
      >
        <div className="w-full h-full flex flex-row justify-between items-start gap-4 md:gap-6 box-border overflow-hidden">
          {colWidths.map((width, colIndex) => {
            const columnPhotos = columnsData[colIndex] || [];

            return (
              <div
                key={colIndex}
                style={{
                  width: `${width}%`,
                }}
                className="
                  flex flex-col justify-start gap-4 md:gap-6
                  min-w-0
                  overflow-hidden
                  transition-[width] duration-700 ease-out
                "
              >
                {columnPhotos.map((photo) => renderPhotoCard(photo))}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}