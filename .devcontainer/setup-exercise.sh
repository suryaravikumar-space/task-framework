# .devcontainer/setup-exercise.sh
#!/bin/bash

echo "🔧 Setting up exercise environment..."

# Try to get context from URL params first (if passed)
if [ ! -z "$CODESPACE_NAME" ]; then
  # Extract GitHub username from Codespace
  GITHUB_USER=$(gh api user --jq .login 2>/dev/null || echo "unknown")
  
  echo "📡 Fetching exercise context for user: $GITHUB_USER"
  
  # Fetch context from API
  CONTEXT_JSON=$(curl -s "${APP_RESULT_ENDPOINT%/api/results}/api/codespaces/context?githubUsername=$GITHUB_USER")
  
  if [ $? -eq 0 ] && [ ! -z "$CONTEXT_JSON" ]; then
    echo "✅ Context fetched successfully"
    
    # Parse and export environment variables
    export APP_COURSE_TYPE=$(echo $CONTEXT_JSON | jq -r '.context.courseType // "salesforce-automation"')
    export APP_WEEK=$(echo $CONTEXT_JSON | jq -r '.context.weekNumber // 1')
    export APP_DAY=$(echo $CONTEXT_JSON | jq -r '.context.dayNumber // 1')
    export APP_EXERCISE_ID=$(echo $CONTEXT_JSON | jq -r '.context.exerciseId // "playground-generic"')
    export APP_EXERCISE_TITLE=$(echo $CONTEXT_JSON | jq -r '.context.exerciseTitle // "Exercise"')
    export APP_TEST_COMMAND=$(echo $CONTEXT_JSON | jq -r '.context.testCommand // "npx playwright test"')
    export APP_REQUIRED_SUITES=$(echo $CONTEXT_JSON | jq -r '.context.requiredSuites // [] | tostring')
    export GITHUB_USER=$GITHUB_USER
    
    # Save to .env file for persistence
    cat > .env.exercise << EOF
APP_COURSE_TYPE=$APP_COURSE_TYPE
APP_WEEK=$APP_WEEK
APP_DAY=$APP_DAY
APP_EXERCISE_ID=$APP_EXERCISE_ID
APP_EXERCISE_TITLE=$APP_EXERCISE_TITLE
APP_TEST_COMMAND=$APP_TEST_COMMAND
APP_REQUIRED_SUITES=$APP_REQUIRED_SUITES
GITHUB_USER=$GITHUB_USER
APP_RESULT_ENDPOINT=$APP_RESULT_ENDPOINT
APP_RESULT_TOKEN=$APP_RESULT_TOKEN
EOF
    
    echo "✅ Exercise environment configured:"
    echo "   Course: $APP_COURSE_TYPE"
    echo "   Week: $APP_WEEK, Day: $APP_DAY"
    echo "   Exercise: $APP_EXERCISE_ID"
    
    # Source it for current session
    set -a
    source .env.exercise
    set +a
  else
    echo "⚠️  Could not fetch context, using defaults"
  fi
fi

echo "✅ Setup complete!"