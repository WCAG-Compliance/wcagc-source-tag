# Contributing

Bug reports and focused pull requests are welcome.

Before opening a pull request, run:

```sh
npm ci
npm run verify
npm pack --dry-run
```

Changes must preserve the package's core guarantees: no runtime injection, no absolute source
paths, no embedded source content in generated maps, and no production instrumentation unless
`includeInBuild` is explicitly enabled.
