# Docker — Scenario-Based Learning Guide

> **How to use this document:** Each scenario is a realistic situation you'd actually face on the job (as a DevOps Engineer, Cloud Engineer, or Backend Developer). Read the **Question**, try to think through it yourself for 2 minutes, then read **"What this is really asking"** to understand the hidden concept being tested, then walk through the **Step-by-Step Solution**. Every command's flags are explained — nothing is left unexplained.
>
> The scenarios are ordered so concepts build on each other — don't skip Part 1.

---

# Part 1 — Docker Fundamentals (Containers vs Images)

## Scenario 1: "It works on my machine" problem

**The Question:**
Your team lead says: *"Every new developer spends half a day just installing Node.js, the right Python version, and 10 other dependencies before they can even run our app. New developers always say it 'worked on their machine' differently than on the server. Fix this onboarding problem using Docker."*

**What this is really asking:**
This tests whether you understand the *core reason Docker exists* — not the commands yet, just the concept. Docker packages an application **with its entire environment** (OS libraries, runtime, dependencies) into one unit called an **image**, so it behaves identically everywhere — your laptop, a teammate's laptop, or a production server.

**Key concept — Image vs Container:**
| Term | Meaning |
|---|---|
| **Image** | A read-only blueprint/template (like a class in programming, or a "recipe"). Built once. |
| **Container** | A running (or stopped) **instance** of an image (like an object created from that class). You can run many containers from one image. |

**Step-by-Step Solution:**

1. **Check Docker is installed and working:**
   ```bash
   docker --version
   docker info
   ```
   - `docker --version` → confirms the Docker CLI is installed.
   - `docker info` → shows details about the Docker daemon (the background service actually running containers) — confirms it's running, shows OS, number of containers/images, storage driver, etc.

2. **Run the classic test container:**
   ```bash
   docker run hello-world
   ```
   - `docker run` → tells Docker: "create a container from this image and start it."
   - `hello-world` → a tiny official image. Docker will:
     1. Look for `hello-world` locally → not found.
     2. **Pull** it from Docker Hub (the default public registry, like "GitHub for images").
     3. Create a container from it and run it.
     4. The container prints a message, then **exits** (its job is done).

3. **Understand what just happened conceptually:**
   - The image = the company's onboarding problem, solved once.
   - Any new developer just runs `docker run <our-app-image>` instead of installing 10 tools manually.

**Why companies do this:**
This is the #1 real-world pitch for Docker in interviews and on the job: **environment consistency** across dev → staging → production, and **fast onboarding**. You'll be asked "why Docker over a VM?" — the answer: containers share the host OS kernel (lightweight, start in seconds), while VMs virtualize an entire OS (heavy, start in minutes).

---

## Scenario 2: Run a web server for a teammate to preview a site

**The Question:**
Your teammate built a static website and asks: *"Can you quickly host this so I can see it in my browser? I don't want to install Nginx on my laptop."*

