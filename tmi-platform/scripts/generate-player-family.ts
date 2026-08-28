// scripts/generate-player-family.ts
//
// LEGACY / NOT THE REAL SYSTEM. The real media-player chassis system is
// MEDIA_PLAYER_CHASSIS_REGISTRY in apps/web/src/lib/artifacts/PlaylistArtifactEngine.ts,
// rendered by apps/web/src/components/artifacts/PlaylistArtifact.tsx with real
// animated chassis skin shells. This scanner produces identical placeholder
// tokens for every source image (no real geometry/palette analysis) into a
// disconnected hash-ID registry (MediaPlayerFamilyRegistry.ts) that duplicates
// the real system with inferior output. Do not extend this pipeline — build
// new chassis skins directly in PlaylistArtifact.tsx instead.
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
// Configuration constants (actual repo paths)
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const PLAYLIST_BASES_DIR = path.join(REPO_ROOT, 'Playlist Bases');
const GENERATED_ASSETS_DIR = path.join(REPO_ROOT, 'packages', 'assets', 'generated', 'playlist-foundry');
const MANIFEST_PATH = path.join(GENERATED_ASSETS_DIR, 'playlist-base-ingest-manifest.json');
const FAMILY_OUTPUT_ROOT = path.join(REPO_ROOT, 'apps', 'web', 'src', 'components', 'playlist', 'families');

interface ManifestEntry {
  sourceFile: string;
  sourceHash: string;
  familyId: string;
  familyVersion: string;
  scanState: 'NEW' | 'CHANGED' | 'UNCHANGED' | 'FAILED' | 'FORCED_REBUILD';
  derivedAssets: string[];
  variantIds: string[];
  variantCount: number;
  runtimeSkinId: string;
  qaStatus: 'PENDING' | 'PASS' | 'FAIL';
  registryStatus: 'REGISTERED' | 'PENDING';
  safeToRemove: boolean;
  processedAt: string;
  generatorVersion: string;
  errors?: string[];
}

function computeHash(filePath: string): string {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function loadManifest(): ManifestEntry[] {
  if (!fs.existsSync(MANIFEST_PATH)) return [];
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  try {
    return JSON.parse(raw) as ManifestEntry[];
  } catch {
    return [];
  }
}

function saveManifest(entries: ManifestEntry[]) {
  const dir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2), 'utf-8');
}

function generateFamilyId(hash: string): string {
  return hash.slice(0, 12);
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writePlaceholderTokens(outputDir: string) {
  const tokens = {
    palette: {
      primary: '#ff6600',
      secondary: '#0066ff',
      background: '#111111',
      accent: '#ffee00',
    },
    geometry: {
      silhouette: 'default',
      screenMask: 'default',
    },
    variants: [] as any[],
  };
  fs.writeFileSync(path.join(outputDir, 'tokens.json'), JSON.stringify(tokens, null, 2), 'utf-8');
}

function writePlaceholderComponent(familyDir: string, familyId: string) {
  const component = `import React from 'react';
import tokens from './tokens.json';

export const ${familyId}Skin: React.FC = () => (
  <div style={{
    width: '100%',
    height: '100%',
    background: tokens.palette.background,
    color: tokens.palette.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <strong>{"Media Player"}</strong>
  </div>
);
`;
  fs.writeFileSync(path.join(familyDir, 'PlaylistSkin.tsx'), component, 'utf-8');
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const generatorVersion = (() => {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf-8'));
      return pkg.version || 'unknown';
    } catch {
      return 'unknown';
    }
  })();

  const manifest = loadManifest();
  const newManifest: ManifestEntry[] = [];
  const supported = new Set(['.png', '.jpg', '.jpeg', '.webp']);
  const files = fs.readdirSync(PLAYLIST_BASES_DIR);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!supported.has(ext)) continue;
    const fullPath = path.join(PLAYLIST_BASES_DIR, file);
    const hash = computeHash(fullPath);
    const existing = manifest.find(e => e.sourceFile === fullPath);
    let scanState: ManifestEntry['scanState'] = 'UNCHANGED';
    if (!existing) scanState = 'NEW';
    else if (existing.sourceHash !== hash) scanState = force ? 'FORCED_REBUILD' : 'CHANGED';
    else if (force) scanState = 'FORCED_REBUILD';

    const familyId = generateFamilyId(hash);
    const familyDir = path.join(FAMILY_OUTPUT_ROOT, familyId);
    const derived: string[] = [];
    const variantIds: string[] = [];
    const runtimeSkinId = `${familyId}Skin`;

    if (scanState !== 'UNCHANGED') {
      ensureDir(familyDir);
      writePlaceholderTokens(familyDir);
      writePlaceholderComponent(familyDir, familyId);
      derived.push(path.join(familyDir, 'tokens.json'));
      derived.push(path.join(familyDir, 'PlaylistSkin.tsx'));
    }

    const entry: ManifestEntry = {
      sourceFile: fullPath,
      sourceHash: hash,
      familyId,
      familyVersion: '1.0.0',
      scanState,
      derivedAssets: derived,
      variantIds,
      variantCount: variantIds.length,
      runtimeSkinId,
      qaStatus: scanState === 'UNCHANGED' ? 'PASS' : 'PENDING',
      registryStatus: 'PENDING',
      safeToRemove: false,
      processedAt: new Date().toISOString(),
      generatorVersion,
    };
    newManifest.push(entry);
  }

  saveManifest(newManifest);
  console.log('✅ Scanner finished. Manifest written to', MANIFEST_PATH);
  console.log('Generated families:', newManifest.length);
}

main();
