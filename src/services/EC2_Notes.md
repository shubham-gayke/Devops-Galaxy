## 3.2 EC2 - Elastic Compute Cloud

### 1. Overview

#### 🎯 What is EC2?

**Amazon Elastic Compute Cloud (EC2)** provides scalable computing capacity in the AWS Cloud. It allows you to launch virtual servers (called instances) within minutes, giving you complete control over the computing resources without investing in hardware upfront.

**Think of EC2 as:** Renting a computer in the cloud that you can configure exactly how you want.

#### 🤔 Why Do We Need It?

**Traditional Server Problems:**
- ❌ Buy physical servers (expensive upfront cost)
- ❌ Wait weeks/months for delivery
- ❌ Maintain cooling, power, security
- ❌ Guess capacity needs (over-provision or under-provision)
- ❌ Pay for idle servers
- ❌ Hardware failures require manual intervention

**EC2 Solutions:**
- ✅ Launch servers in minutes (not weeks)
- ✅ Pay only for running time (per second billing)
- ✅ Scale up/down based on demand
- ✅ No hardware maintenance
- ✅ Multiple instance types for different workloads
- ✅ Global infrastructure (deploy worldwide)

#### 🔧 What Problem Does It Solve?

**Problems:**
- Need to host applications/websites
- Processing large amounts of data
- Running batch jobs
- Testing and development environments
- Handling variable traffic (peak seasons)
- Disaster recovery

**EC2 Solutions:**
- Flexible virtual servers with various configurations
- Auto Scaling for traffic spikes
- Pay-as-you-go pricing
- Launch/terminate instances on demand
- Global deployment in minutes

#### ⭐ Key Features

- **Elasticity:** Scale resources up or down automatically
- **Complete Control:** Root access, install any software
- **Flexible Pricing:** On-Demand, Reserved, Spot, Savings Plans
- **Secure:** Integration with VPC, Security Groups, IAM
- **Reliable:** 99.99% SLA, multiple availability zones
- **High Performance:** Various instance types (CPU, memory, GPU optimized)
- **Multiple OS:** Linux, Windows, Mac OS
- **Storage Options:** EBS, Instance Store, EFS

---

### 2. Core Components

#### 💻 EC2 Instance

**Definition:** A virtual server running in AWS cloud.

**Purpose:**
- Run applications
- Host websites
- Process data
- Development/testing
- Batch processing

**How It Works:**
- Select AMI (operating system image)
- Choose instance type (CPU, memory, storage)
- Configure network and security
- Launch and connect via SSH/RDP

**Real-World Example:**
```
Scenario: E-commerce website
- Instance Type: t3.medium (2 vCPU, 4 GB RAM)
- OS: Amazon Linux 2
- Storage: 30 GB SSD (EBS)
- Running: Web server (Nginx) + Application (Node.js)
- Cost: ~$30/month (on-demand)
```

---

#### 🖼️ AMI - Amazon Machine Image

**Definition:** Template containing OS, application server, and applications to launch an instance.

**Purpose:**
- Quick instance launch with pre-configured software
- Create custom images for replication
- Share images within organization or publicly

**Types:**

| Type | Description | Example |
|------|-------------|---------|
| **AWS Provided** | Pre-configured by AWS | Amazon Linux 2, Ubuntu, Windows Server |
| **Marketplace** | Third-party vendors | WordPress, MongoDB, Docker |
| **Community** | Shared by AWS users | Custom configurations |
| **Custom (My AMIs)** | Created by you | Your application stack |

**How to Create Custom AMI:**
```bash
# 1. Configure EC2 instance with your software
# 2. Create AMI
aws ec2 create-image \
  --instance-id i-1234567890abcdef0 \
  --name "MyApp-v1.0" \
  --description "Web server with Node.js app"

# 3. Launch new instances from AMI
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro
```

**Best Practice:** Create AMIs after configuring instances to enable quick scaling.

---

#### 🔧 Instance Types

**Definition:** Various configurations of CPU, memory, storage, and networking capacity.

**Purpose:** Match instance to workload requirements.

**Categories:**

**1. General Purpose (T, M series)**
- **Use Case:** Web servers, small databases, dev/test
- **Examples:** 
  - t3.micro: 2 vCPU, 1 GB RAM (Free Tier)
  - t3.medium: 2 vCPU, 4 GB RAM
  - m5.large: 2 vCPU, 8 GB RAM

