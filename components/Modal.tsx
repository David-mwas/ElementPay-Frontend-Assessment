"use client";
import React from "react";

export default function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full animate-fade-in">
        {children}
      </div>
    </div>
  );
}
