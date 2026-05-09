import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access: string;
    refresh: string;
    user: {
      id: string;
      email: string;
      full_name: string;
    };
  };
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login/", payload);
  return data;
};

export const logout = async (refresh: string) => {
  await apiClient.post("/auth/logout/", { refresh });
};

export const getMe = async () => {
  const { data } = await apiClient.get("/auth/me/");
  return data;
};
