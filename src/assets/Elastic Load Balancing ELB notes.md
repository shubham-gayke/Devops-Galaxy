make a proper notes with easy english and technical language combination for "3.6 ELB - Elastic Load Balancing
│
├── 1. Overview
├── 2. Why Do We Need ELB?
├── 3. Problems ELB Solves
├── 4. Core Components
│
├── 5. Types of Load Balancers
│     ├── Application Load Balancer (ALB)
│     ├── Network Load Balancer (NLB)
│     └── Gateway Load Balancer (GWLB)
│
├── 6. Where Do We Use ELB?
├── 7. Request Flow Architecture
│
├── 8. Target Groups
├── 9. Health Checks
│
├── 10. Step-by-Step: Creating an ALB
│      ├── Create Security Group
│      ├── Create Target Group
│      ├── Register EC2 Instances
│      ├── Create Load Balancer
│      ├── Configure Listeners
│      ├── Configure Health Checks
│      └── Test Traffic Distribution
│
├── 11. How to Attach EC2 Instances to ELB
├── 12. How to Attach Auto Scaling Group to ELB
├── 13. How to Attach Route 53 Domain to ELB
│
├── 14. Listener Rules
├── 15. Path-Based Routing
├── 16. Host-Based Routing
│
├── 17. SSL/TLS Certificates
│      ├── AWS Certificate Manager (ACM)
│      ├── HTTPS Listener
│      └── HTTP → HTTPS Redirect
│
├── 18. Integration with Route 53
├── 19. Integration with Auto Scaling
├── 20. Integration with ECS/EKS
│
├── 21. Security Groups & NACLs
├── 22. Monitoring with CloudWatch
├── 23. Access Logs & Troubleshooting
│
├── 24. Real-World Architecture #1
│      └── Route53 → ALB → EC2 → RDS
│
├── 25. Real-World Architecture #2
│      └── Route53 → ALB → ECS
│
├── 26. Real-World Architecture #3
│      └── Route53 → ALB → EKS
│
├── 27. Common Interview Questions
├── 28. Best Practices
├── 29. Quick Revision Sheet
├── 30. Architecture Diagrams
└── ELB Summary"


# Elastic Load Balancing (ELB)

## Overview  
Elastic Load Balancing (ELB) is an AWS service that automatically distributes incoming application traffic across multiple targets (EC2 instances, containers, IPs, or Lambda) in one or more Availability Zones.  It provides a single point of contact for clients and ensures that no single instance is a bottleneck. By distributing traffic across healthy targets, ELB improves **availability**, **fault tolerance**, and **scalability**.

## Why Do We Need ELB?  
We need ELB to avoid single points of failure and to handle variable load.  For example, if one EC2 instance fails or becomes overloaded, ELB automatically reroutes traffic to other healthy instances, ensuring the application stays up.  It also works with Auto Scaling to handle traffic spikes. ELB provides features like SSL/TLS termination (offloading encryption), stickiness (session affinity), and support for distributed, multi-AZ architectures.  In short, ELB gives high availability (by sending traffic to multiple AZs), fault tolerance (by health-checking targets), and easier scaling for web applications.

## Problems ELB Solves  
- **Single-Instance Failure:** Without ELB, if one server goes down the service is down. ELB stops sending traffic to unhealthy targets until they recover.  
- **Uneven Load:** ELB balances request load so no instance is overloaded. It distributes traffic evenly (including cross-zone if enabled).  
- **Dynamic Scaling:** As demand grows, ELB combined with Auto Scaling can add new instances seamlessly. When a new instance registers, ELB starts sending it traffic as soon as it passes health checks.  
- **Network Failures:** ELB spans multiple AZs; if one AZ fails, others continue serving traffic, avoiding downtime.  
- **Security and Certificates:** ELB centralizes SSL/TLS (HTTPS) termination (using ACM for certificates) so that backend servers don’t need to manage certs.  
- **Complex Routing:** For modern microservices, ELB (especially ALB) can route based on URL paths or hostnames, enabling API or microservice routing rules.

## Core Components  
An ELB setup involves a few key parts:  
- **Load Balancer (LB):** Acts as a single contact point (DNS name) for clients. It has one or more *nodes* (one per AZ) that accept client connections and forward them.  
- **Listeners:** A listener is a process (on the LB) that checks for connection requests on a specific protocol and port (e.g. HTTP on port 80 or HTTPS on 443). Each ALB/NLB must have at least one listener. You define **listener rules** to tell the LB how to handle incoming requests. For example, an ALB listener might forward all requests to a default target group, or use rules to route by path or host.  
- **Listener Rules:** Each listener has rules (default rule + optional extra rules). These rules match request attributes (path, hostname, headers, etc.) and define actions, typically forwarding to target groups or redirecting to HTTPS. In AWS: *“The rules that you define for your listeners determine how the load balancer routes requests to the targets”*. For instance, a rule might say “if URL path starts with `/images`, send to ImageServer target group; else send to WebApp target group.”  
- **Target Groups:** A target group is a logical grouping of backend endpoints (targets). Targets can be registered by instance ID, IP address, or even Lambda (for ALB). Each listener rule typically forwards to one or more target groups. Traffic is then load-balanced across the healthy targets in that group. You can have multiple groups (e.g. one for web servers, one for API servers) and route to them separately. 
- **Registered Targets:** These are the actual resources (EC2 instances, IPs, or Lambdas) that receive traffic. You can register (and deregister) targets dynamically. The LB only sends requests to targets that pass health checks. Each target can belong to multiple target groups if needed.  
- **Health Checks:** ELB performs health checks on each target (e.g. an HTTP GET `/health` endpoint or a TCP port check). If a target fails health checks, the LB stops routing requests to it until it becomes healthy again. Health checks run at a configurable interval per target group.  
- **Availability Zones and Nodes:** When you enable an AZ for your LB, AWS creates a load balancer *node* (one per subnet) in that AZ. By default each node routes only to targets in its AZ, but you can enable “cross-zone load balancing” to distribute evenly. This multi-AZ design increases fault tolerance.  

