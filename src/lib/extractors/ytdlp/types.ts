export interface YtdlpFormat {
  format_id?: string;
  url?: string;
  ext?: string;
  protocol?: string;
  width?: number;
  height?: number;
  resolution?: string;
  vcodec?: string;
  filesize?: number;
  filesize_approx?: number;
}

export interface YtdlpMetadata {
  title?: string;
  thumbnail?: string;
  formats?: YtdlpFormat[];
  webpage_url?: string;
}
