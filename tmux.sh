#!/usr/bin/env bash

set -e

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source all the modules
source "$SCRIPT_DIR/tmux/lib.sh"
source "$SCRIPT_DIR/tmux/keybinds.sh"
source "$SCRIPT_DIR/tmux/layouts.sh"
source "$SCRIPT_DIR/tmux/modules/session-manager.sh"

# Get session name and workspace root
SESSION_NAME=$(detect_workspace_name)
WORKSPACE_ROOT="$PWD"

# If we're already inside tmux, just add windows to current session
if in_tmux; then
  add_workspace_windows "$WORKSPACE_ROOT"
  setup_keybindings "" "$WORKSPACE_ROOT"  # Empty session name since we're in current session
  exit 0
fi

# Check if session already exists
if session_exists "$SESSION_NAME"; then
  echo "Session '$SESSION_NAME' already exists. Attaching..."
  tmux attach-t "$SESSION_NAME"
  exit 0
fi

echo "Creating new tmux session: $SESSION_NAME"

# Create new session (detached)
tmux new-session -d -s "$SESSION_NAME" -c "$WORKSPACE_ROOT"

# Set up default layout
setup_default_layout "$SESSION_NAME" "$WORKSPACE_ROOT"

# Set up keybindings
setup_keybindings "$SESSION_NAME" "$WORKSPACE_ROOT"

# Load project-specific config if it exists
load_project_config "$WORKSPACE_ROOT"

# Attach to the session
tmux attach-t "$SESSION_NAME"
