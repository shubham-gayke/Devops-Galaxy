10 Chapters  •  All Key Topics  •  Interview Q&A  •  Real Code Examples

---

# Table of Contents

Chapter 1  What is Ansible? — Concepts & Architecture

Chapter 2  Installation & Configuration

Chapter 3  Inventory Management (Static & Dynamic)

Chapter 4  Playbooks, Tasks, Handlers & Loops

Chapter 5  Variables, Facts & Precedence

Chapter 6  Roles & Ansible Galaxy

Chapter 7  Jinja2 Templates & Ansible Vault

Chapter 8  Essential Modules & Collections

Chapter 9  Advanced Patterns & Best Practices

Chapter 10  CI/CD Integration & Interview Master List

---

# CHAPTER 1 - What is Ansible?

## 1.1  Overview & Definition

Ansible is an open-source IT automation tool written in Python, created by Michael DeHaan in 2012 and later acquired by Red Hat (now part of IBM). It is used to automate configuration management, application deployment, cloud provisioning, and task orchestration across hundreds or thousands of servers — all from a single control node.

Think of Ansible as a universal remote control for your entire infrastructure. Instead of manually SSH-ing into 50 servers to install Nginx, you write one YAML file and Ansible does it for you — simultaneously, reliably, and repeatably.

## 1.2  Key Characteristics

- Agentless — No software needs to be installed on managed nodes. Ansible uses SSH (Linux/Mac) or WinRM (Windows) to communicate.
- Push-based — The control node pushes configuration to managed nodes (unlike Puppet/Chef which pull from a server).
- Idempotent — Running a playbook 10 times produces the same result as running it once. Changes only happen when needed.
- Declarative — You describe the desired state, not the steps. Ansible figures out how to get there.
- YAML-based — Human-readable playbooks. No special language or DSL to learn.
- Batteries included — 3000+ built-in modules for every task imaginable.
## 1.3  Architecture

Ansible uses a simple push-based architecture:

```
Control Node (your laptop / CI server)
     │
     ├── SSH ──→  web-server-01   (192.168.1.10)
     ├── SSH ──→  web-server-02   (192.168.1.11)
     ├── SSH ──→  db-server-01    (192.168.1.20)
     └── SSH ──→  lb-server-01    (192.168.1.30)

No agent needed on managed nodes!
Requirements on nodes: Python 2.7+ or Python 3.5+, SSH server
```

## 1.4  Ansible vs. Puppet vs. Chef vs. Terraform

| Feature | Ansible | Puppet/Chef | Terraform |
| --- | --- | --- | --- |
| Architecture | Agentless / Push | Agent / Pull | Agentless / Push |
| Language | YAML | DSL (Ruby-based) | HCL |
| Learning curve | Low | High | Medium |
| Primary use | Config + Deploy | Config Management | Infrastructure as Code |
| State management | No state file | Internal DB | terraform.tfstate |
| Cloud provisioning | Yes (modules) | Limited | Primary use case |

### 🎯 INTERVIEW QUESTION

**Q: What is Ansible and how is it different from Puppet or Chef?**

A: Ansible is agentless and uses a push-based model with simple YAML syntax. No special DSL is needed. Puppet and Chef require agents on each managed node and use a pull model (nodes fetch config from a central server). Ansible is simpler to set up, easier to audit, and faster to onboard new team members. It also runs ad-hoc commands without writing a full playbook, which Puppet/Chef don't support well.

### 🎯 INTERVIEW QUESTION

**Q: What does idempotency mean in Ansible?**

A: Idempotency means running the same playbook multiple times produces the same result as running it once. If a package is already installed, the package module does nothing and reports 'ok'. This makes Ansible safe to re-run without fear of breaking things. Not all modules are idempotent by default — command and shell modules are not. Always prefer dedicated modules (package, service, file) over raw commands to maintain idempotency.

---

# CHAPTER 2 - Installation & Configuration

## 2.1  Installing Ansible

Ansible only needs to be installed on the Control Node. Managed nodes only require Python and SSH.

**▶ Ubuntu / Debian**

```
sudo apt update
sudo apt install software-properties-common -y
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install ansible -y
ansible --version   # Verify installation
```

**▶ RHEL / CentOS / Rocky Linux / AlmaLinux**

```
sudo dnf install epel-release -y
sudo dnf install ansible -y
```

**▶ macOS (Homebrew)**

```
brew install ansible
```

**▶ pip — Cross-Platform (Recommended for latest version)**

```
pip install ansible
pip install ansible==9.0.0        # Pin specific version
ansible --version                 # Should show python version too
```

## 2.2  The ansible.cfg Configuration File

Ansible searches for its config file in this order (first found wins):

- ANSIBLE_CONFIG environment variable
- ./ansible.cfg — in the current working directory (recommended for projects)
- ~/.ansible.cfg — in the user home directory
- /etc/ansible/ansible.cfg — system-wide default
**▶ ansible.cfg — Complete example for a project**

```
[defaults]
inventory          = ./inventory           # path to inventory
remote_user        = ubuntu                # default SSH user on remote hosts
private_key_file   = ~/.ssh/id_rsa         # SSH private key
host_key_checking  = False                 # disable fingerprint check (dev only)
retry_files_enabled = False               # don't create .retry files
stdout_callback    = yaml                  # nicer output format
forks              = 10                    # parallel execution (default is 5)
gathering          = smart                 # cache facts; don't re-gather if cached
fact_caching       = jsonfile
fact_caching_connection = /tmp/ansible_facts
fact_caching_timeout = 86400              # cache facts for 24 hours

[privilege_escalation]
become             = True                  # use sudo by default
become_method      = sudo
become_user        = root
become_ask_pass    = False                 # don't prompt for sudo password

[ssh_connection]
pipelining         = True                  # big speed boost; requires requiretty off
ssh_args           = -o ControlMaster=auto -o ControlPersist=60s
control_path_dir   = ~/.ansible/cp
```

> [!TIP]
> **💡 Pro Tip**
> Always commit ansible.cfg to your project repo. It ensures every team member and CI/CD pipeline uses the same settings.

## 2.3  SSH Key Setup

**▶ Generate and distribute SSH key to managed nodes**

```
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "ansible@controlnode"

# Copy public key to managed nodes
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@192.168.1.10
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@192.168.1.11

# Test connectivity
ssh ubuntu@192.168.1.10 "echo 'SSH works!'"

# Test via Ansible
ansible all -m ping -i inventory/
```

### 🎯 INTERVIEW QUESTION

**Q: What is the order of precedence for ansible.cfg?**

A: ANSIBLE_CONFIG environment variable → ./ansible.cfg in the current directory → ~/.ansible.cfg in the home directory → /etc/ansible/ansible.cfg as the system default. The first file found is used exclusively — Ansible does not merge multiple config files. Best practice is to always have an ansible.cfg at the project root so settings are version-controlled and portable.

---

# CHAPTER 3 - Inventory Management

## 3.1  What is Inventory?

The inventory is the list of managed hosts that Ansible will work with. It can be a single file or a directory of files. Hosts can be grouped logically (webservers, dbservers, production, staging), and each group can have its own variables.

## 3.2  Static Inventory — INI Format

**▶ inventory/hosts — INI format**

