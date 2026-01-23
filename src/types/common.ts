/**
 * MCG Golf App - Common Types
 * Shared utility types used throughout the app
 */

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// Form types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
}

// Date ranges
export type DateRange = {
  start: Date;
  end: Date;
};

export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all-time' | 'custom';

// Dimensions (for responsive design)
export interface Dimensions {
  width: number;
  height: number;
}

// Touch coordinates
export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

// Video frame
export interface VideoFrame {
  uri: string;
  timestamp: number; // ms
  frameNumber: number;
}

// Selection types
export interface SelectOption<T = string> {
  label: string;
  value: T;
  icon?: string;
  disabled?: boolean;
}

// Toast/notification
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Modal configuration
export interface ModalConfig {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

// Generic callback types
export type VoidCallback = () => void;
export type AsyncCallback = () => Promise<void>;
export type ValueCallback<T> = (value: T) => void;

// Nullable utility
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Deep partial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Pick with required fields
export type RequiredPick<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

// Extract array element type
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
