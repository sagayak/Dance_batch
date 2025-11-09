// Fix: Manually define the types for import.meta.env as a workaround
// for the "Cannot find type definition file for 'vite/client'" error.
// This provides TypeScript with the necessary type information for
// environment variables accessed via import.meta.env.
interface ImportMetaEnv {
  readonly VITE_GOOGLE_APPS_SCRIPT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