```
# Individual hosts
mail.example.com

# Group of hosts
[webservers]
web1.example.com
web2.example.com
web3.example.com  ansible_port=2222   # custom SSH port

# Range shorthand: web1 through web5
[appservers]
app[1:5].example.com

# DB servers with variables
[dbservers]
db1  ansible_host=192.168.1.20  ansible_user=postgres
db2  ansible_host=192.168.1.21

# Group of groups
[production:children]
webservers
appservers
dbservers

# Variables for all hosts in production
[production:vars]
env=production
ntp_server=ntp.corp.com
ansible_python_interpreter=/usr/bin/python3

# Variables for all hosts
[all:vars]
ansible_python_interpreter=/usr/bin/python3
```

## 3.3  Static Inventory — YAML Format (Recommended)

**▶ inventory/hosts.yml — YAML format**

```
all:
  vars:
    ansible_python_interpreter: /usr/bin/python3

  children:
    webservers:
      hosts:
        web1:
          ansible_host: 192.168.1.10
          nginx_port: 80
        web2:
          ansible_host: 192.168.1.11
          nginx_port: 8080
      vars:
        max_workers: 4
        ssl_enabled: true

    dbservers:
      hosts:
        db1:
          ansible_host: 192.168.1.20
          db_port: 5432
        db2:
          ansible_host: 192.168.1.21
      vars:
        db_name: myapp_db

    production:
      children:
        webservers:
        dbservers:
```

## 3.4  Host & Group Variables Files (Best Practice)

Instead of putting all variables inside the inventory file, use separate directories. Ansible loads these automatically.

```
inventory/
├── hosts.yml              # host list only (no vars here)
├── host_vars/
│   ├── web1.yml           # variables ONLY for web1
│   ├── web2.yml
│   └── db1.yml
└── group_vars/
    ├── all.yml            # variables for ALL hosts
    ├── webservers.yml     # variables for [webservers] group
    ├── dbservers.yml
    └── production.yml     # variables for [production] group
```

**▶ group_vars/webservers.yml**

```
---
nginx_version: "1.24"
max_connections: 1024
ssl_enabled: true
document_root: /var/www/html
```

## 3.5  Dynamic Inventory

For cloud environments, IPs change constantly. Dynamic inventory plugins query your cloud provider API in real time to generate the host list.

**▶ inventory/aws_ec2.yml — AWS dynamic inventory plugin**

```
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
  - us-west-2
filters:
  instance-state-name: running
  tag:Environment: production
keyed_groups:
  - key: tags.Role          # create groups by Role tag
    prefix: role_
  - key: tags.Environment
    prefix: env_
  - key: placement.region
    prefix: region_
hostnames:
  - private-ip-address      # use private IP as hostname
compose:
  ansible_host: private_ip_address
```

**▶ Using dynamic inventory**

```
# List all dynamically discovered hosts
ansible-inventory -i aws_ec2.yml --list

# Ping all production webservers
ansible role_webserver -i aws_ec2.yml -m ping

# Run playbook with dynamic inventory
ansible-playbook -i aws_ec2.yml site.yml
```

### 🎯 INTERVIEW QUESTION

**Q: What is the difference between static and dynamic inventory?**

A: Static inventory is a file you maintain manually — you hardcode host IPs or hostnames in INI or YAML format. Dynamic inventory uses scripts or plugins that query live infrastructure (AWS, GCP, Azure, VMware, Kubernetes) and generate the host list at runtime. Dynamic inventory is essential in cloud environments where IPs change with every launch. You can mix both: ansible-playbook -i static_hosts.yml -i aws_ec2.yml site.yml

### 🎯 INTERVIEW QUESTION

**Q: How do you target a specific subset of hosts in Ansible?**

A: Use the --limit flag: ansible-playbook site.yml --limit webservers (group), --limit web1 (single host), --limit 'web1,db1' (multiple), --limit 'webservers:!web1' (group excluding one host). Also use patterns in the hosts: field of a play: hosts: webservers:dbservers (union), hosts: webservers:&production (intersection), hosts: webservers:!staging (difference).

---

# CHAPTER 4 - Playbooks, Tasks, Handlers & Loops

## 4.1  Playbook Structure

A playbook is a YAML file containing one or more plays. A play maps a group of hosts to a set of tasks. Tasks call modules to perform actions.

```
Playbook
  └── Play 1 (hosts: webservers)
        ├── Task 1: Install Nginx      (uses: package module)
        ├── Task 2: Start Nginx        (uses: service module)
        ├── Task 3: Deploy config      (uses: template module)
        └── Handler: Reload Nginx      (triggered by Task 3)
```

**▶ site.yml — Complete playbook example**

```
---
- name: Configure and deploy web application  # Play name
  hosts: webservers                            # Target hosts/groups
  become: true                                 # Run tasks as sudo
  gather_facts: true                           # Collect system info (default: true)
  vars:                                        # Variables for this play
    app_port: 8080
    app_user: www-data

  pre_tasks:                                   # Run BEFORE roles
    - name: Update apt cache
      ansible.builtin.apt:
        update_cache: true
        cache_valid_time: 3600

  tasks:
    - name: Install required packages
      ansible.builtin.package:
        name:
          - nginx
          - git
          - curl
        state: present

    - name: Create application directory
      ansible.builtin.file:
        path: /opt/myapp
        state: directory
        owner: "{{ app_user }}"
        mode: '0755'

    - name: Deploy Nginx config from template
      ansible.builtin.template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        owner: root
        mode: '0644'
        validate: '/usr/sbin/nginx -t -c %s'
      notify: Reload Nginx           # Trigger handler on change

    - name: Start and enable Nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

  post_tasks:                                  # Run AFTER roles
    - name: Verify application is up
      ansible.builtin.uri:
        url: "http://localhost:{{ app_port }}/health"
        status_code: 200

  handlers:
    - name: Reload Nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded
```

## 4.2  Handlers

Handlers are special tasks that run only when notified, and only once at the end of a play — even if notified by multiple tasks.

```
tasks:
  - name: Update Nginx config
    template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    notify: Reload Nginx

  - name: Update SSL certificate
    copy:
      src: ssl.crt
      dest: /etc/ssl/nginx.crt
    notify: Reload Nginx     # Notified again, but Nginx only reloads ONCE

handlers:
  - name: Reload Nginx
    service:
      name: nginx
      state: reloaded
```

> [!TIP]
> **💡 Pro Tip**
> Force handlers to run immediately (before all tasks finish) using meta: flush_handlers task.

## 4.3  Loops

**▶ Simple loop — install multiple packages**

```
- name: Install required packages
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop:
    - git
    - curl
    - vim
    - htop
    - unzip
```

**▶ Loop with dictionaries — create multiple users**

```
- name: Create application users
  ansible.builtin.user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
    shell: "{{ item.shell | default('/bin/bash') }}"
    state: present
  loop:
    - { name: alice, groups: sudo,       shell: /bin/bash }
    - { name: bob,   groups: developers, shell: /bin/zsh  }
    - { name: ci,    groups: www-data,   shell: /sbin/nologin }
```

**▶ loop_control — customize loop output**

```
- name: Deploy application configs
  template:
    src: "{{ item.src }}"
    dest: "{{ item.dest }}"
  loop:
    - { src: app.conf.j2,   dest: /etc/app/app.conf }
    - { src: db.conf.j2,    dest: /etc/app/db.conf  }
  loop_control:
    label: "{{ item.dest }}"     # Show only dest in output, not full dict
```

