# 🚀 Complete Kubernetes Learning Guide
### From Beginner to Production-Ready | CKA/CKAD Exam Prep

> **Author's Note:** This guide assumes you know Docker basics. Every Kubernetes term is explained on first use. All commands run on local clusters (minikube/kind) unless stated otherwise. This guide is structured for both real-world DevOps roles and CKA/CKAD certification prep.

---

## Table of Contents

| # | Chapter | Level |
|---|---------|-------|
| 1 | Introduction to Kubernetes & Container Orchestration | Beginner |
| 2 | Kubernetes Architecture Deep Dive | Beginner–Intermediate |
| 3 | Setting Up a Cluster | Beginner |
| 4 | kubectl Fundamentals & Cluster Interaction | Beginner |
| 5 | Pods – The Basic Building Block | Beginner |
| 6 | ReplicaSets & Deployments | Intermediate |
| 7 | Services & Basic Networking | Intermediate |
| 8 | ConfigMaps & Secrets | Intermediate |
| 9 | Volumes, PV, PVC, StorageClasses | Intermediate |
| 10 | Namespaces, ResourceQuotas & LimitRanges | Intermediate |
| 11 | Labels, Selectors, Annotations | Intermediate |
| 12 | Health Checks – Probes | Intermediate |
| 13 | Jobs & CronJobs | Intermediate |
| 14 | DaemonSets | Intermediate |
| 15 | StatefulSets | Intermediate–Advanced |
| 16 | Ingress & Ingress Controllers | Intermediate–Advanced |
| 17 | Helm – Package Manager | Intermediate–Advanced |
| 18 | RBAC – Security & Access Control | Advanced |
| 19 | Resource Management & Autoscaling | Advanced |
| 20 | Networking Deep Dive – CNI & Network Policies | Advanced |
| 21 | Monitoring & Logging | Advanced |
| 22 | Kubernetes Security Best Practices | Advanced |
| 23 | CI/CD Integration | Advanced |
| 24 | Troubleshooting & Debugging | Advanced |
| 25 | Production Best Practices | Advanced |
| 26 | CRDs, Operators & Service Mesh | Expert |
| 27 | Kubernetes Cheat Sheet | Reference |
| 28 | Glossary | Reference |

---

## 1. Introduction to Kubernetes & Container Orchestration

### 1.1 Learning Objectives

- Understand what container orchestration is and why it's needed
- Know the history of Kubernetes and its origin at Google
- Compare Kubernetes vs Docker Swarm
- Understand where Kubernetes fits in the modern DevOps landscape

### 1.2 Concept Explanation

### The Problem Before Kubernetes

Imagine you're running a popular food delivery app. During lunch hours, 10,000 people place orders simultaneously. During off-peak hours, only 100. With traditional servers, you'd either over-provision (waste money) or under-provision (crash during peak). Docker containers solved packaging — but who manages hundreds of containers across dozens of servers?

That's the problem **container orchestration** solves.

> **Container Orchestration:** Automatically deploying, scaling, healing, and managing containers across a cluster of machines.

### What is Kubernetes?

**Kubernetes** (Greek for "helmsman" or "pilot") is an open-source container orchestration platform. It was born inside Google (project "Borg") and open-sourced in 2014. The **Cloud Native Computing Foundation (CNCF)** now governs it.

Kubernetes is often abbreviated as **K8s** (because there are 8 letters between 'K' and 's').

### What Kubernetes Does

- **Deploys** containers automatically across nodes
- **Scales** applications up/down based on demand
- **Self-heals** — restarts crashed containers, replaces unhealthy nodes
- **Load balances** traffic across container instances
- **Rolls out updates** with zero downtime
- **Manages configuration and secrets** separately from container images
- **Schedules** containers to optimal nodes based on resource availability

### Why Not Just Docker Swarm?

| Feature | Kubernetes | Docker Swarm |
|---------|-----------|-------------|
| Adoption | Industry standard | Declining |
| Ecosystem | Massive (Helm, Istio, Prometheus…) | Limited |
| Auto-scaling | Built-in HPA, VPA, CA | Manual |
| Self-healing | Advanced (probes, restart policies) | Basic |
| Config Management | ConfigMaps, Secrets | Limited |
| Networking | CNI plugins, Network Policies | Overlay networks |
| Learning Curve | Steep | Gentle |
| Production use | Dominant | Rare |
| Cloud support | EKS, GKE, AKS, etc. | Minimal |

> **Bottom line:** Kubernetes won the container wars. Docker Swarm is essentially legacy. Every major cloud has managed Kubernetes, not managed Swarm.

### Brief History

```
2003 – Google's internal "Borg" system
2014 – Kubernetes open-sourced by Google at DockerCon
2015 – v1.0 released; CNCF formed
2016 – Helm (package manager) donated to CNCF
2017 – Docker officially supports Kubernetes
2018 – All major clouds offer managed K8s (EKS, GKE, AKS)
2019 – Kubernetes becomes most active OSS project after Linux
2022 – Dockershim removed; containerd/CRI-O become standard runtimes
2024 – K8s v1.30+ with stable Gateway API, improved autoscaling
```

### 1.3 Architecture / How it Works

```
┌───────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                       │
│  [Container] [Container] [Container] [Container]          │
└───────────────────────────────────────────────────────────┘
                           ↕ managed by
┌──────────────────────────────────────────────────────────┐
│                      KUBERNETES                          │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐   │
│  │ Control Plane│    │   Worker     │   │  Worker    │   │
│  │  (the brain) │    │   Node 1     │   │  Node 2    │   │
│  └──────────────┘    └──────────────┘   └────────────┘   │
└──────────────────────────────────────────────────────────┘
                           ↕ runs on
┌──────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE                              │
│  [Cloud VMs] [Bare Metal] [On-Prem] [Hybrid]             │
└──────────────────────────────────────────────────────────┘
```

### 1.4 YAML Manifest / Config Example

_(No manifest needed for Chapter 1 — concepts only. First manifest appears in Chapter 5.)_

### 1.5 Hands-on Implementation

No cluster setup yet. Try this thought exercise:

```bash
# Mental model: Think of Kubernetes as an OS for your data center
# - Containers are processes
# - Nodes are CPUs
# - The Scheduler is the OS kernel (deciding which CPU runs which process)
# - kubectl is your shell (like bash, but for the cluster)
```

### 1.6 Common Errors & Troubleshooting

**Misconception 1:** "Kubernetes replaces Docker"
- **Reality:** Kubernetes orchestrates containers. Docker (or containerd) still builds and runs them. They're complementary.

**Misconception 2:** "I need Kubernetes for every app"
- **Reality:** A single-service app with 1–2 instances doesn't need K8s. The overhead is significant. Start with K8s when you have multiple services or need auto-scaling.

**Misconception 3:** "Docker Swarm is good enough"
- **Reality:** For production in 2024+, K8s is the industry standard. Job postings, tooling, and cloud support all favor K8s.

### 1.7 Best Practices

- Learn Docker thoroughly before Kubernetes (build, run, volumes, networks)
- Start with `minikube` or `kind` locally — don't jump to cloud clusters first
- Understand that K8s is declarative (you describe desired state; K8s figures out how)
- Don't try to memorize everything — understand the concepts first

### 1.8 Key Takeaways / Summary

- Kubernetes is a container **orchestration** platform, not a replacement for Docker
- It was created by Google (based on Borg) and donated to CNCF in 2015
- K8s handles deployment, scaling, healing, load balancing, and config management
- Kubernetes has won the orchestration wars — Docker Swarm is legacy
- K8s is both production-critical infrastructure AND in-demand job skill

### 1.9 Practice Questions / Tasks

1. **Conceptual:** What are 4 things Kubernetes does that plain Docker cannot?
2. **Research:** Find 3 companies publicly known to use Kubernetes in production. What scale do they run?
3. **Comparison:** List 3 reasons someone would choose Kubernetes over Docker Swarm today.

---

## 2. Kubernetes Architecture Deep Dive

### 2.1 Learning Objectives

- Understand the two-tier structure: Control Plane vs Worker Nodes
- Know the role of each component: etcd, API server, Scheduler, Controller Manager, kubelet, kube-proxy
- Understand how a `kubectl apply` command flows through the system
- Be able to explain architecture in a CKA/CKAD interview

### 2.2 Concept Explanation

Kubernetes follows a **master-worker** (now called **control plane–worker node**) architecture.

Think of it like a restaurant:
- **Control Plane** = Restaurant manager — takes orders, decides who does what, tracks everything
- **Worker Nodes** = Kitchen staff — actually cook the food (run containers)
- **etcd** = The order book — the single source of truth
- **Scheduler** = Host seating guests — decides which table (node) each order (pod) goes to
- **kubelet** = Line cook — gets instructions and does the actual cooking (runs containers)

### 2.3 Architecture / How it Works

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        CONTROL PLANE (Master Node)                        │
│                                                                           │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────────────┐     │
│  │             │  │   kube-apiserver │  │   kube-controller-manager │     │
│  │    etcd     │◄─┤  (front door of  │  │  ┌──────────────────────┐ │     │
│  │ (key-value  │  │   the cluster)   │  │  │ Node Controller       │ │    │
│  │  database)  │  │                  │  │  │ Deployment Controller │ │    │
│  │             │  │                  │  │  │ ReplicaSet Controller │ │    │
│  └─────────────┘  └────────┬─────────┘  │  │ Job Controller        │ │    │
│                             │            │  └──────────────────────┘ │    │
│  ┌──────────────────────────┘            └───────────────────────────┘    │
│  │          ┌───────────────────────────────────────────────────────┐     │
│  │          │              kube-scheduler                            │    │
│  │          │  (watches for unscheduled pods, picks best node)      │     │
│  │          └───────────────────────────────────────────────────────┘     │
│  │                                                                        │
│  │  Optional: cloud-controller-manager (for cloud providers)              │
└──┼──────────────────────────────────────────────────────────────────────  │
                                                                            │
   │   kubectl / API clients
                                                        │
┌──▼───────────────────┐     ┌──────────────────────────┐
│    WORKER NODE 1      │     │    WORKER NODE 2        │
│                       │     │                         │
│  ┌─────────────────┐  │     │  ┌─────────────────┐    │
│  │     kubelet     │  │     │  │     kubelet     │    │
│  │ (node agent)    │  │     │  │ (node agent)    │    │
│  └────────┬────────┘  │     │  └────────┬────────┘    │
│           │            │     │           │            │
│  ┌────────▼────────┐  │     │  ┌────────▼────────┐    │
│  │  Container      │  │     │  │  Container      │    │
│  │  Runtime        │  │     │  │  Runtime        │    │
│  │ (containerd /   │  │     │  │ (containerd /   │    │
│  │  CRI-O)         │  │     │  │  CRI-O)         │    │
│  └─────────────────┘  │     │  └─────────────────┘    │
│                        │     │                        │
│  ┌─────────────────┐  │     │  ┌─────────────────┐    │
│  │   kube-proxy    │  │     │  │   kube-proxy    │    │
│  │ (network rules) │  │     │  │ (network rules) │    │
│  └─────────────────┘  │     │  └─────────────────┘    │
│                        │     │                        │
│  ┌─────────────────┐  │     │  ┌─────────────────┐    │
│  │  Pod: [C1][C2]  │  │     │  │  Pod: [C3][C4]  │    │
│  └─────────────────┘  │     │  └─────────────────┘    │
└──────────────────────┘     └──────────────────────────┘
```

### Component Deep Dive

#### 🗄️ etcd
- Distributed key-value store — the cluster's database
- Stores **all** cluster state: nodes, pods, configs, secrets, RBAC rules
- Uses the Raft consensus algorithm for high availability
- **Critical:** If etcd is lost without backup, the cluster is lost
- Only the API server talks directly to etcd

#### 🚪 kube-apiserver
- The **front door** of Kubernetes — everything goes through it
- Exposes the Kubernetes REST API
- Authenticates and authorizes every request
- Validates and processes API objects (Pods, Services, etc.)
- The only component that reads/writes to etcd
- Horizontally scalable (run multiple replicas for HA)

#### 📅 kube-scheduler
- Watches for newly created Pods with no assigned node
- Selects the best node based on:
  - Resource requirements (CPU, memory requests)
  - Node affinity/anti-affinity rules
  - Taints and tolerations
  - Available resources
- Does NOT run the pod — just decides WHERE it runs
- Writes the node assignment back to API server

#### 🔄 kube-controller-manager
- Runs multiple controllers in a single binary
- Each controller watches the API server and reconciles actual vs desired state
- **Node Controller:** Detects node failures
- **Deployment Controller:** Manages Deployments
- **ReplicaSet Controller:** Ensures correct number of pod replicas
- **Job Controller:** Manages Jobs to completion
- **Endpoint Controller:** Populates Endpoints objects (joins Services and Pods)

#### 🤖 kubelet
- Agent running on **every worker node**
- Registers the node with the API server
- Receives PodSpecs and ensures containers described in them are running and healthy
- Reports node and pod status back to the control plane
- Interacts with the container runtime via CRI (Container Runtime Interface)

#### 🌐 kube-proxy
- Network proxy running on every node
- Maintains network rules (iptables/IPVS) for Pod-to-Pod and external-to-Pod communication
- Implements the Service concept (load balancing to pod IPs)

#### 📦 Container Runtime
- Actually runs the containers
- Must implement CRI (Container Runtime Interface)
- Options: **containerd** (most common), **CRI-O** (used by OpenShift)
- **Note:** Docker was removed as a runtime in K8s v1.24+ (but images still work; Docker uses containerd internally)

### Request Flow: `kubectl apply -f pod.yaml`

```
User
 │
 ▼
kubectl (client)
 │  1. kubectl reads YAML, sends HTTP POST to API server
 ▼
kube-apiserver
 │  2. Authentication (TLS certs, tokens, OIDC)
 │  3. Authorization (RBAC rules)
 │  4. Admission Control (webhooks, limits, policies)
 │  5. Validation (is the YAML valid?)
 │  6. Writes Pod object to etcd
 ▼
etcd (stores pod spec with status: Pending)
 │
 ▼
kube-scheduler (watching API server for unscheduled pods)
 │  7. Finds Pod with no nodeName assigned
 │  8. Scores all eligible nodes
 │  9. Picks best node, writes nodeName to pod via API server
 ▼
kube-apiserver → etcd (pod now has nodeName)
 │
 ▼
kubelet (on chosen node, watching API server for pods assigned to its node)
 │  10. Sees pod assigned to its node
 │  11. Pulls container image via container runtime
 │  12. Creates and starts container
 │  13. Reports pod status: Running back to API server
 ▼
etcd (pod status = Running)
```

### 2.4 YAML Manifest / Config Example

No YAML for this chapter — but here's how to view component configuration:

```bash
# View control plane pods (kubeadm clusters)
kubectl get pods -n kube-system

# View etcd pod
kubectl describe pod etcd-minikube -n kube-system

# Check component statuses
kubectl get componentstatuses
# or (newer)
kubectl get cs
```

### 2.5 Hands-on Implementation

```bash
# Start minikube (we'll set it up fully in Chapter 3)
minikube start

# Explore the control plane
kubectl get pods -n kube-system
# Expected output:
# NAME                               READY   STATUS    RESTARTS   AGE
# coredns-xxx                        1/1     Running   0          5m
# etcd-minikube                      1/1     Running   0          5m
# kube-apiserver-minikube            1/1     Running   0          5m
# kube-controller-manager-minikube   1/1     Running   0          5m
# kube-proxy-xxx                     1/1     Running   0          5m
# kube-scheduler-minikube            1/1     Running   0          5m
# storage-provisioner                1/1     Running   0          5m

# Inspect the API server
kubectl describe pod kube-apiserver-minikube -n kube-system | head -40

# Check nodes
kubectl get nodes -o wide
# Expected:
# NAME       STATUS   ROLES           AGE   VERSION   INTERNAL-IP   ...
# minikube   Ready    control-plane   5m    v1.29.0   192.168.49.2  ...

# Check node details
kubectl describe node minikube

# View the kubelet service on the node
minikube ssh -- systemctl status kubelet

# View etcd health
kubectl exec -it etcd-minikube -n kube-system -- \
  etcdctl --cacert=/var/lib/minikube/certs/etcd/ca.crt \
          --cert=/var/lib/minikube/certs/etcd/server.crt \
          --key=/var/lib/minikube/certs/etcd/server.key \
          endpoint health
# Expected: 127.0.0.1:2379 is healthy: successfully committed proposal...
```

### 2.6 Common Errors & Troubleshooting

**Error 1: Node shows `NotReady`**
```bash
kubectl get nodes
# NAME       STATUS     ROLES    AGE   VERSION
# worker-1   NotReady   <none>   10m   v1.29.0

# Debug:
kubectl describe node worker-1
# Look for: Conditions section — check MemoryPressure, DiskPressure, PIDPressure, Ready
# Common causes: kubelet crashed, network plugin not installed, disk full

# Check kubelet on the node:
ssh worker-1 "systemctl status kubelet"
ssh worker-1 "journalctl -xeu kubelet | tail -50"
```

**Error 2: etcd health check fails**
```bash
# Symptom: kubectl commands hang or return "etcdserver: request timed out"
# Fix: Check etcd pod logs
kubectl logs etcd-minikube -n kube-system

# Check disk space (etcd is I/O sensitive)
df -h /var/lib/etcd
```

**Error 3: API server unreachable**
```bash
# Symptom: kubectl: connection refused
# Check:
kubectl cluster-info
# If it shows localhost:8080, your kubeconfig is wrong

# View current config
kubectl config view
kubectl config current-context
```

### 2.7 Best Practices

- **Always back up etcd** before any cluster upgrades or major changes (`etcdctl snapshot save`)
- Run the **control plane in HA mode** (3 or 5 etcd nodes) for production
- **Never run workloads on control plane nodes** (use taints to prevent it)
- Monitor **kube-apiserver latency** — it's the critical path for everything
- **Limit direct etcd access** — only the API server should talk to it
- Keep **kube-controller-manager and kube-scheduler** as multiple replicas with leader election

### 2.8 Key Takeaways / Summary

- Kubernetes has two tiers: **Control Plane** (brain) and **Worker Nodes** (muscle)
- **etcd** is the single source of truth — protect it like your life
- **API server** is the only entry point — all components talk through it
- **kubelet** on each node actually runs containers using the container runtime
- Every `kubectl` command translates to an API server call → etcd read/write → controller reconciliation

### 2.9 Practice Questions / Tasks

1. **Draw from memory:** Sketch the K8s architecture diagram with all 6 core components and their connections
2. **Trace a request:** Walk through every step that happens when you run `kubectl delete pod my-pod`
3. **Component quiz:** What happens if the scheduler goes down? What happens if etcd goes down?

---

## 3. Setting Up a Cluster

### 3.1 Learning Objectives

- Set up a local Kubernetes cluster using minikube and kind
- Understand kubeadm for production-style clusters
- Know the difference between local clusters and managed cloud services
- Configure kubectl to connect to your cluster

### 3.2 Concept Explanation

Before writing any Kubernetes manifests, you need a cluster. You have several options:

| Tool | Use Case | Difficulty | Notes |
|------|----------|-----------|-------|
| **minikube** | Local dev/learning | Easy | Single/multi-node, many addons |
| **kind** | CI/CD, multi-node local | Easy | Kubernetes IN Docker |
| **kubeadm** | Production bare-metal, on-prem | Medium | Official bootstrap tool |
| **k3s** | Edge, IoT, lightweight | Easy | Rancher's lightweight K8s |
| **EKS** | AWS managed K8s | Medium | Best for AWS workloads |
| **GKE** | Google managed K8s | Medium | Most mature managed K8s |
| **AKS** | Azure managed K8s | Medium | Best for Azure workloads |

> **For CKA/CKAD exam:** The exam uses real clusters (kubeadm-based). Practice with both minikube and kind.

### 3.3 Architecture / How it Works

### minikube Architecture

```
Your Machine (macOS/Linux/Windows)
│
├── minikube VM or Container
│   ├── Control Plane (kube-apiserver, etcd, scheduler, controller-manager)
│   └── Worker Node (kubelet, kube-proxy, container runtime)
│
└── kubectl (talks to minikube's API server via port-forwarding)
```

### kind Architecture

```
Your Machine (Docker must be running)
│
├── Docker Container: "kind-control-plane" (acts as control plane)
├── Docker Container: "kind-worker" (acts as worker node)
└── Docker Container: "kind-worker2" (optional additional worker)

kubectl → kind's API server inside Docker container
```

### 3.4 YAML Manifest / Config Example

### kind Cluster Config (Multi-node)

```yaml
# kind-cluster.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: my-cluster
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
  - role: worker
  - role: worker
```

### kubeadm Init Config (Production-style)

```yaml
# kubeadm-config.yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
nodeRegistration:
  criSocket: unix:///var/run/containerd/containerd.sock
---
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: v1.29.0
controlPlaneEndpoint: "k8s-api.example.com:6443"
networking:
  podSubnet: "10.244.0.0/16"
  serviceSubnet: "10.96.0.0/12"
etcd:
  local:
    dataDir: /var/lib/etcd
```

### 3.5 Hands-on Implementation

### Option A: minikube (Recommended for Beginners)

```bash
# 1. Install minikube (macOS)
brew install minikube

# Install minikube (Linux)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# 2. Install kubectl
# macOS:
brew install kubectl
# Linux:
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 3. Start a cluster
minikube start --cpus=2 --memory=4096 --kubernetes-version=v1.29.0
# Expected output:
# 😄  minikube v1.32.0
# ✨  Automatically selected the docker driver
# 📌  Using Docker Desktop driver with root privileges
# 🔥  Creating docker container (CPUs=2, Memory=4096MB) ...
# 🐳  Preparing Kubernetes v1.29.0 on Docker 24.0.7 ...
# 🔗  Configuring bridge CNI (Container Networking Interface) ...
# ✅  Done! kubectl is now configured to use "minikube" cluster

# 4. Verify cluster is running
kubectl cluster-info
# Expected:
# Kubernetes control plane is running at https://127.0.0.1:51234
# CoreDNS is running at https://127.0.0.1:51234/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

kubectl get nodes
# NAME       STATUS   ROLES           AGE   VERSION
# minikube   Ready    control-plane   2m    v1.29.0

# 5. Enable useful addons
minikube addons enable ingress          # NGINX Ingress Controller
minikube addons enable metrics-server   # For HPA
minikube addons enable dashboard        # K8s Dashboard

# 6. Open the dashboard
minikube dashboard

# 7. Start a multi-node cluster
minikube start --nodes 3 --profile multi-node
kubectl get nodes
# NAME           STATUS   ROLES           AGE   VERSION
# multi-node     Ready    control-plane   3m    v1.29.0
# multi-node-m02 Ready    <none>          2m    v1.29.0
# multi-node-m03 Ready    <none>          2m    v1.29.0

# 8. Stop and delete
minikube stop
minikube delete  # removes the cluster entirely
```

### Option B: kind (Kubernetes IN Docker)

```bash
# 1. Install kind
# macOS:
brew install kind
# Linux:
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# 2. Create a single-node cluster
kind create cluster --name my-k8s

# 3. Create a multi-node cluster from config
kind create cluster --config kind-cluster.yaml --name multi-node

# 4. Verify
kubectl get nodes
# NAME                       STATUS   ROLES           AGE   VERSION
# my-cluster-control-plane   Ready    control-plane   2m    v1.29.0
# my-cluster-worker          Ready    <none>          90s   v1.29.0
# my-cluster-worker2         Ready    <none>          90s   v1.29.0

# 5. List clusters
kind get clusters

# 6. Delete cluster
kind delete cluster --name my-k8s
```

### Option C: kubeadm (Production/Exam Style)

```bash
# Prerequisites: 2 Linux VMs (1 control-plane, 1+ workers)
# Run on ALL nodes:

# Disable swap (required by Kubernetes)
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# Install containerd
sudo apt-get update
sudo apt-get install -y containerd.io
sudo systemctl enable containerd

# Configure containerd for Kubernetes
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd

# Install kubeadm, kubelet, kubectl
sudo apt-get install -y apt-transport-https ca-certificates curl
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# ---- Run ONLY on the control-plane node: ----
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# Setup kubectl for the current user
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install Flannel CNI plugin
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# ---- Run the join command on EACH WORKER NODE (output from kubeadm init): ----
sudo kubeadm join <control-plane-ip>:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>

# ---- Verify (from control-plane): ----
kubectl get nodes
```

### Managed Cloud Services (Brief Overview)

```bash
# AWS EKS
aws eks create-cluster \
  --name my-cluster \
  --kubernetes-version 1.29 \
  --role-arn arn:aws:iam::123456789:role/eks-role \
  --resources-vpc-config subnetIds=subnet-xxx,securityGroupIds=sg-xxx

aws eks update-kubeconfig --name my-cluster --region us-east-1

# Google GKE
gcloud container clusters create my-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-standard-4

gcloud container clusters get-credentials my-cluster --zone us-central1-a

# Azure AKS
az aks create \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 3 \
  --generate-ssh-keys

az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
```

### 3.6 Common Errors & Troubleshooting

**Error 1: `minikube start` fails with driver error**
```bash
# Error: "Exiting due to DRV_NOT_HEALTHY: Found driver(s) but none were healthy"
# Fix: Specify a working driver
minikube start --driver=docker
# or
minikube start --driver=virtualbox

# Check what drivers are available
minikube config defaults driver
```

**Error 2: kubeadm init fails with "swap is on"**
```bash
# Error: "[ERROR Swap]: running with swap on is not supported"
# Fix:
sudo swapoff -a
# Then retry kubeadm init
```

**Error 3: Worker node can't join cluster**
```bash
# Error: "couldn't validate the identity of the API server"
# Fix: Regenerate the join token (they expire after 24 hours)
kubeadm token create --print-join-command
```

### 3.7 Best Practices

- **Use minikube** for daily development and learning
- **Use kind** in CI pipelines (faster, Docker-based, no VMs)
- **Use kubeadm** to practice for CKA exam — the exam uses kubeadm-based clusters
- Always specify the **Kubernetes version** when creating clusters for reproducibility
- For production, use **managed services** (EKS/GKE/AKS) — let the cloud handle the control plane
- **Never run production workloads on minikube**

### 3.8 Key Takeaways / Summary

- minikube and kind are the best local options — start with minikube
- kubeadm is the standard way to bootstrap production clusters
- Cloud-managed services (EKS/GKE/AKS) abstract away control plane management
- kubectl is configured via `~/.kube/config` (the kubeconfig file)
- All tools ultimately give you the same Kubernetes API

### 3.9 Practice Questions / Tasks

1. Set up a 3-node kind cluster using a config file and verify all nodes are Ready
2. Use `kubectl config get-contexts` to see all your clusters. Switch between them using `kubectl config use-context`
3. Find the kubeconfig file location. What information does it contain? (hint: `cat ~/.kube/config`)

---

## 4. kubectl Fundamentals & Cluster Interaction

### 4.1 Learning Objectives

- Master the kubectl command structure and key subcommands
- Use imperative and declarative approaches
- Navigate cluster resources, namespaces, and output formats
- Use kubectl efficiently (autocomplete, aliases, dry-run)

### 4.2 Concept Explanation

**kubectl** is the command-line tool for interacting with Kubernetes clusters. Think of it as the "bash" for Kubernetes — it lets you create, read, update, and delete resources.

The general syntax is:
```
kubectl [command] [TYPE] [NAME] [flags]
```

Where:
- **command** = action (get, create, apply, delete, describe, logs, exec…)
- **TYPE** = resource type (pod, service, deployment, node…)
- **NAME** = resource name (optional — omit to list all)
- **flags** = options (-n for namespace, -o for output format…)

### Imperative vs Declarative

```
IMPERATIVE (how to do it):          DECLARATIVE (what you want):
kubectl run my-pod --image=nginx    kubectl apply -f pod.yaml

Pros: Quick, interactive            Pros: Version-controlled, repeatable
Cons: Hard to repeat, no audit      Cons: Slightly more verbose
Use: Testing, quick fixes           Use: Production, GitOps
```

> **CKA/CKAD tip:** Know BOTH. Exam time is limited — use imperative commands to generate YAML templates fast, then edit.

### 4.3 Architecture / How it Works

```
kubectl
  │
  ├── reads ~/.kube/config (kubeconfig)
  │   ├── clusters: API server URLs
  │   ├── users: credentials (certs, tokens)
  │   └── contexts: cluster + user + namespace combos
  │
  └── sends HTTPS requests to kube-apiserver
      ├── GET  /api/v1/pods         → list pods
      ├── POST /api/v1/namespaces/default/pods → create pod
      ├── PUT  /api/v1/.../pod-name  → update pod
      └── DELETE /api/v1/.../pod-name → delete pod
```

### 4.4 YAML Manifest / Config Example

```yaml
# ~/.kube/config (kubeconfig structure)
apiVersion: v1
kind: Config
preferences: {}

clusters:
  - name: minikube
    cluster:
      server: https://127.0.0.1:51234
      certificate-authority: /home/user/.minikube/ca.crt

users:
  - name: minikube
    user:
      client-certificate: /home/user/.minikube/profiles/minikube/client.crt
      client-key: /home/user/.minikube/profiles/minikube/client.key

contexts:
  - name: minikube
    context:
      cluster: minikube
      user: minikube
      namespace: default         # optional: sets default namespace

current-context: minikube
```

### 4.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# SETUP: Autocomplete & Aliases (do this once!)
#═══════════════════════════════════════════════

# Enable kubectl autocomplete (bash)
source <(kubectl completion bash)
echo "source <(kubectl completion bash)" >> ~/.bashrc

# Enable kubectl autocomplete (zsh)
source <(kubectl completion zsh)
echo "source <(kubectl completion zsh)" >> ~/.zshrc

# Create the 'k' alias (used heavily in CKA exam)
alias k=kubectl
complete -o default -F __start_kubectl k
echo "alias k=kubectl" >> ~/.bashrc

#═══════════════════════════════════════════════
# CONTEXT & CLUSTER MANAGEMENT
#═══════════════════════════════════════════════

kubectl config get-contexts               # list all contexts
kubectl config current-context            # show active context
kubectl config use-context minikube       # switch context
kubectl config set-context --current --namespace=dev  # set default namespace

#═══════════════════════════════════════════════
# GETTING RESOURCES
#═══════════════════════════════════════════════

kubectl get pods                          # list pods in current namespace
kubectl get pods -A                       # all namespaces
kubectl get pods -n kube-system           # specific namespace
kubectl get pods -o wide                  # with node IP and node name
kubectl get pods -o yaml                  # full YAML output
kubectl get pods -o json                  # JSON output
kubectl get pods --show-labels            # show labels column
kubectl get pods -l app=nginx             # filter by label
kubectl get pods --field-selector status.phase=Running  # filter by field

# Get multiple resource types
kubectl get pods,services,deployments

# Get all resource types in a namespace
kubectl get all -n default

# Watch resources in real-time
kubectl get pods -w

#═══════════════════════════════════════════════
# DESCRIBING RESOURCES (detailed info)
#═══════════════════════════════════════════════

kubectl describe pod my-pod
kubectl describe node minikube
kubectl describe service my-service

#═══════════════════════════════════════════════
# CREATING RESOURCES (Imperative)
#═══════════════════════════════════════════════

# Run a pod
kubectl run my-nginx --image=nginx:1.25

# Run a pod with specific port
kubectl run my-nginx --image=nginx:1.25 --port=80

# Create a deployment
kubectl create deployment my-dep --image=nginx:1.25 --replicas=3

# Create a service
kubectl expose deployment my-dep --port=80 --type=NodePort

# Create a namespace
kubectl create namespace dev

# Create ConfigMap
kubectl create configmap my-config --from-literal=key1=value1 --from-literal=key2=value2

# Create Secret
kubectl create secret generic my-secret --from-literal=password=mysecret

#═══════════════════════════════════════════════
# GENERATE YAML (Dry-Run — KEY EXAM SKILL)
#═══════════════════════════════════════════════

# Generate Pod YAML without creating it
kubectl run my-nginx --image=nginx:1.25 --dry-run=client -o yaml

# Save it to a file
kubectl run my-nginx --image=nginx:1.25 --dry-run=client -o yaml > pod.yaml

# Generate Deployment YAML
kubectl create deployment my-dep --image=nginx:1.25 --replicas=3 \
  --dry-run=client -o yaml > deployment.yaml

# Generate Service YAML
kubectl expose deployment my-dep --port=80 --type=ClusterIP \
  --dry-run=client -o yaml > service.yaml

#═══════════════════════════════════════════════
# APPLYING RESOURCES (Declarative)
#═══════════════════════════════════════════════

kubectl apply -f pod.yaml              # create or update from file
kubectl apply -f ./manifests/          # apply all YAML files in directory
kubectl apply -f https://url/manifest.yaml  # from URL
kubectl delete -f pod.yaml             # delete resources defined in file

#═══════════════════════════════════════════════
# EDITING RESOURCES
#═══════════════════════════════════════════════

kubectl edit deployment my-dep         # opens in $EDITOR (vim by default)
kubectl scale deployment my-dep --replicas=5  # scale imperatively
kubectl set image deployment/my-dep nginx=nginx:1.26  # update image

#═══════════════════════════════════════════════
# LOGS & DEBUGGING
#═══════════════════════════════════════════════

kubectl logs my-pod                    # current logs
kubectl logs my-pod -f                 # follow (stream) logs
kubectl logs my-pod --previous         # logs from previous (crashed) container
kubectl logs my-pod -c sidecar-container  # specific container in multi-container pod
kubectl logs -l app=nginx --all-containers  # logs from all pods with label

#═══════════════════════════════════════════════
# EXEC INTO CONTAINERS
#═══════════════════════════════════════════════

kubectl exec my-pod -- ls /            # run a command
kubectl exec -it my-pod -- /bin/bash   # interactive shell
kubectl exec -it my-pod -c nginx -- /bin/sh  # shell in specific container

#═══════════════════════════════════════════════
# PORT FORWARDING
#═══════════════════════════════════════════════

kubectl port-forward pod/my-pod 8080:80         # local:container
kubectl port-forward service/my-svc 8080:80     # forward to service
kubectl port-forward deployment/my-dep 8080:80  # forward to deployment

#═══════════════════════════════════════════════
# COPYING FILES
#═══════════════════════════════════════════════

kubectl cp my-pod:/etc/nginx/nginx.conf ./nginx.conf  # from pod
kubectl cp ./index.html my-pod:/usr/share/nginx/html/ # to pod

#═══════════════════════════════════════════════
# EXPLAINING API OBJECTS
#═══════════════════════════════════════════════

kubectl explain pod                    # top-level fields
kubectl explain pod.spec               # spec fields
kubectl explain pod.spec.containers    # containers array fields
kubectl explain deployment.spec.strategy  # specific nested field

#═══════════════════════════════════════════════
# USEFUL jsonpath QUERIES
#═══════════════════════════════════════════════

# Get pod IP
kubectl get pod my-pod -o jsonpath='{.status.podIP}'

# Get image of first container
kubectl get pod my-pod -o jsonpath='{.spec.containers[0].image}'

# Get all pod names
kubectl get pods -o jsonpath='{.items[*].metadata.name}'

# Get node names and their status
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[-1].type}{"\n"}{end}'

#═══════════════════════════════════════════════
# DELETING RESOURCES
#═══════════════════════════════════════════════

kubectl delete pod my-pod              # delete a pod
kubectl delete pod my-pod --force      # force delete (skip graceful shutdown)
kubectl delete pods --all              # delete all pods in namespace
kubectl delete -f pod.yaml             # delete from manifest
kubectl delete namespace dev           # delete namespace (and everything in it!)
```

### 4.6 Common Errors & Troubleshooting

**Error 1: `The connection to the server was refused`**
```bash
# kubectl can't reach the API server
kubectl cluster-info
# Fix: Start your cluster
minikube start
# or check your context
kubectl config current-context
kubectl config get-contexts
```

**Error 2: `Error from server (NotFound): pods "my-pod" not found`**
```bash
# Wrong namespace
kubectl get pods -A | grep my-pod
kubectl get pods -n correct-namespace
# Always specify namespace or set a default:
kubectl config set-context --current --namespace=correct-namespace
```

**Error 3: `Error from server (Forbidden): pods is forbidden`**
```bash
# RBAC issue — your user doesn't have permission
kubectl auth can-i get pods                    # check current permissions
kubectl auth can-i get pods --as=system:anonymous  # check as anonymous
# Fix: Create a RoleBinding (see Chapter 18)
```

### 4.7 Best Practices

- **Always use `--dry-run=client -o yaml`** before applying to preview the manifest
- **Set namespace aliases** in your shell for frequent namespaces
- **Use `kubectl explain`** to discover fields — don't memorize all YAML fields
- **Never use `kubectl delete pod --all` in production** without confirming the namespace
- **Use `kubectl diff -f manifest.yaml`** to see what would change before applying
- For CKA exam: memorize `kubectl create deployment`, `kubectl expose`, `kubectl run` with `--dry-run=client -o yaml`

### 4.8 Key Takeaways / Summary

- kubectl follows: `kubectl [command] [type] [name] [flags]`
- Use `--dry-run=client -o yaml` to generate YAML templates quickly
- `kubectl apply` (declarative) is preferred for production; imperative is fine for quick testing
- `describe`, `logs`, `exec` are your primary debugging tools
- Configure autocomplete and `k` alias for speed (essential for CKA exam)

### 4.9 Practice Questions / Tasks

1. Generate a YAML file for a pod running `redis:7` named `cache` with label `tier=cache`, without creating it
2. Get the IP address of the minikube node using only `kubectl` and `jsonpath`
3. Run an `nginx` pod, port-forward port 8080 to its port 80, and access it via `curl localhost:8080`

---

## 5. Pods – The Basic Building Block

### 5.1 Learning Objectives

- Understand what a Pod is and why it's the fundamental unit in Kubernetes
- Know the difference between single-container and multi-container pods
- Understand init containers, sidecar patterns, and pod lifecycle
- Create, inspect, and manage pods

### 5.2 Concept Explanation

A **Pod** is the smallest deployable unit in Kubernetes. Not a container — a Pod.

> **Analogy:** If a container is a single worker, a Pod is the office desk where workers sit. Multiple workers can share the same desk (multi-container pod), share the same phone extension (network namespace), and access the same filing cabinet (storage volumes).

### Key Pod Properties

- A Pod wraps **one or more containers** that are tightly coupled
- All containers in a Pod share:
  - **The same network namespace** (same IP, same ports, can talk via `localhost`)
  - **The same storage volumes** (mounted into each container)
  - **The same lifecycle** (started and stopped together)
- A Pod runs on **one node** (never split across nodes)
- Pods are **ephemeral** — if a Pod dies, it's not automatically restarted (that's what Deployments are for)

