"use client";

import { useState } from "react";
import Link from "next/link";

export default function About() {
  const [lang, setLang] = useState<"FR" | "EN">("FR");

  return (
    <main className="min-h-screen bg-white text-black font-sans">

      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          fixed
          top-0
          left-0
          z-50
          w-full
          px-4
          md:px-[4vw]
          py-3
          md:py-[3vh]
          flex
          items-center
          justify-between
          bg-white/90
          backdrop-blur-sm
          border-b
          border-neutral-100
          md:border-none
        "
      >

        {/* Logo */}

        <Link
          href="/"
          className="
            text-xs
            md:text-sm
            font-medium
            hover:opacity-50
            transition-opacity
            tracking-[0.18em]
          "
        >
          XU JIANGQI
        </Link>


        {/* Navigation */}

        <nav
          className="
            flex
            items-center
            gap-4
            md:gap-[3vw]
            text-[10px]
            md:text-xs
            tracking-[0.18em]
            uppercase
          "
        >

          <Link
            href="/"
            className="
              hover:opacity-50
              transition-opacity
            "
          >
            WORK
          </Link>

          <Link
            href="/projects"
            className="
              hover:opacity-50
              transition-opacity
            "
          >
            PROJECTS
          </Link>

          <Link
            href="/about"
            className="
              opacity-40
            "
          >
            ABOUT
          </Link>

        </nav>

      </header>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          pt-[11vh]
          md:pt-[14vh]
          px-4
          md:px-[4vw]
          pb-[12vh]
        "
      >

        {/* =================================================
            TITLE & LANGUAGE TOGGLE
        ================================================= */}

        <div className="flex items-baseline justify-between mb-[6vh]">
          {/* ABOUT 标题 */}
          <h1
            className="
              text-xl
              md:text-2xl
              font-light
              tracking-wide
            "
          >
            ABOUT
          </h1>

          {/* 语言切换按钮 */}
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <button
              onClick={() => setLang("FR")}
              className={`transition-opacity ${
                lang === "FR" ? "font-normal opacity-100 border-b border-black" : "opacity-40 hover:opacity-100"
              }`}
            >
              FR
            </button>
            <span className="opacity-30">/</span>
            <button
              onClick={() => setLang("EN")}
              className={`transition-opacity ${
                lang === "EN" ? "font-normal opacity-100 border-b border-black" : "opacity-40 hover:opacity-100"
              }`}
            >
              EN
            </button>
          </div>
        </div>


        {/* =================================================
            INTRODUCTION (BIOGRAPHY & PERSONAL NOTE)
        ================================================= */}

        <section
          className="
            mb-[10vh]
            max-w-3xl
          "
        >

          {/* 1. 第三人称生平 */}
          <div className="mb-8">
            <p
              className="
                text-sm
                md:text-base
                leading-[1.8]
                font-light
                text-neutral-900
              "
            >
              {lang === "FR" ? (
                <>
                  XU Jiangqi est un photographe et artiste basé à Paris. À travers son objectif, il exprime une perception personnelle et un regard singulier sur le monde.
                </>
              ) : (
                <>
                  XU Jiangqi is a photographer and artist based in Paris. Through his lens, he expresses a distinct personal perception and observational perspective on the world.
                </>
              )}
            </p>
          </div>


          {/* 2. 第一人称心声自述 */}
          <div
            className="
              pl-4
              border-l
              border-black/15
              text-sm
              md:text-base
              leading-[1.8]
              font-light
              italic
              text-neutral-600
              space-y-4
            "
          >
            {lang === "FR" ? (
              <>
                <p>
                  « Xu Jiangqi » — on m’appelle aussi « Xuezhang ».
                </p>
                <p>
                  À travers la photographie, j’exprime ma façon d'observer le monde. Ce site rassemble un choix d'images et de projets : un bilan autant qu'un nouveau départ.
                </p>
                <p>
                  Sa création fait écho à une phrase du professeur Huang Yikai — du moins dans mon souvenir : « Posséder son propre site web est le tout premier pas pour qu’un photographe soit pris au sérieux. »
                </p>
                <p>
                  Quoi qu'il en soit, ma passion pour la photographie est profondément sincère. Qu'elle demande d'aller vers l'autre ou de créer dans le silence, la démarche photographique suscite toujours en moi une vive émotion et une grande concentration. Sans une immersion totale dans l'instant, impossible de saisir une image marquante.
                </p>
              </>
            ) : (
              <>
                <p>
                  "Xu Jiangqi" — also known as "Xuezhang."
                </p>
                <p>
                  I use photography to translate how I observe the world. This website gathers a selection of images and projects—a reflection on where I’ve been, and a springboard for what’s next.
                </p>
                <p>
                  Its creation traces back to something Professor Huang Yikai once said—at least as I recall it: "Having your own website is the first step to being taken seriously as a photographer."
                </p>
                <p>
                  Either way, my devotion to the craft is deeply felt. Whether it involves connecting with others or working in quiet isolation, photography always brings a wave of emotion and sharp focus. Without total immersion in the moment, capturing a striking image simply isn't possible.
                </p>
              </>
            )}
          </div>

        </section>


        {/* =================================================
            LOCATION
        ================================================= */}

        <section
          className="
            border-t
            border-black/10
            pt-6
            mb-[8vh]
            max-w-2xl
          "
        >

          <p className="text-xs font-light tracking-wide text-neutral-400 mb-3">
            {lang === "FR" ? "Localisation" : "Location"}
          </p>

          <p className="text-sm md:text-base font-light text-neutral-800">
            {lang === "FR" ? "Paris, France / Chine" : "Paris, France / China"}
          </p>

        </section>


        {/* =================================================
            EDUCATION
        ================================================= */}

        <section
          className="
            border-t
            border-black/10
            pt-6
            mb-[8vh]
            max-w-2xl
          "
        >

          <p className="text-xs font-light tracking-wide text-neutral-400 mb-3">
            {lang === "FR" ? "Formation" : "Education"}
          </p>

          <div className="space-y-4 text-sm md:text-base font-light">

            <div>

              <p className="text-neutral-800">
                {lang === "FR" ? "Master en Arts Plastiques (En cours)" : "Master of Fine Arts (In Progress)"}
              </p>

              <p className="text-neutral-500 mt-0.5 text-xs md:text-sm">
                Arts Plastiques — Université Paris 1 Panthéon-Sorbonne
              </p>

            </div>


            <div>

              <p className="text-neutral-800">
                {lang === "FR" ? "Licence d'Architecture" : "Bachelor of Architecture"}
              </p>

              <p className="text-neutral-500 mt-0.5 text-xs md:text-sm">
                {lang === "FR" ? "Université de technologie de Zhejiang" : "Zhejiang University of Technology"}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            PRACTICE
        ================================================= */}

        <section
          className="
            border-t
            border-black/10
            pt-6
            mb-[8vh]
            max-w-2xl
          "
        >

          <p className="text-xs font-light tracking-wide text-neutral-400 mb-3">
            {lang === "FR" ? "Pratique artistique" : "Practice"}
          </p>

          <p
            className="
              text-sm
              md:text-base
              leading-[1.8]
              font-light
              text-neutral-700
            "
          >
            {lang === "FR" ? (
              <>
                Photographie documentaire
                <br />
                Photographie contemporaine
                <br />
                Recherche visuelle
                <br />
                Livres d'artiste
                <br />
                Image et culture visuelle
                <br />
                Portrait commande & commercial
              </>
            ) : (
              <>
                Documentary photography
                <br />
                Contemporary photography
                <br />
                Visual research
                <br />
                Artist books
                <br />
                Image and visual culture
                <br />
                Commercial portrait photography
              </>
            )}
          </p>

        </section>


        {/* =================================================
            EXHIBITIONS
        ================================================= */}

        <section
          className="
            border-t
            border-black/10
            pt-6
            mb-[8vh]
            max-w-2xl
          "
        >

          <p className="text-xs font-light tracking-wide text-neutral-400 mb-3">
            {lang === "FR" ? "Expositions" : "Exhibitions"}
          </p>

          <div className="space-y-3">

            <div className="grid grid-cols-12 gap-2 text-sm md:text-base font-light">
              <span className="col-span-3 md:col-span-2 text-neutral-400">2026</span>
              <span className="col-span-9 md:col-span-10 text-neutral-800">
                {lang === "FR" ? "Exposition Galerie Leica LFI, Shanghai" : "Leica LFI Gallery Exhibition, Shanghai"}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm md:text-base font-light">
              <span className="col-span-3 md:col-span-2 text-neutral-400">2025</span>
              <span className="col-span-9 md:col-span-10 text-neutral-800">
                {lang === "FR" ? "Exposition de photographie Heartbeat RED (Xiaohongshu), Pékin" : "RED (Xiaohongshu) Heartbeat Photography Exhibition, Beijing"}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm md:text-base font-light">
              <span className="col-span-3 md:col-span-2 text-neutral-400">2024</span>
              <span className="col-span-9 md:col-span-10 text-neutral-800">
                {lang === "FR" ? "Exposition de photographie mobile Mipai « Image China », Chengdu" : "Mipai \"Image China\" Mobile Photography Exhibition, Chengdu"}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm md:text-base font-light">
              <span className="col-span-3 md:col-span-2 text-neutral-400">2023–24</span>
              <span className="col-span-9 md:col-span-10 text-neutral-800">
                {lang === "FR" ? "Trente mille secondes dans le monde humain — Pavillon principal, Dunhuang (Xiaomi Photography)" : "Thirty Thousand Seconds in the Human World — Main Pavilion, Dunhuang (Xiaomi Photography)"}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm md:text-base font-light">
              <span className="col-span-3 md:col-span-2 text-neutral-400">2023</span>
              <span className="col-span-9 md:col-span-10 text-neutral-800">
                {lang === "FR" ? "Gala Visuel 500px" : "500px Visual Gala"}
              </span>
            </div>

          </div>

        </section>


        {/* =================================================
            CONTACT
        ================================================= */}

        <section
          className="
            border-t
            border-black/10
            pt-6
            pb-[6vh]
            max-w-2xl
          "
        >

          <p className="text-xs font-light tracking-wide text-neutral-400 mb-3">
            Contact
          </p>

          <div
            className="
              flex
              flex-col
              items-start
              gap-2
              text-sm
              md:text-base
              font-light
            "
          >

            <a
              href="mailto:geogryyy@gmail.com"
              className="
                text-neutral-900
                hover:opacity-50
                transition-opacity
              "
            >
              geogryyy@gmail.com
            </a>

            <a
              href="https://www.instagram.com/geogryy_y/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-neutral-600
                hover:text-black
                transition-colors
              "
            >
              Instagram
            </a>

            <a
              href="https://www.youtube.com/@Gilico"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-neutral-600
                hover:text-black
                transition-colors
              "
            >
              YouTube
            </a>

            <a
              href="https://xhslink.cn/m/1F0LbguKZv3"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-neutral-600
                hover:text-black
                transition-colors
              "
            >
              Xiaohongshu
            </a>

          </div>

        </section>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer
        className="
          px-4
          md:px-[4vw]
          pb-[4vh]
          flex
          justify-between
          text-xs
          text-neutral-400
        "
      >

        <span>
          © {new Date().getFullYear()} XU JIANGQI
        </span>

        <span>
          PARIS
        </span>

      </footer>

    </main>
  );
}