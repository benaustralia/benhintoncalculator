export function getBuildHash(): string {
  return (import.meta.env.VITE_COMMIT_REF || import.meta.env.VITE_GIT_COMMIT_SHA)?.substring(0, 7) || "dev";
}
