# Git & GitHub — Complete Notes
### Everything from Setup to Real-World Workflows

---

## Table of Contents

1. [What is Git? What is GitHub?](#1-what-is-git-what-is-github)
2. [How Git Works Internally](#2-how-git-works-internally)
3. [Installation & First-Time Setup](#3-installation--first-time-setup)
4. [Core Git Concepts](#4-core-git-concepts)
5. [Starting a Project — `git init` & `git clone`](#5-starting-a-project)
6. [The Daily Workflow — Stage, Commit, Push](#6-the-daily-workflow)
7. [Branching & Merging](#7-branching--merging)
8. [Working with GitHub (Remote)](#8-working-with-github-remote)
9. [Undoing Things](#9-undoing-things)
10. [Stashing Work](#10-stashing-work)
11. [Rebasing](#11-rebasing)
12. [Tagging](#12-tagging)
13. [GitHub-Specific Features](#13-github-specific-features)
14. [Real Project Workflow (Team)](#14-real-project-workflow-team)
15. [Real Project Workflow (Solo)](#15-real-project-workflow-solo)
16. [.gitignore](#16-gitignore)
17. [Git Log & Inspecting History](#17-git-log--inspecting-history)
18. [Advanced Commands](#18-advanced-commands)
19. [Common Mistakes & Fixes](#19-common-mistakes--fixes)
20. [Cheat Sheet](#20-cheat-sheet)

---

## 1. What is Git? What is GitHub?

### Git
Git is a **distributed version control system**. It tracks every change you make to files in a project over time. Think of it as a time machine — you can go back to any version of your project at any point.

- Created by **Linus Torvalds** in 2005 (the same person who made Linux)
- It runs **locally on your computer** — no internet needed
- Every developer has the full project history on their own machine

**Why Git?**
- Track who changed what and when
- Revert broken code instantly
- Work on features without breaking the main code
- Multiple developers work on the same project simultaneously

### GitHub
GitHub is a **cloud platform** that hosts Git repositories online. It adds collaboration features on top of Git.

- GitHub = Git + Web interface + Collaboration tools
- Other alternatives: GitLab, Bitbucket (same concept, different platforms)

**Analogy:**
- Git = Microsoft Word's "Track Changes" feature
- GitHub = Google Drive (stores the document and lets people collaborate)

---

## 2. How Git Works Internally

### The Three Areas (THIS IS THE MOST IMPORTANT CONCEPT)

```
[ Working Directory ]  →  [ Staging Area ]  →  [ Repository (.git folder) ]
   Your actual files       What will be           Permanent history
   (what you edit)         in next commit          (commits)
```

**Working Directory:** The actual files on your computer that you edit.

**Staging Area (Index):** A preparation zone. You tell Git "these changes should be in the next snapshot." You don't commit everything at once — you choose.

**Repository:** The `.git` folder inside your project. This is where Git stores all the history, branches, commits, etc. Never delete this folder.

### What is a Commit?
A commit is a **snapshot** of your project at a specific moment. It stores:
- All the file contents at that moment
- A unique ID (SHA-1 hash like `a3f4bc1...`)
- Author name and email
- Timestamp
- Commit message
- Pointer to the previous commit (parent)

Commits form a **chain** — this chain is your project history.

### What is HEAD?
`HEAD` is a pointer that tells Git **"which commit you are currently looking at."** It usually points to the latest commit on your current branch.

```
main branch:   A → B → C → D   ← HEAD
```

---

## 3. Installation & First-Time Setup

### Install Git

```bash
# Ubuntu / Debian
sudo apt install git

# macOS (using Homebrew)
brew install git

# Windows
# Download from https://git-scm.com
```

### Verify Installation
```bash
git --version
# Output: git version 2.43.0
```

### One-Time Global Configuration
These settings are saved in `~/.gitconfig` on your computer.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**What this does:** Every commit you make will be stamped with this name and email. This is how teammates know who made which change.

```bash
# Set your preferred code editor (for writing commit messages)
git config --global core.editor "code --wait"   # VS Code
git config --global core.editor "nano"          # nano
git config --global core.editor "vim"           # vim

# Make git output colorful
git config --global color.ui auto

# Set default branch name to 'main' (modern standard)
git config --global init.defaultBranch main

# See all your config
git config --list
```

---

## 4. Core Git Concepts

### Repository (Repo)
A folder that Git is tracking. It contains your project files + the hidden `.git` folder.

### Branch
A parallel version of your project. The default is called `main` (or `master` in older projects). You create branches to work on features without touching the main code.

```
main:    A → B → C → D
                  ↘
feature:           E → F → G
```

### Merge
Combining changes from one branch into another.

### Remote
A copy of the repository hosted somewhere else (like GitHub). The default remote is called `origin`.

### Clone
Downloading a complete copy of a repository (with full history) from a remote.

### Pull
Fetch the latest changes from the remote and merge them into your local branch.

### Push
Upload your local commits to the remote repository.

---

## 5. Starting a Project

### Option A — Start from scratch (new project)

```bash
mkdir my-project
cd my-project
git init
```

**What happens in background:**
- Creates a hidden `.git` folder inside `my-project`
- This `.git` folder contains: HEAD file, config, objects folder, refs folder
- Git is now watching this directory — but has no commits yet

```
my-project/
├── .git/          ← Git's brain (don't touch this)
│   ├── HEAD
│   ├── config
│   ├── objects/
│   └── refs/
└── (your files)
```

### Option B — Start from an existing GitHub repo

```bash
git clone https://github.com/username/repository-name.git
```

**What happens in background:**
- Downloads the entire repository (all files + all history)
- Creates a folder with the repo name
- Sets up `origin` remote pointing to that GitHub URL
- Checks out the default branch (usually `main`)

```bash
# Clone into a specific folder name
git clone https://github.com/username/repo.git my-folder-name

# Clone only the latest commit (faster, smaller — shallow clone)
git clone --depth 1 https://github.com/username/repo.git
```

---

## 6. The Daily Workflow

This is the loop you do every day:

```
Edit files → git add → git commit → git push
```

### Step 1 — Check status

```bash
git status
```

**What it shows:**
- Which files you've modified
- Which files are staged (ready to commit)
- Which files are untracked (new files Git doesn't know about yet)
- Which branch you're on

Example output:
```
On branch main
Changes not staged for commit:
  modified:   index.html

Untracked files:
  style.css
```

### Step 2 — Stage changes with `git add`

```bash
# Stage a specific file
git add index.html

# Stage multiple files
git add index.html style.css

# Stage ALL modified and new files
git add .

# Stage everything (including deleted files)
git add -A

# Stage parts of a file (interactive — picks specific lines)
git add -p index.html
```

**What happens in background:**
- Git reads the file content, creates a "blob" object in `.git/objects/`
- Updates the "index" (staging area) to include this file
- Nothing is permanent yet — it's just queued up

**Real example — Project: E-commerce website**
```bash
# You edited the cart page and added a new logo
git add cart.html          # stage only the cart changes
git add images/logo.png    # stage the new logo

# Don't stage the config file with test passwords
# (don't add config.js — it has your test API keys)
```

### Step 3 — Commit with `git commit`

```bash
git commit -m "Add shopping cart functionality"
```

**What happens in background:**
1. Git takes everything in the staging area
2. Creates a "tree" object representing the directory structure
3. Creates a "commit" object with: tree hash, parent commit hash, author, timestamp, message
4. Moves the branch pointer (HEAD) to this new commit
5. The staging area is cleared

```bash
# Stage + commit tracked files in one command (skips staging for new files)
git commit -am "Fix login bug"

# Open editor for detailed multi-line commit message
git commit

# Amend the last commit (fix message or add forgotten file)
git commit --amend -m "Corrected commit message"
```

**Writing Good Commit Messages:**
```
✅ GOOD:
"Add user authentication with JWT tokens"
"Fix null pointer error in payment processing"
"Update README with installation instructions"

❌ BAD:
"stuff"
"fix"
"asdfjkl"
"changes"
"final version"
"final final version"
```

**Commit message convention (widely used):**
```
feat: add user login page
fix: resolve cart total calculation error
docs: update API documentation
style: format code with prettier
refactor: simplify database query logic
test: add unit tests for payment module
chore: update dependencies
```

### Step 4 — Push to GitHub

```bash
git push origin main
```

**What happens in background:**
- Git connects to GitHub (origin)
- Sends all new commit objects that GitHub doesn't have yet
- Updates the remote branch pointer to match your local one

```bash
# First push for a new branch (set upstream tracking)
git push -u origin main

# After that, you can just do:
git push

# Push a specific branch
git push origin feature-login

# Force push (DANGEROUS — overwrites remote history)
git push --force origin main
```

### Full Daily Example — Building a To-Do App

```bash
# Morning: Start work
git status                          # see what's changed
git pull                            # get latest changes from teammates

# Work on adding a feature
# ... edit todo.js and index.html ...

git status                          # confirm what changed
git diff                            # see exact line changes
git add todo.js index.html         # stage the relevant files
git commit -m "feat: add task deletion functionality"
git push                            # share with team
```

---

## 7. Branching & Merging

### Why Branches?
The `main` branch should always have working, stable code. When adding a new feature or fixing a bug, you create a separate branch. If something goes wrong, `main` is unaffected.

### Create & Switch Branches

```bash
# See all branches
git branch

# Create a new branch
git branch feature-login

# Switch to it
git checkout feature-login

# Create AND switch in one command (modern, preferred)
git switch -c feature-login

# Old-style one command (still works)
git checkout -b feature-login

# Switch back to main
git switch main
# or
git checkout main
```

**What happens in background:**
- `git branch feature-login` creates a new pointer at the current commit
- `git switch feature-login` moves HEAD to point to that branch
- All new commits go on this branch now
- `main` stays at the old commit, unaffected

```
Before:           After branch + some commits:
main: A→B→C       main:    A→B→C
          ↑                        ↘
         HEAD       feature:        D→E→F ← HEAD
```

### Real Example — Feature Branch Workflow

```bash
# You're on main, about to add a payment feature
git switch -c feature-payment
# HEAD is now on feature-payment

# Make changes to payment.js, checkout.html
git add payment.js checkout.html
git commit -m "feat: integrate Stripe payment gateway"

git add payment.js
git commit -m "fix: handle payment failure gracefully"

# Feature is done, merge back into main
git switch main
git merge feature-payment
```

### Merging

```bash
# You must be on the branch you want to merge INTO
git switch main
git merge feature-payment
```

**Types of Merges:**

**Fast-forward merge** — When main has no new commits since the branch was created:
```
Before:     main: A→B→C
                        ↘
            feature:     D→E

After merge (fast-forward):
            main: A→B→C→D→E   (just moved the pointer)
```

**3-way merge** — When both branches have new commits:
```
Before:     main:    A→B→C→G
                          ↘
            feature:       D→E→F

After merge:
            main:    A→B→C→G→M   (M is a new "merge commit")
                          ↘   ↗
                           D→E→F
```

```bash
# Create a merge commit even if fast-forward is possible (keeps history clean)
git merge --no-ff feature-payment

# Squash all feature commits into one before merging
git merge --squash feature-payment
```

### Merge Conflicts

A conflict happens when two branches modified the **same line** of the same file differently.

```bash
git merge feature-payment
# CONFLICT (content): Merge conflict in checkout.html
# Automatic merge failed; fix conflicts and then commit the result.
```

Open the conflicted file — Git marks it:
```html
<<<<<<< HEAD (your current branch — main)
<button class="btn-pay">Pay Now</button>
=======
<button class="btn-pay btn-large">Complete Purchase</button>
>>>>>>> feature-payment
```

You manually edit it to the correct version:
```html
<button class="btn-pay btn-large">Pay Now</button>
```

Then:
```bash
git add checkout.html          # mark as resolved
git commit -m "Merge feature-payment into main"
```

### Delete a Branch

```bash
# Delete local branch (safe — won't delete if unmerged)
git branch -d feature-payment

# Force delete (even if unmerged)
git branch -D feature-payment

# Delete remote branch
git push origin --delete feature-payment
```

---

## 8. Working with GitHub (Remote)

### Connect Local Repo to GitHub

```bash
# Add a remote called "origin"
git remote add origin https://github.com/username/my-project.git

# See your remotes
git remote -v

# Change remote URL
git remote set-url origin https://github.com/username/new-repo.git

# Remove a remote
git remote remove origin
```

### Fetch vs Pull

```bash
# FETCH: Download changes but DON'T merge
git fetch origin
# Now you can see what changed, review it, then decide to merge

# PULL: Fetch + Merge in one step
git pull origin main
# Same as: git fetch origin && git merge origin/main

# Pull with rebase instead of merge (cleaner history)
git pull --rebase origin main
```

**When to use fetch vs pull:**
- Use `git fetch` when you want to see changes before integrating them
- Use `git pull` when you trust the changes and want to update immediately

### Push

```bash
# Push local branch to remote (first time, set tracking)
git push -u origin main

# After setting upstream, just:
git push

# Push a specific local branch to remote
git push origin feature-login

# Push all branches
git push --all origin
```

### SSH vs HTTPS

**HTTPS:** Easier to set up, requires username/password or Personal Access Token (PAT)

**SSH:** More secure, no password needed after setup

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "you@example.com"

# Copy public key to clipboard (Mac)
cat ~/.ssh/id_ed25519.pub | pbcopy

# Then go to GitHub → Settings → SSH Keys → Add New
# Paste your public key there

# Test connection
ssh -T git@github.com
# Hi username! You've successfully authenticated...
```

---

## 9. Undoing Things

This is where most people get confused. Here's a clear breakdown:

### Undo unstaged changes (restore file to last commit)

```bash
# Discard changes in working directory for a specific file
git restore index.html
# OLD syntax: git checkout -- index.html

# Discard all unstaged changes
git restore .
```

**What happens:** Replaces the file with the version from the last commit. Your edits are permanently gone.

### Undo staged changes (unstage a file)

```bash
# Remove file from staging area (keep your changes in working directory)
git restore --staged index.html
# OLD syntax: git reset HEAD index.html
```

**What happens:** File goes back to "modified but not staged." Your edits are safe.

### Amend last commit (fix message or add missed file)

```bash
# Fix commit message
git commit --amend -m "Correct message here"

# Add a file you forgot to include
git add forgotten-file.js
git commit --amend --no-edit      # keeps the same message
```

⚠️ **Only do this if you haven't pushed yet.** Amending rewrites history.

### Undo commits with `git reset`

`git reset` moves the HEAD pointer backward.

```bash
# SOFT reset — undo commit, keep changes staged
git reset --soft HEAD~1
# HEAD~1 means "one commit before HEAD"

# MIXED reset (default) — undo commit, keep changes in working directory (unstaged)
git reset HEAD~1
# or
git reset --mixed HEAD~1

# HARD reset — undo commit, DELETE the changes completely
git reset --hard HEAD~1
# ⚠️ DANGEROUS — changes are gone forever
```

**Analogy:**
- `--soft` → You unsent the email but the draft is still there
- `--mixed` → You unsent the email and the draft is in Notepad (unsaved)
- `--hard` → You unsent the email and deleted the draft

```bash
# Undo last 3 commits, keep changes
git reset --soft HEAD~3

# Go back to a specific commit (use git log to find the hash)
git reset --hard a3f4bc1
```

### Undo with `git revert` (safe for shared history)

`git revert` creates a **new commit** that undoes a previous one. It does NOT rewrite history.

```bash
# Create a new commit that reverses what commit abc123 did
git revert abc123

# Revert without opening editor
git revert abc123 --no-edit
```

**Use `git revert` when:**
- You've already pushed the commit to GitHub
- Other people may have based work on that commit
- You want to keep the full history visible

**Use `git reset` when:**
- The commit is only local (not pushed yet)
- You want to clean up messy commits before pushing

### The Difference: reset vs revert

```
git reset:        A → B → C           → A → B
                              (C is gone)

git revert:       A → B → C           → A → B → C → C'
                              (C' undoes C's changes, C still in history)
```

---

## 10. Stashing Work

### What is Stash?
You're working on a feature. Suddenly your boss says "fix this urgent bug on main NOW." You're not ready to commit your half-done feature. Solution: **stash it** — temporarily put it aside.

```bash
# Save current work to stash (working dir becomes clean)
git stash

# Give the stash a name
git stash save "half-done login page"

# See all stashes
git stash list
# stash@{0}: On feature-login: half-done login page
# stash@{1}: On main: WIP temp fix

# Apply the latest stash (keep it in stash list)
git stash apply

# Apply a specific stash
git stash apply stash@{1}

# Apply AND remove from stash list
git stash pop

# Delete a stash
git stash drop stash@{0}

# Delete all stashes
git stash clear
```

### Real Stash Workflow

```bash
# Working on feature branch
git switch feature-login
# ... editing login.html, auth.js ...
# Boss: "Fix the crash on the payment page NOW!"

git stash save "WIP: login form half done"

git switch main
git switch -c hotfix-payment-crash
# ... fix the bug ...
git add payment.js
git commit -m "fix: resolve crash when cart is empty"
git push origin hotfix-payment-crash

# Back to your feature
git switch feature-login
git stash pop      # Your work is back!
```

---

## 11. Rebasing

### What is Rebase?
Instead of creating a merge commit, rebase **replays** your commits on top of another branch. It gives you a cleaner, linear history.

```
Before rebase:
main:    A → B → C → D
                  ↘
feature:           E → F

After: git rebase main (while on feature branch):
main:    A → B → C → D
                        ↘
feature:                 E' → F'   (E and F are replayed on top of D)
```

```bash
# Rebase feature branch on top of main
git switch feature-login
git rebase main

# Resolve any conflicts, then:
git rebase --continue

# Abort rebase if things go wrong
git rebase --abort
```

### Interactive Rebase — Clean Up Commits Before PR

```bash
# Rewrite last 3 commits interactively
git rebase -i HEAD~3
```

This opens an editor:
```
pick a1b2c3 Add login form HTML
pick d4e5f6 Fix typo in login form
pick g7h8i9 Add login form CSS

# Commands:
# p, pick = use commit
# r, reword = use commit but edit message
# e, edit = use commit but stop for amending
# s, squash = combine with previous commit
# d, drop = remove commit entirely
```

Change to:
```
pick a1b2c3 Add login form HTML
squash d4e5f6 Fix typo in login form
squash g7h8i9 Add login form CSS
```

Result: 3 messy commits become 1 clean commit. Perfect before opening a Pull Request.

### Merge vs Rebase

| | Merge | Rebase |
|---|---|---|
| History | Preserves all commits, shows true story | Linear, clean history |
| Merge commits | Creates merge commits | No merge commits |
| Safety | Safe on shared branches | Dangerous on shared branches |
| Use when | Merging feature → main | Updating feature with main's latest |

**Golden Rule of Rebasing: Never rebase commits that exist on the remote (shared) branch.**

---

## 12. Tagging

Tags mark specific commits as important — usually release versions.

```bash
# Create a lightweight tag
git tag v1.0.0

# Create an annotated tag (with message — recommended for releases)
git tag -a v1.0.0 -m "First stable release"

# Tag a specific commit
git tag -a v0.9.0 a3f4bc1

# List all tags
git tag

# Push a tag to GitHub
git push origin v1.0.0

# Push all tags
git push origin --tags

# Delete a local tag
git tag -d v1.0.0

# Delete a remote tag
git push origin --delete v1.0.0
```

---

## 13. GitHub-Specific Features

### Fork
A **fork** is your personal copy of someone else's repository on GitHub.

- You can't push directly to someone else's repo
- Fork it → make changes → submit a Pull Request
- Used in open source contribution

### Pull Request (PR)
A request to merge your branch/fork into another branch. Teammates review your code, comment, request changes, then approve and merge.

**PR Workflow:**
1. Create a branch: `git switch -c feature-search`
2. Make commits, push: `git push -u origin feature-search`
3. Go to GitHub → "Compare & Pull Request"
4. Write description explaining what you did and why
5. Request reviewers
6. Address comments, push more commits
7. Reviewer approves → Merge PR

### Issues
GitHub Issues are a built-in bug/task tracker. Reference them in commits:

```bash
git commit -m "fix: resolve search bug (closes #42)"
# When this PR is merged, GitHub automatically closes Issue #42
```

### GitHub Actions (CI/CD)
Automate tests, builds, and deployments.

```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
```

Every push automatically runs your tests. If tests fail, the PR shows a red X.

---

## 14. Real Project Workflow (Team)

### Setup (one time per developer)

```bash
git clone https://github.com/company/ecommerce-app.git
cd ecommerce-app
git config user.name "Raj Sharma"
git config user.email "raj@company.com"
```

### Day-to-Day Workflow

```bash
# 1. Always start by updating main
git switch main
git pull origin main

# 2. Create a branch for your task (use issue number for tracking)
git switch -c feature/42-add-wishlist

# 3. Work, commit often
git add wishlist.js wishlist.html
git commit -m "feat: create wishlist model and UI"

git add tests/wishlist.test.js
git commit -m "test: add unit tests for wishlist"

# 4. Keep your branch updated with main (in case others pushed)
git fetch origin
git rebase origin/main    # or: git merge origin/main

# 5. Push your branch
git push -u origin feature/42-add-wishlist

# 6. Open Pull Request on GitHub
# Write: "Adds wishlist feature. Closes #42"
# Request review from senior dev

# 7. Address review comments
# ... make changes ...
git add wishlist.js
git commit -m "refactor: move wishlist logic to service layer per review"
git push    # auto-updates the PR

# 8. After approval, merge on GitHub (or locally)
git switch main
git pull origin main    # get the merged changes

# 9. Clean up
git branch -d feature/42-add-wishlist
git push origin --delete feature/42-add-wishlist
```

### Branch Protection Rules (set on GitHub)
- Require PR reviews before merging
- Require status checks (tests) to pass
- Prevent force pushes to main
- Require branches to be up to date before merging

---

## 15. Real Project Workflow (Solo)

```bash
# New project
mkdir portfolio-website
cd portfolio-website
git init

# Create initial files
echo "# My Portfolio" > README.md

git add README.md
git commit -m "init: initial commit"

# Connect to GitHub
# (Create repo on GitHub first, then:)
git remote add origin https://github.com/yourusername/portfolio-website.git
git push -u origin main

# Work on homepage
git switch -c homepage
# ... build index.html, styles.css ...
git add .
git commit -m "feat: add homepage with hero section"

# Add projects section
git add projects.html
git commit -m "feat: add projects showcase section"

# Merge to main
git switch main
git merge homepage
git push

# Tag a version
git tag -a v1.0.0 -m "Portfolio v1 — ready to share"
git push origin --tags
```

---

## 16. .gitignore

The `.gitignore` file tells Git which files to ignore — never track them.

```bash
# Create .gitignore in your project root
touch .gitignore
```

### Common .gitignore Patterns

```gitignore
# Node.js
node_modules/
npm-debug.log
.env
.env.local

# Python
__pycache__/
*.pyc
*.pyo
venv/
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store          # macOS
Thumbs.db          # Windows
desktop.ini

# Build outputs
dist/
build/
*.min.js

# Secrets (VERY IMPORTANT)
*.pem
*.key
config/secrets.yml
```

### Rules
- `*.log` — ignore all .log files
- `build/` — ignore entire build directory
- `!important.log` — but DON'T ignore this specific log file
- `**/logs` — ignore "logs" folder anywhere in the project

### Ignore a file that's already tracked

```bash
# First add it to .gitignore, then remove from Git tracking:
git rm --cached filename.txt
git commit -m "chore: stop tracking config file"
```

Use the GitHub template: [https://github.com/github/gitignore](https://github.com/github/gitignore) for language-specific `.gitignore` files.

---

## 17. Git Log & Inspecting History

```bash
# See commit history
git log

# Compact one-line view
git log --oneline

# Show graph with branches
git log --oneline --graph --all

# Show last 5 commits
git log -5

# Show commits by a specific author
git log --author="Raj"

# Show commits that changed a specific file
git log -- src/payment.js

# Show what changed in each commit
git log -p

# Show a specific commit's details
git show a3f4bc1
```

### git diff — See What Changed

```bash
# See unstaged changes (working dir vs staging area)
git diff

# See staged changes (staging area vs last commit)
git diff --staged
# or
git diff --cached

# Compare two branches
git diff main feature-login

# Compare two commits
git diff a3f4bc1 d7e8f9g

# Compare a specific file between branches
git diff main feature-login -- src/auth.js
```

### git blame — See Who Changed Each Line

```bash
git blame src/auth.js
# Shows each line with: commit hash | author | date | code
```

---

## 18. Advanced Commands

### cherry-pick — Apply a specific commit to another branch

```bash
# You want one commit from feature branch, not the whole branch
git cherry-pick a3f4bc1
```

**Use case:** A bug fix was made on a feature branch but you need it on main right away, without merging the whole feature.

### git bisect — Find which commit introduced a bug

```bash
git bisect start
git bisect bad               # current commit is broken
git bisect good v1.0.0       # this version was fine

# Git checks out a commit in the middle
# You test it...
git bisect good    # or: git bisect bad

# Repeat until Git finds the exact commit that broke things
git bisect reset   # when done
```

### git reflog — Your Safety Net

`git reflog` records every time HEAD moved. Even after a hard reset, you can recover commits.

```bash
git reflog
# Shows:
# a3f4bc1 HEAD@{0}: reset: moving to HEAD~3
# d7e8f9g HEAD@{1}: commit: Add payment feature
# ...

# Recover the "lost" commit
git reset --hard d7e8f9g
```

### Worktrees — Multiple branches open simultaneously

```bash
# Check out a branch in a separate folder without leaving your current branch
git worktree add ../hotfix-branch hotfix-branch

cd ../hotfix-branch     # separate working copy
# fix the bug
# ... without interrupting your main work
```

---

## 19. Common Mistakes & Fixes

### "I accidentally committed to main instead of my feature branch"

```bash
# Create the branch you meant to commit to
git branch feature-oops

# Remove the commit from main (keep changes staged)
git reset --soft HEAD~1

# Switch to the correct branch (your commit is staged)
git switch feature-oops
git commit -m "Your message"    # now commit here
```

### "I committed a password/secret key"

```bash
# 1. Remove it immediately
git rm config.js
echo "config.js" >> .gitignore
git commit -m "Remove secrets"
git push

# 2. IMMEDIATELY revoke and regenerate the secret key (it's already in history)
# 3. To remove from history entirely:
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch config.js' HEAD

# Or use the modern tool:
# https://github.com/newren/git-filter-repo
```

### "I want to undo my last push to GitHub"

```bash
# Reset locally
git reset --hard HEAD~1

# Force push (DANGEROUS if others have pulled)
git push --force origin main

# Safer: use --force-with-lease (fails if someone pushed after you)
git push --force-with-lease origin main
```

### "My push was rejected"

```
! [rejected] main -> main (fetch first)
```

```bash
# Someone pushed before you. Pull first, then push.
git pull origin main
# resolve any conflicts
git push origin main
```

### "I deleted a branch I needed"

```bash
git reflog | grep "branch-name"
# Find the commit hash
git checkout -b recovered-branch a3f4bc1
```

---

## 20. Cheat Sheet

```
SETUP
git config --global user.name "Name"      Set your name
git config --global user.email "e@mail"   Set your email

START
git init                   Initialize new repo
git clone <url>            Download a repo

DAILY
git status                 Check current state
git add <file>             Stage specific file
git add .                  Stage all changes
git commit -m "msg"        Save snapshot
git push                   Upload to GitHub
git pull                   Download + merge

BRANCHING
git branch                 List branches
git switch -c <name>       Create + switch branch
git switch <name>          Switch branch
git merge <branch>         Merge branch
git branch -d <name>       Delete branch

REMOTE
git remote -v              Show remotes
git fetch origin           Download (no merge)
git push -u origin main    Push & set tracking

UNDO
git restore <file>         Discard file changes
git restore --staged <f>   Unstage a file
git reset --soft HEAD~1    Undo commit (keep staged)
git reset --hard HEAD~1    Undo commit (delete changes)
git revert <hash>          Create undo-commit (safe)

INSPECT
git log --oneline          Compact history
git log --oneline --graph  History with branch graph
git diff                   Unstaged changes
git diff --staged          Staged changes
git show <hash>            Show a commit

STASH
git stash                  Save dirty state
git stash pop              Restore saved state
git stash list             Show all stashes

TAGS
git tag -a v1.0 -m "msg"   Create annotated tag
git push origin --tags     Push all tags
```

---

## 21. Real Life Practical Example (Enterprise)

Let's imagine you are working at **StreamFlix**, a large enterprise video streaming platform. Hundreds of developers are pushing code daily. Here are 5 real-world scenarios you will encounter and how to handle them like a pro.

### Scenario 1: The "Wrong Deployment" Panic
**The Situation:** You just merged a PR and it automatically deployed to Production. Suddenly, users are reporting that the video player is crashing! You need to roll back the changes immediately without breaking the Git history.

**The Fix (Revert):**
Never use `git reset` on the main branch, as it rewrites shared history and will cause conflicts for everyone. Instead, use `git revert` to create a *new* commit that perfectly undoes the bad commit.
```bash
# 1. Find the bad commit hash (e.g., a1b2c3d)
git log --oneline

# 2. Revert it (this opens your editor to confirm the revert message)
git revert a1b2c3d

# 3. Push the fix to main immediately
git push origin main
```

### Scenario 2: The Urgent Hotfix (Stash)
**The Situation:** You are deep into building a complex `recommendation-engine` feature. Your code is broken and not ready to commit. Suddenly, your manager tells you there is a critical typo on the login page that needs fixing *right now*.

**The Fix (Stash):**
```bash
# 1. Stash your half-done recommendation engine work
git stash save "WIP: recommendation engine"

# 2. Switch to main and create a hotfix branch
git switch main
git pull origin main
git switch -c hotfix-login-typo

# 3. Fix the typo, commit, and push
git add login.jsx
git commit -m "fix: resolve typo on login screen"
git push -u origin hotfix-login-typo

# 4. Switch back to your feature and restore your work
git switch feature-recommendation-engine
git stash pop
```

### Scenario 3: Stealing a Single Commit (Cherry-Pick)
**The Situation:** A teammate created a branch with 10 commits. Commit #4 contains a crucial security patch that you need in your branch right now. You don't want the other 9 commits.

**The Fix (Cherry-Pick):**
```bash
# 1. Get the hash of the specific security patch commit (e.g., 9f8e7d6)
# 2. While on your branch, cherry-pick it:
git cherry-pick 9f8e7d6

# Git will pull ONLY that commit's changes into your current branch.
```

### Scenario 4: Cleaning Up a Messy PR (Interactive Rebase)
**The Situation:** You opened a Pull Request for a new feature. You have 15 commits with terrible messages like "wip", "fixed bug", "forgot comma", "updated tests". The Senior Engineer tells you to "squash your commits" before merging.

**The Fix (Interactive Rebase):**
```bash
# 1. Start an interactive rebase for the last 15 commits
git rebase -i HEAD~15

# 2. An editor opens. Leave the first commit as 'pick'. 
# Change 'pick' to 'squash' (or 's') for the other 14 commits.
# 3. Save and close. Git will ask you to write one clean commit message for the combined code.

# 4. Force push to your feature branch (since you rewrote its history)
git push --force origin feature-branch
```

### Scenario 5: Accidentally Committing to Main
**The Situation:** You started typing code, made a commit, and then realized you were on the `main` branch instead of a new feature branch!

**The Fix (Soft Reset):**
```bash
# 1. Create the branch you meant to use
git branch feature-new-dashboard

# 2. Remove the commit from main, but KEEP the changes in staging
git reset --soft HEAD~1

# 3. Switch to your new branch
git switch feature-new-dashboard

# 4. Commit your staged changes properly!
git commit -m "feat: add new dashboard"
```

### Scenario 6: The "Who Broke It and When?" Mystery (Bisect)
**The Situation:** A feature was working perfectly last week, but today it is throwing an error. There have been 50 commits from 10 different developers since then, and you have no idea which commit introduced the bug.

**The Fix (Bisect):**
Git bisect does a binary search through your commits, helping you find the exact broken commit in just a few steps.
```bash
git bisect start
git bisect bad               # Mark the current broken state
git bisect good v1.5.0       # Mark the last known working tag/commit

# Git will now checkout a commit halfway in between. You test the app...
# If it's broken:
git bisect bad
# If it works:
git bisect good

# Repeat 4-5 times until Git says: "Commit 8f4e2d is the first bad commit."
git bisect reset             # End the bisect session
```

### Scenario 7: The "Oops, I Deleted My Branch" Disaster (Reflog)
**The Situation:** You accidentally deleted your local feature branch before pushing it to GitHub. You think weeks of work are gone forever.

**The Fix (Reflog):**
Git secretly records *every* move HEAD makes, even if a branch is deleted.
```bash
# 1. View the hidden log of all your actions
git reflog

# 2. Look for the commit hash right before you deleted it (e.g., c9b8a7f)
# 3. Recreate the branch from that exact ghost commit!
git branch recovered-feature c9b8a7f
```

### Scenario 8: The "I Forgot to Add a File" Mistake (Amend)
**The Situation:** You just wrote a beautiful, detailed commit message. Right after hitting enter, you realize you forgot to stage `config.js`. You don't want an embarrassing follow-up commit just for one file.

**The Fix (Amend):**
```bash
# 1. Stage the forgotten file
git add config.js

# 2. Add it to the PREVIOUS commit without changing the message
git commit --amend --no-edit

# Note: Only do this if you haven't pushed the commit to remote yet!
```

### Scenario 9: The Context Switching Nightmare (Worktree)
**The Situation:** You are running a heavy local dev server for the `billing-api` branch. Your boss asks you to do an urgent code review for the `ui-redesign` branch. If you switch branches normally, it will break your dev server and force a huge rebuild.

**The Fix (Worktree):**
```bash
# 1. Check out the UI branch into a completely separate folder alongside your current one!
git worktree add ../ui-review ui-redesign

# 2. Open a new terminal in the `ui-review` folder. 
# You can now test the UI branch without touching your billing-api server!

# 3. When you're done reviewing, simply delete the folder and remove the worktree:
git worktree remove ../ui-review
```

### Scenario 10: The Secret Key Leak (Rm Cached)
**The Situation:** You realized an `.env` file containing production database passwords was accidentally committed and is being tracked by Git. You need Git to forget about it, but you *don't* want to delete the actual `.env` file from your computer.

**The Fix (Rm Cached):**
```bash
# 1. Tell Git to stop tracking the file, but keep it on your disk
git rm --cached .env

# 2. Make sure it's added to .gitignore!
echo ".env" >> .gitignore

# 3. Commit the removal
git commit -m "chore: remove .env from tracking"
```

### Scenario 11: The Safe Force Push (Force-With-Lease)
**The Situation:** You squashed your commits locally and need to force push to your remote feature branch. But wait! What if a teammate pushed some code to that exact branch 5 minutes ago? A standard `--force` push would silently overwrite and delete their work.

**The Fix (Force-With-Lease):**
```bash
# Force push securely. If the remote branch has new commits you haven't seen, 
# Git will ABORT the push and protect your teammate's work.
git push --force-with-lease origin feature-branch
```

### Scenario 12: The Finger Pointing Game (Blame)
**The Situation:** You found a terrifyingly bad, uncommented line of code in the core payment module. You need to know exactly who wrote it and what the PR context was.

**The Fix (Blame):**
```bash
# See the author, timestamp, and commit hash for EVERY line in a file
git blame src/payment-module.js

# To view blame for a specific line range (e.g., lines 40 to 50):
git blame -L 40,50 src/payment-module.js
```

### Scenario 13: The "Burn It With Fire" Reset (Hard Reset & Clean)
**The Situation:** You tried experimenting with a new library, modified 30 files, created 10 new random files, and everything is completely broken. You just want to destroy all local changes and go back to the last clean commit.

**The Fix (Hard Reset & Clean):**
```bash
# 1. Destroy all modified tracked files
git reset --hard HEAD

# 2. Destroy all untracked (new) files and directories
git clean -fd
```

### Scenario 14: The "What Did I Actually Do?" Check (Diff)
**The Situation:** You ran `git add .` to stage 5 files. Right before you type `git commit`, you get paranoid and want to review the exact lines of code you are about to save to history.

**The Fix (Diff Staged):**
```bash
# Normal 'git diff' only shows UNSTAGED changes. 
# To see what is already sitting in the staging area:
git diff --staged
```

### Scenario 15: Tagging a Golden Release (Tag)
**The Situation:** The QA team has approved the `main` branch. It is stable, tested, and ready for production deployment. You need a permanent marker in Git history so you can easily deploy or roll back to this exact state later.

**The Fix (Tag):**
```bash
# 1. Create an annotated tag (includes a message and author data)
git tag -a v2.0.0 -m "Production release: New Video Player"

# 2. Tags are not pushed by default! You must push them explicitly:
git push origin v2.0.0
# Or push all local tags:
git push origin --tags
```

### Scenario 16: The "Keep the Feature Context" Merge (No Fast-Forward)
**The Situation (Interview Question):** "How do you preserve the fact that a feature branch existed after merging, even if a fast-forward merge is possible?"
**The Fix (--no-ff):**
By default, if `main` hasn't changed, Git flattens the history (fast-forward). To force a "bubble" in the commit graph that clearly shows where the feature started and ended:
```bash
# Force a merge commit even if fast-forward is possible
git merge --no-ff feature-new-ui
```

### Scenario 17: The "Messy Branch, Clean Merge" (Squash)
**The Situation (Interview Question):** "How do you combine all commits from a feature branch into a single clean commit directly onto the main branch without doing an interactive rebase?"
**The Fix (--squash):**
```bash
# 1. Pull the changes into staging, but DO NOT create a commit yet
git merge --squash feature-wip-branch

# 2. Now you have all the code staged. Commit it with one clean message!
git commit -m "feat: complete entire WIP feature"
```

### Scenario 18: The Dreaded Merge Conflict (Manual Resolve)
**The Situation (Interview Question):** "Walk me through exactly what you do when Git says 'CONFLICT (content): Merge conflict in Navbar.js'."
**The Fix (Resolve & Commit):**
```bash
# 1. Open the file. Git adds markers (<<<<<<< HEAD, =======, >>>>>>>)
# 2. Manually delete the markers and keep the code you actually want.
# 3. Tell Git you have resolved it by staging the file:
git add Navbar.js

# 4. Finalize the merge
git commit -m "Merge: resolve conflict in Navbar"
```

### Scenario 19: The "No Extra Merge Commits" Update (Pull Rebase)
**The Situation (Interview Question):** "How do you avoid the useless 'Merge branch main into feature' clutter commits when syncing with remote?"
**The Fix (Pull Rebase):**
When multiple people push to the same branch, `git pull` creates a merge commit. To keep a clean linear history instead:
```bash
# Fetch the remote changes and replay your local commits on top of them
git pull --rebase origin main
```

### Scenario 20: The "I Liked It Better Yesterday" File Recovery (Restore Source)
**The Situation (Interview Question):** "How do you restore a *single file* to its exact state from 5 commits ago, without affecting any other files or reverting the whole branch?"
**The Fix (Restore Source):**
```bash
# 1. Find the hash of the older commit where the file was good (e.g., 5a4b3c2)
# 2. Restore ONLY that specific file from that specific commit
git restore --source=5a4b3c2 database.js

# The older version of the file is now in your working directory. Stage and commit it!
git add database.js
git commit -m "fix: restore database.js to older working version"
```

### Scenario 21: The Rebase Conflict Nightmare
**The Situation:** You are rebasing a feature branch with 5 commits on top of `main`. During the rebase, Git stops and says "CONFLICT". You fix it, but then it stops again on the next commit!
**The Fix (Rebase Continue):**
Unlike a merge conflict (which happens all at once), a rebase conflict happens *commit by commit* as Git replays them.
```bash
# 1. Open the conflicted file and resolve the conflict manually.
# 2. Stage the resolved file:
git add conflicting_file.js

# 3. DO NOT run 'git commit'. Instead, tell Git to continue replays:
git rebase --continue

# 4. If a commit becomes empty because the changes were already applied, skip it:
git rebase --skip
```

### Scenario 22: The "Just Trust Them" Conflict Resolution
**The Situation:** You are merging `main` into your branch. There are 50 conflicts in `package-lock.json` or a generated build file. You know for a fact that the `main` branch version is 100% correct, and you just want to discard your local changes for that file.
**The Fix (Checkout --theirs):**
Instead of manually opening the file and deleting your markers, tell Git to auto-accept the incoming changes.
```bash
# Accept the incoming changes from the branch being merged IN
git checkout --theirs package-lock.json

# If you wanted to keep YOUR local changes instead:
# git checkout --ours package-lock.json

# Stage and commit
git add package-lock.json
git commit -m "Merge main, favoring incoming package-lock"
```

### Scenario 23: The Stash Pop Conflict
**The Situation:** You stashed some work a week ago. You've made many changes since then. When you run `git stash pop`, Git yells: "Merge conflict in styles.css". The stash is NOT removed from your stash list because it failed to apply cleanly.
**The Fix:**
```bash
# 1. Resolve the conflict in styles.css manually just like a normal merge.
# 2. Stage the file to mark it as resolved:
git add styles.css

# 3. Since the stash failed to 'pop' (remove itself) due to the conflict, 
# you must manually drop it now that you've saved the code:
git stash drop stash@{0}
```

### Scenario 24: The "Deleted vs Modified" Conflict
**The Situation:** You spent all day heavily modifying `utils.js` on your feature branch. Meanwhile, a senior dev on the `main` branch completely DELETED `utils.js` and moved the logic elsewhere. When you merge, Git throws a "modify/delete conflict".
**The Fix:**
Git asks you: Do you want to keep your modified file, or respect the deletion?
```bash
# Option A: Keep your heavily modified file (ignore the deletion)
git add utils.js

# Option B: Respect the senior dev's decision and delete it
git rm utils.js

# Finalize the merge
git commit -m "Merge main, resolving modify/delete conflict by keeping/deleting utils.js"
```

### Scenario 25: The "Get Me Out of Here!" Panic Button
**The Situation:** You initiated a `git merge` or `git rebase` and suddenly hundreds of files are in conflict. You are overwhelmed, don't understand the changes, and need to back out before you break everything.
**The Fix (Abort):**
You can completely cancel the operation and return to the exact state you were in before you typed the command.
```bash
# If you were in the middle of a bad MERGE:
git merge --abort

# If you were in the middle of a bad REBASE:
git rebase --abort

# Phew! Your files are back to normal. Now go ask for help.
```


## 22. 25 Common Git & GitHub Interview Questions

1. **What is Git?**  
   *Answer:* Git is a distributed version control system that tracks changes in source code during software development. It allows multiple developers to work together non-linearly.

2. **What is the difference between Git and GitHub?**  
   *Answer:* Git is the local version control software installed on your computer. GitHub is a cloud-based platform that hosts Git repositories and provides collaboration tools (PRs, Issues, Actions).

3. **What is a commit in Git?**  
   *Answer:* A commit is a snapshot of your repository at a specific point in time. It saves the changes you staged along with a message, author, and timestamp.

4. **What is a branch?**  
   *Answer:* A branch is an independent line of development. It acts as a pointer to a specific commit, allowing you to work on features without affecting the `main` codebase.

5. **What is the difference between `git pull` and `git fetch`?**  
   *Answer:* `git fetch` downloads new data from a remote repository but doesn't integrate it into your working files. `git pull` does a fetch AND immediately merges the downloaded changes into your current branch.

6. **What is the difference between `git merge` and `git rebase`?**  
   *Answer:* Both integrate changes from one branch into another. `merge` creates a new "merge commit" tying the histories together, preserving exact history. `rebase` moves the entire feature branch to begin on the tip of the target branch, creating a clean, linear history but rewriting commit hashes.

7. **What is a merge conflict and how do you resolve it?**  
   *Answer:* A conflict occurs when Git cannot automatically merge changes (e.g., two people edited the same line). You resolve it by manually opening the file, choosing the correct code, deleting the Git markers (`<<<<<<<`), and committing the resolved file.

8. **What does `git clone` do?**  
   *Answer:* It creates a local copy of a remote repository, including all files, branches, and commit history.

9. **What is the difference between a local and remote repository?**  
   *Answer:* A local repository resides on your computer. A remote repository is hosted on a server (like GitHub) and is used to share and sync code with others.

10. **What is `HEAD` in Git?**  
    *Answer:* `HEAD` is a pointer that indicates your current working commit or branch. It usually points to the latest commit of the branch you are currently on.

11. **What is a "detached HEAD" state?**  
    *Answer:* It happens when you checkout a specific commit hash instead of a branch name. You are no longer on any branch. Any commits made here will be orphaned when you switch away, unless you create a new branch.

12. **How do you undo a commit?**  
    *Answer:* Use `git reset HEAD~1` to undo locally and keep changes. Use `git revert <hash>` to create a new commit that undoes the changes (safe for shared branches).

13. **What is `git stash`?**  
    *Answer:* It temporarily shelves (saves) changes you've made to your working directory so you can work on something else, and then re-apply them later.

14. **How do you view commit history?**  
    *Answer:* Using `git log`. You can use `git log --oneline` for a compact view.

15. **What is a Pull Request (PR)?**  
    *Answer:* A GitHub feature where you notify team members that you have pushed a feature to a remote branch. It provides a forum for code review and discussion before merging it into the main branch.

16. **What is the difference between Fork and Clone?**  
    *Answer:* A clone is a local copy of a repository. A fork is a remote, personal copy of someone else's repository on your GitHub account, usually used to contribute to open source.

17. **What is `git cherry-pick`?**  
    *Answer:* A command that allows you to pick a specific commit from one branch and apply its changes onto your current branch.

18. **Explain the three areas of Git.**  
    *Answer:* 1. Working Directory (files on your computer). 2. Staging Area/Index (files marked to go into the next commit). 3. Repository (the `.git` folder containing saved commits).

19. **How do you delete a branch?**  
    *Answer:* Locally: `git branch -d <branch_name>`. Remotely: `git push origin --delete <branch_name>`.

20. **What is `git commit --amend`?**  
    *Answer:* It modifies the most recent commit. It can be used to change the commit message or add forgotten files to the last commit without creating a new one.

21. **What is `.gitignore`?**  
    *Answer:* A text file where you list files and directories that Git should completely ignore and never track (e.g., `node_modules`, `.env`).

22. **How do you find a bug using Git?**  
    *Answer:* Use `git bisect`, which uses a binary search algorithm to quickly find which commit in history introduced a bug.

23. **What is the difference between `git reset --soft`, `--mixed`, and `--hard`?**  
    *Answer:* `--soft` undoes the commit but leaves changes staged. `--mixed` (default) undoes the commit and leaves changes unstaged in the working directory. `--hard` undoes the commit and completely deletes all changes.

24. **What are Git tags?**  
    *Answer:* Tags are reference points to specific points in Git history. They are typically used to mark release points (e.g., `v1.0.0`).

25. **You made changes on `main` but meant to make them on a new feature branch. How do you fix it without losing work?**  
    *Answer:* Create the new branch (`git branch feature`), reset main back one commit (`git reset --soft HEAD~1`), switch to the new branch (`git switch feature`), and commit there.

---

## 23. 20 Tricky Git & GitHub Interview Questions

1. **If I delete a local branch using `git branch -D`, are the commits on that branch deleted immediately?**  
   *Answer:* No. The commits become "dangling" or "orphaned" because no branch points to them anymore. They remain in the `.git` folder until Git's garbage collection runs (usually 30 days). They can be recovered using `git reflog`.

2. **You accidentally ran `git reset --hard` and lost your unpushed commits. Can you get them back?**  
   *Answer:* Yes, using `git reflog`. Reflog tracks every time HEAD moves. You can find the hash of the lost commit in the reflog and do `git reset --hard <lost-hash>` to get it back.

3. **Can you commit an empty directory in Git?**  
   *Answer:* No. Git tracks file content, not directories. To commit an empty directory, you must place a hidden file inside it, typically named `.gitkeep`.

4. **How do you merge a specific file from another branch without merging the entire branch?**  
   *Answer:* Use `git checkout`. While on your current branch, run: `git checkout source-branch -- path/to/file.txt`. This brings the file from the source branch into your working directory.

5. **You amended a commit and force-pushed it. A teammate had already pulled the old commit. What happens when they try to pull again?**  
   *Answer:* Their local Git will try to merge the old commit with your newly rewritten commit, resulting in messy duplicate commits or conflicts. Never amend or rebase commits that others have pulled.

6. **What is the difference between `HEAD~2` and `HEAD^2`?**  
   *Answer:* `HEAD~2` means "go back 2 generations following the first parent" (the commit before the commit before HEAD). `HEAD^2` means "the second parent of the current commit" (only applicable to merge commits, which have multiple parents).

7. **How do you create a commit that contains absolutely no changes?**  
   *Answer:* Run `git commit --allow-empty -m "empty commit"`. This is sometimes used to trigger CI/CD pipelines.

8. **You have 5 untracked files in your directory. You run `git reset --hard`. What happens to those 5 files?**  
   *Answer:* Nothing. `git reset --hard` only affects files that Git is tracking. Untracked files are ignored by this command. (To remove them, you need `git clean -fd`).

9. **How do you change the author of a commit deep in the history?**  
   *Answer:* You must do an interactive rebase (`git rebase -i`). Mark the commit as `edit`, then run `git commit --amend --author="New Name <email@example.com>"`, and finally `git rebase --continue`.

10. **Can you squash commits after they have been merged to `main` and pushed?**  
    *Answer:* Technically yes, but you absolutely shouldn't. Squashing rewrites history. If you force-push rewritten history to `main`, you will break the repository for every other developer.

11. **When you run `git fetch`, where do the downloaded commits go if they aren't merged?**  
    *Answer:* They are stored in your local repository under "remote-tracking branches" (e.g., `origin/main`). You can inspect them by checking out `origin/main` before merging them into your local `main`.

12. **How do you rename a local branch and push the new name to the remote?**  
    *Answer:* First, rename locally: `git branch -m old-name new-name`. Second, delete the old remote branch: `git push origin --delete old-name`. Finally, push the new branch: `git push -u origin new-name`.

13. **What happens if you add `.gitignore` to the `.gitignore` file?**  
    *Answer:* Git will stop tracking *future* changes to the `.gitignore` file itself, but the current `.gitignore` rules will still apply. (This is generally a bad practice).

14. **What's the difference between `git merge --squash` and squashing via `git rebase -i`?**  
    *Answer:* `merge --squash` takes all commits from a feature branch and places them as a *single new commit* on the target branch without creating a merge tie. `rebase -i` rewrites the history of the feature branch itself to combine the commits *before* merging.

15. **Your `git push` is rejected because the remote has commits you don't have. You know their commits are wrong and you want your local branch to completely overwrite the remote. How?**  
    *Answer:* Use `git push --force` (or `--force-with-lease`). This tells the remote server to discard its history and exactly match your local history.

16. **You accidentally ran `git add .` and staged a massive 5GB video file. How do you unstage it without deleting it from your computer?**  
    *Answer:* Run `git restore --staged <video-file>` (or `git reset HEAD <video-file>`).

17. **Why is `git revert` preferred over `git reset` in a shared repository?**  
    *Answer:* `git reset` deletes commits from history. If someone else has already pulled those commits, it causes massive synchronization issues. `git revert` leaves the old commits untouched and simply adds a *new* commit that negates the changes, making it 100% safe to share.

18. **You pop a stash and it results in a merge conflict. After resolving it, the stash is still in your stash list. Why?**  
    *Answer:* `git stash pop` automatically drops the stash *only* if it applies cleanly. If there is a conflict, Git assumes you might need the stash again, so it keeps it. You must run `git stash drop` manually after resolving the conflict.

19. **How do you temporarily ignore changes to a file that is already tracked by Git (e.g., a local config file you tweaked)?**  
    *Answer:* Run `git update-index --assume-unchanged <file>`. Git will stop checking that file for modifications. (To track it again: `--no-assume-unchanged`).

20. **You create `feature-B` branching off `feature-A`. You merge `feature-A` into `main`. What happens to `feature-B`?**  
    *Answer:* `feature-B` still contains all the commits of `feature-A` plus its own commits. When you try to merge `feature-B` into `main`, Git is smart enough to see that the `feature-A` commits are already in `main`, and it will only apply the new commits unique to `feature-B`.

\n---

*Made with ❤️ by Shubham Gayke — These notes cover everything from absolute basics to real team workflows. Practice by building real projects — there's no better teacher than git-ing your hands dirty.*
