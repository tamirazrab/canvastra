"use client";

import { ActiveTool, Editor, fonts } from "@/lib/editor/types";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Button } from "@/app/components/ui/button";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function FontSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) {
  const value = editor?.getActiveFontFamily();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "font" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader title="Font" description="Change the text font" />
      <ScrollArea>
        <div className="p-4 space-y-1 border-b">
          {fonts.map((font) => (
            <Button
              key={font}
              variant="secondary"
              size="lg"
              className={cn(
                "w-full h-16 justify-start text-left",
                value === font && "border-2 border-blue-500",
              )}
              style={{
                fontFamily: font,
                fontSize: "16px",
                padding: "8px 16px",
              }}
              onClick={() => editor?.changeFontFamily(font)}
            >
              {font}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