**What this is really asking:**
Tests the most-used command of all: `docker run`, plus **port mapping** (connecting a container's internal network to your machine) and basic container lifecycle commands.

**Step-by-Step Solution:**

1. **Run an Nginx container in the background:**
   ```bash
   docker run -d -p 8080:80 --name my-website nginx
   ```
   - `-d` → "detached" mode: run in the background, give you back your terminal.
   - `-p 8080:80` → port mapping: `<host_port>:<container_port>`. Nginx listens on port `80` **inside** the container; this exposes it as `localhost:8080` on your machine.
   - `--name my-website` → gives the container a human-readable name instead of a random one like `affectionate_turing`.
   - `nginx` → the image to use (pulled automatically from Docker Hub if not present locally).

2. **Verify it's running:**
   ```bash
   docker ps
   ```
   - Lists all **running** containers, with columns: Container ID, Image, Command, Created, Status, Ports, Names.
   - To see **all** containers including stopped ones: `docker ps -a`

3. **View it in the browser:** open `http://localhost:8080`

4. **Check the container's logs (if something looks wrong):**
   ```bash
   docker logs my-website
   ```
   - Shows everything the container printed to stdout/stderr — your first debugging step, always.
   - Add `-f` to "follow" logs live: `docker logs -f my-website`

5. **Stop and remove it once done:**
   ```bash
   docker stop my-website
   docker rm my-website
   ```
   - `stop` → sends a graceful shutdown signal (SIGTERM, then SIGKILL after a timeout).
   - `rm` → deletes the stopped container. (A stopped container still exists on disk until removed.)
   - Shortcut for both: `docker rm -f my-website` (force remove, even if running).

**Why companies do this:**
This exact pattern (`docker run -d -p ... --name ...`) is how 90% of quick local testing happens — spinning up databases, caches, or services someone needs "just to check something" without installing anything permanently.

---

## Scenario 3: Need an isolated Node.js version different from what's on your laptop

**The Question:**
Your laptop has Node.js 18 installed globally, but a legacy project requires Node.js 14, and you can't risk breaking your other projects by changing your global Node version.

**What this is really asking:**
Tests `docker run -it` (interactive mode) and the difference between **running a command** vs **getting a shell inside a container** — a daily-use skill for debugging and experimentation.

**Step-by-Step Solution:**

1. **Pull a specific version tag:**
   ```bash
   docker pull node:14
   ```
   - `docker pull` → downloads the image without running it.
   - `node:14` → `<image_name>:<tag>`. The tag specifies the version. No tag = defaults to `:latest`.

2. **List local images to confirm:**
   ```bash
   docker images
   ```
   - Shows: Repository, Tag, Image ID, Created, Size — all images stored locally.

3. **Open an interactive shell inside a Node 14 container:**
   ```bash
   docker run -it --rm node:14 bash
   ```
   - `-it` → two flags combined: `-i` (interactive, keep STDIN open) + `-t` (allocate a pseudo-terminal so it feels like a real shell).
   - `--rm` → automatically delete the container the moment it exits (great for throwaway/testing containers — keeps your system clean).
   - `bash` → overrides the image's default command, instead dropping you into a bash shell.

4. **Inside the container, confirm the version:**
   ```bash
   node -v
   # v14.x.x
   ```
   - You're now in a fully isolated Linux environment with only Node 14 — your host machine is untouched.

5. **Mount your project folder so you can actually work on real files (covered fully in Scenario 12), quick preview:**
   ```bash
   docker run -it --rm -v $(pwd):/app -w /app node:14 bash
   ```
   - `-v $(pwd):/app` → mounts your current host folder into `/app` inside the container.
   - `-w /app` → sets `/app` as the working directory when the container starts.

**Why companies do this:**
Running multiple language/runtime versions side-by-side without "version manager" tools (like nvm) is a constant real use case — especially for legacy systems, client demos, or testing compatibility.

---

## Scenario 4: A container keeps crashing immediately after starting

**The Question:**
You run `docker run my-app` and the container exits within 1 second every time, with no clear error on your screen. Your manager asks you to find out why.

**What this is really asking:**
This is a **debugging scenario** — one of the most commonly asked in interviews ("how do you debug a crashing container?"). Tests `docker logs`, `docker ps -a`, `docker inspect`, and `docker exec`.

**Step-by-Step Solution:**

1. **List all containers (including stopped/exited ones):**
   ```bash
   docker ps -a
   ```
   - Look at the `STATUS` column — e.g. `Exited (1) 5 seconds ago`. The number in parentheses is the **exit code**.
   - Exit code `0` = clean exit. Non-zero (`1`, `137`, etc.) = something went wrong.

2. **Read the logs of the dead container:**
   ```bash
   docker logs <container_id_or_name>
   ```
   - Even though the container is stopped, its logs persist until you `docker rm` it. This usually shows the actual error (e.g., "Error: missing environment variable DB_HOST").

3. **Inspect full metadata about the container:**
   ```bash
   docker inspect <container_id_or_name>
   ```
   - Returns a large JSON blob: exit code, mounted volumes, network settings, environment variables, the exact command that ran, restart policy, etc.
   - In practice you filter it, e.g.:
     ```bash
     docker inspect --format='{{.State.ExitCode}}' my-app
     ```

4. **If logs aren't enough — override the entrypoint to get a shell instead of letting it crash:**
   ```bash
   docker run -it --entrypoint bash my-app
   ```
   - `--entrypoint bash` → ignores the image's normal startup command and drops you into a shell so you can manually run the app's start command and watch it fail in real time, or check if config files/env vars exist.

5. **If the container IS still running (e.g., crash-looping with a restart policy) and you need to peek inside live:**
   ```bash
   docker exec -it <container_id_or_name> bash
   ```
   - `docker exec` → runs an **additional** command inside an **already running** container (different from `docker run`, which creates a *new* container). This is your go-to for "let me poke around inside a live container."

**Why companies do this:**
This exact troubleshooting flow (`ps -a` → `logs` → `inspect` → `exec`) is what you'll do daily once Docker is in production. Interviewers love asking "container won't start, what do you check first?" — your answer should be this exact sequence.

---

## Scenario 5: Your laptop is running out of disk space

**The Question:**
Docker has been used for months. Your disk is almost full. Your manager says: *"Clean up Docker but don't delete anything we still need."*

**What this is really asking:**
Tests your knowledge of how Docker accumulates leftover data (stopped containers, unused images, dangling layers, unused volumes/networks) and the cleanup commands — a real recurring maintenance task.

**Step-by-Step Solution:**

1. **See what's taking up space:**
   ```bash
   docker system df
   ```
   - Shows a summary table: Images, Containers, Local Volumes, Build Cache — and reclaimable space for each.

2. **Remove stopped containers:**
   ```bash
   docker container prune
   ```
   - Deletes **all stopped** containers. (Running containers are untouched.)

3. **Remove unused images:**
   ```bash
   docker image prune
   ```
   - By default removes only **dangling** images (untagged layers left over from rebuilds).
   - To remove **all** images not used by any container (more aggressive):
     ```bash
     docker image prune -a
     ```

4. **Remove unused volumes (be careful — this can delete data):**
   ```bash
   docker volume prune
   ```
   - Removes volumes not attached to any container. **Never run this blindly on a server with databases** — always check `docker volume ls` first.

5. **Nuclear option — clean everything unused at once:**
   ```bash
   docker system prune -a --volumes
   ```
   - `-a` → also remove unused images, not just dangling ones.
   - `--volumes` → also remove unused volumes.
   - Docker will show a confirmation prompt before deleting.

**Why companies do this:**
CI/CD build servers run hundreds of builds a day and fill disk with cached layers — this exact cleanup is often automated as a scheduled job (`docker system prune -af` in a cron/pipeline step).

---

# Part 2 — Building Custom Images (Dockerfile)

## Scenario 6: Package your own Flask app into an image

**The Question:**
You wrote a small Python Flask API. It currently only runs because you manually installed Python and `pip install`'d dependencies. Your manager wants it shipped as a Docker image so anyone can run it with one command.

**What this is really asking:**
This is the single most important Docker skill: **writing a Dockerfile** and building your own image, instead of just using pre-built ones. This is what companies actually pay engineers to do.

**Step-by-Step Solution:**

1. **Project structure (example):**
   ```
   my-flask-app/
   ├── app.py
   ├── requirements.txt
   └── Dockerfile
   ```

2. **Write the Dockerfile:**
   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   EXPOSE 5000

   CMD ["python", "app.py"]
   ```
   **Line-by-line explanation:**
   - `FROM python:3.11-slim` → the **base image**. Every Dockerfile starts here. `slim` is a smaller variant of the official Python image (fewer pre-installed OS packages → smaller, more secure image).
   - `WORKDIR /app` → sets `/app` as the working directory inside the image. All following instructions run relative to this path. Creates the folder if it doesn't exist.
   - `COPY requirements.txt .` → copies just the requirements file first (explained why in Scenario 7 — layer caching).
   - `RUN pip install --no-cache-dir -r requirements.txt` → `RUN` executes a command **during the build** (not at container start). `--no-cache-dir` keeps pip's download cache out of the image, reducing size.
   - `COPY . .` → copies the rest of your project (everything in the build context) into `/app`.
   - `EXPOSE 5000` → documentation only — tells humans/tools "this container listens on port 5000." It does **not** actually publish the port; that still requires `-p` at `docker run` time.
   - `CMD ["python", "app.py"]` → the default command run when a container **starts** (not during build). Written in "exec form" (JSON array) — the recommended form over the plain string form.

3. **Build the image:**
   ```bash
   docker build -t my-flask-app:1.0 .
   ```
   - `docker build` → builds an image from a Dockerfile.
   - `-t my-flask-app:1.0` → tags (names) the image as `my-flask-app` with version `1.0`. Without a tag, you'd only have a long hash to refer to it.
   - `.` → the **build context**: the current directory. Docker sends everything in this folder to the Docker daemon, so `COPY` instructions can find your files. (This is why a `.dockerignore` matters — Scenario 7.)

4. **Run a container from your new image:**
   ```bash
   docker run -d -p 5000:5000 my-flask-app:1.0
   ```

5. **Confirm the image exists locally:**
   ```bash
   docker images | grep my-flask-app
   ```

**Why companies do this:**
Literally every backend service at every company that uses Docker has a Dockerfile like this in its repo root. Interviewers will ask you to write one from memory — know `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD` cold.

---

## Scenario 7: Your image is 1.2GB — too big, slow to deploy

**The Question:**
A teammate built an image for a Node.js app and it's 1.2GB. Deployments are slow because pulling such a large image takes minutes. Your manager asks you to shrink it.

**What this is really asking:**
Tests **image size optimization** — multi-stage builds, choosing the right base image, layer ordering for caching, and `.dockerignore`. This is a very common senior-leaning interview question.

**Step-by-Step Solution:**

1. **Understand WHY images get big:**
   - Using a full OS base image (e.g., `node:18` is based on full Debian, ~900MB+) instead of a slim/alpine variant.
   - Build tools (compilers, dev dependencies) ending up in the final image even though they're only needed to *build* the app, not *run* it.
   - Copying unnecessary files (`.git`, `node_modules`, logs) into the image.

2. **Fix #1 — use a smaller base image:**
   ```dockerfile
   FROM node:18-alpine
   ```
   - Alpine Linux is a minimal distro (~5MB base) vs full Debian (~120MB+ base) — drastically smaller, though occasionally needs extra packages for native dependencies.

3. **Fix #2 — add a `.dockerignore` file** (same idea as `.gitignore`):
   ```
   node_modules
   .git
   .env
   npm-debug.log
   Dockerfile
   ```
   - Prevents these from being sent into the build context at all — faster builds, smaller risk of leaking secrets, no `node_modules` from your host OS polluting the Linux container.

4. **Fix #3 (the big one) — Multi-stage build:**
   ```dockerfile
   # ---- Stage 1: Build ----
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   # ---- Stage 2: Run (final image) ----
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY package*.json ./
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```
   **Explanation:**
   - `AS builder` → names the first stage "builder." This stage has all build tools, dev dependencies, and source code — it can be huge, but **it is thrown away**.
   - `COPY --from=builder /app/dist ./dist` → only copies the **compiled output** from the builder stage into the final, clean image.
   - The final image never contains your TypeScript source, dev dependencies, or build tools — only what's needed to *run* the app.
   - Result: an image that might shrink from 1.2GB → 150MB or less.

5. **Order instructions to maximize layer caching** (faster rebuilds, indirectly helps iteration speed):
   - Put things that **change rarely** (like `COPY package.json` + `RUN npm install`) **before** things that **change often** (like `COPY . .` for your source code).
   - Why: Docker caches each layer. If `package.json` hasn't changed, Docker reuses the cached `npm install` layer instead of re-running it — but only if nothing *above* it in the Dockerfile changed.

6. **Verify the size improvement:**
   ```bash
   docker images my-node-app
   ```

**Why companies do this:**
Smaller images = faster deploys, faster CI pipelines, smaller attack surface (security), and lower registry storage costs. Multi-stage builds are a top interview topic — be ready to write one from memory.

---

## Scenario 8: Same image, different config for dev/staging/production

**The Question:**
Your app needs a different API URL and log level depending on whether it's running in development, staging, or production — but your manager doesn't want three separate Dockerfiles or three separate images.

**What this is really asking:**
Tests the difference between **`ARG`** (build-time variable) and **`ENV`** (runtime environment variable) — a very commonly confused pair in interviews.

| | `ARG` | `ENV` |
|---|---|---|
| Available during | **Build** only | **Build AND runtime** (inside the running container) |
| Set via | `--build-arg` at `docker build` | `-e` at `docker run`, or `environment:` in Compose |
| Use case | Choosing a base image version, a build mode flag | App config the running app reads (DB host, API keys, log level) |

**Step-by-Step Solution:**

1. **Use `ARG` for build-time choices, `ENV` for runtime config:**
   ```dockerfile
   FROM node:18-alpine

   ARG BUILD_ENV=production
   ENV NODE_ENV=$BUILD_ENV
   ENV LOG_LEVEL=info

   WORKDIR /app
   COPY . .
   RUN npm install
   CMD ["node", "index.js"]
   ```
   - `ARG BUILD_ENV=production` → a variable only usable **during the build**, with a default value.
   - `ENV NODE_ENV=$BUILD_ENV` → "bakes" that build-time value into a **runtime** environment variable that the running app can read via `process.env.NODE_ENV`.

2. **Build a staging image by overriding the build arg:**
   ```bash
   docker build --build-arg BUILD_ENV=staging -t my-app:staging .
   ```

3. **Override actual runtime config without rebuilding, at `docker run` time:**
   ```bash
   docker run -e API_URL=https://staging-api.company.com -e LOG_LEVEL=debug my-app:staging
   ```
   - `-e` → sets/overrides an environment variable inside the container at runtime. No rebuild needed — same image, different behavior.

4. **For many variables, use an env file instead of many `-e` flags:**
   ```bash
   docker run --env-file .env.staging my-app:staging
   ```
   `.env.staging`:
   ```
   API_URL=https://staging-api.company.com
   LOG_LEVEL=debug
   ```

**Why companies do this:**
The golden rule in real companies: **build the image once, configure it differently per environment at runtime.** You almost never rebuild an image just to change a config value — that defeats the purpose of "build once, run anywhere."

---

## Scenario 9: Share your image with the team / deploy it to a server

**The Question:**
You've built `my-app:1.0` locally. Now another engineer, and eventually a production server, need to run the exact same image — without rebuilding it from source.

**What this is really asking:**
Tests **registries** — the "GitHub for images" concept. Tests `docker tag`, `docker push`, `docker pull`, `docker login`, and awareness of private registries (like AWS ECR) vs Docker Hub.

**Step-by-Step Solution:**

1. **Understand the naming convention for a registry:**
   ```
   <registry_host>/<namespace_or_username>/<image_name>:<tag>
   ```
   - If you omit `<registry_host>`, Docker assumes **Docker Hub**.
   - For AWS ECR (Elastic Container Registry), it looks like: `123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.0`

2. **Log in to the registry:**
   ```bash
   docker login
   ```
   - Prompts for username/password (or token). For Docker Hub by default; pass a registry URL for private ones: `docker login myregistry.com`
   - For AWS ECR specifically (common in real jobs):
     ```bash
     aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
     ```

3. **Tag your local image to match the registry's required naming:**
   ```bash
   docker tag my-app:1.0 yourusername/my-app:1.0
   ```
   - `docker tag` doesn't create a new image — it creates an additional **name/alias** pointing to the same image ID. You can have many tags pointing to one image.

4. **Push it to the registry:**
   ```bash
   docker push yourusername/my-app:1.0
   ```
   - Uploads the image layers to the registry. Layers already present in the registry (from a previous push) are skipped — another benefit of Docker's layer system.

5. **On another machine (or the server), pull and run it:**
   ```bash
   docker pull yourusername/my-app:1.0
   docker run -d -p 80:5000 yourusername/my-app:1.0
   ```

6. **Tagging strategy used in real teams (important interview point):**
   - Never deploy using `:latest` in production — it's ambiguous and not reproducible.
   - Common real strategy: tag with the **git commit SHA** or a semantic version:
     ```bash
     docker build -t yourusername/my-app:a1b2c3d .
     docker tag yourusername/my-app:a1b2c3d yourusername/my-app:v1.4.2
     ```

**Why companies do this:**
This `tag → push → pull` flow is the direct equivalent of `git commit → push → pull` in your Git knowledge — registries are literally version control for binary images. Every CI/CD pipeline ends with a `docker push`, and every deployment starts with a `docker pull`.

---

## Scenario 10: Security review flags your container running as root

**The Question:**
A security audit at your company flags: *"This container process runs as root inside the container. If an attacker exploits the app, they have root access inside the container, increasing risk."* You're asked to fix it.

**What this is really asking:**
Tests Dockerfile **`USER`** instruction and general container security hygiene — a real, frequently-tested fresher-to-mid interview topic that's easy to overlook.

**Step-by-Step Solution:**

1. **The problem by default:**
   - Unless told otherwise, processes inside a container run as `root` (UID 0) — same privilege level as root on a real Linux system, which is unnecessarily risky if the container is ever compromised.

2. **Fix: create and switch to a non-root user in the Dockerfile:**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app
   COPY . .
   RUN npm install

   # Create a dedicated non-root user and group
   RUN addgroup -S appgroup && adduser -S appuser -G appgroup

   # Make sure the app files are owned by that user
   RUN chown -R appuser:appgroup /app

   # Switch to it — everything after this runs as appuser, not root
   USER appuser

   CMD ["node", "index.js"]
   ```
   - `addgroup -S` / `adduser -S` → Alpine's way of creating a "system" group/user (no login shell, minimal footprint). On Debian-based images you'd use `groupadd`/`useradd` instead.
   - `chown -R appuser:appgroup /app` → must run **before** switching users, since `appuser` needs permission to read/write its own app files.
   - `USER appuser` → every instruction after this (and the final running container) executes as `appuser`, not root.

3. **Verify it worked:**
   ```bash
   docker run --rm my-app whoami
   # Output: appuser   (not root)
   ```

4. **Bonus — many official images already provide a built-in non-root user**, e.g. `node` images often have a `node` user ready to use:
   ```dockerfile
   USER node
   ```

**Why companies do this:**
This is a standard line item in any container security checklist (also checked by tools like `docker scan`, Trivy, or company CI security gates). "Does your Dockerfile run as non-root?" is a real interview question for any DevOps role.

---

# Part 3 — Data Persistence & Networking

## Scenario 11: Your database container loses all data on restart

**The Question:**
You ran a PostgreSQL container, added some test data, then restarted the container — and all the data is gone. Your manager asks why, and how to fix it permanently.

**What this is really asking:**
Tests the most important rule in Docker: **containers are ephemeral** — anything written inside a container's writable layer is lost when the container is removed. Tests **volumes**, Docker's solution for persistent data.

**Step-by-Step Solution:**

1. **Understand why data was lost:**
   - A container's filesystem is temporary by default. `docker rm` (or even some restarts depending on how the container was recreated) wipes that writable layer.
   - **Volumes** exist specifically to store data **outside** the container's lifecycle, managed by Docker itself.

2. **Create a named volume:**
   ```bash
   docker volume create pg-data
   ```
   - This creates a storage location managed by Docker (commonly under `/var/lib/docker/volumes/` on Linux) — you don't need to know/manage the exact path.

3. **Run the database container, attaching the volume:**
   ```bash
   docker run -d \
     --name my-postgres \
     -e POSTGRES_PASSWORD=secret \
     -v pg-data:/var/lib/postgresql/data \
     -p 5432:5432 \
     postgres:15
   ```
   - `-v pg-data:/var/lib/postgresql/data` → `<volume_name>:<path_inside_container>`. Postgres always writes its actual database files to `/var/lib/postgresql/data` inside the container — by mounting a volume there, that data physically lives in Docker's managed volume, not in the container's temporary layer.

4. **Test persistence:**
   ```bash
   docker exec -it my-postgres psql -U postgres -c "CREATE TABLE test(id int);"
   docker rm -f my-postgres
   ```
   Now run a **brand new** container with the **same volume**:
   ```bash
   docker run -d --name my-postgres -e POSTGRES_PASSWORD=secret -v pg-data:/var/lib/postgresql/data -p 5432:5432 postgres:15
   docker exec -it my-postgres psql -U postgres -c "\dt"
   ```
   The `test` table still exists — proving the volume, not the container, is what holds the data.

5. **List and inspect volumes:**
   ```bash
   docker volume ls
   docker volume inspect pg-data
   ```

**Why companies do this:**
Any stateful service in Docker (databases, message queues, file uploads) **must** use volumes. "How does Docker handle persistent data?" is asked in nearly every Docker interview.

---

## Scenario 12: Live code reload during local development

**The Question:**
You're developing a Node.js app inside a container, but every time you edit a file on your laptop, you have to rebuild the image and restart the container to see the change. Your manager wants instant reflection of code changes, like normal local development.

**What this is really asking:**
Tests **bind mounts** vs **volumes** — a frequently confused pair. Both use the `-v` (or `--mount`) flag but serve very different purposes.

| | **Volume** | **Bind Mount** |
|---|---|---|
| Managed by | Docker | You (it's just a folder on your host machine) |
| Typical use | Persistent app data (databases) | Local development — live-editing source code |
| Syntax | `-v volume_name:/path` | `-v /absolute/host/path:/path` or `-v $(pwd):/path` |
| Portable across machines | Yes | No (tied to your exact host path) |

**Step-by-Step Solution:**

1. **Run the container with a bind mount pointing at your project folder:**
   ```bash
   docker run -it --rm \
     -v $(pwd):/app \
     -w /app \
     -p 3000:3000 \
     node:18-alpine \
     sh -c "npm install && npm run dev"
   ```
   - `-v $(pwd):/app` → `$(pwd)` resolves to your current host directory. This **bind-mounts** it directly into `/app` inside the container — any edit you make on your laptop is *instantly* visible inside the container, since it's literally the same files on disk, just viewed from two places.
   - `-w /app` → sets the working directory.

2. **Common gotcha — avoid overwriting `node_modules`:**
   If your host doesn't have `node_modules` installed (or has a different OS's compiled native modules), the bind mount can clash. Real-world fix — use an **anonymous volume** just for `node_modules` to "shield" it from the bind mount:
   ```bash
   docker run -it --rm \
     -v $(pwd):/app \
     -v /app/node_modules \
     -w /app \
     -p 3000:3000 \
     node:18-alpine \
     sh -c "npm install && npm run dev"
   ```
   - `-v /app/node_modules` (no source path before the colon) → an anonymous volume specifically for that one folder, so the container's own `node_modules` is used instead of whatever is (or isn't) on your host.

