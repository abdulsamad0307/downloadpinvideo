type VideoJobResult<T> = Promise<T>;

const runningJobs = new Map<
  string,
  VideoJobResult<unknown>
>();

export function hasRunningVideoJob(
  jobKey: string,
): boolean {
  return runningJobs.has(jobKey);
}

export function getRunningVideoJob<T>(
  jobKey: string,
): Promise<T> | null {
  const existing =
    runningJobs.get(jobKey);

  return existing
    ? (existing as Promise<T>)
    : null;
}

export async function runSingleVideoJob<T>(
  jobKey: string,
  job: () => Promise<T>,
): Promise<T> {
  const existing =
    runningJobs.get(jobKey);

  if (existing) {
    console.log(
      `[Download Pin Video JOB] JOIN ${jobKey}`,
    );

    return existing as Promise<T>;
  }

  console.log(
    `[Download Pin Video JOB] START ${jobKey}`,
  );

  const promise =
    Promise.resolve()
      .then(job)
      .then((result) => {
        console.log(
          `[Download Pin Video JOB] DONE ${jobKey}`,
        );

        return result;
      })
      .catch((error) => {
        console.error(
          `[Download Pin Video JOB] FAILED ${jobKey}`,
          error,
        );

        throw error;
      })
      .finally(() => {
        runningJobs.delete(
          jobKey,
        );
      });

  runningJobs.set(
    jobKey,
    promise,
  );

  return promise;
}

export function getRunningVideoJobCount(): number {
  return runningJobs.size;
}