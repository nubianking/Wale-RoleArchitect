import { TargetRole } from '../types';

export interface SampleJob {
  id: string;
  title: string;
  role: TargetRole;
  company: string;
  description: string;
}

export const SAMPLE_JOBS: SampleJob[] = [
  {
    id: 'aws-sec-lead',
    title: 'Senior Cloud Security Engineer',
    role: TargetRole.CLOUD_SECURITY,
    company: 'Fintech Cloud Corp',
    description: `About the Role:
We are seeking a Senior Cloud Security Engineer to lead security governance, threat mitigation, and compliance automation across 100+ AWS accounts.

Key Responsibilities:
- Architect and govern AWS Organizations, SCPs, and Control Tower landing zones.
- Build automated remediation pipelines using Python, AWS EventBridge, and AWS Lambda.
- Enforce Zero Trust IAM policies, permission boundaries, and PIM/PAM controls.
- Maintain continuous compliance for SOC 2 Type II, PCI-DSS, and HIPAA frameworks.
- Deploy and manage AWS WAF, Shield Advanced, GuardDuty, Macie, and Security Hub.
- Partner with DevOps teams to integrate SAST/DAST scanning into GitHub Actions and Jenkins pipelines.

Requirements:
- 7+ years of experience in AWS Cloud Infrastructure and Security Architecture.
- Deep expertise in Terraform, CloudFormation, and Python scripting.
- Active AWS Certified Security Specialty or CISSP certification preferred.`
  },
  {
    id: 'devsecops-lead',
    title: 'DevSecOps & Platform Engineer',
    role: TargetRole.DEVSECOPS,
    company: 'Enterprise SaaS Solutions',
    description: `About the Role:
We are hiring a DevSecOps Engineer to embed security controls into our CI/CD deployment pipelines and container infrastructure.

Key Responsibilities:
- Design shift-left security strategies across GitHub Actions, GitLab CI, and ArgoCD.
- Harden Kubernetes (EKS/AKS) cluster configurations using OPA Gatekeeper and Kyverno.
- Perform automated container image scanning using Trivy, Grype, and Snyk.
- Implement IaC scanning using Checkov and tfsec within automated pull request checks.
- Establish centralized observability using Prometheus, Grafana, and Datadog.

Requirements:
- Strong background in Linux administration, Docker, Kubernetes, and Helm.
- Hands-on experience with Terraform, Ansible, and Bash/Python automation.
- Proven track record of reducing vulnerability MTTR in high-velocity release cycles.`
  },
  {
    id: 'azure-cloud-arch',
    title: 'Azure Enterprise Cloud Architect',
    role: TargetRole.AZURE_CLOUD_ARCHITECT,
    company: 'Global Healthcare Cloud',
    description: `About the Role:
Seeking an Azure Cloud Architect to design enterprise Azure Landing Zones, hybrid network topologies, and scalable cloud platforms.

Key Responsibilities:
- Design Azure Landing Zones using Management Groups, Azure Policy, and Bicep/Terraform.
- Architect hub-and-spoke VNet topographies with Azure Firewall, ExpressRoute, and Application Gateways.
- Govern Microsoft Entra ID (Azure AD) enterprise identities, Conditional Access, and RBAC/ABAC models.
- Lead Well-Architected Framework reviews for mission-critical workloads.
- Drive disaster recovery (DR) and business continuity planning (BCP) across multi-region deployments.

Requirements:
- Azure Solutions Architect Expert certification (AZ-305).
- 8+ years architecting enterprise Azure cloud solutions.
- Deep knowledge of ARM templates, Bicep, Terraform, and hybrid connectivity.`
  },
  {
    id: 'sre-observability',
    title: 'Site Reliability Engineer (SRE)',
    role: TargetRole.SITE_RELIABILITY_ENGINEER,
    company: 'E-Commerce Cloud Platform',
    description: `About the Role:
Looking for an SRE to drive system reliability, toil reduction, and high availability for core multi-region microservices.

Key Responsibilities:
- Define and enforce SLIs, SLOs, and Error Budgets for critical application services.
- Build comprehensive telemetry and tracing using OpenTelemetry, Prometheus, Grafana, and Datadog.
- Drive Incident Response, post-mortems, and automated self-healing workflows using Python and Kubernetes operators.
- Optimize multi-cluster Kubernetes deployments and cloud infrastructure using Terraform.

Requirements:
- CKA certification preferred.
- Deep knowledge of Linux internals, networking protocols, and distributed systems.
- Experience with PagerDuty, Chaos Engineering, and toil reduction automation.`
  }
];