**2. Compute Optimized (C series)**
- **Use Case:** High-performance computing, batch processing, gaming
- **Examples:**
  - c5.large: 2 vCPU, 4 GB RAM
  - c5.xlarge: 4 vCPU, 8 GB RAM

**3. Memory Optimized (R, X series)**
- **Use Case:** In-memory databases, real-time analytics
- **Examples:**
  - r5.large: 2 vCPU, 16 GB RAM
  - x1e.xlarge: 4 vCPU, 122 GB RAM

**4. Storage Optimized (I, D, H series)**
- **Use Case:** NoSQL databases, data warehouses
- **Examples:**
  - i3.large: 2 vCPU, 15 GB RAM, 475 GB NVMe SSD
  - d2.xlarge: 4 vCPU, 30 GB RAM, 6 TB HDD

**5. Accelerated Computing (P, G, F series)**
- **Use Case:** Machine learning, graphics rendering, video encoding
- **Examples:**
  - p3.2xlarge: 8 vCPU, 61 GB RAM, 1 GPU
  - g4dn.xlarge: 4 vCPU, 16 GB RAM, 1 GPU

**Naming Convention:**
```
Example: m5.2xlarge

m     = Instance Family (General Purpose)
5     = Generation
2xlarge = Size (8 vCPU, 32 GB RAM)

Sizes: nano < micro < small < medium < large < xlarge < 2xlarge < 4xlarge...
```

---

#### 🔐 Security Groups

**Definition:** Virtual firewall controlling inbound and outbound traffic for EC2 instances.

**Purpose:**
- Control who can access your instance
- Define allowed protocols and ports
- Protect against unauthorized access

**How It Works:**
- Stateful (return traffic automatically allowed)
- Allow rules only (no deny rules)
- Applied at instance level

**Real-World Example:**

```bash
# Web Server Security Group
Inbound Rules:
┌─────────┬──────────┬──────┬────────────────┬─────────────────┐
│ Type    │ Protocol │ Port │ Source         │ Description     │
├─────────┼──────────┼──────┼────────────────┼─────────────────┤
│ HTTP    │ TCP      │ 80   │ 0.0.0.0/0      │ Public web      │
│ HTTPS   │ TCP      │ 443  │ 0.0.0.0/0      │ Secure web      │
│ SSH     │ TCP      │ 22   │ 203.0.113.0/24 │ Admin access    │
└─────────┴──────────┴──────┴────────────────┴─────────────────┘

Outbound Rules:
All traffic allowed to 0.0.0.0/0 (default)
```

**Important Rules:**
- ✅ Allow specific IPs for SSH (not 0.0.0.0/0)
- ✅ Use HTTPS (443) instead of HTTP (80) when possible
- ✅ Only open required ports
- ✅ Use descriptive names
- ❌ Never expose database ports (3306, 5432) to internet

#### 💾 EBS - Elastic Block Store

**Definition:** Network-attached storage volumes for EC2 instances.

**Purpose:**
- Persistent storage (data survives instance termination)
- High performance for databases and applications
- Snapshots for backup

**Types:**

| Type | IOPS | Throughput | Use Case | Price |
|------|------|------------|----------|-------|
| **gp3 (SSD)** | 3,000-16,000 | 125-1,000 MB/s | General purpose, boot volumes | $ |
| **gp2 (SSD)** | 3-16,000 | - | General purpose (older gen) | $ |
| **io2/io1 (SSD)** | Up to 64,000 | Up to 1,000 MB/s | Mission-critical, databases | $$$ |
| **st1 (HDD)** | 500 | 500 MB/s | Big data, data warehouse | $ |
| **sc1 (HDD)** | 250 | 250 MB/s | Cold storage, archives | $ |

**Key Features:**
- Can attach multiple EBS volumes to one instance
- Can detach and reattach to different instances
- Snapshots stored in S3 (incremental backups)
- Encryption available

**Real-World Example:**
```bash
# Create 100 GB gp3 volume
aws ec2 create-volume \
  --size 100 \
  --volume-type gp3 \
  --availability-zone us-east-1a

# Attach to instance
aws ec2 attach-volume \
  --volume-id vol-1234567890abcdef0 \
  --instance-id i-1234567890abcdef0 \
  --device /dev/sdf

# Create snapshot
aws ec2 create-snapshot \
  --volume-id vol-1234567890abcdef0 \
  --description "Daily backup"
```

