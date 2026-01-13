import { fabric } from "fabric";
import { useEffect, useRef } from "react";

import { JSON_KEYS } from "@/lib/editor/types";

/**
 * Canvas data structure from JSON
 */
interface CanvasData {
  objects?: CanvasObject[];
  [key: string]: unknown;
}

interface CanvasObject {
  type?: string;
  src?: string;
  pattern?: {
    source?: string;
    [key: string]: unknown;
  };
  fill?: string | {
    type?: string;
    source?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Sanitize canvas data to remove invalid image sources and patterns
 * This prevents fabric.js from trying to access undefined properties
 */
function sanitizeCanvasData(data: unknown): CanvasData {
  if (!data || typeof data !== "object" || data === null) {
    return { objects: [] };
  }

  const canvasData = data as CanvasData;

  // If data has objects array, sanitize each object
  if (Array.isArray(canvasData.objects)) {
    const sanitizedObjects = canvasData.objects
      .map((obj: CanvasObject) => {
        // If it's an image object without a valid src, remove it
        if (obj.type === "image" && (!obj.src || obj.src === "")) {
          return null;
        }

        // Remove invalid pattern references that might cause errors
        if (obj.pattern && (!obj.pattern.source || obj.pattern.source === "")) {
          // Remove pattern if source is invalid
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { pattern: _pattern, ...rest } = obj;
          return rest as CanvasObject;
        }

        // Ensure fill patterns have valid sources
        if (
          obj.fill &&
          typeof obj.fill === "object" &&
          obj.fill.type === "pattern"
        ) {
          if (!obj.fill.source || obj.fill.source === "") {
            // Remove invalid pattern fill
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { fill: _fill, ...rest } = obj;
            return rest as CanvasObject;
          }
        }

        return obj;
      })
      .filter((obj: CanvasObject | null): obj is CanvasObject => obj !== null);

    return {
      ...data,
      objects: sanitizedObjects,
    };
  }

  return canvasData;
}

interface UseLoadStateProps {
  autoZoom: () => void;
  canvas: fabric.Canvas | null;
  initialState: React.MutableRefObject<string | undefined>;
  canvasHistory: React.MutableRefObject<string[]>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Get current canvas state as JSON string
 */
function getCurrentCanvasState(canvas: fabric.Canvas): string {
  return JSON.stringify(canvas.toJSON(JSON_KEYS));
}

export const useLoadState = ({
  canvas,
  autoZoom,
  initialState,
  canvasHistory,
  setHistoryIndex,
}: UseLoadStateProps) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialState?.current && canvas) {
      try {
        // Validate that initialState is a valid JSON string
        if (!initialState.current || initialState.current.trim() === "") {
          throw new Error("Initial state is empty");
        }

        const data = JSON.parse(initialState.current);

        // Validate that data is an object
        if (typeof data !== "object" || data === null) {
          throw new Error("Invalid initial state format");
        }

        // Sanitize the data to remove any invalid image sources
        // This prevents fabric.js from trying to access undefined source.width
        const sanitizedData = sanitizeCanvasData(data);

        // Use fabric.js loadFromJSON with error handling
        // Include both success and error callbacks
        canvas.loadFromJSON(
          sanitizedData,
          () => {
            // Success callback
            try {
              const currentState = getCurrentCanvasState(canvas);
              // eslint-disable-next-line no-param-reassign
              canvasHistory.current = [currentState];
              setHistoryIndex(0);
              autoZoom();
            } catch (error) {
              console.error("Error processing loaded state:", error);
              // Initialize with current canvas state even if processing fails
              try {
                const currentState = getCurrentCanvasState(canvas);
                // eslint-disable-next-line no-param-reassign
                canvasHistory.current = [currentState];
                setHistoryIndex(0);
                autoZoom();
              } catch (fallbackError) {
                console.error(
                  "Error initializing fallback state:",
                  fallbackError,
                );
              }
            }
          },
          (error: Error) => {
            // Error callback - handle errors during object enlivening
            console.error("Error loading canvas state from JSON:", error);
            // If there's an error loading, initialize with empty state
            try {
              // Clear canvas and initialize with empty state
              canvas.clear();
              const currentState = getCurrentCanvasState(canvas);
              // eslint-disable-next-line no-param-reassign
              canvasHistory.current = [currentState];
              setHistoryIndex(0);
              autoZoom();
            } catch (fallbackError) {
              console.error(
                "Error initializing fallback state:",
                fallbackError,
              );
            }
          },
        );
        initialized.current = true;
      } catch (error) {
        console.error("Error parsing or loading initial state:", error);
        // If parsing fails, initialize with empty state
        try {
          const currentState = getCurrentCanvasState(canvas);
          // eslint-disable-next-line no-param-reassign
          canvasHistory.current = [currentState];
          setHistoryIndex(0);
          autoZoom();
        } catch (fallbackError) {
          console.error("Error initializing fallback state:", fallbackError);
        }
        initialized.current = true;
      }
    }
  }, [canvas, autoZoom, initialState, canvasHistory, setHistoryIndex]);
};