A helpful summary of an ALB’s architecture: it has listeners (with rules) and target groups of registered targets. In general, an ELB is the single point of contact, and listeners forward traffic to target groups based on your configuration.

## 5. Types of Load Balancers  
AWS provides three main ELB types (plus the old Classic ELB): 

- **Application Load Balancer (ALB):** Operates at *Layer 7* (HTTP/HTTPS). ALB understands the content of requests (URL path, hostname, headers, etc.) and routes traffic accordingly. This makes ALB ideal for web applications, microservices, and containerized apps that need advanced routing. ALB supports HTTP/2, WebSockets, and gRPC, and can offload TLS (SSL) with certificates managed by AWS (ACM). It also supports host-based and path-based routing rules for sophisticated request distribution. ALBs do *not* provide a fixed IP; they use a DNS name that can change IPs behind the scenes.  
- **Network Load Balancer (NLB):** Operates at *Layer 4* (TCP/UDP). NLB is optimized for ultra-high performance and can handle millions of requests per second with extremely low latency. It is suitable for non-HTTP use cases (TCP/UDP) such as gaming, IoT, real-time streaming, or load-balancing network protocols. A key feature of NLB is that it provides a static IP (one per enabled AZ) and can also use Elastic IPs for fixed IP addresses. NLB preserves the source IP address of clients (so backend sees real client IP) and supports TLS termination (offloading) if needed.  
- **Gateway Load Balancer (GWLB):** Operates at *Layer 3* (network layer). GWLB is designed for deploying and scaling third-party virtual networking appliances (firewalls, intrusion detection, etc.) in AWS. It acts as a transparent network gateway: it receives all traffic, scales the appliances according to demand, and then forwards traffic on. Internally it uses the GENEVE protocol. A GWLB is typically used when you want to chain virtual appliances into your VPC traffic path, for example, to inspect or filter traffic. GWLB creates one entry/exit point for all traffic to the appliances.  
- **Classic Load Balancer (CLB):** The original ELB (now legacy). It supported HTTP/HTTPS (Layer 7) and TCP (Layer 4) but lacks many features of ALB/NLB (no host/path routing, limited TLS, etc.). AWS recommends using ALB or NLB instead. (We focus on ALB, NLB, GWLB above.)

Key differences: ALB is for application-level routing (Layer 7), NLB is for ultra-scalable network-level load balancing (Layer 4) with static IP, and GWLB is for network appliance chaining at Layer 3. For example, use ALB for a public web service with HTTPS, use NLB for backend TCP services needing high throughput, and use GWLB to deploy a firewall cluster.

## 6. Where Do We Use ELB?  
ELBs are used anywhere we need to distribute traffic for availability and scaling. Common scenarios include:  
- **Public web applications:** Fronting internet-facing services (e.g. websites, APIs). The LB sits behind Route 53 (DNS) and handles incoming traffic from clients, routing to healthy backend servers or containers.  
- **Internal services:** For microservices or internal apps, you can create an internal (private) ALB/NLB that is not internet-facing, so only within your VPC. This balances traffic between tiers (e.g. from an application tier to a database tier, or between microservices).  
- **Containerized applications:** With ECS or EKS, ELB (ALB or NLB) distributes traffic to containers. For example, an ECS Service can use an ALB target group so that tasks (containers) receive traffic on dynamic ports. In Kubernetes on EKS, creating an Ingress resource will provision an ALB to route HTTP(S) traffic to pods.  
- **Auto Scaling:** ELBs integrate with Auto Scaling groups so that new instances register automatically, and failed ones deregister. This is used in almost every scalable AWS architecture.  
- **High-availability designs:** Any multi-AZ deployment typically uses an ELB to tie the AZs together, so that if one AZ or instance fails, traffic seamlessly shifts to other AZs.  
- **Multi-region or hybrid scenarios:** You can use Route 53 advanced routing (latency-based, geolocation, failover) together with ELBs in multiple regions. For hybrid (on-prem + AWS), an NLB can route to on-prem devices via IP targets. GWLB can integrate on-prem appliances via Direct Connect or VPN.  

In practice, ELB is the default way in AWS to build a scalable, fault-tolerant service. For example, you might have Route 53 (or a custom domain) pointed at an ALB, which routes to EC2 instances or containers across zones. AWS recommends ELB for most front-end scaling and availability needs.

