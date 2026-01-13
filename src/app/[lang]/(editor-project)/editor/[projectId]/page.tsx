import { notFound } from "next/navigation";
import { isLeft } from "fp-ts/lib/Either";
import { requireUserId } from "@/bootstrap/helpers/auth-utils";
import getProjectController from "@/feature/core/editor/application/controller/get-project.controller";
import EditorClient from "./editor-client";

interface EditorProjectIdPageProps {
  params: Promise<{
    projectId: string;
    lang: string;
  }>;
}

/**
 * Server component for editor project page
 *
 * Handles data fetching on the server for better performance and SEO.
 * Passes fetched data to client component for rendering.
 */
export default async function EditorProjectIdPage({
  params,
}: EditorProjectIdPageProps) {
  const { projectId, lang } = await params;
  const userId = await requireUserId(lang);
  const result = await getProjectController(projectId, userId);

  if (isLeft(result)) {
    // Project not found or unauthorized - show 404
    notFound();
  }

  return <EditorClient project={result.right} lang={lang} />;
}
