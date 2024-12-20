#!/bin/bash

# If a directory argument is provided, use that. Otherwise, default to current directory.
TARGET_DIR=${1:-.}

# Get the absolute path of the target directory
ABS_TARGET_DIR="$(cd "$TARGET_DIR"; pwd)"
# Get the parent directory name of the target directory
PARENT_DIR=$(basename "$ABS_TARGET_DIR")

# Determine output filename based on whether a directory argument is provided
if [ "$TARGET_DIR" = "." ]; then
    OUTPUT_FILE="code_files.md"
else
    OUTPUT_FILE="code_files_${PARENT_DIR}.md"
fi

# Start the output file with a header including the parent directory
echo "# $PARENT_DIR Code Files" > "$OUTPUT_FILE"

# Find files with the specified extensions, excluding unwanted directories, files, and knowledgeGraph.json
find "$ABS_TARGET_DIR" -type f \( -name "*.ts" -o -name "*.py" -o -name "*.txt" -o -name "*.json" \) \
   ! -path "*/node_modules/*" \
   ! -path "*/venv/*" \
   ! -path "*/dist/*" \
   ! -path "*/build/*" \
   ! -path "*/.DS_Store" \
   ! -path "*/.git/*" \
   ! -path "*/logs/*" \
   ! -path "*/.mypy_cache/*" \
   ! -path "*/.nlp/*" \
   ! -path "*/coverage/*" \
   ! -name "jest.config.js" \
   ! -name "webpack.config.js" \
   ! -name "package-lock.json" \
   ! -name "bun.lockb" \
   ! -name "generate_markdown.sh" \
   ! -name "code_files*" \
   ! -name "knowledgeGraph.json" \
   | sort \
   | while read -r file; do
       # Create a relative path from the target directory
       relative_path="${file#$ABS_TARGET_DIR}"
       modified_path="/$PARENT_DIR$relative_path"

       echo -e "\n## $modified_path\n" >> "$OUTPUT_FILE"

       # Determine the language for syntax highlighting
       case "$file" in
           *.ts)
               lang="typescript"
               ;;
           *.py)
               lang="python"
               ;;
           *.json)
               lang="json"
               ;;
           *.txt)
               lang="plaintext"
               ;;
           *)
               lang=""
               ;;
       esac

       # Add the code block with appropriate language tag
       if [ -n "$lang" ]; then
           echo '```'"$lang" >> "$OUTPUT_FILE"
       else
           echo '```' >> "$OUTPUT_FILE"
       fi

       # Append the file content
       cat "$file" >> "$OUTPUT_FILE"
       echo '```' >> "$OUTPUT_FILE"
       echo "" >> "$OUTPUT_FILE"
   done

echo "Markdown file generated: $OUTPUT_FILE"