3. **In practice, this is almost always written in a `docker-compose.yml` instead of a long `docker run` command** (full detail in Part 4):
   ```yaml
   services:
     app:
       build: .
       volumes:
         - .:/app
         - /app/node_modules
       ports:
         - "3000:3000"
       command: npm run dev
   ```

**Why companies do this:**
This bind-mount pattern is exactly how most companies set up **local development environments** — you write code in your normal editor on your host machine, while it actually executes inside a container matching production.

---

## Scenario 13: App container can't reach the database container

**The Question:**
You run your app container and your database container separately. Your app's code tries to connect to `localhost:5432` for Postgres, but it fails with "connection refused," even though `docker ps` shows both are running.

**What this is really asking:**
Tests Docker **networking** — specifically that containers are isolated by default and `localhost` *inside* a container refers to **that container itself**, not your host or other containers. Tests **user-defined bridge networks** and Docker's built-in DNS.

**Step-by-Step Solution:**

1. **Understand the root cause:**
   - Each container gets its own network namespace. `localhost` inside the app container only ever refers to the app container itself — it cannot "see" the database container via `localhost`.
   - By default, containers run on Docker's default `bridge` network, where they get IP addresses but **no automatic DNS name resolution between them** (this is the historical default — annoying enough that everyone now avoids it).

