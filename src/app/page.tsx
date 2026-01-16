"use client";

import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const DepthMapScene = dynamic(() => import("@/components/DepthMapScene"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <div className="w-screen h-screen bg-black relative flex justify-center items-center pb-12">
        <div className="relative w-[90vw] h-[90vh] overflow-hidden">
          <DepthMapScene />
        </div>
      </div>
      <Footer />
    </>
  );
}