---

#### 📡 Elastic IP

**Definition:** Static IPv4 address designed for dynamic cloud computing.

**Purpose:**
- Fixed public IP that doesn't change when instance stops/starts
- Mask instance or availability zone failures
- DNS mapping

**How It Works:**
- Allocate Elastic IP from AWS pool
- Associate with EC2 instance or network interface
- Can quickly remap to another instance

**Important:**
- ⚠️ **Charged when NOT associated** with running instance
- ⚠️ Limited to 5 Elastic IPs per region (can request increase)

**Use Case:**
```
Scenario: Web server needs fixed IP for DNS

Without Elastic IP:
- Stop instance → Public IP changes
- Customers can't reach website

With Elastic IP:
- Stop/start instance → IP stays same
- DNS always points to same IP
```

---

#### 🔌 ENI - Elastic Network Interface

**Definition:** Virtual network card for EC2 instances.

**Purpose:**
- Multiple network interfaces per instance
- Move interfaces between instances
- Attach private IPs, security groups

**Attributes:**
- Primary private IPv4 address
- Secondary private IPv4 addresses
- Elastic IP per private IPv4
- Security groups
- MAC address

**Use Case:**
```
Scenario: Dual-homed instance (management + application)

eth0 (Primary ENI):
- Private IP: 10.0.1.10
- Public IP: 54.123.45.67
- Purpose: Application traffic

eth1 (Secondary ENI):
- Private IP: 10.0.2.20
- Purpose: Management/backup
```

---

#### 🔑 Key Pairs

**Definition:** Public-private key cryptography for secure access.

**Purpose:**
- Secure SSH access (Linux)
- Decrypt Windows administrator password (Windows)

**How It Works:**
```
1. AWS stores public key
2. You download and store private key (.pem file)
3. Connect using private key

# Connect to Linux instance
ssh -i my-key.pem ec2-user@54.123.45.67

# Connect to Windows (decrypt password)
Get-EC2PasswordData -PemFile my-key.pem -InstanceId i-1234567890abcdef0
```

**Important:**
- ⚠️ Private key shown ONLY ONCE at creation
- ⚠️ If lost, cannot recover (must create new key pair)
- ✅ Store securely (not in Git, not in plaintext)
- ✅ Use different keys for dev/prod

---

#### 📊 User Data

**Definition:** Script that runs automatically when instance launches.

**Purpose:**
- Install software
- Configure instance
- Start services
- Download files

**Example:**
```bash
#!/bin/bash
# This runs on first boot

# Update system
yum update -y

# Install web server
yum install -y httpd

# Start web server
systemctl start httpd
systemctl enable httpd

# Create simple webpage
echo "<h1>Hello from EC2!</h1>" > /var/www/html/index.html
```

**How to Add:**
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --user-data file://startup-script.sh
```

**Important:**
- Runs only on first boot (unless configured otherwise)
- Runs as root user
- Logs in `/var/log/cloud-init-output.log`

---

### 3. How to Create and Configure

#### 🖥️ AWS Console - Launch EC2 Instance

**Step 1: Choose AMI**
```
EC2 Dashboard → Instances → Launch Instance

AMI Selection:
- Amazon Linux 2 AMI
- Ubuntu Server 20.04 LTS
- Windows Server 2019
- Red Hat Enterprise Linux
- Or choose from Marketplace
```

**Step 2: Choose Instance Type**
```
Instance Type: t3.micro (Free Tier eligible)
- 2 vCPU
- 1 GiB Memory
- EBS storage only

For production:
- t3.medium (web apps)
- m5.large (general purpose)
- c5.large (compute intensive)
```

**Step 3: Configure Instance**
```
Number of instances: 1
Network: Default VPC
Subnet: us-east-1a (choose AZ)
Auto-assign Public IP: Enable
IAM role: Select if needed
User data: Add startup script (optional)
```

**Step 4: Add Storage**
```
Root Volume:
- Size: 8 GB (default) → Increase to 30 GB
- Volume Type: gp3 (recommended)
- Delete on Termination: Yes ✓
- Encryption: Enable (optional)

