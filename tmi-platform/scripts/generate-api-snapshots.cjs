const fs = require('fs').promises;
const path = require('path');

async function main() {
  const root = path.resolve(__dirname, '..');
  const packagesDir = path.join(root, 'packages');
  const outDir = path.join(root, 'api-snapshots');
  await fs.mkdir(outDir, { recursive: true });

  const entries = await fs.readdir(packagesDir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const pkgPath = path.join(packagesDir, e.name);
    const pkgJsonPath = path.join(pkgPath, 'package.json');
    try {
      const pj = JSON.parse(await fs.readFile(pkgJsonPath, 'utf8'));
      const name = pj.name || e.name;
      const distDts = path.join(pkgPath, 'dist', 'index.d.ts');
      try {
        const dts = await fs.readFile(distDts, 'utf8');
        const outFile = path.join(outDir, `${name.replace(/[^a-z0-9\-_.@]/gi, '_')}.d.ts`);
        await fs.writeFile(outFile, dts, 'utf8');
        console.log(`Saved snapshot for ${name} -> ${path.relative(root, outFile)}`);
      } catch (e) {
        // no d.ts for this package; skip
      }
    } catch (e) {
      // ignore missing package.json
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 2;
});
