"use client";

import { fabric } from "fabric";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ActiveTool,
  selectionDependentTools,
} from "@/lib/editor/types";
import { useEditor } from "@/app/[lang]/editor/hooks/use-editor";
import UpdateProjectVM from "@/feature/core/editor/application/view-models/update-project-vm";
import { EditorNavbar } from "./editor-navbar";
import { EditorFooter } from "./editor-footer";
import { EditorSidebar } from "./editor-sidebar";
import { EditorToolbar } from "./editor-toolbar";

import { ShapeSidebar } from "./shape-sidebar";
import { FillColorSidebar } from "./fill-color-sidebar";
import { StrokeColorSidebar } from "./stroke-color-sidebar";
import { StrokeWidthSidebar } from "./stroke-width-sidebar";
import { OpacitySidebar } from "./opacity-sidebar";
import { TextSidebar } from "./text-sidebar";
import { FontSidebar } from "./font-sidebar";
import { ImageSidebar } from "./image-sidebar";
import { FilterSidebar } from "./filter-sidebar";
import { DrawSidebar } from "./draw-sidebar";
import { AiSidebar } from "./ai-sidebar";
import { TemplateSidebar } from "./template-sidebar";
import { RemoveBgSidebar } from "./remove-bg-sidebar";
import { SettingsSidebar } from "./settings-sidebar";
import { CanvasErrorBoundary } from "./canvas-error-boundary";

interface EditorProps {
  initialData: {
    id: string;
    json: string;
    width: number;
    height: number;
  };
}

export function Editor({ initialData }: EditorProps) {
  // Validation is handled in EditorClient component
  // Trust that server component validates data before passing to client
  const updateVM = useMemo(() => new UpdateProjectVM(), []).useVM();

  // Create debounced save function with proper cleanup
  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    // Create debounced function
    debouncedSaveRef.current = debounce(
      (values: { json: string; height: number; width: number }) => {
        updateVM.update({
          id: initialData.id,
          json: values.json,
          height: values.height,
          width: values.width,
        });
      },
      500,
    );

    // Cleanup on unmount or when dependencies change
    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel();
        debouncedSaveRef.current = null;
      }
    };
  }, [updateVM, initialData.id]);

  const debouncedSave = useCallback(
    (values: { json: string; height: number; width: number }) => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current(values);
      }
    },
    [],
  );

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json || JSON.stringify({ objects: [] }),
    defaultWidth: initialData.width || 1920,
    defaultHeight: initialData.height || 1080,
    clearSelectionCallback: onClearSelection,
    saveCallback: debouncedSave,
  });

  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        editor?.enableDrawingMode();
      }

      if (activeTool === "draw") {
        editor?.disableDrawingMode();
      }

      if (tool === activeTool) {
        return setActiveTool("select");
      }

      setActiveTool(tool);
    },
    [activeTool, editor],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="h-full flex flex-col">
      <EditorNavbar
        id={initialData.id}
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        updateVM={updateVM}
      />
      <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
        <EditorSidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <RemoveBgSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="bg-muted flex-1 overflow-auto relative flex flex-col">
          <EditorToolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <CanvasErrorBoundary>
            <div
              className="flex-1 h-[calc(100%-124px)] bg-muted"
              ref={containerRef}
            >
              <canvas ref={canvasRef} />
            </div>
          </CanvasErrorBoundary>
          <EditorFooter editor={editor} />
        </main>
      </div>
    </div>
  );
}