Additional Volumes: Add if needed
```

**Step 5: Add Tags**
```
Key: Name          | Value: WebServer-Prod
Key: Environment   | Value: Production
Key: Owner         | Value: john@company.com
Key: Project       | Value: Website
```

**Step 6: Configure Security Group**
```
Create new security group:
Name: web-server-sg
Description: Allow HTTP, HTTPS, SSH

Inbound Rules:
┌──────┬──────────┬──────┬─────────────┬──────────────────┐
│ Type │ Protocol │ Port │ Source      │ Description      │
├──────┼──────────┼──────┼─────────────┼──────────────────┤
│ SSH  │ TCP      │ 22   │ My IP       │ Admin access     │
│ HTTP │ TCP      │ 80   │ 0.0.0.0/0   │ Web traffic      │
│ HTTPS│ TCP      │ 443  │ 0.0.0.0/0   │ Secure web       │
└──────┴──────────┴──────┴─────────────┴──────────────────┘
```

**Step 7: Review and Launch**
```
Review all settings
Click "Launch"

Key Pair Selection:
- Create new key pair: "my-ec2-key"
- Download .pem file
- Store securely

Click "Launch Instances"
```

**Step 8: Connect to Instance**
```
# Linux/Mac
chmod 400 my-ec2-key.pem
ssh -i my-ec2-key.pem ec2-user@54.123.45.67

# Windows (use PuTTY or PowerShell)
ssh -i my-ec2-key.pem ec2-user@54.123.45.67
```

---

#### 💻 AWS CLI - Launch EC2 Instance

**Prerequisites:**
```bash
# Install AWS CLI and configure
aws configure
```

**1. Launch Instance (Basic)**
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name my-ec2-key \
  --security-group-ids sg-0123456789abcdef0 \
  --subnet-id subnet-0123456789abcdef0 \
  --count 1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MyWebServer}]'
```

**2. Launch with User Data**
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name my-ec2-key \
  --security-group-ids sg-0123456789abcdef0 \
  --user-data file://startup-script.sh
```

**3. Launch with IAM Role**
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --iam-instance-profile Name=EC2-S3-Access-Profile \
  --key-name my-ec2-key
```

**4. Describe Instances**
```bash
# List all instances
aws ec2 describe-instances

# List specific instance
aws ec2 describe-instances --instance-ids i-1234567890abcdef0

# Filter by tag
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=WebServer"

# Get only instance IDs and states
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' \
  --output table
```

**5. Start/Stop/Terminate**
```bash
# Stop instance
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Start instance
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Reboot instance
aws ec2 reboot-instances --instance-ids i-1234567890abcdef0

# Terminate instance (DELETE - irreversible!)
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0
```

**6. Create and Attach EBS Volume**
```bash
# Create volume
aws ec2 create-volume \
  --size 50 \
  --volume-type gp3 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=volume,Tags=[{Key=Name,Value=MyDataVolume}]'

# Attach volume
aws ec2 attach-volume \
  --volume-id vol-1234567890abcdef0 \
  --instance-id i-1234567890abcdef0 \
  --device /dev/sdf

# Create snapshot
aws ec2 create-snapshot \
  --volume-id vol-1234567890abcdef0 \
  --description "Daily backup $(date +%Y-%m-%d)"
```

**7. Create AMI from Instance**
```bash
# Create custom AMI
aws ec2 create-image \
  --instance-id i-1234567890abcdef0 \
  --name "MyApp-v1.0-$(date +%Y%m%d)" \
  --description "Web server with configured app" \
  --no-reboot  # Keep instance running

# List your AMIs
aws ec2 describe-images --owners self

# Launch from custom AMI
aws ec2 run-instances \
  --image-id ami-0123456789abcdef0 \
  --instance-type t3.micro \
  --count 3  # Launch 3 instances
```

**8. Manage Security Groups**
```bash
# Create security group
aws ec2 create-security-group \
  --group-name web-server-sg \
  --description "Web server security group" \
  --vpc-id vpc-1234567890abcdef0

# Add inbound rule (SSH)
aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.0/24

# Add inbound rule (HTTP)
aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Remove rule
aws ec2 revoke-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
```