## 7. Request Flow Architecture  
When a client makes a request, the typical flow is:  
1. **DNS Lookup:** The client resolves the application’s domain (via Route 53 or public DNS) to the load balancer’s DNS name. If using an ALB, AWS returns one or more IP addresses of load balancer nodes in different AZs.  
2. **Connect to Load Balancer:** The client connects to one of the LB node IPs. The LB node’s listener accepts the connection on the configured port and protocol.  
3. **Listener Rules:** The LB applies listener rules. For ALB, it may inspect the HTTP request (Host, path, headers) and match it to rules (e.g. host-based or path-based rules). For NLB, rules are simpler (default forward to a target group).  
4. **Forward to Target Group:** Based on the matching rule, the listener forwards the request to the appropriate target group. Each target group has a set of registered targets.  
5. **Health Check Verification:** The load balancer checks that chosen targets are healthy. If a target is unhealthy, the LB skips it and chooses another.  
6. **Request to Target:** The load balancer opens a connection to a healthy target on the port defined in the target group. For ALB, the LB **terminates** the client connection and **re-initiates** a new connection to the target (acting as a proxy). The target processes the request and responds.  
7. **Response to Client:** The target’s response goes back to the LB node, which then forwards it back to the client. From the client’s view, it is communicating only with the LB.  
8. **Sticky Sessions (Optional):** If enabled, the LB can use application cookies or duration-based cookies to route requests from the same client to the same target (session affinity).  
9. **SSL/TLS:** If the listener is HTTPS, the LB terminates TLS. The LB has an SSL cert (from ACM/IAM) on the listener. The LB decrypts incoming traffic, then communicates with targets over HTTP or HTTPS as configured. Alternatively, you can configure the target group to use TLS for end-to-end encryption.  
10. **Cross-Zone:** If cross-zone load balancing is enabled, each LB node can distribute traffic across targets in all enabled AZs (otherwise it only sends to targets in its own AZ).  

After handling the request, if the number of requests or response times spike, the LB seamlessly continues to distribute load. If using Auto Scaling, new instances register to the target group and start receiving traffic immediately. This flow is illustrated in the ALB diagram below.

 *Example: Route 53 ⇒ ALB ⇒ EC2 ⇒ RDS. An internet-facing ALB (in public subnets) receives traffic (from Route 53 DNS) and forwards to EC2 instances in private subnets (target group). The EC2 instances connect to an RDS database (also in a private subnet). This 3-tier setup spans multiple AZs for redundancy. The ALB performs health checks on the instances and only sends traffic to healthy ones.*

## 8. Target Groups  
A **target group** is a named pool of endpoints that an ELB forwards requests to. Each target group is configured with a protocol (HTTP, HTTPS, TCP, etc.) and port, and has its own health check settings. Targets (EC2 instance IDs, IP addresses, or Lambdas) are registered to a target group. When an ELB listener’s rule forwards to a target group, the LB distributes traffic across the group’s healthy targets. 

Key points about target groups:  
- You can register targets by instance ID *or* by IP address. For ECS Fargate/ECS-`awsvpc` tasks, it’s common to register the task’s IP.  
- A target can belong to **multiple** target groups. For example, the same instance might serve two different target groups (perhaps on different ports).  
- **Auto Scaling Integration:** In an Auto Scaling group, you can attach a target group. Then, whenever ASG launches a new instance, it automatically registers it into that target group. This simplifies scale-out.  
- **Lambda Targets:** For ALB, a target group can have a single Lambda function. ALB invokes the Lambda for incoming requests (for serverless backends).  
- **Health Checks:** Each target group performs its own health checks. The LB only routes traffic to targets that pass these checks.

In the console, when creating an ALB or NLB, you define at least one target group (or reuse an existing one) and specify which protocol/port it uses. After creation, you can manually register/deregister instances or IPs in the target group, or let ASG handle it. When traffic arrives, the LB consults the default target group in its rule to determine where to send each request.

## 9. Health Checks  
ELB continuously monitors the health of targets. Each target group has a health-check configuration (protocol, path or port, interval, thresholds). The load balancer periodically polls each target. For HTTP/HTTPS checks, it might do an HTTP GET on a specified path (e.g. `/health`). If a target fails the health check (e.g. returns non-200 or times out) several times, ELB marks it unhealthy and **stops sending traffic to it** until it passes health checks again. This ensures traffic only goes to functional servers. 

Key notes:  
- You can customize the health-check path, port, and thresholds. For example, a typical web service might use `HTTP GET /health` and require a 200 OK response.  
- ELB considers the target healthy again only after consecutive successful checks. Until then, it keeps it out of rotation.  
- Health checks run on every enabled AZ independently. If a target in one AZ fails, that AZ’s node stops using it. If *all* targets in an AZ fail, Route 53 (DNS) will stop returning the LB’s IP for that AZ (so clients are routed elsewhere).  
- For NLB and TCP protocols, health checks may simply test a TCP port open.  
- ALB also monitors *application-level* errors: metrics like HTTP 5xx are tracked, and ALB can throttle traffic if errors rise too high (though that’s a newer feature).  
- Proper health-check configuration is a best practice: for example, ensure the health-check path is lightweight and responds quickly, and set reasonable timeouts so that intermittent slowness doesn’t mark targets unhealthy.

 provides a concise summary: *“ELB regularly checks the health of targets using a path like /health. If a target becomes unhealthy, ELB stops routing traffic to it until it recovers.”* 