### When to Use Multi-Container Pods

Use multiple containers in a Pod only when they are **tightly coupled**. Common patterns:

```
Pattern 1: Sidecar
┌──────────────────────────────────┐
│ Pod                              │
│  [App Container] ←→ [Log Sidecar]│
│   writes logs    reads & ships   │
└──────────────────────────────────┘

Pattern 2: Ambassador
┌──────────────────────────────────┐
│ Pod                              │
│  [App] → [Ambassador Proxy] → DB │
│   localhost:5432  handles TLS    │
└──────────────────────────────────┘

Pattern 3: Adapter
┌──────────────────────────────────┐
│ Pod                              │
│  [App] → [Adapter] → Monitoring  │
│  custom format  standardizes it  │
└──────────────────────────────────┘
```

### Pod Lifecycle

```
Pending → Running → Succeeded
              ↓
           Failed
              ↓
           Unknown
```

| Phase | Meaning |
|-------|---------|
| `Pending` | Pod accepted by cluster, containers not yet running (scheduling, image pull) |
| `Running` | Pod bound to node, at least one container running |
| `Succeeded` | All containers exited with status 0 (Completed) |
| `Failed` | All containers exited, at least one exited non-zero |
| `Unknown` | Pod state can't be determined (node communication failure) |

### Container States

```
Waiting → Running → Terminated
```

| State | Meaning |
|-------|---------|
| `Waiting` | Not yet running (pulling image, waiting for init containers) |
| `Running` | Actively executing |
| `Terminated` | Finished or crashed |

### 5.3 Architecture / How it Works

```
┌───────────────────────────────────────────────────────────┐
│                         POD                               │
│                                                           │
│  IP: 10.244.0.5  (shared by all containers)               │
│                                                           │
│  ┌─────────────────┐    ┌────────────────┐                │
│  │  Init Container  │→→→│   Container 1  │                │
│  │  (runs first,   │    │   nginx        │ port 80        │
│  │   must complete) │    │                │               │
│  └─────────────────┘    └───────┬────────┘                │
│                                 │ localhost:80            │
│                          ┌──────▼─────────┐               │
│                          │   Container 2  │               │
│                          │   log-sidecar  │               │
│                          └────────────────┘               │
│                                                           │
│  Volumes: [/shared-logs] [/config] ← shared mounts        │
│                                                           │
│  pause container (holds network namespace)                │
└───────────────────────────────────────────────────────────┘
                                                            │
         │ lives on
         ▼
    Worker Node
```

> **The Pause Container:** Every Pod has a hidden "pause" container that Kubernetes creates first. It holds the network namespace (the IP address) so that even if your app containers restart, the IP stays stable.

### 5.4 YAML Manifest / Config Example

### Simple Single-Container Pod

```yaml
# simple-pod.yaml
apiVersion: v1          # API version for Pod objects
kind: Pod               # Resource type
metadata:
  name: my-nginx-pod    # Unique name in the namespace
  namespace: default    # Namespace (default if omitted)
  labels:
    app: nginx          # Key-value labels for selecting this pod
    env: dev
  annotations:
    description: "Simple nginx pod for learning"
spec:
  containers:
    - name: nginx                  # Container name (unique within pod)
      image: nginx:1.25            # Docker image to run
      ports:
        - containerPort: 80        # Port the container listens on (informational)
      resources:
        requests:
          cpu: "100m"             # 100 millicores = 0.1 CPU
          memory: "128Mi"
        limits:
          cpu: "250m"
          memory: "256Mi"
      env:
        - name: NGINX_HOST
          value: "mysite.com"
  restartPolicy: Always            # Always (default), OnFailure, Never
```

### Multi-Container Pod with Init Container

```yaml
# multi-container-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
  labels:
    app: myapp
spec:
  # Init containers run sequentially BEFORE main containers
  initContainers:
    - name: init-config
      image: busybox:1.36
      command:
        - sh
        - -c
        - |
          echo "Downloading config..."
          echo "server.port=8080" > /shared/app.config
          echo "Init done"
      volumeMounts:
        - name: shared-data
          mountPath: /shared

  # Main containers run in parallel AFTER all init containers complete
  containers:
    - name: app
      image: nginx:1.25
      ports:
        - containerPort: 80
      volumeMounts:
        - name: shared-data
          mountPath: /usr/share/nginx/html    # reads config written by init

    - name: log-sidecar
      image: busybox:1.36
      command:
        - sh
        - -c
        - |
          while true; do
            echo "$(date): Sidecar running" >> /var/log/app.log
            sleep 30
          done
      volumeMounts:
        - name: logs
          mountPath: /var/log

  volumes:
    - name: shared-data
      emptyDir: {}    # temporary volume, lives as long as the pod
    - name: logs
      emptyDir: {}

  restartPolicy: Always
```

### Pod with Environment Variables and Resource Limits

```yaml
# env-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-demo-pod
spec:
  containers:
    - name: app
      image: nginx:1.25
      env:
        # Static value
        - name: APP_ENV
          value: "production"
        # Value from Pod metadata (downward API)
        - name: MY_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: MY_POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        # Value from resource fields
        - name: MY_CPU_REQUEST
          valueFrom:
            resourceFieldRef:
              containerName: app
              resource: requests.cpu
      resources:
        requests:
          cpu: "100m"
          memory: "128Mi"
        limits:
          cpu: "500m"
          memory: "512Mi"
```

### 5.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CREATE PODS
#═══════════════════════════════════════════════

# Method 1: Imperative (quick)
kubectl run my-nginx --image=nginx:1.25
# Expected: pod/my-nginx created

# Method 2: Declarative (from YAML)
kubectl apply -f simple-pod.yaml
# Expected: pod/my-nginx-pod created

#═══════════════════════════════════════════════
# INSPECT PODS
#═══════════════════════════════════════════════

# List pods
kubectl get pods
# NAME           READY   STATUS    RESTARTS   AGE
# my-nginx       1/1     Running   0          30s
# my-nginx-pod   1/1     Running   0          15s

# Get pod details
kubectl get pod my-nginx -o wide
# NAME       READY  STATUS   RESTARTS  AGE  IP            NODE
# my-nginx   1/1    Running  0         1m   10.244.0.5    minikube

# Describe pod (events, conditions, container details)
kubectl describe pod my-nginx
# Look for:
#   Events: Normal  Scheduled → Normal  Pulling → Normal  Pulled → Normal  Started
#   Containers → State: Running
#   Conditions: Ready: True

# Get pod YAML
kubectl get pod my-nginx -o yaml

#═══════════════════════════════════════════════
# ACCESS PODS
#═══════════════════════════════════════════════

# Execute a command inside the pod
kubectl exec my-nginx -- nginx -v
# nginx version: nginx/1.25.x

# Get an interactive shell
kubectl exec -it my-nginx -- /bin/bash
# root@my-nginx:/# ls /etc/nginx
# root@my-nginx:/# exit

# View logs
kubectl logs my-nginx
kubectl logs my-nginx -f    # stream logs

# Port forward to test locally
kubectl port-forward pod/my-nginx 8080:80 &
curl localhost:8080
# Expected: nginx welcome page HTML
kill %1  # stop port-forward

#═══════════════════════════════════════════════
# MULTI-CONTAINER POD DEMO
#═══════════════════════════════════════════════

kubectl apply -f multi-container-pod.yaml

# Watch init container run first
kubectl get pod multi-container-pod -w
# NAME                  READY   STATUS     RESTARTS   AGE
# multi-container-pod   0/2     Init:0/1   0          5s   ← init running
# multi-container-pod   0/2     PodInitializing  0    15s  ← init done, starting main
# multi-container-pod   2/2     Running    0          20s  ← both containers running

# Get logs from specific containers
kubectl logs multi-container-pod -c app
kubectl logs multi-container-pod -c log-sidecar

# Exec into a specific container
kubectl exec -it multi-container-pod -c app -- /bin/bash

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete pod my-nginx
kubectl delete pod my-nginx-pod
kubectl delete pod multi-container-pod
kubectl delete pod env-demo-pod

# Or delete all pods in namespace (careful!)
kubectl delete pods --all
```

### 5.6 Common Errors & Troubleshooting

**Error 1: Pod stuck in `Pending`**
```bash
kubectl describe pod my-pod
# Look for Events section:
# Warning  FailedScheduling  0/1 nodes are available:
#   1 Insufficient cpu, 1 Insufficient memory

# Fix 1: Reduce resource requests
# Fix 2: Add more nodes
# Fix 3: Check node taints
kubectl describe node minikube | grep Taints
```

**Error 2: Pod in `ImagePullBackOff` or `ErrImagePull`**
```bash
kubectl describe pod my-pod
# Events:
# Warning  Failed    Failed to pull image "nginx:1.999": ...
#           Error: ErrImagePull

# Fix 1: Correct the image name/tag
# Fix 2: Add imagePullSecrets for private registries
# Fix 3: Check network connectivity from the node

# Verify image exists:
docker pull nginx:1.999  # test locally
```

**Error 3: Pod in `CrashLoopBackOff`**
```bash
kubectl describe pod my-pod
# Events:
# Warning  BackOff   Back-off restarting failed container

# Get previous container logs
kubectl logs my-pod --previous

# Exec into a crashed pod (if it's running briefly):
kubectl debug pod/my-pod -it --image=busybox  # create debug container

# Common causes:
# - App crashes on startup (check logs)
# - Wrong command in spec
# - Missing environment variables or secrets
# - Wrong ports / health check failing too quickly
```

### 5.7 Best Practices

- **Don't deploy bare Pods in production** — use Deployments which manage pod lifecycle
- **Always set resource `requests` and `limits`** — prevents one pod from starving others
- **Use init containers** for setup tasks (downloading config, waiting for dependencies)
- **Keep pods focused** — one main process per container, use sidecars for auxiliary tasks
- **Never use `latest` tag** — always pin specific image versions (e.g., `nginx:1.25.3`)
- **Use meaningful labels** — they're essential for Services, selectors, and network policies
- Pods should be **stateless** where possible — store state in external databases or PVCs

### 5.8 Key Takeaways / Summary

- A Pod is the smallest deployable unit in Kubernetes, not a container
- All containers in a Pod share network (same IP) and can share volumes
- Pods are ephemeral — Deployments are needed for self-healing
- Init containers run and complete before main containers start
- Multi-container pods follow sidecar, ambassador, or adapter patterns
- `kubectl describe` and `kubectl logs` are your first debugging tools

### 5.9 Practice Questions / Tasks

1. Create a pod named `web` running `httpd:2.4` with a label `app=web`. Verify it's running and check its IP address.
2. Create a multi-container pod where an init container writes "Hello from init" to a file in a shared volume, and the main container (`busybox`) reads and prints that file every 10 seconds.
3. A pod is in `CrashLoopBackOff`. List 5 steps you would take to diagnose the issue.

## 6. ReplicaSets & Deployments

### 6.1 Learning Objectives

- Understand why bare Pods aren't enough and how ReplicaSets fix that
- Master Deployments: rolling updates, rollbacks, and scaling
- Understand the relationship Deployment → ReplicaSet → Pod
- Perform zero-downtime updates in a real cluster

### 6.2 Concept Explanation

### The Problem with Bare Pods

If you `kubectl run` a pod and it crashes or its node dies, nobody brings it back. That's unacceptable in production.

> **Analogy:** A bare Pod is like hiring one employee with no backup plan — if they quit, the work stops. A **ReplicaSet** is like having a hiring manager whose only job is "always keep exactly N employees in this role." A **Deployment** is the HR department that manages the hiring manager, handles promotions (rolling updates), and can undo bad hiring decisions (rollbacks).

### ReplicaSet

A **ReplicaSet** ensures a specified number of identical Pod replicas are running at all times. If a Pod dies, the ReplicaSet controller creates a new one. If there are too many, it deletes extras.

### Deployment

A **Deployment** is a higher-level object that manages ReplicaSets. You almost never create ReplicaSets directly — Deployments do it for you and add:
- **Rolling updates** — gradually replace old pods with new ones (zero downtime)
- **Rollback** — revert to a previous version if something breaks
- **Revision history** — track changes over time
- **Pause/Resume** — pause an in-progress rollout

```
Deployment (manages versions/history)
    │
    ├── ReplicaSet v1 (old, scaled to 0 after rollout)
    │      └── Pod, Pod, Pod (terminated)
    │
    └── ReplicaSet v2 (current, active)
           └── Pod, Pod, Pod (running)
```

### Deployment Strategies

| Strategy | Behavior | Downtime |
|----------|----------|----------|
| **RollingUpdate** (default) | Gradually replaces old pods with new ones | Zero (if configured correctly) |
| **Recreate** | Kills all old pods, then creates new ones | Yes (brief outage) |

### 6.3 Architecture / How it Works

```
┌─────────────────────────────────────────────────────────────────┐
│ Deployment: nginx-deployment                                    │
│  spec.replicas: 3                                               │
│  spec.template: (pod template — the "stamp" used for pods)      │
│                                                                 │
│  Rollout history:                                               │
│  Revision 1: image=nginx:1.24  ┐                                │
│  Revision 2: image=nginx:1.25  ├─ stored for rollback           │
│  Revision 3: image=nginx:1.26  ┘  (current)                     │
└────────────────────┬────────────────────────────────────────────┘
                      │ creates & manages
                      ▼
┌───────────────────────────────────────────────────────────────┐
│ ReplicaSet: nginx-deployment-7d9f8c6b5d (current, revision 3) │
│  spec.replicas: 3                                             │
│  selector: matchLabels: {app: nginx, pod-template-hash: xyz}  │
└────────────────────┬──────────────────────────────────────────┘
                      │ creates & monitors
                      ▼
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │  Pod 1  │  │  Pod 2  │  │  Pod 3  │
   │ Running │  │ Running │  │ Running │
   └─────────┘  └─────────┘  └─────────┘

ROLLING UPDATE IN PROGRESS:
Old ReplicaSet (v2): 3→2→1→0 pods (scaling down)
New ReplicaSet (v3): 0→1→2→3 pods (scaling up)
    Controlled by: maxSurge (extra pods allowed) and
                    maxUnavailable (pods that can be down)
```

### 6.4 YAML Manifest / Config Example

### ReplicaSet (rarely used directly — shown for understanding)

```yaml
# replicaset.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  labels:
    app: nginx
spec:
  replicas: 3                    # desired number of pods
  selector:
    matchLabels:
      app: nginx                 # must match template labels
  template:                      # pod template
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
```

### Deployment (Production Pattern)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  revisionHistoryLimit: 5         # how many old ReplicaSets to keep for rollback
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate            # or "Recreate"
    rollingUpdate:
      maxSurge: 1                  # max extra pods during update (or "25%")
      maxUnavailable: 0             # max pods unavailable during update (0 = zero downtime)
  minReadySeconds: 5                # wait time before considering a pod "available"
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "250m"
              memory: "256Mi"
          readinessProbe:           # important for safe rolling updates (see Chapter 12)
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 3
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 10
```

### 6.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CREATE DEPLOYMENT
#═══════════════════════════════════════════════

kubectl apply -f deployment.yaml
# deployment.apps/nginx-deployment created

# Or imperatively
kubectl create deployment nginx-deployment --image=nginx:1.25 --replicas=3

#═══════════════════════════════════════════════
# VERIFY
#═══════════════════════════════════════════════

kubectl get deployments
# NAME               READY   UP-TO-DATE   AVAILABLE   AGE
# nginx-deployment   3/3     3            3           30s

kubectl get replicasets
# NAME                          DESIRED   CURRENT   READY   AGE
# nginx-deployment-7d9f8c6b5d   3         3         3       30s

kubectl get pods -l app=nginx
# NAME                                READY   STATUS    RESTARTS   AGE
# nginx-deployment-7d9f8c6b5d-2x4kj   1/1     Running   0          35s
# nginx-deployment-7d9f8c6b5d-8h7mn   1/1     Running   0          35s
# nginx-deployment-7d9f8c6b5d-k9p2x   1/1     Running   0          35s

kubectl describe deployment nginx-deployment
# Shows: StrategyType, RollingUpdateStrategy, OldReplicaSets, NewReplicaSet, Events

#═══════════════════════════════════════════════
# SCALING
#═══════════════════════════════════════════════

# Imperative scale
kubectl scale deployment nginx-deployment --replicas=5
kubectl get pods -l app=nginx
# Now shows 5 pods

# Declarative scale (edit YAML, reapply)
sed -i 's/replicas: 5/replicas: 3/' deployment.yaml
kubectl apply -f deployment.yaml

#═══════════════════════════════════════════════
# ROLLING UPDATE
#═══════════════════════════════════════════════

# Method 1: Update image directly
kubectl set image deployment/nginx-deployment nginx=nginx:1.26
# deployment.apps/nginx-deployment image updated

# Watch the rollout happen live
kubectl rollout status deployment/nginx-deployment
# Waiting for deployment "nginx-deployment" rollout to finish: 1 out of 3 new replicas...
# deployment "nginx-deployment" successfully rolled out

# Method 2: Edit YAML and apply
sed -i 's/nginx:1.25/nginx:1.26/' deployment.yaml
kubectl apply -f deployment.yaml

# Watch pods being replaced in real-time
kubectl get pods -l app=nginx -w
# Old pods terminate, new pods with nginx:1.26 start up gradually

#═══════════════════════════════════════════════
# ROLLOUT HISTORY & ROLLBACK
#═══════════════════════════════════════════════

# View rollout history
kubectl rollout history deployment/nginx-deployment
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         <none>

# Add change-cause annotations for clarity (best practice)
kubectl annotate deployment/nginx-deployment kubernetes.io/change-cause="Updated to nginx 1.26"

# View details of a specific revision
kubectl rollout history deployment/nginx-deployment --revision=2

# Rollback to previous revision
kubectl rollout undo deployment/nginx-deployment
# deployment.apps/nginx-deployment rolled back

# Rollback to a SPECIFIC revision
kubectl rollout undo deployment/nginx-deployment --to-revision=1

# Verify rollback
kubectl get deployment nginx-deployment -o jsonpath='{.spec.template.spec.containers[0].image}'
# nginx:1.25  (back to original)

#═══════════════════════════════════════════════
# PAUSE / RESUME ROLLOUT (for canary-style testing)
#═══════════════════════════════════════════════

kubectl rollout pause deployment/nginx-deployment
kubectl set image deployment/nginx-deployment nginx=nginx:1.27
# Update is staged but not rolled out yet
kubectl rollout resume deployment/nginx-deployment
# Now it rolls out

#═══════════════════════════════════════════════
# RESTART (rolling restart without changing image)
#═══════════════════════════════════════════════

kubectl rollout restart deployment/nginx-deployment
# Useful for: picking up new ConfigMap/Secret values, clearing memory leaks

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete deployment nginx-deployment
kubectl delete -f deployment.yaml
```

### 6.6 Common Errors & Troubleshooting

**Error 1: Rollout stuck — "progress deadline exceeded"**
```bash
kubectl rollout status deployment/my-app
# error: deployment "my-app" exceeded its progress deadline

# Diagnose:
kubectl describe deployment my-app
kubectl get pods -l app=my-app
kubectl describe pod <stuck-pod-name>
# Common cause: new image fails readiness probe, or ImagePullBackOff

# Fix: rollback immediately
kubectl rollout undo deployment/my-app
```

**Error 2: ReplicaSet not creating pods**
```bash
kubectl describe replicaset my-app-xxxxx
# Look for Events: "Error creating: pods is forbidden" (RBAC)
# or "Error creating: exceeded quota" (ResourceQuota — see Chapter 10)
```

**Error 3: Selector mismatch — "spec.selector field is immutable"**
```bash
# Error when changing the selector on apply:
# The Deployment "my-app" is invalid: spec.selector: Invalid value: ...
# field is immutable

# Fix: Deployment selectors CANNOT be changed after creation.
# You must delete and recreate the deployment:
kubectl delete deployment my-app
kubectl apply -f deployment.yaml
```

### 6.7 Best Practices

- **Always set `maxUnavailable: 0`** for zero-downtime updates on critical services (requires `maxSurge` ≥ 1)
- **Always add readiness probes** — without them, Kubernetes can't tell when a new pod is truly ready, breaking rolling updates
- **Use `--record` or annotate change-cause** for audit trail (helps rollback decisions)
- **Set `revisionHistoryLimit`** to avoid accumulating too many old ReplicaSets (default is 10)
- **Never edit ReplicaSets directly** — always go through the Deployment
- **Test rollouts in staging first** — use `kubectl rollout pause` for manual canary verification
- Pin image tags — never use `:latest` in production Deployments

### 6.8 Key Takeaways / Summary

- ReplicaSets ensure N pods are always running; Deployments manage ReplicaSets and add rollout features
- Deployment → ReplicaSet → Pod is the management hierarchy
- `kubectl set image`, `kubectl rollout undo`, and `kubectl scale` are core daily commands
- RollingUpdate is the default strategy and supports zero-downtime deployments with proper probe configuration
- Deployment selectors are immutable — plan your labels carefully upfront

### 6.9 Practice Questions / Tasks

1. Create a Deployment with 4 replicas of `httpd:2.4`. Update it to `httpd:2.4.58` using a rolling update with `maxSurge=1, maxUnavailable=0`. Watch the rollout.
2. Intentionally deploy a broken image (e.g., `nginx:doesnotexist`) and practice detecting the failure and rolling back.
3. What's the difference between scaling a Deployment to 0 replicas vs deleting it? When would you use each?

---

## 7. Services & Basic Networking

### 7.1 Learning Objectives

- Understand why Pod IPs are unreliable and how Services solve this
- Master the 4 Service types: ClusterIP, NodePort, LoadBalancer, ExternalName
- Understand the Kubernetes networking model and DNS
- Configure and test service discovery

### 7.2 Concept Explanation

### The Problem

Pods are ephemeral. When a Pod dies and is recreated, it gets a **new IP address**. If your frontend hardcodes a backend Pod's IP, it breaks every time the backend restarts.

> **Analogy:** A Service is like a company's general phone number (1-800-COMPANY) rather than an individual employee's cell phone. Employees (Pods) come and go, get new numbers (IPs), but the company's main number (Service) always routes you to *someone* who can help.

### What is a Service?

A **Service** is a stable network endpoint (fixed IP + DNS name) that load-balances traffic to a dynamic set of Pods, selected via labels.

### Service Types

```
┌───────────────────────────────────────────────────────────────┐
│ ClusterIP (default)                                           │
│ Internal-only IP, reachable only from within the cluster      │
│ Use: Backend services, databases, internal APIs               │
├───────────────────────────────────────────────────────────────┤
│ NodePort                                                      │
│ Opens a port (30000-32767) on EVERY node, forwards to Service │
│ Use: Simple external access, dev/test environments            │
├───────────────────────────────────────────────────────────────┤
│ LoadBalancer                                                  │
│ Provisions a cloud load balancer (AWS ELB, GCP LB, etc.)      │
│ Use: Production external access on cloud providers            │
├───────────────────────────────────────────────────────────────┤
│ ExternalName                                                  │
│ Maps a Service to an external DNS name (no proxying)          │
│ Use: Referencing external databases/APIs by internal name     │
└───────────────────────────────────────────────────────────────┘
```

### 7.3 Architecture / How it Works

```
                          CLIENT REQUEST
                                                          │
       ┌────────────────────────┴─────────────────────────┐
       │                                                  │
   ClusterIP                NodePort                 LoadBalancer
  (internal only)        (Node IP:30080)          (Cloud LB external IP)
       │                       │                          │
       └───────────┬───────────┴──────────────────────────┘
                    ▼
        ┌──────────────────────┐
        │  Service: my-svc     │
        │  ClusterIP: 10.96.5.5│ ← stable virtual IP, never changes
        │  Port: 80 → 8080      │
        │  selector: app=web    │
        └──────────┬────────────┘
                    │  kube-proxy watches Service + Endpoints
                    │  programs iptables/IPVS rules on every node
                    ▼
        ┌─────────────────────────────────────────┐
        │           Endpoints (auto-managed)      │
        │  10.244.0.5:8080  (Pod 1 - app=web)     │
        │  10.244.1.7:8080  (Pod 2 - app=web)     │
        │  10.244.2.3:8080  (Pod 3 - app=web)     │
        └─────────────────────────────────────────┘
                                                  │
        Load-balanced (round-robin by default)
                                │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    [ Pod 1 ]   [ Pod 2 ]   [ Pod 3 ]
```

### DNS-Based Service Discovery

Every Service automatically gets a DNS name via **CoreDNS**:

```
<service-name>.<namespace>.svc.cluster.local

Examples:
  my-svc                              (same namespace, short form)
  my-svc.default                      (same namespace, explicit)
  my-svc.default.svc.cluster.local    (fully qualified domain name)
```

### 7.4 YAML Manifest / Config Example

### ClusterIP Service (Internal)

```yaml
# clusterip-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  labels:
    app: backend
spec:
  type: ClusterIP                 # default, can be omitted
  selector:
    app: backend                  # routes to pods with this label
  ports:
    - name: http
      protocol: TCP
      port: 80                    # Service port (what clients use)
      targetPort: 8080            # Container port (where traffic goes)
```

### NodePort Service (External, Dev/Test)

```yaml
# nodeport-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-nodeport
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80                    # ClusterIP port (internal)
      targetPort: 80              # Container port
      nodePort: 30080             # External port on EVERY node (30000-32767)
                                   # omit to auto-assign
```

### LoadBalancer Service (Cloud Production)

```yaml
# loadbalancer-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-lb
  annotations:
    # Cloud-specific annotations (example: AWS)
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
    - port: 443
      targetPort: 8443
      protocol: TCP
```

### ExternalName Service

```yaml
# externalname-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: external-database
spec:
  type: ExternalName
  externalName: prod-db.cloudprovider.com   # DNS CNAME, no proxying/selectors
```

### Multi-Port Service

```yaml
# multiport-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: multi-port-svc
spec:
  selector:
    app: api
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: https
      port: 443
      targetPort: 8443
    - name: metrics
      port: 9090
      targetPort: 9090
```

### Headless Service (for StatefulSets — preview, full coverage Ch. 15)

```yaml
# headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: headless-svc
spec:
  clusterIP: None                # no virtual IP — returns Pod IPs directly via DNS
  selector:
    app: database
  ports:
    - port: 5432
```

### 7.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# SETUP: Create a Deployment to expose
#═══════════════════════════════════════════════

kubectl create deployment web --image=nginx:1.25 --replicas=3
kubectl expose deployment web --port=80 --target-port=80 --name=web-clusterip

#═══════════════════════════════════════════════
# CLUSTERIP SERVICE
#═══════════════════════════════════════════════

kubectl apply -f clusterip-service.yaml
kubectl get svc backend-svc
# NAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
# backend-svc   ClusterIP   10.96.45.123   <none>        80/TCP    10s

# Test from inside the cluster (spin up a test pod)
kubectl run test-pod --image=busybox:1.36 -it --rm -- wget -O- http://web-clusterip
# Expected: returns nginx HTML

# Test DNS resolution
kubectl run dns-test --image=busybox:1.36 -it --rm -- nslookup web-clusterip
# Expected:
# Server:    10.96.0.10
# Name:      web-clusterip.default.svc.cluster.local
# Address:   10.96.x.x

#═══════════════════════════════════════════════
# NODEPORT SERVICE
#═══════════════════════════════════════════════

kubectl apply -f nodeport-service.yaml
kubectl get svc frontend-nodeport
# NAME                TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
# frontend-nodeport   NodePort   10.96.78.90   <none>        80:30080/TCP   5s

# Access via minikube (minikube needs special handling for NodePort)
minikube service frontend-nodeport --url
# http://192.168.49.2:30080

curl $(minikube service frontend-nodeport --url)
# Expected: nginx HTML

#═══════════════════════════════════════════════
# LOADBALANCER SERVICE (works differently locally)
#═══════════════════════════════════════════════

kubectl apply -f loadbalancer-service.yaml
kubectl get svc frontend-lb
# NAME          TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)
# frontend-lb   LoadBalancer   10.96.12.34   <pending>     443/TCP
# Note: EXTERNAL-IP stays <pending> on minikube/kind (no cloud LB)

# minikube provides a tunnel to simulate this:
minikube tunnel
# (run in separate terminal — assigns a real external IP)

#═══════════════════════════════════════════════
# VIEW ENDPOINTS (verify Service → Pod mapping)
#═══════════════════════════════════════════════

kubectl get endpoints backend-svc
# NAME          ENDPOINTS                                   AGE
# backend-svc   10.244.0.5:8080,10.244.1.3:8080,...        2m

# If ENDPOINTS is empty <none>, your selector doesn't match any pod labels!
kubectl describe svc backend-svc
# Check "Selector" line matches your Pod's "Labels"

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete svc backend-svc frontend-nodeport frontend-lb web-clusterip
kubectl delete deployment web
```

