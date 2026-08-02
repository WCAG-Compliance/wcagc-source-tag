# @wcagc/source-tag

A zero-runtime Vite plugin that adds deterministic `data-wcagc-src="relative/file.tsx:line:column"` attributes to lowercase JSX host elements. The wcagc browser extension can display those build facts without guessing a source file.

Source, tests, and CI are published at [WCAG-Compliance/wcagc-source-tag](https://github.com/WCAG-Compliance/wcagc-source-tag) under the MIT license.

```ts
import { defineConfig } from "vite";
import sourceTag from "@wcagc/source-tag";

export default defineConfig({ plugins: [sourceTag()] });
```

The plugin applies only to Vite's development server by default. For a controlled staging build, use `sourceTag({ includeInBuild: true })`. This exposes relative repository paths in rendered markup; assess that disclosure before enabling it. `root`, `include`, `exclude`, and `attribute` can be customized. Generated maps use only the validated relative source path and do not embed source content. No absolute path is emitted and no runtime code is added.
