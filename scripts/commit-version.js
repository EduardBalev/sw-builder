#!/usr/bin/env node

const { execSync } = require('child_process');
const { version } = require('../package.json');

try {
  // Stage the changed files
  execSync('git add package.json package-lock.json');

  // Create commit with version number
  execSync(`git commit -m "chore: bump version to ${version}"`, { stdio: 'inherit' });

  // Create version tag
  execSync(`git tag v${version}`, { stdio: 'inherit' });

  console.log(`Successfully committed version ${version} and created tag v${version}`);
} catch (error) {
  console.error('Failed to commit version bump:', error.message);
  process.exit(1);
}
