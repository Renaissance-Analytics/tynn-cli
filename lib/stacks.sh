#!/usr/bin/env bash
# Stack detection and utilities for tynn-cli
# Source this file to use stack detection in commands

# ─────────────────────────────────────────────────────────────────────────────
# Stack IDs
# ─────────────────────────────────────────────────────────────────────────────

STACK_LARAVEL="laravel"
STACK_NODE_PRISMA="node-prisma"
STACK_NODE_DRIZZLE="node-drizzle"
STACK_NODE_KNEX="node-knex"
STACK_NODE_SEQUELIZE="node-sequelize"
STACK_NODE_TYPEORM="node-typeorm"
STACK_NODE="node"
STACK_DJANGO="django"
STACK_FLASK_ALEMBIC="flask-alembic"
STACK_GO_MIGRATE="go-migrate"
STACK_UNKNOWN="unknown"

# ─────────────────────────────────────────────────────────────────────────────
# Stack Detection
# ─────────────────────────────────────────────────────────────────────────────

# Detect the current project stack
# Returns stack ID via stdout
detect_stack() {
  # Check for forced stack in config
  if [[ -n "${FORCE_STACK:-}" ]]; then
    echo "$FORCE_STACK"
    return
  fi

  # Laravel/PHP
  if [[ -f "artisan" && -f "composer.json" ]]; then
    echo "$STACK_LARAVEL"
    return
  fi

  # Node.js projects (check for specific ORMs first)
  if [[ -f "package.json" ]]; then
    local pkg
    pkg=$(cat package.json 2>/dev/null || echo "{}")

    # Prisma
    if echo "$pkg" | grep -q '"prisma"' || [[ -f "prisma/schema.prisma" ]]; then
      echo "$STACK_NODE_PRISMA"
      return
    fi

    # Drizzle
    if echo "$pkg" | grep -q '"drizzle-kit"' || [[ -d "drizzle" ]]; then
      echo "$STACK_NODE_DRIZZLE"
      return
    fi

    # Knex
    if echo "$pkg" | grep -q '"knex"' || [[ -f "knexfile.js" || -f "knexfile.ts" ]]; then
      echo "$STACK_NODE_KNEX"
      return
    fi

    # Sequelize
    if echo "$pkg" | grep -q '"sequelize"' || [[ -f ".sequelizerc" ]]; then
      echo "$STACK_NODE_SEQUELIZE"
      return
    fi

    # TypeORM
    if echo "$pkg" | grep -q '"typeorm"'; then
      echo "$STACK_NODE_TYPEORM"
      return
    fi

    # Generic Node.js
    echo "$STACK_NODE"
    return
  fi

  # Python/Django
  if [[ -f "manage.py" ]]; then
    if [[ -f "requirements.txt" ]] && grep -qi "django" requirements.txt 2>/dev/null; then
      echo "$STACK_DJANGO"
      return
    fi
    if [[ -f "pyproject.toml" ]] && grep -qi "django" pyproject.toml 2>/dev/null; then
      echo "$STACK_DJANGO"
      return
    fi
    # Assume Django if manage.py exists
    echo "$STACK_DJANGO"
    return
  fi

  # Python/Flask with Alembic
  if [[ -f "alembic.ini" ]] || [[ -f "migrations/alembic.ini" ]]; then
    echo "$STACK_FLASK_ALEMBIC"
    return
  fi

  # Go with migrations
  if [[ -f "go.mod" ]]; then
    if [[ -d "migrations" ]] || [[ -d "db/migrations" ]]; then
      echo "$STACK_GO_MIGRATE"
      return
    fi
  fi

  echo "$STACK_UNKNOWN"
}

# ─────────────────────────────────────────────────────────────────────────────
# Package Manager Detection
# ─────────────────────────────────────────────────────────────────────────────

# Detect Node.js package manager
# Returns: npm, pnpm, yarn, or bun
detect_node_pm() {
  if [[ -f "bun.lockb" ]]; then
    echo "bun"
  elif [[ -f "pnpm-lock.yaml" ]]; then
    echo "pnpm"
  elif [[ -f "yarn.lock" ]]; then
    echo "yarn"
  else
    echo "npm"
  fi
}

# Detect Python package manager
# Returns: pip, poetry, or uv
detect_python_pm() {
  if [[ -f "uv.lock" ]]; then
    echo "uv"
  elif [[ -f "poetry.lock" ]]; then
    echo "poetry"
  else
    echo "pip"
  fi
}

