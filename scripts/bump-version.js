#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read command line arguments
const args = process.argv.slice(2);
const versionType = args[0];

if (!['major', 'minor', 'patch'].includes(versionType)) {
  console.error('Please specify version type: major, minor, or patch');
  process.exit(1);
}

// Paths to package files
const packagePath = path.join(process.cwd(), 'package.json');
const packageLockPath = path.join(process.cwd(), 'package-lock.json');

// Read package.json
const package = require(packagePath);
const currentVersion = package.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
package.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(package, null, 2) + '\n');

// Update package-lock.json if it exists
if (fs.existsSync(packageLockPath)) {
  const packageLock = require(packageLockPath);
  packageLock.version = newVersion;
  packageLock.packages[''].version = newVersion;
  fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n');
}

console.log(`Version bumped from ${currentVersion} to ${newVersion}`);

// Create git commit and tag
try {
  execSync('node scripts/commit-version.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to create git commit:', error.message);
  process.exit(1);
}
