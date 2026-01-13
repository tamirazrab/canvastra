"use client";

import { useMemo, useState } from "react";

import { ActiveTool, Editor } from "@/lib/editor/types";
import GenerateImageVM from "@/feature/core/editor/application/view-models/generate-image-vm";
import PaywallVM from "@/app/[lang]/subscription/vm/paywall-vm";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { toast } from "sonner";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function AiSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: AiSidebarProps) {
  const paywallVM = useMemo(() => new PaywallVM(), []);
  const paywallState = paywallVM.useVM();
  const generateVM = useMemo(() => new GenerateImageVM(), []);
  const generateState = generateVM.useVM();

  const [value, setValue] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (paywallState.shouldBlock) {
      paywallState.triggerPaywall();
      return;
    }

    if (!value.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    const imageUrl = await generateState.generate(value);
    if (imageUrl) {
      editor?.addImage(imageUrl);
      setValue("");
      toast.success("Image generated successfully");
    } else {
      toast.error(generateState.error || "Failed to generate image");
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="AI"
        description="Generate an image using AI"
      />
      <ScrollArea>
        <form onSubmit={onSubmit} className="p-4 space-y-6">
          <Textarea
            disabled={generateState.isPending}
            placeholder="An astronaut riding a horse on mars, hd, dramatic lighting"
            cols={30}
            rows={10}
            required
            minLength={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button
            disabled={generateState.isPending}
            type="submit"
            className="w-full"
          >
            {generateState.isPending ? "Generating..." : "Generate"}
          </Button>
        </form>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
