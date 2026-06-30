// Common Types - Placeholder
// Tipos comunes compartidos

export type Id = string | number;
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface BaseEntity {
  id: Id;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
