"use client";

import {
  ActiveTool,
  Editor,
  STROKE_COLOR,
} from "@/lib/editor/types";
import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { EditorSidebarClose } from "./editor-sidebar-close";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { ColorPicker } from "./color-picker";

interface StrokeColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function StrokeColorSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeColorSidebarProps) {
  const value = editor?.getActiveStrokeColor() || STROKE_COLOR;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (value: string) => {
    editor?.changeStrokeColor(value);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "stroke-color" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="Stroke color"
        description="Add stroke color to your element"
      />
      <ScrollArea>
        <div className="p-4 space-y-6">
          <ColorPicker value={value} onChange={onChange} />
        </div>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
