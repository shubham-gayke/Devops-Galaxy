# Chapter 16: Ingress & Ingress Controllers (NGINX Example)

## 1. Learning Objectives

- Understand why Ingress is needed beyond basic Services
- Configure host-based and path-based routing
- Install and use the NGINX Ingress Controller
- Set up TLS termination for HTTPS

## 2. Concept Explanation

Imagine you have 10 microservices, each needing external HTTP access. Creating 10 `LoadBalancer` Services means 10 cloud load balancers — expensive and hard to manage. **Ingress** solves this by providing a single entry point that routes traffic to multiple Services based on hostname or URL path.

> **Analogy:** If Services are individual phone extensions, Ingress is the receptionist who answers the single main line and routes your call ("Press 1 for sales, Press 2 for support") to the right extension based on what you ask for.

### Ingress vs Ingress Controller

- **Ingress** = the YAML resource describing routing **rules** ("route api.example.com to api-service")
- **Ingress Controller** = the actual software (a Pod, usually based on NGINX, Traefik, HAProxy, or cloud-native controllers) that **reads** Ingress rules and implements them by configuring a reverse proxy

> **Critical:** An Ingress resource does NOTHING without an Ingress Controller running in your cluster. Many beginners create Ingress YAML and wonder why nothing works — no controller installed!

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Use one Ingress Controller per cluster** (or carefully scope multiple with distinct `ingressClassName`)
- **Always set `ingressClassName`** explicitly — relying on a "default" class is fragile
- **Use cert-manager** for automated TLS certificate provisioning/renewal in production (Let's Encrypt)
- **Set resource limits on the Ingress Controller** — it's a critical path for all external traffic
- **Enable rate limiting and request size limits** via annotations to protect backend services
- **Use path-based routing for related microservices**, host-based for clearly separate applications
- **Monitor Ingress Controller metrics** (NGINX exposes Prometheus metrics) — it's often the first place to spot traffic anomalies

## 8. Key Takeaways / Summary

- Ingress provides HTTP(S) routing to multiple Services through a single entry point, saving cost vs many LoadBalancers
- An Ingress Controller (e.g., NGINX) must be installed — Ingress YAML alone does nothing
- Supports host-based routing (subdomains) and path-based routing (URL prefixes)
- TLS termination happens at the Ingress layer, simplifying certificate management
- `kubectl describe ingress` and checking Service endpoints are your primary debugging tools

## 9. Practice Questions / Tasks

1. Deploy 2 separate web apps and create an Ingress that routes `app1.local` to one and `app2.local` to the other. Test using `/etc/hosts` and curl.
2. Create a path-based Ingress routing `/v1` and `/v2` to two different versions of a service (simulate API versioning).
3. What is the difference between `pathType: Prefix` and `pathType: Exact`? Give an example URL where they'd behave differently.

---

# Chapter 17: Helm – Package Manager for Kubernetes

## 1. Learning Objectives

- Understand why Helm exists and the problems it solves
- Master Helm Charts structure: templates, values, releases
- Install, upgrade, rollback, and uninstall releases
- Create a custom Helm Chart from scratch

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Pin chart versions** in production (`helm install my-app bitnami/nginx --version 15.4.0`) — don't always pull "latest"
- **Use separate values files per environment** (`values-dev.yaml`, `values-prod.yaml`) instead of long `--set` chains
- **Always `helm lint` and `helm template`** before `helm install`/`upgrade` in CI/CD pipelines
- **Use `helm upgrade --install`** in automation — it's idempotent (works whether or not the release exists)
- **Store chart values in version control**, not just in `--set` flags on the command line (auditability)
- **Use `--atomic` flag** (`helm upgrade --install --atomic`) to automatically rollback on failed upgrades
- **Avoid overly complex chart logic** — if your templates need extensive `if/else`, consider splitting into multiple charts

## 8. Key Takeaways / Summary

- Helm packages multiple Kubernetes manifests into reusable, configurable Charts
- `values.yaml` provides defaults; override with `--set` or custom values files for different environments
- `helm install`, `helm upgrade`, `helm rollback`, `helm uninstall` are the core lifecycle commands
- `helm template` and `helm lint` let you validate charts before touching the live cluster
- Helm tracks release history, enabling safe one-command rollbacks

## 9. Practice Questions / Tasks

1. Create a Helm chart for a simple web app with configurable replica count, image tag, and resource limits. Install it, then upgrade the image tag, then rollback.
2. Install the official `bitnami/redis` chart with custom values for password and persistence size. Verify it's running with `kubectl get pods`.
3. What's the difference between `helm install`, `helm upgrade`, and `helm upgrade --install`? When would you use each in a CI/CD pipeline?

---

# Chapter 18: RBAC – Roles, RoleBindings, ServiceAccounts, Security Context

## 1. Learning Objectives

- Understand Kubernetes authentication vs authorization
- Master Role/ClusterRole and RoleBinding/ClusterRoleBinding
- Configure ServiceAccounts for pod-level permissions
- Apply SecurityContext for container-level hardening

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Follow the principle of least privilege** — grant only the exact verbs/resources needed, nothing more
- **Use Roles + RoleBindings for namespace-scoped access**; reserve ClusterRoles for genuinely cluster-wide needs
- **Never bind `cluster-admin`** to a ServiceAccount unless absolutely necessary (and audited)
- **Create one ServiceAccount per application/purpose** — don't reuse the `default` ServiceAccount for everything
- **Disable token auto-mounting** (`automountServiceAccountToken: false`) for pods that don't need API access
- **Always set `runAsNonRoot: true`** and drop all capabilities by default, adding back only what's required
- **Use `readOnlyRootFilesystem: true`** wherever possible — significantly reduces attack surface
- **Audit RBAC regularly** — use tools like `kubectl-who-can` or `rbac-lookup` to find overly broad permissions

## 8. Key Takeaways / Summary

- RBAC separates **what's allowed** (Role/ClusterRole) from **who's allowed** (RoleBinding/ClusterRoleBinding)
- ServiceAccounts are the identity Pods use to talk to the API server — never use human credentials for app workloads
- `kubectl auth can-i` is your go-to tool for testing and debugging permissions
- SecurityContext hardens containers: non-root execution, read-only filesystems, dropped Linux capabilities
- Least privilege is the guiding principle for both RBAC and SecurityContext configuration

## 9. Practice Questions / Tasks

1. Create a ServiceAccount that can only `get` and `list` ConfigMaps in a specific namespace — nothing else. Verify with `kubectl auth can-i`.
2. Configure a Pod with a SecurityContext that runs as a non-root user, drops all capabilities, and uses a read-only root filesystem. Verify the container still starts successfully.
3. Explain the security risk of binding `cluster-admin` ClusterRole to a CI/CD pipeline's ServiceAccount. What would you do instead?

---

# Chapter 19: Resource Management – Requests/Limits, HPA, Cluster Autoscaler

## 1. Learning Objectives

- Master CPU/memory requests and limits and their scheduling impact
- Configure Horizontal Pod Autoscaler (HPA) for automatic scaling
- Understand Cluster Autoscaler basics for node-level scaling
- Understand Quality of Service (QoS) classes

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Always set both requests and limits** — never leave them unset (BestEffort QoS is risky in production)
- **Use Guaranteed QoS for critical workloads** (databases, core services) to minimize eviction risk
- **Set HPA `minReplicas` ≥ 2** for high availability — never rely on a single replica with HPA
- **Tune `stabilizationWindowSeconds`** for scale-down to avoid "flapping" (rapid scale up/down cycles)
- **Right-size requests based on actual usage** — use `kubectl top pods` and monitoring data, don't guess
- **Remember CPU limits cause throttling, not crashes** — but memory limits cause OOMKill (crash) — set memory limits conservatively
- **Combine HPA with Cluster Autoscaler** in cloud environments so pod scaling isn't blocked by node capacity
- Consider **Vertical Pod Autoscaler (VPA)** for right-sizing requests/limits automatically (different from HPA — adjusts resource values, not replica count)

## 8. Key Takeaways / Summary

- Requests determine scheduling (guaranteed minimum); Limits determine the ceiling (CPU throttles, memory kills)
- QoS classes (Guaranteed > Burstable > BestEffort) determine eviction priority under resource pressure
- HPA scales **Pod replica count** based on metrics; Cluster Autoscaler scales **Node count** in the cloud
- metrics-server must be installed for HPA to function at all
- HPA requires `resources.requests` to be explicitly set on the target Deployment's containers

## 9. Practice Questions / Tasks

1. Deploy an app with CPU requests of 100m and create an HPA targeting 50% CPU utilization, min 1/max 5 replicas. Generate load and observe scaling in real time.
2. Create 3 pods with Guaranteed, Burstable, and BestEffort QoS respectively. Explain (without testing — conceptually) which would be evicted first under node memory pressure.
3. Why does HPA require `resources.requests` but not necessarily `resources.limits`? What happens if you only set limits but not requests?

---

# Chapter 20: Networking Deep Dive – CNI Plugins & Network Policies

## 1. Learning Objectives

- Understand the Kubernetes networking model and its 4 fundamental rules
- Know the role of CNI (Container Network Interface) plugins
- Master NetworkPolicy for traffic segmentation (zero-trust networking)
- Debug common networking issues

## 2. Concept Explanation

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

## 3. Architecture / How it Works

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

## 4. YAML Manifest / Config Example

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

## 5. Hands-on Implementation

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

## 6. Common Errors & Troubleshooting

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

## 7. Best Practices

- **Start with default-deny** for both ingress and egress in sensitive namespaces, then explicitly allow required traffic (zero-trust model)
- **Always allow DNS (port 53)** when applying egress restrictions — easy to forget, breaks everything
- **Use namespaceSelector for cross-namespace rules** (e.g., allowing monitoring tools to scrape metrics)
- **Label your pods and namespaces consistently** — NetworkPolicy is entirely selector-driven
- **Test policies in a non-production namespace first** — a misconfigured deny-all can cause a full outage
- **Document your NetworkPolicy strategy** — as the number of policies grows, mapping traffic flows becomes essential
- **Choose a CNI that supports NetworkPolicy from day one** — migrating CNI plugins later is disruptive

## 8. Key Takeaways / Summary

- Kubernetes mandates a flat network where every Pod gets a unique IP, with no NAT between pods
- CNI plugins (Calico, Cilium, Flannel, etc.) implement the actual networking — Kubernetes itself just defines the contract
- NetworkPolicy enables zero-trust network segmentation but requires a CNI plugin that supports enforcement
- Default behavior (no NetworkPolicy) is fully open — all pods can reach all other pods
- Default-deny + explicit allow rules is the recommended production security pattern; always remember DNS egress

## 9. Practice Questions / Tasks

1. Set up a 3-tier app (frontend/backend/database) with NetworkPolicies ensuring frontend can only reach backend, and backend can only reach database. Verify with curl tests from each pod.
2. Apply a default-deny-all egress policy to a namespace and observe what breaks (hint: DNS). Fix it with an appropriate allow rule.
3. Explain why NetworkPolicy enforcement depends on the CNI plugin, and name 2 CNI plugins that support it vs 1 that has limited support.