> [!WARNING]
> **⚠ Warning**
> with_items, with_dict, with_fileglob are all deprecated legacy syntax. Always use loop: instead. For dict looping use: loop: "{{ my_dict | dict2items }}" and reference item.key / item.value.

## 4.4  Conditionals — when

```
- name: Install Apache on Red Hat systems
  ansible.builtin.yum:
    name: httpd
    state: present
  when: ansible_facts['os_family'] == "RedHat"

- name: Install Nginx on Debian systems
  ansible.builtin.apt:
    name: nginx
    state: present
  when:
    - ansible_facts['os_family'] == "Debian"
    - ansible_facts['distribution_major_version'] | int >= 20

# Using registered variables in when
- name: Check if service is running
  ansible.builtin.command: systemctl is-active myapp
  register: service_status
  ignore_errors: true

- name: Start service if not running
  ansible.builtin.service:
    name: myapp
    state: started
  when: service_status.rc != 0
```

## 4.5  Error Handling

```
# Ignore errors and continue
- name: Remove old lock file (may not exist)
  ansible.builtin.file:
    path: /tmp/app.lock
    state: absent
  ignore_errors: true

# Custom failure condition
- name: Run database migration
  ansible.builtin.command: /opt/app/migrate.sh
  register: migration_result
  failed_when:
    - migration_result.rc != 0
    - "'already migrated' not in migration_result.stdout"

# Custom changed condition (for idempotency)
- name: Check application version
  ansible.builtin.command: /opt/app/version.sh
  register: ver_check
  changed_when: false          # Never report as "changed"

# Block / rescue / always (try/catch/finally)
- block:
    - name: Install application
      ansible.builtin.package:
        name: myapp
        state: present
    - name: Start application
      ansible.builtin.service:
        name: myapp
        state: started
  rescue:
    - name: Rollback on failure
      ansible.builtin.command: /opt/rollback.sh
  always:
    - name: Send notification
      ansible.builtin.uri:
        url: https://hooks.slack.com/...
        method: POST
```

### 🎯 INTERVIEW QUESTION

**Q: What is a handler and when does it run?**

A: A handler is a special task that is triggered by the notify keyword in regular tasks. It runs only once at the END of a play, even if multiple tasks notify it. This prevents unnecessary service restarts — if 5 tasks all modify Nginx config files and all notify 'Reload Nginx', Nginx only reloads once. Handlers are defined in the handlers: section of a play or in a role's handlers/main.yml file.

### 🎯 INTERVIEW QUESTION

**Q: Difference between ignore_errors and failed_when?**

A: ignore_errors: true tells Ansible to continue to the next task even if this task fails — it's a blunt instrument. failed_when allows you to define a custom condition for what counts as failure, giving you fine-grained control. For example, you can mark a command as failed only if the exit code is non-zero AND the output doesn't contain a specific string. Use failed_when for nuanced logic, ignore_errors only when you genuinely don't care about the outcome.

---

# CHAPTER 5 - Variables, Facts & Precedence

## 5.1  Defining Variables

**▶ In the playbook (play-level scope)**

```
- name: Deploy app
  hosts: webservers
  vars:
    app_version: "2.5.1"
    app_port: 8080
    db_host: "{{ groups['dbservers'][0] }}"  # reference other groups

  vars_files:                                # load from external files
    - vars/common.yml
    - vars/{{ env }}.yml                     # dynamic file name
```

**▶ set_fact — create vars dynamically during run**

```
- name: Compute app URL
  ansible.builtin.set_fact:
    app_url: "https://{{ ansible_fqdn }}:{{ app_port }}"
    deploy_timestamp: "{{ ansible_date_time.iso8601 }}"

- name: Use the computed fact
  ansible.builtin.debug:
    msg: "Deployed at {{ deploy_timestamp }} → {{ app_url }}"
```

**▶ register — capture task output**

```
- name: Get current git commit
  ansible.builtin.command: git -C /opt/app rev-parse HEAD
  register: git_commit
  changed_when: false

- name: Display commit
  ansible.builtin.debug:
    msg: "Running commit: {{ git_commit.stdout }}"

# register object properties:
# .stdout      — standard output (string)
# .stderr      — standard error
# .rc          — return code
# .stdout_lines — stdout as a list
# .failed      — boolean
# .changed     — boolean
```

## 5.2  Ansible Facts

Facts are variables automatically discovered from managed nodes by the setup module. They provide rich system information.

**▶ Explore available facts**

```
# List ALL facts for a host
ansible web1 -m setup

# Filter facts by key
ansible web1 -m setup -a 'filter=ansible_*ipv4*'

# Common facts used in playbooks:
{{ ansible_hostname }}              # machine short hostname
{{ ansible_fqdn }}                  # fully qualified domain name
{{ ansible_default_ipv4.address }}  # primary IP address
{{ ansible_os_family }}             # Debian, RedHat, Suse, etc.
{{ ansible_distribution }}          # Ubuntu, CentOS, Fedora, etc.
{{ ansible_distribution_version }}  # 22.04, 8.5, etc.
{{ ansible_distribution_major_version }} # 22, 8, etc.
{{ ansible_memtotal_mb }}           # total RAM in MB
{{ ansible_processor_count }}       # number of CPU cores
{{ ansible_kernel }}                # kernel version string
{{ ansible_architecture }}          # x86_64, aarch64, etc.
{{ ansible_env.HOME }}              # environment variables
{{ ansible_date_time.iso8601 }}     # current timestamp
```

**▶ Custom facts — /etc/ansible/facts.d/app.fact**

```
[application]
version=2.4.1
environment=production
last_deploy=2025-03-01

# Access in playbooks as:
{{ ansible_local.app.application.version }}
{{ ansible_local.app.application.environment }}
```

## 5.3  Jinja2 Filters — Must Know

```
# Default value if variable is undefined
{{ my_var | default('fallback_value') }}
{{ my_var | default(omit) }}          # omit the param entirely if undefined

# Type conversion
{{ "42" | int }}                      # → 42 (integer)
{{ 42 | string }}                     # → "42" (string)
{{ "true" | bool }}                   # → True (boolean)
{{ my_var | float }}                  # → float

# String operations
{{ my_string | upper }}               # UPPERCASE
{{ my_string | lower }}               # lowercase
{{ my_string | capitalize }}          # First letter capitalized
{{ my_string | replace('old','new') }}# string replace
{{ my_string | regex_replace('^.*:','') }} # regex replace
{{ my_string | trim }}                # strip whitespace

# List operations
{{ my_list | length }}                # count items
{{ my_list | join(', ') }}           # join to string
{{ my_list | sort }}                  # sort list
{{ my_list | unique }}               # remove duplicates
{{ my_list | flatten }}              # flatten nested lists
{{ my_list | first }}               # first item
{{ my_list | last }}                # last item

# Dict operations
{{ my_dict | dict2items }}           # dict → list for looping
{{ my_items | items2dict }}          # list → dict
{{ my_dict | combine(other_dict) }}  # merge dicts

# Path / file
{{ '/etc/nginx/nginx.conf' | basename }}  # → nginx.conf
{{ '/etc/nginx/nginx.conf' | dirname }}   # → /etc/nginx

# JSON / YAML
{{ my_var | to_json }}               # convert to JSON string
{{ my_var | to_yaml }}               # convert to YAML string
{{ my_json_string | from_json }}     # parse JSON string

# Math
{{ 15 | pow(2) }}                    # → 225
{{ -5 | abs }}                       # → 5
{{ [3,1,2] | max }}                  # → 3
```

