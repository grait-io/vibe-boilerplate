# Multi-Agent Cooperation Protocol for Kiedis Outreacher

## Overview

This document defines the cooperation protocol for multiple Claude Code agents working simultaneously on the Kiedis Outreacher project. The system uses file-based coordination to prevent conflicts and ensure efficient parallel development.

## Directory Structure

```
.agents/
├── tasks/          # Available tasks waiting to be assigned
├── locks/          # Active task locks (agent is working)
├── status/         # Agent status and progress updates
├── completed/      # Completed task notifications
└── README.md       # Quick reference guide
```

---

## Agent Identification

Each agent must generate a unique identifier when starting work:

```bash
AGENT_ID="agent_$(date +%s)_$(hostname)_$$"
echo $AGENT_ID > .agents/status/${AGENT_ID}.active
```

**Format**: `agent_<timestamp>_<hostname>_<process_id>`

--- 

## Task Management System

### Task Priority Levels

1. **🔴 CRITICAL** - Blocking issues, security fixes, broken builds
2. **🟠 HIGH** - New features, major improvements
3. **🟡 MEDIUM** - Enhancements, optimizations
4. **🟢 LOW** - Documentation, minor fixes, cleanup

### Task File Format

Tasks are stored in `.agents/tasks/` with the following naming convention:
```
<priority>_<component>_<task_id>.task
```

Example: `high_frontend_add_notifications.task`

**Task File Content**:
```json
{
  "id": "add_notifications",
  "title": "Add real-time notifications system",
  "priority": "high",
  "component": "frontend",
  "description": "Implement toast notifications for user feedback",
  "files_involved": [
    "frontend/src/components/ui/",
    "frontend/src/hooks/"
  ],
  "estimated_time": "30 minutes",
  "dependencies": [],
  "created_by": "agent_1234567890_dev_1001",
  "created_at": "2025-01-09T10:00:00Z"
}
```

---

## Task Assignment Protocol

### 1. Check for Available Tasks

```bash
# Agent startup procedure
AGENT_ID="agent_$(date +%s)_$(hostname)_$$"
echo "{\"status\": \"looking_for_work\", \"timestamp\": \"$(date -Iseconds)\"}" > .agents/status/${AGENT_ID}.active

# Find highest priority available task
TASK=$(ls .agents/tasks/ | sort | head -1)
```

### 2. Claim a Task

```bash
if [ -n "$TASK" ]; then
  # Atomic move to claim task
  mv ".agents/tasks/$TASK" ".agents/locks/${AGENT_ID}_$TASK"
  
  # Update status
  echo "{\"status\": \"working\", \"task\": \"$TASK\", \"started_at\": \"$(date -Iseconds)\"}" > .agents/status/${AGENT_ID}.active
fi
```

### 3. Task Execution Rules

**BEFORE starting work on any file**:

1. Check if file is locked by another agent:
   ```bash
   FILE_PATH="frontend/src/components/Layout.jsx"
   if ls .agents/locks/*_*_$(basename "$FILE_PATH").lock 2>/dev/null; then
     echo "File is locked by another agent - skip or wait"
     exit 1
   fi
   ```

2. Create file lock:
   ```bash
   echo "{\"agent_id\": \"$AGENT_ID\", \"file\": \"$FILE_PATH\", \"locked_at\": \"$(date -Iseconds)\"}" > ".agents/locks/${AGENT_ID}_$(basename "$FILE_PATH").lock"
   ```

3. Work on the file

4. Release lock when done:
   ```bash
   rm ".agents/locks/${AGENT_ID}_$(basename "$FILE_PATH").lock"
   ```

---

## File Locking Rules

### Lock Types

1. **Task Lock**: `{AGENT_ID}_{TASK_NAME}.task`
   - Prevents multiple agents from working on the same task
   - Duration: Until task completion or timeout (2 hours)

2. **File Lock**: `{AGENT_ID}_{FILE_NAME}.lock`
   - Prevents conflicts on specific files
   - Duration: Until file editing is complete (max 30 minutes)

3. **Component Lock**: `{AGENT_ID}_{COMPONENT}.component`
   - Locks entire component/directory
   - Use for major refactoring or when many files are involved

### Lock Conflict Resolution

**If you encounter a lock**:

1. Check lock age:
   ```bash
   LOCK_TIME=$(jq -r '.locked_at' .agents/locks/somelock.lock)
   CURRENT_TIME=$(date -Iseconds)
   # If older than timeout, consider stale
   ```

2. **Stale locks** (>2 hours for tasks, >30 min for files):
   - Move to `.agents/locks/stale/`
   - Log the cleanup action
   - Proceed with task

3. **Active locks**:
   - Wait if task is quick
   - Pick a different task
   - Create a dependent task

---

## Communication Protocols

### Status Updates

Agents must update their status every 10 minutes:

