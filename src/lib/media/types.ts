export type MediaType = "video" | "image" | "gif";

export interface MediaVariant {
  id: string;
  url: string;
  format?: string;
  quality?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}

export interface PinterestMediaResult {
  sourceUrl: string;
  type: MediaType;
  title?: string;
  thumbnail?: string;
  variants: MediaVariant[];
}

export type ApiErrorCode =
  | "INVALID_URL"
  | "PRIVATE_OR_RESTRICTED"
  | "MEDIA_NOT_FOUND"
  | "UNSUPPORTED_MEDIA"
  | "EXTRACTION_FAILED"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
}

export interface ApiSuccessResponse {
  success: true;
  data: PinterestMediaResult;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export type ApiDownloadResponse = ApiSuccessResponse | ApiErrorResponse;
