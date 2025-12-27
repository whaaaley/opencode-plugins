#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

REPO_ROOT=$(get_repo_root "$SCRIPT_DIR")
FEATURES_DIR=$(get_features_dir "$REPO_ROOT")
CONFIG_FILE="$REPO_ROOT/config.json"
PLUGIN_DIR=$(get_global_plugin_dir)
TOOL_DIR=$(get_global_tool_dir)

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: config.json not found at $CONFIG_FILE"
  exit 1
fi

echo "Installing features from config.json..."
echo ""

# Create the global directories if they don't exist
mkdir -p "$PLUGIN_DIR"
mkdir -p "$TOOL_DIR"

# Clean up existing installations
echo "Cleaning up existing installations..."
rm -rf "$PLUGIN_DIR"/*
rm -rf "$TOOL_DIR"/*
echo ""

# Read enabled features from config.json
enabled_features=$(jq -r '.features[]' "$CONFIG_FILE")

# Install features by copying entire directories
for feature_name in $enabled_features; do
  feature_dir="$FEATURES_DIR/$feature_name"

  if [ ! -d "$feature_dir" ]; then
    echo "Warning: Feature '$feature_name' not found in features/, skipping"
    continue
  fi

  # Check for plugin file and copy entire directory to plugin dir
  if [ -f "$feature_dir/plugin.ts" ] || [ -f "$feature_dir/plugin.js" ]; then
    target="$PLUGIN_DIR/$feature_name"
    rm -rf "$target"
    cp -r "$feature_dir" "$target"
    echo "  $feature_name/ (plugin)"
  fi

  # Check for tool file and copy entire directory to tool dir
  if [ -f "$feature_dir/tool.ts" ] || [ -f "$feature_dir/tool.js" ]; then
    target="$TOOL_DIR/$feature_name"
    rm -rf "$target"
    cp -r "$feature_dir" "$target"
    echo "  $feature_name/ (tool)"
  fi
done

echo ""
echo "Features installed:"
echo "  Plugins -> $PLUGIN_DIR"
echo "  Tools -> $TOOL_DIR"
echo ""
echo "Run ./scripts/check-install.sh to verify"