## 5.4  Variable Precedence (Simplified)

When the same variable is defined in multiple places, the highest precedence wins. Remember: extra vars (-e) always win. Role defaults always lose.

```
Priority  Source                           How to define
────────  ──────────────────────────────   ─────────────────────────────────
 1 (LOW)  Role defaults                    roles/myrole/defaults/main.yml
 2        Inventory group_vars/all         inventory/group_vars/all.yml
 3        Inventory group_vars/[group]     inventory/group_vars/webservers.yml
 4        Inventory host_vars/[host]       inventory/host_vars/web1.yml
 5        Playbook group_vars/all          group_vars/all.yml
 6        Playbook group_vars/[group]      group_vars/webservers.yml
 7        Playbook host_vars/[host]        host_vars/web1.yml
 8        Host facts (setup module)        auto-collected
 9        Play vars:                        vars: in the play
10        Play vars_files:                  vars_files: in the play
11        Role vars (vars/main.yml)        roles/myrole/vars/main.yml
12        Task vars (inline)               vars: in a specific task
13        set_fact / register              set_fact module
14 (HIGH) Extra vars (-e)                  ansible-playbook -e key=val
```

### 🎯 INTERVIEW QUESTION

**Q: How do you override a variable at runtime without editing any files?**

A: Use the -e flag (extra vars): ansible-playbook site.yml -e "app_version=2.5 env=staging". This has the highest variable precedence and overrides everything else. For multiple variables, pass a YAML file: ansible-playbook site.yml -e "@override.yml". This is the standard pattern in CI/CD pipelines where environment-specific values are injected at runtime.

### 🎯 INTERVIEW QUESTION

**Q: What is the difference between vars/main.yml and defaults/main.yml in a role?**

A: defaults/main.yml has the LOWEST priority of all variable sources — it's easily overridden by any inventory var, group_var, or playbook var. Use it for settings you WANT users to customize. vars/main.yml has HIGH priority — it's harder to override and is meant for internal role constants. Rule of thumb: put sensible user-facing defaults in defaults/, put role-internal fixed values in vars/.

---

# CHAPTER 6 - Roles & Ansible Galaxy

## 6.1  What is a Role?

A role is a self-contained, reusable unit of automation. Instead of one giant playbook with 500 tasks, you split configuration into focused roles — nginx role, mysql role, firewall role, app-deploy role. Each role has its own tasks, variables, templates, handlers, and files.

Roles enable team collaboration, code reuse, and clean project structure. They are the backbone of any serious Ansible project.

## 6.2  Role Directory Structure

```
roles/
└── nginx/                      # role name
    ├── tasks/
    │   ├── main.yml            # REQUIRED: main task list (entry point)
    │   ├── install.yml         # sub-task file (imported from main.yml)
    │   └── configure.yml       # sub-task file
    ├── handlers/
    │   └── main.yml            # handlers specific to this role
    ├── templates/
    │   └── nginx.conf.j2       # Jinja2 templates
    ├── files/
    │   └── ssl.crt             # static files to copy verbatim
    ├── vars/
    │   └── main.yml            # high-priority role variables
    ├── defaults/
    │   └── main.yml            # low-priority defaults (user override here)
    ├── meta/
    │   └── main.yml            # role metadata & dependencies
    └── README.md               # document how to use this role
```

**▶ Create role skeleton instantly**

```
ansible-galaxy role init nginx
ansible-galaxy role init --offline nginx   # no network needed
```

## 6.3  Role Files in Detail

**▶ roles/nginx/defaults/main.yml — user-configurable defaults**

```
---
nginx_port: 80
nginx_user: www-data
nginx_worker_processes: auto
nginx_worker_connections: 1024
nginx_ssl_enabled: false
nginx_ssl_protocols: "TLSv1.2 TLSv1.3"
```

**▶ roles/nginx/tasks/main.yml**

```
---
- name: Import installation tasks
  ansible.builtin.import_tasks: install.yml

- name: Import configuration tasks
  ansible.builtin.import_tasks: configure.yml
  tags: [nginx, config]
```

**▶ roles/nginx/tasks/install.yml**

```
---
- name: Install Nginx
  ansible.builtin.package:
    name: nginx
    state: present

- name: Create Nginx directories
  ansible.builtin.file:
    path: "{{ item }}"
    state: directory
    owner: "{{ nginx_user }}"
    mode: '0755'
  loop:
    - /etc/nginx/conf.d
    - /var/log/nginx
    - /var/www/html
```

**▶ roles/nginx/meta/main.yml — role dependencies**

```
---
galaxy_info:
  author: myteam
  description: Installs and configures Nginx
  license: MIT
  min_ansible_version: "2.14"
  platforms:
    - name: Ubuntu
      versions: ["20.04", "22.04", "24.04"]

dependencies:
  - role: common           # runs common role first
  - role: firewall
    vars:
      open_ports: [80, 443]
```

## 6.4  Using Roles in Playbooks

**▶ site.yml — multiple ways to use roles**

```
---
- name: Configure all web servers
  hosts: webservers
  become: true

  roles:
    - common                   # simple usage, use all defaults
    - role: nginx              # same but explicit
      vars:                    # override role defaults
        nginx_port: 443
        nginx_ssl_enabled: true
      tags: [nginx]
    - role: app-deploy
      when: deploy_app | bool   # conditional role

  tasks:
    # Dynamic role inclusion (can use when: and vars:)
    - name: Apply monitoring role
      ansible.builtin.include_role:
        name: monitoring
      vars:
        monitor_port: 9090
      when: enable_monitoring | bool
```

## 6.5  Ansible Galaxy — Community Roles

```
# Search for roles
ansible-galaxy search nginx --author geerlingguy

# Install a role
ansible-galaxy role install geerlingguy.nginx

# Install specific version
ansible-galaxy role install geerlingguy.nginx,3.1.0

# Best practice: use requirements.yml
ansible-galaxy install -r requirements.yml
```

**▶ requirements.yml — version-pinned dependencies**

```
---
roles:
  - name: geerlingguy.nginx
    version: "3.1.0"
  - name: geerlingguy.mysql
    version: "4.3.2"
  - src: https://github.com/company/my-private-role
    scm: git
    version: main

collections:
  - name: amazon.aws
    version: "7.0.0"
  - name: community.docker
    version: "3.4.0"
  - name: kubernetes.core
    version: "2.4.0"
```

### 🎯 INTERVIEW QUESTION

**Q: How do you structure a large Ansible project?**

A: Use a roles-based structure with a top-level site.yml that calls environment-specific playbooks (webservers.yml, dbservers.yml). Store all roles in a roles/ directory. Use group_vars/ and host_vars/ for environment-specific settings. Keep secrets in Vault-encrypted files. Use a requirements.yml for external role dependencies. This mirrors the official Ansible best practices layout.

---

# CHAPTER 7 - Jinja2 Templates & Ansible Vault

## 7.1  Jinja2 Templates

Templates allow you to create dynamic configuration files from variables. Ansible processes .j2 files using the Jinja2 templating engine and produces the final config on each managed host.

**▶ templates/nginx.conf.j2 — dynamic Nginx config**

