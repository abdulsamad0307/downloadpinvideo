"use client";

import { useSearchParams } from "next/navigation";

import DownloaderTool from "@/components/DownloaderTool";

export default function ExtensionDownloader() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";

  return (
    <DownloaderTool
      initialUrl={url}
      autoProcess={true}
    />
  );
}