**9. Allocate and Associate Elastic IP**
```bash
# Allocate Elastic IP
aws ec2 allocate-address --domain vpc

# Associate with instance
aws ec2 associate-address \
  --instance-id i-1234567890abcdef0 \
  --allocation-id eipalloc-1234567890abcdef0

# Disassociate
aws ec2 disassociate-address \
  --association-id eipassoc-1234567890abcdef0

# Release Elastic IP
aws ec2 release-address \
  --allocation-id eipalloc-1234567890abcdef0
```

**10. Monitor Instance**
```bash
# Get instance status
aws ec2 describe-instance-status \
  --instance-ids i-1234567890abcdef0

# Get console output (troubleshooting)
aws ec2 get-console-output \
  --instance-id i-1234567890abcdef0

# Get CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average
```

---

### 4. Service Workflow

#### 🔄 EC2 Instance Launch Process

**Internal Flow:**

```
1. User Request
   ↓
2. IAM Authentication
   - Validates credentials
   - Checks permissions (ec2:RunInstances)
   ↓
3. API Gateway
   - Accepts request
   - Routes to EC2 service
   ↓
4. EC2 Service
   - Validates request parameters
   - Checks resource limits/quotas
   - Verifies AMI availability
   ↓
5. Resource Allocation
   - Selects physical server
   - Allocates compute resources
   - Reserves memory and CPU
   ↓
6. Storage Setup
   - Creates EBS volume from AMI
   - Attaches to instance
   ↓
7. Network Configuration
   - Assigns private IP
   - Assigns public IP (if enabled)
   - Attaches ENI
   - Configures security groups
   ↓
8. Instance Initialization
   - Boots operating system
   - Runs user data script
   - Sets hostname
   ↓
9. Instance Running
   - Health checks pass
   - State: "running"
   - Billing starts
   ↓
10. User Access
    - SSH/RDP connection available
    - Applications can start
```

**State Transitions:**

```
pending → running → stopping → stopped
                ↓
              shutting-down → terminated
```

---

### 5. Integration with Other AWS Services

#### 🔗 EC2 + IAM
- **Use Case:** Secure access and permissions
- **How:** Attach IAM roles to EC2 for accessing S3, DynamoDB, etc.
- **Benefit:** No hardcoded credentials

#### 🔗 EC2 + VPC
- **Use Case:** Network isolation and security
- **How:** Launch instances in private subnets, use NAT Gateway
- **Benefit:** Secure architecture, control traffic flow

#### 🔗 EC2 + ELB (Load Balancer)
- **Use Case:** Distribute traffic across multiple instances
- **How:** Create ALB/NLB, register EC2 instances as targets
- **Benefit:** High availability, automatic failover

#### 🔗 EC2 + Auto Scaling
- **Use Case:** Automatically scale based on demand
- **How:** Create Auto Scaling Group with launch template
- **Benefit:** Cost optimization, handle traffic spikes

#### 🔗 EC2 + CloudWatch
- **Use Case:** Monitoring and alerting
- **How:** CloudWatch agent collects metrics, create alarms
- **Benefit:** Proactive monitoring, automated responses

#### 🔗 EC2 + S3
- **Use Case:** Store and retrieve files
- **How:** Use IAM role, AWS CLI/SDK to interact
- **Benefit:** Scalable storage, backup solution

---

### 6. Real-World Project Example

#### 🏢 Project: High-Availability Web Application

**Business Requirement:**
E-commerce website needs:
- Handle 10,000 concurrent users
- 99.9% uptime
- Auto-scale during sales
- Secure payment processing
- Fast page loads globally

**Architecture:**

```
Internet
    ↓
Route 53 (DNS)
    ↓
CloudFront (CDN)
    ↓
Application Load Balancer
    ↓
┌────────────────────────────────┐
│  Auto Scaling Group             │
│  ┌──────────┐  ┌──────────┐   │
│  │ EC2 (AZ1)│  │ EC2 (AZ2)│   │
│  │ t3.medium│  │ t3.medium│   │
│  └──────────┘  └──────────┘   │
└────────────────────────────────┘
    ↓
RDS Multi-AZ (PostgreSQL)
    ↓
ElastiCache Redis (Sessions)
    ↓
S3 (Static Assets + Backups)
```

**Implementation:**

