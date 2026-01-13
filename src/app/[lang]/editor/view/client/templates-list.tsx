"use client";

import { useMemo } from "react";
import CreateProjectButtonVM from "@/app/[lang]/editor/vm/create-project-button-vm";
import PaywallVM from "@/app/[lang]/subscription/vm/paywall-vm";
import Project from "@/feature/core/project/domain/entity/project.entity";
import { TemplateCard } from "./template-card/template-card";

interface TemplatesListProps {
  initialTemplates: Project[];
}

export function TemplatesList({ initialTemplates }: TemplatesListProps) {
  const createVM = useMemo(() => new CreateProjectButtonVM(), []);
  const createVMState = createVM.useVM();

  const paywallVM = useMemo(() => new PaywallVM(), []);
  const paywallState = paywallVM.useVM();

  const onClick = async (template: Project) => {
    if (template.isPro && paywallState.shouldBlock) {
      paywallState.triggerPaywall();
      return;
    }

    await createVMState.create({
      name: `${template.name} project`,
      json: template.json,
      width: template.width,
      height: template.height,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Start from a template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            title={template.name}
            imageSrc={template.thumbnailUrl || ""}
            onClick={() => onClick(template)}
            disabled={createVMState.props.isDisable}
            description={`${template.width} x ${template.height} px`}
            width={template.width}
            height={template.height}
            isPro={template.isPro || false}
          />
        ))}
      </div>
    </div>
  );
}
