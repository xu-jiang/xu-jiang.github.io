"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";

type Tag = "man" | "woman" | "baby";

const CATEGORIES: { value: Tag; labelEn: string; labelFr: string }[] = [
  { value: "man", labelEn: "Man", labelFr: "Homme" },
  { value: "woman", labelEn: "Woman", labelFr: "Femme" },
  { value: "baby", labelEn: "Baby", labelFr: "Bébé" },
];

const MIN_SAMPLES = 5;
const DEFAULT_SAMPLES = 20;

const CANVAS_W = 600;
const CANVAS_H = 800;

export default function FusionFacePage() {
  const [language, setLanguage] = useState<"FR" | "EN">("FR");

  const [meta, setMeta] = useState<Record<Tag, string[]> | null>(null);

  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [userImageSrc, setUserImageSrc] = useState<string | null>(null);

  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [isFusing, setIsFusing] = useState(false);

  const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());
  const [sampleCount, setSampleCount] = useState<number>(DEFAULT_SAMPLES);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    active: boolean;
  }>({ startX: 0, startY: 0, baseX: 0, baseY: 0, active: false });

  useEffect(() => {
    fetch("/faces/meta.json")
      .then((r) => r.json())
      .then((data) => setMeta(data))
      .catch(() => setMeta(null));
  }, []);

  const t = (en: string, fr: string) => (language === "FR" ? fr : en);

  const pool = useMemo<string[]>(() => {
    if (!meta || selectedTags.size === 0) return [];
    const set = new Set<string>();
    selectedTags.forEach((tag) => {
      (meta[tag] || []).forEach((src) => set.add(src));
    });
    return Array.from(set);
  }, [meta, selectedTags]);

  const availableCount = pool.length;
  const maxSamples = Math.max(MIN_SAMPLES, availableCount);

  useEffect(() => {
    if (availableCount === 0) return;
    setSampleCount((prev) => {
      if (prev < MIN_SAMPLES) return MIN_SAMPLES;
      if (prev > availableCount) return availableCount;
      return prev;
    });
  }, [availableCount]);

  const toggleTag = useCallback((tag: Tag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const resetTransform = useCallback(() => {
    setOffset({ x: 0, y: 0 });
    setScale(1);
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          setUserImage(img);
          setUserImageSrc(src);
          setResultDataUrl(null);
          resetTransform();
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [resetTransform]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const openCamera = useCallback(
    async (facing: "user" | "environment" = "user") => {
      try {
        streamRef.current?.getTracks().forEach((tr) => tr.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: 1280, height: 720 },
          audio: false,
        });
        streamRef.current = stream;
        setCameraFacing(facing);
        setCameraOpen(true);
        setUserImage(null);
        setUserImageSrc(null);
        setResultDataUrl(null);
        resetTransform();
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 50);
      } catch {
        alert(t("Camera not available.", "Caméra non disponible."));
      }
    },
    [language, resetTransform]
  );

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  const switchCamera = useCallback(() => {
    const next = cameraFacing === "user" ? "environment" : "user";
    openCamera(next);
  }, [cameraFacing, openCamera]);

  const captureFromCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    if (cameraFacing === "user") {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0);
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        handleFile(file);
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  }, [handleFile, closeCamera, cameraFacing]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!userImageSrc || resultDataUrl) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
      active: true,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({
      x: dragRef.current.baseX + dx,
      y: dragRef.current.baseY + dy,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current.active = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!userImageSrc || resultDataUrl) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setScale((s) => Math.min(4, Math.max(0.3, s + delta)));
  };

  const pinchRef = useRef<{ dist: number; baseScale: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = { dist: d, baseScale: scale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = d / pinchRef.current.dist;
      setScale(Math.min(4, Math.max(0.3, pinchRef.current.baseScale * ratio)));
    }
  };
  const onTouchEnd = () => {
    pinchRef.current = null;
  };

  const handleFuse = useCallback(async () => {
    if (!userImage || pool.length === 0) return;

    setIsFusing(true);
    setResultDataUrl(null);

    const n = Math.min(sampleCount, pool.length);
    const picked = pickRandom(pool, n);

    const W = CANVAS_W;
    const H = CANVAS_H;

    const userCanvas = document.createElement("canvas");
    userCanvas.width = W;
    userCanvas.height = H;
    const uctx = userCanvas.getContext("2d")!;
    uctx.fillStyle = "#ffffff";
    uctx.fillRect(0, 0, W, H);

    const dispRect = computeCoverRect(
      userImage.naturalWidth || userImage.width,
      userImage.naturalHeight || userImage.height,
      W,
      H
    );
    const drawW = dispRect.w * scale;
    const drawH = dispRect.h * scale;
    const drawX = (W - drawW) / 2 + offset.x;
    const drawY = (H - drawH) / 2 + offset.y;
    uctx.drawImage(userImage, drawX, drawY, drawW, drawH);

    const userData = uctx.getImageData(0, 0, W, H).data;

    const acc = new Float32Array(W * H * 3);
    for (let i = 0; i < userData.length; i += 4) {
      const p = i / 4;
      acc[p * 3] = userData[i];
      acc[p * 3 + 1] = userData[i + 1];
      acc[p * 3 + 2] = userData[i + 2];
    }

    const imgs = await Promise.all(
      picked.map(
        (src) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const im = new window.Image();
            im.crossOrigin = "anonymous";
            im.onload = () => resolve(im);
            im.onerror = () => resolve(null);
            im.src = src;
          })
      )
    );

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = W;
    tmpCanvas.height = H;
    const tctx = tmpCanvas.getContext("2d")!;

    let validCount = 1;
    for (const im of imgs) {
      if (!im) continue;
      tctx.clearRect(0, 0, W, H);
      tctx.fillStyle = "#ffffff";
      tctx.fillRect(0, 0, W, H);
      const r = computeCoverRect(
        im.naturalWidth || im.width,
        im.naturalHeight || im.height,
        W,
        H
      );
      tctx.drawImage(im, r.x, r.y, r.w, r.h);
      const data = tctx.getImageData(0, 0, W, H).data;
      for (let i = 0; i < data.length; i += 4) {
        const p = i / 4;
        acc[p * 3] += data[i];
        acc[p * 3 + 1] += data[i + 1];
        acc[p * 3 + 2] += data[i + 2];
      }
      validCount++;
    }

    const out = uctx.createImageData(W, H);
    for (let p = 0; p < W * H; p++) {
      out.data[p * 4] = acc[p * 3] / validCount;
      out.data[p * 4 + 1] = acc[p * 3 + 1] / validCount;
      out.data[p * 4 + 2] = acc[p * 3 + 2] / validCount;
      out.data[p * 4 + 3] = 255;
    }
    uctx.putImageData(out, 0, 0);

    setResultDataUrl(userCanvas.toDataURL("image/jpeg", 0.92));
    setIsFusing(false);
  }, [userImage, pool, sampleCount, offset, scale]);

  const handleDownload = useCallback(() => {
    if (!resultDataUrl) return;
    const a = document.createElement("a");
    a.href = resultDataUrl;
    a.download = `fusion-face-${Date.now()}.jpg`;
    a.click();
  }, [resultDataUrl]);

  const handleReset = useCallback(() => {
    setUserImage(null);
    setUserImageSrc(null);
    setResultDataUrl(null);
    setSelectedTags(new Set());
    setSampleCount(DEFAULT_SAMPLES);
    resetTransform();
  }, [resetTransform]);

  const canFuse =
    userImage !== null &&
    selectedTags.size > 0 &&
    availableCount >= MIN_SAMPLES &&
    !isFusing;

  // 画布本体（主视图和手机端共用）
  const canvasNode = (
    <div
      className="relative bg-neutral-800 border border-black overflow-hidden w-full"
      style={{
        aspectRatio: "3 / 4",
      }}
    >
      {cameraOpen ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${
            cameraFacing === "user" ? "scale-x-[-1]" : ""
          }`}
          playsInline
          muted
        />
      ) : resultDataUrl ? (
        <img
          src={resultDataUrl}
          alt="result"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : userImageSrc ? (
        <div
          className="absolute inset-0 cursor-move"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={userImageSrc}
            alt="user"
            draggable={false}
            className="ff-stage-img absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-[11px] tracking-[0.2em] uppercase">
            {t("Click to upload", "Cliquez pour importer")}
          </span>
          <span className="text-[10px] tracking-[0.18em] uppercase opacity-70">
            {t("or drag & drop", "ou glissez-déposez")}
          </span>
        </button>
      )}

      {!resultDataUrl && (
        <img
          src="/faces/outline.png"
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
          style={{ opacity: 0.7 }}
        />
      )}

      {isFusing && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none z-20">
          <span className="text-[11px] tracking-[0.25em] uppercase text-white animate-pulse">
            {t("Fusing...", "Fusion en cours...")}
          </span>
        </div>
      )}

      {cameraOpen && (
        <button
          type="button"
          onClick={switchCamera}
          className="absolute top-3 right-3 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
          title={t("Switch camera", "Changer de caméra")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );

  const buttonsNode = (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-center text-[10px] tracking-[0.15em] uppercase text-neutral-400 min-h-[14px]">
        {cameraOpen
          ? t("Camera ready · capture or cancel", "Caméra prête · capturez ou annulez")
          : resultDataUrl
          ? t("Fused result", "Résultat fusionné")
          : userImageSrc
          ? t("Drag to align · scroll to zoom", "Glissez · molette pour zoomer")
          : t("No image", "Aucune image")}
      </div>

      {cameraOpen ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={closeCamera}
            className="flex-1 py-2.5 border border-neutral-200 text-[11px] tracking-[0.15em] uppercase hover:border-black transition-colors"
          >
            {t("Cancel", "Annuler")}
          </button>
          <button
            type="button"
            onClick={captureFromCamera}
            className="flex-1 py-2.5 border border-black bg-black text-white text-[11px] tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors"
          >
            {t("Capture", "Capturer")}
          </button>
        </div>
      ) : resultDataUrl ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setResultDataUrl(null)}
            className="flex-1 py-2.5 border border-neutral-200 text-[11px] tracking-[0.15em] uppercase hover:border-black transition-colors"
          >
            {t("Back to edit", "Modifier")}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2.5 border border-black bg-black text-white text-[11px] tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors"
          >
            {t("Download ↗", "Télécharger ↗")}
          </button>
        </div>
      ) : userImageSrc ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setUserImage(null);
              setUserImageSrc(null);
              resetTransform();
            }}
            className="flex-1 py-2.5 border border-neutral-200 text-[11px] tracking-[0.15em] uppercase hover:border-black transition-colors"
          >
            {t("Remove", "Retirer")}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 border border-black text-[11px] tracking-[0.15em] uppercase hover:bg-black hover:text-white transition-colors"
          >
            {t("Change", "Changer")}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 border border-black text-[11px] tracking-[0.15em] uppercase hover:bg-black hover:text-white transition-colors"
          >
            {t("Upload", "Importer")}
          </button>
          <button
            type="button"
            onClick={() => openCamera("user")}
            className="flex-1 py-2.5 border border-black text-[11px] tracking-[0.15em] uppercase hover:bg-black hover:text-white transition-colors"
          >
            {t("Camera", "Caméra")}
          </button>
        </div>
      )}
    </div>
  );

  const settingsNode = (
    <div className="w-full flex flex-col gap-4 md:gap-6">
      {/* 分类 */}
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-neutral-400 mb-3">
          01 / {t("Categories", "Catégories")}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => {
            const isSelected = selectedTags.has(c.value);
            const count = meta ? (meta[c.value] || []).length : 0;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleTag(c.value)}
                className={`flex flex-col items-center justify-center text-center py-3 px-1 border text-[13px] tracking-wide transition-all ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 hover:border-black"
                }`}
              >
                <span className="font-medium">
                  {language === "FR" ? c.labelFr : c.labelEn}
                </span>
                <span className="text-[11px] tracking-[0.15em] mt-1 text-neutral-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 样本数 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[0.2em] uppercase text-neutral-400">
            02 / {t("Sample size", "Échantillons")}
          </div>
          <div className="text-base tracking-wide font-medium">
            {selectedTags.size === 0
              ? "—"
              : availableCount === 0
              ? "0"
              : sampleCount}
          </div>
        </div>
        <input
          type="range"
          className="ff-range"
          min={MIN_SAMPLES}
          max={maxSamples}
          value={
            availableCount === 0
              ? MIN_SAMPLES
              : Math.min(sampleCount, maxSamples)
          }
          disabled={availableCount === 0}
          onChange={(e) => setSampleCount(Number(e.target.value))}
        />
        <div className="flex items-center justify-between text-[11px] tracking-[0.15em] uppercase text-neutral-400 mt-2">
          <span>{MIN_SAMPLES}</span>
          <span>
            {t("Pool", "Réserve")}: {availableCount}
          </span>
          <span>{availableCount === 0 ? "—" : maxSamples}</span>
        </div>
        <div className="text-[11px] tracking-[0.12em] uppercase text-neutral-400 leading-relaxed mt-3">
          ℹ{" "}
          {t(
            "More samples, more realistic.",
            "Plus d'échantillons, plus réaliste."
          )}
        </div>
      </div>

      {/* 主按钮 */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleFuse}
          disabled={!canFuse}
          className={`w-full py-3 text-[12px] tracking-[0.2em] uppercase border transition-all ${
            !canFuse
              ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
              : "border-black bg-black text-white hover:bg-white hover:text-black"
          }`}
        >
          {isFusing
            ? t("Fusing...", "Fusion en cours...")
            : resultDataUrl
            ? t("Regenerate", "Régénérer")
            : t("Fuse", "Fusionner")}
        </button>

        {resultDataUrl && (
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3 border border-neutral-200 text-[12px] tracking-[0.2em] uppercase hover:border-black transition-all"
          >
            {t("Reset all", "Tout réinitialiser")}
          </button>
        )}
      </div>

      <div className="text-[11px] tracking-[0.15em] uppercase text-neutral-400 leading-relaxed">
        {t(
          "All processing happens in your browser.",
          "Tout se passe dans votre navigateur."
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen w-screen overflow-x-hidden bg-white text-black font-['Helvetica','Neue',Helvetica,Arial,sans-serif] select-none font-normal flex flex-col md:h-screen md:overflow-hidden">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="range"].ff-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          background: #e5e5e5;
          outline: none;
        }
        input[type="range"].ff-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #000;
          border-radius: 50%;
          cursor: pointer;
        }
        input[type="range"].ff-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #000;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        .ff-stage-img {
          touch-action: none;
          user-select: none;
          -webkit-user-drag: none;
        }
      `}</style>

      {/* 顶栏 */}
      <div className="flex items-center justify-between px-4 md:px-10 py-3 border-b border-neutral-100 shrink-0">
        <Link
          href="/projects"
          className="text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-black transition-colors"
        >
          ← {t("Back to projects", "Retour aux projets")}
        </Link>
        <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-black">
          <button
            type="button"
            onClick={() => setLanguage("FR")}
            className={`transition-opacity ${language === "FR" ? "opacity-100" : "opacity-30"}`}
          >
            FR
          </button>
          <span className="text-neutral-300">/</span>
          <button
            type="button"
            onClick={() => setLanguage("EN")}
            className={`transition-opacity ${language === "EN" ? "opacity-100" : "opacity-30"}`}
          >
            EN
          </button>
        </div>
      </div>

      {/* ==================== 手机端布局（纵向堆叠） ==================== */}
      <div className="md:hidden flex flex-col w-full px-0 py-0">
        {/* 标题 */}
        <div className="px-5 pt-5 pb-4">
          <h1 className="text-2xl font-light tracking-wide mb-2">
            {t("Fusion Face", "Visage Fusionné")}
          </h1>
          <p className="text-[13px] leading-[1.7] font-light text-neutral-500">
            {t(
              "Upload or capture, align within the outline, then choose categories.",
              "Importez ou capturez, alignez dans le contour, puis choisissez les catégories."
            )}
          </p>
        </div>

        {/* 画布：宽度 = 手机宽度 */}
        <div className="w-full px-0">
          {canvasNode}
        </div>

        {/* 按钮组 */}
        <div className="px-5 pt-3">
          {buttonsNode}
        </div>

        {/* 设置 */}
        <div className="px-5 pt-6 pb-10">
          {settingsNode}
        </div>
      </div>

      {/* ==================== 桌面端布局（左右分栏） ==================== */}
      <div className="hidden md:flex flex-1 min-h-0 flex-row">
        {/* 左：画布 */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-4 bg-white overflow-hidden">
          <div className="flex-1 min-h-0 w-full flex items-center justify-center p-[2.5%]">
            <div
              className="relative bg-neutral-800 border border-black overflow-hidden"
              style={{
                aspectRatio: "3 / 4",
                height: "100%",
                maxWidth: "100%",
              }}
            >
              {cameraOpen ? (
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    cameraFacing === "user" ? "scale-x-[-1]" : ""
                  }`}
                  playsInline
                  muted
                />
              ) : resultDataUrl ? (
                <img
                  src={resultDataUrl}
                  alt="result"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : userImageSrc ? (
                <div
                  className="absolute inset-0 cursor-move"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onWheel={onWheel}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <img
                    src={userImageSrc}
                    alt="user"
                    draggable={false}
                    className="ff-stage-img absolute inset-0 w-full h-full object-cover"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                      transformOrigin: "center center",
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-[11px] tracking-[0.2em] uppercase">
                    {t("Click to upload", "Cliquez pour importer")}
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase opacity-70">
                    {t("or drag & drop", "ou glissez-déposez")}
                  </span>
                </button>
              )}

              {!resultDataUrl && (
                <img
                  src="/faces/outline.png"
                  alt=""
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
                  style={{ opacity: 0.7 }}
                />
              )}

              {isFusing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none z-20">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-white animate-pulse">
                    {t("Fusing...", "Fusion en cours...")}
                  </span>
                </div>
              )}

              {cameraOpen && (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="absolute top-3 right-3 z-30 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                  title={t("Switch camera", "Changer de caméra")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="w-full max-w-[420px] mt-3 shrink-0">
            {buttonsNode}
          </div>
        </div>

        {/* 右：控制区 */}
        <div className="w-full md:w-[360px] lg:w-[400px] shrink-0 border-l border-neutral-100 overflow-y-auto no-scrollbar px-8 py-6 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-light tracking-wide mb-2">
              {t("Fusion Face", "Visage Fusionné")}
            </h1>
            <p className="text-sm leading-[1.7] font-light text-neutral-500">
              {t(
                "Upload or capture, align within the outline, then choose categories.",
                "Importez ou capturez, alignez dans le contour, puis choisissez les catégories."
              )}
            </p>
          </div>
          {settingsNode}
        </div>
      </div>

      {/* 隐藏的 file input（手机和桌面共用） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </