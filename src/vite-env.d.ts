/// <reference types="vite/client" />

/** Typed env so a missing or misspelled variable is a compile error rather than
 *  an `undefined` that reaches fetch() and produces a confusing runtime failure. */
interface ImportMetaEnv {
  readonly VITE_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