### 7.6 Common Errors & Troubleshooting

**Error 1: Service has no endpoints**
```bash
kubectl get endpoints my-svc
# NAME     ENDPOINTS   AGE
# my-svc   <none>      1m

# Cause: selector doesn't match pod labels
kubectl get svc my-svc -o jsonpath='{.spec.selector}'
# {"app":"web"}
kubectl get pods --show-labels
# Check if any pod actually has "app=web"

# Fix: align labels between Service selector and Pod template
```

**Error 2: NodePort not accessible externally**
```bash
# On minikube, NodePort needs the minikube IP, not localhost
minikube ip
curl http://$(minikube ip):30080

# On cloud VMs, check security groups / firewall rules allow the NodePort range
```

**Error 3: DNS resolution fails inside pods**
```bash
kubectl exec -it test-pod -- nslookup my-svc
# Server can't find my-svc: NXDOMAIN

# Check CoreDNS is running
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Check CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns

# Verify you're using the correct namespace in DNS query
kubectl exec -it test-pod -- nslookup my-svc.other-namespace.svc.cluster.local
```

### 7.7 Best Practices

- **Use ClusterIP + Ingress** for HTTP/HTTPS traffic instead of multiple LoadBalancers (cost-saving)
- **Use NodePort only for dev/test** — not recommended for production external access
- **Name your ports** when using multiple ports per Service (`name: http`, `name: metrics`)
- **Always verify Endpoints** after creating a Service — empty endpoints means broken selectors
- **Use `targetPort` as a name** (not just number) referencing the container's named port — survives port changes
- For production cloud, **prefer LoadBalancer with Ingress** for cost-effective routing of multiple services

### 7.8 Key Takeaways / Summary

- Services provide stable networking for ephemeral Pods via label selectors
- ClusterIP (internal) → NodePort (dev external) → LoadBalancer (cloud production) → ExternalName (external DNS alias)
- kube-proxy implements Services using iptables/IPVS rules on every node
- CoreDNS provides automatic DNS names: `service.namespace.svc.cluster.local`
- Always check `kubectl get endpoints` when a Service "isn't working" — it's almost always a selector mismatch

### 7.9 Practice Questions / Tasks

1. Create a Deployment with 3 nginx replicas and a ClusterIP Service. Verify load balancing by checking which pod responds across multiple curl requests (hint: use a custom index.html per pod, or check hostname header).
2. Create a NodePort service and access it via the minikube IP. What port range is allowed for NodePort by default?
3. Deliberately break a Service by mismatching the selector. Use `kubectl describe svc` and `kubectl get endpoints` to diagnose and fix it.

---

## 8. ConfigMaps & Secrets

### 8.1 Learning Objectives

- Separate configuration from container images using ConfigMaps
- Securely manage sensitive data using Secrets
- Understand the different ways to consume ConfigMaps/Secrets (env vars, volumes)
- Know the security limitations of Secrets and how to address them

### 8.2 Concept Explanation

### Why Separate Config from Code?

Hardcoding a database URL into your application image means rebuilding the image every time the URL changes. That's slow and error-prone.

> **Analogy:** ConfigMaps are like a restaurant's daily specials board — easy to update without rebuilding the kitchen. Secrets are like the safe combination — same idea, but locked away and handled with extra care.

### ConfigMap
Stores **non-sensitive** configuration data as key-value pairs: URLs, feature flags, config files, environment-specific settings.

### Secret
Stores **sensitive** data: passwords, API tokens, TLS certificates, SSH keys. Functionally similar to ConfigMaps but:
- Base64-encoded (NOT encrypted by default — just encoded!)
- Can be encrypted at rest if configured (`EncryptionConfiguration`)
- Mounted with stricter file permissions (`0644` → tmpfs by default)
- Excluded from `kubectl describe` output by default

> ⚠️ **Critical Misconception:** Base64 is NOT encryption. Anyone with `kubectl get secret -o yaml` access can decode it instantly. Real security comes from RBAC + encryption at rest + tools like Sealed Secrets/Vault (covered in Chapter 22).

### 8.3 Architecture / How it Works

```
┌──────────────────────────────────────────────────────────────┐
│                     ConfigMap / Secret                       │
│  data:                                                       │
│    DATABASE_URL: "postgres://db:5432/mydb"                   │
│    LOG_LEVEL: "debug"                                        │
└───────────────────────┬──────────────────────────────────────┘
                                                               │
          Two ways to consume:
                                           │
        ┌────────────────┴─────────────────┐
        ▼                                   ▼
┌───────────────────┐             ┌──────────────────────────┐
│  ENV VARIABLES     │             │  VOLUME MOUNT           │
│  (injected at      │             │  (file per key,         │
│   container start) │             │   updates live*)        │
│                     │             │                        │
│  $DATABASE_URL      │             │  /etc/config/          │
│  $LOG_LEVEL          │             │    DATABASE_URL       │
│                     │             │    LOG_LEVEL           │
│  ⚠️ Requires pod    │             │  ✅ Auto-updates        │
│  restart to update  │             │  (kubelet sync,        │
│                     │             │   ~60s delay)          │
└───────────────────┘             └──────────────────────────┘
```

### 8.4 YAML Manifest / Config Example

### ConfigMap (Literal Values)

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_URL: "postgres://db-service:5432/mydb"
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
  # Can also store entire config files as a single key
  app.properties: |
    server.port=8080
    server.timeout=30
    feature.newUI=true
```

### Secret (Generic)

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque                     # generic key-value secret
data:
  # Values MUST be base64-encoded
  DB_PASSWORD: cGFzc3dvcmQxMjM=  # echo -n 'password123' | base64
  API_KEY: c2VjcmV0YXBpa2V5MTIz
---
# Alternative using stringData (auto-encodes for you — easier to read)
apiVersion: v1
kind: Secret
metadata:
  name: app-secret-readable
type: Opaque
stringData:                       # plaintext here, K8s encodes automatically
  DB_PASSWORD: password123
  API_KEY: secretapikey123
```

### TLS Secret

```yaml
# tls-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-certificate>
  tls.key: <base64-encoded-private-key>
```

### Docker Registry Secret (for private images)

```yaml
# Created imperatively (recommended — see commands below)
# kubectl create secret docker-registry regcred \
#   --docker-server=<registry> \
#   --docker-username=<user> \
#   --docker-password=<pass> \
#   --docker-email=<email>
```

### Pod Consuming ConfigMap & Secret (Environment Variables)

```yaml
# pod-with-config.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
    - name: app
      image: nginx:1.25
      envFrom:                       # inject ALL keys as env vars
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secret
      env:                            # OR inject specific keys
        - name: SPECIFIC_LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: LOG_LEVEL
        - name: SPECIFIC_DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: DB_PASSWORD
      imagePullSecrets:                # for private registry images
        - name: regcred
```

### Pod Consuming ConfigMap & Secret (Volume Mount)

```yaml
# pod-with-config-volume.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod-volume
spec:
  containers:
    - name: app
      image: nginx:1.25
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config           # files appear here, one per key
          readOnly: true
        - name: secret-volume
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: config-volume
      configMap:
        name: app-config
    - name: secret-volume
      secret:
        secretName: app-secret
        defaultMode: 0400                  # restrict permissions
```

### 8.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CREATE CONFIGMAPS
#═══════════════════════════════════════════════

# From literal values
kubectl create configmap app-config \
  --from-literal=DATABASE_URL=postgres://db:5432/mydb \
  --from-literal=LOG_LEVEL=debug

# From a file
echo "server.port=8080" > app.properties
kubectl create configmap file-config --from-file=app.properties

# From an entire directory
kubectl create configmap dir-config --from-file=./config-dir/

# From YAML
kubectl apply -f configmap.yaml

# Verify
kubectl get configmap app-config -o yaml
kubectl describe configmap app-config

#═══════════════════════════════════════════════
# CREATE SECRETS
#═══════════════════════════════════════════════

# From literal values (auto base64-encoded)
kubectl create secret generic app-secret \
  --from-literal=DB_PASSWORD=password123 \
  --from-literal=API_KEY=secretapikey123

# From files (e.g., TLS certs)
kubectl create secret tls tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key

# Docker registry secret
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=my@email.com

# Verify (note: data is hidden by default in describe)
kubectl get secret app-secret -o yaml
kubectl describe secret app-secret
# Data
# ====
# API_KEY:      16 bytes
# DB_PASSWORD:  11 bytes
# (values are NOT shown — good!)

# Decode a secret value manually
kubectl get secret app-secret -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
# password123

#═══════════════════════════════════════════════
# USE IN PODS
#═══════════════════════════════════════════════

kubectl apply -f pod-with-config.yaml
kubectl exec app-pod -- env | grep -E "DATABASE_URL|LOG_LEVEL|DB_PASSWORD"
# DATABASE_URL=postgres://db-service:5432/mydb
# LOG_LEVEL=info
# DB_PASSWORD=password123

kubectl apply -f pod-with-config-volume.yaml
kubectl exec app-pod-volume -- ls /etc/config
# DATABASE_URL  LOG_LEVEL  MAX_CONNECTIONS  app.properties

kubectl exec app-pod-volume -- cat /etc/config/DATABASE_URL
# postgres://db-service:5432/mydb

kubectl exec app-pod-volume -- ls -la /etc/secrets
# verify restrictive permissions on secret files

#═══════════════════════════════════════════════
# UPDATE CONFIGMAP (live update demo)
#═══════════════════════════════════════════════

kubectl edit configmap app-config
# Change LOG_LEVEL to "trace", save and exit

# Wait ~60 seconds (kubelet sync period), then check volume-mounted pod:
kubectl exec app-pod-volume -- cat /etc/config/LOG_LEVEL
# trace   (updated automatically!)

# But env-var-based pods do NOT auto-update:
kubectl exec app-pod -- env | grep LOG_LEVEL
# LOG_LEVEL=info   (still old value — needs pod restart)

# Force update via rollout restart (for Deployments using this config)
kubectl rollout restart deployment/my-app

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete configmap app-config file-config dir-config
kubectl delete secret app-secret tls-secret regcred
kubectl delete pod app-pod app-pod-volume
```

### 8.6 Common Errors & Troubleshooting

**Error 1: Pod stuck in `CreateContainerConfigError`**
```bash
kubectl describe pod app-pod
# Events:
# Warning  Failed  Error: couldn't find key DB_PASSWORD in Secret default/app-secret

# Fix: verify the key name matches exactly (case-sensitive)
kubectl get secret app-secret -o jsonpath='{.data}' | jq
```

**Error 2: ImagePullBackOff with private registry**
```bash
kubectl describe pod my-pod
# Failed to pull image: unauthorized: authentication required

# Fix: ensure imagePullSecrets is correctly referenced
kubectl get pod my-pod -o yaml | grep -A2 imagePullSecrets
# Verify secret exists in the SAME namespace as the pod
kubectl get secret regcred -n <correct-namespace>
```

**Error 3: ConfigMap changes not reflecting**
```bash
# Cause 1: Using envFrom/env (these don't auto-update — need pod restart)
# Cause 2: subPath volume mounts do NOT receive live updates (K8s limitation)
# Fix: avoid subPath if you need live config updates, or use a sidecar
#      that watches for changes (e.g., Reloader: https://github.com/stakater/Reloader)
```

### 8.7 Best Practices

- **Never commit Secrets to Git** in plaintext — use Sealed Secrets, External Secrets Operator, or Vault
- **Enable encryption at rest** for etcd in production clusters (`EncryptionConfiguration`)
- **Use `stringData`** when authoring Secrets manually — avoids manual base64 errors
- **Set `defaultMode: 0400`** on secret volumes to restrict read access
- **Use separate ConfigMaps per environment** (dev/staging/prod) rather than one giant config
- **Avoid `subPath`** mounts when you need live-reloading config
- **Limit Secret access via RBAC** — not every service account needs to read every secret
- Consider a **dedicated secrets manager** (HashiCorp Vault, AWS Secrets Manager, Sealed Secrets) for production

### 8.8 Key Takeaways / Summary

- ConfigMaps hold non-sensitive config; Secrets hold sensitive data (but only base64-encoded, NOT encrypted by default)
- Both can be consumed as environment variables (static, requires restart) or volume mounts (auto-updates ~60s)
- `envFrom` injects all keys; `valueFrom` injects specific keys
- Secrets need additional protection: RBAC, encryption at rest, and ideally an external secrets manager
- `kubectl create configmap/secret --from-literal/--from-file` are the fastest creation methods

### 8.9 Practice Questions / Tasks

1. Create a ConfigMap from a `.properties` file with 3 key-value pairs, mount it into a pod, and verify the contents at the mount path.
2. Create a Secret with a database password, consume it as an environment variable, and verify `kubectl describe secret` does NOT show the plaintext value.
3. Explain why Secrets are not "secure" by default and list 3 things you'd add in production to make them genuinely secure.

---

## 9. Volumes, Persistent Volumes (PV), Persistent Volume Claims (PVC), StorageClasses

### 9.1 Learning Objectives

- Understand the problem of ephemeral container storage
- Differentiate emptyDir, hostPath, PV, and PVC
- Understand the PV/PVC/StorageClass relationship and dynamic provisioning
- Deploy a stateful application with persistent storage

### 9.2 Concept Explanation

### The Problem

Container filesystems are **ephemeral** — when a container restarts, all its local data is lost. For a stateless web server, that's fine. For a database, that's catastrophic.

> **Analogy:** Think of a Pod's local filesystem as a hotel room — when you check out (pod restarts), housekeeping resets everything. A **Persistent Volume** is like a storage unit you rent separately — it survives regardless of which "hotel room" (pod) you're currently using.

### Volume Types

| Type | Lifetime | Use Case |
|------|----------|----------|
| `emptyDir` | Tied to Pod lifetime | Scratch space, cache, sharing data between containers in a pod |
| `hostPath` | Tied to Node | Node-level tools, NOT recommended for app data (not portable) |
| `PersistentVolume (PV)` | Independent of Pod | Databases, file storage, anything needing durability |
| `configMap`/`secret` | Tied to Pod | Already covered in Chapter 8 |

### PV / PVC / StorageClass Relationship

```
Application (Pod) wants storage
        │
        ▼
PersistentVolumeClaim (PVC)  ─── "I need 10Gi, ReadWriteOnce"
        │
        │ binds to
        ▼
PersistentVolume (PV)  ─── actual storage resource
        │
        │ provisioned by
        ▼
StorageClass  ─── "how" to provision (which backend, parameters)
        │
        ▼
Actual Storage Backend (AWS EBS, GCE PD, NFS, Ceph, local-path...)
```

> **Analogy:** A **StorageClass** is like a restaurant menu category ("budget", "premium"). A **PVC** is your order ("I'll have the premium option, size large"). A **PV** is the actual dish that gets served and bound to your table. Dynamic provisioning means the kitchen (StorageClass provisioner) cooks the dish on demand instead of pre-making everything.

### Access Modes

| Mode | Abbreviation | Meaning |
|------|-------------|---------|
| ReadWriteOnce | RWO | Mounted read-write by a single node |
| ReadOnlyMany | ROX | Mounted read-only by many nodes |
| ReadWriteMany | RWX | Mounted read-write by many nodes |
| ReadWriteOncePod | RWOP | Mounted read-write by a single Pod (K8s 1.22+, strictest) |

### 9.3 Architecture / How it Works

```
┌────────────────────────────────────────────────────────────────┐
│ Pod                                                            │
│  volumeMounts:                                                 │
│    - name: data                                                │
│      mountPath: /var/lib/mysql                                 │
└────────────────────────┬───────────────────────────────────────┘
                          │ references
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ PersistentVolumeClaim (PVC) — namespaced                       │
│   name: mysql-pvc                                              │
│   requests: storage: 10Gi                                      │
│   accessModes: [ReadWriteOnce]                                 │
│   storageClassName: standard                                   │
└────────────────────────┬───────────────────────────────────────┘
                          │ dynamically provisions / binds to
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│ PersistentVolume (PV) — cluster-wide, NOT namespaced             │
│   name: pvc-a1b2c3d4-...                                         │
│   capacity: 10Gi                                                 │
│   accessModes: [ReadWriteOnce]                                   │
│   reclaimPolicy: Delete (or Retain)                              │
│   storageClassName: standard                                     │
└────────────────────────┬─────────────────────────────────────────┘
                          │ backed by
                          ▼
┌───────────────────────────────────────────────────────────────────┐
│ StorageClass: standard                                            │
│   provisioner: k8s.io/minikube-hostpath (local)                   │
│                kubernetes.io/aws-ebs (cloud example)              │
│   parameters: type=gp3, etc.                                      │
└───────────────────────────────────────────────────────────────────┘
                                                                    │
                          ▼
              Actual disk on Node / Cloud Storage
```

### Static vs Dynamic Provisioning

```
STATIC: Admin manually creates PV → PVC binds to it (older approach)
DYNAMIC: PVC references a StorageClass → PV auto-created on demand (modern approach)
```

### 9.4 YAML Manifest / Config Example

### emptyDir (Pod-scoped temp storage)

```yaml
# emptydir-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: cache-pod
spec:
  containers:
    - name: app
      image: nginx:1.25
      volumeMounts:
        - name: cache-volume
          mountPath: /cache
  volumes:
    - name: cache-volume
      emptyDir:
        sizeLimit: 500Mi          # optional size cap
```

### StorageClass

```yaml
# storageclass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs    # cloud-specific; minikube uses k8s.io/minikube-hostpath
parameters:
  type: gp3
  fsType: ext4
reclaimPolicy: Delete                  # Delete or Retain
volumeBindingMode: WaitForFirstConsumer  # delays binding until pod is scheduled
allowVolumeExpansion: true
```

### PersistentVolumeClaim (Dynamic Provisioning)

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard         # minikube's default StorageClass
  resources:
    requests:
      storage: 5Gi
```

### PersistentVolume (Static Provisioning — for learning/on-prem)

```yaml
# pv-static.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: manual-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:                          # ONLY for single-node testing, never production
    path: /mnt/data
```

### Pod Using PVC (StatefulSet pattern preview)

```yaml
# mysql-pod-with-pvc.yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql-pod
spec:
  containers:
    - name: mysql
      image: mysql:8.0
      env:
        - name: MYSQL_ROOT_PASSWORD
          value: "rootpass123"        # use a Secret in production!
      ports:
        - containerPort: 3306
      volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
  volumes:
    - name: mysql-storage
      persistentVolumeClaim:
        claimName: mysql-pvc
```

### 9.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CHECK AVAILABLE STORAGE CLASSES (minikube)
#═══════════════════════════════════════════════

kubectl get storageclass
# NAME                 PROVISIONER                RECLAIMPOLICY  VOLUMEBINDINGMODE
# standard (default)   k8s.io/minikube-hostpath   Delete         Immediate

#═══════════════════════════════════════════════
# EMPTYDIR DEMO
#═══════════════════════════════════════════════

kubectl apply -f emptydir-pod.yaml
kubectl exec cache-pod -- sh -c "echo 'temp data' > /cache/test.txt"
kubectl exec cache-pod -- cat /cache/test.txt
# temp data

kubectl delete pod cache-pod    # data is gone forever — emptyDir is ephemeral!

#═══════════════════════════════════════════════
# DYNAMIC PROVISIONING: PVC → AUTO PV
#═══════════════════════════════════════════════

kubectl apply -f pvc.yaml
kubectl get pvc mysql-pvc
# NAME        STATUS   VOLUME                 CAPACITY  ACCESS MODES  STORAGECLASS  AGE
# mysql-pvc   Bound    pvc-a1b2c3d4-e5f6...   5Gi       RWO           standard      5s

kubectl get pv
# NAME                    CAPACITY  ACCESS MODES  RECLAIM POLICY  STATUS  CLAIM
# pvc-a1b2c3d4-e5f6...   5Gi       RWO           Delete          Bound   default/mysql-pvc

#═══════════════════════════════════════════════
# USE THE PVC IN A POD
#═══════════════════════════════════════════════

kubectl apply -f mysql-pod-with-pvc.yaml
kubectl wait --for=condition=Ready pod/mysql-pod --timeout=60s

# Write data
kubectl exec -it mysql-pod -- mysql -uroot -prootpass123 \
  -e "CREATE DATABASE testdb; SHOW DATABASES;"

#═══════════════════════════════════════════════
# DEMONSTRATE PERSISTENCE ACROSS POD RESTARTS
#═══════════════════════════════════════════════

kubectl delete pod mysql-pod
# PV/PVC are NOT deleted — they're independent of the Pod

kubectl apply -f mysql-pod-with-pvc.yaml   # recreate the pod
kubectl wait --for=condition=Ready pod/mysql-pod --timeout=60s

kubectl exec -it mysql-pod -- mysql -uroot -prootpass123 -e "SHOW DATABASES;"
# testdb is STILL THERE — data survived pod deletion!

#═══════════════════════════════════════════════
# EXPAND A PVC (if allowVolumeExpansion: true)
#═══════════════════════════════════════════════

kubectl patch pvc mysql-pvc -p '{"spec":{"resources":{"requests":{"storage":"10Gi"}}}}'
kubectl get pvc mysql-pvc
# Capacity updates after the underlying storage backend processes it

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete pod mysql-pod
kubectl delete pvc mysql-pvc        # this triggers PV deletion (reclaimPolicy: Delete)
kubectl get pv                      # should show no PVs left
```

### 9.6 Common Errors & Troubleshooting

**Error 1: PVC stuck in `Pending`**
```bash
kubectl describe pvc mysql-pvc
# Events:
# Warning  ProvisioningFailed  no persistent volumes available for this claim

# Common causes:
# 1. No StorageClass exists / wrong storageClassName specified
kubectl get storageclass
# 2. No PV manually created (if using static provisioning) matching size/accessMode
# 3. Cloud provider quota exceeded
```

**Error 2: Pod stuck in `Pending` — "volume node affinity conflict"**
```bash
kubectl describe pod mysql-pod
# Warning  FailedScheduling  1 node(s) had volume node affinity conflict

# Cause: PV was provisioned in a specific zone/node, but pod is scheduled elsewhere
# Fix: ensure StorageClass uses volumeBindingMode: WaitForFirstConsumer
#      (delays provisioning until pod is scheduled, avoiding zone mismatches)
```

**Error 3: Data lost after pod restart (using emptyDir by mistake)**
```bash
# Symptom: app data disappears after every pod restart
kubectl get pod my-app -o yaml | grep -A5 volumes
# If you see "emptyDir: {}" instead of "persistentVolumeClaim", that's the bug

# Fix: switch to PVC-backed volume for any data that must survive restarts
```

### 9.7 Best Practices

- **Never use `hostPath` in production** — it's node-specific and breaks if the pod reschedules
- **Use dynamic provisioning** (StorageClass + PVC) over manual PV creation
- **Set `reclaimPolicy: Retain`** for critical data (databases) to prevent accidental deletion
- **Use `WaitForFirstConsumer`** binding mode to avoid zone/node scheduling conflicts
- **Right-size your PVCs** — resizing is supported (`allowVolumeExpansion: true`) but shrinking is NOT supported
- **Take regular snapshots** of PVs for critical data (via VolumeSnapshot API or cloud-native backup tools)
- **Match access modes to your workload** — most cloud block storage only supports RWO

### 9.8 Key Takeaways / Summary

- Container filesystems are ephemeral; use `emptyDir` for temp data, PV/PVC for persistent data
- PVC = the request ("I need X storage"), PV = the actual storage resource, StorageClass = how it's provisioned
- Dynamic provisioning (StorageClass + PVC) is the modern standard over manual PV creation
- PVs survive Pod deletion — perfect for databases and stateful workloads
- `reclaimPolicy` determines what happens to underlying storage when a PVC is deleted (`Delete` vs `Retain`)

### 9.9 Practice Questions / Tasks

1. Create a PVC requesting 2Gi of storage, mount it into a pod, write a file, delete the pod, recreate it, and verify the file still exists.
2. What's the difference between `accessModes: ReadWriteOnce` and `ReadWriteMany`? Give a real-world example of when you'd need RWX.
3. A PVC is stuck in `Pending` state. List the 3 most likely causes and how you'd check each one.

---

## 10. Namespaces, ResourceQuotas & LimitRanges

### 10.1 Learning Objectives

- Understand namespaces as a way to logically partition a cluster
- Apply ResourceQuotas to limit aggregate resource consumption
- Apply LimitRanges to set default/min/max resources per pod/container
- Design multi-tenant cluster resource governance

### 10.2 Concept Explanation

### Namespaces

A **Namespace** is a virtual cluster within a physical cluster. It provides scope for names (two pods can be named `web` if they're in different namespaces) and is the boundary for RBAC, ResourceQuotas, and NetworkPolicies.

> **Analogy:** A Kubernetes cluster is like an apartment building. Namespaces are individual apartments — each has its own rooms (Pods, Services) and the building (cluster) provides shared infrastructure (Nodes, networking). Apartment residents (teams) generally don't need to know what's in their neighbor's apartment.

### Default Namespaces

| Namespace | Purpose |
|-----------|---------|
| `default` | Where resources go if no namespace specified |
| `kube-system` | Kubernetes system components (API server, etcd, DNS) |
| `kube-public` | Readable by all users, even unauthenticated (rarely used) |
| `kube-node-lease` | Node heartbeat/lease objects for fast failure detection |

### ResourceQuota
Limits the **total** resource consumption (CPU, memory, object counts) within a namespace.

### LimitRange
Sets **default, minimum, and maximum** resource values for individual Pods/Containers within a namespace (so users don't have to specify them, and can't request absurd amounts).

```
ResourceQuota = "This entire apartment (namespace) can use max 10 CPU total"
LimitRange    = "Each room (pod) gets a default of 0.5 CPU if not specified,
                  but can't exceed 2 CPU"
```

### 10.3 Architecture / How it Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLUSTER                                      │
│                                                                     │
│  ┌──────────────────────┐   ┌──────────────────────┐                │
│  │  Namespace: team-a     │   │  Namespace: team-b     │            │
│  │                        │   │                        │            │
│  │  ResourceQuota:        │   │  ResourceQuota:        │            │
│  │   cpu: 10              │   │   cpu: 5               │            │
│  │   memory: 20Gi         │   │   memory: 10Gi         │            │
│  │   pods: 50             │   │   pods: 20             │            │
│  │                        │   │                        │            │
│  │  LimitRange:            │   │  LimitRange:            │          │
│  │   default cpu: 250m    │   │   default cpu: 100m    │            │
│  │   max cpu: 2            │   │   max cpu: 1            │          │
│  │                        │   │                        │            │
│  │  [Pod][Pod][Pod]...    │   │  [Pod][Pod]            │            │
│  └──────────────────────┘   └──────────────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
   Each namespace is isolated for quota/RBAC purposes,
   but Pods can still reach each other over the network by default
   (unless NetworkPolicies restrict it — see Chapter 20)
```

### 10.4 YAML Manifest / Config Example

### Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: team-a
  labels:
    team: team-a
    environment: production
```

### ResourceQuota

```yaml
# resourcequota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-a-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "10"              # sum of all pod CPU requests
    requests.memory: 20Gi           # sum of all pod memory requests
    limits.cpu: "20"                # sum of all pod CPU limits
    limits.memory: 40Gi
    pods: "50"                      # max number of pods
    services: "10"                  # max number of services
    services.loadbalancers: "2"     # max LoadBalancer services
    persistentvolumeclaims: "20"    # max PVCs
    requests.storage: 100Gi         # sum of all PVC storage requests
    count/deployments.apps: "20"    # max number of deployments
    count/secrets: "30"
    count/configmaps: "30"
```

### LimitRange

```yaml
# limitrange.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: team-a-limits
  namespace: team-a
spec:
  limits:
    - type: Container
      default:                      # applied if container doesn't specify limits
        cpu: "500m"
        memory: "512Mi"
      defaultRequest:                # applied if container doesn't specify requests
        cpu: "250m"
        memory: "256Mi"
      max:                           # hard ceiling — pods exceeding this are rejected
        cpu: "2"
        memory: "2Gi"
      min:                           # hard floor
        cpu: "100m"
        memory: "128Mi"
    - type: Pod
      max:
        cpu: "4"
        memory: "4Gi"
    - type: PersistentVolumeClaim
      max:
        storage: 50Gi
      min:
        storage: 1Gi
```

### 10.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CREATE NAMESPACE
#═══════════════════════════════════════════════

kubectl create namespace team-a
# or: kubectl apply -f namespace.yaml

kubectl get namespaces
# NAME              STATUS   AGE
# default           Active   10d
# kube-system       Active   10d
# team-a            Active   5s

#═══════════════════════════════════════════════
# WORKING WITHIN A NAMESPACE
#═══════════════════════════════════════════════

# Specify namespace per command
kubectl get pods -n team-a

# Set default namespace for current context (avoids typing -n every time)
kubectl config set-context --current --namespace=team-a
kubectl get pods    # now defaults to team-a

#═══════════════════════════════════════════════
# APPLY RESOURCEQUOTA
#═══════════════════════════════════════════════

kubectl apply -f resourcequota.yaml
kubectl get resourcequota -n team-a
# NAME            AGE   REQUEST                                LIMIT
# team-a-quota    5s    requests.cpu: 0/10, requests.memory: 0/20Gi   limits.cpu: 0/20...

kubectl describe resourcequota team-a-quota -n team-a
# Shows used vs hard limits for every tracked resource

#═══════════════════════════════════════════════
# APPLY LIMITRANGE
#═══════════════════════════════════════════════

kubectl apply -f limitrange.yaml
kubectl describe limitrange team-a-limits -n team-a

#═══════════════════════════════════════════════
# TEST: DEPLOY WITHOUT SPECIFYING RESOURCES
#═══════════════════════════════════════════════

kubectl run test-pod --image=nginx:1.25 -n team-a
kubectl get pod test-pod -n team-a -o jsonpath='{.spec.containers[0].resources}'
# {"limits":{"cpu":"500m","memory":"512Mi"},"requests":{"cpu":"250m","memory":"256Mi"}}
# LimitRange defaults were automatically applied!

#═══════════════════════════════════════════════
# TEST: EXCEED QUOTA
#═══════════════════════════════════════════════

kubectl run heavy-pod --image=nginx:1.25 -n team-a \
  --requests='cpu=15,memory=25Gi'
# Error from server (Forbidden): pods "heavy-pod" is forbidden:
# exceeded quota: team-a-quota, requested: requests.cpu=15,
# used: requests.cpu=250m, limited: requests.cpu=10

#═══════════════════════════════════════════════
# TEST: EXCEED LIMITRANGE MAX
#═══════════════════════════════════════════════

kubectl run too-big --image=nginx:1.25 -n team-a \
  --limits='cpu=5,memory=8Gi'
# Error: maximum cpu usage per Container is 2, but limit is 5

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete namespace team-a   # deletes EVERYTHING in the namespace
```

### 10.6 Common Errors & Troubleshooting

**Error 1: `forbidden: exceeded quota`**
```bash
kubectl describe resourcequota -n team-a
# Check "Used" vs "Hard" columns to see what's maxed out

# Fix: increase quota (if justified) or clean up unused resources
kubectl get pods -n team-a --sort-by=.spec.containers[0].resources.requests.cpu
```

**Error 2: Pod rejected — "must specify cpu" without LimitRange**
```bash
# If ResourceQuota exists but NO LimitRange, pods MUST explicitly specify
# requests/limits, or they'll be rejected:
# Error: failed quota: team-a-quota: must specify cpu,memory

# Fix: add a LimitRange with sane defaults, OR always specify
# requests/limits manually in every pod spec
```

**Error 3: Accidentally deleted entire namespace**
```bash
# kubectl delete namespace team-a deletes EVERYTHING inside it — no undo!
# Prevention: Use RBAC to restrict who can delete Namespaces (Chapter 18)
# Recovery: Restore from backup (Velero, etcd snapshot) — see Chapter 25
```

### 10.7 Best Practices

- **Namespace per team/environment**, not per microservice (avoid namespace sprawl)
- **Always pair ResourceQuota with LimitRange** — quota alone forces every pod author to specify requests/limits manually
- **Set `count/` quotas** on objects (deployments, secrets, services) to prevent resource exhaustion attacks
- **Reserve `kube-system` for system use only** — never deploy app workloads there
- **Use labels on namespaces** for organization and NetworkPolicy targeting
- **Audit quota usage regularly** — `kubectl describe resourcequota` across all namespaces
- Combine with **RBAC** to enforce true multi-tenancy (Chapter 18)

### 10.8 Key Takeaways / Summary

- Namespaces provide logical isolation for names, RBAC, and quotas — NOT network isolation by default
- ResourceQuota caps total resource consumption (CPU/memory/object counts) in a namespace
- LimitRange sets per-pod/container defaults, minimums, and maximums
- Without a LimitRange, ResourceQuota forces every workload to explicitly declare requests/limits
- `kubectl config set-context --current --namespace=X` saves typing `-n X` repeatedly

