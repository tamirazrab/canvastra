"use client";

import { ActiveTool, Editor, filters } from "@/lib/editor/types";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Button } from "@/app/components/ui/button";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function FilterSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: FilterSidebarProps) {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "filter" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="Filters"
        description="Apply a filter to selected image"
      />
      <ScrollArea>
        <div className="p-4 space-y-1 border-b">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant="secondary"
              size="lg"
              className="w-full h-16 justify-start text-left"
              onClick={() => editor?.changeImageFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
