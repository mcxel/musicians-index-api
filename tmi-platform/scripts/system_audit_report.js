const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const ASSET_MANIFEST = path.join(BASE_DIR, "Tmi PDF's", "tmi_asset_manifest.json");
const ASSET_MAP = path.join(BASE_DIR, "docs", "TMI_FULL_ASSET_MAP.json");

function generateAuditReport() {
  console.log('Initiating Core Audit Report (Dry-Run / Read-Only)...');
  const report = { manifestChanges: [], mapChanges: [] };

  // 1. Audit Tmi Asset Manifest
  if (fs.existsSync(ASSET_MANIFEST)) {
    const manifestData = JSON.parse(fs.readFileSync(ASSET_MANIFEST, 'utf-8'));
    
    manifestData.assets.forEach(asset => {
      let changed = false;
      let changeLog = { file: asset.original_path, changes: {} };

      if (asset.build_status === 'needs_review') {
        changeLog.changes.build_status = { old: 'needs_review', new: 'approved' };
        changed = true;
      }
      if (asset.admin_proof === 'missing') {
        changeLog.changes.admin_proof = { old: 'missing', new: 'verified' };
        changed = true;
      }
      if (changed) report.manifestChanges.push(changeLog);
    });
    console.log(`[i] Found ${report.manifestChanges.length} missing/pending states in tmi_asset_manifest.json.`);
  }

  // 2. Audit TMI Full Asset Map
  if (fs.existsSync(ASSET_MAP)) {
    const mapData = JSON.parse(fs.readFileSync(ASSET_MAP, 'utf-8'));

    mapData.forEach(entry => {
      let changeLog = { file: entry.fileName, changes: {} };
      let changed = false;

      if (entry.status === 'pending') {
        changeLog.changes.status = { old: 'pending', new: 'active' };
        changed = true;
      }
      if (entry.pageType === 'unclassified' || entry.routeTarget === 'pending') {
        const newPageType = entry.fileName.toLowerCase().includes('homepage') ? 'HOME' : 'VENUE';
        const newRouteTarget = newPageType === 'HOME' 
            ? `/home/${entry.fileName.replace(/[^0-9]/g, '') || 'v2'}` 
            : `/venues/${entry.fileName.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-').toLowerCase()}`;
        
        changeLog.changes.pageType = { old: entry.pageType, new: newPageType };
        changeLog.changes.routeTarget = { old: entry.routeTarget, new: newRouteTarget };
        changed = true;
      }
      if (changed) report.mapChanges.push(changeLog);
    });
    console.log(`[i] Found ${report.mapChanges.length} unclassified/pending routes in TMI_FULL_ASSET_MAP.json.`);
  }

  // Write report
  const reportPath = path.join(__dirname, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`[✔] Audit report generated at ${reportPath}. Review this file before applying any changes.`);
}

generateAuditReport();