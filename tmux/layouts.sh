#!/usr/bin/env bash
# Window and pane layout configuration

setup_default_layout() {
  local session_name="$1"
  local workspace_root="$2"
  
  # Window 0: Main workspace
  rename_window "$session_name" 0 "main"
  
  # Window 1: Logs/output
  create_window "$session_name" 1 "logs" "$workspace_root"
  
  # Window 2: Tests
  create_window "$session_name" 2 "tests" "$workspace_root"
  
  # Select main window by default
  select_window "$session_name" 0
}

# Custom layouts can be defined here
# Example: setup_dashboard_layout, setup_fullstack_layout, etc.
