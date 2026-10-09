// app/download/page.tsx
"use client"; // 👈 必须加上这行，因为我们需要用到交互状态

import React, { useState } from 'react';
import Image from 'next/image';

export default function DownloadPage() {
  // 定义语言状态，默认是中文 'zh'
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  // 所有页面的双语文案都提取到这里，方便统一管理
  const t = {
    zh: {
      title: 'App 下载中心',
      subtitle: '在这里下载我独立开发的 macOS 应用程序。点击下方的下载按钮，下载完成后双击 .dmg 文件即可安装。',
      downloadBtn: '下载 macOS 版',
      installTipTitle: '💡 安装提示：',
      installTipContent: '如果你在打开应用时遇到“Apple 无法检查其是否包含恶意软件”或“文件已损坏”的提示，这是因为该应用未经过 Apple 官方公证。你可以在 macOS 的 系统设置 → 隐私与安全性 中找到提示，并点击 “仍要打开” 即可正常安装。',
      version: '版本',
      size: '大小',
    },
    en: {
      title: 'App Downloads',
      subtitle: 'Download my independently developed macOS applications here. Click the button below, then double-click the .dmg file to install.',
      downloadBtn: 'Download for macOS',
      installTipTitle: '💡 Installation Tip:',
      installTipContent: 'If you encounter an "Apple cannot check it for malicious software" or "File is damaged" warning when opening the app, it is because the app is not notarized by Apple. You can find the warning in macOS System Settings → Privacy & Security, and click "Open Anyway" to install normally.',
      version: 'Version',
      size: 'Size',
    }
  };

  // 当前语言的文案
  const currentT = t[lang];

  // App 数据（包含中英双语描述）
  const apps = [
    {
      name: 'Darkroom',
      version: 'v1.0.0', 
      size: '4.9 MB', 
      descZh: '提供全面黑白胶卷冲洗数据以及计时功能的软件，并支持自定义个人冲洗配方。',
      descEn: 'A comprehensive tool for B&W film processing data and timing, featuring support for custom personal recipes.',
      downloadUrl: '/apps/Darkroom-Installer.dmg', 
      icon: '/apps/darkroom-icon.png', 
      platform: 'macOS'
    },
    {
      name: 'Resizer',
      version: 'v1.0.0', 
      size: '2.8 MB', 
      descZh: '数秒内完成图片的批量调整格式与尺寸调整，并支持添加logo。',
      descEn: 'Batch convert and resize images in seconds, with built-in support for adding custom logos.',
      downloadUrl: '/apps/Resizer-Installer.dmg', 
      icon: '/apps/resizer-icon.png', 
      platform: 'macOS'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-[2vw] pt-32 pb-24 min-h-screen">
      
      {/* 页面标题区域 + 语言切换按钮 */}
      <div className="mb-16 relative">
        
        {/* 语言切换按钮（右上角） */}
        <div className="absolute top-0 right-0 flex bg-gray-100 rounded-full p-1 text-xs font-bold tracking-wider">
          <button
            onClick={() => setLang('zh')}
            className={`px-4 py-1.5 rounded-full transition-colors ${lang === 'zh' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
          >
            中
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-4 py-1.5 rounded-full transition-colors ${lang === 'en' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
          >
            EN
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight uppercase pr-24">
          {currentT.title}
        </h1>
        <p className="text-gray-500 max-w-2xl text-sm sm:text-base leading-relaxed">
          {currentT.subtitle}
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
              <div className="flex items-start gap-5 mb-6">
                
                {/* App 图标 */}
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
                    <span>{currentT.version} {app.version}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{currentT.size} {app.size}</span>
                  </div>
                </div>
              </div>
              
              {/* 应用描述 (根据语言状态动态切换) */}
              <p className="text-gray-700 text-sm leading-relaxed mb-8">
                {lang === 'zh' ? app.descZh : app.descEn}
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
              {currentT.downloadBtn}
            </a>
            
          </div>
        ))}
      </div>
      
      {/* 底部安装提示 */}
      <div className="mt-16 bg-gray-50 border border-gray-100 rounded-xl p-6 text-sm text-gray-500 leading-relaxed">
        <p className="font-semibold text-gray-700 mb-2">{currentT.installTipTitle}</p>
        <p>{currentT.installTipContent}</p>
      </div>
      
    </div>
  );
}