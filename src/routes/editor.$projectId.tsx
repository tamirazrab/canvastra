// src/routes/editor.$projectId.tsx
import { createFileRoute } from "@tanstack/react-router";
import { client } from "@/lib/hono";
import { Editor } from "@/features/editor/components/editor";
import { Loader, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$projectId")({
  loader: async ({ params }) => {
    const response = await client.api.projects[":id"].$get({
      param: { id: params.projectId },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }

    const { data } = await response.json();
    return data;
  },
  component: EditorPage,
});

function EditorPage() {
  const data = Route.useLoaderData({ select: (d) => d });

  if (!data) {
    return (
      <div className="h-full flex flex-col gap-y-5 items-center justify-center">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Failed to fetch project
        </p>
        <Button asChild variant="secondary">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return <Editor initialData={data} />;
}
