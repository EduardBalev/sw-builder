import fs from 'fs';
import path from 'path';

export function createTempFile(content: string): string {
  const tempPath = path.join(__dirname, '../temp', `test-${Date.now()}.ts`);
  fs.mkdirSync(path.dirname(tempPath), { recursive: true });
  fs.writeFileSync(tempPath, content);
  return tempPath;
}

export function cleanupTempFiles() {
  const tempDir = path.join(__dirname, '../temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
}
