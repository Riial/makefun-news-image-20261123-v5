// news-image-20261123 v5 — "The World in One Day", Monday 23 November 2026.
//
// v5 is the craft fix for v4 (round 3: rank 1551/13031, score 633886, down
// from v3's 221/9643). v4 was too dense: small body text, small AI photos
// in the story grid, and a 35-pin world map. v5 keeps v4's breadth (35
// stories, 9 regions, 15 fields, DATE CHECK, status tags) and fixes craft:
// numbered TEXT cards in the grid (no photos), no map at all (the space
// goes to bigger text), and larger body type throughout. The three heroes
// keep their AI illustrations; all dense text is typeset HTML, never drawn.
//
// Node 24, standard library only. The entry image sits beside this file as
// entry.png (1024x1024 PNG, under 1 MiB). The program validates it — PNG
// signature, IHDR dimensions, byte size, SHA-256 — then copies it
// byte-for-byte to $MAKEFUN_OUTPUT_DIR (or /output). It reads nothing else,
// makes no network calls, and holds no secrets, so repeated runs are
// byte-identical.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const HERE = dirname(fileURLToPath(import.meta.url));
const IMAGE_PATH = join(HERE, 'entry.png');

// SHA-256 of the final v5 entry.png (1024x1024, 463,156 bytes).
const EXPECTED_SHA256 =
  '96cc6fb8cf0f643f36b062b9aa902dd9b3ff3f402ae850bb69f7f532fb93d626';
const EXPECTED_BYTES = 463156;
const ONE_MIB = 1_048_576;

const bytes = readFileSync(IMAGE_PATH);

if (bytes.subarray(1, 4).toString('ascii') !== 'PNG') {
  throw new Error('entry.png is not a PNG file');
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}
if (bytes.length > ONE_MIB) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}
if (bytes.length !== EXPECTED_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, expected ${EXPECTED_BYTES}`);
}
const digest = createHash('sha256').update(bytes).digest('hex');
if (digest !== EXPECTED_SHA256) {
  throw new Error(`entry.png sha256 mismatch: got ${digest}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const outPath = join(OUTPUT_DIR, 'entry.png');
writeFileSync(outPath, bytes);
// Read the copy back and confirm it is the same validated image, so a
// partial or failed write can never pass silently as a success.
const written = readFileSync(outPath);
const writtenDigest = createHash('sha256').update(written).digest('hex');
if (writtenDigest !== EXPECTED_SHA256) {
  throw new Error(`written entry.png sha256 mismatch: got ${writtenDigest}`);
}
console.log(`entry.png verified (${bytes.length} bytes, sha256 ${digest.slice(0, 12)}…)`);
