"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BaseVM } from "reactvvm";
import { getProjectsAction } from "@/feature/core/editor/application/server-actions";
import Project from "@/feature/core/project/domain/entity/project.entity";

export type ProjectsListVm = {
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  error?: string;
  loadMore: () => void;
  hasMore: boolean;
  refresh: () => void;
};

export default class ProjectsListVM extends BaseVM<ProjectsListVm> {
  useVM(): ProjectsListVm {
    const params = useParams();
    const lang = (params.lang as string) || "en";
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchProjects = async (pageNum: number, append = false) => {
      try {
        setIsLoading(true);
        setIsError(false);
        const result = await getProjectsAction(pageNum, 5, lang);

        if (!result.success) {
          setIsError(true);
          setError(result.error);
          return;
        }

        if (append) {
          setProjects((prev) => [...prev, ...result.data.projects]);
        } else {
          setProjects(result.data.projects);
        }
        setHasMore(result.data.hasMore);
      } catch (err) {
        setIsError(true);
        setError(
          err instanceof Error ? err.message : "Failed to fetch projects",
        );
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchProjects(1, false);
    }, [lang]);

    const loadMore = () => {
      if (hasMore && !isLoading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProjects(nextPage, true);
      }
    };

    const refresh = () => {
      setPage(1);
      fetchProjects(1, false);
    };

    return {
      projects,
      isLoading,
      isError,
      error,
      loadMore,
      hasMore,
      refresh,
    };
  }
}
