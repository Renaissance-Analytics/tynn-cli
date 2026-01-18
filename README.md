\
# wish-cli

A small, versioned command toolkit for **Git Bash on Windows** (and any bash shell).

## What's included

- `addflux` – runs `composer require livewire/flux-pro` in the current project directory
- `copy-screenshots` – copies Cursor browser extension screenshots into your project, deleting the source on success
- `pkg` – runs a command inside a `packages/<package>` directory (auto-detects if there's only one)
- `npmx` – runs `npm ...` inside a subdirectory containing `package.json` (server/client/etc)
- `usepest` – sets up Pest 4 testing framework for Laravel projects (optionally with browser testing support)

## Quick Install

**One command from anywhere:**

```bash
git clone <repo-url> ~/.local/share/wish-cli && ~/.local/share/wish-cli/install.sh
```

Or if you already have the repo cloned:

```bash
cd /path/to/tynn-cli
./install.sh
```

The installer will:
- Create a symlink to the standard location (updates are automatic!)
- Add scripts to your PATH in `~/.bashrc`
- Make scripts executable

**After installation**, restart your terminal or run:
```bash
source ~/.bashrc
```

### Installation Options

The installer supports three modes:

1. **Symlink (default)** - Creates `~/.local/share/wish-cli` → your repo
   - ✅ Updates automatically when you `git pull`
   - ✅ No need to re-run install after updates
   - ✅ Best for development and sharing

2. **Direct** - Uses repo from current location
   - ✅ Good for forks or custom locations
   - ⚠️  Must update PATH manually if you move the repo

3. **Copy** - Copies repo to standard location
   - ⚠️  Updates require re-running install.sh
   - ❌ Not recommended (use symlink instead)

### Manual Install

If you prefer manual setup:

1. Clone or place repo anywhere (or use `~/.local/share/wish-cli`)
2. Add to `~/.bashrc`:
   ```bash
   export PATH="/path/to/tynn-cli/bin:$PATH"
   ```
3. Reload: `source ~/.bashrc`

## Usage

### addflux

```bash
cd /path/to/your/laravel/project
addflux
```

### copy-screenshots

```bash
copy-screenshots screenshot1.png:home screenshot2.png:pricing
```

Defaults:
- source temp base: `C:\Users\<you>\AppData\Local\Temp\cursor-browser-extension`
- target base: `public/screenshots`

Overrides:
- `CURSOR_TEMP_BASE` for source path
- `SCREENSHOTS_DIR` for target base path

### pkg

```bash
pkg php vendor/bin/pest
pkg laravel-fun-lab php vendor/bin/pest
```

### npmx

```bash
npmx server test -- --run tests/services/chat/clarifier.test.js
npmx client build
npmx test
```

### usepest

Set up Pest 4 testing framework for your Laravel project:

```bash
cd /path/to/your/laravel/project
usepest              # Install Pest 4
usepest --browser    # Install Pest 4 with browser testing support
```

The command will:
1. Remove PHPUnit (if present)
2. Install Pest 4 with all dependencies
3. Initialize Pest configuration
4. Optionally install browser testing support (with `--browser` flag)

## Updating

If you used the **symlink installation** (default):

```bash
cd ~/.local/share/wish-cli  # or wherever your repo is
git pull
# That's it! Scripts are automatically updated.
```

If you used **copy installation**, re-run:
```bash
./install.sh
```

## Sharing & Forking

This repo is designed to be easily shared and forked:

- **Clone anywhere** - Installer handles location automatically
- **Symlink mode** - Updates propagate automatically
- **No dependencies** - Scripts are self-contained
- **Version controlled** - Easy to track changes and collaborate

To share with others:
1. They clone the repo
2. Run `./install.sh`
3. Done! Updates work automatically via `git pull`

## Contributing

Add new commands as executable files in `bin/`.

Keep scripts **POSIX-ish** where possible, but these are optimized for Git Bash.
