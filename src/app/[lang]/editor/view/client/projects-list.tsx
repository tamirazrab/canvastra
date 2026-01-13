"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CopyIcon, FileIcon, MoreHorizontal, Trash } from "lucide-react";

import DeleteProjectVM from "@/feature/core/editor/application/view-models/delete-project-vm";
import DuplicateProjectVM from "@/feature/core/editor/application/view-models/duplicate-project-vm";
import { useConfirm } from "@/hooks/use-confirm";
import Project from "@/feature/core/project/domain/entity/project.entity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface ProjectsListProps {
  initialProjects: Project[];
}

export function ProjectsList({ initialProjects }: ProjectsListProps) {
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || "en";
  const [projects, setProjects] = useState(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const deleteVM = useMemo(() => new DeleteProjectVM(), []);
  const deleteVMState = deleteVM.useVM();

  const duplicateVM = useMemo(() => new DuplicateProjectVM(), []);
  const duplicateVMState = duplicateVM.useVM();

  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Are you sure?",
    "This will permanently delete this project.",
  );

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;

    setDeletingId(id);
    try {
      await deleteVMState.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id);
    try {
      // duplicate method already handles navigation and toast internally
      await duplicateVMState.duplicate(id);
    } catch (error) {
      toast.error("Failed to duplicate project");
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recent projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/${lang}/editor/${project.id}`}
              className="group"
            >
              <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center hover:opacity-75 transition cursor-pointer border border-muted-foreground/10">
                <FileIcon className="size-12 text-muted-foreground" />
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          handleDuplicate(project.id);
                        }}
                        disabled={duplicatingId === project.id}
                      >
                        <CopyIcon className="size-4 mr-2" />
                        {duplicatingId === project.id
                          ? "Duplicating..."
                          : "Duplicate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(project.id);
                        }}
                        disabled={deletingId === project.id}
                        className="text-destructive"
                      >
                        <Trash className="size-4 mr-2" />
                        {deletingId === project.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
