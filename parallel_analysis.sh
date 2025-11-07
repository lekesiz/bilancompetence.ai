#!/bin/bash

# BilanCompetence.AI - Parallel Code Analysis
# Using M4 Max + Ollama Local AI Team

echo "🚀 Starting Parallel Code Analysis with AI Team..."
echo ""

# Create analysis output directory
mkdir -p analysis_results

# Task 1: Architecture Analysis (DeepSeek-V3.1)
echo "🏗️  [1/6] DeepSeek-V3.1 analyzing architecture..."
cat > analysis_results/architecture_prompt.txt << 'EOF'
Analyze the BilanCompetence.AI project architecture:

Project Structure:
- Monorepo with apps/backend and apps/frontend
- Backend: Express.js + TypeScript
- Frontend: React + TypeScript
- Database: Neon PostgreSQL + Supabase
- Deployment: Vercel (frontend) + Railway (backend)

Review:
1. Overall architecture patterns and design decisions
2. Separation of concerns
3. Scalability considerations
4. Potential architectural improvements
5. Database schema design
6. API design patterns

Provide specific recommendations for improvement.
EOF

ollama run deepseek-v3.1:671b-cloud "$(cat analysis_results/architecture_prompt.txt)" > analysis_results/01_architecture_analysis.txt 2>&1 &
PID1=$!

# Task 2: Frontend Code Analysis (Qwen3-Coder)
echo "⚛️  [2/6] Qwen3-Coder analyzing frontend code..."
cat > analysis_results/frontend_prompt.txt << 'EOF'
Analyze the BilanCompetence.AI frontend code:

Check apps/frontend/src/:
1. Component structure and organization
2. State management patterns
3. TypeScript usage and type safety
4. React best practices
5. Performance optimizations
6. Code duplication
7. Error handling
8. Accessibility issues

List specific files with issues and provide fix recommendations.
EOF

ollama run qwen3-coder:30b "$(cat analysis_results/frontend_prompt.txt)

Examine the project at /Users/mikail/Desktop/bilancompetence.ai/apps/frontend/src/ and provide detailed analysis." > analysis_results/02_frontend_analysis.txt 2>&1 &
PID2=$!

# Task 3: Backend Logic Analysis (DeepSeek-R1)
echo "🔧 [3/6] DeepSeek-R1 analyzing backend logic..."
cat > analysis_results/backend_prompt.txt << 'EOF'
Analyze the BilanCompetence.AI backend code:

Focus on apps/backend/src/:
1. API route handlers correctness
2. Service layer logic
3. Error handling patterns
4. Security vulnerabilities
5. Authentication/authorization flows
6. Data validation
7. Database query optimization
8. Middleware implementation

Identify bugs, security issues, and logic errors.
EOF

ollama run deepseek-r1:8b "$(cat analysis_results/backend_prompt.txt)" > analysis_results/03_backend_logic_analysis.txt 2>&1 &
PID3=$!

# Task 4: Documentation & UX Analysis (Qwen3-VL)
echo "📚 [4/6] Qwen3-VL analyzing documentation and UX..."
cat > analysis_results/docs_prompt.txt << 'EOF'
Analyze BilanCompetence.AI documentation and user experience:

Review:
1. API documentation completeness
2. Code comments quality
3. README clarity
4. Setup instructions
5. User guides
6. Component documentation
7. Type definitions documentation
8. Frontend user experience

Rate documentation quality and suggest improvements.
EOF

ollama run qwen3-vl:30b "$(cat analysis_results/docs_prompt.txt)" > analysis_results/04_docs_ux_analysis.txt 2>&1 &
PID4=$!

# Task 5: Test Coverage Analysis (GPT-OSS)
echo "🧪 [5/6] GPT-OSS analyzing test coverage..."
cat > analysis_results/tests_prompt.txt << 'EOF'
Analyze BilanCompetence.AI test suite:

Review apps/backend/src/__tests__/:
1. Test coverage percentage
2. Unit test quality
3. Integration test coverage
4. E2E test completeness
5. Missing test cases
6. Test organization
7. Mocking strategies
8. Test reliability

Identify critical areas needing tests.
EOF

ollama run gpt-oss:20b "$(cat analysis_results/tests_prompt.txt)" > analysis_results/05_test_coverage_analysis.txt 2>&1 &
PID5=$!

# Task 6: Database & API Analysis (Qwen2.5-Coder)
echo "🗄️  [6/6] Qwen2.5-Coder analyzing database and APIs..."
cat > analysis_results/db_api_prompt.txt << 'EOF'
Analyze BilanCompetence.AI database and API layer:

Review:
1. Database schema efficiency
2. SQL query optimization opportunities
3. N+1 query problems
4. API endpoint design
5. RESTful best practices
6. Response format consistency
7. Pagination implementation
8. Database migrations
9. Connection pooling
10. Transaction handling

Focus on performance and reliability.
EOF

ollama run qwen2.5-coder:32b "$(cat analysis_results/db_api_prompt.txt)" > analysis_results/06_database_api_analysis.txt 2>&1 &
PID6=$!

# Wait for all analyses to complete
echo ""
echo "⏳ Waiting for all analyses to complete..."
echo "   (This may take several minutes with large models)"
echo ""

wait $PID1
echo "✅ Architecture analysis complete"

wait $PID2
echo "✅ Frontend analysis complete"

wait $PID3
echo "✅ Backend logic analysis complete"

wait $PID4
echo "✅ Documentation analysis complete"

wait $PID5
echo "✅ Test coverage analysis complete"

wait $PID6
echo "✅ Database/API analysis complete"

echo ""
echo "🎉 All analyses completed!"
echo ""
echo "📊 Results saved in: analysis_results/"
echo ""
echo "📁 Generated files:"
ls -lh analysis_results/*.txt
echo ""
echo "🔍 Next step: Review analysis_results/ and create action plan"
