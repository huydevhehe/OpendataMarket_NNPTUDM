import axios from "@/lib/axios";
import { Dataset } from "@/types/index"; // ngài có thể định nghĩa type riêng

// 📌 Lấy tất cả dataset (public)
export const getAllDatasets = async (token: string) => {
    const res = await axios.get<Dataset[]>("/dataset", {
        headers: { Authorization: `Bearer ${token}` },
    });
    // console.log("Datasets fetched:", res.data);
    return res.data;
};

// 📌 Lấy tất cả dataset active (public)
export const getAllActiveDatasets = async () => {
    const res = await axios.get<Dataset[]>("/dataset/active");
    return res.data;
};

// 📌 Lấy dataset theo id (public)
export const getDatasetById = async (id: string) => {
    const res = await axios.get<Dataset>(`/dataset/${id}`);
    return res.data;
};

// 📌 Lấy dataset theo sellerId (public)
export const getDatasetBySellerId = async (id: string) => {
    const res = await axios.get<Dataset[]>(`/dataset/seller/${id}`);
    return res.data;
};
// 📌 Lấy dataset theo tên seller (public)
export const getDatasetBySellerName = async (name: string) => {
    const res = await axios.get<Dataset[]>(`/dataset/seller/name/${name}`);
    return res.data;
};

// 📌 Tạo dataset (seller hoặc admin) — nhận sẵn FormData từ FE
export const createDataset = async (formData: FormData, token: string) => {

    // // ✅ Log chính xác dữ liệu
    // console.group("🚀 [Service] FormData gửi lên backend:");
    // for (const [key, value] of formData.entries()) {
    //     if (value instanceof File) {
    //         console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
    //     } else {
    //         console.log(`${key}:`, value);
    //     }
    // }
    // console.groupEnd();

    // ✅ Gửi thẳng FormData, axios tự set Content-Type
    const res = await axios.post("/dataset", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};


// 📌 Cập nhật dataset (seller hoặc admin) — nhận sẵn FormData từ FE
export const updateDataset = async (id: string, formData: FormData, token: string) => {

    // // ✅ Log dữ liệu gửi lên backend (bật khi debug)
    // console.group("🧾 [Service] FormData cập nhật dataset:");
    // for (const [key, value] of formData.entries()) {
    //     if (value instanceof File) {
    //         console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
    //     } else {
    //         console.log(`${key}:`, value);
    //     }
    // }
    // console.groupEnd();

    const res = await axios.put(`/dataset/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};


// 📌 Xóa dataset (seller hoặc admin)
export const deleteDataset = async (id: string, token: string) => {
    const res = await axios.delete(`/dataset/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};