```
# Generated by Ansible on {{ ansible_date_time.date }}
# DO NOT EDIT MANUALLY

user {{ nginx_user }};
worker_processes {{ ansible_processor_count }};
error_log /var/log/nginx/error.log warn;

events {
    worker_connections {{ nginx_worker_connections | default(1024) }};
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;

    # Gzip
    gzip on;
    gzip_types text/plain application/json;

    server {
        listen {{ nginx_port }};
        server_name {{ ansible_fqdn }};
        root {{ document_root | default('/var/www/html') }};

        {% if nginx_ssl_enabled %}
        listen 443 ssl;
        ssl_certificate     /etc/ssl/certs/{{ domain }}.crt;
        ssl_certificate_key /etc/ssl/private/{{ domain }}.key;
        ssl_protocols {{ nginx_ssl_protocols }};
        {% endif %}

        {% for location in nginx_locations | default([]) %}
        location {{ location.path }} {
            proxy_pass http://{{ location.backend }};
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        {% endfor %}

        # Health check endpoint
        location /health {
            return 200 "OK {{ inventory_hostname }}";
        }
    }
}
```

**▶ Task to deploy the template**

```
- name: Deploy Nginx configuration
  ansible.builtin.template:
    src: templates/nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
    backup: true                            # keep .bak of previous
    validate: '/usr/sbin/nginx -t -c %s'   # validate before writing!
  notify: Reload Nginx
```

> [!TIP]
> **💡 Pro Tip**
> Always use validate: in the template task for config files. It runs the validation command before replacing the file, preventing a bad config from taking down your service.

## 7.2  Jinja2 Control Structures

```
{# Comment — not rendered in output #}

{# If/elif/else #}
{% if env == 'production' %}
log_level = error
{% elif env == 'staging' %}
log_level = warning
{% else %}
log_level = debug
{% endif %}

{# For loop #}
{% for server in groups['dbservers'] %}
replica_host = {{ hostvars[server]['ansible_default_ipv4']['address'] }}
{% endfor %}

{# Loop with index #}
{% for item in my_list %}
{{ loop.index }}: {{ item }}    {# 1-based index #}
{{ loop.index0 }}: {{ item }}   {# 0-based index #}
{{ loop.first }} {{ loop.last }} {# booleans #}
{% endfor %}

{# Whitespace control #}
{%- if condition -%}    {# - strips whitespace/newlines #}
content
{%- endif -%}
```

## 7.3  Ansible Vault — Encrypting Secrets

Vault encrypts sensitive data (passwords, API keys, certificates) using AES-256. Encrypted files look like random text in Git but Ansible decrypts them automatically at run time.

### Vault Commands

```
# Encrypt an entire file (will prompt for password)
ansible-vault encrypt group_vars/all/secrets.yml

# Create a new encrypted file
ansible-vault create secrets.yml

# Edit an encrypted file (opens in $EDITOR, re-encrypts on save)
ansible-vault edit secrets.yml

# View encrypted file content
ansible-vault view secrets.yml

# Decrypt in place (makes plaintext — be careful!)
ansible-vault decrypt secrets.yml

# Change vault password
ansible-vault rekey secrets.yml
```

**▶ Encrypt a single string value**

```
ansible-vault encrypt_string 'MyS3cr3tP@ssword' --name 'db_password'

# Output (paste directly into your YAML vars file):
db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  66386439653236336466653438623533363535653561363132376663356666
  3337306666303530306261303138623932396531653237660a616238313763
  ...
```

**▶ Running playbooks with Vault**

```
# Prompt for password at run time
ansible-playbook site.yml --ask-vault-pass

# Use a password file (for CI/CD — add to .gitignore!)
echo "MyVaultPassword123" > ~/.vault_pass
chmod 600 ~/.vault_pass
ansible-playbook site.yml --vault-password-file ~/.vault_pass

# Use environment variable for password file
export ANSIBLE_VAULT_PASSWORD_FILE=~/.vault_pass
ansible-playbook site.yml

# Multiple vault IDs (different passwords per environment)
ansible-vault encrypt --vault-id prod@prompt prod_secrets.yml
ansible-vault encrypt --vault-id dev@prompt dev_secrets.yml
ansible-playbook site.yml --vault-id prod@prompt --vault-id dev@prompt
```

**▶ Vault-encrypted vars file structure**

```
# group_vars/all/main.yml — regular (unencrypted)
app_name: myapp
app_port: 8080
db_host: db.internal.company.com

# group_vars/all/secrets.yml — ENCRYPTED with Vault
db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  ...
api_key: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  ...
```

> [!TIP]
> **💡 Pro Tip**
> Keep encrypted and unencrypted vars in separate files in the same group_vars directory. Never encrypt main.yml — only secrets.yml. This makes diffs readable in code review while keeping secrets safe.

### 🎯 INTERVIEW QUESTION

**Q: How do you use Ansible Vault in a CI/CD pipeline?**

A: Store the vault password as a CI/CD secret (GitLab CI variable, Jenkins credential, GitHub Actions secret, AWS SSM Parameter Store). In the pipeline script, write the secret to a temp file (echo "$VAULT_PASS" > /tmp/.vault), run the playbook with --vault-password-file /tmp/.vault, then delete the temp file. Never store the vault password in your git repository — only the encrypted files go to Git.

---

# CHAPTER 8 - Essential Modules & Collections

## 8.1  Module Categories

| Category | Common Modules |
| --- | --- |
| Package Management | package, apt, yum, dnf, pip, gem |
| Service Management | service, systemd |
| File Operations | file, copy, template, fetch, lineinfile, blockinfile, find, stat |
| Command Execution | command, shell, script, raw |
| User Management | user, group, authorized_key |
| Source Control | git, subversion |
| Networking | uri, get_url, wait_for, wait_for_connection |
| System | hostname, cron, mount, sysctl, timezone |
| Cloud (AWS) | ec2_instance, s3_bucket, rds_instance, elb_instance |
| Containers | docker_container, docker_image, k8s |
| Database | mysql_db, postgresql_db, mongodb_user |

## 8.2  File Operation Modules

**▶ file — create directories, set permissions, symlinks**

```
- name: Create application directory
  ansible.builtin.file:
    path: /opt/myapp
    state: directory      # directory | file | link | absent | touch
    owner: www-data
    group: www-data
    mode: '0755'
    recurse: true         # apply recursively

- name: Create symlink
  ansible.builtin.file:
    src: /opt/myapp/current
    dest: /var/www/html
    state: link
```

**▶ copy vs template**

```
# copy: static file, no variable processing
- name: Copy SSL certificate
  ansible.builtin.copy:
    src: files/ssl.crt         # relative to playbook or role files/
    dest: /etc/ssl/certs/
    owner: root
    mode: '0644'
    backup: true

# template: dynamic file, Jinja2 processed
- name: Deploy app config
  ansible.builtin.template:
    src: templates/app.conf.j2
    dest: /etc/app/app.conf
```

**▶ lineinfile — modify specific lines**

```
- name: Ensure NTP server is configured
  ansible.builtin.lineinfile:
    path: /etc/ntp.conf
    regexp: '^server '         # find line matching this regex
    line: 'server ntp.corp.com prefer'  # replace with this
    state: present

- name: Add entry to /etc/hosts
  ansible.builtin.lineinfile:
    path: /etc/hosts
    line: '10.0.0.5  db.internal'
    insertafter: EOF

- name: Remove a line
  ansible.builtin.lineinfile:
    path: /etc/sudoers
    regexp: '^Defaults.*requiretty'
    state: absent
```