2. **The fix: create a user-defined bridge network:**
   ```bash
   docker network create my-app-network
   ```

3. **Run both containers attached to that network:**
   ```bash
   docker run -d --name my-db --network my-app-network -e POSTGRES_PASSWORD=secret postgres:15
   docker run -d --name my-app --network my-app-network -p 3000:3000 my-app-image
   ```
   - `--network my-app-network` → attaches each container to the same custom network.

4. **The key benefit — built-in DNS by container name:**
   - On a **user-defined** network, Docker automatically lets containers resolve each other **by container name** as a hostname.
   - So in your app's database connection string, you use:
     ```
     DB_HOST=my-db
     DB_PORT=5432
     ```
     not `localhost`, and not an IP address. Docker's internal DNS resolves `my-db` to the correct container automatically — even if the container is restarted and gets a new internal IP.

5. **Verify connectivity manually:**
   ```bash
   docker exec -it my-app ping my-db
   ```
   - If this works, name resolution and network connectivity are both fine.

6. **List and inspect networks:**
   ```bash
   docker network ls
   docker network inspect my-app-network
   ```

**Why companies do this:**
This is one of the most-asked Docker interview questions: *"How do two containers talk to each other?"* The expected answer is exactly this — user-defined bridge network + container-name-based DNS. (Docker Compose, in Part 4, does this automatically for you — which is exactly why Compose feels "magic" until you understand this underlying mechanism.)

---

## Scenario 14: Database shouldn't be reachable from outside, but the app should be

**The Question:**
Security review: *"Your app is correctly exposed on port 3000 for users. But we noticed your database's port 5432 is also published to the internet on the server. That's a serious risk — fix it."*

