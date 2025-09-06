"use client";
import React from "react";

export default function Button({
  children,
  onClick,
  className,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const base =
    "px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all text-sm";
  const enabled = "bg-blue-600 text-white hover:bg-blue-700 shadow-sm";
  const disabledCls = "bg-gray-300 text-gray-600 cursor-not-allowed";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${disabled ? disabledCls : enabled} ${
        className ?? ""
      }`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
