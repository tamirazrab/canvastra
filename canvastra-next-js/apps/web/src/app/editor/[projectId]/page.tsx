"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader, TriangleAlert } from "lucide-react";

import { useGetProject } from "@/features/projects/api/use-get-project";

import { Editor } from "@/features/editor/components/editor";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface EditorProjectIdPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const EditorProjectIdPage = ({ params }: EditorProjectIdPageProps) => {
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setProjectId(p.projectId)).catch(console.error);
  }, [params]);

  const { data, isLoading, isError } = useGetProject(projectId || "");

  if (!projectId) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col gap-y-5 items-center justify-center">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Failed to fetch project
        </p>
        <Link href="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return <Editor initialData={data} />;
};

export default EditorProjectIdPage;