```bash
echo "{
  \"agent_id\": \"$AGENT_ID\",
  \"status\": \"working\",
  \"current_task\": \"$TASK\",
  \"progress\": \"50%\",
  \"last_update\": \"$(date -Iseconds)\",
  \"files_modified\": [\"file1.js\", \"file2.jsx\"]
}" > ".agents/status/${AGENT_ID}.active"
```

### Task Completion

When finishing a task:

1. **Create completion notification**:
   ```bash
   echo "{
     \"task_id\": \"$TASK\",
     \"completed_by\": \"$AGENT_ID\",
     \"completed_at\": \"$(date -Iseconds)\",
     \"files_changed\": [\"list of files\"],
     \"next_actions\": [\"suggested follow-up tasks\"],
     \"notes\": \"Any important information for other agents\"
   }" > ".agents/completed/${TASK}.done"
   ```

2. **Clean up locks**:
   ```bash
   rm .agents/locks/${AGENT_ID}_*.lock
   rm .agents/locks/${AGENT_ID}_*.component
   ```

3. **Update status**:
   ```bash
   echo "{\"status\": \"available\", \"completed_task\": \"$TASK\"}" > .agents/status/${AGENT_ID}.active
   ```

### Error Reporting

If an agent encounters an error:

```bash
echo "{
  \"agent_id\": \"$AGENT_ID\",
  \"error_type\": \"build_failure|test_failure|conflict|other\",
  \"task_id\": \"$TASK\",
  \"error_message\": \"Description of the error\",
  \"files_affected\": [\"list of files\"],
  \"timestamp\": \"$(date -Iseconds)\"
}" > ".agents/status/${AGENT_ID}.error"
```

---

## Task Categories and Ownership

### Frontend Tasks
- **Files**: `frontend/src/**`
- **Lock pattern**: `frontend_*`
- **Common tasks**: UI components, styling, React features

### Backend Tasks
- **Files**: `backend/**`
- **Lock pattern**: `backend_*`
- **Common tasks**: API endpoints, models, business logic

### Documentation Tasks
- **Files**: `*.md`, `docs/**`
- **Lock pattern**: `docs_*`
- **Common tasks**: README updates, API docs, guides

### DevOps Tasks
- **Files**: `docker-compose.yml`, `Makefile`, `.github/**`
- **Lock pattern**: `devops_*`
- **Common tasks**: Build improvements, CI/CD, deployment

### Full-Stack Tasks
- **Files**: Multiple components
- **Lock pattern**: `fullstack_*`
- **Requires**: Component locks for all affected areas

---

## Agent Coordination Scenarios

### Scenario 1: Normal Operation

```bash
# Agent A starts
Agent_A: Claims "high_frontend_add_search.task"
Agent_A: Locks "frontend/src/components/SearchBar.jsx"
Agent_A: Works on search functionality

# Agent B starts
Agent_B: Claims "medium_backend_optimize_db.task"
Agent_B: Locks "backend/models.py"
Agent_B: Works on database optimization

# Both work in parallel without conflict
```

### Scenario 2: File Conflict

```bash
# Agent A working on Layout.jsx
Agent_A: Has lock on "Layout.jsx"

# Agent B tries to modify Layout.jsx
Agent_B: Checks locks - finds Layout.jsx locked
Agent_B: Either waits or picks different task
Agent_B: Claims "high_frontend_add_notifications.task" instead
```

### Scenario 3: Task Dependencies

```bash
# Agent A completes authentication system
Agent_A: Finishes task, creates completion notification
Agent_A: Suggests next task: "Add user profile management"

# Agent B sees completion
Agent_B: Reads completion notification
Agent_B: Claims the suggested follow-up task
```

### Scenario 4: Emergency Override

```bash
# Critical bug found in production
Agent_C: Creates "critical_fix_auth_vulnerability.task"
Agent_C: Places in .agents/tasks/ with "critical" priority

# Other agents check for critical tasks every 5 minutes
Agent_A: Sees critical task, abandons current work
Agent_A: Claims critical task immediately
```

---

## Cleanup and Maintenance

### Automatic Cleanup

Each agent should run cleanup every 30 minutes:

```bash
# Remove stale locks
find .agents/locks/ -name "*.lock" -mmin +30 -exec mv {} .agents/locks/stale/ \;
find .agents/locks/ -name "*.task" -mmin +120 -exec mv {} .agents/locks/stale/ \;

# Archive old status files
find .agents/status/ -name "*.active" -mmin +240 -exec mv {} .agents/status/archived/ \;

# Clean completed notifications older than 24 hours
find .agents/completed/ -name "*.done" -mmin +1440 -delete
```

### Manual Cleanup Commands

```bash
# Reset all locks (emergency use only)
make coop-reset-locks

# View active agents
make coop-status

# Clean stale files
make coop-cleanup
```

---

## Agent Shutdown Protocol

