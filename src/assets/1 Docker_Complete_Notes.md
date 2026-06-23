# 🐳 Docker – Complete Study Notes

---

## 1. Overview

### 1.1 What is Docker?
Docker is a **containerization platform** that lets you build, share, and run applications in isolated environments called **containers**. Instead of installing an application's runtime, dependencies, and libraries directly on your machine, Docker packages all of that *with* the application into one portable unit.

### 1.2 Why Do We Need Docker? (The Problem)
Traditional development runs into the same issues again and again when teams collaborate:

| Problem | What Happens |
|---|---|
| Manual Installation Errors | Every dependency installed one by one, by hand |
| Version Compatibility Issues | Dev A uses Node v16, Dev B uses Node v20 |
| Environment Inconsistencies | "It works on my machine" but breaks elsewhere |
| Platform Dependencies | OS-specific commands/configs (Windows vs Mac vs Linux) |

**Example:**
```
Machine A (Developer 1)          Machine B (Developer 2)
├── Node.js v16                  ├── Node.js v20 (different!)
├── MongoDB v4.2                 ├── MongoDB v6.0 (different!)
└── Windows OS                   └── Mac OS (different!)
```

Developer 1 builds an app on Machine A and it works perfectly. The moment it's shared with Developer 2 (say, via GitHub), it can throw errors on Machine B — because of dependency version mismatches, missing configs, or OS differences.

### 1.3 Docker's Solution
Instead of installing dependencies individually on every machine, Docker bundles:
- Application code
- All dependencies
- Runtime environment
- System libraries

…into a single, portable unit called a **container**. That container runs identically everywhere — your laptop, your teammate's laptop, or a production server.

---

## 2. Docker Core Concepts

### 2.1 Container
A container is a single running unit that bundles:
- Your application
- All its dependencies
- The runtime environment

**Properties:**
- **Portable** – runs the same way across systems
- **Lightweight** – much less overhead than a Virtual Machine
- **Isolated** – each container has its own filesystem, process space, and network

### 2.2 Image
A Docker **Image** is:
- An executable file/template containing instructions to build a container
- A static, read-only snapshot of what the environment should look like
- A blueprint — it doesn't run by itself, it's used to *create* containers

### 2.3 Image vs Container (OOP Analogy)

| Docker Image | Docker Container |
|---|---|
| Static snapshot | Running instance |
| Template / Blueprint | Actual execution |
| Minimal storage | Uses CPU/RAM/system resources |
| Shareable (via registry) | Environment-specific, instance-specific |
| Like a **Class** in OOP | Like an **Object/Instance** of that class |

Think of it like this: `Image : Container` is the same relationship as `Class : Object`.

### 2.4 Registry
A **registry** is a storage and distribution system for Docker images — **Docker Hub** is the most common public registry (think of it like GitHub, but for images instead of code).

- URL: `hub.docker.com`
- Contains official images (e.g. `ubuntu`, `node`, `mongo`, `nginx`) and community images
- You can `pull` images from it or `push` your own images to it

