import axios, { type AxiosRequestConfig, AxiosError } from "axios";

export class ApiError extends Error {
    public status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.status = status;
    }
}

export async function apiFetch<T = unknown>(
    endpoint: string,
    options: AxiosRequestConfig = {}
): Promise<T> {
    try {
        const response = await axios(`/api${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers ?? {}),
            },
            ...options,
        });

        return response.data as T;
    } catch (err) {
        const error = err as AxiosError<any>;
        
        const message = 
            (error.response?.data as any)?.message || 
            error.message || 
            "Network error";

        throw new ApiError(message, error.response?.status);
    }
}