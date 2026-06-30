# Chapter 11: Labels, Selectors, Annotations

## 1. Learning Objectives

- Understand the role of labels as the "glue" connecting Kubernetes objects
- Master label selectors (equality-based and set-based)
- Differentiate labels from annotations and know when to use each
- Use labels effectively for organizing and querying resources

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

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

## 8. Key Takeaways / Summary

- Labels are for **selection** (used by Services, Deployments, NetworkPolicies); annotations are for **information**
- Selectors come in two flavors: equality-based (`key=value`) and set-based (`key in (v1,v2)`)
- Service-to-Pod and Deployment-to-Pod relationships are ALL powered by label matching, not names
- A mismatched label/selector is the most common cause of "my Service isn't working" issues
- Adopt the `app.kubernetes.io/*` recommended label conventions for consistency across tools

## 9. Practice Questions / Tasks

1. Create 3 pods with different combinations of `env` and `tier` labels. Write `kubectl` selector queries to: (a) get all production pods, (b) get all frontend OR backend pods, (c) get pods that do NOT have a `tier` label.
2. Explain why a Deployment's `spec.selector` must be a subset of `spec.template.metadata.labels`. What happens if they don't match?
3. Design a labeling scheme for a 3-tier app (frontend, backend, database) across 3 environments (dev, staging, prod). Show example label sets for each component.

---

# Chapter 12: Health Checks – Liveness, Readiness, Startup Probes

## 1. Learning Objectives

- Understand why Kubernetes needs to know if your app is actually healthy
- Master the 3 probe types: liveness, readiness, startup
- Configure HTTP, TCP, exec, and gRPC probes
- Avoid common probe misconfigurations that cause outages

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Always set a startupProbe for slow-starting apps** (Java/Spring Boot, .NET, apps doing migrations)
- **Keep liveness probes simple** — only check if the process itself is responsive, NOT external dependencies (avoid cascading restarts)
- **Make readiness probes check real dependencies** — DB connections, cache availability, downstream service health
- **Never make liveness and readiness identical** — they serve different purposes
- **Set realistic `failureThreshold` and `periodSeconds`** — too aggressive causes false-positive restarts; too lenient delays detection of real issues
- **Always implement a dedicated `/healthz` (liveness) and `/ready` (readiness) endpoint** in your application — don't just probe `/` 
- **Use `tcpSocket` for non-HTTP services** (databases, message queues) when no HTTP health endpoint exists

## 8. Key Takeaways / Summary

- Liveness probe failure → **container restart**; Readiness probe failure → **removed from Service endpoints** (no restart)
- Startup probe delays liveness/readiness checks until slow-starting apps finish booting
- Probes support `httpGet`, `tcpSocket`, `exec`, and `grpc` mechanisms
- Liveness should be simple (self-check only); readiness should check actual dependencies
- Misconfigured probes are one of the **most common causes of production outages** — test thoroughly before deploying

## 9. Practice Questions / Tasks

1. Deploy a pod with a deliberately too-short `livenessProbe timeoutSeconds` causing it to crash-loop. Diagnose the issue using `kubectl describe` and fix it.
2. Explain the real-world scenario where a readiness probe should fail but a liveness probe should still pass. Why does this distinction matter for production stability?
3. Design probes (with reasoning for each setting) for a Spring Boot Java app that takes ~60 seconds to start and connects to a PostgreSQL database.

---

# Chapter 13: Jobs & CronJobs

## 1. Learning Objectives

- Understand when to use Jobs vs Deployments
- Run one-off and parallel batch workloads with Jobs
- Schedule recurring tasks with CronJobs
- Configure retry behavior, parallelism, and completion tracking

## 2. Concept Explanation

Deployments are for **long-running** services (web servers, APIs) that should always be up. But what about tasks that **run to completion and stop** — database migrations, batch processing, report generation, backups?

That's what **Jobs** are for.

> **Analogy:** A Deployment is like a 24/7 staffed reception desk — always someone there. A Job is like hiring a contractor to paint a room — once it's done, they leave; you don't need them running forever. A CronJob is hiring that same contractor on a recurring schedule (e.g., "repaint every Monday").

### Job
Runs Pod(s) until a specified number of them **successfully complete**. If a Pod fails, the Job can retry it (based on `backoffLimit`).

### CronJob
Creates Jobs on a **recurring schedule**, using cron syntax (`* * * * *`).

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Always set `backoffLimit`** to avoid infinite retries on a permanently broken Job
- **Set `activeDeadlineSeconds`** to prevent runaway/stuck jobs from running forever
- **Set `ttlSecondsAfterFinished`** to auto-cleanup completed Jobs (avoid clutter)
- **Use `concurrencyPolicy: Forbid`** for CronJobs where overlapping runs would cause issues (e.g., backups, migrations)
- **Test CronJobs manually first** using `kubectl create job --from=cronjob/X` before trusting the schedule
- **Monitor `failedJobsHistoryLimit`** — keep at least 1 for debugging failed runs
- **Use `completionMode: Indexed`** for parallel jobs that need to process partitioned data (each pod knows its index)

## 8. Key Takeaways / Summary

- Jobs run Pods to **completion**; Deployments run Pods **forever**
- Job `restartPolicy` must be `OnFailure` or `Never` (not `Always`)
- CronJobs create Jobs on a schedule using standard cron syntax
- `concurrencyPolicy` controls overlapping run behavior: `Allow`, `Forbid`, `Replace`
- `kubectl create job --from=cronjob/X` is the fastest way to manually test a CronJob

## 9. Practice Questions / Tasks