## 8.3  Command Modules — command vs shell vs raw

```
# command: safest, no shell features, not idempotent
- name: Run a simple command
  ansible.builtin.command:
    cmd: /usr/bin/myapp --version
    chdir: /opt/myapp           # change directory first
    creates: /opt/myapp/done    # skip if this file exists (idempotency!)
  register: app_version

# shell: supports pipes, redirects, &&, $VAR — less safe
- name: Count running processes
  ansible.builtin.shell: |
    ps aux | grep -c nginx

# raw: zero dependencies, use for bootstrapping only
- name: Install Python on bare system
  ansible.builtin.raw: apt-get install -y python3

# script: run a local script on remote host
- name: Run custom install script
  ansible.builtin.script:
    cmd: scripts/install.sh
    creates: /opt/myapp/installed
```

> [!WARNING]
> **⚠ Warning**
> command and shell are NOT idempotent — they run every time regardless. Use the creates: or removes: parameter to add idempotency, or use a dedicated module (package, service, file) whenever possible.

## 8.4  uri — HTTP Requests

```
# GET request — check API
- name: Health check
  ansible.builtin.uri:
    url: "http://localhost:8080/health"
    method: GET
    status_code: [200, 201]     # list of acceptable codes
    return_content: true
  register: health_response

# POST request — call an API
- name: Register application
  ansible.builtin.uri:
    url: "https://api.example.com/register"
    method: POST
    headers:
      Content-Type: application/json
      Authorization: "Bearer {{ api_token }}"
    body_format: json
    body:
      hostname: "{{ ansible_hostname }}"
      ip: "{{ ansible_default_ipv4.address }}"
      env: "{{ environment }}"
    status_code: 201
```

## 8.5  Cloud Collections

```
# Install collections
ansible-galaxy collection install amazon.aws
ansible-galaxy collection install azure.azcollection
ansible-galaxy collection install google.cloud
ansible-galaxy collection install kubernetes.core
ansible-galaxy collection install community.docker
```

**▶ Amazon AWS — launch EC2 instance**

```
- name: Launch web server EC2 instance
  amazon.aws.ec2_instance:
    name: "web-server-{{ env }}"
    key_name: "{{ ec2_key_pair }}"
    instance_type: t3.micro
    image_id: ami-0c55b159cbfafe1f0
    region: us-east-1
    vpc_subnet_id: "{{ subnet_id }}"
    security_groups: ["web-sg", "ssh-sg"]
    network:
      assign_public_ip: true
    tags:
      Environment: "{{ env }}"
      Role: webserver
      ManagedBy: ansible
    wait: true
    state: running
  register: ec2_result
```

### 🎯 INTERVIEW QUESTION

**Q: When would you use shell module over command module?**

A: Use shell only when you specifically need shell features: pipes (|), output redirection (> >>), logical operators (&& ||), background jobs (&), glob expansion (*.log), or environment variable expansion ($PATH). For simple commands with no shell features, always prefer command (safer, immune to shell injection, faster). Even better: use the most specific module available (apt, service, file) which is truly idempotent unlike command/shell.

---

# CHAPTER 9 - Advanced Patterns & Best Practices

## 9.1  Rolling Updates with serial

By default, Ansible runs each task on ALL hosts in parallel, then moves to the next task. With serial, you process hosts in batches — essential for zero-downtime deployments.

```
- name: Rolling deployment — update 2 servers at a time
  hosts: webservers
  serial: 2                      # process 2 hosts per batch
  # serial: "30%"               # or: 30% of the group per batch
  # serial: [1, 5, 10]          # canary: 1 first, then 5, then 10
  max_fail_percentage: 20        # abort entire play if >20% fail

  pre_tasks:
    - name: Remove from load balancer
      community.aws.elb_instance:
        instance_id: "{{ ec2_id }}"
        state: absent
      delegate_to: localhost

  tasks:
    - name: Deploy new application version
      ansible.builtin.git:
        repo: https://github.com/company/app.git
        dest: /opt/app
        version: "{{ release_tag }}"
      notify: Restart App

  handlers:
    - name: Restart App
      ansible.builtin.service:
        name: myapp
        state: restarted

  post_tasks:
    - name: Health check before re-adding to LB
      ansible.builtin.uri:
        url: "http://localhost:8080/health"
        status_code: 200
      retries: 5
      delay: 10

    - name: Add back to load balancer
      community.aws.elb_instance:
        instance_id: "{{ ec2_id }}"
        state: present
      delegate_to: localhost
```

## 9.2  delegate_to — Run Tasks on Different Hosts

```
# Run a task on the control node
- name: Generate SSL certificate locally
  ansible.builtin.command: openssl req -x509 -nodes -days 365 ...
  delegate_to: localhost

# Run on a different managed host
- name: Backup database before upgrade (run on DB host)
  ansible.builtin.command: pg_dump mydb > /backup/pre-upgrade.sql
  delegate_to: db-server-01

# Wait for host to come back after reboot
- name: Reboot the server
  ansible.builtin.reboot:
    reboot_timeout: 300

- name: Confirm SSH is available
  ansible.builtin.wait_for_connection:
    delay: 10
    timeout: 120
```

## 9.3  Async Tasks — Fire and Forget

```
# Launch long-running task and move on immediately
- name: Run database migration (may take 30 minutes)
  ansible.builtin.command: /opt/app/migrate.sh
  async: 3600           # max time to wait (seconds)
  poll: 0               # 0 = fire and forget, don't wait
  register: migration_job

# ... do other things on other hosts ...

# Come back and check the result
- name: Check migration result
  ansible.builtin.async_status:
    jid: "{{ migration_job.ansible_job_id }}"
  register: job_result
  until: job_result.finished
  retries: 60
  delay: 30
```

## 9.4  Tags — Run Partial Playbooks

```
- name: Install Nginx
  ansible.builtin.package:
    name: nginx
    state: present
  tags:
    - nginx
    - install
    - packages

- name: Deploy Nginx config
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  tags:
    - nginx
    - config

# Run only tagged tasks:
ansible-playbook site.yml --tags "nginx"
ansible-playbook site.yml --tags "config,packages"
ansible-playbook site.yml --skip-tags "install"

# Special tags:
ansible-playbook site.yml --tags "all"    # default: run all
ansible-playbook site.yml --tags "never"  # only tasks tagged 'never'
```

## 9.5  Performance Optimization

```
# ansible.cfg — performance settings
[defaults]
forks = 20                        # parallel connections (default: 5)
gathering = smart                 # cache facts, don't re-gather
fact_caching = redis              # store facts in Redis
fact_caching_connection = localhost:6379:0
fact_caching_timeout = 7200       # 2 hour cache

[ssh_connection]
pipelining = True                 # biggest speed boost (30-50% faster)
                                  # requires: Defaults !requiretty in sudoers
ssh_args = -o ControlMaster=auto -o ControlPersist=30m

# In playbooks — skip facts if not needed
- name: Quick task
  hosts: all
  gather_facts: false             # skip fact gathering for speed
```

## 9.6  Testing with Molecule

Molecule is the industry-standard framework for testing Ansible roles. It spins up containers or VMs, runs your role, and verifies the outcome.

