# .devcontainer/load-context.sh
#!/bin/bash

echo "🔧 Loading exercise context..."
echo "Working directory: $(pwd)"
echo ""

# Get GitHub username
GITHUB_USER=${GITHUB_USER:-$(gh api user --jq .login 2>/dev/null || echo "unknown")}
echo "👤 GitHub User: ${GITHUB_USER}"

# Try to fetch context from your app's API
if [ ! -z "$APP_RESULT_ENDPOINT" ]; then
  BASE_URL="${APP_RESULT_ENDPOINT%/api/results}"
  CONTEXT_URL="${BASE_URL}/api/codespaces/context?githubUsername=${GITHUB_USER}"
  
  echo "📡 Fetching context from: ${CONTEXT_URL}"
  echo ""
  
  # Fetch context with timeout
  CONTEXT_JSON=$(curl -v -s --max-time 10 "$CONTEXT_URL" 2>&1)
  CURL_EXIT=$?
  
  echo "Curl exit code: $CURL_EXIT"
  echo "Response: $CONTEXT_JSON"
  echo ""
  
  if [ $CURL_EXIT -eq 0 ]; then
    # Try to parse and extract context
    PARSED_CONTEXT=$(echo "$CONTEXT_JSON" | grep -o '{"context".*}' | head -1)
    
    if [ ! -z "$PARSED_CONTEXT" ]; then
      echo "✅ Context fetched successfully from API"
      
      # Check if jq is available
      if command -v jq &> /dev/null; then
        # Extract values using jq
        export APP_COURSE_TYPE=$(echo "$PARSED_CONTEXT" | jq -r '.context.courseType // "salesforce-automation"')
        export APP_WEEK=$(echo "$PARSED_CONTEXT" | jq -r '.context.weekNumber // 1')
        export APP_DAY=$(echo "$PARSED_CONTEXT" | jq -r '.context.dayNumber // 1')
        export APP_EXERCISE_ID=$(echo "$PARSED_CONTEXT" | jq -r '.context.exerciseId // "playground-generic"')
        export APP_EXERCISE_TITLE=$(echo "$PARSED_CONTEXT" | jq -r '.context.exerciseTitle // "Exercise"')
        export APP_TEST_COMMAND=$(echo "$PARSED_CONTEXT" | jq -r '.context.testCommand // "npx playwright test"')
        export APP_REQUIRED_SUITES=$(echo "$PARSED_CONTEXT" | jq -r '.context.requiredSuites // [] | tostring')
      else
        echo "⚠️  jq not available, installing..."
        sudo apt-get update && sudo apt-get install -y jq
        
        export APP_COURSE_TYPE=$(echo "$PARSED_CONTEXT" | jq -r '.context.courseType // "salesforce-automation"')
        export APP_WEEK=$(echo "$PARSED_CONTEXT" | jq -r '.context.weekNumber // 1')
        export APP_DAY=$(echo "$PARSED_CONTEXT" | jq -r '.context.dayNumber // 1')
        export APP_EXERCISE_ID=$(echo "$PARSED_CONTEXT" | jq -r '.context.exerciseId // "playground-generic"')
        export APP_EXERCISE_TITLE=$(echo "$PARSED_CONTEXT" | jq -r '.context.exerciseTitle // "Exercise"')
        export APP_TEST_COMMAND=$(echo "$PARSED_CONTEXT" | jq -r '.context.testCommand // "npx playwright test"')
        export APP_REQUIRED_SUITES=$(echo "$PARSED_CONTEXT" | jq -r '.context.requiredSuites // [] | tostring')
      fi
    else
      echo "⚠️  Could not parse context from API response"
    fi
  else
    echo "⚠️  Could not fetch context from API (curl failed)"
  fi
fi

# Use environment variables as fallback (from containerEnv)
APP_COURSE_TYPE=${APP_COURSE_TYPE:-"salesforce-automation"}
APP_WEEK=${APP_WEEK:-1}
APP_DAY=${APP_DAY:-1}
APP_EXERCISE_ID=${APP_EXERCISE_ID:-"playground-generic"}
APP_EXERCISE_TITLE=${APP_EXERCISE_TITLE:-"Generic Exercise"}
APP_TEST_COMMAND=${APP_TEST_COMMAND:-"npx playwright test"}
APP_REQUIRED_SUITES=${APP_REQUIRED_SUITES:-"[]"}

echo ""
echo "📋 Final Exercise Configuration:"
echo "   Course: ${APP_COURSE_TYPE}"
echo "   Week: ${APP_WEEK}, Day: ${APP_DAY}"
echo "   Exercise: ${APP_EXERCISE_ID}"
echo "   Title: ${APP_EXERCISE_TITLE}"
echo "   GitHub User: ${GITHUB_USER}"
echo ""

# Save to .env file
cat > .env.exercise << EOF
# Exercise Context (Auto-loaded on $(date))
APP_COURSE_TYPE=${APP_COURSE_TYPE}
APP_WEEK=${APP_WEEK}
APP_DAY=${APP_DAY}
APP_EXERCISE_ID=${APP_EXERCISE_ID}
APP_EXERCISE_TITLE=${APP_EXERCISE_TITLE}
APP_TEST_COMMAND=${APP_TEST_COMMAND}
APP_REQUIRED_SUITES=${APP_REQUIRED_SUITES}
GITHUB_USER=${GITHUB_USER}
APP_RESULT_ENDPOINT=${APP_RESULT_ENDPOINT}
APP_RESULT_TOKEN=${APP_RESULT_TOKEN}
EOF

echo "✅ Context saved to .env.exercise"
echo ""
cat .env.exercise
echo ""
echo "💡 Quick commands:"
echo "   npm run test:submit - Run tests and submit results"
echo "   cat .env.exercise   - View current exercise context"
echo "   bash .devcontainer/load-context.sh - Reload exercise context"
echo ""