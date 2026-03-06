#!/bin/bash
# Post-task completion hook for delivery supervisor
# Triggered when a task is marked 'done' in BACKLOG.md
#
# Usage: ./post-task-complete.sh <TASK_ID>
#
# This script is called by the orchestrator after updating BACKLOG.md.
# It launches the delivery-supervisor agent to validate the delivery log.

TASK_ID="$1"

if [ -z "$TASK_ID" ]; then
  echo "Error: No task ID provided"
  echo "Usage: $0 <TASK_ID>"
  exit 1
fi

DELIVERY_LOG="features/delivery/${TASK_ID}.md"

if [ ! -f "$DELIVERY_LOG" ]; then
  echo "Error: Delivery log not found: $DELIVERY_LOG"
  exit 1
fi

echo "Delivery Supervisor: Validating ${TASK_ID}..."
echo "Delivery log: ${DELIVERY_LOG}"

# The orchestrator invokes the delivery-supervisor agent with the task ID.
# This script serves as documentation and a manual trigger point.
# In practice, the orchestrator calls the agent directly via Task/Agent tool.
echo ""
echo "To run the supervisor manually:"
echo "  Launch delivery-supervisor agent with prompt: 'Validate task ${TASK_ID}'"
