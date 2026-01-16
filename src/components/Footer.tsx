"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer
      style={{ fontFamily: "Akatab, sans-serif" }}
      className="fixed bottom-0 text-white/50 w-full text-[8px] lg:text-[10px] z-10 uppercase opacity-80 flex pb-6 px-8 justify-end"
    >
      <span className="flex items-center justify-center gap-2">
        Created by{" "}
        <a
          className="underline text-white/80 flex items-center gap-1"
          href="https://www.cortiz.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo-cortiz.svg"
            alt="Christian Ortiz"
            width={60}
            height={20}
            className="opacity-80 hover:opacity-100 transition-opacity mt-[-5px]"
          />
        </a>
      </span>
    </footer>
  );
}