# Get the run command for the detected Node package manager
# Usage: $(node_pm_run) test  →  npm run test / pnpm test / etc.
node_pm_run() {
  local pm
  pm=$(detect_node_pm)
  case "$pm" in
    bun)  echo "bun run" ;;
    pnpm) echo "pnpm" ;;
    yarn) echo "yarn" ;;
    *)    echo "npm run" ;;
  esac
}

# Get the exec command for the detected Node package manager
# Usage: $(node_pm_exec) prisma  →  npx prisma / pnpm exec prisma / etc.
node_pm_exec() {
  local pm
  pm=$(detect_node_pm)
  case "$pm" in
    bun)  echo "bunx" ;;
    pnpm) echo "pnpm exec" ;;
    yarn) echo "yarn" ;;
    *)    echo "npx" ;;
  esac
}

# Get the install command for the detected Node package manager
# Usage: $(node_pm_install) -D vitest  →  npm install -D vitest / etc.
node_pm_install() {
  local pm
  pm=$(detect_node_pm)
  case "$pm" in
    bun)  echo "bun add" ;;
    pnpm) echo "pnpm add" ;;
    yarn) echo "yarn add" ;;
    *)    echo "npm install" ;;
  esac
}

# Get the dev flag for the detected Node package manager
node_pm_dev_flag() {
  local pm
  pm=$(detect_node_pm)
  case "$pm" in
    bun)  echo "-d" ;;
    pnpm) echo "-D" ;;
    yarn) echo "-D" ;;
    *)    echo "-D" ;;
  esac
}

# ─────────────────────────────────────────────────────────────────────────────
# Stack Validation
# ─────────────────────────────────────────────────────────────────────────────

# Check if a stack is allowed based on config
# Usage: is_stack_allowed "laravel"
is_stack_allowed() {
  local stack="$1"

  # Check disallow list first
  if [[ -n "${DISALLOWED_STACKS:-}" ]]; then
    if [[ ",$DISALLOWED_STACKS," == *",$stack,"* ]]; then
      return 1
    fi
  fi

  # Check allow list (if set, only those are allowed)
  if [[ -n "${ALLOWED_STACKS:-}" ]]; then
    if [[ ",$ALLOWED_STACKS," == *",$stack,"* ]]; then
      return 0
    else
      return 1
    fi
  fi

  return 0
}

# Check if a tool is allowed for a stack based on config
# Usage: is_tool_allowed "laravel" "pest"
is_tool_allowed() {
  local stack="$1"
  local tool="$2"

  # Convert stack ID to config var name (laravel → STACK_TOOLS_LARAVEL)
  local var_name="STACK_TOOLS_${stack^^}"
  var_name="${var_name//-/_}"

  local allowed_tools="${!var_name:-}"

  # If no restriction set, allow all
  if [[ -z "$allowed_tools" ]]; then
    return 0
  fi

  # Check if tool is in allowed list
  if [[ ",$allowed_tools," == *",$tool,"* ]]; then
    return 0
  fi

  return 1
}

# ─────────────────────────────────────────────────────────────────────────────
# Stack Info
# ─────────────────────────────────────────────────────────────────────────────

# Get human-readable stack name
stack_name() {
  local stack="$1"
  case "$stack" in
    laravel)        echo "Laravel (PHP)" ;;
    node-prisma)    echo "Node.js + Prisma" ;;
    node-drizzle)   echo "Node.js + Drizzle" ;;
    node-knex)      echo "Node.js + Knex" ;;
    node-sequelize) echo "Node.js + Sequelize" ;;
    node-typeorm)   echo "Node.js + TypeORM" ;;
    node)           echo "Node.js" ;;
    django)         echo "Django (Python)" ;;
    flask-alembic)  echo "Flask + Alembic (Python)" ;;
    go-migrate)     echo "Go + Migrate" ;;
    *)              echo "Unknown" ;;
  esac
}

# Check if stack is Node.js based
is_node_stack() {
  local stack="$1"
  case "$stack" in
    node|node-prisma|node-drizzle|node-knex|node-sequelize|node-typeorm)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# Check if stack is Python based
is_python_stack() {
  local stack="$1"
  case "$stack" in
    django|flask-alembic)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# Check if stack is PHP based
is_php_stack() {
  local stack="$1"
  [[ "$stack" == "laravel" ]]
}

# Check if stack is Go based
is_go_stack() {
  local stack="$1"
  [[ "$stack" == "go-migrate" ]]
}
