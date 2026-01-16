"use client";

import dynamic from "next/dynamic";

const DepthMapScene = dynamic(() => import("@/components/DepthMapScene"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="w-screen h-screen bg-black relative flex justify-center items-center">
      <DepthMapScene />
    </div>
  );
}
