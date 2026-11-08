export interface User {
  id: string;
  email: string;
  name: string;
  phone_number?: string | null;
  auth_provider: string;
  profile_image_url?: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
}