1. Create a Job that runs 5 completions with a parallelism of 2, where each pod prints its completion index. Verify with `kubectl logs`.
2. Create a CronJob that runs every 2 minutes, printing the current date. Watch it trigger automatically using `kubectl get jobs -w`.
3. A CronJob hasn't triggered in 3 hours despite a `*/30 * * * *` schedule. List 3 things you'd check to diagnose this.

---

# Chapter 14: DaemonSets

## 1. Learning Objectives

- Understand the purpose of DaemonSets — running one pod per node
- Differentiate DaemonSets from Deployments
- Configure node selection and tolerations for DaemonSets
- Deploy common DaemonSet use cases (logging agents, monitoring agents)

## 2. Concept Explanation

A **DaemonSet** ensures that **every node** (or a selected subset) runs exactly one copy of a Pod. As nodes are added to the cluster, Pods are automatically added; as nodes are removed, those Pods are garbage collected.

> **Analogy:** A Deployment is like having 3 security guards total, distributed wherever convenient. A DaemonSet is like having exactly ONE security guard stationed at every building entrance — every building gets coverage, regardless of how many buildings (nodes) exist.

### Common DaemonSet Use Cases

- **Log collection agents** (Fluentd, Filebeat, Fluent Bit) — need to read logs from every node
- **Monitoring agents** (Prometheus Node Exporter, Datadog Agent) — need node-level metrics from every node
- **Network plugins** (Calico, Cilium, Flannel) — need to configure networking on every node
- **Storage daemons** (Ceph, GlusterFS) — need a presence on every node for distributed storage
- **Security/Compliance agents** (Falco, security scanners)

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Use tolerations** to ensure critical DaemonSets (logging, monitoring, CNI) run on ALL nodes including control-plane
- **Set tight resource requests/limits** — DaemonSets run on every node, so resource bloat multiplies across the cluster
- **Use `RollingUpdate` strategy** with `maxUnavailable` to avoid losing monitoring/logging coverage during updates
- **Avoid `hostNetwork`/`hostPID`/privileged mode** unless absolutely necessary — security risk
- **Label nodes thoughtfully** if you need selective DaemonSets (e.g., GPU nodes, edge nodes)
- DaemonSets bypass normal scheduling — be cautious about resource contention with other workloads on the same node

## 8. Key Takeaways / Summary

- DaemonSets guarantee exactly one Pod per (matching) node — perfect for node-level agents
- New nodes automatically get the DaemonSet pod; removed nodes automatically clean it up
- Tolerations are required to run DaemonSet pods on tainted nodes (like control-plane)
- Common use cases: logging agents, monitoring/metrics agents, CNI plugins, storage daemons
- Unlike Deployments, you don't set `replicas` — the node count determines pod count

## 9. Practice Questions / Tasks

1. Deploy a DaemonSet running `busybox` that just sleeps, and verify it has a pod on every node in your cluster (use a multi-node minikube/kind cluster).
2. Label one node with `environment=edge` and modify your DaemonSet to use `nodeSelector` so it only runs there. Verify with `kubectl get pods -o wide`.
3. Explain why DaemonSets typically need `tolerations` for control-plane nodes but regular Deployments don't.

---

# Chapter 15: StatefulSets (For Stateful Apps Like Databases)

## 1. Learning Objectives

- Understand why Deployments aren't suitable for stateful applications
- Master StatefulSet's stable identity, ordered deployment, and persistent storage
- Configure headless Services for StatefulSet pod discovery
- Deploy a clustered database-style application (e.g., a 3-node setup)

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Use StatefulSets only for genuinely stateful workloads** with ordering/identity requirements (databases, message queues like Kafka, distributed caches like Redis Cluster, Elasticsearch, Zookeeper)
- **For most databases, prefer managed services** (RDS, Cloud SQL) over self-hosting StatefulSets unless you have strong operational reasons
- **Always pair with a headless Service** — StatefulSets need this for stable per-pod DNS
- **Set appropriate `terminationGracePeriodSeconds`** — databases need clean shutdown time
- **Use `volumeClaimTemplates`** so each replica automatically gets its own PVC — never share one PVC across StatefulSet replicas (data corruption risk)
- **Consider using an Operator** (e.g., the MySQL Operator, Postgres Operator) instead of hand-rolling StatefulSets for complex databases — they handle failover, backups, and upgrades correctly (see Chapter 26)
- **Remember PVCs are NOT auto-deleted** when scaling down or deleting the StatefulSet — this is intentional but must be managed explicitly

## 8. Key Takeaways / Summary

- StatefulSets provide stable network identity, ordered deployment/scaling, and dedicated persistent storage per pod
- Pod names are predictable (`name-0`, `name-1`...) and persist across rescheduling
- A headless Service (`clusterIP: None`) is required for stable per-pod DNS resolution
- `volumeClaimTemplates` automatically create one dedicated PVC per replica
- Scaling up/down happens in strict order (0→N up, N→0 down) — critical for primary/replica database topologies
- For production databases, strongly consider managed cloud services or purpose-built Operators over raw StatefulSets

## 9. Practice Questions / Tasks

1. Deploy a 3-replica StatefulSet using `nginx` with a headless service. Verify each pod has a stable DNS name (`pod-0.svc-name`, etc.) using `nslookup` from a test pod.
2. Scale your StatefulSet from 3 to 1 replica and observe the order pods are terminated. Then scale back to 3 and observe creation order.
3. Explain why you would NEVER want `podManagementPolicy: Parallel` for a primary-replica MySQL cluster, but it might be acceptable for a stateless-but-ordered batch processing StatefulSet.
