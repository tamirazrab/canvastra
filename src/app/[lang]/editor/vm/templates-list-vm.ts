"use client";

import { useState, useEffect } from "react";
import { BaseVM } from "reactvvm";
import { getTemplatesAction } from "@/feature/core/editor/application/server-actions";
import Project from "@/feature/core/project/domain/entity/project.entity";

export type TemplatesListVm = {
  templates: Project[];
  isLoading: boolean;
  isError: boolean;
  error?: string;
  loadMore: () => void;
  hasMore: boolean;
  refresh: () => void;
};

export default class TemplatesListVM extends BaseVM<TemplatesListVm> {
  useVM(): TemplatesListVm {
    const [templates, setTemplates] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchTemplates = async (pageNum: number, append = false) => {
      try {
        setIsLoading(true);
        setIsError(false);
        const result = await getTemplatesAction(pageNum, 5);

        if (!result.success) {
          setIsError(true);
          setError(result.error);
          return;
        }

        if (append) {
          setTemplates((prev) => [...prev, ...result.data.templates]);
        } else {
          setTemplates(result.data.templates);
        }
        setHasMore(result.data.hasMore);
      } catch (err) {
        setIsError(true);
        setError(
          err instanceof Error ? err.message : "Failed to fetch templates",
        );
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchTemplates(1, false);
    }, []);

    const loadMore = () => {
      if (hasMore && !isLoading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTemplates(nextPage, true);
      }
    };

    const refresh = () => {
      setPage(1);
      fetchTemplates(1, false);
    };

    return {
      templates,
      isLoading,
      isError,
      error,
      loadMore,
      hasMore,
      refresh,
    };
  }
}
