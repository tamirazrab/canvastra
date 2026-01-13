"use client";

import { ChevronsLeft } from "lucide-react";

interface EditorSidebarCloseProps {
  onClick: () => void;
}

export function EditorSidebarClose({ onClick }: EditorSidebarCloseProps) {
  return (
    <button
      onClick={onClick}
      className="absolute -right-[1.80rem] h-[70px] bg-white top-1/2 transform -translate-y-1/2 flex items-center justify-center rounded-r-xl px-1 pr-2 border-r border-y group"
    >
      <ChevronsLeft className="size-4 text-black group-hover:opacity-75 transition" />
    </button>
  );
}
