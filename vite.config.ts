import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { execSync } from "child_process";

const getGitHash = () => {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "dev";
  }
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_COMMIT_REF": JSON.stringify(process.env.COMMIT_REF),
    "import.meta.env.VITE_GIT_COMMIT_SHA": JSON.stringify(getGitHash()),
  },
});