## 10. Step-by-Step: Creating an ALB  
A typical setup of an Application Load Balancer involves:  
1. **Create Security Group:** Define a security group for the ALB that allows inbound traffic on the listener ports (e.g. allow TCP 80 and/or 443 from 0.0.0.0/0 for a public ALB). Also allow outbound to target ports.  
2. **Create Target Group:** In the EC2 console (or CLI), create a new target group. Choose protocol (HTTP/HTTPS) and port (e.g. 80). Choose target type (instance or IP). Configure the health check (e.g. HTTP path `/health`). Give it a name.  
3. **Register Targets:** Add your EC2 instance IDs (or IP addresses) to the target group. These are your application servers.  
4. **Create Load Balancer:** In EC2 > Load Balancers, choose “Create Application Load Balancer”. Enter a name, scheme (internet-facing or internal), and the AZs/subnets. Select the security group from step 1.  
5. **Configure Listeners:** By default ALB has a listener on port 80. You can add listeners (like HTTPS 443). Each listener needs a default action: typically “Forward to” one of your target groups. For HTTPS listeners, you must attach an SSL certificate from ACM or IAM.  
6. **Add/Review Rules:** For each listener, configure the rules. The default rule usually forwards all traffic to the target group. You can add additional path-based or host-based rules if needed. (For example, redirect HTTP to HTTPS, or route different URL paths to different target groups.)  
7. **Configure Health Checks:** Ensure the target group’s health check is set correctly (path, port, healthy/unhealthy threshold). The ALB will use that to mark instances up/down.  
8. **Review & Create:** Finally, review all settings and create the load balancer. AWS will provision the ALB, which may take a minute.  
9. **Test Traffic:** Once active, note the ALB’s DNS name (e.g. my-alb-123456.elb.amazonaws.com). In your browser or API client, send requests to this DNS name. The ALB should distribute the traffic to your registered instances. You should see responses from your application.  
10. **Cleanup:** If this was a test, remember to delete the load balancer, target groups, and instances when done to avoid charges.  

For example, one tutorial shows creating a target group (name “my-targets”) listening on port 80, then choosing two EC2 instances as targets. Then they create the ALB, assign the target group to the listener, and see the ALB’s DNS appear (which you can open to hit the app). The key is that *Listener → Target Group → Targets* is the chain. Citations from the tutorial steps (GFG):

> “In the Listener and Routing section, click on Create New Target Group. Choose the Target Group Name, select the Protocol, and enter the Port Number”.  
> “Choose instance A and instance B… Review and click Create Target Group… Then scroll down and click on Create Load Balancer”.  

By following those steps (adjusted for your environment), you’ll have an ALB up and running.

## 11. Attaching EC2 Instances to ELB  
In an ALB/NLB setup, you **attach instances to target groups**, not directly to the LB. To attach EC2s: after creating a target group, register the instances with that group (select the instance IDs and port). The ALB will then send traffic to those instances. If you already have an EC2 Auto Scaling group (ASG), it’s common to have the ASG manage registrations automatically (see below). For the Classic Load Balancer (CLB, deprecated), you would directly register instances with the LB, but that’s not used for ALB/NLB. In practice: go to the Target Group in AWS console, choose “Targets” and “Edit”, then select your instances. Once registered and passing health checks, the instances start receiving traffic from the load balancer.

## 12. Attaching Auto Scaling Group to ELB  
Auto Scaling Groups (ASGs) can automatically manage targets. For Classic LBs, you would attach the CLB in the ASG settings. For ALB/NLB, the ASG attaches to a target group. In the ASG configuration (or launch template), specify the target group ARN under “Load balancing”. Then: *“After you attach a target group to your Auto Scaling group, Auto Scaling registers your targets with the target group for you when it launches them”*.  This means when ASG scales out and launches new instances, they are automatically put into the target group and start receiving traffic. Similarly, when instances terminate, they deregister. This simplifies management: you don’t have to manually register/deregister instances. (Behind the scenes, ASG uses the target group API to do this.) 

In summary: to integrate ASG with ELB, simply list the target group(s) in the ASG’s load-balancing section. AWS handles the rest.

## 13. Attaching Route 53 Domain to ELB  
To expose your load-balanced application via a custom domain, use Amazon Route 53:  
- **Create (or use) a Hosted Zone** for your domain (e.g. example.com).  
- **Add Record:** If you want a subdomain (like `www.example.com`), create an *A or CNAME* record pointing to the ALB’s DNS name. Best practice is to use an **Alias A record**: select “Alias to Application and Classic Load Balancer” and pick your load balancer from the dropdown. This lets Route 53 automatically resolve to the LB’s current IPs. For the root domain (example.com), you must use an Alias A record (CNAME is not allowed at zone apex).  
- **TTL/Failover:** Optionally set Route 53 routing policies (weighted, latency, geolocation, failover, etc.) if you have multiple LBs or regions. Route 53 can also health-check the ELB endpoints and remove unreachable ones.  
- **SSL/HTTPS:** If using HTTPS, get an ACM certificate for your domain and attach it to the ALB listener (see next section). 

