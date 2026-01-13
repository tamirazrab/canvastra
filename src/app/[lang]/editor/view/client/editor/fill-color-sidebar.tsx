"use client";

import { ActiveTool, Editor, FILL_COLOR } from "@/lib/editor/types";
import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { EditorSidebarClose } from "./editor-sidebar-close";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { ColorPicker } from "./color-picker";

interface FillColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function FillColorSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: FillColorSidebarProps) {
  const value = editor?.getActiveFillColor() || FILL_COLOR;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (value: string) => {
    editor?.changeFillColor(value);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "fill" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="Fill color"
        description="Add fill color to your element"
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
