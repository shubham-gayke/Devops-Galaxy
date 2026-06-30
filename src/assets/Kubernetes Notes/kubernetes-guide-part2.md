# Chapter 6: ReplicaSets & Deployments

## 1. Learning Objectives

- Understand why bare Pods aren't enough and how ReplicaSets fix that
- Master Deployments: rolling updates, rollbacks, and scaling
- Understand the relationship Deployment → ReplicaSet → Pod
- Perform zero-downtime updates in a real cluster

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Always set `maxUnavailable: 0`** for zero-downtime updates on critical services (requires `maxSurge` ≥ 1)
- **Always add readiness probes** — without them, Kubernetes can't tell when a new pod is truly ready, breaking rolling updates
- **Use `--record` or annotate change-cause** for audit trail (helps rollback decisions)
- **Set `revisionHistoryLimit`** to avoid accumulating too many old ReplicaSets (default is 10)
- **Never edit ReplicaSets directly** — always go through the Deployment
- **Test rollouts in staging first** — use `kubectl rollout pause` for manual canary verification
- Pin image tags — never use `:latest` in production Deployments

## 8. Key Takeaways / Summary

- ReplicaSets ensure N pods are always running; Deployments manage ReplicaSets and add rollout features
- Deployment → ReplicaSet → Pod is the management hierarchy
- `kubectl set image`, `kubectl rollout undo`, and `kubectl scale` are core daily commands
- RollingUpdate is the default strategy and supports zero-downtime deployments with proper probe configuration
- Deployment selectors are immutable — plan your labels carefully upfront

## 9. Practice Questions / Tasks

1. Create a Deployment with 4 replicas of `httpd:2.4`. Update it to `httpd:2.4.58` using a rolling update with `maxSurge=1, maxUnavailable=0`. Watch the rollout.
2. Intentionally deploy a broken image (e.g., `nginx:doesnotexist`) and practice detecting the failure and rolling back.
3. What's the difference between scaling a Deployment to 0 replicas vs deleting it? When would you use each?

---

# Chapter 7: Services & Basic Networking

## 1. Learning Objectives

- Understand why Pod IPs are unreliable and how Services solve this
- Master the 4 Service types: ClusterIP, NodePort, LoadBalancer, ExternalName
- Understand the Kubernetes networking model and DNS
- Configure and test service discovery

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Use ClusterIP + Ingress** for HTTP/HTTPS traffic instead of multiple LoadBalancers (cost-saving)
- **Use NodePort only for dev/test** — not recommended for production external access
- **Name your ports** when using multiple ports per Service (`name: http`, `name: metrics`)
- **Always verify Endpoints** after creating a Service — empty endpoints means broken selectors
- **Use `targetPort` as a name** (not just number) referencing the container's named port — survives port changes
- For production cloud, **prefer LoadBalancer with Ingress** for cost-effective routing of multiple services

## 8. Key Takeaways / Summary

- Services provide stable networking for ephemeral Pods via label selectors
- ClusterIP (internal) → NodePort (dev external) → LoadBalancer (cloud production) → ExternalName (external DNS alias)
- kube-proxy implements Services using iptables/IPVS rules on every node
- CoreDNS provides automatic DNS names: `service.namespace.svc.cluster.local`
- Always check `kubectl get endpoints` when a Service "isn't working" — it's almost always a selector mismatch

## 9. Practice Questions / Tasks

1. Create a Deployment with 3 nginx replicas and a ClusterIP Service. Verify load balancing by checking which pod responds across multiple curl requests (hint: use a custom index.html per pod, or check hostname header).
2. Create a NodePort service and access it via the minikube IP. What port range is allowed for NodePort by default?
3. Deliberately break a Service by mismatching the selector. Use `kubectl describe svc` and `kubectl get endpoints` to diagnose and fix it.

---

# Chapter 8: ConfigMaps & Secrets

## 1. Learning Objectives

- Separate configuration from container images using ConfigMaps
- Securely manage sensitive data using Secrets
- Understand the different ways to consume ConfigMaps/Secrets (env vars, volumes)
- Know the security limitations of Secrets and how to address them

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Never commit Secrets to Git** in plaintext — use Sealed Secrets, External Secrets Operator, or Vault
- **Enable encryption at rest** for etcd in production clusters (`EncryptionConfiguration`)
- **Use `stringData`** when authoring Secrets manually — avoids manual base64 errors
- **Set `defaultMode: 0400`** on secret volumes to restrict read access
- **Use separate ConfigMaps per environment** (dev/staging/prod) rather than one giant config
- **Avoid `subPath`** mounts when you need live-reloading config
- **Limit Secret access via RBAC** — not every service account needs to read every secret
- Consider a **dedicated secrets manager** (HashiCorp Vault, AWS Secrets Manager, Sealed Secrets) for production