Example: create an A-record alias for `www.example.com` pointing to your ALB. Now requests to `www.example.com` will go to the ELB. This step does not require running code on instances — it’s just DNS configuration.

## 14. Listener Rules  
Listener rules define how the ELB handles each incoming request on a listener. Each listener has a **default rule** and can have extra rules with conditions. For an ALB, rules can match on HTTP attributes (host headers, path patterns, headers, query strings, HTTP method, source IP CIDR, etc.). For example:  
- **Host-based rule:** If the Host header is `api.example.com`, forward to target group A; if `www.example.com`, forward to target group B.  
- **Path-based rule:** If the URL path starts with `/images`, forward to an image server group; if `/api`, send to API group.  
- **Default rule:** If no other rule matches, do the default action (e.g. forward to a default target group or redirect).  
Rules are evaluated in priority order. Once a rule matches, its action is taken (and no further rules are evaluated for that request). For NLBs, routing is simpler (Layer 4) so you typically just have one default action. 

In short, a listener (e.g. ALB on port 80) uses rules to direct traffic to various target groups based on content. As AWS says: *“The rules that you define for your listeners determine how the load balancer routes requests to the targets”*.

## 15. Path-Based Routing  
Path-based routing is an ALB feature where you route based on the URL path. You can create listener rules that match a path pattern (like `/api/*` or `/images/*`) and forward those requests to specific target groups. For example, an e-commerce site could use `/shop/*` routes to one set of servers and `/blog/*` to another. AWS ALB supports wildcard patterns and prefix matching. In our path-based rule, we might say: if request path is `/orders/*`, then forward to “OrdersService” target group; else forward to the “WebFrontEnd” group. This enables microservice architectures where different URLs go to different service backends. (ALB also allows combining path and host conditions in one rule, e.g. `host = example.com AND path starts-with /shop`.)

## 16. Host-Based Routing  
Host-based routing lets an ALB route traffic based on the HTTP Host header (the requested domain). This way, multiple domains or subdomains can be served by one load balancer. For example, you can have one ALB with rules: `Host is www.example.com → target group A`; `Host is api.example.com → target group B`. Essentially, the ALB examines the domain name in the request and uses listener rules to send it to the right targets. This is useful for hosting multiple sites or services under a single ALB (possibly sharing ports 80/443). The documentation notes: *“Host-based Routing: You can route a client request based on the Host field of the HTTP header allowing you to route to multiple domains from the same load balancer.”*

## 17. SSL/TLS Certificates  
Modern applications should use HTTPS. ELB supports SSL/TLS offloading:

- **AWS Certificate Manager (ACM):** Use ACM to provision free SSL certificates (public certificates for your domains). You can also import your own certificates or use IAM.  
- **HTTPS Listener:** When you create an ALB, add a listener on port 443 with protocol HTTPS. You must assign an SSL certificate (from ACM or IAM) to this listener. This configures the LB to accept encrypted connections from clients.  
- **Cipher and Protocol:** ALB supports up-to-date TLS protocols and ciphers by default. You can select a security policy when creating the listener. ALB manages the TLS termination (decrypting client data) before forwarding to targets.  
- **SNI (Server Name Indication):** ALB can host multiple SSL certs on one listener using SNI. The ALB will pick the right cert based on the hostname.  
- **Redirecting HTTP to HTTPS:** A common practice is to add a rule on the HTTP (port 80) listener that automatically redirects all requests to HTTPS (port 443). ALB supports HTTP-to-HTTPS redirection natively. For example, a rule can say “redirect HTTP on port 80 to HTTPS on port 443” so that all clients use secure connections. 

In summary, ELBs integrate tightly with ACM. AWS states: *“An Application Load Balancer supports HTTPS termination… ALBs also offer management of SSL certificates through AWS IAM and AWS Certificate Manager for pre-defined security policies.”*. And for HTTPS listeners: *“If listener protocol is HTTPS, you must deploy at least one SSL server certificate on the listener”*.  

## 18. Integration with Route 53  
As noted, Route 53 is commonly used to route domain names to an ELB. Use an Alias A record in Route 53 to point your domain (or subdomain) to the ELB. Route 53 knows how to resolve the ELB’s DNS name to its IPs and will keep it updated. This means your ELB can be part of DNS failover and traffic management. For example, you can use Route 53 health checks on the ELB and fail over to a standby ALB in another region if it becomes unhealthy. You can also use weighted or latency-based routing to distribute traffic between multiple ELBs globally. Overall, the integration is straightforward: just create an A (Alias) record that targets the ELB.

## 19. Integration with Auto Scaling  
We covered this in section 12: simply attach the ALB’s target group to your Auto Scaling group. Auto Scaling will then register new instances to the target group automatically and deregister instances that terminate. This ensures new instances are in service immediately, and dying ones drain before termination (gracefully). You can also use ELB health checks as the health check type for the ASG so that if a target fails the LB health check, the ASG knows the instance is unhealthy and can replace it. In practice, just configure your ASG’s “load balancing” settings with the ALB target group ARN, and enable ELB health checks if desired.

