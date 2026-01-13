"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Loader } from "lucide-react";

import { ActiveTool, Editor } from "@/lib/editor/types";
import ImagesListVM from "@/feature/core/editor/application/view-models/images-list-vm";
import { UnsplashImage } from "@/feature/core/image/domain/i-repo/image.repository.interface";
// TEMPORARILY DISABLED: UploadThing has compatibility issues with Next.js 16
// import { UploadButton } from "@/lib/uploadthing";

import { cn } from "@/bootstrap/helpers/lib/ui-utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { EditorSidebarHeader } from "./editor-sidebar-header";
import { EditorSidebarClose } from "./editor-sidebar-close";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export function ImageSidebar({
  editor,
  activeTool,
  onChangeActiveTool,
}: ImageSidebarProps) {
  const imagesVM = useMemo(() => new ImagesListVM(), []);
  const imagesState = imagesVM.useVM();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden",
      )}
    >
      <EditorSidebarHeader
        title="Images"
        description="Add images to your canvas"
      />
      <div className="p-4 border-b">
        {/* TEMPORARILY DISABLED: UploadThing has compatibility issues with Next.js 16 */}
        <div className="w-full p-3 text-sm text-center text-muted-foreground border rounded-md bg-muted">
          Image upload is temporarily disabled due to Next.js 16 compatibility issues
        </div>
        {/* TODO: Re-enable when UploadThing fixes Next.js 16 compatibility
        <UploadButton
          appearance={{
            button: "w-full text-sm font-medium",
            allowedContent: "hidden",
          }}
          content={{
            button: "Upload Image",
          }}
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            editor?.addImage(res[0].url);
          }}
        />
        */}
      </div>
      {imagesState.isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {imagesState.isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Failed to fetch images
          </p>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {imagesState.images &&
              imagesState.images.map((image: UnsplashImage) => (
                <button
                  onClick={() => editor?.addImage(image.urls.regular)}
                  key={image.id}
                  className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                >
                  <Image
                    src={image?.urls?.small || image?.urls?.thumb}
                    alt={image.alt_description || "Image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {image.links?.html && (
                    <Link
                      target="_blank"
                      href={image.links.html}
                      className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 text-left"
                    >
                      {image.user?.name || "Unsplash"}
                    </Link>
                  )}
                </button>
              ))}
          </div>
        </div>
      </ScrollArea>
      <EditorSidebarClose onClick={onClose} />
    </aside>
  );
}
