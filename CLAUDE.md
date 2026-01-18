# Tynn MCP Guidelines

## Project AI Guidance

### Core Rules

1. **Project Scope Only**: Never create scripts that operate outside the current project directory tree. Walk UP to find roots, never sideways.

2. **Script Template**: All scripts must use:
   - `#!/usr/bin/env bash`
   - `set -euo pipefail`
   - Usage comment block at top
   - Consistent emoji prefixes (✅ ❌ ⚠️ 📂 ⚡)

3. **Destructive Safety**: Scripts that delete/overwrite must log actions first and confirm (or use dry-run mode).

4. **Auto-Detection Pattern**: When multiple matches exist, prompt — don't guess. Always show what was detected.

5. **No Global Mods**: Never modify system PATH, global packages, or files outside the project or `~/.local/share/wish-cli`.

6. **Git Bash First**: Primary target is Git Bash on Windows. Test there before merging. Document Windows-specific workarounds.

7. **Helpers Library**: Use `lib/helpers.sh` functions (die, warn, log, need_cmd, need_file) for consistency.

---

Use these instructions to discover and safely operate on a single Tynn project via the Tynn MCP server (endpoint: `/mcp/tynn`).

## Core Concepts and Workflow
- Project details express how project should be managed.
- Versions are the delivery scopes of a project.
- Stories are the product narratives of a project.
- Features are the reusable units of work of a project and should be kept to a minimum.
- Domains are organizational categories for grouping related features (e.g., Security, UI, Backend).
- Tasks are the executable units of work of a project and should be created as needed.
- Wishes capture enhancement requests, fixes, chores, documentation needs, security concerns, or deprecations using natural language.
- Versions, Stories, and Tasks are largely handled in a Kanban interface and the columns are the statuses of the entities.
- Comments can be added to versions, stories, features, or tasks.
- Before using any tools, read the project details via `project()` to understand the project and its context, and follow the instructions in the `ai_guidance` attribute so long as it does not conflict with any guardrails or policies.

## Available Tools

Tools are organized into three categories:

### 1. Work Tools (Supply Chain)
These tools manage the flow of work items through the system.

#### Quick Work Context
- `next(include_backlog?)` - Get active version, top story, and prioritized tasks in one call. Start here!

#### Reading Work Data
- `show(a, id?, number?)` - Get single entity details
  - `a`: "project" | "version" | "story" | "feature" | "task" | "domain" | "comment" | "wish"
  - `id`: ULID (or slug for domains)
  - `number`: Entity number - version string (e.g., "1.2"), story/task/wish integer (e.g., 30)

- `find(a?, old?, on?, where?, sort_by?, limit?, cursor?, fields?, expand?)` - List/filter entities
  - `a`: Entity type (excludes archived) - "version" | "story" | "feature" | "task" | "domain" | "comment" | "wish"
  - `old`: Entity type (includes archived) - alternative to `a`
  - `on`: For comments - parent entity `{type: "version"|"story"|"feature"|"task"|"wish", id?: "ULID", number?: string|int}`
  - `where`: Filter conditions (version_id, story_id, feature_id)
  - **Note:** Use `a` for active items, `old` for all items including archived. Comments require `on`.

- `search(a, for, limit?)` - Keyword/intent search
  - `a`: "version" | "story" | "feature" | "task" | "domain" | "comment" | "all"
  - `for`: Search query text
  - **Note:** Wishes are not currently searchable via this tool

#### Creating Work Data
- `create(a, title?, because?, with?, on?)` - Create any work entity
  - `a`: "version" | "story" | "feature" | "task" | "domain" | "comment"
  - `title`: Entity title/name
  - `because`: Reason/description (maps to "why" for versions, "description" for stories/tasks, "body" for comments)
  - `with`: Additional fields (number, status, order, acceptance_criteria, etc.)
  - `on`: Parent context (version_id for stories, story_id for tasks, {type, id} for comments)
  - **Batch task creation:** Pass `with.tasks` array to create multiple tasks at once (preferred for efficiency)

