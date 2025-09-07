import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      ".next/**",
      "out/**", // Next.js static export output
      "lib/generated/**", // Prisma generated files
      "bun.lockb", // Bun binary lockfile
      "*.tsbuildinfo", // TypeScript incremental build info
      ".env*", // Environment files
      ".vercel/**", // Vercel deployment files
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
