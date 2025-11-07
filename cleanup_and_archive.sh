#!/bin/bash

# Archive directory
ARCHIVE_DIR="archives/old-reports-2025-01-07"
mkdir -p "$ARCHIVE_DIR"/{reports,analysis,sprints,tests,etapes,rapports}

# Move old reports (keep only essential ones in root)
echo "📦 Archiving old documentation..."

# Archive Sprint reports
mv "Sprint 1 Progress Report - BilanCompetence.AI" "$ARCHIVE_DIR/sprints/" 2>/dev/null
mv "Sprint 1 Progress Report - BilanCompetence.AI - 1.AI" "$ARCHIVE_DIR/sprints/" 2>/dev/null

# Archive Test reports
mv "Analyse Détaillée des Tests E2E - BilanCompetence.AI" "$ARCHIVE_DIR/tests/" 2>/dev/null
mv "Analyse Détaillée des Tests E2E - BilanCompetence.AI-1.md" "$ARCHIVE_DIR/tests/" 2>/dev/null
mv E2E_TESTS_*.md "$ARCHIVE_DIR/tests/" 2>/dev/null
mv TEST_*.md "$ARCHIVE_DIR/tests/" 2>/dev/null
mv *test*.md "$ARCHIVE_DIR/tests/" 2>/dev/null

# Archive Etapes
mv Etap*.md "$ARCHIVE_DIR/etapes/" 2>/dev/null

# Archive Rapports
mv Rapport*.md "$ARCHIVE_DIR/rapports/" 2>/dev/null
mv *Rapport*.md "$ARCHIVE_DIR/rapports/" 2>/dev/null

# Archive Analysis documents
mv ANALYSE*.md "$ARCHIVE_DIR/analysis/" 2>/dev/null
mv *Analysis*.md "$ARCHIVE_DIR/analysis/" 2>/dev/null
mv *Audit*.md "$ARCHIVE_DIR/analysis/" 2>/dev/null
mv AUDIT_*.md "$ARCHIVE_DIR/analysis/" 2>/dev/null

# Archive other reports
mv COMPREHENSIVE_*.md "$ARCHIVE_DIR/reports/" 2>/dev/null
mv FINAL_REPORT*.md "$ARCHIVE_DIR/reports/" 2>/dev/null
mv "Final Production"*.md "$ARCHIVE_DIR/reports/" 2>/dev/null
mv MIGRATION_*.md "$ARCHIVE_DIR/reports/" 2>/dev/null
mv SESSION_*.md "$ARCHIVE_DIR/reports/" 2>/dev/null
mv WORK_SESSION*.md "$ARCHIVE_DIR/reports/" 2>/dev/null
mv DEPLOYMENT_*.md "$ARCHIVE_DIR/reports/" 2>/dev/null
mv SECURITY_*.md "$ARCHIVE_DIR/reports/" 2>/dev/null

# Archive Architecture docs (keep one in root)
mv "Architecture Hybride - BilanCompetence.AI (1).md" "$ARCHIVE_DIR/analysis/" 2>/dev/null

# Archive Executive summaries (keep one in root)
mv "EXECUTIVE_SUMMARY (1).md" "$ARCHIVE_DIR/reports/" 2>/dev/null

# Archive duplicate/old files
mv *"(1).md" "$ARCHIVE_DIR/reports/" 2>/dev/null
mv *"(2).md" "$ARCHIVE_DIR/reports/" 2>/dev/null
mv *.sql "$ARCHIVE_DIR/" 2>/dev/null
mv *.zip "$ARCHIVE_DIR/" 2>/dev/null

# Keep these in root:
# - README.md
# - AI_TEAM_CONFIG.md
# - TEAM_STRUCTURE_AND_WORKFLOW.md
# - TEAM_ROLES_DEFINITION.md
# - BilanCompetence.AI Design System.md
# - BilanCompetence.AI - Production Readiness Checklist.md
# - BilanCompetence.AI - Launch Checklist.md
# - Architecture Hybride - BilanCompetence.AI.md
# - HYBRID_ARCHITECTURE.md

echo "✅ Archive complete!"
echo ""
echo "📊 Summary:"
find "$ARCHIVE_DIR" -type f | wc -l | xargs echo "Archived files:"
echo ""
echo "📁 Current root docs:"
ls -1 *.md 2>/dev/null | wc -l | xargs echo "Markdown files remaining:"
