"use client";

import {
  LayoutTemplate,
  ImageIcon,
  Pencil,
  Settings,
  Shapes,
  Sparkles,
  Type,
} from "lucide-react";

import { ActiveTool } from "@/lib/editor/types";
import { EditorSidebarItem } from "./editor-sidebar-item";

interface EditorSidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function EditorSidebar({
  activeTool,
  onChangeActiveTool,
}: EditorSidebarProps) {
  return (
    <aside className="bg-white flex flex-col w-[100px] h-full border-r overflow-y-auto">
      <ul className="flex flex-col">
        <EditorSidebarItem
          icon={LayoutTemplate}
          label="Design"
          isActive={activeTool === "templates"}
          onClick={() => onChangeActiveTool("templates")}
        />
        <EditorSidebarItem
          icon={ImageIcon}
          label="Image"
          isActive={activeTool === "images"}
          onClick={() => onChangeActiveTool("images")}
        />
        <EditorSidebarItem
          icon={Type}
          label="Text"
          isActive={activeTool === "text"}
          onClick={() => onChangeActiveTool("text")}
        />
        <EditorSidebarItem
          icon={Shapes}
          label="Shapes"
          isActive={activeTool === "shapes"}
          onClick={() => onChangeActiveTool("shapes")}
        />
        <EditorSidebarItem
          icon={Pencil}
          label="Draw"
          isActive={activeTool === "draw"}
          onClick={() => onChangeActiveTool("draw")}
        />
        <EditorSidebarItem
          icon={Sparkles}
          label="AI"
          isActive={activeTool === "ai"}
          onClick={() => onChangeActiveTool("ai")}
        />
        <EditorSidebarItem
          icon={Settings}
          label="Settings"
          isActive={activeTool === "settings"}
          onClick={() => onChangeActiveTool("settings")}
        />
      </ul>
    </aside>
  );
}
