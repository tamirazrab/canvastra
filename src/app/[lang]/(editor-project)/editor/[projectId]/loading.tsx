import { Loader } from "lucide-react";

/**
 * Loading UI for editor project page
 *
 * Shown while the project is being fetched.
 */
export default function EditorProjectLoading() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Loader className="size-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Loading project...</p>
    </div>
  );
}
