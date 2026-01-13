"use client";

import { Editor } from "@/app/[lang]/editor/view/client/editor/editor";
import Project from "@/feature/core/project/domain/entity/project.entity";

interface EditorClientProps {
  project: Project;
  lang: string;
}

/**
 * Client component for the editor page
 *
 * This component handles client-side rendering of the editor.
 * Data fetching is done in the parent server component.
 */
export default function EditorClient({ project, lang }: EditorClientProps) {
  // Validate project data
  if (
    typeof project.width !== "number" ||
    typeof project.height !== "number" ||
    !project.id ||
    typeof project.json !== "string"
  ) {
    return (
      <div className="h-full flex flex-col gap-y-5 items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Project data is incomplete. Missing required fields.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Editor
        initialData={{
          id: project.id,
          json: project.json,
          width: project.width,
          height: project.height,
        }}
      />
    </div>
  );
}
