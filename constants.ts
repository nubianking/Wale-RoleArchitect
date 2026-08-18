import { ResumeData } from './types';

export const BASE_RESUME: ResumeData = {
  name: "ADEWALE TOKOSI",
  contact: {
    location: "West Haven, CT 06516",
    email: "adewaletokosi1@gmail.com",
    phone: "(475) 321-7100",
    linkedin: "https://www.linkedin.com/in/adewale-tokosi"
  },
  summary: "Senior DevOps Engineer with experience designing, deploying, and managing cloud infrastructure across AWS and Azure environments. Experienced with Kubernetes microservices architectures, Terraform, Docker, Jenkins, and CI/CD pipelines, with a focus on automation, scalability, security, and reliability. Worked on Infrastructure as Code, DevSecOps, monitoring and observability, cloud security, high availability, and production support across the software development life cycle (SDLC). Experienced in automating workflows, optimizing cloud resources, reducing operational costs, and improving deployment processes. Comfortable working across development, security, and infrastructure teams to troubleshoot production issues and build secure, scalable, and reliable cloud environments.",
  skills: [
    "Cloud Infrastructure & AWS Services: EC2, S3, IAM, Lambda, VPCs, RDS, EKS, ECS, Amazon Connect, CloudFormation, Timestream, DynamoDB, Kinesis, CloudWatch",
    "Infrastructure as Code (IaC) & Automation: Terraform, CloudFormation, Ansible, Packer, CloudBees",
    "Containerization & Orchestration: Kubernetes (EKS), Docker, Helm, OpenShift, ArgoCD, Istio",
    "CI/CD & Continuous Delivery: GitLab CI, Jenkins, CodePipeline, CodeBuild, GitHub Actions, Azure DevOps, Argo Workflows, Maven",
    "Monitoring, Logging & Observability: Prometheus, Grafana, ELK Stack (Elasticsearch, Logstash, Kibana, Filebeats), DataDog, Splunk, New Relic, AWS CloudWatch",
    "Security, Compliance & DevSecOps: IAM policies, VPC security, AWS GuardDuty, WAF, SonarQube, Fortify, Snyk, Trivy, Clair, Twistlock (Prisma Cloud), Checkov, Terrascan, tfsec, HashiCorp Vault, Nmap, Nessus, Qualys, OpenVAS",
    "Networking & Load Balancing: DNS, NGINX, HAProxy, Squid Proxy, API Gateway, Service Mesh (Istio), VPCs, VPNs, Load Balancing",
    "Database Management & Analytics: PostgreSQL, RDS, Aurora, DynamoDB, Timestream, Oracle, CockroachDB, ETL strategies, query optimization",
    "AI & Contact Center Automation: Amazon Lex, Alexa, Amazon Connect integrations, custom CCP solutions, conversational interfaces, NLP orchestration",
    "Programming & Scripting: Python, Bash, GoLang, TypeScript, Java, YAML, PowerShell, SQL, crontab, control-M",
    "Cloud Platforms: Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP Basic)",
    "Agile & DevOps Practices: Agile methodologies, GitOps, DevSecOps, SRE, microservices architecture, cross-functional collaboration, technical mentorship"
  ],
  certifications: [
    "AWS Certified Solutions Architect – Associate"
  ],
  education: [
    "Landmark Metropolitan University — BSc Computer Science"
  ],
  experience: [
    {
      company: "120WATER | Zionsville, Indiana",
      role: "Senior DevOps Engineer",
      duration: "Sept, 2023 – Present",
      bullets: [
        "Engineered and maintained robust Jenkins CI/CD pipelines for automating the deployment of Java, Node.js, .NET applications across multiple environments (production, staging, and development) using GitHub, Maven, Docker, Kubernetes, and Ansible.",
        "Designed, implemented, and optimized Kubernetes microservices architecture, leveraging Helm for efficient application deployments and managing complex configurations.",
        "Orchestrated containerized applications (Java, Node.js, .NET) with Kubernetes to achieve environment consistency, scalability, and improved deployment speed.",
        "Led cloud infrastructure management on AWS, including EC2, S3, RDS, and VPC, ensuring secure and reliable infrastructure with automated scaling and backup strategies.",
        "Automated infrastructure provisioning and management using Terraform, reducing manual intervention, enhancing consistency, and improving deployment speed for cloud resources like EC2 instances, VPCs, IAM policies, and databases.",
        "Implemented security best practices in AWS environments, including setting up IAM roles, policies, and Multi-Factor Authentication (MFA) to ensure secure access control across cloud infrastructure.",
        "Managed and optimized cloud cost, achieving a 20% reduction in AWS expenses by implementing resource optimization strategies and leveraging Reserved Instances and Spot Instances.",
        "Led migration efforts from monolithic to microservices architecture, containerizing legacy applications and deploying them on AWS EKS to improve scalability and deployment efficiency.",
        "Configured and managed continuous monitoring solutions using DataDog, New Relic, Prometheus, and Grafana to ensure optimal application performance, resource utilization, and proactive alerting.",
        "Led incident management for system outages, working closely with cross-functional teams to identify root causes and implement corrective actions.",
        "Utilized EFK stack (Elasticsearch, Logstash, Filebeats, and Kibana) for centralized logging and log management, enhancing debugging and monitoring capabilities.",
        "Developed custom PowerShell scripts to automate various infrastructure tasks such as system updates, configuration changes, and user management."
      ]
    },
    {
      company: "UNICORN DIGITAL | Georgia",
      role: "Cloud DevOps Engineer",
      duration: "Jan, 2019 – June, 2023",
      bullets: [
        "Designed and implemented scalable CI/CD pipelines using Jenkins, GitHub, Docker, Kubernetes, SonarQube, and Nexus to automate deployment cycles, resulting in reduced deployment times and improved release consistency.",
        "Managed and optimized Kubernetes clusters (EKS) for high availability and fault tolerance, ensuring that application workloads were automatically scaled based on traffic.",
        "Automated infrastructure deployment and configuration management using Ansible and Terraform, reducing manual configuration errors and speeding up the deployment process.",
        "Developed scripts and automation workflows for provisioning cloud resources in AWS, including EC2, VPC, S3, RDS, IAM, and Route53, following Infrastructure as Code (IaC) best practices.",
        "Improved system performance and cost-efficiency by conducting regular performance tuning and implementing auto-scaling policies for cloud services and Kubernetes resources.",
        "Configured and managed continuous monitoring and alerting for cloud resources using AWS CloudWatch, Prometheus, and Grafana, ensuring high availability and proactive issue resolution.",
        "Automated the management of application configurations and secrets using HashiCorp Vault, ensuring secure storage and access control across environments.",
        "Worked closely with developers and QA teams to troubleshoot deployment issues, resolve production incidents, and optimize application performance.",
        "Conducted regular vulnerability assessments and applied patches to ensure a secure cloud environment, including compliance with security frameworks and best practices.",
        "Managed storage solutions and backup strategies using AWS S3, Glacier, and RDS snapshots, ensuring data integrity and disaster recovery readiness.",
        "Proactively identified performance bottlenecks and implemented improvements for Kubernetes clusters, containerized applications, and cloud infrastructure."
      ]
    },
    {
      company: "Elite Horizon Global Resource",
      role: "Support Engineer",
      duration: "Feb 2016 – September 2018",
      bullets: [
        "Provided Tier-2/Tier-3 technical and infrastructure support for enterprise workloads across Linux (RHEL, Ubuntu) and Windows Server environments, resolving critical incidents within strict SLA windows.",
        "Monitored server health, network connectivity, and resource utilization using Nagios, Zabbix, and AWS CloudWatch, proactively mitigating system performance bottlenecks and outages.",
        "Automated routine operational tasks, backup schedules, user access provisioning, and system maintenance using Bash and Python scripts, reducing manual intervention by 40%.",
        "Assisted in provisioning and configuring foundational cloud resources on AWS (EC2, S3, VPC, IAM, Security Groups) to support seamless hybrid-cloud application deployments.",
        "Managed Active Directory, DNS, DHCP, and VPN configurations, ensuring secure identity access and reliable internal network infrastructure.",
        "Collaborated with development and engineering teams to perform root-cause analysis (RCA) on recurring production defects, implementing preventive fixes and comprehensive SOP documentation.",
        "Maintained system patch management, security baselines, and disaster recovery backup policies, ensuring data integrity and high system availability."
      ]
    }
  ]
};
