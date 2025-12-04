#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

REPO_ROOT=$(get_repo_root "$SCRIPT_DIR")
FEATURES_DIR=$(get_features_dir "$REPO_ROOT")
PLUGIN_DIR=$(get_global_plugin_dir)
TOOL_DIR=$(get_global_tool_dir)

echo "Checking feature installation..."
echo ""

# Check if global directories exist
if [ ! -d "$PLUGIN_DIR" ]; then
  echo "Plugin directory does not exist: $PLUGIN_DIR"
  echo "Run ./scripts/install-plugins.sh to create it"
  exit 1
fi

if [ ! -d "$TOOL_DIR" ]; then
  echo "Tool directory does not exist: $TOOL_DIR"
  echo "Run ./scripts/install-plugins.sh to create it"
  exit 1
fi

# Check each plugin
all_installed=true

for plugin in $(list_plugins "$FEATURES_DIR"); do
  feature_name=$(get_feature_name "$plugin")
  target="$PLUGIN_DIR/$feature_name"

  if [ ! -e "$target" ]; then
    echo "  $feature_name - not installed"
    all_installed=false
  else
    echo "  $feature_name - installed"
  fi
done

# Check each tool
for tool in $(list_tools "$FEATURES_DIR"); do
  feature_name=$(get_feature_name "$tool")
  target="$TOOL_DIR/$feature_name"

  if [ ! -e "$target" ]; then
    echo "  $feature_name - not installed"
    all_installed=false
  else
    echo "  $feature_name - installed"
  fi
done

echo ""

if [ "$all_installed" = true ]; then
  echo "All features installed correctly"
  exit 0
else
  echo "Some features not installed correctly"
  echo ""
  echo "Run ./scripts/install-plugins.sh to fix"
  exit 1
fi