- `iwish(this, had?, didnt?, when?, needs?, explain?, secure?, remove?, features?)` - Capture a wish using natural language
  - `this`: The thing you wish regarding (Title) - **required**
  - `had`: Enhancement - What feature it should have
  - `didnt`: Fix - What it did wrong (use with `when` for context)
  - `when`: Fix - When the error occurs
  - `needs`: Chore - What maintenance/debt it needs
  - `explain`: Docs - What needs explaining
  - `secure`: Security - What security concern to address
  - `remove`: Deprecation - What to remove and why
  - `features`: Array of feature slugs or IDs this wish relates to (e.g., ["auth", "dashboard"])
  - **Note:** Exactly one of `had`, `didnt`, `needs`, `explain`, `secure`, or `remove` must be provided
  - **Note:** Wishes are converted to Stories via the UI, not MCP tools

#### Updating Work Data
- `update(a, id, with, reason?)` - Update workflow entities (NOT for data model schemas - use `schema` for that)
  - `a`: "project" | "version" | "story" | "feature" | "task" | "domain" | "wish"
  - `id`: Entity ULID (ensures correct entity is updated). For project, use "current"
  - `with`: Fields to update (varies by entity type)
  - `reason`: Optional reason for the update (adds comment + logs in activity)
  - **Note:** For project data model schema management, use the `schema` tool instead

### 2. Configuration Tools (Persistent Context)
These tools manage project settings and data model definitions.

#### Project Configuration
- `project(info?, is?, add?, update?, delete?)` - Get or update project configuration
  - No params: Returns summary (vision, ai_guidance, themes, versioning_pattern)
  - `info: "all"`: Returns full project details including active version
  - `info: "<attribute>"`: Returns specific attribute value
  - `is: "<value>"`: Sets text attribute (vision, versioning_pattern). Note: ai_guidance is read-only via MCP.
  - `add: {...}`: Adds item to array attribute (personas, strategic_themes, constraints, etc.)
  - `update: {index: 0, data: {...}}`: Updates item at index in array attribute
  - `delete: 0`: Deletes item at index from array attribute

**Text attributes** (use `is`): vision, versioning_pattern
**Read-only text attributes** (can be read but not updated via MCP): ai_guidance
**Array attributes** (use `add`/`update`/`delete`): personas, strategic_themes, constraints, risk_register, design_tokens, integration_catalog, servers, technologies

**Technologies array items** should have: `{name: "Laravel", type: "framework", version: "12"}` where `type` is one of: `language`, `framework`, `package`, `tool`, `other`

**Personas array items** should have: `{name: "Developer", role: "End User", goals: "Ship fast", pains: "Slow feedback"}` where `role` indicates the user type (e.g., End User, Admin, Power User, Creator). Note: Use `goals` (plural) and `pains` (plural) - not `goal` (singular) or `painpoint`.

**Strategic themes array items** should have: `{name: "Theme Name", description: "Optional description"}` or can be a simple string (will be normalized to object format).

**Constraints array items** should have: `{description: "Constraint text"}` or can be a simple string (will be normalized to object format).

**Risk register array items** should have: `{risk: "Risk description", mitigation: "Mitigation strategy"}`. Note: Use `risk` key (not `issue`).

**Examples:**
```
project()                                      // Get summary
project(info: "all")                           // Get everything + active version
project(info: "vision", is: "Build the best...") // Set vision
project(info: "personas")                      // List personas
project(info: "personas", add: {name: "Developer", role: "End User", goals: "Ship fast", pains: "Slow feedback"}) // Add persona
project(info: "personas", delete: 0)           // Remove first persona
project(info: "strategic_themes", add: {name: "Mobile-first", description: "Prioritize mobile experience"}) // Add theme
project(info: "constraints", add: {description: "Must support 10k concurrent users"}) // Add constraint
project(info: "risk_register", add: {risk: "Scalability issues", mitigation: "Use horizontal scaling"}) // Add risk
project(info: "technologies")                  // List tech stack
project(info: "technologies", add: {name: "Laravel", type: "framework", version: "12"}) // Add technology
```