1. **Create Launch Template**
```bash
aws ec2 create-launch-template \
  --launch-template-name ecommerce-web \
  --version-description "v1.0" \
  --launch-template-data '{
    "ImageId": "ami-0c55b159cbfafe1f0",
    "InstanceType": "t3.medium",
    "KeyName": "prod-key",
    "IamInstanceProfile": {"Name": "EC2-App-Role"},
    "SecurityGroupIds": ["sg-web"],
    "UserData": "..."
  }'
```

2. **Create Auto Scaling Group**
```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name ecommerce-asg \
  --launch-template LaunchTemplateName=ecommerce-web \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --vpc-zone-identifier "subnet-az1,subnet-az2" \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

3. **Configure Scaling Policies**
```bash
# Scale up when CPU > 70%
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name ecommerce-asg \
  --policy-name scale-up \
  --scaling-adjustment 2 \
  --adjustment-type ChangeInCapacity

# Scale down when CPU < 30%
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name ecommerce-asg \
  --policy-name scale-down \
  --scaling-adjustment -1 \
  --adjustment-type ChangeInCapacity
```

**Why EC2 is Critical Here:**
- Runs application code
- Processes user requests
- Connects to database
- Scales automatically
- High availability across AZs

---

### 7. Best Practices & Rules

#### ✅ Instance Management

1. **Use Latest Generation Instance Types**
   - t3 instead of t2
   - m5 instead of m4
   - Better performance, lower cost

2. **Right-Size Instances**
   - Start small, monitor, adjust
   - Use CloudWatch metrics
   - Don't over-provision

3. **Use IAM Roles, Not Access Keys**
   - Attach IAM role to instance
   - Never hardcode credentials
   - Automatic credential rotation

4. **Enable Detailed Monitoring** (production)
   - 1-minute metrics instead of 5-minute
   - Faster detection of issues
   - Small additional cost

5. **Tag Everything**
   ```
   Name: web-server-prod-01
   Environment: Production
   Owner: team@company.com
   Project: Ecommerce
   CostCenter: Marketing
   ```

#### 🛡️ Security Best Practices

1. **Security Groups**
   - ✅ Allow only required ports
   - ✅ Restrict SSH to specific IPs
   - ✅ Use descriptive names
   - ❌ Never use 0.0.0.0/0 for SSH/RDP

2. **Key Pairs**
   - ✅ Use different keys for dev/prod
   - ✅ Store securely (not in Git)
   - ✅ Rotate regularly
   - ❌ Never share private keys

3. **Patches and Updates**
   - ✅ Enable automatic updates
   - ✅ Use AWS Systems Manager Patch Manager
   - ✅ Test patches in dev first

4. **Encryption**
   - ✅ Enable EBS encryption
   - ✅ Encrypt snapshots
   - ✅ Use HTTPS for data in transit

#### 💰 Cost Optimization

1. **Use Reserved Instances for Steady State**
   - 1 or 3-year commitment
   - Up to 75% savings
   - For predictable workloads

2. **Use Spot Instances for Fault-Tolerant Workloads**
   - Up to 90% savings
   - For batch jobs, data processing
   - Can be interrupted

3. **Stop Unused Instances**
   - No charge for stopped instances (only EBS storage)
   - Use Lambda to auto-stop dev instances at night

4. **Use Auto Scaling**
   - Scale down during low traffic
   - Pay only for needed capacity

5. **Delete Unused Resources**
   - Unattached EBS volumes
   - Old snapshots
   - Unassociated Elastic IPs

#### ⚠️ Common Mistakes to Avoid

| Mistake | Why Bad | Solution |
|---------|---------|----------|
| **Leaving SSH open to world** | Security breach | Restrict to specific IPs |
| **Not backing up data** | Data loss | Regular snapshots, AMIs |
| **Using root account** | No audit trail | Use IAM users/roles |
| **Hardcoding credentials** | Security risk | Use IAM roles |
| **Not tagging resources** | Can't track costs | Tag everything |
| **Over-provisioning** | Wasted money | Right-size, monitor |
| **Single AZ deployment** | No high availability | Use multiple AZs |
| **Not monitoring** | Issues go unnoticed | CloudWatch alarms |

---

### 8. Monitoring & Troubleshooting

#### 📊 CloudWatch Metrics (Default)

| Metric | Description | Threshold |
|--------|-------------|-----------|
| **CPUUtilization** | CPU usage % | Alert if > 80% |
| **NetworkIn/Out** | Network traffic | Monitor for DDoS |
| **DiskReadOps/WriteOps** | Disk operations | Check I/O bottlenecks |
| **StatusCheckFailed** | Instance health | Alert immediately |

#### 🔍 Common Issues

**Issue 1: Cannot Connect via SSH**

**Symptoms:**
```
ssh: connect to host 54.123.45.67 port 22: Connection timed out
```

**Troubleshooting:**
```bash
1. Check Security Group
   - Is port 22 open?
   - Is your IP allowed?