## 20. Integration with ECS/EKS  
- **ECS (Elastic Container Service):** You can attach an ALB to an ECS Service. ECS can be configured to use a load balancer when defining a Service. The Service then registers its tasks in the ALB’s target group (either by instance or by IP if using `awsvpc` networking). AWS docs: *“An Application Load Balancer makes routing decisions at the application layer (HTTP/HTTPS), supports path-based routing, and can route requests to one or more ports on each container instance in your cluster”*. This allows ECS tasks on the same host (with different ports) to be load-balanced. When tasks scale up/down, ECS will automatically register/deregister them in the target group. You simply specify the target group in your ECS Service definition and ALB in the service’s load balancer config.  
- **EKS (Elastic Kubernetes Service):** In Kubernetes, you typically use the AWS Load Balancer Controller. When you create a Kubernetes **Ingress** (with annotation `kubernetes.io/ingress.class: alb`), the controller provisions an AWS ALB for you. The ALB then routes HTTP/S traffic to Kubernetes Service resources (usually via Service type=NodePort). As AWS explains: *“When you create a Kubernetes `Ingress`, an AWS Application Load Balancer (ALB) is provisioned that load balances application traffic.”*. (For plain TCP/UDP services, a Service of type LoadBalancer provisions an NLB.) With EKS, after tagging subnets and installing the Load Balancer Controller, you get ALB integration through your Ingress objects. In both ECS and EKS cases, you end up with an ALB in front of container workloads, managing service discovery and routing.

## 21. Security Groups & NACLs  
- **Security Groups:** ELB nodes are inside subnets and must be associated with security groups. For an internet-facing ALB, the SG should allow inbound traffic from the internet on the listener ports (e.g. 80, 443). It should allow outbound to the target instances (typically any outbound, or at least to the target group ports). The target EC2 instances themselves also have security groups, which must allow inbound traffic from the LB. Best practice: In the instance SG, allow the ALB’s SG as a source on the application port (or just allow 0.0.0.0/0 if it’s internal and the port is restricted). For example, ALB-SG allows 80/443 inbound, App-SG allows ALB-SG inbound on port 80/443. For internal ELBs, lock the ALB SG down to only known IPs or VPCs.  
- **Network ACLs:** These are stateless rules at the subnet level. Usually, if your VPC uses NACLs, ensure they allow the required traffic (ports 80/443 in, ephemeral ports out, etc.). By default NACLs allow all; if customized, remember that ELB health checks originate from the LB nodes, so allow traffic between subnets. NACLs are less granular than SGs, so typically they either allow or deny broad ranges. The key is to make sure the flow (client → ALB → instance) isn’t blocked at the subnet boundary. In general, SGs handle most of the access control, and NACLs can be used for coarse whitelisting.

> *“When using Amazon VPC, you can create and manage security groups associated with Elastic Load Balancing to provide additional networking and security options.”*. This means you fully manage the ELB’s SGs just like for any EC2.

## 22. Monitoring with CloudWatch  
AWS ELB publishes a variety of **CloudWatch metrics** to help you monitor load balancer performance and health. Common metrics (in the `AWS/ApplicationELB` namespace for ALB, `AWS/NetworkELB` for NLB) include: *RequestCount* (number of requests), *Latency* (time for a request-response), *HTTPCode\*_Count* (4xx/5xx errors from LB or targets), *HealthyHostCount* (number of healthy targets), *UnHealthyHostCount*, *TargetResponseTime*, etc. You should create CloudWatch Alarms on key metrics (for example, spike in 5xx errors or high latency) to alert if something goes wrong.  

> The AWS ELB homepage suggests: *“Monitor the health and performance of your applications in real time, uncover bottlenecks, and maintain SLA compliance.”*.  In practice, you can visualize these metrics in CloudWatch dashboards and set alarms. If using NLB/ALB with Container services, also monitor ECS/EKS metrics.

In addition to built-in metrics, you should enable **Access Logs** (for ALB/NLB) which record detailed information about each request (client IP, request path, server response, etc.) to an S3 bucket. These logs help troubleshoot issues (e.g. finding why requests failed). Also use AWS CloudTrail to log any configuration changes to your load balancers for security audits. AWS WAF (firewall) logs can also be enabled on ALB to see blocked requests.

## 23. Access Logs & Troubleshooting  
- **Access Logs:** For ALB and NLB, turn on access logging. Logs go to S3 and include client IP, request URL, latency, target chosen, and more. Use these to analyze traffic patterns or debug errors.  
- **CloudTrail:** Records API calls related to your load balancer (like creation, deletion, modifications). Useful for auditing and change tracking.  
- **CloudWatch Alarms:** Set alarms on unhealthy host counts or 5xx errors to get notified of issues.  
- **Alarms/Logs:** If many 5xx errors are seen, check your application health path or performance. If *RejectedConnectionCount* on NLB rises, you may be hitting connection limits.  
- **Tools:** AWS also offers AWS X-Ray tracing (via the custom header `X-Amzn-Trace-Id` added by ALB) to trace requests through distributed systems.  
- **WAF (Web Application Firewall):** Attach WAF to your ALB to block malicious requests. WAF logs can show malicious patterns.  
- **Troubleshooting:** Common issues include wrong SG rules (blocking LB or target ports), misconfigured health check (targets appear "draining"), and DNS caching (clients caching old LB IPs). Always check that the targets are “healthy” in the ELB console; if not, the LB won’t send traffic. Use `curl` to the health check path on each instance from the LB’s subnet as a test. 

