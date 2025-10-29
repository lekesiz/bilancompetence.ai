#!/bin/bash
# Script to add 'export const dynamic = force-dynamic' to all client component pages

find app -name "page.tsx" -type f | while read file; do
  if grep -q "'use client'" "$file" && ! grep -q "export const dynamic" "$file"; then
    # Find the line number of 'use client' directive
    line_num=$(grep -n "'use client'" "$file" | head -1 | cut -d: -f1)
    # Add export after the 'use client' line
    sed -i.bak "${line_num}a\\
\\
export const dynamic = 'force-dynamic';\\
" "$file"
    echo "Added dynamic export to $file"
  fi
done

