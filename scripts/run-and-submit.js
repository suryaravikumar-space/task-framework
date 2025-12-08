// scripts/run-and-submit.js
require('dotenv').config({ path: '.env.exercise' }); // Load exercise-specific env
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

function parseRequiredSuites(envValue) {
  if (!envValue) return [];
  try {
    const parsed = JSON.parse(envValue);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return envValue.split(",").map((s) => s.trim()).filter(Boolean);
}

async function main() {
  const reportPath = path.join(__dirname, "..", "test-report.json");

  const TEST_COMMAND = process.env.APP_TEST_COMMAND || "npx playwright test";
  const githubUser = process.env.GITHUB_USER || "unknown";
  const courseType = process.env.APP_COURSE_TYPE || "salesforce-automation";
  const weekNumber = Number(process.env.APP_WEEK || 1);
  const dayNumber = Number(process.env.APP_DAY || 1);
  const exerciseId = process.env.APP_EXERCISE_ID || "playground-generic";
  const exerciseTitle = process.env.APP_EXERCISE_TITLE || "Exercise";
  const requiredSuites = parseRequiredSuites(process.env.APP_REQUIRED_SUITES);

  console.log("📋 Exercise Context:");
  console.log(`   User: ${githubUser}`);
  console.log(`   Course: ${courseType}`);
  console.log(`   Week ${weekNumber}, Day ${dayNumber}`);
  console.log(`   Exercise: ${exerciseId} - ${exerciseTitle}`);
  console.log("");

  console.log("🧪 Running tests:", TEST_COMMAND);
  
  try {
    execSync(TEST_COMMAND, { stdio: "inherit" });
  } catch (error) {
    console.log("⚠️  Some tests failed, but continuing to submit results...");
  }

  if (!fs.existsSync(reportPath)) {
    console.error("❌ Report file not found at", reportPath);
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

  const apiUrl = process.env.APP_RESULT_ENDPOINT;
  const apiToken = process.env.APP_RESULT_TOKEN;

  if (!apiUrl || !apiToken) {
    console.error("❌ APP_RESULT_ENDPOINT or APP_RESULT_TOKEN missing");
    process.exit(1);
  }

  console.log("📤 Submitting results to", apiUrl);

  const payload = {
    githubUser,
    courseType,
    weekNumber,
    dayNumber,
    exerciseId,
    exerciseTitle,
    testCommand: TEST_COMMAND,
    requiredSuites,
    report,
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-token": apiToken,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("❌ Failed to submit results:", await res.text());
    process.exit(1);
  }

  const result = await res.json();
  console.log("✅ Results submitted successfully!");
  console.log(`   Status: ${result.status}`);
  console.log(`   ID: ${result.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// // scripts/run-and-submit.js
// const { execSync } = require("child_process");
// const fs = require("fs");
// const path = require("path");
// const fetch = require("node-fetch"); // make sure this is in package.json dependencies

// function parseRequiredSuites(envValue) {
//   if (!envValue) return [];
//   // allow JSON array or comma-separated
//   try {
//     const parsed = JSON.parse(envValue);
//     if (Array.isArray(parsed)) return parsed;
//   } catch (_) {
//     // not JSON, fall back to comma-separated
//   }
//   return envValue
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// async function main() {
//   const reportPath = path.join(__dirname, "..", "test-report.json");

//   // Allow overriding test command; default: run all tests
//   const TEST_COMMAND = process.env.APP_TEST_COMMAND || "npx playwright test";

//   console.log("Running tests with:", TEST_COMMAND);
//   // Ensure Playwright config outputs JSON to test-report.json
//   // In your playwright.config, set reporter: [['json', { outputFile: 'test-report.json' }]]
//   execSync(TEST_COMMAND, { stdio: "inherit" });

//   if (!fs.existsSync(reportPath)) {
//     console.error("Report file not found at", reportPath);
//     process.exit(1);
//   }

//   const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

//   const githubUser = process.env.GITHUB_USER || "unknown";

//   // 🔹 Dynamic context from Codespace env (set by /api/codespaces/create)
//   const courseType = process.env.APP_COURSE_TYPE || "salesforce-automation";
//   const weekNumber = Number(process.env.APP_WEEK || 1);
//   const dayNumber = Number(process.env.APP_DAY || 1);
//   const exerciseId = process.env.APP_EXERCISE_ID || "playground-generic";
//   const exerciseTitle =
//     process.env.APP_EXERCISE_TITLE || "Playground generic exercise";

//   const requiredSuites = parseRequiredSuites(process.env.APP_REQUIRED_SUITES);

//   const apiUrl = process.env.APP_RESULT_ENDPOINT;
//   const apiToken = process.env.APP_RESULT_TOKEN;

//   if (!apiUrl || !apiToken) {
//     console.error("APP_RESULT_ENDPOINT or APP_RESULT_TOKEN missing in env");
//     process.exit(1);
//   }

//   console.log("Sending results to", apiUrl);

//   const payload = {
//     githubUser,
//     courseType,
//     weekNumber,
//     dayNumber,
//     exerciseId,
//     exerciseTitle,
//     testCommand: TEST_COMMAND,
//     requiredSuites,
//     report,
//   };

//   const res = await fetch(apiUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-app-token": apiToken,
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!res.ok) {
//     console.error("Failed to submit results", await res.text());
//     process.exit(1);
//   }

//   console.log("Results submitted successfully");
// }

// main().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });



// // scripts/run-and-submit.js
// const { execSync } = require('child_process');
// const fs = require('fs');
// const path = require('path');
// const fetch = require('node-fetch'); // add to package.json dependencies

// async function main() {
//   const reportPath = path.join(__dirname, '..', 'test-report.json');

//   console.log('Running tests...');
//   // Ensure Playwright config outputs JSON to test-report.json
//   execSync('npx playwright test', { stdio: 'inherit' });

//   if (!fs.existsSync(reportPath)) {
//     console.error('Report file not found at', reportPath);
//     process.exit(1);
//   }

//   const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

//   const githubUser = process.env.GITHUB_USER || 'unknown';
//   const courseId = process.env.COURSE_ID || null;
//   const apiUrl = process.env.APP_RESULT_ENDPOINT;
//   const apiToken = process.env.APP_RESULT_TOKEN;

//   if (!apiUrl || !apiToken) {
//     console.error('APP_RESULT_ENDPOINT or APP_RESULT_TOKEN missing in env');
//     process.exit(1);
//   }

//   console.log('Sending results to', apiUrl);

//   const res = await fetch(apiUrl, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-app-token': apiToken,
//     },
//     body: JSON.stringify({ githubUser, courseId, report }),
//   });

//   if (!res.ok) {
//     console.error('Failed to submit results', await res.text());
//     process.exit(1);
//   }

//   console.log('Results submitted successfully');
// }

// main().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
