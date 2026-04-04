import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { DatasetPreview } from "@/types";

export const useDatasetPreview = (id?: string, limit = 5) => {
    return useQuery<DatasetPreview>({
        queryKey: ["dataset-preview", id, limit],
        queryFn: async () => {
            if (!id) throw new Error("Dataset ID is required");
            const res = await api.get<{ success: boolean; message: string; data: DatasetPreview }>(
                `/dataset/${id}/preview?limit=${limit}`
            );
            return res.data.data;
        },
        enabled: !!id,
    });
};
