export interface ManagedUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_active: boolean;
}

export interface ManagedUserPayload {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_active: boolean;
  password?: string;
}
