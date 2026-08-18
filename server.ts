import express from "express";
import path from "path";
import { GoogleGenAI, Type, Schema } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper to retrieve Gemini AI Client lazily per request
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  const FREE_TIER_MODELS = [
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-3.1-flash-lite"
  ];

  async function generateContentWithFallback(ai: GoogleGenAI, requestParams: { contents: any; config?: any }) {
    let lastError: any = null;

    for (const model of FREE_TIER_MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: requestParams.contents,
            config: requestParams.config
          });
          if (response && response.text) {
            return response;
          }
        } catch (err: any) {
          lastError = err;
          const errMessage = err?.message || String(err);
          const isHighDemandOrTransient =
            err?.status === 503 ||
            err?.code === 503 ||
            err?.status === 429 ||
            err?.code === 429 ||
            errMessage.includes("503") ||
            errMessage.includes("UNAVAILABLE") ||
            errMessage.includes("high demand") ||
            errMessage.includes("ResourceExhausted") ||
            errMessage.includes("RESOURCE_EXHAUSTED");

          if (isHighDemandOrTransient) {
            console.warn(`Model ${model} attempt ${attempt} encountered high demand (503/429). Retrying/failing over...`);
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
            continue;
          } else {
            // For other non-transient errors on this model, break to try next fallback model
            break;
          }
        }
      }
    }

    throw lastError || new Error("AI service is experiencing high demand. Please retry in a few seconds.");
  }

  // Shared Schema
  const resumeSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "Professional summary tailored to the role" },
      skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of relevant technical skills" },
      certifications: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of relevant certifications" },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            duration: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["company", "role", "duration", "bullets"]
        }
      },
      analysis: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER, description: "Score from 0-100 indicating fit" },
          keywordsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
          toneNotes: { type: Type.STRING, description: "Explanation of tone adjustments" }
        },
        required: ["matchScore", "keywordsUsed", "toneNotes"]
      }
    },
    required: ["summary", "skills", "certifications", "experience", "analysis"]
  };

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "RoleArchitect Server" });
  });

  app.post("/api/generate-tailored-resume", async (req, res) => {
    try {
      const { jobDescription, targetRole, baseResume, jobLink } = req.body;
      if (!jobDescription) {
        return res.status(400).json({ error: "Job description is required" });
      }

      const ai = getAI();

      const systemPrompt = `
    You are RoleArchitect, a sophisticated career strategist engine. 
    Your goal is to rewrite the candidate's experience to perfectly align with a specific Job Description (JD) and Role.
    
    TARGET ROLE: ${targetRole}

    CORE RULES:
    1. FACTUAL INTEGRITY: Do not invent experiences. Reframe and elaborate on existing facts using the JD's terminology.
    2. TECHNICAL DEPTH & CONTEXT: 
       - Maximize technical detail. Never simplify. 
       - Every bullet point must include specific tools, protocols, versions, or methodologies.
       - Context is king: Explain *why* a task was done, the *complexity* involved, and the *architectural impact*.
    3. QUANTITY & LENGTH: 
       - DO NOT remove experience. Keep all roles.
       - Generate AT LEAST 8 dense bullet points per role (ideally 10-12 for Senior roles).
       - The final output should be comprehensive and verbose enough to fill 2+ pages.
    4. TONE: Professional, authoritative, highly technical. Use "Senior/Architect" level language.
    5. ROLE INTELLIGENCE:
       - If Cloud Security: Focus on risk, governance, audit, IAM, WAF, Zero Trust, Compliance frameworks (NIST, SOC2).
       - If Cloud Engineer (General): Focus on reliability, scale, cost optimization, IaC patterns, multi-region architectures.
       - If DevSecOps: Focus on CI/CD security, container hardening, shift-left security, policy-as-code.
       - If IAM Engineer:
         * Focus on Identity Lifecycle (JML), Access Governance, AuthN/AuthZ (SAML/OIDC/OAuth), PAM, and Federation.
         * Frame experience using "Identity Control Action + System Scope + Governance Outcome".
         * Emphasize keywords: Azure AD/Entra ID, Okta, Ping, PIM, RBAC/ABAC, Access Reviews, Least Privilege.
       - If DevOps Engineer:
         * Focus on CI/CD pipeline design, Infrastructure as Code (IaC), system reliability, and operational maturity.
         * Emphasize keywords: Jenkins, GitHub Actions, GitLab CI, Azure DevOps, Terraform, CloudFormation, Kubernetes, Helm, Docker, Prometheus, Grafana, ELK/OpenSearch.
       - If AWS Cloud Engineer:
         * Focus on AWS core services (EC2, VPC, S3, RDS), infrastructure design, high availability, and cost optimization.
         * Emphasize keywords: EC2, Auto Scaling, ELB/ALB/NLB, VPC, Subnets, Route Tables, S3, CloudFormation, AWS CDK, CloudWatch, Systems Manager.
       - If Azure Cloud Engineer:
         * Focus on Azure compute, networking, storage, VNets, high availability, and disaster recovery.
         * Emphasize keywords: Azure Virtual Machines, Azure App Service, AKS, Virtual Networks (VNets), Network Security Groups (NSGs), Azure Load Balancer, Application Gateway, Azure Storage, Azure SQL, ARM, Bicep, Azure Monitor, Log Analytics, Azure Cost Management, Microsoft Entra ID.
       - If Cloud Solution Architect:
         * Focus on end-to-end solution design, cloud patterns, multi-tier systems, NFRs (availability, scalability), and cost modeling.
       - If Azure Cloud Architect:
         * Focus on Azure enterprise architecture, landing zones, management groups, governance, and platform design.
       - If Site Reliability Engineer:
         * Focus on service reliability, uptime, SLIs/SLOs, error budgets, incident response, and observability.

    INPUT DATA:
    ${JSON.stringify(baseResume)}
  `;

      const userPrompt = `
    JOB CONTEXT:
    ${jobLink ? `Job Link: ${jobLink}` : ''}
    
    JOB DESCRIPTION:
    ${jobDescription}

    INSTRUCTIONS:
    1. Analyze the JD for key technical requirements and soft skills.
    2. Rewrite the "Summary" to be a comprehensive, technical executive summary (4-6 sentences).
    3. Reconstruct the "Experience" bullets:
       - EXPAND on the base resume's points. Do not summarize.
       - Ensure a minimum of 8 high-quality, dense bullet points per job role.
       - For every point, strictly follow: Action Verb -> Deep Technical Context -> Specific Tools Used -> Quantitative Business Impact.
       - Make all conversions extremely technical.
    4. Curate the "Skills" and "Certifications" sections.
    5. Return JSON only.
  `;

      const response = await generateContentWithFallback(ai, {
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: resumeSchema,
          temperature: 0.4
        }
      });

      if (!response.text) {
        throw new Error("No text response generated by Gemini model");
      }

      const parsedData = JSON.parse(response.text);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error in /api/generate-tailored-resume:", err);
      return res.status(500).json({ error: err.message || "Failed to generate tailored resume" });
    }
  });

  app.post("/api/optimize-tailored-resume", async (req, res) => {
    try {
      const { currentResume, userPrompt, jobDescription, targetRole } = req.body;
      if (!currentResume || !userPrompt) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const ai = getAI();

      const systemPrompt = `
    You are RoleArchitect, a sophisticated career strategist engine. 
    Your goal is to update and optimize the candidate's tailored resume based on the user's specific request.
    
    TARGET ROLE: ${targetRole}
    
    CURRENT RESUME JSON:
    ${JSON.stringify(currentResume)}
    
    JOB DESCRIPTION:
    ${jobDescription || 'N/A'}

    USER REQUEST:
    ${userPrompt}

    INSTRUCTIONS:
    1. Modify the CURRENT RESUME JSON to fulfill the USER REQUEST.
    2. Maintain the factual integrity of the resume.
    3. Ensure the output strictly follows the JSON schema.
    4. Update "analysis.toneNotes" to explain what you changed.
    5. Return JSON only.
  `;

      const response = await generateContentWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: resumeSchema,
          temperature: 0.4
        }
      });

      if (!response.text) {
        throw new Error("No response text from Gemini");
      }

      const parsedData = JSON.parse(response.text);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error in /api/optimize-tailored-resume:", err);
      return res.status(500).json({ error: err.message || "Failed to optimize CV" });
    }
  });

  app.post("/api/generate-application-answer", async (req, res) => {
    try {
      const { question, targetRole, baseResume, wordLimit, jobDescription, jobLink } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const ai = getAI();

      const answerSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          generated_answer: { type: Type.STRING },
          confidence_note: { type: Type.STRING },
          intent_detected: { type: Type.STRING }
        },
        required: ["generated_answer", "confidence_note", "intent_detected"]
      };

      const systemPrompt = `
    You are an intelligent Application Question Assistant.
    Your task is to answer employer application questions based on a candidate's profile.

    TARGET ROLE: ${targetRole}
    WORD LIMIT: ${wordLimit ? wordLimit + " words" : "Concise (approx 200 words)"}

    QUESTION INTENT CLASSIFICATION RULES:
    1. Technical (Tools, systems): Answer with experience-driven, factual depth.
    2. Behavioral ("Describe a time..."): Use STAR-aligned but concise structure.
    3. Governance (Risk, compliance): Focus on control, audit, and rigor.
    4. Role Fit ("Why this role?"): Focus on alignment and competence.

    TONE SUPPRESSION RULES:
    - NO marketing language ("Thrilled", "Excited", "Passionate").
    - Style: Neutral, evidence-based, professionally understated.
    - Format: Plain text, no bullets, no markdown.

    CANDIDATE PROFILE:
    ${JSON.stringify(baseResume)}

    JOB CONTEXT:
    ${jobLink ? `Job Link: ${jobLink}` : ''}
    ${jobDescription ? `Job Description:\n${jobDescription}` : ''}
  `;

      const userPrompt = `
    APPLICATION QUESTION:
    "${question}"

    Generate a tailored answer following the rules above.
  `;

      const response = await generateContentWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: answerSchema,
          temperature: 0.3
        }
      });

      if (!response.text) {
        throw new Error("No answer generated");
      }

      const parsedData = JSON.parse(response.text);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error in /api/generate-application-answer:", err);
      return res.status(500).json({ error: err.message || "Failed to generate answer" });
    }
  });

  app.post("/api/generate-cover-letter", async (req, res) => {
    try {
      const { companyName, hiringManager, targetRole, baseResume, jobDescription } = req.body;
      if (!companyName) {
        return res.status(400).json({ error: "Company name is required" });
      }

      const ai = getAI();

      const coverLetterSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The full formatted cover letter" }
        },
        required: ["content"]
      };

      const systemPrompt = `
    You are an Executive Career Strategist.
    Write a highly tailored Cover Letter.

    TARGET ROLE: ${targetRole}
    COMPANY: ${companyName}
    HIRING MANAGER: ${hiringManager || "Hiring Manager"}

    TONE & STYLE:
    - Confidence without arrogance.
    - Evidence-based statements (cite specific technical wins from the resume).
    - "Hook" opening that addresses the company's specific needs found in the JD.
    - No generic fluff ("I am a hard worker").

    STRUCTURE:
    1. Header (Standard business format)
    2. Salutation
    3. The Hook
    4. The Value Prop (2 specific technical achievements)
    5. The Closing

    CANDIDATE DATA:
    ${JSON.stringify(baseResume)}

    JOB DESCRIPTION:
    ${jobDescription || "No specific JD provided."}
  `;

      const response = await generateContentWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: coverLetterSchema,
          temperature: 0.4
        }
      });

      if (!response.text) {
        throw new Error("No response text");
      }

      const parsedData = JSON.parse(response.text);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error in /api/generate-cover-letter:", err);
      return res.status(500).json({ error: err.message || "Failed to generate cover letter" });
    }
  });

  app.post("/api/parse-resume-text", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Resume text is required" });
      }

      const ai = getAI();

      const parseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          contact: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              linkedin: { type: Type.STRING }
            },
            required: ["location", "email"]
          },
          summary: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
          education: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                duration: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["company", "role", "duration", "bullets"]
            }
          }
        },
        required: ["name", "contact", "summary", "skills", "experience"]
      };

      const prompt = `
    Extract structured resume data from the text below. 
    Map it to the JSON schema strictly.
    Ensure "bullets" in experience are preserved as individual points from the source text.
    
    RESUME TEXT:
    ${text}
  `;

      const response = await generateContentWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: parseSchema
        }
      });

      if (!response.text) {
        throw new Error("No response generated");
      }

      const parsedData = JSON.parse(response.text);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error in /api/parse-resume-text:", err);
      return res.status(500).json({ error: err.message || "Failed to parse resume text" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