#### Schema Management (Project Data Models)
- `schema(action, type?, named?, on?, between?, with?, include_fields?, include_relationships?)` - Manage project data model schema definitions (ProjectModel, fields, relationships). NOT for workflow entities like versions/stories/tasks - use `update` for those.
  - `action: "get"`: Read schema (optionally filter by `named` model)
  - `action: "add", type: "model"`: Add a new model with `named` and `with: {...fields}`
  - `action: "add", type: "relationship"`: Add relationship via `between: {from, to, via, type}`
  - `action: "update", type: "model"`: Update model metadata/fields
  - `action: "update", type: "relationship"`: Update relationship properties
  - `action: "remove", type: "model"`: Remove model (auto-removes relationships)
  - `action: "remove", type: "relationship"`: Remove specific relationship
  - `action: "attach", named: "ModelName", on: "feature-slug"`: Attach model to feature
  - `action: "detach", named: "ModelName", on: "feature-slug"`: Detach model from feature

**Examples:**
```
schema(action: "get")                                           // Get all models
schema(action: "get", named: "User", include_relationships: true) // Get User with relationships
schema(action: "add", type: "model", named: "Order", with: {table_name: "orders", fields: [...]})
schema(action: "add", type: "relationship", between: {from: "User", to: "Order", via: "orders", type: "hasMany"})
schema(action: "update", type: "model", named: "User", with: {description: "Updated description"})
schema(action: "attach", named: "User", on: "auth")             // Attach User model to auth feature
schema(action: "detach", named: "User", on: "auth")            // Detach User model from auth feature
schema(action: "remove", type: "model", named: "TempModel")     // Removes model + relationships
```

### 3. Workflow Action Tools
These tools handle status transitions and require `auto_approve=true` on the project.

- `starting(a, id?, number?, ids?, numbers?, note?)` - Start work (version→active, story→in_progress, task→doing). Supports bulk for stories/tasks with shared-parent constraints.
  - **Bulk rules**:
    - Tasks: all tasks must belong to the same story
    - Stories: all stories must belong to the same version

- `testing(a, id?, number?, ids?, numbers?, note?)` - Move story/task to QA. Supports bulk with shared-parent constraints.

- `finished(a, id?, number?, ids?, numbers?, note?, purge?)` - Mark task/story done, or version released. Supports bulk for stories/tasks with shared-parent constraints.

- `block(a, id?, number?, note?)` - Mark as blocked with required note
  - `a`: "story" | "task"

**Aliases (deprecated):** `start` → `starting`, `ready` → `testing`, `done` → `finished`. Prefer the canonical names to avoid confusion.

## Minimal note policy (recommended)

To reduce comment noise and token accumulation, keep workflow notes short and structured:
- `WF_SIM` (generic)
- `ready`
- `done`
- `blocked:<reason>`

Only add detailed rationale when needed (single comment capturing trade-offs), not on every transition.

## Example Workflows

### Start a New Session
```
1. next() → Get current work context
2. project() → Understand project guidance and vision
```

### Create a Task
```
create(
  a: "task",
  title: "Implement login form",
  because: "Users need to authenticate to access protected features",
  with: {status: "backlog", verification_steps: ["Form renders", "Submit works"]},
  on: {story_id: "01abc..."}
)
```

### Batch Create Tasks (Preferred)
When creating multiple tasks for a story, use batch creation for efficiency:
```
create(
  a: "task",
  on: {story_id: "01abc..."},
  with: {
    tasks: [
      {title: "Design login UI", because: "Create mockups and component structure"},
      {title: "Implement form validation", feature_titles: ["Auth"]},
      {title: "Add OAuth support", verification_steps: ["Google works", "GitHub works"]},
      {title: "Write tests", code_area: "tests/Feature/Auth"}
    ]
  }
)
```
Each task accepts: `title` (required), `because`/`description`, `feature_titles`, `verification_steps`, `code_area`, `env_requirements`, `blocking_on`, `produces`.

### Move Task to QA
```
ready(a: "task", number: 123, note: "Ready for review - all tests passing")
```

### Complete a Task
```
done(a: "task", number: 123, note: "Implemented and deployed")
```