When an agent finishes or shuts down:

1. **Release all locks**:
   ```bash
   rm .agents/locks/${AGENT_ID}_*
   ```

2. **Update status**:
   ```bash
   echo "{\"status\": \"shutdown\", \"timestamp\": \"$(date -Iseconds)\"}" > .agents/status/${AGENT_ID}.shutdown
   rm .agents/status/${AGENT_ID}.active
   ```

3. **Return unfinished tasks**:
   ```bash
   mv .agents/locks/${AGENT_ID}_*.task .agents/tasks/
   ```

---

## Integration with Development Tools

### Makefile Integration

Add to main Makefile:

```makefile
# Agent cooperation commands
coop-status:
	@echo "=== Active Agents ==="
	@ls .agents/status/*.active 2>/dev/null | xargs -I {} basename {} .active || echo "No active agents"
	@echo "=== Active Locks ==="
	@ls .agents/locks/*.lock 2>/dev/null || echo "No active locks"

coop-cleanup:
	@echo "Cleaning up stale locks and files..."
	@find .agents/locks/ -name "*.lock" -mmin +30 -exec mv {} .agents/locks/stale/ \; 2>/dev/null || true
	@find .agents/locks/ -name "*.task" -mmin +120 -exec mv {} .agents/tasks/ \; 2>/dev/null || true

coop-reset-locks:
	@echo "⚠️  Resetting all locks - use only if agents are stuck"
	@mv .agents/locks/*.lock .agents/locks/stale/ 2>/dev/null || true
	@mv .agents/locks/*.task .agents/tasks/ 2>/dev/null || true
```

### Git Integration

Add to .gitignore:
```
.agents/status/
.agents/locks/
.agents/completed/
```

Keep in git:
```
.agents/tasks/
.agents/README.md
```

---

## Best Practices

### For Task Creators

1. **Be specific**: Clear task descriptions with file lists
2. **Set realistic time estimates**
3. **Define dependencies** clearly
4. **Use appropriate priority levels**

### For Task Workers

1. **Always check locks** before editing files
2. **Update status regularly** (every 10 minutes)
3. **Release locks promptly** when done
4. **Communicate completion** with useful notes

### For Team Coordination

1. **Monitor .agents/status/** for team overview
2. **Review completed tasks** for insights
3. **Prioritize critical tasks** immediately
4. **Clean up stale locks** regularly

---

## Troubleshooting

### Common Issues

1. **"File is locked but no one is working"**
   - Check lock age: `ls -la .agents/locks/`
   - If stale (>30 min), move to stale folder
   - If recent, wait or contact the agent owner

2. **"Agent status shows as working but no locks"**
   - Agent may have crashed
   - Check for error files in `.agents/status/`
   - Clean up stale status files

3. **"Task disappeared from tasks folder"**
   - Check `.agents/locks/` - someone claimed it
   - Check `.agents/completed/` - it may be done
   - Check `.agents/locks/stale/` - it may have timed out

### Emergency Procedures

**If the coordination system breaks**:

1. Stop all agents
2. Run `make coop-reset-locks`
3. Move any partial work to feature branches
4. Restart agents one by one

---

## Example Usage Workflow

### Agent Startup and Task Execution

```bash
#!/bin/bash
# Agent startup script

# 1. Generate agent ID
AGENT_ID="agent_$(date +%s)_$(hostname)_$$"
echo "Starting agent: $AGENT_ID"

# 2. Register as active
echo "{\"status\": \"starting\", \"timestamp\": \"$(date -Iseconds)\"}" > .agents/status/${AGENT_ID}.active

# 3. Look for highest priority task
while true; do
  TASK=$(ls .agents/tasks/ | sort | head -1)
  
  if [ -n "$TASK" ]; then
    # Claim task atomically
    if mv ".agents/tasks/$TASK" ".agents/locks/${AGENT_ID}_$TASK" 2>/dev/null; then
      echo "Claimed task: $TASK"
      
      # Update status
      echo "{\"status\": \"working\", \"task\": \"$TASK\", \"started_at\": \"$(date -Iseconds)\"}" > .agents/status/${AGENT_ID}.active
      
      # Execute task (this would call the actual work function)
      execute_task "$TASK"
      
      # Mark completion
      echo "{\"task_id\": \"$TASK\", \"completed_by\": \"$AGENT_ID\", \"completed_at\": \"$(date -Iseconds)\"}" > ".agents/completed/${TASK}.done"
      
      # Clean up
      rm ".agents/locks/${AGENT_ID}_$TASK"
      echo "{\"status\": \"available\"}" > .agents/status/${AGENT_ID}.active
    fi
  else
    echo "No tasks available, waiting..."
    sleep 30
  fi
done
```

This cooperation system ensures that multiple Claude Code agents can work efficiently on the Kiedis Outreacher project without conflicts, while maintaining clear communication and task visibility.