```
# Install
pip install molecule molecule-docker

# Initialize test scenario in a role
cd roles/nginx
molecule init scenario

# molecule/default/molecule.yml
platforms:
  - name: ubuntu22
    image: geerlingguy/docker-ubuntu2204-ansible
    pre_build_image: true
  - name: centos8
    image: geerlingguy/docker-centos8-ansible
    pre_build_image: true

# Run full test lifecycle
molecule test
# Stages: lint → create → converge → idempotence → verify → destroy

# Development workflow (keep containers running)
molecule converge   # apply the role
molecule verify     # run tests (uses testinfra or ansible assert)
molecule destroy    # clean up

# molecule/default/verify.yml
- name: Verify Nginx is running
  hosts: all
  tasks:
    - name: Check nginx service
      ansible.builtin.service_facts:
    - name: Assert nginx is running
      ansible.builtin.assert:
        that: ansible_facts.services['nginx'].state == 'running'
```

## 9.7  Ansible Lint — Code Quality

```
pip install ansible-lint

# Lint a playbook
ansible-lint site.yml

# Lint all playbooks and roles in current dir
ansible-lint

# .ansible-lint config file
warn_list:
  - experimental
skip_list:
  - yaml[line-length]  # skip specific rules
exclude_paths:
  - .git/
  - molecule/
```

### 🎯 INTERVIEW QUESTION

**Q: How do you implement zero-downtime deployments with Ansible?**

A: Use serial to update servers in batches. In pre_tasks, use delegate_to to remove each batch from the load balancer before updating. Apply updates in tasks. In post_tasks, run health checks (uri module with retries) before adding back to the load balancer. Set max_fail_percentage to abort the play if too many hosts fail. This ensures live traffic always has healthy servers serving it throughout the deployment.

### 🎯 INTERVIEW QUESTION

**Q: What is pipelining and how does it speed up Ansible?**

A: Pipelining reduces the number of SSH connections by combining multiple operations into a single SSH connection. Without pipelining, Ansible creates a temp file, copies it, executes it, then deletes it — 4 connections per task. With pipelining, it streams the module code directly, cutting SSH overhead by 30-50%. To enable: set pipelining = True in ansible.cfg and ensure requiretty is disabled in /etc/sudoers (add Defaults !requiretty).

---

# CHAPTER 10 - CI/CD Integration & Interview Prep

## 10.1  Project Directory Structure (Best Practice)

```
myproject/
├── ansible.cfg             # project-level config
├── site.yml                # master playbook (imports others)
├── webservers.yml          # webserver-specific playbook
├── dbservers.yml           # database-specific playbook
├── requirements.yml        # Galaxy roles and collections
│
├── inventory/
│   ├── production/
│   │   ├── hosts.yml
│   │   ├── group_vars/
│   │   │   ├── all/
│   │   │   │   ├── main.yml
│   │   │   │   └── secrets.yml   # Vault encrypted
│   │   │   └── webservers.yml
│   │   └── host_vars/
│   └── staging/
│       └── hosts.yml
│
├── roles/
│   ├── common/
│   ├── nginx/
│   ├── mysql/
│   └── app-deploy/
│
└── .ansible-lint
```

## 10.2  GitLab CI/CD Integration

**▶ .gitlab-ci.yml**

```
stages:
  - lint
  - test
  - deploy-staging
  - deploy-production

variables:
  ANSIBLE_FORCE_COLOR: "true"
  ANSIBLE_HOST_KEY_CHECKING: "false"

ansible-lint:
  stage: lint
  image: pipelinecomponents/ansible-lint:latest
  script:
    - ansible-lint site.yml

molecule-test:
  stage: test
  image: quay.io/ansible/molecule:latest
  services:
    - docker:dind
  script:
    - cd roles/nginx && molecule test

deploy-staging:
  stage: deploy-staging
  image: willhallonline/ansible:2.15-ubuntu-22.04
  before_script:
    - echo "$VAULT_PASS" > /tmp/.vault_pass
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
  script:
    - ansible-galaxy install -r requirements.yml
    - ansible-playbook
        -i inventory/staging/
        --vault-password-file /tmp/.vault_pass
        -e "app_version=$CI_COMMIT_TAG"
        site.yml
  after_script:
    - rm -f /tmp/.vault_pass
  environment: staging
  only:
    - main

deploy-production:
  stage: deploy-production
  script:
    - ansible-playbook -i inventory/production/ ...
  environment: production
  when: manual                  # require human approval
  only:
    - tags                      # only on version tags
```

## 10.3  GitHub Actions Integration

**▶ .github/workflows/deploy.yml**

```
name: Deploy with Ansible

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Ansible
        run: pip install ansible ansible-lint

      - name: Install Galaxy dependencies
        run: ansible-galaxy install -r requirements.yml

      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa

      - name: Create vault password file
        run: echo "${{ secrets.VAULT_PASSWORD }}" > ~/.vault_pass

      - name: Run playbook
        run: |
          ansible-playbook
            -i inventory/${{ inputs.environment }}/
            --vault-password-file ~/.vault_pass
            -e app_version=${{ github.sha }}
            site.yml
```

## 10.4  AWX & Ansible Automation Platform

AWX is the open-source upstream project for Red Hat Ansible Automation Platform (AAP). It provides a web UI, REST API, RBAC, scheduling, credential management, and audit logs on top of Ansible.

| Feature | AWX (Open Source) | AAP / Tower (Enterprise) |
| --- | --- | --- |
| License | Apache 2.0 — Free | Red Hat subscription |
| Support | Community only | Red Hat official support |
| Updates | Frequent, less stable | Quarterly, tested releases |
| SSO / LDAP | Basic | Full LDAP, SAML, OIDC |
| Clustering | Yes | Yes + mesh nodes |
| Best for | Dev/Lab use | Production enterprise |

## 10.5  Top 20 Interview Questions & Answers

### Architecture & Concepts

### 🎯 INTERVIEW QUESTION

**Q: Q1: What is the difference between import_tasks and include_tasks?**

A: import_tasks is static — processed at parse time before the play runs. This means you can use tags on imported tasks, but you cannot use variables that are only known at runtime (like register output). include_tasks is dynamic — processed at run time when the task is reached. You can use runtime variables, but tags only apply to the include task itself, not the tasks inside it. Use import_tasks for static task files, include_tasks when you need dynamic file names or conditional inclusion.

### 🎯 INTERVIEW QUESTION

**Q: Q2: What is the difference between import_playbook and include_playbook?**

A: Same static vs dynamic concept. import_playbook is pre-processed — playbooks are included before run time, so they can be fully listed with --list-tasks. include_playbook (now deprecated in favor of import_playbook for most use cases) is dynamic. For playbook orchestration, import_playbook is almost always the right choice.

### 🎯 INTERVIEW QUESTION

**Q: Q3: How does Ansible achieve parallelism?**

A: Ansible connects to multiple hosts simultaneously, controlled by the forks setting (default 5). With forks=10, Ansible runs each task on 10 hosts at the same time, then moves to the next task. Increase forks in ansible.cfg for faster execution. Async tasks allow long-running operations to run on all hosts simultaneously without blocking.

### Troubleshooting & Debugging

### 🎯 INTERVIEW QUESTION

**Q: Q4: How do you debug a failing Ansible playbook?**

