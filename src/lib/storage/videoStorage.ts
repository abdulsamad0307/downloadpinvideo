import {
    copyFile,
    mkdir,
    readdir,
    rm,
    stat,
  } from "fs/promises";
  
  import { tmpdir } from "os";
  
  import path from "path";
  
  export interface StoredVideoFile {
    storageKey: string;
    filePath: string;
    fileSize: number;
    createdAt: number;
    expiresAt: number;
  }
  
  const VIDEO_STORAGE_TTL_MS =
    30 * 60 * 1000; // 30 minutes
  
  const VIDEO_STORAGE_DIR = path.join(
    tmpdir(),
    "download-pin-video-storage",
  );
  
  /**
   * Only internally generated cache keys are allowed.
   * Prevents path traversal such as ../../file.
   */
  function assertValidStorageKey(
    storageKey: string,
  ): void {
    if (
      !/^[a-zA-Z0-9_-]{8,128}$/.test(
        storageKey,
      )
    ) {
      throw new Error(
        "Invalid video storage key",
      );
    }
  }
  
  function getStoredFilePath(
    storageKey: string,
  ): string {
    assertValidStorageKey(storageKey);
  
    return path.join(
      VIDEO_STORAGE_DIR,
      `${storageKey}.mp4`,
    );
  }
  
  async function ensureStorageDirectory(): Promise<void> {
    await mkdir(
      VIDEO_STORAGE_DIR,
      {
        recursive: true,
      },
    );
  }
  
  /**
   * Save a completed yt-dlp MP4 into reusable
   * temporary Download Pin Video storage.
   */
  export async function storeVideoFile(
    storageKey: string,
    sourceFilePath: string,
  ): Promise<StoredVideoFile> {
    await ensureStorageDirectory();
  
    const destinationPath =
      getStoredFilePath(storageKey);
  
    await copyFile(
      sourceFilePath,
      destinationPath,
    );
  
    const fileStats =
      await stat(destinationPath);
  
    const createdAt = Date.now();
  
    return {
      storageKey,
      filePath: destinationPath,
      fileSize: fileStats.size,
      createdAt,
      expiresAt:
        createdAt +
        VIDEO_STORAGE_TTL_MS,
    };
  }
  
  /**
   * Return an existing cached MP4 if it still exists
   * and has not expired.
   */
  export async function getStoredVideoFile(
    storageKey: string,
  ): Promise<StoredVideoFile | null> {
    await ensureStorageDirectory();
  
    const filePath =
      getStoredFilePath(storageKey);
  
    try {
      const fileStats =
        await stat(filePath);
  
      if (!fileStats.isFile()) {
        return null;
      }
  
      const createdAt =
        fileStats.mtimeMs;
  
      const expiresAt =
        createdAt +
        VIDEO_STORAGE_TTL_MS;
  
      if (expiresAt <= Date.now()) {
        await rm(
          filePath,
          {
            force: true,
          },
        );
  
        return null;
      }
  
      return {
        storageKey,
        filePath,
        fileSize: fileStats.size,
        createdAt,
        expiresAt,
      };
    } catch (error) {
      const nodeError =
        error as NodeJS.ErrnoException;
  
      if (
        nodeError.code === "ENOENT"
      ) {
        return null;
      }
  
      throw error;
    }
  }
  
  /**
   * Manually delete one cached video.
   */
  export async function deleteStoredVideoFile(
    storageKey: string,
  ): Promise<void> {
    const filePath =
      getStoredFilePath(storageKey);
  
    await rm(
      filePath,
      {
        force: true,
      },
    );
  }
  
  /**
   * Remove expired temporary videos.
   *
   * We will call this during video preparation so
   * old cache files do not accumulate on disk.
   */
  export async function cleanupExpiredVideoFiles(): Promise<void> {
    await ensureStorageDirectory();
  
    const files =
      await readdir(
        VIDEO_STORAGE_DIR,
        {
          withFileTypes: true,
        },
      );
  
    const now = Date.now();
  
    await Promise.all(
      files.map(
        async (file) => {
          if (
            !file.isFile() ||
            !file.name.endsWith(".mp4")
          ) {
            return;
          }
  
          const filePath =
            path.join(
              VIDEO_STORAGE_DIR,
              file.name,
            );
  
          try {
            const fileStats =
              await stat(filePath);
  
            if (
              fileStats.mtimeMs +
                VIDEO_STORAGE_TTL_MS <=
              now
            ) {
              await rm(
                filePath,
                {
                  force: true,
                },
              );
            }
          } catch {
            // A concurrent cleanup/request may already
            // have removed the file.
          }
        },
      ),
    );
  }