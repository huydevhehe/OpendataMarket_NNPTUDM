import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllDatasets,
    getAllActiveDatasets,
    getDatasetById,
    getDatasetBySellerId,
    createDataset,
    updateDataset,
    deleteDataset,
    getDatasetBySellerName,
} from "@/services/datasetService";
import { Dataset } from "@/types/index";

// 📌 Lấy tất cả dataset (yêu cầu token)
export const useDatasets = (token: string) => {
    return useQuery<Dataset[]>({
        queryKey: ["datasets"],
        queryFn: () => getAllDatasets(token),
    });
};


// 📌 Lấy tất cả dataset active (public)
export const useActiveDatasets = () => {
    return useQuery<Dataset[]>({
        queryKey: ["activeDatasets"],
        queryFn: getAllActiveDatasets,
    });
};

// 📌 Lấy dataset theo id (public)
export const useDatasetById = (id: string) => {
    return useQuery({
        queryKey: ["dataset", id],
        queryFn: () => getDatasetById(id),
        enabled: !!id,
    });
};

// 📌 Lấy dataset theo sellerId (public)
export const useDatasetBySellerId = (id: string) => {
    return useQuery({
        queryKey: ["dataset", id],
        queryFn: () => getDatasetBySellerId(id),
        enabled: !!id,
    });
};
// 📌 Lấy dataset theo tên seller (public)
export const useDatasetBySellerName = (name: string) => {
    return useQuery({
        queryKey: ["dataset", name],
        queryFn: () => getDatasetBySellerName(name),
        enabled: !!name,
    });
};

// 📌 Tạo dataset (seller hoặc admin)
export const useCreateDataset = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData) => createDataset(data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
    });
};

// 📌 Cập nhật dataset (seller hoặc admin)
export const useUpdateDataset = (token: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
            updateDataset(id, formData, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
    });
};



// 📌 Xóa dataset (seller hoặc admin)
export const useDeleteDataset = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDataset(id, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
    });
};
