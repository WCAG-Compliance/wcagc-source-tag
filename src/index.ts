import { parse } from "@babel/parser";
import MagicString from "magic-string";
import { relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";

export type SourceTagOptions = { include?: RegExp; exclude?: RegExp; attribute?: string; root?: string; includeInBuild?: boolean };
type AstNode = { type?: string; start?: number | null; end?: number | null; loc?: { start: { line: number; column: number } } | null; name?: { type?: string; name?: string; end?: number | null }; attributes?: Array<{ type?: string; name?: { name?: string } }>; [key: string]: unknown };

function visit(value: unknown, callback: (node: AstNode) => void) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) { for (const item of value) visit(item, callback); return; }
  const node = value as AstNode; callback(node);
  for (const [key, child] of Object.entries(node)) if (!["loc","tokens","comments"].includes(key)) visit(child, callback);
}
function sourcePath(filename: string, root: string) {
  const value = relative(resolve(root), resolve(filename)).split(sep).join("/");
  if (!value || value.startsWith("../") || value.startsWith("/")) return null;
  return value;
}
export function transformSourceTags(code: string, filename: string, options: SourceTagOptions = {}) {
  const attribute = options.attribute ?? "data-wcagc-src", root = options.root ?? process.cwd();
  if (!/^[a-z][a-z0-9_.:-]*$/i.test(attribute)) throw new Error("attribute must be a valid HTML attribute name");
  const path = sourcePath(filename, root); if (!path) return null;
  const ast = parse(code, { sourceType: "module", plugins: ["jsx","typescript"], sourceFilename: filename });
  const output = new MagicString(code); let changed = false;
  visit(ast, node => {
    if (node.type !== "JSXOpeningElement" || node.name?.type !== "JSXIdentifier" || !/^[a-z]/.test(node.name.name ?? "")) return;
    if (node.attributes?.some(item => item.type === "JSXAttribute" && item.name?.name === attribute)) return;
    if (node.name.end == null || !node.loc) return;
    const value = `${path}:${node.loc.start.line}:${node.loc.start.column + 1}`.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
    output.appendLeft(node.name.end, ` ${attribute}="${value}"`); changed = true;
  });
  return changed ? { code: output.toString(), map: output.generateMap({ hires: true, source: path, includeContent: false }) } : null;
}
export default function sourceTag(options: SourceTagOptions = {}): Plugin {
  return { name: "wcagc-source-tag", enforce: "pre", apply: options.includeInBuild ? undefined : "serve",
    transform(code, id) { const filename=id.split("?",1)[0]!; if(!/\.[cm]?[jt]sx$/.test(filename)||options.include&&!options.include.test(filename)||options.exclude?.test(filename))return null; return transformSourceTags(code,filename,{...options,root:options.root??process.cwd()}); } };
}
