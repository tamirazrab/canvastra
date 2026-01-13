"use client";

import { ActiveTool, Editor } from "@/lib/editor/types";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Button } from "@/app/components/ui/button";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface TextSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function TextSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSidebarProps) {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "text" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader title="Text" description="Add text to your canvas" />
      <ScrollArea>
        <div className="p-4 space-y-4 border-b">
          <Button className="w-full" onClick={() => editor?.addText("Textbox")}>
            Add a textbox
          </Button>
          <Button
            className="w-full h-16"
            variant="secondary"
            size="lg"
            onClick={() =>
              editor?.addText("Heading", {
                fontSize: 80,
                fontWeight: 700,
              })
            }
          >
            <span className="text-3xl font-bold">Add a heading</span>
          </Button>
          <Button
            className="w-full h-16"
            variant="secondary"
            size="lg"
            onClick={() =>
              editor?.addText("Subheading", {
                fontSize: 44,
                fontWeight: 600,
              })
            }
          >
            <span className="text-xl font-semibold">Add a subheading</span>
          </Button>
          <Button
            className="w-full h-16"
            variant="secondary"
            size="lg"
            onClick={() =>
              editor?.addText("Paragraph", {
                fontSize: 32,
              })
            }
          >
            Paragraph
          </Button>
        </div>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