### 10.9 Practice Questions / Tasks

1. Create a namespace `staging` with a ResourceQuota of 4 CPU / 8Gi memory and a LimitRange with default requests of 200m CPU / 256Mi memory. Deploy 3 pods and verify defaults are applied.
2. Try to exceed the quota you just created. What error message do you get? How would you diagnose this in a real incident?
3. What's the difference between `requests.cpu` and `limits.cpu` in a ResourceQuota spec? Why track both separately?

## 11. Labels, Selectors, Annotations

### 11.1 Learning Objectives

- Understand the role of labels as the "glue" connecting Kubernetes objects
- Master label selectors (equality-based and set-based)
- Differentiate labels from annotations and know when to use each
- Use labels effectively for organizing and querying resources

### 11.2 Concept Explanation

### Labels

**Labels** are key-value pairs attached to objects, used to **identify and select** subsets of resources. They are the mechanism that connects Services to Pods, Deployments to ReplicaSets, NetworkPolicies to Pods, and more.

> **Analogy:** Labels are like sticky notes with attributes ("color: red", "team: backend", "env: prod"). A Service doesn't care about a Pod's *name* — it cares about its *labels*, just like a delivery driver doesn't care about your name, just your address (a queryable attribute).

### Annotations

**Annotations** are also key-value pairs, but they're for **non-identifying metadata** — information tools and humans use, but the cluster doesn't use for selection. Think: build version, contact info, last-updated-by, webhook configuration, tool-specific config.

| Aspect | Labels | Annotations |
|--------|--------|-------------|
| Purpose | Identify & select objects | Attach arbitrary metadata |
| Used by selectors? | ✅ Yes | ❌ No |
| Size limit | Small (63 chars per value) | Larger (up to 256KB total) |
| Example | `app=nginx`, `env=prod` | `description="deployed by CI build #4521"` |

### 11.3 Architecture / How it Works

```
┌─────────────────────────────────────────────────────────────────┐
│  Deployment                                                     │
│   metadata.labels: {app: web, tier: frontend}                   │
│   spec.selector.matchLabels: {app: web}  ←─────────┐            │
│   spec.template.metadata.labels: {app: web} ───┐    │           │
└─────────────────────────────────────────────┼────┼──────────────┘
                                              │    │ (must match)
                                              ▼    │
                              ┌────────────────────────────┐
                              │ Pod                        │
                              │  labels: {app: web}        │
                              └────────────────────────────┘
                                              ▲
┌─────────────────────────────────────────────┼─────────────────┐
│  Service                                     │                │
│   spec.selector: {app: web} ─────────────────┘                │
│   (routes traffic to any pod matching this label)             │
└───────────────────────────────────────────────────────────────┘

SELECTOR TYPES:
  Equality-based:  app=web, env!=prod
  Set-based:       env in (prod, staging), tier notin (cache), app
```

### 11.4 YAML Manifest / Config Example

### Object with Labels and Annotations

```yaml
# labeled-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  labels:                              # used for SELECTION
    app: web
    tier: frontend
    env: production
    version: v1.2.0
    team: platform
  annotations:                         # used for INFORMATION
    description: "Frontend web server for the customer portal"
    contact: "platform-team@company.com"
    build.ci/commit: "a1b2c3d4"
    build.ci/pipeline-url: "https://ci.company.com/builds/4521"
    kubernetes.io/change-cause: "Deployed via CI pipeline run #4521"
spec:
  containers:
    - name: nginx
      image: nginx:1.25
```

### Service Using Set-Based Selector (via separate selector resource pattern)

```yaml
# Note: Service selectors only support equality-based matching.
# Set-based selectors (in, notin) are used in NetworkPolicy, Deployment, Node Affinity.
# Example: NetworkPolicy with set-based selector
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: example-netpol
spec:
  podSelector:
    matchExpressions:
      - key: tier
        operator: In
        values: ["frontend", "backend"]
      - key: env
        operator: NotIn
        values: ["dev"]
  policyTypes:
    - Ingress
```

### 11.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CREATE LABELED RESOURCES
#═══════════════════════════════════════════════

kubectl apply -f labeled-pod.yaml

# Add labels imperatively
kubectl label pod web-pod owner=alice
kubectl label pod web-pod env=staging --overwrite    # update existing label

# Add annotations imperatively
kubectl annotate pod web-pod description="Updated description" --overwrite

#═══════════════════════════════════════════════
# VIEW LABELS & ANNOTATIONS
#═══════════════════════════════════════════════

kubectl get pods --show-labels
# NAME      READY   STATUS    RESTARTS   AGE   LABELS
# web-pod   1/1     Running   0          2m    app=web,env=staging,owner=alice,tier=frontend...

kubectl describe pod web-pod | grep -A5 Labels
kubectl describe pod web-pod | grep -A5 Annotations

#═══════════════════════════════════════════════
# QUERY USING LABEL SELECTORS (equality-based)
#═══════════════════════════════════════════════

kubectl get pods -l app=web
kubectl get pods -l app=web,tier=frontend          # AND condition
kubectl get pods -l env!=production                 # NOT equal

#═══════════════════════════════════════════════
# QUERY USING SET-BASED SELECTORS
#═══════════════════════════════════════════════

kubectl get pods -l 'env in (staging,production)'
kubectl get pods -l 'tier notin (cache)'
kubectl get pods -l 'app'                            # has label "app" (any value)
kubectl get pods -l '!deprecated'                    # does NOT have label "deprecated"

#═══════════════════════════════════════════════
# REMOVE A LABEL
#═══════════════════════════════════════════════

kubectl label pod web-pod owner-      # trailing dash removes the label

#═══════════════════════════════════════════════
# BULK OPERATIONS USING LABELS
#═══════════════════════════════════════════════

# Delete all pods with a specific label
kubectl delete pods -l env=staging

# Get all resources with a label across types
kubectl get all -l app=web

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete pod web-pod
```

### 11.6 Common Errors & Troubleshooting

**Error 1: Service routes to no pods (or wrong pods)**
```bash
# Always the same root cause: label mismatch
kubectl get svc my-svc -o jsonpath='{.spec.selector}'
kubectl get pods --show-labels | grep <expected-label>
# Fix labels on either the Service selector or the Pod template
```

**Error 2: Label value validation error**
```bash
# Error: Invalid value: "my value with spaces": a valid label must be...
# Kubernetes labels must match: [a-z0-9A-Z]([a-z0-9A-Z\-_.]*[a-z0-9A-Z])?
# Max 63 characters. No spaces allowed.
# Fix: use hyphens/underscores instead of spaces: "my-value-here"
```

**Error 3: Deployment selector immutability error**
```bash
# Already covered in Chapter 6 — selectors on Deployments can't change after creation
# This reinforces: choose your labeling scheme carefully before deploying to production
```

### 11.7 Best Practices

- **Adopt a consistent labeling scheme** across the org. Recommended standard labels (from Kubernetes docs):
  ```
  app.kubernetes.io/name: mysql
  app.kubernetes.io/instance: mysql-prod
  app.kubernetes.io/version: "8.0.34"
  app.kubernetes.io/component: database
  app.kubernetes.io/part-of: ecommerce-platform
  app.kubernetes.io/managed-by: helm
  ```
- **Use annotations for anything a human or tool reads but the cluster doesn't select on** (build info, monitoring config, ingress-controller specific settings)
- **Never put sensitive data in labels or annotations** — they're visible to anyone with read access and not encrypted
- **Keep label keys short and meaningful** — avoid deeply nested or overly verbose label structures
- **Document your labeling convention** in your team's README/wiki — inconsistency is the #1 cause of "why doesn't my selector work" bugs

### 11.8 Key Takeaways / Summary

- Labels are for **selection** (used by Services, Deployments, NetworkPolicies); annotations are for **information**
- Selectors come in two flavors: equality-based (`key=value`) and set-based (`key in (v1,v2)`)
- Service-to-Pod and Deployment-to-Pod relationships are ALL powered by label matching, not names
- A mismatched label/selector is the most common cause of "my Service isn't working" issues
- Adopt the `app.kubernetes.io/*` recommended label conventions for consistency across tools

### 11.9 Practice Questions / Tasks

1. Create 3 pods with different combinations of `env` and `tier` labels. Write `kubectl` selector queries to: (a) get all production pods, (b) get all frontend OR backend pods, (c) get pods that do NOT have a `tier` label.
2. Explain why a Deployment's `spec.selector` must be a subset of `spec.template.metadata.labels`. What happens if they don't match?
3. Design a labeling scheme for a 3-tier app (frontend, backend, database) across 3 environments (dev, staging, prod). Show example label sets for each component.

---

## 12. Health Checks – Liveness, Readiness, Startup Probes

### 12.1 Learning Objectives

- Understand why Kubernetes needs to know if your app is actually healthy
- Master the 3 probe types: liveness, readiness, startup
- Configure HTTP, TCP, exec, and gRPC probes
- Avoid common probe misconfigurations that cause outages

### 12.2 Concept Explanation

By default, Kubernetes only knows a container is "running" if the process inside hasn't exited. But a process can be running and **completely broken** (deadlocked, stuck waiting on a dependency, out of memory but not crashed). Probes let Kubernetes actually check application health.

> **Analogy:** Imagine a restaurant host (kube-proxy/Service) seating customers at tables (Pods). A **readiness probe** is the host checking "is this table actually set up and ready for customers?" before seating anyone there. A **liveness probe** is a manager periodically checking "is the chef at this station still conscious and cooking?" — if not, replace them. A **startup probe** is patience during the chef's initial setup time before the manager starts checking on them.

### The Three Probe Types

| Probe | Question Asked | Action on Failure |
|-------|----------------|-------------------|
| **Liveness** | "Is the app still alive/functional?" | Kubernetes **restarts** the container |
| **Readiness** | "Is the app ready to accept traffic?" | Pod is **removed from Service endpoints** (no restart) |
| **Startup** | "Has the app finished starting up?" | Kubernetes **waits** before running liveness/readiness; restarts if startup never succeeds |

### Why Startup Probes Matter

Slow-starting apps (large Java apps, apps doing migrations on boot) can be incorrectly killed by liveness probes that fire too early. Startup probes solve this by disabling liveness/readiness checks until startup succeeds.

```
WITHOUT startup probe:
  Pod starts → liveness probe checks at 10s → app still booting → FAILS → restart
  → app restarts → still booting at 10s → FAILS → restart → CRASH LOOP!

WITH startup probe:
  Pod starts → startup probe checks every 5s, up to 30 attempts (150s budget)
  → app finishes booting at 45s → startup probe succeeds
  → NOW liveness/readiness probes begin normal operation
```

### 12.3 Architecture / How it Works

```
                    Pod Lifecycle with Probes
┌─────────────────────────────────────────────────────────────────────────┐
│ Container starts                                                        │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────┐                                                     │
│ │ Startup Probe     │  Runs FIRST. Liveness/Readiness disabled          │
│ │ (if configured)   │  until this succeeds.                             │
│ └────────┬─────────┘                                                    │
│          │ succeeds                                                     │
│          ▼                                                              │
│  ┌──────────────────────┬──────────────────────┐                        │
│  ▼                       ▼                       │                      │
│ ┌─────────────────┐  ┌─────────────────┐         │                      │
│ │ Readiness Probe   │  │ Liveness Probe    │         │  Both run        │
│ │ (runs repeatedly) │  │ (runs repeatedly) │         │  in              │
│ │                   │  │                   │         │  parallel        │
│ │ Fail → removed     │  │ Fail → container   │         │                │
│ │ from Service        │  │ restarted           │         │              │
│ │ endpoints            │  │ (respects           │         │             │
│ │ (traffic stops)      │  │ restartPolicy)       │         │            │
│ └─────────────────┘  └─────────────────┘         │                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Probe Mechanisms

```
httpGet   → HTTP GET request; 200-399 = success
tcpSocket → TCP connection attempt; connects = success
exec      → runs a command inside container; exit code 0 = success
grpc      → gRPC health check protocol (K8s 1.24+, stable in 1.27+)
```

### 12.4 YAML Manifest / Config Example

### Complete Pod with All 3 Probe Types

```yaml
# probes-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: probes-demo
  labels:
    app: probes-demo
spec:
  containers:
    - name: app
      image: nginx:1.25
      ports:
        - containerPort: 80

      # STARTUP PROBE: gives the app time to boot before other probes kick in
      startupProbe:
        httpGet:
          path: /healthz
          port: 80
        failureThreshold: 30        # allow up to 30 failures...
        periodSeconds: 5            # ...checked every 5s = 150s total startup budget
        timeoutSeconds: 3

      # LIVENESS PROBE: restarts container if it deadlocks/hangs
      livenessProbe:
        httpGet:
          path: /healthz
          port: 80
          httpHeaders:
            - name: Custom-Header
              value: liveness-check
        initialDelaySeconds: 0       # startupProbe already handled the warmup
        periodSeconds: 10            # check every 10s
        timeoutSeconds: 3            # fail if no response in 3s
        failureThreshold: 3          # restart after 3 consecutive failures
        successThreshold: 1          # 1 success = healthy again (must be 1 for liveness)

      # READINESS PROBE: removes from Service if temporarily not ready
      readinessProbe:
        httpGet:
          path: /ready
          port: 80
        initialDelaySeconds: 0
        periodSeconds: 5             # checked more frequently than liveness
        timeoutSeconds: 2
        failureThreshold: 2          # remove from endpoints after 2 failures
        successThreshold: 1          # 1 success = add back to endpoints
```

### TCP Socket Probe (for non-HTTP services like databases)

```yaml
# tcp-probe-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: redis-pod
spec:
  containers:
    - name: redis
      image: redis:7.2
      ports:
        - containerPort: 6379
      livenessProbe:
        tcpSocket:
          port: 6379
        initialDelaySeconds: 5
        periodSeconds: 10
      readinessProbe:
        tcpSocket:
          port: 6379
        initialDelaySeconds: 5
        periodSeconds: 5
```

### Exec Probe (custom script-based check)

```yaml
# exec-probe-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: exec-probe-demo
spec:
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "touch /tmp/healthy && sleep 3600"]
      livenessProbe:
        exec:
          command:
            - cat
            - /tmp/healthy
        initialDelaySeconds: 5
        periodSeconds: 5
```

### 12.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# DEPLOY WITH PROBES
#═══════════════════════════════════════════════

kubectl apply -f probes-pod.yaml
kubectl get pod probes-demo -w
# NAME           READY   STATUS    RESTARTS   AGE
# probes-demo    0/1     Running   0          2s    ← startup probe running
# probes-demo    1/1     Running   0          8s    ← startup succeeded, now Ready

#═══════════════════════════════════════════════
# INSPECT PROBE STATUS
#═══════════════════════════════════════════════

kubectl describe pod probes-demo
# Look for:
#   Liveness:   http-get http://:80/healthz delay=0s timeout=3s period=10s #success=1 #failure=3
#   Readiness:  http-get http://:80/ready delay=0s timeout=2s period=5s #success=1 #failure=2
#   Startup:    http-get http://:80/healthz delay=0s timeout=3s period=5s #success=1 #failure=30

#═══════════════════════════════════════════════
# SIMULATE READINESS FAILURE (won't restart, just removes from Service)
#═══════════════════════════════════════════════

# Since nginx doesn't have /ready by default, this pod will actually show NotReady:
kubectl get pod probes-demo
# NAME           READY   STATUS    RESTARTS   AGE
# probes-demo    0/1     Running   0          1m   ← 0/1 = failing readiness, but NOT restarting

kubectl describe pod probes-demo | tail -10
# Events:
# Warning  Unhealthy  Readiness probe failed: HTTP probe failed with statuscode: 404

#═══════════════════════════════════════════════
# SIMULATE LIVENESS FAILURE (causes restart)
#═══════════════════════════════════════════════

kubectl apply -f exec-probe-pod.yaml
kubectl exec exec-probe-demo -- rm /tmp/healthy   # break the health check
kubectl get pod exec-probe-demo -w
# NAME              READY   STATUS    RESTARTS   AGE
# exec-probe-demo   1/1     Running   0          30s
# exec-probe-demo   1/1     Running   1          50s   ← RESTARTS increased!

kubectl describe pod exec-probe-demo | grep -A5 Events
# Warning  Unhealthy  Liveness probe failed: cat: can't open '/tmp/healthy': No such file
# Normal   Killing    Container app failed liveness probe, will be restarted

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete pod probes-demo redis-pod exec-probe-demo
```

### 12.6 Common Errors & Troubleshooting

**Error 1: Pod constantly restarting due to liveness probe too aggressive**
```bash
kubectl describe pod my-app | grep -A10 Events
# Warning  Unhealthy  Liveness probe failed: Get http://10.244.0.5:8080/health:
#          context deadline exceeded

# Cause: timeoutSeconds too short for a slow endpoint, OR app needs more startup time
# Fix: increase timeoutSeconds, or add a startupProbe to give boot time:
#   startupProbe:
#     httpGet: {path: /health, port: 8080}
#     failureThreshold: 30
#     periodSeconds: 10
```

**Error 2: Pod never becomes Ready, Service has no traffic**
```bash
kubectl describe pod my-app | grep Readiness
# Readiness probe failed: HTTP probe failed with statuscode: 503

# Debug: check if the readiness endpoint is even correct
kubectl exec -it my-app -- curl -v localhost:8080/ready
# Common cause: app's actual health endpoint path differs from what's configured
# Common cause: app depends on a DB connection that isn't ready yet (this is CORRECT
#               behavior actually — readiness SHOULD fail until dependencies are up)
```

**Error 3: Confusing liveness and readiness — using the SAME probe for both**
```bash
# Anti-pattern: if liveness checks a database connection, a temporary DB blip
# causes Kubernetes to kill and restart the APP (wrong!) instead of just
# removing it from load balancing (right!) until the DB recovers.
#
# Fix: liveness should ONLY check "is my own process responsive"
#      readiness should check "are my dependencies (DB, cache, etc.) available"
```

### 12.7 Best Practices

- **Always set a startupProbe for slow-starting apps** (Java/Spring Boot, .NET, apps doing migrations)
- **Keep liveness probes simple** — only check if the process itself is responsive, NOT external dependencies (avoid cascading restarts)
- **Make readiness probes check real dependencies** — DB connections, cache availability, downstream service health
- **Never make liveness and readiness identical** — they serve different purposes
- **Set realistic `failureThreshold` and `periodSeconds`** — too aggressive causes false-positive restarts; too lenient delays detection of real issues
- **Always implement a dedicated `/healthz` (liveness) and `/ready` (readiness) endpoint** in your application — don't just probe `/` 
- **Use `tcpSocket` for non-HTTP services** (databases, message queues) when no HTTP health endpoint exists

### 12.8 Key Takeaways / Summary

- Liveness probe failure → **container restart**; Readiness probe failure → **removed from Service endpoints** (no restart)
- Startup probe delays liveness/readiness checks until slow-starting apps finish booting
- Probes support `httpGet`, `tcpSocket`, `exec`, and `grpc` mechanisms
- Liveness should be simple (self-check only); readiness should check actual dependencies
- Misconfigured probes are one of the **most common causes of production outages** — test thoroughly before deploying

### 12.9 Practice Questions / Tasks

1. Deploy a pod with a deliberately too-short `livenessProbe timeoutSeconds` causing it to crash-loop. Diagnose the issue using `kubectl describe` and fix it.
2. Explain the real-world scenario where a readiness probe should fail but a liveness probe should still pass. Why does this distinction matter for production stability?
3. Design probes (with reasoning for each setting) for a Spring Boot Java app that takes ~60 seconds to start and connects to a PostgreSQL database.

---

## 13. Jobs & CronJobs

### 13.1 Learning Objectives

- Understand when to use Jobs vs Deployments
- Run one-off and parallel batch workloads with Jobs
- Schedule recurring tasks with CronJobs
- Configure retry behavior, parallelism, and completion tracking

### 13.2 Concept Explanation

Deployments are for **long-running** services (web servers, APIs) that should always be up. But what about tasks that **run to completion and stop** — database migrations, batch processing, report generation, backups?

That's what **Jobs** are for.

> **Analogy:** A Deployment is like a 24/7 staffed reception desk — always someone there. A Job is like hiring a contractor to paint a room — once it's done, they leave; you don't need them running forever. A CronJob is hiring that same contractor on a recurring schedule (e.g., "repaint every Monday").

### Job
Runs Pod(s) until a specified number of them **successfully complete**. If a Pod fails, the Job can retry it (based on `backoffLimit`).

### CronJob
Creates Jobs on a **recurring schedule**, using cron syntax (`* * * * *`).

### 13.3 Architecture / How it Works

```
┌────────────────────────────────────────────────────────────────┐
│ CronJob: nightly-backup                                        │
│  schedule: "0 2 * * *"   (2 AM daily)                          │
└────────────────────────┬───────────────────────────────────────┘
                          │ creates (at each scheduled time)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Job: nightly-backup-28392001 (one per scheduled run)            │
│  spec.completions: 1                                            │
│  spec.parallelism: 1                                            │
│  spec.backoffLimit: 3   (retry up to 3 times on failure)        │
└────────────────────────┬────────────────────────────────────────┘
                          │ creates
                          ▼
                ┌─────────────────────┐
                │  Pod (runs once)    │
                │  restartPolicy:     │
                │   Never/OnFailure   │
                └─────────────────────┘
                                      │
              ┌───────────┴───────────┐
              ▼                       ▼
         Succeeded                 Failed
       (Job marked                (retry up to
        Complete)                  backoffLimit,
                                   then Job marked
                                   Failed)

JOB PATTERNS:
┌────────────────────────────────────────────────────────────┐
│ Non-parallel: completions=1, parallelism=1 (default)       │
│   → one pod runs once                                      │
│                                                            │
│ Fixed completion count: completions=5, parallelism=2       │
│   → runs 5 pods total, max 2 at a time                     │
│                                                            │
│ Work queue: completions=null, parallelism=3                │
│   → pods coordinate via external queue, any success ends   │
└────────────────────────────────────────────────────────────┘
```

### 13.4 YAML Manifest / Config Example

### Simple Job

```yaml
# job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  backoffLimit: 3                 # retry up to 3 times before marking Failed
  activeDeadlineSeconds: 300       # kill job if it runs longer than 5 minutes
  ttlSecondsAfterFinished: 3600    # auto-delete job 1 hour after completion (cleanup)
  template:
    spec:
      containers:
        - name: migrate
          image: migrate/migrate:v4.17.0
          command:
            - migrate
            - -path=/migrations
            - -database=postgres://user:pass@db:5432/mydb?sslmode=disable
            - up
      restartPolicy: OnFailure     # Job pods MUST use OnFailure or Never (not Always)
```

### Parallel Job (Fixed Completion Count)

```yaml
# parallel-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: parallel-processing
spec:
  completions: 6                  # total successful pod completions needed
  parallelism: 2                  # max pods running simultaneously
  backoffLimit: 4
  template:
    spec:
      containers:
        - name: worker
          image: busybox:1.36
          command: ["sh", "-c", "echo Processing chunk $JOB_COMPLETION_INDEX; sleep 5"]
      restartPolicy: Never
  completionMode: Indexed          # gives each pod a unique JOB_COMPLETION_INDEX (0-5)
```

### CronJob

```yaml
# cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"                    # cron syntax: min hour day month weekday
  timeZone: "Asia/Kolkata"                 # K8s 1.27+ supports explicit timezone
  concurrencyPolicy: Forbid                # Allow | Forbid | Replace
  successfulJobsHistoryLimit: 3            # keep last 3 successful Job records
  failedJobsHistoryLimit: 1                # keep last 1 failed Job record
  startingDeadlineSeconds: 100             # if missed by this much, skip (don't backfill)
  suspend: false                            # set true to pause the CronJob
  jobTemplate:
    spec:
      backoffLimit: 2
      activeDeadlineSeconds: 600
      template:
        spec:
          containers:
            - name: backup
              image: postgres:16-alpine
              command:
                - sh
                - -c
                - |
                  pg_dump -h db-service -U postgres mydb > /backup/dump-$(date +%Y%m%d).sql
                  echo "Backup completed"
              env:
                - name: PGPASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: db-secret
                      key: password
              volumeMounts:
                - name: backup-storage
                  mountPath: /backup
          volumes:
            - name: backup-storage
              persistentVolumeClaim:
                claimName: backup-pvc
          restartPolicy: OnFailure
```

### Cron Schedule Syntax Reference

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
│ │ │ │ │
* * * * *

Examples:
"0 2 * * *"     → every day at 2:00 AM
"*/15 * * * *"  → every 15 minutes
"0 0 * * 0"     → every Sunday at midnight
"0 9-17 * * 1-5"→ every hour from 9 AM-5 PM, Mon-Fri
```

### 13.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# RUN A SIMPLE JOB
#═══════════════════════════════════════════════

kubectl apply -f job.yaml
kubectl get jobs
# NAME            COMPLETIONS   DURATION   AGE
# db-migration    0/1           5s         5s

kubectl get pods -l job-name=db-migration
# NAME                  READY   STATUS      RESTARTS   AGE
# db-migration-7xk2p    0/1     Completed   0          8s

kubectl get jobs
# NAME            COMPLETIONS   DURATION   AGE
# db-migration    1/1           7s         10s        ← COMPLETIONS shows 1/1

kubectl logs job/db-migration
# (shows migration output)

#═══════════════════════════════════════════════
# RUN A PARALLEL JOB
#═══════════════════════════════════════════════

kubectl apply -f parallel-job.yaml
kubectl get pods -l job-name=parallel-processing -w
# Watch as max 2 pods run at a time, totaling 6 completions

kubectl get jobs parallel-processing
# NAME                   COMPLETIONS   DURATION   AGE
# parallel-processing    6/6           18s        20s

#═══════════════════════════════════════════════
# CREATE CRONJOB
#═══════════════════════════════════════════════

kubectl apply -f cronjob.yaml
kubectl get cronjobs
# NAME              SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
# nightly-backup    0 2 * * *     False     0        <none>          5s

# For testing, manually trigger a CronJob immediately (don't wait for schedule)
kubectl create job manual-backup-test --from=cronjob/nightly-backup
kubectl get jobs
kubectl logs job/manual-backup-test

#═══════════════════════════════════════════════
# SUSPEND/RESUME A CRONJOB
#═══════════════════════════════════════════════

kubectl patch cronjob nightly-backup -p '{"spec":{"suspend":true}}'
kubectl get cronjob nightly-backup
# SUSPEND now shows True — won't trigger new jobs

kubectl patch cronjob nightly-backup -p '{"spec":{"suspend":false}}'

#═══════════════════════════════════════════════
# VIEW CRONJOB HISTORY
#═══════════════════════════════════════════════

kubectl get jobs --selector=job-name  # all jobs created by cronjobs
kubectl get jobs -o jsonpath='{.items[*].metadata.name}'

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete job db-migration parallel-processing manual-backup-test
kubectl delete cronjob nightly-backup
```

### 13.6 Common Errors & Troubleshooting

**Error 1: Job pod stuck — `restartPolicy: Always` error**
```bash
# Error: The Job "my-job" is invalid: spec.template.spec.restartPolicy:
# Unsupported value: "Always": supported values: "OnFailure", "Never"

# Fix: Jobs CANNOT use restartPolicy: Always (that's only for Deployments/Pods
# meant to run forever). Use OnFailure or Never.
```

**Error 2: CronJob not triggering**
```bash
kubectl get cronjob nightly-backup
# Check "SUSPEND" column — if True, it won't run

kubectl describe cronjob nightly-backup
# Check Events for scheduling issues

# Common cause: concurrencyPolicy: Forbid + previous job still running
kubectl get jobs -l job-name  # check if a previous job is stuck
```

**Error 3: Job retries forever / backoffLimit not respected**
```bash
kubectl describe job my-job
# Check: Pods Statuses: X Succeeded / Y Failed

# Note: failed pods aren't immediately deleted (for debugging) — check logs:
kubectl logs -l job-name=my-job --all-containers

# If backoffLimit is reached, Job shows condition "Failed"
kubectl get job my-job -o jsonpath='{.status.conditions}'
```

### 13.7 Best Practices

- **Always set `backoffLimit`** to avoid infinite retries on a permanently broken Job
- **Set `activeDeadlineSeconds`** to prevent runaway/stuck jobs from running forever
- **Set `ttlSecondsAfterFinished`** to auto-cleanup completed Jobs (avoid clutter)
- **Use `concurrencyPolicy: Forbid`** for CronJobs where overlapping runs would cause issues (e.g., backups, migrations)
- **Test CronJobs manually first** using `kubectl create job --from=cronjob/X` before trusting the schedule
- **Monitor `failedJobsHistoryLimit`** — keep at least 1 for debugging failed runs
- **Use `completionMode: Indexed`** for parallel jobs that need to process partitioned data (each pod knows its index)

### 13.8 Key Takeaways / Summary

- Jobs run Pods to **completion**; Deployments run Pods **forever**
- Job `restartPolicy` must be `OnFailure` or `Never` (not `Always`)
- CronJobs create Jobs on a schedule using standard cron syntax
- `concurrencyPolicy` controls overlapping run behavior: `Allow`, `Forbid`, `Replace`
- `kubectl create job --from=cronjob/X` is the fastest way to manually test a CronJob

### 13.9 Practice Questions / Tasks

1. Create a Job that runs 5 completions with a parallelism of 2, where each pod prints its completion index. Verify with `kubectl logs`.
2. Create a CronJob that runs every 2 minutes, printing the current date. Watch it trigger automatically using `kubectl get jobs -w`.
3. A CronJob hasn't triggered in 3 hours despite a `*/30 * * * *` schedule. List 3 things you'd check to diagnose this.

---

## 14. DaemonSets

### 14.1 Learning Objectives

- Understand the purpose of DaemonSets — running one pod per node
- Differentiate DaemonSets from Deployments
- Configure node selection and tolerations for DaemonSets
- Deploy common DaemonSet use cases (logging agents, monitoring agents)

### 14.2 Concept Explanation

A **DaemonSet** ensures that **every node** (or a selected subset) runs exactly one copy of a Pod. As nodes are added to the cluster, Pods are automatically added; as nodes are removed, those Pods are garbage collected.

> **Analogy:** A Deployment is like having 3 security guards total, distributed wherever convenient. A DaemonSet is like having exactly ONE security guard stationed at every building entrance — every building gets coverage, regardless of how many buildings (nodes) exist.

### Common DaemonSet Use Cases

- **Log collection agents** (Fluentd, Filebeat, Fluent Bit) — need to read logs from every node
- **Monitoring agents** (Prometheus Node Exporter, Datadog Agent) — need node-level metrics from every node
- **Network plugins** (Calico, Cilium, Flannel) — need to configure networking on every node
- **Storage daemons** (Ceph, GlusterFS) — need a presence on every node for distributed storage
- **Security/Compliance agents** (Falco, security scanners)

### 14.3 Architecture / How it Works

```
┌────────────────────────────────────────────────────────────────┐
│ DaemonSet: node-exporter                                       │
│  template: {image: prom/node-exporter, ...}                    │
└──────────┬──────────────┬──────────────┬───────────────────────┘
           │              │                                      │
   automatically schedules ONE pod per matching node
           │              │              │
           ▼              ▼              ▼
   ┌─────────────┐ ┌─────────────┐ ┌────────────────┐
   │   Node 1     │ │   Node 2     │ │   Node 3     │
   │              │ │              │ │              │
   │ [node-exp.   │ │ [node-exp.   │ │ [node-exp.   │
   │   Pod]       │ │   Pod]       │ │   Pod]       │
   └─────────────┘ └─────────────┘ └────────────────┘

  New Node 4 joins cluster → DaemonSet controller AUTOMATICALLY
  schedules a new pod there, no manual intervention needed

  DaemonSet pods bypass the normal scheduler's resource-based
  placement logic — they go on every (matching) node regardless
```

### 14.4 YAML Manifest / Config Example

### Basic DaemonSet (Node Monitoring Agent)

```yaml
# daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  labels:
    app: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostNetwork: true               # use the node's network namespace directly
      hostPID: true                   # see host processes (needed for some monitoring)
      tolerations:                     # allow scheduling on control-plane/tainted nodes
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
          effect: NoSchedule
        - key: node-role.kubernetes.io/master
          operator: Exists
          effect: NoSchedule
      containers:
        - name: node-exporter
          image: prom/node-exporter:v1.7.0
          ports:
            - containerPort: 9100
              hostPort: 9100
          resources:
            requests:
              cpu: "50m"
              memory: "64Mi"
            limits:
              cpu: "100m"
              memory: "128Mi"
          volumeMounts:
            - name: proc
              mountPath: /host/proc
              readOnly: true
            - name: sys
              mountPath: /host/sys
              readOnly: true
      volumes:
        - name: proc
          hostPath:
            path: /proc
        - name: sys
          hostPath:
            path: /sys
      terminationGracePeriodSeconds: 30
  updateStrategy:
    type: RollingUpdate              # or OnDelete (manual updates)
    rollingUpdate:
      maxUnavailable: 1
```

### DaemonSet Targeting Specific Nodes (nodeSelector)

```yaml
# daemonset-selective.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: gpu-monitoring
spec:
  selector:
    matchLabels:
      app: gpu-monitoring
  template:
    metadata:
      labels:
        app: gpu-monitoring
    spec:
      nodeSelector:
        hardware-type: gpu             # only runs on nodes labeled this way
      containers:
        - name: gpu-monitor
          image: nvidia/dcgm-exporter:3.3.0
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
```

