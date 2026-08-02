import type { Plugin } from "vite";
export type SourceTagOptions = {
    include?: RegExp;
    exclude?: RegExp;
    attribute?: string;
    root?: string;
    includeInBuild?: boolean;
};
export declare function transformSourceTags(code: string, filename: string, options?: SourceTagOptions): {
    code: string;
    map: import("magic-string").SourceMap;
} | null;
export default function sourceTag(options?: SourceTagOptions): Plugin;