**What this is really asking:**
Tests understanding that **port publishing (`-p`)** and **inter-container networking** are independent — you should almost never publish a database's port to the host/internet; it only needs to be reachable from *other containers* on the same Docker network.

**Step-by-Step Solution:**

1. **The insecure setup (what NOT to do):**
   ```bash
   docker run -d --name my-db --network my-app-network -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:15
   ```
   - `-p 5432:5432` exposes Postgres to anyone who can reach the host's network — including, if the server has a public IP and the cloud security group is misconfigured, the internet.

2. **The fix — remove the `-p` flag for the database entirely:**
   ```bash
   docker run -d --name my-db --network my-app-network -e POSTGRES_PASSWORD=secret postgres:15
   ```
   - Without `-p`, the container is **not** reachable from the host or outside world at all.
   - It is **still fully reachable from other containers on the same `my-app-network`** by name (`my-db:5432`), as established in Scenario 13 — port publishing has nothing to do with container-to-container communication; that's handled entirely by the shared Docker network.

3. **Only the app, which actually needs to be public, keeps its `-p`:**
   ```bash
   docker run -d --name my-app --network my-app-network -p 3000:3000 my-app-image
   ```

4. **The general rule to remember:**
   - `-p` (publish) → host machine ⇄ container (controls what the **outside world** can reach).
   - `--network` (shared network) → container ⇄ container (controls what **other containers** can reach, regardless of `-p`).
   - These are two completely separate layers — never confuse them.

**Why companies do this:**
"Least privilege" / minimal exposed surface is a basic security principle tested constantly — never publish a port unless something **outside** Docker genuinely needs to reach it directly.

---

## Scenario 15: One noisy container is consuming all the server's CPU/memory

**The Question:**
On a shared server running multiple containers, one container has a memory leak and is starving the others, eventually crashing the whole host. Your manager asks you to prevent any single container from doing this again.

**What this is really asking:**
Tests **resource limiting** — constraining how much CPU and memory a single container can use, a real production-hardening requirement.

**Step-by-Step Solution:**

1. **Run a container with memory and CPU limits:**
   ```bash
   docker run -d \
     --name limited-app \
     --memory="256m" \
     --memory-swap="256m" \
     --cpus="0.5" \
     my-app-image
   ```
   - `--memory="256m"` → hard cap: the container is killed (OOM-killed) if it tries to exceed 256MB of RAM, instead of taking down the whole host.
   - `--memory-swap="256m"` → setting this equal to `--memory` disables swap usage entirely for this container (otherwise it could still spill into swap, masking the real issue).
   - `--cpus="0.5"` → limits the container to half of one CPU core's worth of processing time — even on a busy host with other heavy containers, this one can't exceed that share.

2. **Monitor live resource usage of running containers:**
   ```bash
   docker stats
   ```
   - A live-updating table: CPU %, memory usage/limit, network I/O, block I/O — per container. Your first command when someone says "a container is using too much CPU."

3. **Confirm the limit is actually being enforced:**
   ```bash
   docker inspect limited-app --format='{{.HostConfig.Memory}}'
   ```

4. **In Compose form (more common in real projects), under a service:**
   ```yaml
   services:
     app:
       image: my-app-image
       deploy:
         resources:
           limits:
             cpus: "0.5"
             memory: 256M
   ```

**Why companies do this:**
On shared infrastructure (a single EC2/VM running several containers, or a Kubernetes/ECS node), resource limits are mandatory — they prevent "noisy neighbor" problems where one buggy service degrades everything else on the same host.

---

# Part 4 — Docker Compose (Multi-Container Applications)

## Scenario 16: Spin up the entire stack (app + database + cache) with one command

**The Question:**
Your application actually needs **three** containers to run: the app itself, a PostgreSQL database, and a Redis cache. Currently, every developer has to run three separate long `docker run` commands in the right order, remembering all the right flags. Your manager wants this reduced to a single command for the whole team.

**What this is really asking:**
This is **the** core use case for **Docker Compose** — defining a multi-container application declaratively in one YAML file instead of multiple manual `docker run` commands. This is used constantly in real companies for local development environments.

**Step-by-Step Solution:**

1. **Create `docker-compose.yml` in your project root:**
   ```yaml
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DB_HOST=db
         - REDIS_HOST=cache
       depends_on:
         - db
         - cache

     db:
       image: postgres:15
       environment:
         - POSTGRES_PASSWORD=secret
       volumes:
         - pg-data:/var/lib/postgresql/data

     cache:
       image: redis:7

   volumes:
     pg-data:
   ```
   **Explanation, section by section:**
   - `services:` → each entry under here is one container, defined declaratively.
   - `app: build: .` → instead of pulling a pre-built image, build one from the Dockerfile in the current directory.
   - `ports: - "3000:3000"` → same meaning as `-p 3000:3000` in `docker run`.
   - `environment:` → same as multiple `-e` flags — sets environment variables inside that service's container.
   - `depends_on: [db, cache]` → tells Compose to start `db` and `cache` *before* starting `app` (note: this only controls **start order**, not "wait until fully ready" — that nuance matters, covered in advanced health-check setups).
   - `db: image: postgres:15` → uses a pre-built image directly, no Dockerfile needed for this service.
   - `volumes: - pg-data:/var/lib/postgresql/data` → same volume concept as Scenario 11.
   - The top-level `volumes: pg-data:` → declares `pg-data` as a named volume Compose should manage.
   - **Notice there's no manual `docker network create` anywhere** — Compose automatically creates a single shared network for all services in the file, and every service can reach every other service **by its service name** (`db`, `cache`) as a hostname, exactly like Scenario 13's manual setup, but automatic.

2. **Start the entire stack with one command:**
   ```bash
   docker compose up
   ```
   - Builds (if needed) and starts every service defined in the file, in dependency order, attached to the shared network.
   - Add `-d` to run in detached/background mode: `docker compose up -d`

3. **View the running services:**
   ```bash
   docker compose ps
   ```

4. **View logs from all services together, or one specific service:**
   ```bash
   docker compose logs -f
   docker compose logs -f app
   ```

5. **Stop everything:**
   ```bash
   docker compose down
   ```
   - Stops and removes all containers and the auto-created network defined in this Compose file (but **keeps** named volumes like `pg-data` by default — your data survives).

**Why companies do this:**
A `docker-compose.yml` file in a project repo is the real-world standard for local development environments at most companies. New hires literally run `git clone` + `docker compose up` as their *entire* setup process — this is the modern replacement for that "half a day of onboarding" problem from Scenario 1.

---

## Scenario 17: New developer should be able to set up the whole project with zero manual steps

**The Question:**
Building on Scenario 16 — your manager now wants the Compose setup to also load secrets from a file (not hardcoded), and to clarify exactly which services build from source vs pull pre-built images, since the team is growing and onboarding has to be foolproof.

**What this is really asking:**
Tests deeper Compose features: `env_file`, the difference between `build:` and `image:` keys used together, and realistic secret-handling hygiene.

**Step-by-Step Solution:**

1. **Create a `.env` file (and add it to `.gitignore` — never commit secrets!):**
   ```
   POSTGRES_PASSWORD=secret123
   DB_HOST=db
   REDIS_HOST=cache
   ```

