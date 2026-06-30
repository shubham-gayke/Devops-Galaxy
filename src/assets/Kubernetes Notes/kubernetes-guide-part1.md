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

# Chapter 1: Introduction to Kubernetes & Container Orchestration

## 1. Learning Objectives

- Understand what container orchestration is and why it's needed
- Know the history of Kubernetes and its origin at Google
- Compare Kubernetes vs Docker Swarm
- Understand where Kubernetes fits in the modern DevOps landscape

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

_(No manifest needed for Chapter 1 — concepts only. First manifest appears in Chapter 5.)_

## 5. Hands-on Implementation

No cluster setup yet. Try this thought exercise:

```bash
# Mental model: Think of Kubernetes as an OS for your data center
# - Containers are processes
# - Nodes are CPUs
# - The Scheduler is the OS kernel (deciding which CPU runs which process)
# - kubectl is your shell (like bash, but for the cluster)
```

## 6. Common Errors & Troubleshooting

**Misconception 1:** "Kubernetes replaces Docker"
- **Reality:** Kubernetes orchestrates containers. Docker (or containerd) still builds and runs them. They're complementary.

**Misconception 2:** "I need Kubernetes for every app"
- **Reality:** A single-service app with 1–2 instances doesn't need K8s. The overhead is significant. Start with K8s when you have multiple services or need auto-scaling.

**Misconception 3:** "Docker Swarm is good enough"
- **Reality:** For production in 2024+, K8s is the industry standard. Job postings, tooling, and cloud support all favor K8s.

## 7. Best Practices

- Learn Docker thoroughly before Kubernetes (build, run, volumes, networks)
- Start with `minikube` or `kind` locally — don't jump to cloud clusters first
- Understand that K8s is declarative (you describe desired state; K8s figures out how)
- Don't try to memorize everything — understand the concepts first

## 8. Key Takeaways / Summary

- Kubernetes is a container **orchestration** platform, not a replacement for Docker
- It was created by Google (based on Borg) and donated to CNCF in 2015
- K8s handles deployment, scaling, healing, load balancing, and config management
- Kubernetes has won the orchestration wars — Docker Swarm is legacy
- K8s is both production-critical infrastructure AND in-demand job skill

## 9. Practice Questions / Tasks

1. **Conceptual:** What are 4 things Kubernetes does that plain Docker cannot?
2. **Research:** Find 3 companies publicly known to use Kubernetes in production. What scale do they run?
3. **Comparison:** List 3 reasons someone would choose Kubernetes over Docker Swarm today.

---

# Chapter 2: Kubernetes Architecture Deep Dive

## 1. Learning Objectives

- Understand the two-tier structure: Control Plane vs Worker Nodes
- Know the role of each component: etcd, API server, Scheduler, Controller Manager, kubelet, kube-proxy
- Understand how a `kubectl apply` command flows through the system
- Be able to explain architecture in a CKA/CKAD interview

## 2. Concept Explanation

Kubernetes follows a **master-worker** (now called **control plane–worker node**) architecture.

Think of it like a restaurant:
- **Control Plane** = Restaurant manager — takes orders, decides who does what, tracks everything
- **Worker Nodes** = Kitchen staff — actually cook the food (run containers)
- **etcd** = The order book — the single source of truth
- **Scheduler** = Host seating guests — decides which table (node) each order (pod) goes to
- **kubelet** = Line cook — gets instructions and does the actual cooking (runs containers)

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Always back up etcd** before any cluster upgrades or major changes (`etcdctl snapshot save`)
- Run the **control plane in HA mode** (3 or 5 etcd nodes) for production
- **Never run workloads on control plane nodes** (use taints to prevent it)
- Monitor **kube-apiserver latency** — it's the critical path for everything
- **Limit direct etcd access** — only the API server should talk to it
- Keep **kube-controller-manager and kube-scheduler** as multiple replicas with leader election

## 8. Key Takeaways / Summary

- Kubernetes has two tiers: **Control Plane** (brain) and **Worker Nodes** (muscle)
- **etcd** is the single source of truth — protect it like your life
- **API server** is the only entry point — all components talk through it
- **kubelet** on each node actually runs containers using the container runtime
- Every `kubectl` command translates to an API server call → etcd read/write → controller reconciliation

## 9. Practice Questions / Tasks

1. **Draw from memory:** Sketch the K8s architecture diagram with all 6 core components and their connections
2. **Trace a request:** Walk through every step that happens when you run `kubectl delete pod my-pod`
3. **Component quiz:** What happens if the scheduler goes down? What happens if etcd goes down?

