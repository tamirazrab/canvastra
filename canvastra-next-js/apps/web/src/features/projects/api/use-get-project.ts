import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "@/utils/trpc";

// tRPC returns the project directly, but we wrap it to match canva-clone's structure
export type ResponseType = {
  data: Awaited<ReturnType<typeof trpcClient.project.get.query>>;
};

export const useGetProject = (id: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["project", { id }],
    queryFn: async () => {
      try {
        const result = await trpcClient.project.get.query({
          id,
        });
        // Wrap in data to match canva-clone's ResponseType structure
        return { data: result };
      } catch (error) {
        console.error("Error fetching project:", error);
        throw error;
      }
    },
  });

  return query;
};
