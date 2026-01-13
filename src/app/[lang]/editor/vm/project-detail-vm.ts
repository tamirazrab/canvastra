"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BaseVM } from "reactvvm";
import { getProjectAction } from "@/feature/core/editor/application/server-actions";
import Project from "@/feature/core/project/domain/entity/project.entity";

export type ProjectDetailVm = {
  project: Project | null;
  isLoading: boolean;
  isError: boolean;
  error?: string;
  refresh: () => void;
};

export default class ProjectDetailVM extends BaseVM<ProjectDetailVm> {
  private projectId: string;

  constructor(projectId: string) {
    super();
    this.projectId = projectId;
  }

  useVM(): ProjectDetailVm {
    const params = useParams();
    const lang = (params.lang as string) || "en";
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const fetchProject = async () => {
      if (!this.projectId) return;

      try {
        setIsLoading(true);
        setIsError(false);
        const result = await getProjectAction(this.projectId, lang);

        if (!result.success) {
          setIsError(true);
          setError(result.error);
          return;
        }

        setProject(result.data);
      } catch (err) {
        setIsError(true);
        setError(
          err instanceof Error ? err.message : "Failed to fetch project",
        );
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchProject();
    }, [this.projectId, lang]);

    const refresh = () => {
      fetchProject();
    };

    return {
      project,
      isLoading,
      isError,
      error,
      refresh,
    };
  }
}