A: 1) Add -v, -vv, -vvv, or -vvvv for increasing verbosity. 2) Use the debug module: debug: var=my_variable or debug: msg='value is {{ my_var }}'. 3) Use --check for a dry run (no changes made). 4) Use --diff to see exactly what would change in files. 5) Use --step to step through tasks one at a time interactively. 6) Use ansible-playbook --start-at-task 'task name' to resume from a specific task.

### 🎯 INTERVIEW QUESTION

**Q: Q5: What causes the 'UNREACHABLE' error?**

A: The managed node cannot be reached. Common causes: SSH service is down on the target, firewall blocking port 22, wrong ansible_host or ansible_port, wrong ansible_user, SSH key not copied to the target, host_key_checking is True and host is new/changed. Debug with: ansible host -m ping -vvv to see exact SSH errors.

### 🎯 INTERVIEW QUESTION

**Q: Q6: What is the difference between FAILED and UNREACHABLE in Ansible?**

A: UNREACHABLE means Ansible could not connect to the host (network/SSH issue). FAILED means the connection succeeded but the task failed on the host (module error, wrong permissions, non-zero return code, etc.). UNREACHABLE hosts are skipped for the rest of the play. FAILED hosts can be retried (--limit @site.retry).

### Security

### 🎯 INTERVIEW QUESTION

**Q: Q7: How do you prevent secrets from appearing in Ansible logs?**

A: 1) Use no_log: true on tasks that handle secrets. 2) Set no_log globally in ansible.cfg (but this hides all output which is too aggressive). 3) Use Ansible Vault for encrypted variables. 4) Use register with no_log: true when storing sensitive command output. Example: ansible.builtin.command: cmd args: register: sensitive_result no_log: true

### 🎯 INTERVIEW QUESTION

**Q: Q8: What is become and when do you need it?**

A: become: true enables privilege escalation — Ansible runs the task as another user (typically root via sudo). Required when tasks need root permissions (installing packages, modifying system files, managing services). Configure the method with become_method (sudo, su, pbrun, pfexec, doas, dzdo). Can be set globally in ansible.cfg, at play level, or per-task. Use become_user to become a user other than root.

### Performance & Scaling

### 🎯 INTERVIEW QUESTION

**Q: Q9: How do you manage 500+ hosts with Ansible?**

A: 1) Increase forks (forks=30 or more). 2) Enable pipelining (pipelining=True). 3) Enable fact caching (Redis or memcached) so facts aren't re-gathered on every run. 4) Use async tasks for long-running operations. 5) Use dynamic inventory to avoid maintaining huge static files. 6) Split large playbooks and use --limit or tags to target subsets. 7) Consider AWX/AAP for centralized execution with distributed capacity.

### 🎯 INTERVIEW QUESTION

**Q: Q10: What is fact caching and how does it help?**

A: Fact caching stores gathered facts (from the setup module) in a cache (Redis, memcached, JSON files) so Ansible doesn't need to re-gather facts on every playbook run. This saves time on every run after the first. Configure in ansible.cfg: gathering = smart, fact_caching = redis, fact_caching_connection = localhost:6379:0, fact_caching_timeout = 86400. Smart gathering means: gather facts only if no cache entry exists.

### Advanced Features

### 🎯 INTERVIEW QUESTION

**Q: Q11: What are Ansible Collections and how are they different from roles?**

A: Collections are the newer, broader packaging format that can include roles, modules, plugins, playbooks, and documentation together. A collection has a namespace (e.g., amazon.aws, community.general). Roles are just a way to organize tasks/vars/handlers within a single project or collection. Think of it as: collection = library, role = function within a library. Install collections with ansible-galaxy collection install.

### 🎯 INTERVIEW QUESTION

**Q: Q12: How do you pass variables between roles?**

A: Variables set via set_fact are available to all subsequent tasks and roles in the same play. Variables set in a role's defaults or vars are available within that role. To share across roles: use set_fact in the first role, or put shared variables in group_vars/all.yml. You can also use register in one role and the variable will be available in subsequent roles and tasks in the same play.

### 🎯 INTERVIEW QUESTION

**Q: Q13: What is the Ansible Tower / AWX REST API used for?**

A: The API allows external tools to trigger Ansible jobs programmatically. CI/CD pipelines, monitoring systems, and custom scripts can launch playbooks, check job status, manage inventory, rotate credentials, and retrieve output — all without SSH access to the Ansible control node. This is how teams integrate Ansible with Jenkins, GitLab, ServiceNow, and Jira.

### 🎯 INTERVIEW QUESTION

**Q: Q14: How do you handle different configurations for multiple environments (dev/staging/prod)?**

A: Use separate inventory directories (inventory/dev, inventory/staging, inventory/production) each with their own group_vars and host_vars. Common variables go in group_vars/all.yml (shared across environments), environment-specific variables override them in each environment's group_vars/all.yml. Vault-encrypt environment-specific secrets. Pass the correct inventory at run time: ansible-playbook -i inventory/production/ site.yml.

### 🎯 INTERVIEW QUESTION

**Q: Q15: What is check mode (--check) and when is it useful?**

A: Check mode (dry run) runs the playbook without making any actual changes to the systems. Ansible predicts what would change and reports it. Useful before risky changes, for code review, or in CI to validate syntax and logic. Note: not all modules support check mode (command and shell don't). Tasks that skip in check mode show 'skipped' in the output. Use --diff together with --check to see file content differences.

## 10.6  Quick Reference — Common Commands

```
# Ad-hoc commands
ansible all -m ping                          # test connectivity
ansible all -m setup                         # gather and display facts
ansible webservers -m shell -a "df -h"       # run shell command
ansible all -m package -a "name=vim state=present" -b

# Playbook commands
ansible-playbook site.yml                    # run playbook
ansible-playbook site.yml -i inventory/prod/ # specific inventory
ansible-playbook site.yml --check --diff     # dry run with diff
ansible-playbook site.yml --tags "config"    # run tagged tasks
ansible-playbook site.yml --limit "web1"     # target one host
ansible-playbook site.yml -e "env=staging"   # extra vars
ansible-playbook site.yml -v / -vv / -vvv   # verbosity levels
ansible-playbook site.yml --ask-vault-pass   # prompt vault password

# Inventory commands
ansible-inventory --list -i inventory/       # show all hosts/vars JSON
ansible-inventory --graph -i inventory/      # show host tree
ansible all --list-hosts                     # list targeted hosts

# Galaxy commands
ansible-galaxy role init myrole              # create role skeleton
ansible-galaxy install -r requirements.yml   # install requirements
ansible-galaxy collection install amazon.aws # install collection
ansible-galaxy list                          # list installed roles

# Vault commands
ansible-vault encrypt secrets.yml            # encrypt file
ansible-vault decrypt secrets.yml            # decrypt file
ansible-vault edit secrets.yml               # edit encrypted file
ansible-vault view secrets.yml               # view encrypted file
ansible-vault encrypt_string 'secret' --name 'var_name'

# Debugging
ansible all -m ping -vvv                     # verbose ping
ansible-config dump --only-changed           # show non-default config
ansible-doc -l                               # list all modules
ansible-doc ansible.builtin.template         # module docs
ansible-lint site.yml                        # lint playbook
```

> [!TIP]
> **💡 Pro Tip**
> Before every interview: Practice writing a complete playbook from scratch — install a package, deploy a config from template, start a service, use a handler. This is the #1 practical test question in Ansible interviews.

— End of Ansible DevOps Notes —

