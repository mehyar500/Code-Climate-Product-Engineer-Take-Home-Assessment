interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN: string;
  // add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 