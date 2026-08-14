import Link from "next/link";

// 模拟各个项目的完整图片集数据
const PROJECT_DETAILS: Record<
  string,
  { title: string; category: string; year: string; description: string; photos: string[] }
> = {
  "shanghai-nights": {
    title: "Shanghai Nights",
    category: "Personal Series",
    year: "2026",
    description: "A visual exploration of urban neon and nocturnal solitude across the streets of Shanghai.",
    photos: ["/images/001.jpg", "/images/002.jpg", "/images/003.jpg", "/images/004.jpg"],
  },
  "urban-solitude": {
    title: "Urban Solitude",
    category: "Editorial",
    year: "2025",
    description: "Minimalist geometry and architectural quietness in modern metropolis.",
    photos: ["/images/003.jpg", "/images/005.jpg", "/images/006.jpg"],
  },
};

export async function generateStaticParams() {
  const ids = Object.keys(PROJECT_DETAILS);
  return ids.map((id) => ({
    id: id,
  }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 在 Next.js 15+ 中，params 统一为 Promise，直接 await 解包最安全
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;

  // 如果没有匹配到对应的项目，提供安全的默认展示，绝对避免 undefined 报错
  const id = rawId && PROJECT_DETAILS[rawId] ? rawId : "default";

  const project = PROJECT_DETAILS[id] || {
    title: rawId ? rawId.replace(/-/g, " ").toUpperCase() : "PROJECT",
    category: "Selected Project",
    year: "2026",
    description: "A series of visual works.",
    photos: ["/images/001.jpg", "/images/002.jpg", "/images/003.jpg"],
  };

  return (
    <main className="w-screen min-h-screen pt-[16vh] pb-[12vh] px-[6vw] md:px-[10vw] box-border bg-white text-black font-sans selection:bg-none">
      {/* 顶部返回与项目信息 */}
      <div className="max-w-4xl mb-16 space-y-6">
        <Link
          href="/projects"
          className="inline-block text-xs tracking-[0.2em] text-gray-400 hover:text-black uppercase transition-colors"
        >
          ← Back to Projects
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-light tracking-[0.1em] uppercase">
            {project.title}
          </h1>
          <p className="text-xs sm:text-sm tracking-[0.15em] text-gray-400 uppercase font-light">
            {project.category} — {project.year}
          </p>
        </div>
        <p className="text-xs sm:text-sm tracking-[0.1em] text-gray-600 font-light max-w-2xl leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* 垂直流式高清展示大图 */}
      <div className="space-y-[10vh]">
        {project.photos.map((src, idx) => (
          <div key={idx} className="w-full flex justify-center">
            <img
              src={src}
              alt={`${project.title} - ${idx + 1}`}
              className="max-w-full max-h-[85vh] object-contain shadow-sm"
            />
          </div>
        ))}
      </div>

      {/* 底部导航 */}
      <div className="pt-20 border-t border-gray-100 flex justify-between items-center text-xs tracking-[0.2em] uppercase text-gray-400">
        <span>End of Gallery</span>
        <Link href="/projects" className="hover:text-black transition-colors">
          Back to Index ↑
        </Link>
      </div>
    </main>
  );
}