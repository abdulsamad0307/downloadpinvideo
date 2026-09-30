import type { PinterestMediaResult } from "@/lib/media/types";

export interface PinterestExtractor {
  extractPinterestMedia(url: string): Promise<PinterestMediaResult>;
}

export { ExtractionError } from "@/lib/api/errors";