### Search for Related Work
```
search(a: "all", for: "authentication")
```

### Update Project Personas
```
project(info: "personas", add: {
  name: "Product Manager",
  role: "Power User",
  goals: "Deliver value and track progress",
  pains: "Manual status updates and lack of visibility"
})
```

### Update Strategic Themes
```
project(info: "strategic_themes", add: {
  name: "Mobile-first Experience",
  description: "Prioritize mobile usability and responsive design"
})
```

### Update Constraints
```
project(info: "constraints", add: {
  description: "Must support 10k concurrent users at launch"
})
```

### Update Risk Register
```
project(info: "risk_register", add: {
  risk: "Scalability issues with real-time messaging",
  mitigation: "Use Redis pub/sub and horizontal scaling"
})
```

### Define Data Model
```
schema(action: "add", type: "model", named: "Invoice", with: {
  table_name: "invoices",
  description: "Customer invoices",
  fields: [
    {name: "id", type: "ulid", is_primary: true},
    {name: "customer_id", type: "ulid", is_indexed: true},
    {name: "total", type: "decimal"}
  ]
})
```

### Capture a Wish
```
iwish(
  this: "Login form",
  had: "Support for OAuth2 providers and social login buttons",
  features: ["auth", "user-profile"]
)
```

### Capture a Fix Wish
```
iwish(
  this: "Password reset",
  didnt: "Send email confirmation",
  when: "User requests password reset",
  features: ["auth"]
)
```

## Status Values

- **Version**: `draft` | `active` | `accepted` | `rejected` | `released` | `archived`
- **Story**: `backlog` | `blocked` | `in_progress` | `qa` | `done` | `archived`
- **Task**: `backlog` | `blocked` | `doing` | `qa` | `done` | `archived`

## Shorthand References

When referring to entities in conversation or lookups, use these shorthand patterns:
- **v1.2** - Version 1.2 → `show(a: "version", number: "1.2")`
- **s11** - Story #11 → `show(a: "story", number: 11)` or `ready/done`
- **t44** - Task #44 → `show(a: "task", number: 44)` or `ready/done`

**Important:** Updates use the entity **ID** (ULID) to ensure precision.

### Entity Numbers
- Versions have string numbers (e.g., "1.2", "2.0.1").
- Stories and Tasks receive a per-project sequential integer number automatically when created.
- Use `show` first to get the ID before calling `update`.

## Response Formats

### List Response (find)
```json
{ "ok": true, "type": "<entity>.list", "meta": {"count": 20}, "paging": {"next": "cursor"}, "data": [...] }
```

### Search Response
```json
{ "ok": true, "type": "search.results", "query": "...", "meta": {"count": 5}, "data": [...] }
```

### next Response
```json
{ "ok": true, "project": {...}, "active_version": {...}, "top_story": {...}, "tasks": [...], "stats": {...} }
```

## Markdown Formatting

All descriptive text fields support **Markdown** and should use it for rich content:

| Entity      | Markdown Fields         |
| ----------- | ----------------------- |
| **Version** | `why`, `what`, `how`    |
| **Story**   | `description`           |
| **Task**    | `description`           |
| **Feature** | `description`           |
| **Domain**  | `description`           |
| **Wish**    | `description`           |
| **Project** | `vision`, `ai_guidance` |
| **Comment** | `body`                  |

**Example with Markdown:**
```
create(
  a: "task",
  title: "Implement auth flow",
  because: "## Overview\n\nUsers need authentication to:\n- Access protected routes\n- Manage their profile\n\n**Key requirements:**\n1. OAuth2 support\n2. Session management",
  on: {story_id: "01abc..."}
)
```

Use Markdown for:
- **Headers** (`#`, `##`, `###`) to structure content
- **Lists** (`-` or `1.`) for acceptance criteria, steps, requirements
- **Bold/Italic** (`**bold**`, `*italic*`) for emphasis
- **Code** (`` `inline` `` or ``` fenced ```) for technical references
- **Links** (`[text](url)`) for external references
- **Blockquotes** (`>`) for notes or quotes

## Notes

