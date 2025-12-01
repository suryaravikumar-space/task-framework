// scripts/run-and-submit.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // add to package.json dependencies

async function main() {
  const reportPath = path.join(__dirname, '..', 'test-report.json');

  console.log('Running tests...');
  // Ensure Playwright config outputs JSON to test-report.json
  execSync('npx playwright test', { stdio: 'inherit' });

  if (!fs.existsSync(reportPath)) {
    console.error('Report file not found at', reportPath);
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  const githubUser = process.env.GITHUB_USER || 'unknown';
  const courseId = process.env.COURSE_ID || null;
  const apiUrl = process.env.APP_RESULT_ENDPOINT;
  const apiToken = process.env.APP_RESULT_TOKEN;

  if (!apiUrl || !apiToken) {
    console.error('APP_RESULT_ENDPOINT or APP_RESULT_TOKEN missing in env');
    process.exit(1);
  }

  console.log('Sending results to', apiUrl);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-token': apiToken,
    },
    body: JSON.stringify({ githubUser, courseId, report }),
  });

  if (!res.ok) {
    console.error('Failed to submit results', await res.text());
    process.exit(1);
  }

  console.log('Results submitted successfully');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
