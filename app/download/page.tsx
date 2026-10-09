// app/download/page.tsx
import React from 'react';
import Image from 'next/image'; // 引入 Next.js 的图片优化组件

export default function DownloadPage() {
  // 这里配置你的 App 列表
  const apps = [
    {
      name: 'Darkroom',
      version: 'v1.0.0', 
      size: '4.9 MB', 
      description: '一款强大的照片暗房处理工具，专为摄影师和设计师打造。', 
      downloadUrl: '/apps/Darkroom-Installer.dmg', 
      icon: '/apps/darkroom-icon.png', // 👈 你的 Darkroom 图标路径
      platform: 'macOS'
    },
    {
      name: 'Resizer',
      version: 'v1.0.0', 
      size: '2.8 MB', 
      description: '一款简单高效的图片尺寸调整工具，快速处理批量图片。', 
      downloadUrl: '/apps/Resizer-Installer.dmg', 
      icon: '/apps/resizer-icon.png', // 👈 你的 Resizer 图标路径
      platform: 'macOS'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-[2vw] pt-32 pb-24 min-h-screen">
      
      {/* 页面标题区域 */}
      <div className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight uppercase">
          App 下载中心
        </h1>
        <p className="text-gray-500 max-w-2xl text-sm sm:text-base leading-relaxed">
          在这里下载我独立开发的 macOS 应用程序。点击下方的下载按钮，下载完成后双击 .dmg 文件即可安装。
        </p>
      </div>
      
      {/* App 卡片列表区域 */}
      <div className="grid gap-8 md:grid-cols-2">
        {apps.map((app, index) => (
          <div 
            key={index} 
            className="group border border-gray-200 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white flex flex-col justify-between"
          >
            <div>
              {/* 卡片顶部：图标 + 名称和版本 */}
              <div className="flex items-start gap-5 mb-5">
                
                {/* App 图标 👇 */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                  <Image 
                    src={app.icon} 
                    alt={`${app.name} icon`} 
                    width={80} 
                    height={80} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 名称和平台标签 */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold tracking-tight">{app.name}</h2>
                    <span className="bg-gray-100 text-gray-600 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {app.platform}
                    </span>
                  </div>
                  
                  {/* 版本和大小信息 */}
                  <div className="text-gray-500 text-sm mt-2 flex items-center gap-3">
                    <span>版本 {app.version}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{app.size}</span>
                  </div>
                </div>
              </div>
              
              {/* 应用描述 */}
              <p className="text-gray-700 text-sm leading-relaxed mb-8">
                {app.description}
              </p>
            </div>
            
            {/* 下载按钮 */}
            <a 
              href={app.downloadUrl} 
              download
              className="inline-flex items-center justify-center w-full bg-black text-white px-6 py-4 rounded-xl font-medium tracking-wide hover:bg-gray-800 transition-colors gap-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              下载 {app.platform} 版
            </a>
            
          </div>
        ))}
      </div>
      
      {/* 底部提示 */}
      <div className="mt-16 bg-gray-50 border border-gray-100 rounded-xl p-6 text-sm text-gray-500 leading-relaxed">
        <p className="font-semibold text-gray-700 mb-2">💡 安装提示：</p>
        <p>
          如果你在打开应用时遇到“Apple 无法检查其是否包含恶意软件”或“文件已损坏”的提示，这是因为该应用未经过 Apple 官方公证。
          你可以在 macOS 的 <strong>系统设置 → 隐私与安全性</strong> 中找到提示，并点击 <strong>“仍要打开”</strong> 即可正常安装。
        </p>
      </div>
      
    </div>
  );
}