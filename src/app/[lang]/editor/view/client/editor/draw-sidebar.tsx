"use client";

import {
  ActiveTool,
  Editor,
  STROKE_COLOR,
  STROKE_WIDTH,
} from "@/lib/editor/types";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { Label } from "@/app/components/ui/label";
import { Slider } from "@/app/components/ui/slider";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { ColorPicker } from "./color-picker";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface DrawSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function DrawSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: DrawSidebarProps) {
  const colorValue = editor?.getActiveStrokeColor() || STROKE_COLOR;
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;

  const onClose = () => {
    editor?.disableDrawingMode();
    onChangeActiveTool("select");
  };

  const onColorChange = (value: string) => {
    editor?.changeStrokeColor(value);
  };

  const onWidthChange = (value: number) => {
    editor?.changeStrokeWidth(value);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "draw" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="Drawing mode"
        description="Modify brush settings"
      />
      <ScrollArea>
        <div className="p-4 space-y-6 border-b">
          <Label className="text-sm">Brush width</Label>
          <Slider
            value={[widthValue]}
            onValueChange={(values) => onWidthChange(values[0])}
          />
        </div>
        <div className="p-4 space-y-6">
          <ColorPicker value={colorValue} onChange={onColorChange} />
        </div>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