## 8. Key Takeaways / Summary

- ConfigMaps hold non-sensitive config; Secrets hold sensitive data (but only base64-encoded, NOT encrypted by default)
- Both can be consumed as environment variables (static, requires restart) or volume mounts (auto-updates ~60s)
- `envFrom` injects all keys; `valueFrom` injects specific keys
- Secrets need additional protection: RBAC, encryption at rest, and ideally an external secrets manager
- `kubectl create configmap/secret --from-literal/--from-file` are the fastest creation methods

## 9. Practice Questions / Tasks

1. Create a ConfigMap from a `.properties` file with 3 key-value pairs, mount it into a pod, and verify the contents at the mount path.
2. Create a Secret with a database password, consume it as an environment variable, and verify `kubectl describe secret` does NOT show the plaintext value.
3. Explain why Secrets are not "secure" by default and list 3 things you'd add in production to make them genuinely secure.

---

# Chapter 9: Volumes, Persistent Volumes (PV), Persistent Volume Claims (PVC), StorageClasses

## 1. Learning Objectives

- Understand the problem of ephemeral container storage
- Differentiate emptyDir, hostPath, PV, and PVC
- Understand the PV/PVC/StorageClass relationship and dynamic provisioning
- Deploy a stateful application with persistent storage

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Never use `hostPath` in production** — it's node-specific and breaks if the pod reschedules
- **Use dynamic provisioning** (StorageClass + PVC) over manual PV creation
- **Set `reclaimPolicy: Retain`** for critical data (databases) to prevent accidental deletion
- **Use `WaitForFirstConsumer`** binding mode to avoid zone/node scheduling conflicts
- **Right-size your PVCs** — resizing is supported (`allowVolumeExpansion: true`) but shrinking is NOT supported
- **Take regular snapshots** of PVs for critical data (via VolumeSnapshot API or cloud-native backup tools)
- **Match access modes to your workload** — most cloud block storage only supports RWO

## 8. Key Takeaways / Summary

- Container filesystems are ephemeral; use `emptyDir` for temp data, PV/PVC for persistent data
- PVC = the request ("I need X storage"), PV = the actual storage resource, StorageClass = how it's provisioned
- Dynamic provisioning (StorageClass + PVC) is the modern standard over manual PV creation
- PVs survive Pod deletion — perfect for databases and stateful workloads
- `reclaimPolicy` determines what happens to underlying storage when a PVC is deleted (`Delete` vs `Retain`)

## 9. Practice Questions / Tasks

1. Create a PVC requesting 2Gi of storage, mount it into a pod, write a file, delete the pod, recreate it, and verify the file still exists.
2. What's the difference between `accessModes: ReadWriteOnce` and `ReadWriteMany`? Give a real-world example of when you'd need RWX.
3. A PVC is stuck in `Pending` state. List the 3 most likely causes and how you'd check each one.

---

# Chapter 10: Namespaces, ResourceQuotas & LimitRanges

## 1. Learning Objectives

- Understand namespaces as a way to logically partition a cluster
- Apply ResourceQuotas to limit aggregate resource consumption
- Apply LimitRanges to set default/min/max resources per pod/container
- Design multi-tenant cluster resource governance

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Namespace per team/environment**, not per microservice (avoid namespace sprawl)
- **Always pair ResourceQuota with LimitRange** — quota alone forces every pod author to specify requests/limits manually
- **Set `count/` quotas** on objects (deployments, secrets, services) to prevent resource exhaustion attacks
- **Reserve `kube-system` for system use only** — never deploy app workloads there
- **Use labels on namespaces** for organization and NetworkPolicy targeting
- **Audit quota usage regularly** — `kubectl describe resourcequota` across all namespaces
- Combine with **RBAC** to enforce true multi-tenancy (Chapter 18)

## 8. Key Takeaways / Summary

- Namespaces provide logical isolation for names, RBAC, and quotas — NOT network isolation by default
- ResourceQuota caps total resource consumption (CPU/memory/object counts) in a namespace
- LimitRange sets per-pod/container defaults, minimums, and maximums
- Without a LimitRange, ResourceQuota forces every workload to explicitly declare requests/limits
- `kubectl config set-context --current --namespace=X` saves typing `-n X` repeatedly

## 9. Practice Questions / Tasks

1. Create a namespace `staging` with a ResourceQuota of 4 CPU / 8Gi memory and a LimitRange with default requests of 200m CPU / 256Mi memory. Deploy 3 pods and verify defaults are applied.
2. Try to exceed the quota you just created. What error message do you get? How would you diagnose this in a real incident?
3. What's the difference between `requests.cpu` and `limits.cpu` in a ResourceQuota spec? Why track both separately?
