import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const root = path.resolve(process.cwd());
    const reportPath = path.join(root, 'reports', 'role_audit.json');
    if (!fs.existsSync(reportPath)) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    const data = fs.readFileSync(reportPath, 'utf8');
    const json = JSON.parse(data);
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
