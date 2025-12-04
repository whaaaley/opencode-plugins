#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

REPO_ROOT=$(get_repo_root "$SCRIPT_DIR")
FEATURES_DIR=$(get_features_dir "$REPO_ROOT")
PLUGIN_DIR=$(get_global_plugin_dir)
TOOL_DIR=$(get_global_tool_dir)

echo "Installing features..."
echo ""

# Create the global directories if they don't exist
mkdir -p "$PLUGIN_DIR"
mkdir -p "$TOOL_DIR"

# Install plugins
for plugin in $(list_plugins "$FEATURES_DIR"); do
  feature_name=$(get_feature_name "$plugin")
  target="$PLUGIN_DIR/$feature_name"

  # Remove existing symlink/file if it exists
  if [ -e "$target" ] || [ -L "$target" ]; then
    rm "$target"
  fi

  # Create symlink
  echo "  $feature_name"
  ln -s "$plugin" "$target"
done

# Install tools
for tool in $(list_tools "$FEATURES_DIR"); do
  feature_name=$(get_feature_name "$tool")
  target="$TOOL_DIR/$feature_name"

  # Remove existing symlink/file if it exists
  if [ -e "$target" ] || [ -L "$target" ]; then
    rm "$target"
  fi

  # Create symlink
  echo "  $feature_name"
  ln -s "$tool" "$target"
done

echo ""
echo "Features installed:"
echo "  Plugins -> $PLUGIN_DIR"
echo "  Tools -> $TOOL_DIR"
echo "Run ./scripts/check-install.sh to verify"
