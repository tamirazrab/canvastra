"use client";

import Link from "next/link";
import { Loader, TriangleAlert } from "lucide-react";
import { Editor } from "@/features/editor/components/editor";

interface EditorProjectIdPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const EditorProjectIdPage = async ({
  params,
}: EditorProjectIdPageProps) => {
  const { projectId } = await params;

  // TODO: Fetch project using tRPC
  // For now, just render the editor
  // const { data, isLoading, isError } = await trpc.project.getById.query({ id: projectId });

  return <Editor initialData={null} />;
};

export default EditorProjectIdPage;