2. **Reference it in `docker-compose.yml` using `env_file`:**
   ```yaml
   services:
     app:
       build: .
       image: my-company/my-app:dev
       ports:
         - "3000:3000"
       env_file:
         - .env
       depends_on:
         - db
         - cache

     db:
       image: postgres:15
       env_file:
         - .env
       volumes:
         - pg-data:/var/lib/postgresql/data

     cache:
       image: redis:7

   volumes:
     pg-data:
   ```
   - `env_file: - .env` → loads **all** variables from that file into the container's environment — cleaner than listing each one under `environment:`, and keeps secrets out of the YAML file itself (which often *is* committed to git).
   - Using **both** `build:` and `image:` on the `app` service → Compose builds the image from your Dockerfile, then **tags** the result with the name given in `image:`. This is useful so the resulting image has a proper name you could later `docker push` if needed, instead of an auto-generated one.

3. **Plain-English distinction to remember (frequently confused):**
   - `build: .` → "I don't have a ready image; build one from this Dockerfile."
   - `image: postgres:15` → "Just pull and use this existing image, nothing to build."
   - You **can** combine both on one service (build, then name/tag the result) — but a service using only `image:` will never look for a Dockerfile at all.

4. **The actual one-command onboarding flow for a new hire:**
   ```bash
   git clone <repo-url>
   cd project
   cp .env.example .env     # they fill in their own local secrets
   docker compose up -d
   ```

**Why companies do this:**
Keeping secrets in `.env` files (excluded from git) referenced via `env_file` is the baseline standard for any serious project — committing real passwords/API keys into a Dockerfile or Compose file directly is a textbook security mistake interviewers will ask you to spot and fix.

---

## Scenario 18: Update only the app's code without restarting the whole stack

**The Question:**
You're running the 3-service stack from Scenario 16/17. You just fixed a bug in the app's code. Your database and cache are working fine and have data/state you don't want to disturb — you only want to rebuild and restart the `app` service.

**What this is really asking:**
Tests **targeted** Compose commands — operating on a single service instead of the whole stack, a daily real-world action.

**Step-by-Step Solution:**

1. **Rebuild just the `app` service's image and restart just that container:**
   ```bash
   docker compose up -d --build app
   ```
   - `--build` → forces Compose to rebuild the image from the Dockerfile before starting (otherwise it would reuse the existing cached image even if your code changed).
   - `app` → restricts the action to only that one named service — `db` and `cache` are left completely untouched, still running, with their data/state intact.

2. **If you didn't change the Dockerfile/dependencies, just code that's bind-mounted (common in dev setups), a plain restart is enough — no rebuild needed:**
   ```bash
   docker compose restart app
   ```

3. **Watch only that service's logs as it comes back up:**
   ```bash
   docker compose logs -f app
   ```

4. **Run a one-off command inside a service (e.g., a database migration) without affecting the running container:**
   ```bash
   docker compose exec app npm run migrate
   ```
   - `exec` here works just like plain `docker exec`, but lets you refer to the service by its Compose name instead of a container ID.

**Why companies do this:**
In any real multi-service local environment, you almost never want to tear down your database every time you fix one line of app code — targeted rebuild/restart of a single service is the everyday workflow.

---

## Scenario 19: Completely tear down the dev environment, including data

**The Question:**
You're done testing for the day, or you want a completely fresh start (e.g., to test what a brand-new developer's first setup would look like). Your manager wants a clean, full teardown — including wiping the database data this time.

**What this is really asking:**
Tests the difference between a normal teardown and a **full** teardown including volumes — and why that distinction matters (accidental data loss is a real risk here).

**Step-by-Step Solution:**

1. **Normal teardown (data is preserved):**
   ```bash
   docker compose down
   ```
   - Stops and removes containers + the network Compose created.
   - **Named volumes (like `pg-data`) are kept** — if you run `docker compose up` again, your database data is still there. This is the safe, usual default.

2. **Full teardown including volumes (data is wiped):**
   ```bash
   docker compose down -v
   ```
   - `-v` → also removes any named volumes declared in this Compose file. Your database starts completely empty next time.
   - **This is destructive** — always confirm with whoever owns the data before running this on anything other than a personal local environment.

3. **Also remove the built images, for a truly from-scratch rebuild test:**
   ```bash
   docker compose down -v --rmi all
   ```
   - `--rmi all` → removes all images used by any service in the Compose file (not just ones that were `build:`-ed locally).

4. **Confirm everything is gone:**
   ```bash
   docker compose ps -a
   docker volume ls
   ```

**Why companies do this:**
Knowing exactly what `down` does vs `down -v` is a classic "gotcha" question — many real incidents have happened from someone running `-v` on a server thinking it just stops containers. Always know which command actually deletes data.

---

# Part 5 — Production Practices, Debugging & CI/CD

## Scenario 20: Container crashes randomly at 2 AM in production, no one notices for hours

**The Question:**
Your company's app container crashed overnight. No alert fired, and customers complained for 3 hours before anyone checked. Your manager asks you to make sure Docker can tell, on its own, whether a container is actually "healthy" — not just "running."

