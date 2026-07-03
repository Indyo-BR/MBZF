#!/usr/bin/env node
// Regenerate config/schedule.json from the app's src/data/schedule.ts.
//
// The sender (on the VPS) reads schedule.json, not the TS. Run this locally
// whenever the schedule changes, then rsync config/schedule.json to the VPS.
// Uses the app's TypeScript (resolved from the parent node_modules) to
// transpile — no extra dependency.

import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const HERE = dirname(fileURLToPath(import.meta.url))
const srcPath = join(HERE, '..', 'src', 'data', 'schedule.ts')
const tsSrc = readFileSync(srcPath, 'utf8')

const js = ts.transpileModule(tsSrc, {
  compilerOptions: { module: 'ESNext', target: 'ES2022' },
}).outputText

const mod = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'))
const { days, schedule } = mod

// Festival dates are all April 2027 (matches the app countdown target).
const out = {
  festival: { year: 2027, month: 4 },
  generatedAt: new Date().toISOString(),
  days,
  slots: schedule,
}

const outPath = join(HERE, 'config', 'schedule.json')
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n')

const workshops = schedule.filter((s) => s.type === 'workshop').length
console.log(`wrote ${outPath}: ${schedule.length} slots (${workshops} workshops)`)