---

# Chapter 3: Setting Up a Cluster

## 1. Learning Objectives

- Set up a local Kubernetes cluster using minikube and kind
- Understand kubeadm for production-style clusters
- Know the difference between local clusters and managed cloud services
- Configure kubectl to connect to your cluster

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Use minikube** for daily development and learning
- **Use kind** in CI pipelines (faster, Docker-based, no VMs)
- **Use kubeadm** to practice for CKA exam — the exam uses kubeadm-based clusters
- Always specify the **Kubernetes version** when creating clusters for reproducibility
- For production, use **managed services** (EKS/GKE/AKS) — let the cloud handle the control plane
- **Never run production workloads on minikube**

## 8. Key Takeaways / Summary

- minikube and kind are the best local options — start with minikube
- kubeadm is the standard way to bootstrap production clusters
- Cloud-managed services (EKS/GKE/AKS) abstract away control plane management
- kubectl is configured via `~/.kube/config` (the kubeconfig file)
- All tools ultimately give you the same Kubernetes API

## 9. Practice Questions / Tasks

1. Set up a 3-node kind cluster using a config file and verify all nodes are Ready
2. Use `kubectl config get-contexts` to see all your clusters. Switch between them using `kubectl config use-context`
3. Find the kubeconfig file location. What information does it contain? (hint: `cat ~/.kube/config`)

---

# Chapter 4: kubectl Fundamentals & Cluster Interaction

## 1. Learning Objectives

- Master the kubectl command structure and key subcommands
- Use imperative and declarative approaches
- Navigate cluster resources, namespaces, and output formats
- Use kubectl efficiently (autocomplete, aliases, dry-run)

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Always use `--dry-run=client -o yaml`** before applying to preview the manifest
- **Set namespace aliases** in your shell for frequent namespaces
- **Use `kubectl explain`** to discover fields — don't memorize all YAML fields
- **Never use `kubectl delete pod --all` in production** without confirming the namespace
- **Use `kubectl diff -f manifest.yaml`** to see what would change before applying
- For CKA exam: memorize `kubectl create deployment`, `kubectl expose`, `kubectl run` with `--dry-run=client -o yaml`

## 8. Key Takeaways / Summary

- kubectl follows: `kubectl [command] [type] [name] [flags]`
- Use `--dry-run=client -o yaml` to generate YAML templates quickly
- `kubectl apply` (declarative) is preferred for production; imperative is fine for quick testing
- `describe`, `logs`, `exec` are your primary debugging tools
- Configure autocomplete and `k` alias for speed (essential for CKA exam)

## 9. Practice Questions / Tasks

1. Generate a YAML file for a pod running `redis:7` named `cache` with label `tier=cache`, without creating it
2. Get the IP address of the minikube node using only `kubectl` and `jsonpath`
3. Run an `nginx` pod, port-forward port 8080 to its port 80, and access it via `curl localhost:8080`

---

# Chapter 5: Pods – The Basic Building Block

## 1. Learning Objectives

- Understand what a Pod is and why it's the fundamental unit in Kubernetes
- Know the difference between single-container and multi-container pods
- Understand init containers, sidecar patterns, and pod lifecycle
- Create, inspect, and manage pods

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Don't deploy bare Pods in production** — use Deployments which manage pod lifecycle
- **Always set resource `requests` and `limits`** — prevents one pod from starving others
- **Use init containers** for setup tasks (downloading config, waiting for dependencies)
- **Keep pods focused** — one main process per container, use sidecars for auxiliary tasks
- **Never use `latest` tag** — always pin specific image versions (e.g., `nginx:1.25.3`)
- **Use meaningful labels** — they're essential for Services, selectors, and network policies
- Pods should be **stateless** where possible — store state in external databases or PVCs

## 8. Key Takeaways / Summary

- A Pod is the smallest deployable unit in Kubernetes, not a container
- All containers in a Pod share network (same IP) and can share volumes
- Pods are ephemeral — Deployments are needed for self-healing
- Init containers run and complete before main containers start
- Multi-container pods follow sidecar, ambassador, or adapter patterns
- `kubectl describe` and `kubectl logs` are your first debugging tools

## 9. Practice Questions / Tasks

1. Create a pod named `web` running `httpd:2.4` with a label `app=web`. Verify it's running and check its IP address.
2. Create a multi-container pod where an init container writes "Hello from init" to a file in a shared volume, and the main container (`busybox`) reads and prints that file every 10 seconds.
3. A pod is in `CrashLoopBackOff`. List 5 steps you would take to diagnose the issue.