If you encounter problems, AWS docs have a [Troubleshooting guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elb-works.html) (basic flow). The key is to verify each component: DNS (Route53 record), SG/NACLs, LB active & listening, target group has correct targets, and health checks passing.

## 24. Real-World Architecture #1: Route53 → ALB → EC2 → RDS  
 *This 3-tier AWS architecture example shows Route 53 directing traffic to an Internet-facing ALB, which distributes requests to EC2 instances (auto-scaled) in private subnets. The EC2 app servers communicate with an RDS database (also in a private subnet). Static assets may be served from S3/CloudFront. Multi-AZ deployment (multiple subnets shown) ensures high availability. The ALB health-checks the EC2 instances and only forwards to healthy ones.* 

In this setup: users hit a custom domain (Route 53 → ALB). The ALB listener (port 80/443) forwards to the EC2 application layer. The EC2 instances belong to an Auto Scaling group attached to the ALB target group. The EC2 instances then connect to the RDS database for data. All tiers are spread across AZs. This is a common web architecture: ALB provides the scaling and failover for the front-end, while RDS provides a managed relational backend.

## 25. Real-World Architecture #2: Route53 → ALB → ECS  
In a containerized architecture, Route 53 still points to an ALB. The ALB listener routes requests to an ECS service. For example, an ECS Service on Fargate is configured with a target group; tasks (containers) automatically register in that group and receive traffic. The ALB can use path or host rules to distribute among multiple containerized microservices. The target type for ECS could be IP if using `awsvpc`, meaning tasks get private IPs. The ECS tasks then handle the application logic, and may connect to other AWS services (like DynamoDB or RDS). The flow is similar to #1, but *EC2 instances are replaced by ECS tasks*. AWS docs describe this: an ALB *“can route requests to one or more ports on each container instance in your cluster”*, allowing multiple tasks per host. Each ECS service can have its own target group, enabling blue/green deployments and easy scaling.

## 26. Real-World Architecture #3: Route53 → ALB → EKS  
With Kubernetes on AWS, Route 53/ALB integration works via the Kubernetes Ingress. You create an Ingress resource, and AWS provisions an ALB (public or internal). The ALB listener forwards to Kubernetes Service endpoints (Pods) via NodePort. For example, you might have two Ingress rules: one for `app.example.com` and one for `api.example.com`, both handled by a single ALB with multiple target groups for each Kubernetes Service. The backend could be a database or a microservices mesh. AWS docs note: *“When you create a Kubernetes `ingress`, an AWS Application Load Balancer (ALB) is provisioned that load balances application traffic”*. For TCP services, you’d use a Service type=LoadBalancer which would create an NLB instead. 

In practice, the architecture is: internet → Route53 → ALB → (VPC subnets) → Kubernetes cluster nodes → Pods. The ALB health-checks pods (via NodePort). It’s analogous to #2 but in a k8s context. The AWS Load Balancer Controller and proper subnet tagging take care of wiring the ALB to the EKS cluster.

## 27. Common Interview Questions  
- **Q:** *What is an Elastic Load Balancer (ELB)?* **A:** ELB is a managed AWS service that distributes incoming traffic across multiple targets (instances, containers, IPs) to improve availability and scalability.  
- **Q:** *What’s the difference between ALB, NLB, and Classic?* **A:** ALB is Layer 7, does HTTP/HTTPS with advanced routing (host/path); NLB is Layer 4, does TCP/UDP with ultra-high throughput and static IPs; Classic LB is legacy (basic L4/L7) and generally not used in new designs.  
- **Q:** *How does the ALB preserve client IPs?* **A:** ALB can insert X-Forwarded-For headers, but it terminates the connection, so the original source IP is not preserved to the backend unless you use Proxy Protocol or NLB. NLB *does* preserve the client’s source IP by default.  
- **Q:** *What is sticky session (session affinity) and how does ELB implement it?* **A:** Sticky sessions bind a user’s session to one target. ALB does this via application cookies or duration-based cookies (at target-group level). NLB can do source IP stickiness. If enabled, ELB adds a special cookie (or uses the IP) so subsequent requests from that client go to the same target.  
- **Q:** *Can an ALB target IP addresses outside AWS?* **A:** Yes, you can register IP addresses (including on-premises via Direct Connect/VPN) in a target group for ALB. NLB supports IP targets as well.  
- **Q:** *How does an ELB perform health checks?* **A:** You configure a protocol/port/path per target group. ELB periodically polls each target; if a target fails the check consecutively, ELB marks it unhealthy and stops sending traffic to it.  
- **Q:** *What happens if all targets in an AZ fail?* **A:** The load balancer node in that AZ is removed from service. Route 53 (if alias) will route traffic to other AZs’ LB nodes.  
- **Q:** *How to do blue/green deployments with ELB?* **A:** Create two target groups (one for v1, one for v2 of the app). Use listener rules or weighted DNS to shift traffic between them. Or use ALB’s native shift ability. E.g., attach both to same ALB with different weights or use two ALBs and switch in Route53.  
- **Q:** *Why use a Load Balancer in front of Auto Scaling Group?* **A:** ASG can scale EC2 but needs a way to distribute inbound traffic to them; LB provides a stable endpoint and distributes evenly. The ASG health check can also be the LB’s health check to ensure new instances are serving properly before scaling in.