### 14.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# DEPLOY DAEMONSET
#═══════════════════════════════════════════════

kubectl apply -f daemonset.yaml
kubectl get daemonset node-exporter
# NAME            DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
# node-exporter   1         1         1       1            1           <none>          10s

# Note: DESIRED equals the number of (eligible) nodes in the cluster
kubectl get nodes
# (compare node count to DESIRED above)

#═══════════════════════════════════════════════
# VERIFY ONE POD PER NODE
#═══════════════════════════════════════════════

kubectl get pods -l app=node-exporter -o wide
# NAME                  READY   STATUS    NODE
# node-exporter-7x2kp   1/1     Running   minikube-m02
# node-exporter-9j8lm   1/1     Running   minikube-m03
# (on multi-node cluster, you'd see one pod per node)

#═══════════════════════════════════════════════
# TEST NODE-SELECTIVE DAEMONSET
#═══════════════════════════════════════════════

# Label a specific node
kubectl label node minikube-m02 hardware-type=gpu

kubectl apply -f daemonset-selective.yaml
kubectl get pods -l app=gpu-monitoring -o wide
# Only runs on minikube-m02 (the labeled node)

#═══════════════════════════════════════════════
# ROLLING UPDATE OF DAEMONSET
#═══════════════════════════════════════════════

kubectl set image daemonset/node-exporter node-exporter=prom/node-exporter:v1.8.0
kubectl rollout status daemonset/node-exporter
kubectl rollout history daemonset/node-exporter

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete daemonset node-exporter gpu-monitoring
kubectl label node minikube-m02 hardware-type-   # remove the label
```

### 14.6 Common Errors & Troubleshooting

**Error 1: DaemonSet pods not scheduling on control-plane nodes**
```bash
kubectl get pods -l app=node-exporter -o wide
# Missing from control-plane node

# Cause: control-plane nodes have a NoSchedule taint by default
kubectl describe node <control-plane-node> | grep Taints
# Taints: node-role.kubernetes.io/control-plane:NoSchedule

# Fix: add matching tolerations in the DaemonSet spec (shown in YAML example above)
```

**Error 2: DaemonSet DESIRED count doesn't match expected nodes**
```bash
kubectl get daemonset node-exporter
# DESIRED: 2, but cluster has 3 nodes

# Cause: nodeSelector or node affinity excludes some nodes, OR
#        one node doesn't meet resource requirements
kubectl describe daemonset node-exporter
# Check Events for "FailedScheduling" or selector mismatches
```

**Error 3: hostPath/hostNetwork access denied**
```bash
kubectl describe pod node-exporter-xxxxx
# Error: container has runAsNonRoot and image will run as root

# Cause: Pod Security Standards/Admission blocking privileged access
# Fix: review your namespace's Pod Security level (Chapter 22) — DaemonSets
# needing host access often require "privileged" PSS level
```

### 14.7 Best Practices

- **Use tolerations** to ensure critical DaemonSets (logging, monitoring, CNI) run on ALL nodes including control-plane
- **Set tight resource requests/limits** — DaemonSets run on every node, so resource bloat multiplies across the cluster
- **Use `RollingUpdate` strategy** with `maxUnavailable` to avoid losing monitoring/logging coverage during updates
- **Avoid `hostNetwork`/`hostPID`/privileged mode** unless absolutely necessary — security risk
- **Label nodes thoughtfully** if you need selective DaemonSets (e.g., GPU nodes, edge nodes)
- DaemonSets bypass normal scheduling — be cautious about resource contention with other workloads on the same node

### 14.8 Key Takeaways / Summary

- DaemonSets guarantee exactly one Pod per (matching) node — perfect for node-level agents
- New nodes automatically get the DaemonSet pod; removed nodes automatically clean it up
- Tolerations are required to run DaemonSet pods on tainted nodes (like control-plane)
- Common use cases: logging agents, monitoring/metrics agents, CNI plugins, storage daemons
- Unlike Deployments, you don't set `replicas` — the node count determines pod count

### 14.9 Practice Questions / Tasks

1. Deploy a DaemonSet running `busybox` that just sleeps, and verify it has a pod on every node in your cluster (use a multi-node minikube/kind cluster).
2. Label one node with `environment=edge` and modify your DaemonSet to use `nodeSelector` so it only runs there. Verify with `kubectl get pods -o wide`.
3. Explain why DaemonSets typically need `tolerations` for control-plane nodes but regular Deployments don't.

---

## 15. StatefulSets (For Stateful Apps Like Databases)

### 15.1 Learning Objectives

- Understand why Deployments aren't suitable for stateful applications
- Master StatefulSet's stable identity, ordered deployment, and persistent storage
- Configure headless Services for StatefulSet pod discovery
- Deploy a clustered database-style application (e.g., a 3-node setup)

### 15.2 Concept Explanation

Deployments treat Pods as **interchangeable cattle** — any pod can be replaced by any other, in any order, with a random name suffix. That works great for stateless web servers. But what about a database cluster where:
- Each node needs a **stable, predictable identity** (e.g., `mysql-0`, `mysql-1`, `mysql-2`)
- Each node needs its **own dedicated persistent storage** that follows it across restarts
- Nodes must start/stop in a **specific order** (primary before replicas)

That's what **StatefulSets** provide.

> **Analogy:** Deployment Pods are like generic numbered parking spots in a large lot — any car can park in any spot, doesn't matter which. StatefulSet Pods are like assigned, named parking spots with your name plate ("mysql-0's spot") — even if the car leaves and comes back, it returns to the SAME spot with the SAME storage locker attached.

### Key StatefulSet Guarantees

| Guarantee | Deployment | StatefulSet |
|-----------|-----------|-------------|
| Pod naming | Random suffix (`web-7d9f8c6b5d-x2k9p`) | Predictable ordinal (`web-0`, `web-1`, `web-2`) |
| Pod identity | Interchangeable | Stable, sticky identity |
| Storage | Shared or none | Dedicated PVC per pod, persists across rescheduling |
| Scaling order | Parallel, any order | Sequential (0, 1, 2... up; reverse down) |
| DNS | Service load-balances to any pod | Each pod gets its own stable DNS name |
| Update order | Any order (configurable) | Ordered, reverse sequential by default |

### 15.3 Architecture / How it Works

```
┌──────────────────────────────────────────────────────────────────┐
│ Headless Service: mysql (clusterIP: None)                        │
│  Provides DNS for EACH pod individually, not just round-robin    │
└────────────────────────┬─────────────────────────────────────────┘
                                                                   │
┌──────────────────────────────────────────────────────────────────┐
│ StatefulSet: mysql                                               │
│  serviceName: mysql                                              │
│  replicas: 3                                                     │
└──────────┬──────────────┬──────────────┬─────────────────────────┘
           │ creates in ORDER: 0, then 1, then 2
           ▼              ▼              ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐
   │  mysql-0     │ │  mysql-1     │ │  mysql-2      │
   │  (Primary)   │ │  (Replica)   │ │  (Replica)    │
   │              │ │              │ │               │
   │  DNS:        │ │  DNS:        │ │  DNS:         │
   │  mysql-0.    │ │  mysql-1.    │ │  mysql-2.     │
   │  mysql.      │ │  mysql.      │ │  mysql.       │
   │  default.    │ │  default.    │ │  default.     │
   │  svc.        │ │  svc.        │ │  svc.         │
   │  cluster.    │ │  cluster.    │ │  cluster.     │
   │  local       │ │  local       │ │  local        │
   └──────┬──────┘ └──────┬──────┘ └──────┬──────────┘
          │               │                          │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────────┐
   │ PVC:         │ │ PVC:         │ │ PVC:          │
   │ data-mysql-0 │ │ data-mysql-1 │ │ data-mysql-2  │
   │ (dedicated,  │ │ (dedicated,  │ │ (dedicated,   │
   │  follows pod │ │  follows pod │ │  follows pod  │
   │  on reschedule)│ on reschedule)│  on reschedule)│
   └─────────────┘ └─────────────┘ └─────────────────┘

SCALING UP: mysql-0 → mysql-1 → mysql-2 (sequential, each must be Ready first)
SCALING DOWN: mysql-2 → mysql-1 → mysql-0 (reverse order)
DELETION: PVCs are NOT deleted automatically (data safety) unless explicitly removed
```

### 15.4 YAML Manifest / Config Example

### Headless Service + StatefulSet (MySQL-style cluster)

```yaml
# headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql
spec:
  clusterIP: None          # makes it "headless" — no load balancing, direct pod DNS
  selector:
    app: mysql
  ports:
    - port: 3306
      name: mysql
---
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql                # must match the headless Service name
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  podManagementPolicy: OrderedReady # OrderedReady (default) or Parallel
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0                  # update pods with ordinal >= partition (canary control)
  template:
    metadata:
      labels:
        app: mysql
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
              name: mysql
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: root-password
            - name: MYSQL_REPLICATION_MODE
              value: "auto"
          volumeMounts:
            - name: data
              mountPath: /var/lib/mysql
          readinessProbe:
            exec:
              command: ["mysqladmin", "ping", "-h", "localhost"]
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            exec:
              command: ["mysqladmin", "ping", "-h", "localhost"]
            initialDelaySeconds: 30
            periodSeconds: 10
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "500m"
              memory: "1Gi"

  # volumeClaimTemplates: each pod gets its OWN PVC, automatically created
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        resources:
          requests:
            storage: 5Gi
```

### Secret for MySQL Password (referenced above)

```yaml
# mysql-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
stringData:
  root-password: "supersecretpassword123"
```

### 15.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# DEPLOY STATEFULSET
#═══════════════════════════════════════════════

kubectl apply -f mysql-secret.yaml
kubectl apply -f headless-service.yaml
kubectl apply -f statefulset.yaml

#═══════════════════════════════════════════════
# WATCH ORDERED POD CREATION
#═══════════════════════════════════════════════

kubectl get pods -l app=mysql -w
# NAME       READY   STATUS    AGE
# mysql-0    0/1     Pending   2s
# mysql-0    1/1     Running   20s   ← mysql-0 fully ready FIRST
# mysql-1    0/1     Pending   21s   ← THEN mysql-1 starts
# mysql-1    1/1     Running   40s
# mysql-2    0/1     Pending   41s   ← THEN mysql-2 starts
# mysql-2    1/1     Running   60s

kubectl get statefulset mysql
# NAME    READY   AGE
# mysql   3/3     1m

#═══════════════════════════════════════════════
# VERIFY STABLE NAMING & DNS
#═══════════════════════════════════════════════

kubectl get pods -l app=mysql
# mysql-0, mysql-1, mysql-2 (always these exact names)

# Test individual pod DNS resolution
kubectl run dns-test --image=busybox:1.36 -it --rm -- \
  nslookup mysql-0.mysql.default.svc.cluster.local
# Resolves to mysql-0's specific Pod IP (not load-balanced!)

#═══════════════════════════════════════════════
# VERIFY DEDICATED STORAGE
#═══════════════════════════════════════════════

kubectl get pvc
# NAME             STATUS   VOLUME              CAPACITY   ACCESS MODES
# data-mysql-0     Bound    pvc-xxx             5Gi        RWO
# data-mysql-1     Bound    pvc-yyy             5Gi        RWO
# data-mysql-2     Bound    pvc-zzz             5Gi        RWO

#═══════════════════════════════════════════════
# TEST DATA PERSISTENCE & STABLE IDENTITY
#═══════════════════════════════════════════════

kubectl exec -it mysql-0 -- mysql -uroot -psupersecretpassword123 \
  -e "CREATE DATABASE testdb;"

kubectl delete pod mysql-0          # delete the pod (NOT the StatefulSet)
kubectl get pods -l app=mysql -w
# mysql-0 is recreated with the SAME name and reattaches to the SAME PVC

kubectl exec -it mysql-0 -- mysql -uroot -psupersecretpassword123 \
  -e "SHOW DATABASES;"
# testdb is still there!

#═══════════════════════════════════════════════
# SCALING
#═══════════════════════════════════════════════

kubectl scale statefulset mysql --replicas=5
kubectl get pods -l app=mysql -w
# mysql-3 created AFTER mysql-2 is confirmed ready, then mysql-4

kubectl scale statefulset mysql --replicas=2
kubectl get pods -l app=mysql -w
# mysql-4 terminates FIRST, then mysql-3, then mysql-2 (reverse order)
# mysql-0 and mysql-1 remain

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete statefulset mysql
kubectl delete pvc -l app=mysql      # PVCs are NOT auto-deleted — must remove explicitly!
kubectl delete svc mysql
kubectl delete secret mysql-secret
```

### 15.6 Common Errors & Troubleshooting

**Error 1: StatefulSet pods stuck waiting for previous pod**
```bash
kubectl get pods -l app=mysql
# mysql-0   0/1   CrashLoopBackOff
# mysql-1   0/1   Pending     ← waiting forever for mysql-0

# Cause: OrderedReady policy means pod N+1 won't start until pod N is Ready
kubectl logs mysql-0
kubectl describe pod mysql-0
# Fix the root cause in mysql-0 first; mysql-1 will then proceed automatically

# Workaround for testing: podManagementPolicy: Parallel (NOT recommended for
# real clustered databases where order matters)
```

**Error 2: PVC not deleted, old data resurfaces unexpectedly**
```bash
# After deleting a StatefulSet and recreating it with the SAME name,
# old PVCs (e.g., data-mysql-0) auto-rebind, bringing back OLD data
kubectl get pvc
# This is BY DESIGN (data safety) but surprises people in testing

# Fix: explicitly delete PVCs if you want a truly fresh start
kubectl delete pvc -l app=mysql
```

**Error 3: Headless Service misconfiguration**
```bash
# Error: pods can't resolve each other via stable DNS names
kubectl get svc mysql -o yaml | grep clusterIP
# If clusterIP is an actual IP (not "None"), it's NOT headless

# Fix: ensure clusterIP: None is set, and serviceName in StatefulSet
# spec matches the Service name exactly
```

### 15.7 Best Practices

- **Use StatefulSets only for genuinely stateful workloads** with ordering/identity requirements (databases, message queues like Kafka, distributed caches like Redis Cluster, Elasticsearch, Zookeeper)
- **For most databases, prefer managed services** (RDS, Cloud SQL) over self-hosting StatefulSets unless you have strong operational reasons
- **Always pair with a headless Service** — StatefulSets need this for stable per-pod DNS
- **Set appropriate `terminationGracePeriodSeconds`** — databases need clean shutdown time
- **Use `volumeClaimTemplates`** so each replica automatically gets its own PVC — never share one PVC across StatefulSet replicas (data corruption risk)
- **Consider using an Operator** (e.g., the MySQL Operator, Postgres Operator) instead of hand-rolling StatefulSets for complex databases — they handle failover, backups, and upgrades correctly (see Chapter 26)
- **Remember PVCs are NOT auto-deleted** when scaling down or deleting the StatefulSet — this is intentional but must be managed explicitly

### 15.8 Key Takeaways / Summary

- StatefulSets provide stable network identity, ordered deployment/scaling, and dedicated persistent storage per pod
- Pod names are predictable (`name-0`, `name-1`...) and persist across rescheduling
- A headless Service (`clusterIP: None`) is required for stable per-pod DNS resolution
- `volumeClaimTemplates` automatically create one dedicated PVC per replica
- Scaling up/down happens in strict order (0→N up, N→0 down) — critical for primary/replica database topologies
- For production databases, strongly consider managed cloud services or purpose-built Operators over raw StatefulSets

### 15.9 Practice Questions / Tasks

1. Deploy a 3-replica StatefulSet using `nginx` with a headless service. Verify each pod has a stable DNS name (`pod-0.svc-name`, etc.) using `nslookup` from a test pod.
2. Scale your StatefulSet from 3 to 1 replica and observe the order pods are terminated. Then scale back to 3 and observe creation order.
3. Explain why you would NEVER want `podManagementPolicy: Parallel` for a primary-replica MySQL cluster, but it might be acceptable for a stateless-but-ordered batch processing StatefulSet.

## 16. Ingress & Ingress Controllers (NGINX Example)

### 16.1 Learning Objectives

- Understand why Ingress is needed beyond basic Services
- Configure host-based and path-based routing
- Install and use the NGINX Ingress Controller
- Set up TLS termination for HTTPS

### 16.2 Concept Explanation

Imagine you have 10 microservices, each needing external HTTP access. Creating 10 `LoadBalancer` Services means 10 cloud load balancers — expensive and hard to manage. **Ingress** solves this by providing a single entry point that routes traffic to multiple Services based on hostname or URL path.

> **Analogy:** If Services are individual phone extensions, Ingress is the receptionist who answers the single main line and routes your call ("Press 1 for sales, Press 2 for support") to the right extension based on what you ask for.

### Ingress vs Ingress Controller

- **Ingress** = the YAML resource describing routing **rules** ("route api.example.com to api-service")
- **Ingress Controller** = the actual software (a Pod, usually based on NGINX, Traefik, HAProxy, or cloud-native controllers) that **reads** Ingress rules and implements them by configuring a reverse proxy

> **Critical:** An Ingress resource does NOTHING without an Ingress Controller running in your cluster. Many beginners create Ingress YAML and wonder why nothing works — no controller installed!

### 16.3 Architecture / How it Works

```
                         Internet
                            │
                            ▼
              ┌─────────────────────────┐
              │   LoadBalancer / NodePort │  ← single external entry point
              │  (fronts the Ingress      │
              │   Controller's Service)   │
              └──────────────┬────────────┘
                                          │
                              ▼
              ┌─────────────────────────┐
              │  NGINX Ingress Controller │  ← reads Ingress objects,
              │  (runs as Pods in cluster)│     configures NGINX reverse proxy
              └──────────────┬───────────┘
                              │ reads
                              ▼
              ┌─────────────────────────────┐
              │   Ingress Resource          │
              │   rules:                    │
              │    api.example.com → svc-api│
              │    app.example.com → svc-app│
              │    /admin → svc-admin       │
              └──────────────┬──────────────┘
                              │ routes based on Host header / path
              ┌───────────────┼───────────────┐
              ▼                ▼                ▼
       ┌─────────────┐ ┌─────────────┐ ┌────────────────┐
       │ Service: api │ │ Service: app │ │ Service:     │
       │ (ClusterIP)  │ │ (ClusterIP)  │ │  admin       │
       └──────┬──────┘ └──────┬──────┘ └──────┬─────────┘
              ▼                ▼                ▼
          [Pods]            [Pods]            [Pods]
```

### 16.4 YAML Manifest / Config Example

### Install NGINX Ingress Controller (minikube)

```bash
# This is the standard way for minikube — see Hands-on section below
minikube addons enable ingress
```

### Path-Based Routing

```yaml
# ingress-path-based.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-based-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2     # rewrite rule for stripping prefix
spec:
  ingressClassName: nginx                # specifies WHICH ingress controller handles this
  rules:
    - host: myapp.local
      http:
        paths:
          - path: /api(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: api-service
                port:
                  number: 80
          - path: /web(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

### Host-Based Routing (Multiple Subdomains)

```yaml
# ingress-host-based.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: host-based-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: api.myapp.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
    - host: app.myapp.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

### Ingress with TLS (HTTPS Termination)

```yaml
# ingress-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"  # if using cert-manager
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - secure.myapp.local
      secretName: myapp-tls-secret       # must contain tls.crt and tls.key
  rules:
    - host: secure.myapp.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

### Simple Default Backend Ingress

```yaml
# ingress-simple.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: simple-ingress
spec:
  ingressClassName: nginx
  defaultBackend:                       # catches requests not matching any rule
    service:
      name: fallback-service
      port:
        number: 80
  rules:
    - host: myapp.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

### 16.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# INSTALL NGINX INGRESS CONTROLLER (minikube)
#═══════════════════════════════════════════════

minikube addons enable ingress

# Verify controller is running
kubectl get pods -n ingress-nginx
# NAME                                       READY   STATUS    AGE
# ingress-nginx-controller-7d9f8c6b5d-x2k9p  1/1     Running   30s

# For kind clusters, use the official manifest:
# kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

#═══════════════════════════════════════════════
# CREATE BACKEND SERVICES TO ROUTE TO
#═══════════════════════════════════════════════

kubectl create deployment api-service --image=hashicorp/http-echo -- -text="API Service"
kubectl expose deployment api-service --port=80 --target-port=5678

kubectl create deployment web-service --image=hashicorp/http-echo -- -text="Web Service"
kubectl expose deployment web-service --port=80 --target-port=5678

#═══════════════════════════════════════════════
# CREATE INGRESS
#═══════════════════════════════════════════════

kubectl apply -f ingress-host-based.yaml

kubectl get ingress
# NAME                 CLASS   HOSTS                              ADDRESS        PORTS   AGE
# host-based-ingress   nginx   api.myapp.local,app.myapp.local    192.168.49.2   80      10s

kubectl describe ingress host-based-ingress
# Shows: Rules, Backend services, Events

#═══════════════════════════════════════════════
# ACCESS VIA HOSTNAME (local testing)
#═══════════════════════════════════════════════

# Get minikube IP and add to /etc/hosts
minikube ip
# 192.168.49.2

echo "192.168.49.2 api.myapp.local app.myapp.local" | sudo tee -a /etc/hosts

curl http://api.myapp.local
# API Service

curl http://app.myapp.local
# Web Service

#═══════════════════════════════════════════════
# PATH-BASED ROUTING TEST
#═══════════════════════════════════════════════

kubectl apply -f ingress-path-based.yaml
echo "192.168.49.2 myapp.local" | sudo tee -a /etc/hosts

curl http://myapp.local/api/
curl http://myapp.local/web/

#═══════════════════════════════════════════════
# TLS SETUP (self-signed cert for local testing)
#═══════════════════════════════════════════════

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=secure.myapp.local/O=secure.myapp.local"

kubectl create secret tls myapp-tls-secret --cert=tls.crt --key=tls.key

kubectl apply -f ingress-tls.yaml
echo "192.168.49.2 secure.myapp.local" | sudo tee -a /etc/hosts

curl -k https://secure.myapp.local
# -k skips cert validation since it's self-signed

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete ingress host-based-ingress path-based-ingress tls-ingress
kubectl delete deployment api-service web-service
kubectl delete service api-service web-service
kubectl delete secret myapp-tls-secret
sudo sed -i '/myapp.local/d' /etc/hosts
```

### 16.6 Common Errors & Troubleshooting

**Error 1: Ingress has no ADDRESS**
```bash
kubectl get ingress
# NAME      CLASS   HOSTS   ADDRESS   PORTS   AGE
# my-ing    nginx   ...     <none>    80      2m

# Cause: Ingress controller not running, or ingressClassName mismatch
kubectl get pods -n ingress-nginx
kubectl get ingressclass
# Ensure "nginx" ingressClass exists and matches spec.ingressClassName
```

**Error 2: 404 from Ingress Controller (default backend)**
```bash
curl http://myapp.local
# default backend - 404

# Cause 1: Host header mismatch — verify /etc/hosts or DNS
curl -H "Host: myapp.local" http://192.168.49.2/

# Cause 2: pathType mismatch (Prefix vs Exact vs ImplementationSpecific)
kubectl describe ingress my-ing
# Verify backend Service name/port are correct and Service has endpoints
kubectl get endpoints <service-name>
```

**Error 3: 502 Bad Gateway**
```bash
# Cause: backend Service has no healthy pods, or wrong targetPort
kubectl get endpoints <service-name>
# If empty, the Service selector doesn't match any running pod

kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
# Look for "connect() failed" errors pointing to the backend
```

### 16.7 Best Practices

- **Use one Ingress Controller per cluster** (or carefully scope multiple with distinct `ingressClassName`)
- **Always set `ingressClassName`** explicitly — relying on a "default" class is fragile
- **Use cert-manager** for automated TLS certificate provisioning/renewal in production (Let's Encrypt)
- **Set resource limits on the Ingress Controller** — it's a critical path for all external traffic
- **Enable rate limiting and request size limits** via annotations to protect backend services
- **Use path-based routing for related microservices**, host-based for clearly separate applications
- **Monitor Ingress Controller metrics** (NGINX exposes Prometheus metrics) — it's often the first place to spot traffic anomalies

### 16.8 Key Takeaways / Summary

- Ingress provides HTTP(S) routing to multiple Services through a single entry point, saving cost vs many LoadBalancers
- An Ingress Controller (e.g., NGINX) must be installed — Ingress YAML alone does nothing
- Supports host-based routing (subdomains) and path-based routing (URL prefixes)
- TLS termination happens at the Ingress layer, simplifying certificate management
- `kubectl describe ingress` and checking Service endpoints are your primary debugging tools

### 16.9 Practice Questions / Tasks

1. Deploy 2 separate web apps and create an Ingress that routes `app1.local` to one and `app2.local` to the other. Test using `/etc/hosts` and curl.
2. Create a path-based Ingress routing `/v1` and `/v2` to two different versions of a service (simulate API versioning).
3. What is the difference between `pathType: Prefix` and `pathType: Exact`? Give an example URL where they'd behave differently.

---

## 17. Helm – Package Manager for Kubernetes

### 17.1 Learning Objectives

- Understand why Helm exists and the problems it solves
- Master Helm Charts structure: templates, values, releases
- Install, upgrade, rollback, and uninstall releases
- Create a custom Helm Chart from scratch

### 17.2 Concept Explanation

Deploying a real application often means dozens of YAML files (Deployments, Services, ConfigMaps, Secrets, Ingress...) with values that change between environments (dev/staging/prod). Copy-pasting and manually editing YAML doesn't scale.

**Helm** is the package manager for Kubernetes — like `apt`/`yum` for Linux or `npm` for Node.js, but for K8s applications.

> **Analogy:** Without Helm, deploying an app is like assembling IKEA furniture from loose parts every single time, hoping you don't forget a screw. Helm Charts are the pre-packaged kit with an instruction manual (templates) and a parts customization sheet (values.yaml) — you specify what you want (size, color) and Helm assembles the whole thing consistently every time.

### Key Helm Concepts

| Term | Meaning |
|------|---------|
| **Chart** | A package of pre-configured Kubernetes resources (like a Helm "app blueprint") |
| **Release** | A specific instance of a Chart deployed to a cluster (you can have multiple releases of the same chart) |
| **Values** | Configuration parameters that customize a Chart for your needs (`values.yaml`) |
| **Repository** | A collection of Charts available for installation (like a package repo) |
| **Template** | YAML files with Go templating syntax that get rendered using values |

### 17.3 Architecture / How it Works

```
┌──────────────────────────────────────────────────────────────────┐
│ Helm Chart: my-app/                                              │
│  ├── Chart.yaml          (metadata: name, version, description)  │
│  ├── values.yaml          (default configuration values)         │
│  ├── templates/                                                  │
│  │   ├── deployment.yaml  (templated, uses {{ .Values.X }})      │
│  │   ├── service.yaml                                            │
│  │   ├── ingress.yaml                                            │
│  │   ├── configmap.yaml                                          │
│  │   └── _helpers.tpl     (reusable template snippets)           │
│  └── charts/               (sub-charts / dependencies)           │
└──────────────────────────────────────────────────────────────────┘
                                                                   │
              helm install my-release ./my-app -f custom-values.yaml
                          │
                          ▼
          ┌────────────────────────────────────┐
          │  Helm Template Engine              │
          │  merges values.yaml + custom       │
          │  values + templates → renders      │
          │  final Kubernetes YAML             │
          └────────────────┬───────────────────┘
                                               │
                          ▼
          ┌─────────────────────────────────────┐
          │  kubectl apply (done by Helm)       │
          │  creates: Deployment, Service,      │
          │  ConfigMap, Ingress, etc.           │
          └────────────────┬────────────────────┘
                                                │
                          ▼
          ┌──────────────────────────────────────┐
          │  Release: my-release  (Revision 1)   │
          │  tracked by Helm for upgrade/        │
          │  rollback history                    │
          └──────────────────────────────────────┘
```

### 17.4 YAML Manifest / Config Example

### Chart.yaml

```yaml
# my-app/Chart.yaml
apiVersion: v2
name: my-app
description: A Helm chart for my application
type: application
version: 1.0.0           # chart version
appVersion: "1.2.3"       # version of the app being deployed
```

### values.yaml (Default Configuration)

```yaml
# my-app/values.yaml
replicaCount: 3

image:
  repository: nginx
  tag: "1.25"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  className: nginx
  host: myapp.local

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: false
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

### templates/deployment.yaml (Templated)

