"use client";

import {
  ActiveTool,
  Editor,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH,
} from "@/lib/editor/types";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Slider } from "@/app/components/ui/slider";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface StrokeWidthSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function StrokeWidthSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeWidthSidebarProps) {
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;
  const typeValue = editor?.getActiveStrokeDashArray() || STROKE_DASH_ARRAY;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChangeStrokeWidth = (value: number) => {
    editor?.changeStrokeWidth(value);
  };

  const onChangeStrokeType = (value: number[]) => {
    editor?.changeStrokeDashArray(value);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "stroke-width" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="Stroke options"
        description="Modify the stroke of your element"
      />
      <ScrollArea>
        <div className="p-4 space-y-4 border-b">
          <Label className="text-sm">Stroke width</Label>
          <Slider
            value={[widthValue]}
            onValueChange={(values) => onChangeStrokeWidth(values[0])}
          />
        </div>
        <div className="p-4 space-y-4 border-b">
          <Label className="text-sm">Stroke type</Label>
          <Button
            onClick={() => onChangeStrokeType([])}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full h-16 justify-start text-left",
              JSON.stringify(typeValue) === `[]` && "border-2 border-blue-500",
            )}
            style={{
              padding: "8px 16px",
            }}
          >
            <div className="w-full border-black rounded-full border-4" />
          </Button>
          <Button
            onClick={() => onChangeStrokeType([5, 5])}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full h-16 justify-start text-left",
              JSON.stringify(typeValue) === `[5,5]` &&
                "border-2 border-blue-500",
            )}
            style={{
              padding: "8px 16px",
            }}
          >
            <div className="w-full border-black rounded-full border-4 border-dashed" />
          </Button>
        </div>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