*(Note: These answers mix knowledge with cited definitions above.)*

## 28. Best Practices  
- **Multi-AZ Everywhere:** Always enable the load balancer in at least two AZs (and run targets in all those AZs) for high availability.  
- **Use HTTPS:** Terminate SSL at the ALB using ACM certificates. Redirect all HTTP to HTTPS to secure connections.  
- **Health Check Tuning:** Set appropriate health-check intervals and thresholds so that transient issues don’t cause healthy instances to be marked down. For example, set a reasonable timeout and healthy threshold to avoid false positives.  
- **Least Privilege SGs:** Only open necessary ports on security groups (e.g. ALB SG only allows 80/443 in). Lock down target SGs to only accept traffic from the ALB’s SG.  
- **Use WAF:** If your app is public, attach AWS WAF to the ALB to block common web exploits (SQLi, XSS).  
- **Enable Access Logs:** Turn on ELB access logging to S3. It’s often critical for post-incident forensics (e.g. what requests hit the LB).  
- **Monitor Real-Time:** Set CloudWatch alarms on unhealthy hosts, 5xx error rates, and latency spikes. Respond to alarms quickly.  
- **Use Alias Records:** In Route 53 use Alias records (A-ALIAS) for ELB targets so AWS manages the IP changes. Avoid CNAME at root.  
- **IAM Permissions:** Restrict who can change ELB/target group configs via IAM policies to prevent accidental misconfiguration.  
- **Keep ALBs Up-to-Date:** AWS often adds features (like HTTP/2, gRPC, container support). Enable these when needed.  
- **Clean Up:** Delete unused load balancers (they cost money). For ephemeral test clusters, remove ELBs quickly.  
- **Auto Scaling Integration:** Always attach the target group to ASG so scaling is automated.  
- **Slow Start (ALB):** If launching many new targets, use the ALB “slow start” feature so it ramps up traffic gradually.  
- **DNS TTL:** Use a short TTL for Route 53 records pointing to ELB to allow fast failover in multi-region setups.  

Following these practices helps maintain a secure, available, and cost-effective ELB deployment.

## 29. Quick Revision Sheet  
- **ELB = Elastic Load Balancing:** distributes traffic across multiple AZs.  
- **ALB (Layer 7):** HTTP/HTTPS, host/path routing, modern features (WS, HTTP/2, certificates with ACM).  
- **NLB (Layer 4):** TCP/UDP, millions RPS, static IP/EIP per AZ, preserves source IP.  
- **GWLB (Layer 3):** Appliance chaining (firewalls, etc.) with GENEVE.  
- **Listeners:** Port/protocol endpoints on LB; rules define target routing.  
- **Target Group:** Logical group of targets (instances/IP/Lambda). ALB/NLB forward here.  
- **Health Checks:** LB polls targets; only healthy targets get traffic.  
- **Auto Scaling:** Attach LB target group to ASG; ASG auto-registers instances.  
- **Route 53:** Use alias A-record to ELB. Can do weighted/failover.  
- **HTTPS/SSL:** Use ACM certs. ALB terminates TLS, can redirect HTTP→HTTPS.  
- **Monitoring:** CloudWatch ELB metrics (RequestCount, Latency, 4xx/5xx, HealthyHostCount). Enable Access Logs to S3.  
- **Security:** LB SG allows inbound on listener ports, targets SG allow LB’s traffic. NACL allow ephemeral ports. Enable WAF.  
- **Sticky Sessions:** Optional; forwards same client to same target via cookie.  
- **Multi-Region:** Can use Route 53 with LBs in multiple regions for DR/geo.  
- **CLI/CloudFormation:** All ELB resources (load balancer, listener, target group) are configurable via AWS CLI/CF/Terraform.

## 30. Architecture Diagrams  
 *Example AWS ELB architecture: ALB in public subnets (fronted by Internet Gateway) routes traffic to targets in private subnets. The diagram shows Load Balancer subnets in multiple AZs and target subnets. (For illustration only.)*

**Figure:** An example AWS ELB network diagram showing an internet-facing load balancer (in public subnets) distributing traffic to backend targets in private subnets across AZs.  

  
**ELB Summary:** Elastic Load Balancing is a core AWS service for scalable, highly available applications. By distributing traffic, performing health checks, and integrating with auto scaling and DNS, ELB eliminates single points of failure and adapts to load. The three main ELB types (ALB, NLB, GWLB) cover most needs: ALB for HTTP(S) apps, NLB for ultra-fast TCP/UDP, and GWLB for virtual appliances. Key features include secure HTTPS support with ACM, flexible routing rules, cross-zone balancing, and built-in monitoring. In practice, you will often set up an ALB in front of EC2/ECS/EKS, configure listeners and target groups, and use Route 53 for DNS. Remember to follow AWS best practices (multi-AZ, proper health checks, security groups, logging) to ensure a resilient architecture. These notes should help you understand and recall the essentials of Elastic Load Balancing in AWS. 

**Sources:** AWS Documentation and tutorials were used to compile these notes (among others), ensuring accuracy and completeness.