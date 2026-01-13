"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";

import { ActiveTool, Editor } from "@/lib/editor/types";
import RemoveBgVM from "@/feature/core/editor/application/view-models/remove-bg-vm";
import PaywallVM from "@/app/[lang]/subscription/vm/paywall-vm";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { toast } from "sonner";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function RemoveBgSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) {
  const paywallVM = useMemo(() => new PaywallVM(), []);
  const paywallState = paywallVM.useVM();
  const removeBgVM = useMemo(() => new RemoveBgVM(), []);
  const removeBgState = removeBgVM.useVM();

  const selectedObject = editor?.selectedObjects[0];

  // @ts-ignore
  const imageSrc = selectedObject?._originalElement?.currentSrc;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async () => {
    if (paywallState.shouldBlock) {
      paywallState.triggerPaywall();
      return;
    }

    if (!imageSrc) {
      toast.error("No image selected");
      return;
    }

    const result = await removeBgState.remove(imageSrc);
    if (result) {
      editor?.addImage(result);
      toast.success("Background removed successfully");
    } else {
      toast.error(removeBgState.error || "Failed to remove background");
    }
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "remove-bg" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="Background removal"
        description="Remove background from image using AI"
      />
      {!imageSrc && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Feature not available for this object
          </p>
        </div>
      )}
      {imageSrc && (
        <ScrollArea>
          <div className="p-4 space-y-4">
            <div
              className={cn(
                "relative aspect-square rounded-md overflow-hidden transition bg-muted",
                removeBgState.isPending && "opacity-50",
              )}
            >
              <Image src={imageSrc} fill alt="Image" className="object-cover" />
            </div>
            <Button
              disabled={removeBgState.isPending}
              onClick={onClick}
              className="w-full"
            >
              {removeBgState.isPending ? "Removing..." : "Remove background"}
            </Button>
          </div>
        </ScrollArea>
      )}
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