2. Check Instance Status
   aws ec2 describe-instance-status --instance-ids i-xxx

3. Check Network ACL
   - Is inbound/outbound traffic allowed?

4. Check Key Pair
   - Using correct .pem file?
   - Correct permissions (chmod 400)?

5. Check Public IP
   - Does instance have public IP?
   - Is Elastic IP associated?
```

**Issue 2: Instance Status Check Failed**

**Symptoms:**
- Status: "impaired"
- Cannot access instance

**Solution:**
```bash
# 1. Stop and start instance (not reboot!)
aws ec2 stop-instances --instance-ids i-xxx
aws ec2 start-instances --instance-ids i-xxx

# 2. If persists, check system log
aws ec2 get-console-output --instance-ids i-xxx

# 3. Last resort: recover from snapshot
```

**Issue 3: High CPU Usage**

**Troubleshooting:**
```bash
# SSH into instance
ssh -i key.pem ec2-user@ip

# Check processes
top
htop

# Check specific process
ps aux | grep process-name

# Kill runaway process
kill -9 PID

# Long term: upgrade instance type or optimize code
```

---

### 9. Interview Questions

#### 🟢 Beginner

**Q1: What is EC2?**
```
Amazon Elastic Compute Cloud provides virtual servers in the cloud.
You can launch instances with various configurations (CPU, memory, storage)
and pay only for what you use.
```

**Q2: What are the different EC2 pricing models?**
```
1. On-Demand: Pay per second, no commitment
2. Reserved: 1-3 year commitment, up to 75% discount
3. Spot: Bid for unused capacity, up to 90% discount
4. Savings Plans: Flexible commitment, similar savings to Reserved
5. Dedicated Hosts: Physical server, compliance requirements
```

**Q3: What is the difference between Stop and Terminate?**
```
Stop:
- Instance can be restarted
- EBS volumes preserved
- No compute charges (only storage)
- Can change instance type
- Elastic IP remains associated

Terminate:
- Instance deleted permanently
- EBS volumes deleted (if delete-on-termination enabled)
- Cannot recover
- Elastic IP disassociated
```

**Q4: What is an AMI?**
```
Amazon Machine Image - template containing:
- Operating system
- Application server
- Applications
- Configuration

Used to launch instances quickly with pre-configured setup.
```

**Q5: What is a Security Group?**
```
Virtual firewall controlling inbound/outbound traffic.

Features:
- Stateful (return traffic auto-allowed)
- Allow rules only (no deny)
- Applied at instance level
- Multiple can be attached to one instance
```

#### 🟡 Intermediate

**Q6: How does EC2 Auto Scaling work?**
```
Auto Scaling automatically adjusts number of instances based on:
- CloudWatch metrics (CPU, network, custom)
- Schedule (time-based)
- Target tracking (maintain metric at target)

Components:
1. Launch Template/Configuration
2. Auto Scaling Group
3. Scaling Policies
4. CloudWatch Alarms

Example: Scale out when CPU > 70%, scale in when CPU < 30%
```

**Q7: Explain EBS vs Instance Store**
```
EBS (Elastic Block Store):
✅ Persistent (survives termination)
✅ Can detach/reattach
✅ Snapshots for backup
✅ Multiple types (gp3, io2, st1, sc1)
❌ Network attached (slight latency)

Instance Store:
✅ Very high IOPS
✅ No additional cost
✅ Directly attached to host
❌ Ephemeral (lost on stop/terminate)
❌ Cannot detach/reattach

Use EBS for databases, Instance Store for cache/temp data.
```

**Q8: What are Placement Groups?**
```
Control how instances are placed on underlying hardware:

