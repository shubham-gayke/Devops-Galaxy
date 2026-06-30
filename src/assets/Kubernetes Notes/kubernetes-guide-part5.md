# Chapter 21: Monitoring & Logging (Prometheus, Grafana, EFK/ELK Stack Overview)

## 1. Learning Objectives

- Understand the three pillars of observability: metrics, logs, traces
- Set up Prometheus and Grafana for cluster and application monitoring
- Understand the EFK/ELK stack for centralized logging
- Write basic PromQL queries and create alerts

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Use the `kube-prometheus-stack` Helm chart** rather than building Prometheus from scratch — it bundles sensible defaults, dashboards, and alert rules
- **Set retention policies** appropriately (Prometheus default storage isn't infinite) — typically 7-30 days locally, longer-term storage via Thanos/Cortex/Mimir for historical data
- **Always alert on symptoms, not just causes** — e.g., alert on "error rate too high" (symptom) in addition to "pod restarted" (cause)
- **Use labels consistently** across apps so dashboards and alerts can be templated/reused
- **Centralize logs** — never rely on `kubectl logs` alone in production; logs disappear when pods are deleted
- **Set up Alertmanager routing** to the right team/channel (Slack, PagerDuty) — alerts nobody sees are useless
- **Monitor the monitoring stack itself** — Prometheus and Elasticsearch can run out of disk/memory too

## 8. Key Takeaways / Summary

- Observability has three pillars: metrics (Prometheus/Grafana), logs (EFK/ELK/Loki), and traces (Jaeger/OpenTelemetry)
- Prometheus pulls/scrapes metrics; Grafana visualizes them; Alertmanager routes alerts
- EFK/ELK centralizes logs since Pod-local logs disappear when Pods die
- `kube-prometheus-stack` is the standard Helm chart for getting a full monitoring stack running quickly
- Always centralize logs and metrics — `kubectl logs`/`kubectl top` alone aren't sufficient for production

## 9. Practice Questions / Tasks

1. Install `kube-prometheus-stack` via Helm and access the Grafana dashboard. Find the "Kubernetes / Compute Resources / Namespace" dashboard and identify your highest CPU-consuming pod.
2. Write a PromQL query to show the rate of pod restarts over the last 30 minutes across the cluster.
3. Explain why centralized logging (EFK/Loki) is essential in Kubernetes but might be optional on a traditional single-server deployment.

---

# Chapter 22: Kubernetes Security Best Practices

## 1. Learning Objectives

- Understand the 4 C's of Cloud Native Security
- Apply Pod Security Standards (PSS) / Pod Security Admission
- Scan images for vulnerabilities and manage supply chain security
- Implement defense-in-depth across the cluster

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

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

## 8. Key Takeaways / Summary

- Security spans 4 layers: Cloud, Cluster, Container, Code — weaknesses anywhere can compromise the whole system
- Pod Security Standards (Privileged/Baseline/Restricted) replaced the deprecated PodSecurityPolicy
- Image scanning (Trivy/Grype) should be a mandatory CI/CD gate, not an afterthought
- Defense-in-depth means combining RBAC + NetworkPolicy + SecurityContext + PSS + image scanning — no single control is sufficient alone
- Regular audits (`kube-bench`, RBAC reviews) catch drift from your intended security posture over time

## 9. Practice Questions / Tasks

1. Create a namespace enforcing the "restricted" Pod Security Standard, then attempt to deploy both a compliant and non-compliant pod. Document the exact error message for the rejected one.
2. Run Trivy against 3 different public images (e.g., `nginx:1.25`, `python:3.9`, `node:18`) and compare their vulnerability counts. What patterns do you notice about image size vs vulnerability count?
3. Explain the "4 C's of Cloud Native Security" in your own words with one concrete example of a control at each layer.

---

# Chapter 23: CI/CD Integration with Kubernetes

## 1. Learning Objectives

- Understand GitOps vs traditional push-based CI/CD for Kubernetes
- Build a basic CI/CD pipeline that builds, tests, and deploys to K8s
- Understand the role of container registries in the pipeline
- Know the basics of ArgoCD/Flux for GitOps

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Tag images with immutable identifiers** (git commit SHA), never deploy `:latest` to production
- **Always scan images in CI** before pushing to a registry — fail the build on critical CVEs
- **Use `--atomic` with Helm** (or equivalent) so failed deployments automatically rollback
- **Verify rollout status explicitly** in your pipeline — don't assume `kubectl apply` succeeding means the app is healthy
- **Prefer GitOps (ArgoCD/Flux) for production** — provides audit trail, drift detection, and removes the need to give CI direct cluster credentials
- **Separate build and deploy permissions** — CI builds/pushes images; GitOps operator (with its own scoped RBAC inside the cluster) handles deployment
- **Use staging environments** that mirror production for pipeline validation before promoting to prod
- **Implement automated smoke tests** post-deployment to catch issues before declaring success

## 8. Key Takeaways / Summary

- Push-based CI/CD directly applies changes; GitOps (pull-based) uses an in-cluster operator that syncs from Git
- A typical pipeline: build → test → scan → push to registry → deploy → verify rollout
- ArgoCD and Flux are the leading GitOps tools, offering automated sync, drift detection, and self-healing
- Always verify rollout success explicitly in pipelines — don't assume `kubectl apply` succeeding means healthy deployment
- GitOps improves security posture by removing the need for CI pipelines to hold direct cluster credentials

## 9. Practice Questions / Tasks

1. Build a simple GitHub Actions (or GitLab CI) pipeline that builds a Docker image, scans it with Trivy, and deploys it to your local minikube cluster using `kubectl set image`.
2. Install ArgoCD locally and connect it to a public Git repo containing Kubernetes manifests. Observe how it automatically syncs and what happens when you manually edit a resource it manages (`selfHeal`).
3. Explain 2 security advantages of GitOps (pull-based) over traditional push-based CI/CD for production Kubernetes deployments.

---

# Chapter 24: Troubleshooting & Debugging Real Cluster Issues

## 1. Learning Objectives

- Build a systematic troubleshooting methodology for Kubernetes issues
- Master the diagnostic command toolkit
- Debug common failure scenarios: scheduling, networking, storage, application-level
- Practice root cause analysis under time pressure (exam-relevant)

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Always check `kubectl get events` first** — sorted by timestamp, it's often the fastest path to root cause
- **Read the FULL `kubectl describe` output**, not just the top — Events section at the bottom usually has the answer
- **Use `kubectl logs --previous`** when debugging CrashLoopBackOff — current logs may be empty if the container just restarted
- **Build a personal troubleshooting checklist/runbook** based on the funnel approach (cluster → namespace → pod → container → network → storage)
- **Use ephemeral debug containers** (`kubectl debug`) for distroless/minimal images that lack a shell
- **Reproduce issues in a non-production environment** when possible before touching production
- **Document incidents and root causes** — recurring issues often share root causes (e.g., systematically under-provisioned resource requests)
- For CKA/CKAD exam: **practice diagnosing broken clusters under time pressure** — speed matters as much as accuracy

## 8. Key Takeaways / Summary

- Troubleshoot in layers: cluster → namespace → pod → container → network → storage
- `kubectl describe` and `kubectl get events` are your fastest diagnostic tools — always check these FIRST
- `kubectl logs --previous` reveals crash causes that current logs might miss
- Empty Service `Endpoints` almost always means a label selector mismatch
- Build and refine a personal troubleshooting runbook — systematic beats random guessing every time

## 9. Practice Questions / Tasks

1. Deliberately misconfigure a Deployment's resource requests to exceed available cluster capacity. Use the troubleshooting funnel to diagnose and fix it, documenting each command you ran.
2. Create a Service with a deliberately wrong selector. Use only `kubectl` commands (no guessing) to identify and fix the root cause.
3. Simulate an OOMKilled scenario by setting an artificially low memory limit on a memory-intensive container. Document the exact sequence of commands you'd use to diagnose this in a real incident.

---

# Chapter 25: Production Best Practices (Multi-Cluster, Disaster Recovery, Upgrades)

## 1. Learning Objectives

- Design for high availability across nodes, zones, and clusters
- Implement backup and disaster recovery strategies
- Plan and execute safe Kubernetes version upgrades
- Understand multi-cluster strategies and when they're needed

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

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

## 8. Key Takeaways / Summary

- HA spans multiple layers: pod replicas → node spread → zone spread → multi-cluster/region
- etcd backups protect cluster state; Velero protects application resources AND persistent volume data — you need both
- PodDisruptionBudgets prevent voluntary disruptions (drains, upgrades) from taking down too many replicas at once
- Kubernetes upgrades must proceed one minor version at a time, with control plane upgraded before workers
- Untested disaster recovery plans are not real disaster recovery plans — schedule regular restore drills

## 9. Practice Questions / Tasks

1. Take an etcd snapshot from your local kubeadm cluster (or simulate the commands if using minikube), and explain the exact steps you'd take to restore it on a freshly provisioned control-plane node.
2. Install Velero with a local/MinIO backend, back up a namespace, delete it, and restore it. Document what was and wasn't restored (hint: think about PVC data).
3. Design a topology spread constraint configuration for a 9-replica Deployment that must be evenly spread across exactly 3 availability zones, never allowing more than 1 replica difference between zones.

---

# Chapter 26: Advanced Topics – CRDs, Operators, Service Mesh Basics (Istio)

## 1. Learning Objectives

- Understand Custom Resource Definitions (CRDs) and how they extend the Kubernetes API
- Understand the Operator pattern and why it's powerful
- Get a foundational understanding of Service Mesh concepts using Istio
- Know when these advanced tools are (and aren't) appropriate

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Don't build custom Operators unless you have a genuine, recurring operational pattern** to encode — for one-off needs, plain manifests/Helm are simpler and easier to maintain
- **Prefer well-established Operators** (Prometheus Operator, CloudNativePG, Strimzi for Kafka, ECK for Elasticsearch) over building your own for common technologies
- **Evaluate service mesh complexity vs benefit carefully** — Istio adds real operational overhead (resource consumption, learning curve, debugging complexity); don't adopt it just because it's trendy
- **Start with Istio's "demo" profile only for learning** — production profiles require careful resource and security tuning
- **Use service mesh primarily when you have genuine multi-service complexity** — dozens of microservices needing consistent mTLS, traffic management, and observability
- **For smaller clusters/simpler architectures**, Kubernetes-native features (NetworkPolicy, Ingress, basic retries in app code) may be sufficient without a full service mesh
- **Monitor the Operator/control plane itself** — Istio's istiod and any custom operators are critical infrastructure that need their own observability

## 8. Key Takeaways / Summary

- CRDs extend the Kubernetes API with custom resource types; Operators provide the controller logic that acts on them
- The Operator pattern encodes human operational expertise into automated, self-healing software
- Service meshes (Istio) use sidecar proxies (Envoy) to provide traffic management, mTLS security, and observability without application code changes
- These are genuinely advanced tools — evaluate real operational need before adopting, as they add meaningful complexity
- Prefer established, community-maintained Operators over building custom ones for common technologies (databases, message queues, monitoring)

## 9. Practice Questions / Tasks

1. Create a simple CRD for a fictional `WebApp` resource type with fields for `image`, `replicas`, and `domain`. Apply a custom resource instance and verify it appears in `kubectl get webapps`. Explain why nothing else happens without an Operator.
2. Install Istio in demo mode, deploy a simple app, and verify the Envoy sidecar gets injected. Use `istioctl dashboard kiali` to visualize traffic.
3. Compare and contrast: when would you choose a Kubernetes Operator vs a Helm chart vs a plain set of YAML manifests for deploying a stateful application? Give a decision framework.
