"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AlertTriangle, Loader, Crown } from "lucide-react";

import { ActiveTool, Editor } from "@/lib/editor/types";
import TemplatesListVM from "@/app/[lang]/editor/vm/templates-list-vm";
import PaywallVM from "@/app/[lang]/subscription/vm/paywall-vm";
import Project from "@/feature/core/project/domain/entity/project.entity";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function TemplateSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: TemplateSidebarProps) {
  const paywallVM = useMemo(() => new PaywallVM(), []);
  const paywallState = paywallVM.useVM();
  const templatesVM = useMemo(() => new TemplatesListVM(), []);
  const templatesState = templatesVM.useVM();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async (template: Project) => {
    if (template.isPro && paywallState.shouldBlock) {
      paywallState.triggerPaywall();
      return;
    }

    const confirmed = window.confirm(
      "Are you sure? You are about to replace the current project with this template.",
    );

    if (confirmed) {
      editor?.loadJson(template.json);
    }
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "templates" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="Templates"
        description="Choose from a variety of templates to get started"
      />
      {templatesState.isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {templatesState.isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Failed to fetch templates
          </p>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {templatesState.templates &&
              templatesState.templates.map((template: Project) => (
                <button
                  style={{
                    aspectRatio: `${template.width}/${template.height}`,
                  }}
                  onClick={() => onClick(template)}
                  key={template.id}
                  className="relative w-full group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                >
                  <Image
                    fill
                    src={template.thumbnailUrl || ""}
                    alt={template.name || "Template"}
                    className="object-cover"
                  />
                  {template.isPro && (
                    <div className="absolute top-2 right-2 size-8 items-center flex justify-center bg-black/50 rounded-full">
                      <Crown className="size-4 fill-yellow-500 text-yellow-500" />
                    </div>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 text-left">
                    {template.name}
                  </div>
                </button>
              ))}
          </div>
        </div>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