```yaml
# my-app/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}
  labels:
    app: {{ .Chart.Name }}
    release: {{ .Release.Name }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      app: {{ .Chart.Name }}
      release: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Chart.Name }}
        release: {{ .Release.Name }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: 80
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

### templates/service.yaml

```yaml
# my-app/templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ .Chart.Name }}
    release: {{ .Release.Name }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: 80
```

### Custom values for production (override file)

```yaml
# values-production.yaml
replicaCount: 5

image:
  tag: "1.25.3"

ingress:
  enabled: true
  host: myapp.production.com

resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 5
  maxReplicas: 20
```

### 17.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# INSTALL HELM
#═══════════════════════════════════════════════

# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

helm version
# version.BuildInfo{Version:"v3.14.0", ...}

#═══════════════════════════════════════════════
# USING EXISTING CHARTS FROM A REPOSITORY
#═══════════════════════════════════════════════

# Add a popular chart repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search available charts
helm search repo bitnami/nginx

# Install a chart (e.g., a ready-made WordPress)
helm install my-wordpress bitnami/wordpress \
  --set wordpressUsername=admin \
  --set wordpressPassword=securepass123

# List installed releases
helm list
# NAME            NAMESPACE   REVISION   STATUS      CHART              APP VERSION
# my-wordpress    default     1          deployed    wordpress-18.1.0   6.4.2

#═══════════════════════════════════════════════
# CREATE YOUR OWN CHART
#═══════════════════════════════════════════════

helm create my-app
# Creates: my-app/Chart.yaml, values.yaml, templates/, charts/, .helmignore

# Replace the generated templates/deployment.yaml and values.yaml
# with the examples shown above, then:

#═══════════════════════════════════════════════
# VALIDATE BEFORE INSTALLING
#═══════════════════════════════════════════════

# Lint the chart for errors
helm lint ./my-app

# Render templates locally WITHOUT installing (dry run, see final YAML)
helm template my-release ./my-app

# Dry-run against the actual cluster (validates against API server)
helm install my-release ./my-app --dry-run --debug

#═══════════════════════════════════════════════
# INSTALL THE CHART
#═══════════════════════════════════════════════

helm install my-release ./my-app
# NAME: my-release
# STATUS: deployed
# REVISION: 1

kubectl get deployments
# NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
# my-release-my-app       3/3     3            3           10s

#═══════════════════════════════════════════════
# INSTALL WITH CUSTOM VALUES
#═══════════════════════════════════════════════

# Override individual values via --set
helm install my-release ./my-app --set replicaCount=5

# Override using a values file (recommended for many overrides)
helm install my-prod-release ./my-app -f values-production.yaml

#═══════════════════════════════════════════════
# UPGRADE A RELEASE
#═══════════════════════════════════════════════

# Edit values.yaml or use --set, then:
helm upgrade my-release ./my-app --set image.tag=1.26

# Upgrade with a new values file
helm upgrade my-release ./my-app -f values-production.yaml

# Install OR upgrade in one command (idempotent — great for CI/CD)
helm upgrade --install my-release ./my-app -f values-production.yaml

#═══════════════════════════════════════════════
# VIEW RELEASE HISTORY & ROLLBACK
#═══════════════════════════════════════════════

helm history my-release
# REVISION   UPDATED                   STATUS      CHART          APP VERSION  DESCRIPTION
# 1          Mon Jun 1 10:00:00 2026   superseded  my-app-1.0.0   1.2.3        Install complete
# 2          Mon Jun 1 10:15:00 2026   deployed    my-app-1.0.0   1.2.3        Upgrade complete

helm rollback my-release 1
# Rollback was a success!

#═══════════════════════════════════════════════
# INSPECT A RELEASE
#═══════════════════════════════════════════════

helm get values my-release           # what values are currently applied
helm get manifest my-release         # full rendered YAML currently deployed
helm status my-release               # current status

#═══════════════════════════════════════════════
# UNINSTALL
#═══════════════════════════════════════════════

helm uninstall my-release
helm uninstall my-wordpress

helm list -a    # verify no releases remain
```

### 17.6 Common Errors & Troubleshooting

**Error 1: `Error: INSTALLATION FAILED: cannot re-use a name that is still in use`**
```bash
# Cause: a release with this name already exists
helm list
helm uninstall my-release    # remove the old one first
# OR use --replace (not always recommended) or pick a new release name
```

**Error 2: Template rendering errors**
```bash
# Error: template: my-app/templates/deployment.yaml:12:18:
# executing "deployment.yaml" at <.Values.resources>: nil pointer evaluating interface {}.requests

# Cause: referencing a values.yaml key that doesn't exist or is misspelled
helm template my-release ./my-app --debug
# Always test rendering BEFORE installing

# Fix: check values.yaml has the exact key path being referenced
```

**Error 3: Upgrade stuck — "another operation is in progress"**
```bash
# Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress

# Cause: previous Helm operation didn't complete cleanly (often after a crash)
helm history my-release
# Look for a release stuck in "pending-upgrade" or "pending-install"

# Fix: rollback to the last known good state, or
helm rollback my-release <last-good-revision>
```

### 17.7 Best Practices

- **Pin chart versions** in production (`helm install my-app bitnami/nginx --version 15.4.0`) — don't always pull "latest"
- **Use separate values files per environment** (`values-dev.yaml`, `values-prod.yaml`) instead of long `--set` chains
- **Always `helm lint` and `helm template`** before `helm install`/`upgrade` in CI/CD pipelines
- **Use `helm upgrade --install`** in automation — it's idempotent (works whether or not the release exists)
- **Store chart values in version control**, not just in `--set` flags on the command line (auditability)
- **Use `--atomic` flag** (`helm upgrade --install --atomic`) to automatically rollback on failed upgrades
- **Avoid overly complex chart logic** — if your templates need extensive `if/else`, consider splitting into multiple charts

### 17.8 Key Takeaways / Summary

- Helm packages multiple Kubernetes manifests into reusable, configurable Charts
- `values.yaml` provides defaults; override with `--set` or custom values files for different environments
- `helm install`, `helm upgrade`, `helm rollback`, `helm uninstall` are the core lifecycle commands
- `helm template` and `helm lint` let you validate charts before touching the live cluster
- Helm tracks release history, enabling safe one-command rollbacks

### 17.9 Practice Questions / Tasks

1. Create a Helm chart for a simple web app with configurable replica count, image tag, and resource limits. Install it, then upgrade the image tag, then rollback.
2. Install the official `bitnami/redis` chart with custom values for password and persistence size. Verify it's running with `kubectl get pods`.
3. What's the difference between `helm install`, `helm upgrade`, and `helm upgrade --install`? When would you use each in a CI/CD pipeline?

---

## 18. RBAC – Roles, RoleBindings, ServiceAccounts, Security Context

### 18.1 Learning Objectives

- Understand Kubernetes authentication vs authorization
- Master Role/ClusterRole and RoleBinding/ClusterRoleBinding
- Configure ServiceAccounts for pod-level permissions
- Apply SecurityContext for container-level hardening

### 18.2 Concept Explanation

### Authentication vs Authorization

- **Authentication ("who are you?")**: Verifying identity via certificates, tokens, OIDC
- **Authorization ("what can you do?")**: RBAC determines what an authenticated identity can access

> **Analogy:** Authentication is showing your ID badge at the building entrance. RBAC (authorization) is which floors and rooms your badge actually unlocks — the security guard checks your badge type against a list of permitted areas.

### RBAC Core Objects

| Object | Scope | Purpose |
|--------|-------|---------|
| **Role** | Namespace | Defines permissions (verbs on resources) WITHIN a namespace |
| **ClusterRole** | Cluster-wide | Defines permissions across the ENTIRE cluster (or for cluster-scoped resources like Nodes) |
| **RoleBinding** | Namespace | Grants a Role (or ClusterRole) to a user/group/ServiceAccount within a namespace |
| **ClusterRoleBinding** | Cluster-wide | Grants a ClusterRole to a user/group/ServiceAccount across the whole cluster |
| **ServiceAccount** | Namespace | An identity that Pods use to authenticate to the API server (NOT for humans) |

```
Role/ClusterRole = "what actions are allowed" (the permission list)
RoleBinding/ClusterRoleBinding = "who gets these permissions" (the assignment)
```

### Verbs and Resources

```
Verbs:     get, list, watch, create, update, patch, delete, deletecollection
Resources: pods, deployments, services, secrets, configmaps, nodes, etc.
```

### 18.3 Architecture / How it Works

```
┌────────────────────────────────────────────────────────────────┐
│  ServiceAccount: ci-deployer (in namespace: ci)                │
└───────────────────────┬────────────────────────────────────────┘
                         │ bound via
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  RoleBinding: ci-deployer-binding (namespace: ci)                │
│   subjects: [ServiceAccount: ci-deployer]                        │
│   roleRef: Role: deployment-manager                              │
└───────────────────────┬──────────────────────────────────────────┘
                         │ grants permissions defined in
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│  Role: deployment-manager (namespace: ci)                          │
│   rules:                                                           │
│     - apiGroups: ["apps"]                                          │
│       resources: ["deployments"]                                   │
│       verbs: ["get", "list", "create", "update", "patch"]          │
└────────────────────────────────────────────────────────────────────┘

RESULT: Any Pod using ServiceAccount "ci-deployer" can create/update
        Deployments ONLY in the "ci" namespace, nothing else.

REQUEST FLOW:
Pod (using SA token) → kube-apiserver
   │
   ├── 1. Authentication: validates SA token → identity confirmed
   ├── 2. Authorization (RBAC): checks RoleBindings for this identity
   │      → does any binding grant the requested verb+resource?
   ├── 3. Admission Control: additional policy checks
   └── 4. Allow or Deny (403 Forbidden)
```

### 18.4 YAML Manifest / Config Example

### ServiceAccount

```yaml
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ci-deployer
  namespace: ci
```

### Role (Namespace-Scoped Permissions)

```yaml
# role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployment-manager
  namespace: ci
rules:
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
  - apiGroups: [""]                       # "" = core API group (pods, services, etc.)
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["services"]
    verbs: ["get", "list"]
```

### RoleBinding (Assigns Role to ServiceAccount)

```yaml
# rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ci-deployer-binding
  namespace: ci
subjects:
  - kind: ServiceAccount
    name: ci-deployer
    namespace: ci
roleRef:
  kind: Role
  name: deployment-manager
  apiGroup: rbac.authorization.k8s.io
```

### ClusterRole (Cluster-Wide Permissions, e.g., Read-Only Across All Namespaces)

```yaml
# clusterrole.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: read-only-viewer
rules:
  - apiGroups: [""]
    resources: ["pods", "services", "configmaps"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets", "statefulsets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["nodes"]                  # cluster-scoped resource
    verbs: ["get", "list"]
```

### ClusterRoleBinding

```yaml
# clusterrolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: read-only-viewer-binding
subjects:
  - kind: User
    name: jane.doe@company.com           # human user via OIDC/cert
    apiGroup: rbac.authorization.k8s.io
  - kind: ServiceAccount
    name: monitoring-sa
    namespace: monitoring
roleRef:
  kind: ClusterRole
  name: read-only-viewer
  apiGroup: rbac.authorization.k8s.io
```

### Pod Using a ServiceAccount

```yaml
# pod-with-sa.yaml
apiVersion: v1
kind: Pod
metadata:
  name: deployer-pod
  namespace: ci
spec:
  serviceAccountName: ci-deployer        # pod authenticates as this SA
  automountServiceAccountToken: true     # default; set false to disable token mounting
  containers:
    - name: kubectl-runner
      image: bitnami/kubectl:1.29
      command: ["sleep", "3600"]
```

### SecurityContext (Pod & Container Hardening)

```yaml
# secure-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:                       # POD-level security context
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000                         # volume ownership group
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: nginx:1.25
      securityContext:                    # CONTAINER-level (overrides pod-level)
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        runAsNonRoot: true
        runAsUser: 1000
        capabilities:
          drop:
            - ALL                          # drop all Linux capabilities
          add:
            - NET_BIND_SERVICE              # add back only what's needed
      volumeMounts:
        - name: tmp
          mountPath: /tmp                  # writable tmp since rootfs is read-only
        - name: var-cache
          mountPath: /var/cache/nginx
        - name: var-run
          mountPath: /var/run
  volumes:
    - name: tmp
      emptyDir: {}
    - name: var-cache
      emptyDir: {}
    - name: var-run
      emptyDir: {}
```

### 18.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CREATE NAMESPACE, SERVICEACCOUNT, RBAC
#═══════════════════════════════════════════════

kubectl create namespace ci
kubectl apply -f serviceaccount.yaml
kubectl apply -f role.yaml
kubectl apply -f rolebinding.yaml

kubectl get serviceaccounts -n ci
kubectl get roles -n ci
kubectl get rolebindings -n ci

#═══════════════════════════════════════════════
# TEST PERMISSIONS USING kubectl auth can-i
#═══════════════════════════════════════════════

# Check if the ServiceAccount CAN do something
kubectl auth can-i create deployments \
  --as=system:serviceaccount:ci:ci-deployer -n ci
# yes

kubectl auth can-i delete secrets \
  --as=system:serviceaccount:ci:ci-deployer -n ci
# no

kubectl auth can-i list pods \
  --as=system:serviceaccount:ci:ci-deployer -n default
# no   ← Role is namespace-scoped to "ci" only, not "default"

# List ALL permissions for a ServiceAccount
kubectl auth can-i --list \
  --as=system:serviceaccount:ci:ci-deployer -n ci

#═══════════════════════════════════════════════
# TEST AS A REAL POD
#═══════════════════════════════════════════════

kubectl apply -f pod-with-sa.yaml
kubectl exec -it deployer-pod -n ci -- /bin/bash

# Inside the pod:
kubectl get deployments -n ci      # works — Role allows this
kubectl get secrets -n ci          # Forbidden! Role doesn't grant secrets access
kubectl get pods -n default        # Forbidden! Out of scope namespace

exit

#═══════════════════════════════════════════════
# CLUSTERROLE / CLUSTERROLEBINDING
#═══════════════════════════════════════════════

kubectl apply -f clusterrole.yaml
kubectl apply -f clusterrolebinding.yaml

kubectl auth can-i list pods \
  --as=system:serviceaccount:monitoring:monitoring-sa -A
# yes  ← cluster-wide due to ClusterRoleBinding

#═══════════════════════════════════════════════
# SECURITYCONTEXT DEMO
#═══════════════════════════════════════════════

kubectl apply -f secure-pod.yaml
kubectl exec secure-pod -- id
# uid=1000 gid=3000 groups=3000,2000   ← confirms non-root execution

kubectl exec secure-pod -- touch /etc/test.txt
# touch: /etc/test.txt: Read-only file system   ← confirms readOnlyRootFilesystem works

kubectl exec secure-pod -- touch /tmp/test.txt
# succeeds — /tmp is a writable emptyDir volume

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete -f pod-with-sa.yaml
kubectl delete -f secure-pod.yaml
kubectl delete namespace ci
kubectl delete clusterrole read-only-viewer
kubectl delete clusterrolebinding read-only-viewer-binding
```

### 18.6 Common Errors & Troubleshooting

**Error 1: `Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:ci:ci-deployer" cannot list resource "pods"`**
```bash
# Diagnose with auth can-i
kubectl auth can-i list pods --as=system:serviceaccount:ci:ci-deployer -n ci

# Fix: add the missing rule to the Role
kubectl edit role deployment-manager -n ci
# Add: resources: ["pods"], verbs: ["list"]
```

**Error 2: RoleBinding references wrong namespace for ServiceAccount**
```bash
# A RoleBinding's "subjects" must specify the SA's namespace explicitly,
# even if the RoleBinding itself is in a different namespace context
# Common mistake: omitting "namespace:" under subjects, defaulting incorrectly

kubectl describe rolebinding ci-deployer-binding -n ci
# Verify Subjects section shows correct SA name AND namespace
```

**Error 3: SecurityContext prevents pod from starting**
```bash
kubectl describe pod secure-pod
# Error: container has runAsNonRoot and image will run as root

# Cause: the container image's default user IS root (e.g., UID 0),
# and runAsNonRoot: true blocks this combination
# Fix: either set runAsUser explicitly to a non-root UID that the
# app supports, OR use an image designed to run as non-root
```

### 18.7 Best Practices

- **Follow the principle of least privilege** — grant only the exact verbs/resources needed, nothing more
- **Use Roles + RoleBindings for namespace-scoped access**; reserve ClusterRoles for genuinely cluster-wide needs
- **Never bind `cluster-admin`** to a ServiceAccount unless absolutely necessary (and audited)
- **Create one ServiceAccount per application/purpose** — don't reuse the `default` ServiceAccount for everything
- **Disable token auto-mounting** (`automountServiceAccountToken: false`) for pods that don't need API access
- **Always set `runAsNonRoot: true`** and drop all capabilities by default, adding back only what's required
- **Use `readOnlyRootFilesystem: true`** wherever possible — significantly reduces attack surface
- **Audit RBAC regularly** — use tools like `kubectl-who-can` or `rbac-lookup` to find overly broad permissions

### 18.8 Key Takeaways / Summary

- RBAC separates **what's allowed** (Role/ClusterRole) from **who's allowed** (RoleBinding/ClusterRoleBinding)
- ServiceAccounts are the identity Pods use to talk to the API server — never use human credentials for app workloads
- `kubectl auth can-i` is your go-to tool for testing and debugging permissions
- SecurityContext hardens containers: non-root execution, read-only filesystems, dropped Linux capabilities
- Least privilege is the guiding principle for both RBAC and SecurityContext configuration

### 18.9 Practice Questions / Tasks

1. Create a ServiceAccount that can only `get` and `list` ConfigMaps in a specific namespace — nothing else. Verify with `kubectl auth can-i`.
2. Configure a Pod with a SecurityContext that runs as a non-root user, drops all capabilities, and uses a read-only root filesystem. Verify the container still starts successfully.
3. Explain the security risk of binding `cluster-admin` ClusterRole to a CI/CD pipeline's ServiceAccount. What would you do instead?

---

## 19. Resource Management – Requests/Limits, HPA, Cluster Autoscaler

### 19.1 Learning Objectives

- Master CPU/memory requests and limits and their scheduling impact
- Configure Horizontal Pod Autoscaler (HPA) for automatic scaling
- Understand Cluster Autoscaler basics for node-level scaling
- Understand Quality of Service (QoS) classes

### 19.2 Concept Explanation

### Requests vs Limits

- **Requests**: The amount of CPU/memory a container is **guaranteed**. Used by the scheduler to decide which node has room.
- **Limits**: The **maximum** amount a container can use. Exceeding memory limits → container is OOMKilled. Exceeding CPU limits → container is throttled (NOT killed).

> **Analogy:** A request is like reserving a hotel room ("guarantee me at least this much space"). A limit is the room's maximum capacity ("no more than 4 people allowed in, fire code"). The hotel (scheduler) only books you into a building that has room for your reservation.

### Quality of Service (QoS) Classes

Kubernetes automatically assigns a QoS class based on your requests/limits, which determines eviction priority under resource pressure:

| QoS Class | Condition | Eviction Priority |
|-----------|-----------|-------------------|
| **Guaranteed** | requests == limits for ALL containers (both CPU & memory) | Evicted LAST (most protected) |
| **Burstable** | At least one container has requests < limits | Evicted in the middle |
| **BestEffort** | No requests or limits set at all | Evicted FIRST (least protected) |

### Horizontal Pod Autoscaler (HPA)

Automatically scales the **number of Pod replicas** based on observed metrics (CPU, memory, or custom metrics).

### Cluster Autoscaler (CA)

Automatically scales the **number of Nodes** in the cluster — adds nodes when Pods can't be scheduled due to insufficient resources, removes nodes when underutilized. (Primarily a cloud feature — EKS/GKE/AKS.)

```
HPA scales PODS (horizontal)         CA scales NODES
   "I need more copies                  "I need more machines
    of my app running"                   to run those copies on"
```

### 19.3 Architecture / How it Works

```
┌────────────────────────────────────────────────────────────────┐
│                    metrics-server                              │
│   (collects CPU/memory usage from kubelets every 15s)          │
└──────────────────────────┬─────────────────────────────────────┘
                            │ exposes via Metrics API
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│  HorizontalPodAutoscaler: my-app-hpa                              │
│   target: Deployment/my-app                                       │
│   minReplicas: 2,  maxReplicas: 10                                │
│   metric: CPU utilization target 70%                              │
│                                                                   │
│   Every 15s: checks current CPU usage vs target                   │
│   if current_avg_cpu > 70% → scale UP                             │
│   if current_avg_cpu < 70% → scale DOWN (after stabilization)     │
└──────────────────────────┬────────────────────────────────────────┘
                            │ adjusts
                            ▼
┌────────────────────────────────────────────────────────────────┐
│  Deployment: my-app   replicas: 2 → 5 (scaled based on load)   │
└──────────────────────────┬─────────────────────────────────────┘
                            │ if nodes lack capacity for new pods
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  Cluster Autoscaler (cloud-only)                                 │
│   detects Pending pods due to insufficient node resources        │
│   → provisions a NEW NODE from the cloud provider                │
│   → also REMOVES underutilized nodes after a cooldown period     │
└──────────────────────────────────────────────────────────────────┘
```

### 19.4 YAML Manifest / Config Example

### Pod with Requests, Limits, and QoS Implications

```yaml
# resource-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: guaranteed-pod
spec:
  containers:
    - name: app
      image: nginx:1.25
      resources:
        requests:
          cpu: "500m"
          memory: "256Mi"
        limits:
          cpu: "500m"             # SAME as request → Guaranteed QoS
          memory: "256Mi"
---
apiVersion: v1
kind: Pod
metadata:
  name: burstable-pod
spec:
  containers:
    - name: app
      image: nginx:1.25
      resources:
        requests:
          cpu: "250m"
          memory: "128Mi"
        limits:
          cpu: "1"                 # HIGHER than request → Burstable QoS
          memory: "512Mi"
---
apiVersion: v1
kind: Pod
metadata:
  name: besteffort-pod
spec:
  containers:
    - name: app
      image: nginx:1.25
      # No resources specified at all → BestEffort QoS (risky!)
```

### Horizontal Pod Autoscaler (CPU-based)

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70          # scale when avg CPU > 70% of requests
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:                                # fine-tune scaling speed (K8s 1.18+)
    scaleUp:
      stabilizationWindowSeconds: 0         # scale up immediately
      policies:
        - type: Percent
          value: 100                          # can double pod count per period
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300        # wait 5 min before scaling down (avoid flapping)
      policies:
        - type: Pods
          value: 1                            # remove max 1 pod per period
          periodSeconds: 60
```

### Deployment Required for HPA to Work (must have resource requests)

```yaml
# deployment-for-hpa.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: k8s.gcr.io/hpa-example     # built-in CPU-load-generating test image
          resources:
            requests:
              cpu: "200m"                     # REQUIRED — HPA calculates % based on this
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          ports:
            - containerPort: 80
```

### 19.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# ENABLE METRICS SERVER (required for HPA)
#═══════════════════════════════════════════════

minikube addons enable metrics-server

# Verify it's running and reporting metrics
kubectl get pods -n kube-system | grep metrics-server
kubectl top nodes
# NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
# minikube   250m         12%    1500Mi          38%

kubectl top pods
# NAME              CPU(cores)   MEMORY(bytes)
# my-app-xxxxx      5m           20Mi

#═══════════════════════════════════════════════
# QOS CLASS DEMO
#═══════════════════════════════════════════════

kubectl apply -f resource-pod.yaml
kubectl get pod guaranteed-pod -o jsonpath='{.status.qosClass}'
# Guaranteed
kubectl get pod burstable-pod -o jsonpath='{.status.qosClass}'
# Burstable
kubectl get pod besteffort-pod -o jsonpath='{.status.qosClass}'
# BestEffort

#═══════════════════════════════════════════════
# CREATE DEPLOYMENT + HPA
#═══════════════════════════════════════════════

kubectl apply -f deployment-for-hpa.yaml
kubectl expose deployment my-app --port=80

kubectl apply -f hpa.yaml
# Or imperatively:
kubectl autoscale deployment my-app --cpu-percent=70 --min=2 --max=10

kubectl get hpa
# NAME         REFERENCE           TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
# my-app-hpa   Deployment/my-app   0%/70%, 5%/80%  2         10        2          10s

#═══════════════════════════════════════════════
# GENERATE LOAD TO TRIGGER SCALING
#═══════════════════════════════════════════════

# Run a load generator in a separate terminal
kubectl run load-generator --image=busybox:1.36 -it --rm -- /bin/sh -c \
  "while true; do wget -q -O- http://my-app; done"

# Watch HPA react (in another terminal)
kubectl get hpa my-app-hpa -w
# TARGETS column rises above 70%, REPLICAS count increases gradually

kubectl get pods -l app=my-app -w
# Watch new pods being created as load increases

#═══════════════════════════════════════════════
# OBSERVE SCALE DOWN (after stopping load)
#═══════════════════════════════════════════════

# Stop the load-generator (Ctrl+C)
kubectl get hpa my-app-hpa -w
# After stabilizationWindowSeconds (300s default), replicas decrease gradually

#═══════════════════════════════════════════════
# DESCRIBE HPA FOR DETAILED EVENTS
#═══════════════════════════════════════════════

kubectl describe hpa my-app-hpa
# Events show scaling decisions and reasons

#═══════════════════════════════════════════════
# CLUSTER AUTOSCALER (CLOUD-ONLY — CONCEPTUAL, AWS EXAMPLE)
#═══════════════════════════════════════════════

# Not runnable on minikube — shown for reference (EKS example):
# eksctl create nodegroup --cluster=my-cluster \
#   --nodes-min=2 --nodes-max=10 --asg-access

# Cluster Autoscaler deployment (simplified) watches for:
# - Pods stuck Pending due to "Insufficient cpu/memory"
# - Nodes with low utilization for an extended period (scale-down candidates)

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete hpa my-app-hpa
kubectl delete deployment my-app
kubectl delete service my-app
kubectl delete pod guaranteed-pod burstable-pod besteffort-pod
```

### 19.6 Common Errors & Troubleshooting

**Error 1: HPA shows `<unknown>` for TARGETS**
```bash
kubectl get hpa
# NAME         REFERENCE           TARGETS
# my-app-hpa   Deployment/my-app   <unknown>/70%

# Cause: metrics-server not installed or not yet reporting
kubectl get pods -n kube-system | grep metrics-server
kubectl top pods    # if this fails, metrics-server is the problem

# Fix:
minikube addons enable metrics-server
# Wait 1-2 minutes for metrics to populate
```

**Error 2: HPA can't scale — "missing request for cpu"**
```bash
kubectl describe hpa my-app-hpa
# Warning  FailedGetResourceMetric  failed to get cpu utilization:
# missing request for cpu

# Cause: Deployment's containers don't specify resources.requests.cpu
# Fix: HPA REQUIRES requests to be set — it calculates % based on requests, not limits
```

**Error 3: Pod OOMKilled despite "plenty of memory" on the node**
```bash
kubectl describe pod my-app-xxxxx
# Last State: Terminated, Reason: OOMKilled

# Cause: container hit its OWN memory LIMIT, regardless of node's total free memory
kubectl get pod my-app-xxxxx -o jsonpath='{.spec.containers[0].resources.limits.memory}'
# Fix: increase the memory limit, or investigate a memory leak in the app
```

### 19.7 Best Practices

- **Always set both requests and limits** — never leave them unset (BestEffort QoS is risky in production)
- **Use Guaranteed QoS for critical workloads** (databases, core services) to minimize eviction risk
- **Set HPA `minReplicas` ≥ 2** for high availability — never rely on a single replica with HPA
- **Tune `stabilizationWindowSeconds`** for scale-down to avoid "flapping" (rapid scale up/down cycles)
- **Right-size requests based on actual usage** — use `kubectl top pods` and monitoring data, don't guess
- **Remember CPU limits cause throttling, not crashes** — but memory limits cause OOMKill (crash) — set memory limits conservatively
- **Combine HPA with Cluster Autoscaler** in cloud environments so pod scaling isn't blocked by node capacity
- Consider **Vertical Pod Autoscaler (VPA)** for right-sizing requests/limits automatically (different from HPA — adjusts resource values, not replica count)

### 19.8 Key Takeaways / Summary

- Requests determine scheduling (guaranteed minimum); Limits determine the ceiling (CPU throttles, memory kills)
- QoS classes (Guaranteed > Burstable > BestEffort) determine eviction priority under resource pressure
- HPA scales **Pod replica count** based on metrics; Cluster Autoscaler scales **Node count** in the cloud
- metrics-server must be installed for HPA to function at all
- HPA requires `resources.requests` to be explicitly set on the target Deployment's containers

### 19.9 Practice Questions / Tasks

1. Deploy an app with CPU requests of 100m and create an HPA targeting 50% CPU utilization, min 1/max 5 replicas. Generate load and observe scaling in real time.
2. Create 3 pods with Guaranteed, Burstable, and BestEffort QoS respectively. Explain (without testing — conceptually) which would be evicted first under node memory pressure.
3. Why does HPA require `resources.requests` but not necessarily `resources.limits`? What happens if you only set limits but not requests?

---

## 20. Networking Deep Dive – CNI Plugins & Network Policies

### 20.1 Learning Objectives

- Understand the Kubernetes networking model and its 4 fundamental rules
- Know the role of CNI (Container Network Interface) plugins
- Master NetworkPolicy for traffic segmentation (zero-trust networking)
- Debug common networking issues

### 20.2 Concept Explanation

### The Kubernetes Networking Model

Kubernetes mandates these fundamental rules (regardless of which CNI plugin implements them):

1. Every Pod gets its own unique IP address (no NAT between pods)
2. Pods on a node can communicate with all pods on all nodes without NAT
3. Agents on a node (like kubelet) can communicate with all pods on that node
4. Pods in the host network namespace can communicate with all pods without NAT

> **Analogy:** Imagine every employee in a global company getting a unique direct phone extension that works the same way whether they're calling someone on the same floor or in a different country office — no need to dial special prefixes. That's the "flat network" Kubernetes guarantees.

### What is CNI?

**CNI (Container Network Interface)** is a specification (not an implementation) that defines how container runtimes set up networking for containers. Kubernetes doesn't implement networking itself — it delegates to CNI plugins.

Popular CNI plugins:

| Plugin | Highlights |
|--------|-----------|
| **Calico** | Most popular for production; supports NetworkPolicy, BGP routing, eBPF mode |
| **Cilium** | eBPF-based, very high performance, advanced observability (Hubble) |
| **Flannel** | Simple overlay network, easy setup, limited NetworkPolicy support |
| **Weave Net** | Easy setup, built-in encryption |
| **AWS VPC CNI** | Native AWS VPC integration for EKS |

### Network Policies

By default, **all Pods can talk to all other Pods** — completely open. **NetworkPolicy** lets you restrict this, implementing a zero-trust network model (deny by default, explicitly allow what's needed).

> ⚠️ **Important:** NetworkPolicy only works if your CNI plugin supports it (Calico, Cilium do; basic Flannel does NOT by default).

### 20.3 Architecture / How it Works

```
┌───────────────────────────────────────────────────────────────────┐
│                     WITHOUT NetworkPolicy                         │
│                                                                   │
│  [Frontend Pod] ←──────────────→ [Database Pod]                   │
│       ↑                                  ↑                        │
│       └──────────────────────────────────┘                        │
│              ANY pod can reach ANY pod (flat, open network)       │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      WITH NetworkPolicy                             │
│                                                                     │
│  [Frontend Pod] ────allowed────→ [Backend Pod]                      │
│                                          │                          │
│                                    allowed (only from backend)      │
│                                          ▼                          │
│                                   [Database Pod]                    │
│                                                                     │
│  [Random Pod] ──X── blocked ──X──→ [Database Pod]                   │
│  (NetworkPolicy denies traffic not explicitly allowed)              │
└─────────────────────────────────────────────────────────────────────┘

NetworkPolicy structure:
┌────────────────────────────────────────────────┐
│ podSelector: which pods this policy            │
│   applies to (the "protected" pods)            │
│                                                │
│ policyTypes: [Ingress, Egress]                 │
│                                                │
│ ingress: rules for INCOMING traffic            │
│   from: [podSelector / namespaceSelector /     │
│          ipBlock]                              │
│   ports: [allowed ports]                       │
│                                                │
│ egress: rules for OUTGOING traffic             │
│   to: [similar selectors]                      │
└────────────────────────────────────────────────┘
```

### 20.4 YAML Manifest / Config Example

### Default Deny All Ingress (Zero-Trust Baseline)

```yaml
# deny-all-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}              # empty selector = applies to ALL pods in namespace
  policyTypes:
    - Ingress
  # no "ingress:" rules defined = deny everything by default
```

### Default Deny All Egress

```yaml
# deny-all-egress.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-egress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Egress
```

### Allow Specific Traffic (Frontend → Backend → Database)

```yaml
# allow-frontend-to-backend.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend                    # this policy protects "backend" pods
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend            # ONLY allow traffic from "frontend" pods
      ports:
        - protocol: TCP
          port: 8080
---
# allow-backend-to-database.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-backend-to-database
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: backend             # ONLY allow traffic from "backend" pods
      ports:
        - protocol: TCP
          port: 5432
```

### Allow Traffic from Specific Namespace

```yaml
# allow-from-namespace.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-monitoring-namespace
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: monitoring   # auto-added namespace label
      ports:
        - protocol: TCP
          port: 9090                                    # e.g., metrics scraping
```

### Allow Egress to External IP Range (e.g., external API)

```yaml
# allow-egress-external.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-egress-to-external-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Egress
  egress:
    - to:
        - ipBlock:
            cidr: 203.0.113.0/24       # allowed external IP range
      ports:
        - protocol: TCP
          port: 443
    - to:                               # always allow DNS resolution
        - namespaceSelector: {}
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

### 20.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# IMPORTANT: minikube's default CNI may not support NetworkPolicy
# Enable Calico for full NetworkPolicy support:
#═══════════════════════════════════════════════

minikube start --cni=calico
# or for an existing cluster:
# minikube addons enable calico   (if available in your version)

kubectl get pods -n kube-system | grep calico

#═══════════════════════════════════════════════
# SETUP TEST ENVIRONMENT
#═══════════════════════════════════════════════

kubectl create namespace production
kubectl label namespace production kubernetes.io/metadata.name=production

kubectl create deployment frontend --image=nginx:1.25 -n production
kubectl label deployment frontend app=frontend -n production --overwrite
kubectl get pods -n production -l app=frontend -o name | \
  xargs -I{} kubectl label {} app=frontend -n production --overwrite

kubectl create deployment backend --image=nginx:1.25 -n production
kubectl get pods -n production -l app=backend -o name | \
  xargs -I{} kubectl label {} app=backend -n production --overwrite

kubectl create deployment database --image=nginx:1.25 -n production
kubectl get pods -n production -l app=database -o name | \
  xargs -I{} kubectl label {} app=database -n production --overwrite

kubectl expose deployment backend --port=8080 --target-port=80 -n production
kubectl expose deployment database --port=5432 --target-port=80 -n production

#═══════════════════════════════════════════════
# TEST: BEFORE NetworkPolicy (everything is open)
#═══════════════════════════════════════════════

FRONTEND_POD=$(kubectl get pod -n production -l app=frontend -o jsonpath='{.items[0].metadata.name}')

kubectl exec -n production $FRONTEND_POD -- curl -s -o /dev/null -w "%{http_code}\n" http://database:5432
# 200 — frontend CAN reach database directly (no restriction yet — BAD for security)

#═══════════════════════════════════════════════
# APPLY DEFAULT DENY
#═══════════════════════════════════════════════

kubectl apply -f deny-all-ingress.yaml

kubectl exec -n production $FRONTEND_POD -- curl -s --max-time 3 http://database:5432
# (times out / connection refused) — ALL traffic now blocked

#═══════════════════════════════════════════════
# APPLY SPECIFIC ALLOW RULES
#═══════════════════════════════════════════════

kubectl apply -f allow-frontend-to-backend.yaml
kubectl apply -f allow-backend-to-database.yaml

kubectl exec -n production $FRONTEND_POD -- curl -s -o /dev/null -w "%{http_code}\n" http://backend:8080
# 200 — frontend CAN now reach backend (explicitly allowed)

kubectl exec -n production $FRONTEND_POD -- curl -s --max-time 3 http://database:5432
# (still blocked!) — frontend cannot reach database directly (correct! only backend can)

BACKEND_POD=$(kubectl get pod -n production -l app=backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n production $BACKEND_POD -- curl -s -o /dev/null -w "%{http_code}\n" http://database:5432
# 200 — backend CAN reach database (explicitly allowed)

#═══════════════════════════════════════════════
# VIEW NETWORK POLICIES
#═══════════════════════════════════════════════

kubectl get networkpolicy -n production
kubectl describe networkpolicy allow-frontend-to-backend -n production

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete namespace production
```

### 20.6 Common Errors & Troubleshooting

**Error 1: NetworkPolicy has no effect at all**
```bash
# Most common cause: CNI plugin doesn't support NetworkPolicy enforcement
kubectl get pods -n kube-system
# Flannel (basic) does NOT enforce NetworkPolicy by default
# Fix: switch to Calico, Cilium, or another NetworkPolicy-capable CNI

# Verify your CNI:
kubectl get pods -n kube-system -o wide | grep -E 'calico|cilium|flannel|weave'
```

**Error 2: Pods can't resolve DNS after applying deny-all egress**
```bash
kubectl exec -it my-pod -- nslookup kubernetes.default
# Server can't find ... : Connection timed out

# Cause: deny-all egress blocks DNS (UDP/TCP port 53) too
# Fix: ALWAYS include a DNS allow rule when using deny-all egress policies
#      (see allow-egress-external.yaml example above)
```

**Error 3: Policy seems too permissive or too restrictive**
```bash
# Debug by describing and carefully reading selectors:
kubectl describe networkpolicy my-policy -n production

# Common mistake: matchLabels selector matches MORE pods than intended
# Common mistake: forgetting podSelector: {} means "all pods in namespace"
# Test methodically: apply ONE policy at a time and verify with curl/wget
# from a test pod before adding more
```

### 20.7 Best Practices

- **Start with default-deny** for both ingress and egress in sensitive namespaces, then explicitly allow required traffic (zero-trust model)
- **Always allow DNS (port 53)** when applying egress restrictions — easy to forget, breaks everything
- **Use namespaceSelector for cross-namespace rules** (e.g., allowing monitoring tools to scrape metrics)
- **Label your pods and namespaces consistently** — NetworkPolicy is entirely selector-driven
- **Test policies in a non-production namespace first** — a misconfigured deny-all can cause a full outage
- **Document your NetworkPolicy strategy** — as the number of policies grows, mapping traffic flows becomes essential
- **Choose a CNI that supports NetworkPolicy from day one** — migrating CNI plugins later is disruptive

### 20.8 Key Takeaways / Summary

- Kubernetes mandates a flat network where every Pod gets a unique IP, with no NAT between pods
- CNI plugins (Calico, Cilium, Flannel, etc.) implement the actual networking — Kubernetes itself just defines the contract
- NetworkPolicy enables zero-trust network segmentation but requires a CNI plugin that supports enforcement
- Default behavior (no NetworkPolicy) is fully open — all pods can reach all other pods
- Default-deny + explicit allow rules is the recommended production security pattern; always remember DNS egress

### 20.9 Practice Questions / Tasks

1. Set up a 3-tier app (frontend/backend/database) with NetworkPolicies ensuring frontend can only reach backend, and backend can only reach database. Verify with curl tests from each pod.
2. Apply a default-deny-all egress policy to a namespace and observe what breaks (hint: DNS). Fix it with an appropriate allow rule.
3. Explain why NetworkPolicy enforcement depends on the CNI plugin, and name 2 CNI plugins that support it vs 1 that has limited support.

## 21. Monitoring & Logging (Prometheus, Grafana, EFK/ELK Stack Overview)

### 21.1 Learning Objectives

- Understand the three pillars of observability: metrics, logs, traces
- Set up Prometheus and Grafana for cluster and application monitoring
- Understand the EFK/ELK stack for centralized logging
- Write basic PromQL queries and create alerts

### 21.2 Concept Explanation

In a static server world, you SSH in and `tail -f` a log file. In Kubernetes, Pods are ephemeral and distributed across many nodes — when a Pod dies, its logs die with it (unless centralized). You need purpose-built observability tooling.

> **Analogy:** Running Kubernetes without monitoring is like flying a plane with no instruments — you might be fine for a while, but you have zero visibility into altitude, fuel, or engine health until something goes catastrophically wrong.

### The Three Pillars of Observability

| Pillar | Question Answered | Tool Examples |
|--------|-------------------|----------------|
| **Metrics** | "What is the current state/trend?" (CPU, request rate, error rate) | Prometheus, Grafana |
| **Logs** | "What exactly happened, in detail?" | EFK (Elasticsearch/Fluentd/Kibana), ELK (Logstash), Loki |
| **Traces** | "How did this request flow through my microservices?" | Jaeger, Zipkin, OpenTelemetry |

### Prometheus + Grafana

- **Prometheus**: A time-series database that **pulls (scrapes)** metrics from configured targets at intervals. Has its own query language: **PromQL**.
- **Grafana**: A visualization layer that queries Prometheus (and other data sources) to build dashboards and alerts.

### EFK / ELK Stack

- **Elasticsearch**: Stores and indexes log data for fast searching
- **Fluentd / Fluent Bit / Logstash**: Collects logs from every node/pod and ships them to Elasticsearch
- **Kibana**: Visualizes and searches logs stored in Elasticsearch

> **Modern alternative:** Many teams now use **Grafana Loki** (lightweight, Prometheus-style log aggregation) instead of the heavier ELK/EFK stack, often paired with **Grafana** for both metrics AND logs in one UI.

### 21.3 Architecture / How it Works

```
┌──────────────────────────────────────────────────────────────────────┐
│                       METRICS PIPELINE                               │
│                                                                      │
│  [App Pod] ──exposes /metrics endpoint (Prometheus format)──┐        │
│  [Node]    ──node-exporter DaemonSet exposes node metrics──┤         │
│  [kube-state-metrics] ──exposes K8s object state metrics──┤          │
│                                                              ▼       │
│                                              ┌───────────────┐       │
│                                              │  Prometheus     │     │
│                                              │  (scrapes every │     │
│                                              │   15-30s, stores│     │
│                                              │   time-series)   │    │
│                                              └────────┬───────┘      │
│                                                       │              │
│                            ┌──────────────────────────┼─────────┐    │
│                            ▼                            ▼        │   │
│                    ┌──────────────┐            ┌──────────────┐ │    │
│                    │   Grafana      │            │  Alertmanager  │ ││
│                    │   (dashboards) │            │  (sends alerts │ ││
│                    │                │            │   to Slack,    │ ││
│                    │                │            │   PagerDuty)   │ ││
│                    └──────────────┘            └──────────────┘ │    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       LOGGING PIPELINE                               │
│                                                                      │
│  [App Pod] ──writes logs to stdout/stderr──┐                         │
│                                              ▼                       │
│                              ┌────────────────────────┐              │
│                              │  Fluent Bit / Fluentd     │           │
│                              │  (DaemonSet — one per node,│          │
│                              │   reads container log files)│         │
│                              └────────────┬───────────┘              │
│                                          │                           │
│                                          ▼                           │
│                              ┌────────────────────────┐              │
│                              │  Elasticsearch            │           │
│                              │  (stores, indexes logs)   │           │
│                              └────────────┬───────────┘              │
│                                          │                           │
│                                          ▼                           │
│                              ┌────────────────────────┐              │
│                              │  Kibana                   │           │
│                              │  (search & visualize logs)│           │
│                              └────────────────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

### 21.4 YAML Manifest / Config Example

> **Note:** Production Prometheus/Grafana setups use Helm charts (`kube-prometheus-stack`) rather than hand-written YAML. Shown below: a minimal example for understanding, plus the recommended Helm approach.

### Application Exposing Prometheus Metrics

```yaml
# app-with-metrics.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
      annotations:                          # tells Prometheus how to scrape this pod
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: app
          image: my-app:1.0
          ports:
            - containerPort: 8080
              name: http-metrics
```

### ServiceMonitor (used by Prometheus Operator)

```yaml
# servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app-monitor
  labels:
    release: prometheus           # must match the Prometheus Operator's selector
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
    - port: http-metrics
      path: /metrics
      interval: 30s
```

### Sample PrometheusRule (Alerting)

```yaml
# prometheusrule.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: my-app-alerts
  labels:
    release: prometheus
spec:
  groups:
    - name: my-app.rules
      rules:
        - alert: HighErrorRate
          expr: |
            rate(http_requests_total{status=~"5.."}[5m]) > 0.05
          for: 10m
          labels:
            severity: critical
          annotations:
            summary: "High error rate on {{ $labels.pod }}"
            description: "Error rate is above 5% for 10 minutes"

        - alert: PodMemoryHigh
          expr: |
            container_memory_usage_bytes{pod=~"my-app-.*"}
            / container_spec_memory_limit_bytes{pod=~"my-app-.*"} > 0.9
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "Pod {{ $labels.pod }} memory usage above 90%"
```

### 21.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# INSTALL kube-prometheus-stack (Prometheus + Grafana + Alertmanager)
#═══════════════════════════════════════════════

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl create namespace monitoring

helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.retention=7d

# Wait for everything to start
kubectl get pods -n monitoring -w
# Expect: prometheus-*, grafana-*, alertmanager-*, node-exporter-* (DaemonSet),
#         kube-state-metrics-*

#═══════════════════════════════════════════════
# ACCESS PROMETHEUS UI
#═══════════════════════════════════════════════

kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Open browser: http://localhost:9090

# Try PromQL queries in the UI:
# - up                                       (which targets are healthy)
# - rate(container_cpu_usage_seconds_total[5m])
# - sum(container_memory_usage_bytes) by (pod)

#═══════════════════════════════════════════════
# ACCESS GRAFANA UI
#═══════════════════════════════════════════════

kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Open browser: http://localhost:3000
# Login: admin / admin123

# Pre-built dashboards are already imported:
# - Kubernetes / Compute Resources / Cluster
# - Kubernetes / Compute Resources / Namespace (Pods)
# - Node Exporter / Nodes

#═══════════════════════════════════════════════
# QUERY EXAMPLES (PromQL Cheat Sheet)
#═══════════════════════════════════════════════

# CPU usage rate per pod over 5 minutes
# rate(container_cpu_usage_seconds_total{namespace="default"}[5m])

# Memory usage per pod
# container_memory_working_set_bytes{namespace="default"}

# Number of pod restarts
# kube_pod_container_status_restarts_total

# Node CPU utilization percentage
# 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# HTTP request rate (if app exposes this metric)
# sum(rate(http_requests_total[5m])) by (status)

#═══════════════════════════════════════════════
# DEPLOY EFK STACK (simplified — for production use the Elastic Helm charts)
#═══════════════════════════════════════════════

helm repo add elastic https://helm.elastic.co
helm repo update

helm install elasticsearch elastic/elasticsearch -n monitoring \
  --set replicas=1 \
  --set minimumMasterNodes=1 \
  --set resources.requests.memory=512Mi \
  --set resources.limits.memory=1Gi

helm install kibana elastic/kibana -n monitoring

helm install fluent-bit fluent/fluent-bit -n monitoring \
  --set backend.type=es \
  --set backend.es.host=elasticsearch-master

kubectl get pods -n monitoring | grep -E 'elasticsearch|kibana|fluent-bit'

# Access Kibana
kubectl port-forward -n monitoring svc/kibana-kibana 5601:5601
# Open browser: http://localhost:5601

#═══════════════════════════════════════════════
# BASIC kubectl LOGGING COMMANDS (without external tooling)
#═══════════════════════════════════════════════

kubectl logs my-pod                          # current container logs
kubectl logs my-pod --since=1h                # last 1 hour
kubectl logs my-pod --tail=100                # last 100 lines
kubectl logs -l app=my-app --all-containers   # logs from all matching pods

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

helm uninstall prometheus -n monitoring
helm uninstall elasticsearch kibana fluent-bit -n monitoring
kubectl delete namespace monitoring
```

### 21.6 Common Errors & Troubleshooting

**Error 1: Prometheus target shows "DOWN"**
```bash
# In Prometheus UI: Status → Targets, look for red/down targets

# Common causes:
# 1. App's /metrics endpoint not exposed or wrong port
kubectl exec -it my-app-pod -- curl localhost:8080/metrics

# 2. ServiceMonitor selector doesn't match the Service's labels
kubectl get servicemonitor my-app-monitor -o yaml
kubectl get svc my-app --show-labels
```

**Error 2: Grafana shows "No Data"**
```bash
# Check the datasource connection
# Settings → Data Sources → Prometheus → Test
# Verify the Prometheus URL is reachable from Grafana's pod

kubectl exec -it deploy/prometheus-grafana -n monitoring -- \
  curl http://prometheus-kube-prometheus-prometheus:9090/api/v1/status/config
```

**Error 3: Fluent Bit/Fluentd not shipping logs**
```bash
kubectl logs -n monitoring -l app.kubernetes.io/name=fluent-bit
# Look for connection errors to Elasticsearch

# Common cause: wrong Elasticsearch host/port in fluent-bit config
kubectl get configmap fluent-bit -n monitoring -o yaml | grep -A5 OUTPUT
```

### 21.7 Best Practices

- **Use the `kube-prometheus-stack` Helm chart** rather than building Prometheus from scratch — it bundles sensible defaults, dashboards, and alert rules
- **Set retention policies** appropriately (Prometheus default storage isn't infinite) — typically 7-30 days locally, longer-term storage via Thanos/Cortex/Mimir for historical data
- **Always alert on symptoms, not just causes** — e.g., alert on "error rate too high" (symptom) in addition to "pod restarted" (cause)
- **Use labels consistently** across apps so dashboards and alerts can be templated/reused
- **Centralize logs** — never rely on `kubectl logs` alone in production; logs disappear when pods are deleted
- **Set up Alertmanager routing** to the right team/channel (Slack, PagerDuty) — alerts nobody sees are useless
- **Monitor the monitoring stack itself** — Prometheus and Elasticsearch can run out of disk/memory too

### 21.8 Key Takeaways / Summary

- Observability has three pillars: metrics (Prometheus/Grafana), logs (EFK/ELK/Loki), and traces (Jaeger/OpenTelemetry)
- Prometheus pulls/scrapes metrics; Grafana visualizes them; Alertmanager routes alerts
- EFK/ELK centralizes logs since Pod-local logs disappear when Pods die
- `kube-prometheus-stack` is the standard Helm chart for getting a full monitoring stack running quickly
- Always centralize logs and metrics — `kubectl logs`/`kubectl top` alone aren't sufficient for production

### 21.9 Practice Questions / Tasks

1. Install `kube-prometheus-stack` via Helm and access the Grafana dashboard. Find the "Kubernetes / Compute Resources / Namespace" dashboard and identify your highest CPU-consuming pod.
2. Write a PromQL query to show the rate of pod restarts over the last 30 minutes across the cluster.
3. Explain why centralized logging (EFK/Loki) is essential in Kubernetes but might be optional on a traditional single-server deployment.

---

## 22. Kubernetes Security Best Practices

### 22.1 Learning Objectives

- Understand the 4 C's of Cloud Native Security
- Apply Pod Security Standards (PSS) / Pod Security Admission
- Scan images for vulnerabilities and manage supply chain security
- Implement defense-in-depth across the cluster

### 22.2 Concept Explanation

Kubernetes security isn't a single feature — it's a layered discipline. The **4 C's of Cloud Native Security** framework helps structure thinking:

```
┌────────────────────────────────────────────────┐
│  Cloud / Cluster Infrastructure                   │  ← physical/cloud security,
│  ┌──────────────────────────────────────────┐   │     network segmentation
│  │  Cluster (K8s components, RBAC, etcd)       │     │
│  │  ┌────────────────────────────────────┐   │       │
│  │  │  Container (image scanning, runtime)  │   │    │
│  │  │  ┌──────────────────────────────┐   │   │      │
│  │  │  │  Code (app vulnerabilities,    │   │   │    │
│  │  │  │  dependency scanning, secrets)  │   │   │   │
│  │  │  └──────────────────────────────┘   │   │      │
│  │  └────────────────────────────────────┘   │       │
│  └──────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────┘
       Cloud → Cluster → Container → Code
```

> **Analogy:** Security is like protecting a castle — you need a moat (cloud/network perimeter), strong walls (cluster hardening), guarded gates (RBAC), and trustworthy occupants (secure code/images). A breach at any single layer can compromise the whole castle if other layers aren't solid.

### Pod Security Standards (PSS)

Replaced the deprecated PodSecurityPolicy (removed in K8s 1.25). PSS defines 3 policy levels enforced via **Pod Security Admission**:

| Level | Description |
|-------|-------------|
| **Privileged** | Unrestricted (system components only) |
| **Baseline** | Minimally restrictive, prevents known privilege escalations |
| **Restricted** | Heavily restricted, follows pod hardening best practices |

### 22.3 Architecture / How it Works

```
┌───────────────────────────────────────────────────────────────────┐
│  Namespace: production                                            │
│   labels:                                                         │
│     pod-security.kubernetes.io/enforce: restricted                │
│     pod-security.kubernetes.io/audit: restricted                  │
│     pod-security.kubernetes.io/warn: restricted                   │
└───────────────────────┬───────────────────────────────────────────┘
                          │ enforced by built-in Admission Controller
                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│  kubectl apply -f pod.yaml                                             │
│        │                                                               │
│        ▼                                                               │
│  Pod Security Admission Controller                                     │
│   checks: runAsNonRoot? privileged=false? capabilities dropped?        │
│        │                                                               │
│   ┌────┴────┐                                                          │
│   ▼          ▼                                                         │
│ PASS      REJECTED (if "enforce")                                      │
│           or WARNED (if "warn")                                        │
│           or LOGGED (if "audit")                                       │
└────────────────────────────────────────────────────────────────────────┘

SUPPLY CHAIN SECURITY FLOW:
Source Code → CI Build → Image Scan → Sign Image → Push to Registry
     │              │            │            │              │
  SAST scan    Build image   Trivy/Grype   Cosign/Notary  Admission
  (code vulns)               (CVE scan)    (image signing) webhook
                                                            verifies
                                                            signature
                                                            before
                                                            allowing
                                                            deployment
```

### 22.4 YAML Manifest / Config Example

### Namespace with Pod Security Standards Enforced

```yaml
# secure-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Pod Compliant with "Restricted" PSS Level

```yaml
# restricted-compliant-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: compliant-pod
  namespace: production
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: nginx:1.25
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop: ["ALL"]
        readOnlyRootFilesystem: true
      volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /var/cache/nginx
        - name: run
          mountPath: /var/run
      resources:
        requests:
          cpu: "100m"
          memory: "128Mi"
        limits:
          cpu: "250m"
          memory: "256Mi"
  volumes:
    - name: tmp
      emptyDir: {}
    - name: cache
      emptyDir: {}
    - name: run
      emptyDir: {}
```

### NetworkPolicy as Part of Security Baseline (recap from Chapter 20)

```yaml
# baseline-network-isolation.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Image Pull with Verified Digest (Supply Chain Security)

```yaml
# pinned-image-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pinned-image-pod
spec:
  containers:
    - name: app
      # Use SHA256 digest instead of mutable tags for immutability guarantee
      image: nginx@sha256:9d1c61cfb6c3849f1e1972f9bb35c8a7f9b08adf3e9e1f3d9a35e6c81e9c1c39
```

### 22.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CREATE NAMESPACE WITH POD SECURITY STANDARDS
#═══════════════════════════════════════════════

kubectl apply -f secure-namespace.yaml
kubectl get namespace production --show-labels

#═══════════════════════════════════════════════
# TEST: TRY DEPLOYING A NON-COMPLIANT POD (SHOULD BE REJECTED)
#═══════════════════════════════════════════════

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: insecure-pod
  namespace: production
spec:
  containers:
    - name: app
      image: nginx:1.25
      securityContext:
        privileged: true
EOF
# Error: pods "insecure-pod" is forbidden: violates PodSecurity "restricted:latest":
# privileged (container "app" must not set securityContext.privileged=true)

#═══════════════════════════════════════════════
# DEPLOY THE COMPLIANT POD
#═══════════════════════════════════════════════

kubectl apply -f restricted-compliant-pod.yaml
kubectl get pod compliant-pod -n production
# Successfully created

#═══════════════════════════════════════════════
# SCAN IMAGES FOR VULNERABILITIES (Trivy)
#═══════════════════════════════════════════════

# Install Trivy
brew install aquasecurity/trivy/trivy        # macOS
# or: sudo apt-get install trivy              # Linux (after adding repo)

# Scan an image
trivy image nginx:1.25
# Shows CVEs by severity: CRITICAL, HIGH, MEDIUM, LOW

# Scan and fail CI if CRITICAL vulnerabilities found (CI/CD integration)
trivy image --severity CRITICAL --exit-code 1 nginx:1.25

# Scan a running cluster for misconfigurations
trivy k8s --report summary cluster

#═══════════════════════════════════════════════
# CHECK RBAC FOR OVER-PRIVILEGED ACCOUNTS
#═══════════════════════════════════════════════

# Using kubectl directly
kubectl get clusterrolebindings -o json | \
  jq -r '.items[] | select(.roleRef.name=="cluster-admin") | .metadata.name'

# Using rbac-lookup tool (install separately)
# rbac-lookup | grep cluster-admin

#═══════════════════════════════════════════════
# AUDIT WITH kube-bench (CIS Kubernetes Benchmark)
#═══════════════════════════════════════════════

kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl logs -f job/kube-bench
# Produces a detailed CIS benchmark compliance report

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete namespace production
kubectl delete job kube-bench
```

### 22.6 Common Errors & Troubleshooting

**Error 1: Pod rejected by Pod Security Admission**
```bash
# Error: violates PodSecurity "restricted:latest": allowPrivilegeEscalation != false

# Fix: review the specific violation message — it tells you EXACTLY which
# securityContext field is missing/wrong
kubectl describe namespace production | grep pod-security
# Adjust securityContext per the restricted profile requirements
```

**Error 2: Legitimate workload can't run under "restricted" (e.g., needs specific capability)**
```bash
# Some workloads (e.g., certain monitoring agents) genuinely need elevated privileges
# Fix: place these specific workloads in a separate namespace with a more
# permissive PSS level ("baseline" or "privileged"), don't weaken the
# entire cluster's posture for one exception
```

**Error 3: Image scan reveals critical CVEs in a production image**
```bash
trivy image my-app:1.0
# Total: 15 (CRITICAL: 3, HIGH: 5, MEDIUM: 7)

# Fix:
# 1. Update base image to latest patched version
# 2. Rebuild and rescan
# 3. If a CVE has no fix yet, assess actual exploitability/exposure
#    and document risk acceptance if proceeding temporarily
```

### 22.7 Best Practices

- **Enforce Pod Security Standards** at minimum "baseline", ideally "restricted" for all application namespaces
- **Scan every image** in CI/CD before deployment (Trivy, Grype, Snyk) — block builds with CRITICAL CVEs
- **Use minimal base images** (distroless, alpine) to reduce attack surface and CVE count
- **Never run containers as root** — set `runAsNonRoot: true` everywhere possible
- **Enable audit logging** on the API server to track who did what
- **Rotate credentials and certificates regularly** — service account tokens, TLS certs, kubeconfig credentials
- **Encrypt etcd at rest** and encrypt Secrets specifically (`EncryptionConfiguration`)
- **Use Network Policies** for micro-segmentation (default-deny, explicit allow)
- **Run `kube-bench`** periodically to check CIS Kubernetes Benchmark compliance
- **Implement image signing/verification** (Cosign + admission webhook) to prevent unauthorized images from running
- **Keep Kubernetes itself updated** — apply security patches promptly; track the K8s release/support cycle

### 22.8 Key Takeaways / Summary

- Security spans 4 layers: Cloud, Cluster, Container, Code — weaknesses anywhere can compromise the whole system
- Pod Security Standards (Privileged/Baseline/Restricted) replaced the deprecated PodSecurityPolicy
- Image scanning (Trivy/Grype) should be a mandatory CI/CD gate, not an afterthought
- Defense-in-depth means combining RBAC + NetworkPolicy + SecurityContext + PSS + image scanning — no single control is sufficient alone
- Regular audits (`kube-bench`, RBAC reviews) catch drift from your intended security posture over time

### 22.9 Practice Questions / Tasks

1. Create a namespace enforcing the "restricted" Pod Security Standard, then attempt to deploy both a compliant and non-compliant pod. Document the exact error message for the rejected one.
2. Run Trivy against 3 different public images (e.g., `nginx:1.25`, `python:3.9`, `node:18`) and compare their vulnerability counts. What patterns do you notice about image size vs vulnerability count?
3. Explain the "4 C's of Cloud Native Security" in your own words with one concrete example of a control at each layer.

---

## 23. CI/CD Integration with Kubernetes

### 23.1 Learning Objectives

- Understand GitOps vs traditional push-based CI/CD for Kubernetes
- Build a basic CI/CD pipeline that builds, tests, and deploys to K8s
- Understand the role of container registries in the pipeline
- Know the basics of ArgoCD/Flux for GitOps

### 23.2 Concept Explanation

### Traditional (Push-Based) CI/CD

The CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins) directly runs `kubectl apply` or `helm upgrade` against the cluster after building and testing the code.

### GitOps (Pull-Based) CI/CD

A GitOps **operator** (ArgoCD, Flux) running INSIDE the cluster continuously watches a Git repository and automatically syncs the cluster state to match what's declared in Git. CI builds the image and updates a manifest in Git; the GitOps tool handles the actual deployment.

> **Analogy:** Push-based CI/CD is like a delivery driver who has keys to your house and lets themselves in to drop off packages (your pipeline has cluster credentials and pushes changes). GitOps is like a smart home system that constantly checks "does my house match the blueprint?" and self-corrects automatically — nobody from outside needs a key; the system inside does the work based on the blueprint (Git).

```
PUSH-BASED:                          GITOPS (PULL-BASED):
CI Pipeline ──kubectl apply──→ Cluster      Git Repo (source of truth)
(has cluster credentials)                         │
                                          ArgoCD/Flux (inside cluster)
                                          continuously polls/watches Git
                                          and syncs automatically
                                          (cluster has NO external push access)
```

### 23.3 Architecture / How it Works

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    TYPICAL CI/CD PIPELINE FLOW                            │
│                                                                           │
│  1. Developer pushes code → GitHub/GitLab                                 │
│                    │                                                      │
│                    ▼                                                      │
│  2. CI Pipeline triggers (GitHub Actions / GitLab CI / Jenkins)           │
│     ┌─────────────────────────────────────────────────┐                   │
│     │ a) Checkout code                                  │                 │
│     │ b) Run unit tests                                  │                │
│     │ c) Build Docker image                                │              │
│     │ d) Scan image for vulnerabilities (Trivy)             │             │
│     │ e) Push image to registry (tagged with commit SHA)      │           │
│     └─────────────────────────────────────────────────┘                   │
│                    │                                                      │
│                    ▼                                                      │
│  3a. PUSH MODEL: CD step runs kubectl/helm directly                       │
│      against cluster                                                      │
│                    OR                                                     │
│  3b. GITOPS MODEL: CI updates image tag in a Git repo                     │
│      (e.g., values.yaml or kustomization.yaml)                            │
│                    │                                                      │
│                    ▼                                                      │
│      ArgoCD/Flux detects the Git change and automatically                 │
│      applies it to the cluster                                            │
│                    │                                                      │
│                    ▼                                                      │
│  4. Kubernetes performs rolling update                                    │
│                    │                                                      │
│                    ▼                                                      │
│  5. Health checks / smoke tests verify deployment success                 │
└───────────────────────────────────────────────────────────────────────────┘
```

### 23.4 YAML Manifest / Config Example

### GitHub Actions Pipeline (Build, Test, Push, Deploy)

```yaml
# .github/workflows/deploy.yaml
name: Build and Deploy

on:
  push:
    branches: [main]

env:
  REGISTRY: docker.io
  IMAGE_NAME: myorg/my-app

jobs:
  build-test-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run unit tests
        run: |
          npm install
          npm test

      - name: Build Docker image
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} .

      - name: Scan image for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: '${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Login to registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push image
        run: |
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy:
    needs: build-test-push
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBECONFIG_BASE64 }}" | base64 -d > $HOME/.kube/config

      - name: Deploy via Helm
        run: |
          helm upgrade --install my-app ./charts/my-app \
            --set image.tag=${{ github.sha }} \
            --namespace production \
            --atomic --timeout 5m

      - name: Verify rollout
        run: |
          kubectl rollout status deployment/my-app -n production --timeout=120s
```

### ArgoCD Application (GitOps Model)

```yaml
# argocd-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/my-app-manifests.git
    targetRevision: main
    path: charts/my-app
    helm:
      valueFiles:
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true              # automatically remove resources deleted from Git
      selfHeal: true            # automatically revert manual cluster changes
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        maxDuration: 3m
```

### Kustomize Overlay Example (alternative to Helm for env-specific config)

```yaml
# kustomization.yaml (base)
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
---
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
patches:
  - target:
      kind: Deployment
      name: my-app
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 5
images:
  - name: my-app
    newTag: v1.2.3
```

### 23.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# SIMULATE A LOCAL CI/CD PIPELINE STEP BY STEP
#═══════════════════════════════════════════════

# Step 1: Build an image
docker build -t my-app:local-test .

# Step 2: Scan it
trivy image --severity CRITICAL,HIGH my-app:local-test

# Step 3: Push to a local/test registry (or Docker Hub)
docker tag my-app:local-test myregistry/my-app:$(git rev-parse --short HEAD)
docker push myregistry/my-app:$(git rev-parse --short HEAD)

# Step 4: Deploy using kubectl
kubectl set image deployment/my-app app=myregistry/my-app:$(git rev-parse --short HEAD)
kubectl rollout status deployment/my-app --timeout=120s

#═══════════════════════════════════════════════
# INSTALL ARGOCD (GitOps demo)
#═══════════════════════════════════════════════

kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl get pods -n argocd -w
# Wait for all pods Running

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open https://localhost:8080

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
# Login: admin / <password from above>

#═══════════════════════════════════════════════
# REGISTER AN APPLICATION VIA CLI (alternative to YAML)
#═══════════════════════════════════════════════

# Install ArgoCD CLI
brew install argocd      # macOS

argocd login localhost:8080 --insecure

argocd app create my-app \
  --repo https://github.com/myorg/my-app-manifests.git \
  --path charts/my-app \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace production \
  --sync-policy automated

argocd app get my-app
argocd app sync my-app    # manually trigger sync if needed

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

argocd app delete my-app
kubectl delete namespace argocd
```

### 23.6 Common Errors & Troubleshooting

**Error 1: CI pipeline kubectl commands fail with auth errors**
```bash
# Error: error: You must be logged in to the server (Unauthorized)

# Cause: kubeconfig credentials expired, malformed, or wrong context
# Fix: regenerate the service account token/kubeconfig used by CI,
# verify it's correctly base64-encoded in the CI secret store
kubectl config view --kubeconfig=/path/to/ci-kubeconfig
```

**Error 2: ArgoCD shows "OutOfSync" indefinitely**
```bash
argocd app get my-app
# SYNC STATUS: OutOfSync

argocd app diff my-app
# Shows exactly what differs between Git and the live cluster state

# Common cause: a controller (e.g., HPA) is modifying replica count,
# which differs from what's declared in Git — use argocd app diff
# to confirm, and consider ignoring that specific field in sync settings
```

**Error 3: Rolling deployment fails mid-pipeline, pipeline reports success anyway**
```bash
# Always explicitly verify rollout status — don't assume kubectl apply succeeding
# means the Deployment is healthy
kubectl rollout status deployment/my-app --timeout=120s
# If this command's exit code isn't checked, your pipeline may falsely report success

# Fix: ensure CI step explicitly checks exit code:
# kubectl rollout status deployment/my-app --timeout=120s || exit 1
```

### 23.7 Best Practices

- **Tag images with immutable identifiers** (git commit SHA), never deploy `:latest` to production
- **Always scan images in CI** before pushing to a registry — fail the build on critical CVEs
- **Use `--atomic` with Helm** (or equivalent) so failed deployments automatically rollback
- **Verify rollout status explicitly** in your pipeline — don't assume `kubectl apply` succeeding means the app is healthy
- **Prefer GitOps (ArgoCD/Flux) for production** — provides audit trail, drift detection, and removes the need to give CI direct cluster credentials
- **Separate build and deploy permissions** — CI builds/pushes images; GitOps operator (with its own scoped RBAC inside the cluster) handles deployment
- **Use staging environments** that mirror production for pipeline validation before promoting to prod
- **Implement automated smoke tests** post-deployment to catch issues before declaring success

### 23.8 Key Takeaways / Summary

- Push-based CI/CD directly applies changes; GitOps (pull-based) uses an in-cluster operator that syncs from Git
- A typical pipeline: build → test → scan → push to registry → deploy → verify rollout
- ArgoCD and Flux are the leading GitOps tools, offering automated sync, drift detection, and self-healing
- Always verify rollout success explicitly in pipelines — don't assume `kubectl apply` succeeding means healthy deployment
- GitOps improves security posture by removing the need for CI pipelines to hold direct cluster credentials

### 23.9 Practice Questions / Tasks

1. Build a simple GitHub Actions (or GitLab CI) pipeline that builds a Docker image, scans it with Trivy, and deploys it to your local minikube cluster using `kubectl set image`.
2. Install ArgoCD locally and connect it to a public Git repo containing Kubernetes manifests. Observe how it automatically syncs and what happens when you manually edit a resource it manages (`selfHeal`).
3. Explain 2 security advantages of GitOps (pull-based) over traditional push-based CI/CD for production Kubernetes deployments.

---

## 24. Troubleshooting & Debugging Real Cluster Issues

### 24.1 Learning Objectives

- Build a systematic troubleshooting methodology for Kubernetes issues
- Master the diagnostic command toolkit
- Debug common failure scenarios: scheduling, networking, storage, application-level
- Practice root cause analysis under time pressure (exam-relevant)

### 24.2 Concept Explanation

Troubleshooting Kubernetes is a layered process — issues can originate at the application, Pod, Node, network, or cluster-control-plane level. A systematic approach beats random guessing.

> **Analogy:** Think of debugging Kubernetes like a doctor's differential diagnosis — start with broad vital signs (is the patient/cluster alive?), narrow down to the affected system (which component?), then pinpoint the exact cause (which specific test confirms it?).

### The Troubleshooting Funnel

```
1. Is the CLUSTER healthy?        → kubectl get nodes, kubectl cluster-info
2. Is the NAMESPACE/RESOURCE healthy? → kubectl get all -n <namespace>
3. Is the POD healthy?             → kubectl describe pod, kubectl get events
4. Is the CONTAINER healthy?        → kubectl logs, kubectl exec
5. Is the NETWORK working?          → kubectl exec + curl/nslookup, endpoints
6. Is STORAGE attached correctly?    → kubectl describe pvc/pv
```

### 24.3 Architecture / How it Works

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                  TROUBLESHOOTING DECISION TREE                                           │
│                                                                                          │
│  Pod won't start                                                                         │
│   │                                                                                      │
│   ├─ Status: Pending                                                                     │
│   │   └─ kubectl describe pod → check Events                                             │
│   │       ├─ "Insufficient cpu/memory" → resource issue                                  │
│   │       ├─ "node(s) had taints..." → toleration issue                                  │
│   │       └─ "no persistent volumes available" → storage issue                           │
│   │                                                                                      │
│   ├─ Status: ImagePullBackOff / ErrImagePull                                             │
│   │   └─ check image name/tag, registry auth (imagePullSecrets)                          │
│   │                                                                                      │
│   ├─ Status: CrashLoopBackOff                                                            │
│   │   └─ kubectl logs --previous → check app startup error                               │
│   │       check liveness probe config (too aggressive?)                                  │
│   │                                                                                      │
│   ├─ Status: Running but 0/1 Ready                                                       │
│   │   └─ readiness probe failing → check probe endpoint manually                         │
│   │                                                                                      │
│   └─ Status: Running, app unreachable                                                    │
│       └─ check Service selector ↔ Pod labels match                                       │
│           check NetworkPolicy isn't blocking traffic                                     │
│           check Endpoints object is populated                                            │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 24.4 YAML Manifest / Config Example

### Debug Pod (Ephemeral Container / Sidecar for Live Debugging)

```yaml
# debug-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: netshoot-debug
spec:
  containers:
    - name: netshoot
      image: nicolaka/netshoot:latest      # packed with networking debug tools
      command: ["sleep", "3600"]
      resources:
        requests:
          cpu: "50m"
          memory: "64Mi"
```

### 24.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# LAYER 1: CLUSTER-LEVEL HEALTH CHECK
#═══════════════════════════════════════════════

kubectl cluster-info
kubectl get nodes -o wide
kubectl get nodes -o json | jq '.items[].status.conditions'
# Look for Ready=True, MemoryPressure=False, DiskPressure=False, PIDPressure=False

kubectl get componentstatuses    # may be deprecated in newer versions
kubectl get pods -n kube-system  # control plane health (kubeadm clusters)

#═══════════════════════════════════════════════
# LAYER 2: NAMESPACE / RESOURCE OVERVIEW
#═══════════════════════════════════════════════

kubectl get all -n my-namespace
kubectl get events -n my-namespace --sort-by='.lastTimestamp'
# This is OFTEN the fastest way to spot the issue — recent events first

#═══════════════════════════════════════════════
# LAYER 3: POD-LEVEL DEBUGGING
#═══════════════════════════════════════════════

kubectl get pods -n my-namespace -o wide
kubectl describe pod <pod-name> -n my-namespace
# Read the FULL output: Events at the bottom are gold

# Get just events for a specific pod
kubectl get events --field-selector involvedObject.name=<pod-name> -n my-namespace

#═══════════════════════════════════════════════
# LAYER 4: CONTAINER-LEVEL DEBUGGING
#═══════════════════════════════════════════════

kubectl logs <pod-name> -n my-namespace
kubectl logs <pod-name> -n my-namespace --previous     # logs from before last crash
kubectl logs <pod-name> -c <container-name> -n my-namespace  # multi-container pods

# Get a shell inside the container
kubectl exec -it <pod-name> -n my-namespace -- /bin/sh

# For containers WITHOUT a shell (distroless images), use ephemeral containers (K8s 1.25+)
kubectl debug -it <pod-name> -n my-namespace --image=busybox:1.36 --target=<container-name>

#═══════════════════════════════════════════════
# LAYER 5: NETWORK DEBUGGING
#═══════════════════════════════════════════════

kubectl apply -f debug-pod.yaml
kubectl exec -it netshoot-debug -- bash

# Inside the debug pod, run:
nslookup my-service.my-namespace.svc.cluster.local    # DNS check
curl -v http://my-service.my-namespace:8080            # connectivity check
traceroute my-service                                    # path tracing
nc -zv my-service 8080                                     # port check

# From outside the pod:
kubectl get endpoints my-service -n my-namespace
# Empty endpoints = selector mismatch (most common Service issue)

kubectl get svc my-service -n my-namespace -o yaml
kubectl get pods -n my-namespace --show-labels

#═══════════════════════════════════════════════
# LAYER 6: STORAGE DEBUGGING
#═══════════════════════════════════════════════

kubectl get pvc -n my-namespace
kubectl describe pvc <pvc-name> -n my-namespace
kubectl get pv
kubectl describe pv <pv-name>
# Look for: Status (Bound/Pending/Lost), Events, node affinity conflicts

#═══════════════════════════════════════════════
# RESOURCE USAGE INVESTIGATION
#═══════════════════════════════════════════════

kubectl top nodes
kubectl top pods -n my-namespace
kubectl top pods -n my-namespace --containers   # per-container breakdown

#═══════════════════════════════════════════════
# CHECK API SERVER REQUEST LATENCY / THROTTLING
#═══════════════════════════════════════════════

kubectl get --raw /metrics | grep apiserver_request_duration

#═══════════════════════════════════════════════
# COMMON ONE-LINERS FOR FAST DIAGNOSIS
#═══════════════════════════════════════════════

# Find all pods NOT in Running state across the cluster
kubectl get pods -A --field-selector=status.phase!=Running

# Find all pods with high restart counts
kubectl get pods -A --sort-by='.status.containerStatuses[0].restartCount'

# Find recent Warning events cluster-wide
kubectl get events -A --field-selector type=Warning --sort-by='.lastTimestamp'

# Check which node a pod is scheduled on and why
kubectl get pod <pod-name> -o jsonpath='{.spec.nodeName}'
kubectl describe node <node-name> | grep -A5 "Allocated resources"

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete pod netshoot-debug
```

### 24.6 Common Errors & Troubleshooting

**Error 1: "Pending" pod that never schedules**
```bash
kubectl describe pod <pod-name>
# Events: Warning  FailedScheduling  0/3 nodes are available:
#         3 Insufficient memory.

# Action plan:
kubectl describe nodes | grep -A5 "Allocated resources"   # check actual capacity
kubectl top nodes                                            # check current usage
# Fix: scale cluster, reduce pod resource requests, or evict less critical pods
```

**Error 2: Intermittent 502/503 errors from a Service**
```bash
# Likely cause: readiness probe is too lenient, sending traffic to pods
# that aren't actually ready, OR pods are being terminated without
# graceful connection draining

kubectl get pods -n my-namespace -w
# Watch for pods flapping between Ready/NotReady

# Check terminationGracePeriodSeconds and preStop hooks:
kubectl get pod <pod-name> -o yaml | grep -A5 -E "terminationGracePeriod|preStop"

# Fix: add a preStop hook with a brief sleep to allow in-flight requests
# to complete before the container actually stops:
#   lifecycle:
#     preStop:
#       exec:
#         command: ["sh", "-c", "sleep 10"]
```

**Error 3: "OOMKilled" but app "shouldn't" be using that much memory**
```bash
kubectl describe pod <pod-name> | grep -A3 "Last State"
# Last State: Terminated, Reason: OOMKilled

# Investigate actual usage pattern over time (not just a snapshot)
kubectl top pod <pod-name> --containers

# Check for memory leaks via repeated kubectl top sampling over time,
# or use Prometheus/Grafana historical graphs (Chapter 21) to see the trend
# Fix: increase memory limit (if genuinely needed) OR fix the application
# memory leak — don't just throw more memory at a leak indefinitely
```

### 24.7 Best Practices

- **Always check `kubectl get events` first** — sorted by timestamp, it's often the fastest path to root cause
- **Read the FULL `kubectl describe` output**, not just the top — Events section at the bottom usually has the answer
- **Use `kubectl logs --previous`** when debugging CrashLoopBackOff — current logs may be empty if the container just restarted
- **Build a personal troubleshooting checklist/runbook** based on the funnel approach (cluster → namespace → pod → container → network → storage)
- **Use ephemeral debug containers** (`kubectl debug`) for distroless/minimal images that lack a shell
- **Reproduce issues in a non-production environment** when possible before touching production
- **Document incidents and root causes** — recurring issues often share root causes (e.g., systematically under-provisioned resource requests)
- For CKA/CKAD exam: **practice diagnosing broken clusters under time pressure** — speed matters as much as accuracy

### 24.8 Key Takeaways / Summary

- Troubleshoot in layers: cluster → namespace → pod → container → network → storage
- `kubectl describe` and `kubectl get events` are your fastest diagnostic tools — always check these FIRST
- `kubectl logs --previous` reveals crash causes that current logs might miss
- Empty Service `Endpoints` almost always means a label selector mismatch
- Build and refine a personal troubleshooting runbook — systematic beats random guessing every time

### 24.9 Practice Questions / Tasks

1. Deliberately misconfigure a Deployment's resource requests to exceed available cluster capacity. Use the troubleshooting funnel to diagnose and fix it, documenting each command you ran.
2. Create a Service with a deliberately wrong selector. Use only `kubectl` commands (no guessing) to identify and fix the root cause.
3. Simulate an OOMKilled scenario by setting an artificially low memory limit on a memory-intensive container. Document the exact sequence of commands you'd use to diagnose this in a real incident.

---

## 25. Production Best Practices (Multi-Cluster, Disaster Recovery, Upgrades)

### 25.1 Learning Objectives

- Design for high availability across nodes, zones, and clusters
- Implement backup and disaster recovery strategies
- Plan and execute safe Kubernetes version upgrades
- Understand multi-cluster strategies and when they're needed

### 25.2 Concept Explanation

Running Kubernetes in production requires planning well beyond "it works on minikube." This chapter consolidates operational maturity practices.

> **Analogy:** Learning Kubernetes is like learning to drive a car. Production operations is like becoming a professional fleet manager — you now worry about maintenance schedules (upgrades), backup vehicles (DR), multiple depots (multi-cluster/region), and what happens when a driver crashes at 3 AM (incident response).

### High Availability (HA) Layers

```
Pod-level HA:     Multiple replicas via Deployment/StatefulSet
Node-level HA:    Pod anti-affinity spreads pods across nodes
Zone-level HA:    Topology spread constraints across availability zones
Cluster-level HA: Multiple control-plane nodes (3 or 5 for etcd quorum)
Region-level HA:  Multi-cluster / multi-region for disaster recovery
```

### Disaster Recovery Essentials

- **etcd backups**: The cluster's entire state lives in etcd — back it up regularly
- **Application data backups**: PV snapshots, database backups (independent of K8s)
- **Velero**: Industry-standard tool for backing up Kubernetes resources AND persistent volumes
- **RTO/RPO planning**: Recovery Time Objective (how fast can you recover?) and Recovery Point Objective (how much data can you afford to lose?)

### 25.3 Architecture / How it Works

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                  HIGH AVAILABILITY ARCHITECTURE                                   │
│                                                                                   │
│  Region: us-east-1                                                                │
│  ┌─────────────────────────────────────────────────────────┐                      │
│  │  Zone A          Zone B          Zone C                    │                   │
│  │  ┌────────┐     ┌────────┐     ┌────────┐                  │                   │
│  │  │Control  │     │Control  │     │Control  │  ← 3-node HA     │                │
│  │  │Plane 1  │     │Plane 2  │     │Plane 3  │     control plane │               │
│  │  └────────┘     └────────┘     └────────┘                  │                   │
│  │                                                                │               │
│  │  ┌────────┐     ┌────────┐     ┌────────┐                  │                   │
│  │  │Worker   │     │Worker   │     │Worker   │  ← workers spread  │              │
│  │  │Node 1   │     │Node 2   │     │Node 3   │     across zones     │            │
│  │  │[Pod-A1] │     │[Pod-A2] │     │[Pod-A3] │  ← app replicas      │            │
│  │  └────────┘     └────────┘     └────────┘     spread via           │           │
│  │                                                  topology spread       │       │
│  │                                                  constraints            │      │
│  └─────────────────────────────────────────────────────────┘                      │
└───────────────────────────────────────────────────────────────────────────────────┘

                  DISASTER RECOVERY FLOW
┌────────────────────────────────────────────────────────────────────────┐
│  Scheduled etcd snapshot ──→ stored in S3/GCS (off-cluster!)           │
│  Velero backup (resources + PV snapshots) ──→ object storage           │
│                                                                        │
│  IF CLUSTER FAILS:                                                     │
│  1. Provision new cluster (kubeadm/managed service)                    │
│  2. Restore etcd snapshot (if same cluster) OR                         │
│  3. Velero restore (resources + data) to NEW cluster                   │
│  4. Update DNS/traffic routing to new cluster                          │
└────────────────────────────────────────────────────────────────────────┘
```

### 25.4 YAML Manifest / Config Example

### Pod Anti-Affinity (Spread Across Nodes)

```yaml
# anti-affinity-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ha-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ha-app
  template:
    metadata:
      labels:
        app: ha-app
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:    # HARD requirement
            - labelSelector:
                matchExpressions:
                  - key: app
                    operator: In
                    values: ["ha-app"]
              topologyKey: "kubernetes.io/hostname"            # spread across NODES
      containers:
        - name: app
          image: nginx:1.25
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
```

### Topology Spread Constraints (Spread Across Zones)

```yaml
# topology-spread-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zone-spread-app
spec:
  replicas: 6
  selector:
    matchLabels:
      app: zone-spread-app
  template:
    metadata:
      labels:
        app: zone-spread-app
    spec:
      topologySpreadConstraints:
        - maxSkew: 1                                  # max difference in pod count between zones
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule              # or ScheduleAnyway
          labelSelector:
            matchLabels:
              app: zone-spread-app
      containers:
        - name: app
          image: nginx:1.25
```

### PodDisruptionBudget (Protect Availability During Voluntary Disruptions)

```yaml
# pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ha-app-pdb
spec:
  minAvailable: 2              # or use maxUnavailable: 1
  selector:
    matchLabels:
      app: ha-app
```

### Velero Backup Schedule

```yaml
# velero-backup-schedule.yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-backup
  namespace: velero
spec:
  schedule: "0 1 * * *"                # 1 AM daily
  template:
    includedNamespaces:
      - production
      - monitoring
    snapshotVolumes: true               # also snapshot PVs
    ttl: 720h0m0s                       # retain backups for 30 days
```

### 25.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# ETCD BACKUP (kubeadm cluster)
#═══════════════════════════════════════════════

# Take a snapshot
ETCDCTL_API=3 etcdctl snapshot save /backup/etcd-snapshot-$(date +%Y%m%d).db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

# Verify the snapshot
ETCDCTL_API=3 etcdctl snapshot status /backup/etcd-snapshot-20260630.db --write-out=table

# Restore from a snapshot (DISASTER RECOVERY — run on a fresh control plane)
ETCDCTL_API=3 etcdctl snapshot restore /backup/etcd-snapshot-20260630.db \
  --data-dir=/var/lib/etcd-restored

#═══════════════════════════════════════════════
# INSTALL VELERO FOR APPLICATION-LEVEL BACKUPS
#═══════════════════════════════════════════════

# Install Velero CLI
brew install velero    # macOS

# Install Velero into the cluster (AWS S3 example)
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.9.0 \
  --bucket my-velero-backups \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1 \
  --secret-file ./credentials-velero

kubectl get pods -n velero

#═══════════════════════════════════════════════
# CREATE AND RESTORE A BACKUP
#═══════════════════════════════════════════════

# Manual one-time backup
velero backup create my-backup --include-namespaces production

# Check backup status
velero backup describe my-backup
velero backup logs my-backup

# Apply a scheduled backup
kubectl apply -f velero-backup-schedule.yaml
velero schedule get

# Simulate disaster: delete a namespace
kubectl delete namespace production

# Restore from backup
velero restore create --from-backup my-backup

velero restore describe <restore-name>
kubectl get all -n production
# Resources are back!

#═══════════════════════════════════════════════
# TEST POD ANTI-AFFINITY / TOPOLOGY SPREAD
#═══════════════════════════════════════════════

kubectl apply -f anti-affinity-deployment.yaml
kubectl get pods -l app=ha-app -o wide
# Verify NODE column shows pods spread across DIFFERENT nodes

#═══════════════════════════════════════════════
# TEST POD DISRUPTION BUDGET
#═══════════════════════════════════════════════

kubectl apply -f pdb.yaml
kubectl get pdb ha-app-pdb
# NAME         MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS
# ha-app-pdb   2               N/A               1

# Simulate node drain (respects PDB, won't evict below minAvailable)
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

#═══════════════════════════════════════════════
# KUBERNETES VERSION UPGRADE (kubeadm cluster)
#═══════════════════════════════════════════════

# ALWAYS read the official upgrade notes for your target version first!
# https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/

# Step 1: Upgrade kubeadm on the FIRST control-plane node
sudo apt-mark unhold kubeadm
sudo apt-get update && sudo apt-get install -y kubeadm=1.30.0-*
sudo apt-mark hold kubeadm

# Step 2: Verify the upgrade plan
sudo kubeadm upgrade plan

# Step 3: Apply the upgrade
sudo kubeadm upgrade apply v1.30.0

# Step 4: Upgrade kubelet and kubectl on this node
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet=1.30.0-* kubectl=1.30.0-*
sudo apt-mark hold kubelet kubectl
sudo systemctl daemon-reload
sudo systemctl restart kubelet

# Step 5: Drain and upgrade each WORKER node (one at a time!)
kubectl drain <worker-node> --ignore-daemonsets --delete-emptydir-data
# SSH to the worker, repeat kubeadm/kubelet/kubectl upgrade steps
kubectl uncordon <worker-node>

# Verify
kubectl get nodes
# All nodes should show the new version

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

velero backup delete my-backup
kubectl delete -f anti-affinity-deployment.yaml -f pdb.yaml
```

### 25.6 Common Errors & Troubleshooting

**Error 1: etcd backup restore fails — version mismatch**
```bash
# Error: etcdutl: snapshot file is from a different etcd version

# Fix: always restore using the SAME (or compatible) etcdctl version
# that created the snapshot. Document etcd version alongside every backup.
```

**Error 2: Upgrade stuck — node won't drain**
```bash
kubectl drain <node-name> --ignore-daemonsets
# error: cannot delete Pods with local storage (use --delete-emptydir-data)
# error: cannot delete Pods declared in DaemonSet (use --ignore-daemonsets)

# Fix: add the suggested flags, but UNDERSTAND what they mean:
# --delete-emptydir-data: any emptyDir-backed temp data WILL be lost
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data --force
```

**Error 3: PodDisruptionBudget blocking necessary maintenance**
```bash
kubectl drain <node-name>
# error: Cannot evict pod as it would violate the pod's disruption budget

# Diagnose:
kubectl get pdb -A
kubectl describe pdb <pdb-name>
# Check "Allowed Disruptions" — if 0, draining is blocked until
# enough replicas are healthy elsewhere first

# Fix: temporarily scale up replicas, or wait for other pods to
# become healthy before draining, or (last resort) adjust the PDB
```

### 25.7 Best Practices

- **Run a minimum of 3 control-plane nodes** in production for etcd quorum (odd numbers: 3 or 5)
- **Automate etcd backups** on a schedule, store them OFF-cluster (S3/GCS), and test restores regularly — an untested backup is not a backup
- **Use Velero** for full resource + PV backup/restore — etcd snapshots alone don't capture PV data
- **Always test disaster recovery procedures** in a non-production environment before you need them for real
- **Use PodDisruptionBudgets** to protect availability during voluntary disruptions (node drains, upgrades)
- **Spread workloads across nodes AND zones** using anti-affinity and topology spread constraints
- **Upgrade one minor version at a time** (e.g., 1.28 → 1.29 → 1.30, not 1.28 → 1.30 directly) — Kubernetes doesn't support skipping minor versions
- **Drain nodes one at a time** during upgrades, never upgrade all nodes simultaneously
- **Read release notes for EVERY version upgrade** — API deprecations and breaking changes are common
- **Consider multi-cluster architecture** for true disaster recovery (entire region failure) — single-cluster HA only protects against node/zone failures, not full cluster loss

### 25.8 Key Takeaways / Summary

- HA spans multiple layers: pod replicas → node spread → zone spread → multi-cluster/region
- etcd backups protect cluster state; Velero protects application resources AND persistent volume data — you need both
- PodDisruptionBudgets prevent voluntary disruptions (drains, upgrades) from taking down too many replicas at once
- Kubernetes upgrades must proceed one minor version at a time, with control plane upgraded before workers
- Untested disaster recovery plans are not real disaster recovery plans — schedule regular restore drills

### 25.9 Practice Questions / Tasks

1. Take an etcd snapshot from your local kubeadm cluster (or simulate the commands if using minikube), and explain the exact steps you'd take to restore it on a freshly provisioned control-plane node.
2. Install Velero with a local/MinIO backend, back up a namespace, delete it, and restore it. Document what was and wasn't restored (hint: think about PVC data).
3. Design a topology spread constraint configuration for a 9-replica Deployment that must be evenly spread across exactly 3 availability zones, never allowing more than 1 replica difference between zones.

---

## 26. Advanced Topics – CRDs, Operators, Service Mesh Basics (Istio)

### 26.1 Learning Objectives

- Understand Custom Resource Definitions (CRDs) and how they extend the Kubernetes API
- Understand the Operator pattern and why it's powerful
- Get a foundational understanding of Service Mesh concepts using Istio
- Know when these advanced tools are (and aren't) appropriate

### 26.2 Concept Explanation

### Custom Resource Definitions (CRDs)

Kubernetes ships with built-in resource types (Pod, Deployment, Service...). A **CRD** lets you define your OWN resource type, extending the Kubernetes API itself.

> **Analogy:** Kubernetes ships with a standard set of LEGO bricks (Pods, Services, Deployments). A CRD is like designing and 3D-printing your OWN custom LEGO brick shape that snaps into the same system — `kubectl` and the API server treat it just like any built-in resource.

### Operators

A CRD alone is just a data schema — it does nothing by itself. An **Operator** is a custom **controller** that watches your CRD objects and takes action to reconcile actual state with desired state — essentially encoding human operational knowledge into software.

> **Analogy:** A CRD is the order form for a custom cake ("3-tier, chocolate, 50 servings"). The Operator is the experienced baker who reads that form and knows exactly how to actually bake, assemble, and decorate the cake to match — without you needing to give step-by-step instructions.

### Service Mesh (Istio)

A **Service Mesh** adds a dedicated infrastructure layer for service-to-service communication, typically using a **sidecar proxy** pattern (Envoy) injected into every Pod. It handles:
- **Traffic management**: canary releases, traffic splitting, retries, circuit breaking
- **Security**: automatic mutual TLS (mTLS) between all services
- **Observability**: automatic metrics, logs, and traces for ALL service-to-service calls, with zero application code changes

### 26.3 Architecture / How it Works

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    CRD + OPERATOR PATTERN                                                       │
│                                                                                                 │
│  1. CRD defines a new resource type:                                                            │
│     kind: PostgresCluster                                                                       │
│                                                                                                 │
│  2. User creates a custom resource:                                                             │
│     apiVersion: postgres.example.com/v1                                                         │
│     kind: PostgresCluster                                                                       │
│     spec: {replicas: 3, version: "16"}                                                          │
│                                                                                                 │
│  3. Operator (a controller running in the cluster) WATCHES                                      │
│     for PostgresCluster objects                                                                 │
│         │                                                                                       │
│         ▼                                                                                       │
│     Operator reconciliation loop:                                                               │
│       - creates StatefulSet, Services, Secrets, ConfigMaps                                      │
│       - handles failover if the primary goes down                                               │
│       - manages backups, version upgrades                                                       │
│       - continuously ensures actual state == desired state                                      │
│                                                                                                 │
│     "I want a PostgreSQL cluster" → Operator handles ALL the                                    │
│      complex operational details automatically                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│                    SERVICE MESH (ISTIO) ARCHITECTURE                           │
│                                                                                │
│  ┌─────────────────────┐         ┌─────────────────────┐                       │
│  │  Pod: Frontend         │         │  Pod: Backend          │                 │
│  │  ┌─────────────────┐  │         │  ┌─────────────────┐  │                   │
│  │  │  App Container    │  │         │  │  App Container    │  │               │
│  │  └────────┬─────────┘  │         │  └────────┬─────────┘  │                 │
│  │           │ localhost   │         │           │ localhost   │               │
│  │  ┌────────▼─────────┐  │         │  ┌────────▼─────────┐  │                 │
│  │  │ Envoy Sidecar      │◄─┼─mTLS────┼─►│ Envoy Sidecar      │  │             │
│  │  │ Proxy (injected     │  │ encrypted│  │ Proxy (injected     │  │          │
│  │  │  automatically)      │  │         │  │  automatically)      │  │         │
│  │  └─────────────────┘  │         │  └─────────────────┘  │                   │
│  └─────────────────────┘         └─────────────────────┘                       │
│           ▲                                    ▲                               │
│           │      controlled & configured by    │                               │
│           └──────────────┬─────────────────────┘                               │
│                           ▼                                                    │
│              ┌────────────────────────┐                                        │
│              │   Istiod (Control Plane) │  ← manages all sidecar proxies       │
│              │   - traffic rules           │     pushes config, certs          │
│              │   - mTLS certificate mgmt    │                                  │
│              │   - telemetry collection      │                                 │
│              └────────────────────────┘                                        │
└────────────────────────────────────────────────────────────────────────────────┘

ALL traffic between Pods now flows through Envoy sidecars,
enabling traffic control, security, and observability with
ZERO changes to application code.
```

### 26.4 YAML Manifest / Config Example

### Custom Resource Definition (CRD)

```yaml
# crd.yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: postgresclusters.postgres.example.com
spec:
  group: postgres.example.com
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                replicas:
                  type: integer
                  minimum: 1
                version:
                  type: string
                storageSize:
                  type: string
            status:
              type: object
              properties:
                phase:
                  type: string
  scope: Namespaced
  names:
    plural: postgresclusters
    singular: postgrescluster
    kind: PostgresCluster
    shortNames:
      - pgc
```

### Custom Resource Instance (Using the CRD)

```yaml
# postgres-cluster-instance.yaml
apiVersion: postgres.example.com/v1
kind: PostgresCluster
metadata:
  name: my-database
  namespace: production
spec:
  replicas: 3
  version: "16"
  storageSize: "20Gi"
```

### Istio VirtualService (Traffic Splitting for Canary Deployment)

```yaml
# istio-virtualservice.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: my-app
spec:
  hosts:
    - my-app
  http:
    - route:
        - destination:
            host: my-app
            subset: v1
          weight: 90              # 90% of traffic to stable version
        - destination:
            host: my-app
            subset: v2
          weight: 10              # 10% of traffic to canary version
```

### Istio DestinationRule (Defines Subsets)

```yaml
# istio-destinationrule.yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: my-app
spec:
  host: my-app
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
    outlierDetection:               # circuit breaking
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
```

### Istio PeerAuthentication (Enforce mTLS)

```yaml
# istio-mtls.yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT                    # require mTLS for all traffic in namespace
```

### 26.5 Hands-on Implementation

```bash
#═══════════════════════════════════════════════
# CRD + CUSTOM RESOURCE DEMO (no operator needed to see CRD mechanics)
#═══════════════════════════════════════════════

kubectl apply -f crd.yaml
kubectl get crd postgresclusters.postgres.example.com

# Now Kubernetes treats this as a first-class resource type:
kubectl apply -f postgres-cluster-instance.yaml
kubectl get postgresclusters -n production
kubectl get pgc -n production              # shortName also works!

kubectl describe postgrescluster my-database -n production
# Note: with NO operator running, nothing actually happens beyond
# storing this object — the CRD just defines the schema.
# An Operator is what would WATCH this and create real resources.

#═══════════════════════════════════════════════
# REAL-WORLD EXAMPLE: INSTALL AN ACTUAL OPERATOR
#═══════════════════════════════════════════════

# Example: Prometheus Operator (manages Prometheus/Alertmanager CRDs)
# Already installed if you did Chapter 21's kube-prometheus-stack!
kubectl get crd | grep monitoring.coreos.com
# prometheuses.monitoring.coreos.com
# servicemonitors.monitoring.coreos.com
# prometheusrules.monitoring.coreos.com
# alertmanagers.monitoring.coreos.com

# Example: install the CloudNativePG operator (production Postgres operator)
kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/main/releases/cnpg-1.23.1.yaml

kubectl get crd | grep postgresql.cnpg.io

# Create a REAL managed Postgres cluster via the operator
cat <<EOF | kubectl apply -f -
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: my-cnpg-cluster
spec:
  instances: 3
  storage:
    size: 1Gi
EOF

kubectl get pods -l cnpg.io/cluster=my-cnpg-cluster -w
# Watch the operator automatically create a 3-node HA Postgres cluster!

#═══════════════════════════════════════════════
# INSTALL ISTIO
#═══════════════════════════════════════════════

curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH

istioctl install --set profile=demo -y

kubectl label namespace default istio-injection=enabled
# Future pods in "default" namespace automatically get Envoy sidecars injected

kubectl get pods -n istio-system
# istiod, istio-ingressgateway running

#═══════════════════════════════════════════════
# DEPLOY APP WITH AUTOMATIC SIDECAR INJECTION
#═══════════════════════════════════════════════

kubectl create deployment my-app --image=nginx:1.25
kubectl get pods -l app=my-app
# NAME                     READY   STATUS    RESTARTS   AGE
# my-app-7d9f8c6b5d-x2k9p  2/2     Running   0          10s
# Note: 2/2 containers — your app + the auto-injected Envoy sidecar!

kubectl describe pod -l app=my-app | grep -A2 "Containers:"
# Shows: my-app AND istio-proxy containers

#═══════════════════════════════════════════════
# APPLY TRAFFIC SPLITTING (CANARY)
#═══════════════════════════════════════════════

kubectl apply -f istio-destinationrule.yaml
kubectl apply -f istio-virtualservice.yaml

# Generate traffic and observe the 90/10 split using Istio's
# observability tools (Kiali, Grafana — installed via demo profile)
istioctl dashboard kiali
# Visualize the live service mesh traffic graph

#═══════════════════════════════════════════════
# VERIFY mTLS
#═══════════════════════════════════════════════

kubectl apply -f istio-mtls.yaml
istioctl authn tls-check my-app.default.svc.cluster.local
# Confirms mTLS status between services

#═══════════════════════════════════════════════
# CLEANUP
#═══════════════════════════════════════════════

kubectl delete -f postgres-cluster-instance.yaml
kubectl delete -f crd.yaml
kubectl delete cluster my-cnpg-cluster
istioctl uninstall --purge -y
kubectl delete namespace istio-system
kubectl label namespace default istio-injection-
```

### 26.6 Common Errors & Troubleshooting

**Error 1: Custom Resource created but "nothing happens"**
```bash
kubectl get postgresclusters -n production
# Object exists, but no Pods/Services created

# Cause: this is EXPECTED if you only installed the CRD, not an actual Operator
# A CRD defines the schema; an Operator provides the BEHAVIOR
# Fix: deploy the actual Operator controller that watches this CRD
```

**Error 2: Istio sidecar not injected**
```bash
kubectl get pods -l app=my-app
# READY shows 1/1, not 2/2 (no sidecar)

# Cause: namespace not labeled for injection, OR pod was created BEFORE labeling
kubectl get namespace default --show-labels
# Check for istio-injection=enabled

# Fix: label namespace, then restart existing pods (label doesn't retroactively inject)
kubectl label namespace default istio-injection=enabled
kubectl rollout restart deployment my-app
```

**Error 3: Operator stuck in reconciliation loop / CrashLoopBackOff**
```bash
kubectl logs -n <operator-namespace> deploy/<operator-name>
# Look for reconciliation errors — often RBAC permission issues
# (operators need broad permissions to manage the resources they create)

kubectl describe clusterrole <operator-clusterrole>
# Verify it has permissions for ALL resource types the operator needs to manage
```

### 26.7 Best Practices

- **Don't build custom Operators unless you have a genuine, recurring operational pattern** to encode — for one-off needs, plain manifests/Helm are simpler and easier to maintain
- **Prefer well-established Operators** (Prometheus Operator, CloudNativePG, Strimzi for Kafka, ECK for Elasticsearch) over building your own for common technologies
- **Evaluate service mesh complexity vs benefit carefully** — Istio adds real operational overhead (resource consumption, learning curve, debugging complexity); don't adopt it just because it's trendy
- **Start with Istio's "demo" profile only for learning** — production profiles require careful resource and security tuning
- **Use service mesh primarily when you have genuine multi-service complexity** — dozens of microservices needing consistent mTLS, traffic management, and observability
- **For smaller clusters/simpler architectures**, Kubernetes-native features (NetworkPolicy, Ingress, basic retries in app code) may be sufficient without a full service mesh
- **Monitor the Operator/control plane itself** — Istio's istiod and any custom operators are critical infrastructure that need their own observability

### 26.8 Key Takeaways / Summary

- CRDs extend the Kubernetes API with custom resource types; Operators provide the controller logic that acts on them
- The Operator pattern encodes human operational expertise into automated, self-healing software
- Service meshes (Istio) use sidecar proxies (Envoy) to provide traffic management, mTLS security, and observability without application code changes
- These are genuinely advanced tools — evaluate real operational need before adopting, as they add meaningful complexity
- Prefer established, community-maintained Operators over building custom ones for common technologies (databases, message queues, monitoring)

### 26.9 Practice Questions / Tasks

1. Create a simple CRD for a fictional `WebApp` resource type with fields for `image`, `replicas`, and `domain`. Apply a custom resource instance and verify it appears in `kubectl get webapps`. Explain why nothing else happens without an Operator.
2. Install Istio in demo mode, deploy a simple app, and verify the Envoy sidecar gets injected. Use `istioctl dashboard kiali` to visualize traffic.
3. Compare and contrast: when would you choose a Kubernetes Operator vs a Helm chart vs a plain set of YAML manifests for deploying a stateful application? Give a decision framework.