- All tools enforce Policies; unauthorized or cross-project attempts return errors.
- Ordering uses integer sort fields with a gap strategy (typically ±100).
- Domains are scoped to projects and identified by `slug` (unique per project) or `id` (ULID).

---

## Guardrails

### Universal Rules

These guardrails apply to ALL Tynn MCP interactions, regardless of which prompt or tool you are using.

#### 1. Project Context First
- **Always** call `project()` or `next()` before performing any operations
- Read and respect the `ai_guidance` attribute — it contains project-specific instructions
- Only deviate from `ai_guidance` if it conflicts with these guardrails or security policies

#### 2. Workflow State Transitions
- **Never skip workflow states** — follow the proper transition order:
  - Tasks: `backlog` → `doing` → `qa` → `done`
  - Stories: `backlog` → `in_progress` → `qa` → `done`
  - Versions: `accepted` → `active` → `released`
- Use `validate` operations when unsure if a transition is allowed
- Blocked items must include a reason explaining the blocker

#### 3. Parent-Child Relationships
- **Tasks require an in-progress parent Story** — cannot start tasks if story is in backlog
- **Stories require an active parent Version** — cannot start stories if version is draft or accepted
- **Complete children before parents** — all Tasks must be done before Story can be done
- Attempting to violate these rules will result in errors

#### 4. Batch Operations
- **Prefer batch operations** when creating or updating multiple items
- Use `create(a: "task", with: {tasks: [...]})` for multiple tasks
- Use `vip(update: "tasks", ...)` for batch task updates
- Batch operations reduce API calls and improve efficiency

#### 5. Markdown Formatting
- **Use Markdown** in all descriptive fields (`description`, `why`, `what`, `how`, `body`)
- Structure content with headers, lists, bold/italic, and code blocks
- Well-formatted content improves readability and future reference

#### 6. Scope Boundaries
- **Do not expand scope** beyond what the current work item defines
- If you discover new work, capture it separately using `iwish()` or suggest creating new items
- Stay focused on the task at hand — scope creep leads to incomplete work

#### 7. Keep Tynn Updated
- **Update status** as work progresses — don't work silently
- Mark items as done when complete, blocked when stuck

#### 8. Tool Selection
- Use the **right tool for the context**:
  - `create` / `update` for CRUD operations
  - `starting` / `testing` / `finished` / `block` for workflow transitions
  - `iwish` for capturing unplanned ideas and feedback
  - `vip` for managing urgent/hotfix work
  - `schema` for data model definitions (not `update`)
- Read the tool descriptions to understand their purpose

#### 9. Entity References
- **Use IDs (ULIDs) for updates** — numbers are for reading/display only
- Call `show()` first to get the ID before calling `update()`
- Shorthand references (v1.2, s30, t123) are for conversation only

#### 10. Error Handling
- **Always pay close attention to error messages** — they will direct you to the correct action
- If an operation fails, **read the error message carefully** — it explains what went wrong and often suggests the fix
- Error messages are your guide: they indicate missing prerequisites, invalid states, or required steps
- Common errors: permission denied, invalid transition, missing parent, cross-project access
- Don't retry failed operations without addressing the underlying issue — follow the error message's guidance

#### 11. UI-Only Operations
- **VIP versions cannot be created via MCP** — they must be created manually in the UI
- The `vip` tool is for managing existing VIP work only (show, update, validate, search)
- To add stories/tasks to a VIP version, use the standard `create` tool with the VIP version's ID

#### 12. Comment Usage
- **Use comments for documenting thought processes**, not activities
- Comments should capture:
  - **Rationale** — why a decision was made
  - **Trade-offs** — what alternatives were considered
  - **Context** — important background information
  - **Cross-links** — references to related work
  - **Blockers** — what's preventing progress and why
- **Do NOT** create comments that simply state what happened:
  - "Task marked as done"
  - "Moved to QA"
  - "Status updated"
- Workflow tools (`starting`, `testing`, `finished`) automatically create activity logs — no need to duplicate with comments
- If you need to explain **why** a status change occurred, use the `note` parameter on workflow tools instead of creating a separate comment
