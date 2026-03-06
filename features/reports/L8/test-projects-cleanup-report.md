# Test Projects Cleanup Report

Generated: 2026-03-05T17:27:01Z
Pattern: `\btest\b|qa|sandbox|demo|l8 mcp live test|zz test`
Projects found: 4
Projects deleted: 2
Unassign failures: 2
Stage delete failures: 3
Project delete failures: 2

## L8 MCP Live Test 20260305085135 (id 45)
- associations found: 6
- associations unassigned: 6
- stages deleted: 18/18
- project deleted: True

## Senior QA Engineer (id 38)
- associations found: 57
- associations unassigned: 57
- stages deleted: 15/15
- project deleted: True

## ZZ TEST PROJECT (id 12)
- associations found: 118
- associations unassigned: 118
- stages deleted: 16/17
- project deleted: False
- stage delete errors: 1
- project delete error: {'code': 'ERROR_FATAL', 'message': 'Project has stages created, delete them first', 'payload': ''}

## Senior QA Engineer -Mobile Testing (id 35)
- associations found: 181
- associations unassigned: 179
- stages deleted: 17/19
- project deleted: False
- unassign errors: 2
- stage delete errors: 2
- project delete error: {'code': 'ERROR_FATAL', 'message': 'Project has stages created, delete them first', 'payload': ''}
