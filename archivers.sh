#!/bin/bash
find . -maxdepth 1 -type f -name "archive_*" -exec rm {} \;

# Get the current version from manifest.json
current_version=$(jq -r .version manifest.json)

# Increment the version (assuming it's a semantic versioning format)
new_version=$(echo $current_version | awk -F. -v OFS=. '{$NF=$NF+1; print $0}')

# Update the version in manifest.json
jq --arg new_version "$new_version" '.version = $new_version' manifest.json > manifest.json.tmp && mv manifest.json.tmp manifest.json

# Create a timestamp for the archive
timestamp=$(date +"%Y%m%d%H%M%S")

# Create an archive with the current directory contents
archive_name="archive_$new_version_$timestamp.zip"
zip -r "$archive_name" *

echo "Version updated to $new_version in manifest.json"
echo "Archive created: $archive_name"
