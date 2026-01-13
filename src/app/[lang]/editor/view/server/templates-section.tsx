import { isLeft } from "fp-ts/lib/Either";
import getTemplatesController from "@/feature/core/editor/application/controller/get-templates.controller";
import { logger } from "@/lib/logger";
import { TemplatesList } from "../client/templates-list";

export async function TemplatesSection() {
  const result = await getTemplatesController({
    limit: 5,
    skip: 0,
  });

  if (isLeft(result)) {
    // Log error for monitoring and debugging
    logger.error("Failed to load templates", new Error(result.left.message), {
      namespace: result.left.namespace,
      limit: 5,
      skip: 0,
    });

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Start from a template</h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">
            Failed to load templates. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!result.right.items || result.right.items.length === 0) {
    return null;
  }

  return <TemplatesList initialTemplates={result.right.items} />;
}
