// types.ts

// 1. Enums
export enum Role {
    buyer = "buyer",
    seller = "seller",
    admin = "admin",
}

export enum PaymentMethod {
    VND = "VND",
    ETH = "ETH",
}

export enum PaymentStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed",
}

export enum ConfirmStatus {
    waiting = "waiting",
    confirmed = "confirmed",
    failed = "failed",
}

// 2. Models (Types)

// User
export interface User {
    user_id: string;
    wallet_address?: string | null;
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    bank_account: string;
    bank_name: string;
    bank_user_name: string;

    role: Role;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    datasets?: Dataset[];
    orders?: Order[];
    reviews?: Review[];
}

// Category
export interface Category {
    category_id: string;
    name: string;
    description?: string | null;
    created_at: Date;

    datasets?: Dataset[];
}

// Dataset
export interface Dataset {
    dataset_id: string;
    seller_id: string;
    category_id: string;
    title: string;
    description?: string | null;
    price_vnd?: number | null;
    price_eth?: number | null;
    file_url: string;
    thumbnail_url?: string | null;
    file_format?: string | null;
    file_size_mb?: number | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;

    seller?: User;
    category: Category;
    orders?: Order[];
    reviews?: Review[];
    tags?: Tag[];
}

// Order
export interface Order {
    order_id: string;
    buyer_id: string;
    dataset_id: string;
    bank_ref: string | null;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    total_amount: number;
    created_at: Date;
    updated_at: Date;

    buyer?: User;
    dataset?: Dataset;
    txns?: Transaction[];
}

// Transaction
export interface Transaction {
    transaction_id: string;
    order_id: string;
    tx_hash?: string | null;
    bank_ref?: string | null;
    status: ConfirmStatus;
    created_at: Date;

    order?: Order;
}

// Review
export interface Review {
    review_id: string;
    buyer_id: string;
    dataset_id: string;
    rating: number;
    comment?: string | null;
    created_at: Date;

    buyer?: User;
    dataset?: Dataset;
}

// Tag
export interface Tag {
    tag_id: string;
    name: string;
    created_at: Date;

    datasets?: Dataset;

}

//  3. Auth Types
// Request gửi lên BE

export type LoginInput = {
    email: string;
    password: string;
};

export type RegisterInput = {
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    bank_account: string;
    bank_name: string;
    wallet_address?: string | null;
    role?: string;
};

// Response từ BE
export type LoginResponse = {
    token: string;
    refreshToken?: string;   // nếu dùng refresh token
    user?: {
        id: string;
        email: string;
        role: 'buyer' | 'seller' | 'admin';
    };
};


export type RegisterResponse = {
    user_id: string;
    email: string;
    full_name: string;
    phone_number: string;
    bank_account: string;
    bank_name: string;
    wallet_address?: string | null;
    role: string;
};
export interface DatasetPreview {
    columns: string[];
    rows: Record<string, string | number | null>[];
    total_rows?: number;      // 👈 thêm dòng này
    total_columns?: number;
}

export interface Conversation {
    id: string;
    buyer_id: string;
    seller_id: string;
    created_at: string;
    updated_at: string;
    buyer?: User;
    seller?: User;
    messages?: Message[];
    admin_joined: boolean;

}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read?: boolean;
    created_at: string;
}