### 2.5 Docker Compose (Preview)
**Docker Compose** is a tool to define and run **multi-container applications** using a single YAML file (`docker-compose.yml`) instead of running many separate `docker run` commands. Covered in depth in [Section 11](#11-docker-compose--multi-container-apps).

### 2.6 The Docker Lifecycle (Big Picture)
```
Dockerfile  →  docker build  →  Docker Image  →  docker push/pull  →  Docker Hub
                                      │
                                      ▼
                                 docker run
                                      │
                                      ▼
                              Docker Container (running app)
```

A **Dockerfile** is a text file of instructions (like a class definition) used to build an **Image**. That image can be pushed to Docker Hub (a public registry) or used locally to spin up a **Container** — the actual running instance of your application.

---

## 3. Docker Architecture (Docker Engine)

When you install Docker, it installs **both** the Docker CLI and the Docker daemon/engine.

**Docker Engine** is the core component of the Docker platform — it provides the runtime that actually builds, runs, and manages containers. It is made up of three parts:

1. **Docker Daemon (`dockerd`)** – a background service that does the real work: building images, running containers, managing networks/volumes.
2. **REST API** – defines the endpoints the daemon exposes, so other tools (or your own scripts) can talk to Docker programmatically.
3. **Docker CLI (`docker`)** – the command line tool you type commands into.

**Workflow:**
```
You type a command  →  Docker CLI  →  REST API  →  Docker Daemon  →  Action happens
   (docker run ubuntu)                                 (creates container)
```

This separation is why Docker can be automated/integrated into other tools — anything that can call the REST API can control Docker, not just the CLI.

---

## 4. Virtual Machines vs Docker Containers

**Short version:** VMs are heavy, fully isolated machines with their own OS. Docker containers are lightweight, share the host's OS kernel, and start in seconds using far fewer resources.

### 4.1 What is an OS Kernel?
The **Kernel** is the core part of any Operating System. It sits between your hardware and your applications, and decides which process gets access to CPU, memory, disk, etc., and when.

```
Your Applications (Chrome, VSCode, your app)
            ↓
        OS Kernel  (manages resources)
            ↓
   Hardware (CPU, RAM, Disk)
```

### 4.2 What Actually Happens When You Pull a Docker Image
When you run `docker pull ubuntu`, you are **not** downloading a full Ubuntu operating system. You are downloading only the **userland** — the filesystem, libraries, and tools that make Ubuntu *feel* like Ubuntu (`apt`, `bash`, config files, etc.).

> A Docker image = a lightweight environment, **not** a full OS.

It's like a "mini Ubuntu" that looks and behaves like Ubuntu inside — but it borrows the **kernel from your host machine** instead of shipping its own.

### 4.3 How It Actually Runs
When a container runs, it uses:
- The **host machine's kernel** (shared, not duplicated)
- Linux **namespaces** to isolate processes, network, and filesystem view
- Linux **cgroups** to limit/allocate CPU and memory

So inside the container you might see:
```bash
$ cat /etc/os-release
Ubuntu 22.04
```
…but this isn't a separate Ubuntu OS booting up — it's the Ubuntu *userland* running on top of your host's Linux kernel.

### 4.4 Why Docker Desktop Needs a VM on macOS/Windows
Docker containers rely on **Linux kernel features** (namespaces, cgroups). macOS and Windows don't have a Linux kernel natively. So:

1. **Docker Desktop** silently creates and runs a small, lightweight **Linux VM** in the background (using HyperKit/Virtualization Framework on Mac, or **WSL2** on Windows).
2. All your containers actually run *inside* that hidden Linux VM.
3. Docker Desktop forwards ports, volumes, and the CLI experience so it *feels* like containers are running natively on your Mac/Windows machine.

### 4.5 Comparison Table

| Aspect | Virtual Machine | Docker Container |
|---|---|---|
| OS | Full guest OS per VM | Shares host OS kernel |
| Boot time | Minutes | Seconds |
| Size | GBs | MBs |
| Isolation | Full hardware-level isolation | Process-level isolation (namespaces/cgroups) |
| Resource usage | Heavy | Lightweight |
| Portability | Less portable | Highly portable |

---

## 5. Docker Installation — Step by Step

### 5.1 GUI Installation (Windows / Mac) — Docker Desktop

**Step 1 — Go to the official site**
Visit `https://www.docker.com` and click **"Download Docker Desktop"**.

**Step 2 — Choose your OS**
Pick the installer matching your machine (Mac with Apple Silicon, Mac with Intel, or Windows).

**Step 3 — Run the installer**
Double-click the downloaded file and follow the setup wizard. On Windows, it may prompt you to enable **WSL2** — accept this, since Docker Desktop needs it to run the Linux kernel features described in Section 4.

**Step 4 — Accept recommended settings**
Unless you have a specific reason not to, accept the default/recommended configuration — it covers 95% of use cases for a fresher/learner.

**Step 5 — Restart if prompted**
Some installs require a system restart (especially on Windows, to finish enabling WSL2/Hyper-V).

**Step 6 — Launch Docker Desktop**
Open the Docker Desktop app. Wait for the whale icon in your system tray/menu bar to show it's running.

**Step 7 — Verify in the GUI**
- **Containers tab** → should be empty initially (no containers yet)
- **Images tab** → should be empty initially (no images pulled yet)

This confirms Docker Desktop is installed and running correctly — you can now manage containers/images visually here, or use the CLI (next section) for the exact same operations.

### 5.2 CLI Installation (Linux — Ubuntu, important for AWS/DevOps work)
On Linux servers (like an AWS EC2 instance), there is **no Docker Desktop GUI** — everything is done via CLI. This is the method you'll use most as a Cloud/DevOps engineer.

**Step 1 — Update package index**
```bash
sudo apt-get update
```
*Why:* Refreshes the list of available packages so you install the latest versions/dependencies.

**Step 2 — Install prerequisite packages**
```bash
sudo apt-get install ca-certificates curl gnupg
```
*Why:* These are needed to securely download and verify Docker's package repository.

**Step 3 — Add Docker's official GPG key**
```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```
*Why:* This key lets `apt` verify that the Docker packages you install are authentic and haven't been tampered with.

**Step 4 — Add the Docker repository**
```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```
*Why:* This tells `apt` where to find Docker packages (Docker's own repo, not Ubuntu's default one), since Docker releases updates faster than Ubuntu's package list does.

**Step 5 — Install Docker Engine**
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
*Why:* Installs the Docker daemon (`docker-ce`), the CLI, the container runtime (`containerd`), and plugins for building images and running Compose.

**Step 6 — Verify the daemon is running**
```bash
sudo systemctl status docker
```
*Why:* Confirms the Docker background service (`dockerd`) has started successfully.

### 5.3 Post-Installation Steps (Linux)

**Step 1 — Run Docker without `sudo` (optional but recommended)**
```bash
sudo usermod -aG docker $USER
newgrp docker
```
*Why:* By default only `root`/`sudo` users can talk to the Docker daemon (it listens on a root-owned socket). Adding your user to the `docker` group lets you run `docker` commands directly. *(Security note: this effectively grants root-equivalent access — be deliberate about which users get this.)*

**Step 2 — Enable Docker to start on boot**
```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```
*Why:* Ensures Docker automatically starts whenever the server reboots — important for production EC2 instances.

### 5.4 Verification Commands (Both GUI and CLI installs)
```bash
# Check Docker version
docker --version

# Check detailed system/daemon info
docker info

# Test with the official hello-world image
docker run hello-world
```

**What `docker run hello-world` actually does, step by step:**
1. Docker **client** (CLI) sends the request to the Docker **daemon**.
2. The daemon checks if the `hello-world` image exists locally — if not, it **pulls** it from Docker Hub.
3. The daemon **creates a new container** from that image.
4. Docker streams the container's output (a confirmation message) back to your terminal.

Seeing that message means your installation works end-to-end: CLI → daemon → registry → container → output.

---

## 6. Essential Docker Commands — Step by Step

> 🖱️ **Docker Desktop GUI equivalent:** for most of these, you can also click around in the **Containers** and **Images** tabs (start/stop buttons, delete icons, logs viewer). The CLI is shown below since it's what you'll use most on servers (no GUI there), but the GUI is great for visually double-checking state while you're learning.

### 6.1 `docker pull` — Download an image
```bash
docker pull ubuntu          # latest tag by default
docker pull ubuntu:20.04    # specific version/tag
docker pull node:16
```
Downloads an image from a registry (Docker Hub by default) to your local machine, without running it.

### 6.2 `docker images` — List local images
```bash
docker images
```
```
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
hello-world   latest    feb5d9fea6a5   2 years ago    13.3kB
ubuntu        latest    ba6acccedd29   2 months ago   72.8MB
```
- **Repository** – image name
- **Tag** – version label (`latest`, `20.04`, etc.)
- **Image ID** – unique identifier
- **Size** – disk space used

### 6.3 `docker run` — Create and start a new container
```bash
docker run <image-name>
docker run hello-world
docker run ubuntu
```
**Important:** `docker run` *always* creates a **brand-new** container, even if one already exists from the same image. (Use `docker start` to resume an existing one — see 6.5.)

### 6.4 `docker ps` — View containers
```bash
docker ps        # running containers only
docker ps -a     # ALL containers (running + stopped)
```
```
CONTAINER ID   IMAGE        COMMAND      CREATED         STATUS                     NAMES
abc123def456   ubuntu       "/bin/bash"  2 minutes ago   Exited (0) 1 minute ago    mystifying_tesla
789ghi012jkl   hello-world  "/hello"     5 minutes ago   Exited (0) 5 minutes ago   wonderful_darwin
```
Each container automatically gets a unique **ID** and a random human-readable **name** (you can override this — see 7.3).

### 6.5 `docker start` / `docker stop` / `docker restart`
```bash
docker start <container-name-or-id>     # resumes an EXISTING stopped container
docker stop <container-name-or-id>      # gracefully stops a running container
docker restart <container-name-or-id>   # stop + start in one command
```

### 6.6 `docker rm` / `docker rmi` — Cleanup
```bash
docker rm <container-name>      # remove a stopped container
docker rmi <image-name>         # remove an image (must not be used by any container)
docker container prune          # remove ALL stopped containers
docker image prune              # remove unused/dangling images
```

### 6.7 `docker exec` — Run a command inside a *running* container
```bash
docker exec -it my-ubuntu bash
```
Lets you "jump into" an already-running container to inspect/debug it, without restarting it. Different from `docker run -it`, which creates a *new* container.

### 6.8 `docker logs` — View container output
```bash
docker logs <container-name>
docker logs -f <container-name>     # -f = follow, like `tail -f`
```

### 6.9 `docker inspect` — Full metadata about a container/image
```bash
docker inspect <container-name>
```
Returns a detailed JSON object: IP address, mounted volumes, environment variables, network settings, etc.

### 6.10 `docker stats` — Live resource usage
```bash
docker stats
```
Shows real-time CPU %, memory usage, network I/O per running container — similar to `top`, but for containers.

### Command Quick-Reference

| Command | Purpose | Creates New Container? |
|---|---|---|
| `docker run` | Create and start a new container | ✅ Yes |
| `docker start` | Start an existing stopped container | ❌ No |
| `docker stop` | Stop a running container | ❌ No |

---

## 7. Running Containers — Modes & Options

### 7.1 Interactive Mode (`-it`)
```bash
docker run -it ubuntu
```
- `-i` → **Interactive**: keeps STDIN open so you can type commands
- `-t` → allocates a pseudo-**TTY** (a terminal session)

Together, `-it` drops you straight into a shell *inside* the container:
```bash
root@abc123def456:/#
ls                    # list files inside the container's own filesystem
mkdir test-folder      # create a directory (only exists inside this container)
cd test-folder
printenv              # view environment variables
exit                  # leave the container (container stops)
```

**Key points:**
- The container has its own **isolated filesystem** — changes inside it don't touch your host machine.
- By default, the container **stops** the moment you `exit` the interactive shell.
- Every container gets a unique ID and a random name unless you set one yourself.

### 7.2 Attached vs Detached Mode

**Attached mode (default / foreground):**
```bash
docker run nginx
```
The container's stdin/stdout/stderr are connected directly to your terminal — you see live output, but your terminal is "stuck" running that container until it exits. Good for debugging or quick interactive tasks.

**Detached mode (background):**
```bash
docker run -d nginx
```
- `-d` / `--detach` → container runs in the **background**
- You get the container ID printed back immediately
- Your terminal is free for other commands
- Ideal for long-running services (web servers, databases) that don't need your constant attention

**Attaching to / detaching from a running container:**
```bash
docker attach <container-name-or-id>
```
Re-connects your terminal to a detached container's output stream.

To detach *without stopping* the container: press `Ctrl+P` then `Ctrl+Q`.

### 7.3 Naming Containers (`--name`)
```bash
docker run --name my-ubuntu -it ubuntu
docker run --name my-app-container -it node:16
```
*Why:* Easier to reference (`docker stop my-ubuntu`) instead of remembering random IDs like `mystifying_tesla`.

### 7.4 Port Mapping (`-p`)
```bash
docker run -d -p 8080:80 nginx
```
Format: `-p <host-port>:<container-port>`
This maps port `80` *inside* the container (where Nginx listens) to port `8080` on your *host* machine — so visiting `http://localhost:8080` reaches the container.

### 7.5 Environment Variables (`-e`)
```bash
docker run -e MYSQL_ROOT_PASSWORD=secret -d mysql
```
Passes configuration into the container at startup — many official images (like databases) are configured this way instead of editing config files.

### 7.6 Restart Policies (`--restart`)
```bash
docker run -d --restart unless-stopped nginx
```
Common values: `no` (default), `on-failure`, `always`, `unless-stopped`. Useful in production so containers auto-recover after a crash or server reboot.

---

## 8. Working with Docker Images — Building Your Own

### 8.1 What is a Dockerfile?
A **Dockerfile** is a plain text file containing step-by-step instructions for building a custom Docker image — essentially a recipe.

### 8.2 Common Dockerfile Instructions Explained

```dockerfile
# 1. Base image to build on top of
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy dependency files first (for build caching — see 8.5)
COPY package*.json ./

# 4. Run a command at build time (install dependencies)
RUN npm install

# 5. Copy the rest of the application code
COPY . .

# 6. Set an environment variable
ENV NODE_ENV=production

# 7. Document which port the app listens on (informational only)
EXPOSE 3000

# 8. Command that runs when the container STARTS
CMD ["node", "server.js"]
```

| Instruction | Purpose |
|---|---|
| `FROM` | Sets the base image everything else builds on top of |
| `WORKDIR` | Sets the default directory for subsequent instructions |
| `COPY` | Copies files from your machine into the image |
| `ADD` | Like `COPY`, but can also fetch URLs and auto-extract archives |
| `RUN` | Executes a command **at build time** (e.g., installing packages) |
| `ENV` | Sets an environment variable available inside the container |
| `EXPOSE` | Documents which port the app uses (doesn't actually publish it — that's `-p` at runtime) |
| `CMD` | The default command that runs **when the container starts** |
| `ENTRYPOINT` | Similar to `CMD`, but harder to override — used when the container should always run as a specific executable |

### 8.3 Building an Image — Step by Step
```bash
docker build -t my-app:1.0 .
```
- `-t my-app:1.0` → tags the image with a name and version
- `.` → build context: the current directory (where Docker looks for the Dockerfile and files to `COPY`)

**What happens during build:**
1. Docker reads the Dockerfile line by line.
2. Each instruction creates a new **layer** (a diff on top of the previous layer).
3. The final result is your new image, visible via `docker images`.

### 8.4 Tagging & Pushing to Docker Hub
```bash
docker login                              # Step 1: authenticate with Docker Hub
docker tag my-app:1.0 yourusername/my-app:1.0   # Step 2: tag with your Hub username
docker push yourusername/my-app:1.0       # Step 3: upload the image
```
Now anyone (or any server) can `docker pull yourusername/my-app:1.0` and run the exact same environment you built.

### 8.5 Image Layers & Build Cache
Every instruction in a Dockerfile (`RUN`, `COPY`, etc.) creates a **layer**. Docker caches each layer — if nothing changed in a layer (and the layers before it), Docker reuses the cached version instead of rebuilding it.

**Why instruction order matters:** put things that change *rarely* (like `COPY package.json` + `RUN npm install`) **before** things that change *often* (like `COPY . .` for your source code). This way, code changes don't force a slow dependency reinstall every time.

### 8.6 Multi-Stage Builds
Used to keep final images small by separating the "build" environment from the "runtime" environment.

```dockerfile
# Stage 1: build the app (needs full build tools)
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: run the app (lightweight, no build tools)
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```
Only the final stage ends up in your shipped image — all the heavy build tooling from Stage 1 is discarded, resulting in a much smaller, more secure production image.

---

## 9. Docker Volumes — Data Persistence (Deep Dive)

### 9.1 Why Volumes Are Needed
**Containers are ephemeral** — when a container is removed (`docker rm`), any data written inside its writable layer is **lost forever**. Volumes solve this by storing data **outside** the container's lifecycle.

### 9.2 Types of Storage in Docker

| Type | Stored Where | Managed By Docker? | Best For |
|---|---|---|---|
| **Named Volume** | Docker-managed area on host (`/var/lib/docker/volumes/...`) | ✅ Yes | Databases, persistent app data |
| **Bind Mount** | Any specific path you choose on the host | ❌ No (you manage the path) | Local development (live code editing) |
| **tmpfs Mount** | RAM only (never written to disk) | ✅ Yes | Sensitive/temporary data (secrets, caches) |

### 9.3 Named Volumes — Step by Step

**Step 1 — Create a volume**
```bash
docker volume create my-db-data
```

**Step 2 — List volumes**
```bash
docker volume ls
```

**Step 3 — Inspect a volume (see where it lives on disk)**
```bash
docker volume inspect my-db-data
```

**Step 4 — Use it when running a container**
```bash
docker run -d --name mongo-db -v my-db-data:/data/db mongo
```
Format: `-v <volume-name>:<path-inside-container>`
Here, MongoDB's data directory (`/data/db`) is backed by the `my-db-data` volume — even if the container is deleted, the data survives.

**Step 5 — Reattach the same data to a new container**
```bash
docker run -d --name mongo-db-2 -v my-db-data:/data/db mongo
```
The new container starts with all the same data — proving the volume, not the container, owns the data.

**Step 6 — Remove a volume (only when no longer needed)**
```bash
docker volume rm my-db-data
docker volume prune     # remove all unused volumes
```

### 9.4 Bind Mounts — Step by Step
Bind mounts map an exact folder on your **host machine** into the container — commonly used so code edits on your laptop instantly reflect inside a running container (great for local development).

```bash
docker run -d --name my-dev-app -v /home/user/my-app:/app node:18
```
Format: `-v <absolute-host-path>:<path-inside-container>`

**Step by step:**
1. You have your project code at `/home/user/my-app` on your host.
2. The container sees that exact folder as `/app`.
3. Edit a file on your host → the change appears inside the container immediately (no rebuild needed).

### 9.5 tmpfs Mounts — Step by Step
Stores data in the host's memory (RAM) only — never written to disk. Useful for secrets or temp files you don't want persisted anywhere.

```bash
docker run -d --tmpfs /app/cache nginx
```

### 9.6 `-v` vs `--mount` Syntax
Both achieve the same thing; `--mount` is more explicit/verbose and is Docker's recommended modern syntax:
```bash
# Shorthand
docker run -v my-data:/data/db mongo

# Equivalent, explicit form
docker run --mount source=my-data,target=/data/db mongo
```

### 9.7 Declaring Volumes in a Dockerfile
```dockerfile
VOLUME /data/db
```
This marks a path as needing persistent storage. If you don't explicitly attach a named volume at runtime, Docker auto-creates an **anonymous volume** for it — but it's best practice to always specify one explicitly via `-v` at `docker run` time, so you know exactly which volume holds your data.

### 9.8 Backing Up & Restoring Volume Data
**Backup (copy volume data into a tar file on host):**
```bash
docker run --rm -v my-db-data:/data -v $(pwd):/backup ubuntu \
  tar czf /backup/backup.tar.gz -C /data .
```

**Restore (load tar file back into a fresh volume):**
```bash
docker run --rm -v my-db-data:/data -v $(pwd):/backup ubuntu \
  tar xzf /backup/backup.tar.gz -C /data
```

---

## 10. Docker Networking

### 10.1 Default Network Types
```bash
docker network ls
```
| Network | Behaviour |
|---|---|
| `bridge` (default) | Private internal network; containers can reach each other via IP, isolated from host |
| `host` | Container shares the host's network stack directly (no isolation) |
| `none` | No networking at all |

### 10.2 Creating a Custom Bridge Network — Step by Step
**Step 1 — Create the network**
```bash
docker network create my-app-network
```

**Step 2 — Run containers attached to it**
```bash
docker run -d --name backend --network my-app-network my-backend-image
docker run -d --name frontend --network my-app-network my-frontend-image
```

**Step 3 — Containers can now reach each other by *name* (built-in DNS)**
Inside the `frontend` container, you could connect to `http://backend:5000` — Docker's embedded DNS resolves `backend` to that container's internal IP automatically. (This only works on custom networks, not the default `bridge`.)

### 10.3 Port Publishing vs Exposing
- `EXPOSE` in a Dockerfile is **documentation only** — it doesn't actually open any port to the outside world.
- `-p host:container` at `docker run` time is what **actually publishes** a port so it's reachable from outside the container/host.

---

## 11. Docker Compose — Multi-Container Apps

### 11.1 What is Docker Compose & Why
Real applications usually need more than one container — e.g., a web app **and** a database. Running each with separate long `docker run` commands gets messy fast. **Docker Compose** lets you define your *entire* multi-container app in one YAML file and bring it all up/down with a single command.

### 11.2 `docker-compose.yml` — Structure Explained
```yaml
version: "3.9"

services:
  web:
    build: .                     # build from Dockerfile in current folder
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: mongo:6.0
    volumes:
      - db-data:/data/db
    networks:
      - app-network

volumes:
  db-data:

networks:
  app-network:
```

| Key | Meaning |
|---|---|
| `services` | Each container your app needs |
| `build` | Build an image from a local Dockerfile |
| `image` | Use a ready-made image instead of building one |
| `ports` | Same as `-p` in `docker run` |
| `volumes` (top-level) | Declares named volumes for persistence |
| `networks` | Declares custom networks so services can talk by name |
| `depends_on` | Controls startup order |

### 11.3 Compose Commands — Step by Step
```bash
docker compose up -d        # build (if needed) and start ALL services in the background
docker compose ps           # list running services in this project
docker compose logs -f web  # follow logs for one specific service
docker compose down         # stop and remove all containers/networks for this project
docker compose down -v      # also remove the named volumes (careful — deletes data!)
```

---

## 12. Container Management — Lifecycle Recap

```
Image  →  docker run  →  Container (Running)  →  exit/stop  →  Container (Stopped)
                                                        │
                                              docker start (resumes SAME container)
```

**Full lifecycle example:**
```bash
docker run -it ubuntu          # 1. Create + start a new container, work inside, then exit
docker ps -a                   # 2. Confirm it now shows as "Exited" but still exists
docker start my-ubuntu         # 3. Resume the SAME container (not a new one)
docker stop my-ubuntu          # 4. Stop it again when done
```

**Container states:**
- **Running** – currently executing
- **Stopped / Exited** – finished execution, but still exists (and can be restarted)
- **Paused** – temporarily suspended (via `docker pause` / `docker unpause`)

---

## 13. Security Best Practices

1. **Don't run containers as root** where avoidable — add `USER appuser` in your Dockerfile.
2. **Use official/minimal base images** (e.g., `alpine` variants) to reduce attack surface.
3. **Pin specific versions/tags** instead of `latest`, for reproducible, predictable builds.
4. **Never bake secrets into images** (API keys, passwords) — pass them at runtime via `-e`, secrets managers, or `.env` files excluded from version control.
5. **Scan images for vulnerabilities** (`docker scout cves <image>` or third-party tools like Trivy).
6. **Limit container resources** to avoid one container starving the host:
   ```bash
   docker run -d --memory=512m --cpus=1 my-app
   ```
7. **Keep Docker Engine updated** — security patches matter.
8. **Avoid exposing the Docker socket** (`/var/run/docker.sock`) into containers unless absolutely necessary — it effectively grants host-level control.

---

## 14. Monitoring & Logging

```bash
docker logs -f <container>            # follow live logs
docker stats                          # live CPU/memory/network usage, all containers
docker inspect <container>            # full JSON metadata (IP, mounts, env vars, etc.)
docker events                         # real-time stream of Docker daemon events
docker top <container>                # processes running inside a container
```

**In Docker Desktop (GUI):**
- **Containers tab** → click a container to see logs, stats, and a built-in terminal.
- **Images tab** → green dot next to an image means it's currently in use by a running container.

---

## 15. Troubleshooting Common Issues

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Cannot connect to the Docker daemon` | Daemon not running | `sudo systemctl start docker` (Linux) or open Docker Desktop |
| `permission denied` on docker commands | User not in `docker` group | `sudo usermod -aG docker $USER` then re-login |
| Container exits immediately | Main process finished / crashed | `docker logs <container>` to see the error |
| `port is already allocated` | Host port already in use | Use a different host port: `-p 8081:80` |
| Changes to code not reflected | Using a copied file instead of a bind mount | Use `-v <host-path>:<container-path>` for live dev |
| Disk filling up | Old images/containers/volumes piling up | `docker system prune -a --volumes` (⚠️ deletes unused data) |
| `image not found` / `manifest unknown` | Typo in image name/tag, or private image without login | Double-check name/tag, run `docker login` if private |

---

## 16. Interview Questions

1. **What is the difference between a Docker Image and a Docker Container?**
   An image is a static, read-only blueprint; a container is a running (or stopped) instance created from that image — similar to a class vs an object in OOP.

2. **How is a Docker container different from a Virtual Machine?**
   Containers share the host OS kernel and are lightweight/fast to start; VMs include a full guest OS and are heavier/slower, but offer stronger isolation.

3. **What is the difference between `docker run`, `docker start`, and `docker stop`?**
   `run` always creates a brand-new container; `start` resumes an existing stopped container; `stop` gracefully stops a running one. None of `start`/`stop` create new containers.

4. **What is the difference between `CMD` and `ENTRYPOINT` in a Dockerfile?**
   `CMD` sets a default command that's easily overridden at `docker run` time; `ENTRYPOINT` defines a fixed executable that's harder to override (often used together: `ENTRYPOINT` for the binary, `CMD` for default args).

5. **What's the difference between a named volume and a bind mount?**
   A named volume is fully managed by Docker (location abstracted away) — ideal for production data. A bind mount maps an exact host path you choose — ideal for local development.

6. **Why does Docker Desktop on Mac/Windows need a VM, but Docker on Linux doesn't?**
   Containers rely on Linux kernel features (namespaces/cgroups). Mac/Windows don't have a Linux kernel natively, so Docker Desktop runs a lightweight Linux VM in the background to provide one.

7. **What is the Docker build cache, and why does instruction order in a Dockerfile matter?**
   Each Dockerfile instruction creates a cached layer. Putting rarely-changing instructions (dependency installs) before frequently-changing ones (source code copy) avoids unnecessary cache invalidation and speeds up builds.

8. **What problem do multi-stage builds solve?**
   They let you use a full build environment in one stage, then copy only the final compiled artifacts into a lightweight final image — keeping production images small and secure.

9. **How do containers on a custom Docker network discover each other?**
   Docker provides built-in DNS on custom (non-default) bridge networks, so containers can reach each other by **container name** instead of IP address.

10. **What happens to data inside a container if the container is deleted, and how do you prevent data loss?**
    By default, all data is lost since the writable layer is destroyed with the container. Volumes (or bind mounts) prevent this by storing data outside the container's lifecycle.

---

## 17. Enterprise-Level Project Demo

**Scenario:** Containerize a 3-tier application — a Node.js API, a MongoDB database, and an Nginx reverse proxy — with persistent storage and a private network, all orchestrated via Docker Compose.

**Step 1 — Project structure**
```
my-app/
├── api/
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── nginx/
│   └── default.conf
└── docker-compose.yml
```

**Step 2 — `api/Dockerfile` (multi-stage)**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Step 3 — `docker-compose.yml`**
```yaml
version: "3.9"

services:
  api:
    build: ./api
    container_name: app-api
    environment:
      - MONGO_URI=mongodb://db:27017/myapp
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: mongo:6.0
    container_name: app-db
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: app-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
```

**Step 4 — `nginx/default.conf` (reverse proxy to the API)**
```nginx
server {
    listen 80;
    location / {
        proxy_pass http://api:5000;
    }
}
```

**Step 5 — Bring everything up**
```bash
docker compose up -d --build
```

**Step 6 — Verify**
```bash
docker compose ps               # all 3 services should be "running"
curl http://localhost            # should reach the API through Nginx
docker volume inspect mongo-data # confirm MongoDB data is persisted separately
```

**What this demonstrates:**
- Multi-stage builds → small, production-ready API image
- Custom network → `api`, `db`, `nginx` resolve each other by name
- Named volume → MongoDB data survives container restarts/removal
- Nginx as a reverse proxy → only port 80 is exposed externally; internal services stay private
- Single-command orchestration → `docker compose up` / `down` for the whole stack

---

## 18. Quick Revision Sheet

### Core Concepts
| Term | Meaning |
|---|---|
| Image | Static blueprint for a container |
| Container | Running instance of an image |
| Registry | Storage for images (e.g., Docker Hub) |
| Dockerfile | Instructions to build an image |
| Volume | Persistent storage outside container lifecycle |
| Compose | Tool to run multi-container apps from one YAML file |

### Image Commands
```bash
docker pull <image>            # download image
docker images                  # list local images
docker build -t name:tag .     # build image from Dockerfile
docker tag src new:tag         # re-tag an image
docker push name:tag           # upload to registry
docker rmi <image>             # remove image
```

### Container Commands
```bash
docker run <image>             # create + start new container
docker run -it <image>         # interactive mode
docker run -d <image>          # detached (background) mode
docker run -p host:container <image>   # port mapping
docker run -v vol:/path <image>        # named volume
docker run -v /host/path:/path <image> # bind mount
docker ps                      # list running containers
docker ps -a                   # list ALL containers
docker start <name>            # resume stopped container
docker stop <name>             # stop running container
docker restart <name>          # stop + start
docker rm <name>                # remove stopped container
docker exec -it <name> bash    # shell into a running container
docker logs -f <name>          # follow logs
docker inspect <name>          # full metadata
docker stats                   # live resource usage
```

### Volume Commands
```bash
docker volume create <name>
docker volume ls
docker volume inspect <name>
docker volume rm <name>
docker volume prune
```

### Network Commands
```bash
docker network ls
docker network create <name>
docker network inspect <name>
docker network connect <network> <container>
```

### Compose Commands
```bash
docker compose up -d
docker compose down
docker compose ps
docker compose logs -f <service>
```

### Cleanup
```bash
docker container prune    # remove stopped containers
docker image prune        # remove unused images
docker volume prune        # remove unused volumes
docker system prune -a --volumes   # remove EVERYTHING unused (⚠️ careful)
```