1. Cluster: 
   - Same AZ, close proximity
   - Low latency, high throughput
   - Use: HPC, big data

2. Spread:
   - Different hardware, different AZs
   - Reduces correlated failures
   - Max 7 instances per AZ
   - Use: Critical applications

3. Partition:
   - Groups of instances on separate racks
   - Up to 7 partitions per AZ
   - Use: Hadoop, Cassandra, Kafka
```

#### 🔴 Advanced

**Q9: How do you migrate EC2 between regions?**
```
Method 1: AMI Copy
1. Create AMI from source instance
2. Copy AMI to target region
   aws ec2 copy-image --source-region us-east-1 --region us-west-2
3. Launch instance from copied AMI

Method 2: Snapshot Copy
1. Create snapshot of EBS
2. Copy snapshot to target region
3. Create volume from snapshot
4. Attach to new instance

Method 3: AWS Application Migration Service
- Automated, continuous replication
- Minimal downtime
```

**Q10: Explain EC2 hibernation**
```
Hibernation saves RAM contents to EBS, then stops instance.

Process:
1. Instance hibernates
2. RAM saved to root EBS volume
3. Instance stops
4. No compute charges

On start:
1. RAM loaded from EBS
2. Processes resume exactly where they left off

Requirements:
- Supported instance types only
- Root volume must be encrypted
- Must be enabled at launch
- Max hibernation: 60 days

Use case: Long-running processes, avoid restart time
```

---

### 10. Quick Revision Sheet

#### 📌 EC2 Essentials

| Concept | Key Points |
|---------|-----------|
| **Instance Types** | T (burstable), M (general), C (compute), R (memory), I/D/H (storage), P/G/F (GPU) |
| **Pricing** | On-Demand, Reserved (75% off), Spot (90% off), Savings Plans |
| **Storage** | EBS (persistent), Instance Store (ephemeral) |
| **Networking** | ENI, Elastic IP, Security Groups |
| **Lifecycle** | pending → running → stopping → stopped → terminated |

#### 💻 Essential Commands

```bash
# Launch
aws ec2 run-instances --image-id ami-xxx --instance-type t3.micro

# List
aws ec2 describe-instances

# Stop/Start
aws ec2 stop-instances --instance-ids i-xxx
aws ec2 start-instances --instance-ids i-xxx

# Terminate
aws ec2 terminate-instances --instance-ids i-xxx

# Create AMI
aws ec2 create-image --instance-id i-xxx --name MyAMI

# Create snapshot
aws ec2 create-snapshot --volume-id vol-xxx
```

#### 📊 Important Limits

| Resource | Default Limit | Increase Request |
|----------|--------------|------------------|
| Running On-Demand instances | 20 per region | Yes |
| EBS volumes | 5,000 per region | Yes |
| Snapshots | 100,000 per region | Yes |
| Elastic IPs | 5 per region | Yes |
| Security groups per VPC | 2,500 | No |

#### ✅ Pre-Launch Checklist

```
☐ Choose appropriate instance type
☐ Select correct AMI
☐ Configure security group (minimal ports)
☐ Create/select key pair
☐ Attach IAM role (if needed)
☐ Configure user data (if needed)
☐ Enable detailed monitoring (production)
☐ Add meaningful tags
☐ Choose correct VPC/subnet
☐ Enable termination protection (production)
☐ Backup plan configured
```

---

### 🎓 EC2 Summary

**Key Takeaways:**

✅ **EC2 = Virtual Servers in Cloud** - Complete control, pay-per-use  
✅ **Many Instance Types** - Choose based on workload (CPU, memory, storage, GPU)  
✅ **Flexible Pricing** - On-Demand, Reserved, Spot for different use cases  
✅ **High Availability** - Deploy across multiple AZs with Auto Scaling  
✅ **Secure** - Security Groups, IAM roles, encryption  
✅ **Scalable** - Scale up/down based on demand  
✅ **Integrated** - Works with VPC, ELB, Auto Scaling, CloudWatch, S3, RDS  

**Remember:**
- Use IAM roles instead of access keys
- Tag everything for cost tracking
- Enable monitoring and alarms
- Regular backups (snapshots/AMIs)
- Right-size instances
- Use multiple AZs for high availability

---

**Next Service:** We'll explore **S3 (Simple Storage Service)** - Scalable object storage in the cloud.
