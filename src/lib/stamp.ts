import { createServerFn } from "@tanstack/react-start";

export {
  STAMP_MIN_AGE_MS,
  STAMP_MAX_AGE_MS,
  STAMP_STORAGE_KEY,
} from "@/lib/stamp-shared";

export const issueStamp = createServerFn({ method: "GET" }).handler(async () => {
  const { mintStamp } = await import("./stamp-crypto");
  return mintStamp();
});
