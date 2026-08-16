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
        // 手机端 (< 768px)：固定 2 列
        return MOBILE_PATTERNS[Math.floor(Math.random() * MOBILE_PATTERNS.length)];
      } else if (width < 1024) {
        // 平板端 (768px ~ 1023px)：固定 2 列
        return TABLET_PATTERNS[Math.floor(Math.random() * TABLET_PATTERNS.length)];
      } else {
        // 电脑端 (>= 1024px)：多列
        return DESKTOP_PATTERNS[Math.floor(Math.random() * DESKTOP_PATTERNS.length)];
      }
    };

    setColWidths(getResponsivePattern());

    // 2. 去重与洗牌
    const uniqueImageSrcs = Array.from(new Set(PORTFOLIO_IMAGES));
    const shuffledSrcs = shuffleArray(uniqueImageSrcs);

    // 3. 计算渐显延迟与时长
    const photosWithAnimation: Photo[] = shuffledSrcs.map((src, index) => {
      let delay = 0;
      if (index < 6) {
        delay = index * 900;
      } else {
        const baseOffset = 4320;
        const incrementalStep = (index - 6) * 765;
        const microRandom = Math.floor(Math.random() * 300);
        delay = baseOffset + incrementalStep + microRandom;
      }

      const duration = 3420 + Math.floor(Math.random() * 1530);

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

    // 5. 监听手机端下拉手势
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const distance = touchEndY - touchStartY;
      // 当向下滑动距离超过 80px 时，触发刷新（等同于点击页面）
      if (distance > 80) {
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
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: isReady ? 1 : 0,
          transform: isReady ? "translateY(0px) scale(1)" : "translateY(16px) scale(0.98)",
        }}
      >
        <img
          src={photo.src}
          alt={photo.title}
          loading="eager"
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

  // 统一左右留白边距定义（网页端为 md:px-[2vw]，缩小左右间距）
  const CONTAINER_PADDING = "px-4 md:px-[2vw]";
  const currentColumnCount = colWidths.length;

  // 动态将所有照片按当前的列数进行均分流式分配
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
      {/* 照片墙容器：稍微增大上边距，使图片向下平移一点点 */}
      <div
        className={`
          w-full h-full
          pt-24 sm:pt-28 md:pt-[11vh] pb-5 md:pb-8
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
                  h-full
                  flex flex-col gap-4 md:gap-6
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