import { Loader } from "lucide-react";

/**
 * Loading UI for editor page
 *
 * Shown while the editor page is loading.
 * Uses Suspense boundaries for streaming.
 */
export default function EditorLoading() {
  return (
    <div className="flex flex-col space-y-6 max-w-screen-xl mx-auto pb-10">
      <div className="h-64 bg-gradient-to-r from-[#2e62cb] via-[#0073ff] to-[#3faff5] rounded-xl animate-pulse" />
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center py-8">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