**What this is really asking:**
Tests **`HEALTHCHECK`** — the difference between a container merely being in the `running` state (the process hasn't exited) vs being genuinely able to serve traffic. This is a real production-hardening feature most freshers don't know about.

**Step-by-Step Solution:**

1. **Understand the gap:** `docker ps` showing `Up 3 hours` only means the main process hasn't exited — it says nothing about whether the app inside is actually responding correctly (e.g., stuck, deadlocked, or returning 500s for everything).

2. **Add a `HEALTHCHECK` instruction in the Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY . .
   RUN npm install
   EXPOSE 3000

   HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
     CMD wget -q --spider http://localhost:3000/health || exit 1

   CMD ["node", "index.js"]
   ```
   - `--interval=30s` → run the health check every 30 seconds.
   - `--timeout=5s` → if the check itself takes longer than 5s, count it as failed.
   - `--start-period=10s` → grace period after container start before failures start counting (so a slow-starting app isn't immediately marked unhealthy).
   - `--retries=3` → must fail 3 consecutive times before being marked `unhealthy`.
   - `CMD wget -q --spider http://localhost:3000/health || exit 1` → the actual check: hits your app's `/health` endpoint (a route you build into your app that returns 200 OK if things look fine — e.g., DB connection alive). `--spider` means "just check it responds, don't download the body." Exit code `0` = healthy, non-zero = unhealthy.

3. **See the live health status:**
   ```bash
   docker ps
   ```
   - The `STATUS` column now shows `Up 2 hours (healthy)` or `Up 2 hours (unhealthy)` instead of just `Up 2 hours`.

4. **In Compose, the equivalent:**
   ```yaml
   services:
     app:
       build: .
       healthcheck:
         test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
         interval: 30s
         timeout: 5s
         retries: 3
         start_period: 10s
   ```

5. **Why this matters operationally:** orchestrators (Docker Swarm, Kubernetes, AWS ECS) read this health status to automatically restart or replace unhealthy containers — and to decide whether a container is ready to receive traffic in the first place, *without* a human having to notice at 2 AM.

**Why companies do this:**
A `HEALTHCHECK` (or its Kubernetes equivalent, "liveness/readiness probes") is considered baseline production hygiene. Expect to be asked: "How does Docker/Kubernetes know if my app is actually healthy?"

---

## Scenario 21: Make containers automatically come back after a crash or server reboot

**The Question:**
A container crashed due to a transient bug and stayed down until someone manually noticed and restarted it. Separately, the server itself was rebooted for maintenance, and none of the containers came back automatically. Fix both.

**What this is really asking:**
Tests **restart policies** — a single flag most people forget exists, but is essential for any production container.

**Step-by-Step Solution:**

1. **The four restart policy options:**
   | Policy | Behavior |
   |---|---|
   | `no` | (default) Never restart automatically. |
   | `on-failure[:max-retries]` | Restart only if it exits with a non-zero (error) code. Optionally cap retry attempts. |
   | `always` | Always restart, no matter the exit code — even restarts after a full Docker daemon/server reboot. |
   | `unless-stopped` | Same as `always`, except if a human explicitly ran `docker stop` — it won't come back until manually started again. |

2. **Apply it at `docker run` time:**
   ```bash
   docker run -d --name my-app --restart unless-stopped my-app-image
   ```

3. **Apply it in Compose:**
   ```yaml
   services:
     app:
       image: my-app-image
       restart: unless-stopped
   ```

4. **Which one to actually use in real production (the answer interviewers want):**
   - `unless-stopped` is the most common real-world default for long-running services — it survives crashes AND server reboots, but still respects a deliberate, intentional stop by an engineer (so it doesn't fight you during maintenance).
   - `on-failure:5` is common for one-off jobs/batch tasks where you want a few retry attempts, then give up and alert a human instead of looping forever.

5. **Verify the policy is actually set:**
   ```bash
   docker inspect my-app --format='{{.HostConfig.RestartPolicy.Name}}'
   ```

**Why companies do this:**
Without a restart policy, a single transient error (a brief network blip, a temporary out-of-memory spike) can take a service down indefinitely until a human intervenes — restart policies are the cheapest possible reliability win available, and missing them is a common production incident root cause.

---

## Scenario 22: Automatically build, tag, and push the image in CI/CD on every merge

**The Question:**
Right now, someone manually runs `docker build` and `docker push` on their laptop every time there's a release — which is slow, error-prone, and inconsistent. Your manager wants this fully automated: every time code is merged, a new image should be built, tagged properly, and pushed to the registry, with zero manual steps.

**What this is really asking:**
Tests understanding of how Docker fits into a **CI/CD pipeline** — the same commands you already know (`build`, `tag`, `push`), just run by a pipeline instead of a human, with a proper tagging strategy.

**Step-by-Step Solution:**

1. **The conceptual pipeline steps (true regardless of which CI tool — GitHub Actions, GitLab CI, Jenkins):**
   1. Checkout code.
   2. Build the Docker image.
   3. Tag it meaningfully (not just `:latest`).
   4. Log in to the registry using stored CI secrets (never hardcoded credentials).
   5. Push the image.
   6. (Often) trigger a deployment step that pulls the new tag onto the server.

2. **Example using GitHub Actions (`.github/workflows/docker-publish.yml`):**
   ```yaml
   name: Build and Push Docker Image

   on:
     push:
       branches: [main]

   jobs:
     build-and-push:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v4

         - name: Log in to Docker Hub
           uses: docker/login-action@v3
           with:
             username: ${{ secrets.DOCKER_USERNAME }}
             password: ${{ secrets.DOCKER_PASSWORD }}

         - name: Build and tag image
           run: |
             docker build -t mycompany/my-app:${{ github.sha }} .
             docker tag mycompany/my-app:${{ github.sha }} mycompany/my-app:latest

         - name: Push image
           run: |
             docker push mycompany/my-app:${{ github.sha }}
             docker push mycompany/my-app:latest
   ```
   - `${{ secrets.DOCKER_USERNAME }}` / `${{ secrets.DOCKER_PASSWORD }}` → pulled securely from the CI platform's encrypted secrets store, never written in plain text in the file.
   - `${{ github.sha }}` → the exact git commit hash, used as the image tag — this is the **real-world tagging strategy** mentioned back in Scenario 9: every image is traceable back to the exact commit that produced it. `:latest` is also pushed for convenience, but is never what you'd deploy by reference in a serious production rollout (it's ambiguous — "latest as of when?").

3. **The deployment side (often a separate step/pipeline) on the server:**
   ```bash
   docker pull mycompany/my-app:<commit-sha>
   docker stop my-app || true
   docker rm my-app || true
   docker run -d --name my-app --restart unless-stopped -p 80:3000 mycompany/my-app:<commit-sha>
   ```

**Why companies do this:**
This is literally what "CI/CD" means in any company using Docker — you've now connected every individual command you learned (`build`, `tag`, `push`, `pull`, `run`) into the real automated pipeline that ships code to production multiple times a day without a human typing Docker commands by hand.

---

## Scenario 23: Security team flags a critical vulnerability in your image

**The Question:**
An automated security scan in your CI pipeline flags: *"Critical vulnerability found in package `libssl1.1` inside your image."* Your manager wants this resolved and prevented going forward.

**What this is really asking:**
Tests awareness of **image vulnerability scanning** and the practices that reduce vulnerabilities in the first place — a topic that's becoming standard in DevOps interviews.

**Step-by-Step Solution:**

1. **Scan an image locally to see vulnerabilities (using Docker's built-in scanning, powered by Snyk/Trivy depending on Docker Desktop version):**
   ```bash
   docker scout cves my-app:1.0
   ```
   - (`docker scan` was the older command name; `docker scout` is the current Docker Desktop tool — either may appear depending on Docker version, but the *concept* — scanning an image for known CVEs in its packages — is what matters for understanding.)
   - Many companies instead use the open-source tool **Trivy** directly in CI:
     ```bash
     trivy image my-app:1.0
     ```

2. **Fix the immediate issue — update the base image:**
   ```dockerfile
   FROM node:18-alpine3.19
   ```
   - Vulnerabilities are usually in OS-level packages bundled in the base image. Pinning to a newer, patched base image version (rather than a stale cached one) often resolves the flagged CVE directly.

3. **Reduce the attack surface going forward (preventive practices):**
   - Prefer minimal base images (`alpine`, `distroless`) — fewer installed packages = fewer possible CVEs.
   - Don't install unnecessary OS packages (`apt-get install`) just "in case."
   - Pin specific image tags/digests instead of floating tags, so you know exactly what you're running:
     ```dockerfile
     FROM node:18.19.0-alpine3.19
     ```
   - Rebuild images regularly even if your app code hasn't changed — base image security patches come out independently of your code.

4. **Wire scanning into the CI pipeline so it's automatic, not manual** (continuing the pipeline from Scenario 22):
   ```yaml
   - name: Scan image for vulnerabilities
     run: trivy image --exit-code 1 --severity CRITICAL,HIGH mycompany/my-app:${{ github.sha }}
   ```
   - `--exit-code 1` → makes the pipeline **fail** (blocking the merge/deploy) if critical/high vulnerabilities are found, rather than just printing a warning no one reads.

**Why companies do this:**
Container image scanning in CI is now a standard compliance/security gate at most companies (driven by audits like SOC 2). "How do you keep container images secure?" is a real interview question, and "we scan images in CI and use minimal pinned base images" is the expected shape of answer.

---

## Scenario 24: CI builds are taking 8 minutes — too slow, slowing down the whole team

**The Question:**
Every CI pipeline run rebuilds the Docker image from scratch, taking 8 minutes even for a one-line code change, because dependency installation re-runs every single time. Your manager wants builds sped up significantly.

**What this is really asking:**
Tests **layer caching strategy** at a deeper level than Scenario 7 — specifically how to structure Dockerfiles and CI configuration so unchanged layers are reused instead of rebuilt every time.

**Step-by-Step Solution:**

1. **Confirm Dockerfile instruction order is optimized (recap + reinforce from Scenario 7):**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app

   # Dependency files copied and installed FIRST — these change rarely
   COPY package*.json ./
   RUN npm install

   # Source code copied LAST — this changes on every commit
   COPY . .

   CMD ["node", "index.js"]
   ```
   - If `package.json` is unchanged between builds, Docker reuses the cached `npm install` layer entirely, skipping the slowest step — **only** if this ordering is respected. If `COPY . .` came before `RUN npm install`, *any* code change (even a comment) would invalidate the cache and force a full reinstall every time.

2. **In CI specifically, the cache problem is often that each pipeline run starts on a clean machine with no cache at all.** Fix by explicitly restoring/exporting Docker's build cache between runs. Example using GitHub Actions cache + BuildKit:
   ```yaml
   - name: Set up Docker Buildx
     uses: docker/setup-buildx-action@v3

   - name: Build with cache
     uses: docker/build-push-action@v5
     with:
       context: .
       push: true
       tags: mycompany/my-app:${{ github.sha }}
       cache-from: type=gha
       cache-to: type=gha,mode=max
   ```
   - `cache-from` / `cache-to: type=gha` → tells BuildKit to store and retrieve layer cache using GitHub Actions' own cache storage between pipeline runs, instead of starting from zero every single time.

3. **Manually pulling a previous image as a cache source (works on any CI, not just GitHub Actions):**
   ```bash
   docker pull mycompany/my-app:latest || true
   docker build --cache-from mycompany/my-app:latest -t mycompany/my-app:${{ commit_sha }} .
   ```
   - `--cache-from` → tells Docker "try to reuse layers from this existing image as a cache source," even on a fresh CI runner that never built this project before.

4. **Result:** an unchanged-dependency, code-only commit might drop from 8 minutes to under 1 minute, since only the final `COPY . .` layer and onward need to rebuild.

**Why companies do this:**
Slow CI directly costs developer time and money (CI minutes are billed). Layer-caching strategy is a very commonly asked "how would you optimize this" interview question — show you understand *why* instruction order and explicit cache exporting both matter.

---

## Scenario 25: "Why do we need Kubernetes/ECS if we already have Docker?"

**The Question:**
A new hire asks you: *"We already use Docker everywhere. Why is the team also setting up AWS ECS / Kubernetes? Isn't that redundant?"*

**What this is really asking:**
This tests whether you understand the **boundary of what Docker actually does** vs what an **orchestrator** does — a conceptual question interviewers love, especially for someone (like an AWS-focused fresher) who will work with ECS/EKS on top of Docker.

**Step-by-Step Explanation (conceptual, not commands):**

1. **What Docker alone gives you:**
   - Build images, run containers, manage volumes/networks — **on one machine.**
   - `docker run`, even `docker compose up`, fundamentally assumes everything runs on a single host.

2. **What Docker alone does NOT give you (the gap orchestrators fill):**
   - **Scheduling across many servers** — if you have 50 containers and 10 servers, something needs to decide which container runs where.
   - **Self-healing at scale** — if a server itself dies (not just a container), something needs to notice and reschedule its containers onto a healthy server. A `--restart` policy can't help if the entire host is gone.
   - **Scaling out/in automatically** based on load (e.g., "run 3 copies of this service during traffic spikes, scale down at night").
   - **Rolling updates with zero downtime** across many running instances of a service, plus automatic rollback if a new version is unhealthy.
   - **Service discovery and load balancing** across many container instances of the same service.

3. **How they relate (the key mental model):**
   ```
   Docker  = builds the image, defines & runs ONE container, on ONE machine
   Orchestrator (Kubernetes / ECS / Swarm) = decides WHERE and HOW MANY of that
   container run, ACROSS many machines, and keeps that state true over time
   ```
   - You still write a Dockerfile and build a Docker image either way — Kubernetes and ECS both run actual Docker-built container images under the hood (or a compatible container runtime). The orchestrator doesn't replace Docker's image format; it replaces manually running `docker run` yourself across a fleet of servers.

4. **Concrete real-world example, connecting it to AWS (relevant to an AWS-track learner):**
   - You `docker build` and `docker push` your image to **ECR** (the registry, Scenario 9).
   - You then define an **ECS Task Definition** that says "run this image, with this CPU/memory, this many copies" — ECS (the orchestrator) handles placing those containers across your EC2/Fargate capacity, restarting failed ones, and load-balancing traffic across them.
   - Docker itself never "knows" about your other servers — that coordination layer is exactly what ECS/Kubernetes adds on top.

**Why companies do this:**
Almost no production company at meaningful scale runs raw `docker run` on a single server for important services — Docker is the **packaging and local execution** layer; ECS/Kubernetes is the **fleet management** layer on top. Understanding this boundary clearly is what separates "I've used Docker" from "I understand how Docker fits into real infrastructure" in an interview.

---

# Quick Command Reference Sheet

A condensed cheat sheet — the Docker equivalent of knowing `git clone / pull / push / merge` at a glance.

| Command | What it does |
|---|---|
| `docker run <image>` | Create + start a new container from an image |
| `docker run -d` | Run in background (detached) |
| `docker run -p host:container` | Publish a port to the host |
| `docker run -v vol:/path` | Attach a volume (persistent data) |
| `docker run -v /host/path:/path` | Bind mount a host folder |
| `docker run -e KEY=value` | Set an environment variable |
| `docker run --network <net>` | Attach to a specific network |
| `docker run --restart unless-stopped` | Auto-restart policy |
| `docker run -it ... bash` | Start a container and drop into an interactive shell |
| `docker run --rm` | Auto-delete container when it exits |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers (incl. stopped) |
| `docker stop <name>` | Gracefully stop a running container |
| `docker rm <name>` | Delete a stopped container |
| `docker rm -f <name>` | Force-stop and delete in one step |
| `docker logs <name>` | View a container's output/logs |
| `docker logs -f <name>` | Follow logs live |
| `docker exec -it <name> bash` | Open a shell inside a **running** container |
| `docker inspect <name>` | Full JSON metadata about a container/image |
| `docker stats` | Live CPU/memory usage of running containers |
| `docker build -t name:tag .` | Build an image from a Dockerfile |
| `docker images` | List local images |
| `docker rmi <image>` | Delete a local image |
| `docker tag src new` | Add another name/tag to an existing image |
| `docker pull <image>` | Download an image from a registry |
| `docker push <image>` | Upload an image to a registry |
| `docker login` | Authenticate to a registry |
| `docker volume create/ls/inspect/prune` | Manage persistent volumes |
| `docker network create/ls/inspect` | Manage custom networks |
| `docker system df` | Show Docker's disk usage summary |
| `docker system prune -a --volumes` | Clean up everything unused |
| `docker compose up -d` | Start an entire multi-container stack |
| `docker compose down` | Stop & remove stack (keeps named volumes) |
| `docker compose down -v` | Stop & remove stack **including** volumes |
| `docker compose logs -f <service>` | Logs for one service in the stack |
| `docker compose exec <service> <cmd>` | Run a command inside one running service |
| `docker compose up -d --build <service>` | Rebuild & restart just one service |

---

# How to Practice This for Real

1. Install Docker Desktop (or Docker Engine on Linux) if you haven't.
2. Go scenario by scenario, **type every command yourself** — don't copy-paste. Muscle memory matters here.
3. Once you finish Part 4, build a tiny real 2–3 service project of your own (e.g., a simple API + Postgres) and write its `docker-compose.yml` from scratch without looking back at this file.
4. Re-read Part 5 right before any DevOps/Cloud interview — it's the part that separates fresher-level "I used Docker once" answers from real production-readiness answers.
