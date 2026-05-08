// api/template.js
// Serves Pro template CV content after verifying a Pro token.
// Free templates are served inline (they're already public).

import crypto from 'crypto';

function isProToken(token) {
  if (!token) return false;
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return false;
    const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'cvapplied-fallback-secret';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf) && payload.includes(':pro');
  } catch { return false; }
}

// Pro template CV content lives server-side only
const PRO_TEMPLATES = {
  'hr': `YOUR FULL NAME
your.name@email.com | 07700 000000 | London, UK | linkedin.com/in/your-name

─────────────────────────────────────────────
PROFESSIONAL PROFILE
─────────────────────────────────────────────
Strategic HR Business Partner with 10 years' experience partnering with senior leadership across FTSE 100 and high-growth technology businesses. CIPD Level 7 qualified with a track record of leading organisation design, talent acquisition, and complex ER casework. Skilled in building high-performing people functions from the ground up and aligning HR strategy to commercial objectives.

─────────────────────────────────────────────
CORE COMPETENCIES
─────────────────────────────────────────────
HR Business Partnering | Organisation Design | Talent Acquisition | Employee Relations | TUPE | Performance Management | L&D Strategy | Compensation & Benefits | Succession Planning | CIPD Level 7 | Workday HCM | Employment Law (UK)

─────────────────────────────────────────────
PROFESSIONAL EXPERIENCE
─────────────────────────────────────────────
Senior HR Business Partner | Lloyds Banking Group | London | Mar 2021 – Present
• Partner to 3 divisional MDs covering 1,200 employees across Retail, Digital, and Operations
• Led organisation redesign programme reducing headcount by 8% while improving eNPS from 32 to 51
• Managed 40+ complex ER cases including redundancy, disciplinary, and grievance matters — zero employment tribunal outcomes
• Designed and implemented new performance management framework adopted across 6,000-person UK business
• Partnered with L&D to launch manager capability programme reaching 320 people managers in year one

HR Business Partner | Monzo Bank | London | Jun 2018 – Feb 2021
• Scaled HR function from 200 to 800 employees during period of rapid growth
• Owned end-to-end TUPE process for 3 acquisitions — 0 grievances raised during integration
• Built graduate talent pipeline in partnership with 12 UK universities — 40 graduates hired in 2020
• Reduced average time-to-hire from 34 to 18 days through ATS implementation and hiring manager training

─────────────────────────────────────────────
EDUCATION & QUALIFICATIONS
─────────────────────────────────────────────
MSc Human Resource Management (Distinction) | King's College London | 2014
BA Psychology (2:1) | University of Bristol | 2013
CIPD Level 7 Associate Diploma in People Management | 2016
`,

  'legal': `YOUR FULL NAME
your.name@email.com | 07700 000000 | London, UK | linkedin.com/in/your-name
Solicitor — England & Wales | SRA Number: XXXXXXX

─────────────────────────────────────────────
PROFESSIONAL PROFILE
─────────────────────────────────────────────
Commercial litigation solicitor with 7 years' PQE in high-value dispute resolution across financial services, technology, and real estate. Track record of managing complex multi-jurisdictional disputes and leading teams in High Court and international arbitration proceedings. Client-focused with strong business development credentials and a reputation for pragmatic, commercially-minded advice.

─────────────────────────────────────────────
CORE COMPETENCIES
─────────────────────────────────────────────
Commercial Litigation | High Court Proceedings | International Arbitration (ICC, LCIA) | Financial Services Disputes | Contract Disputes | Injunctive Relief | Mediation | Legal Project Management | Business Development | Client Relationship Management

─────────────────────────────────────────────
PROFESSIONAL EXPERIENCE
─────────────────────────────────────────────
Senior Associate — Commercial Litigation | Freshfields Bruckhaus Deringer | London | Sep 2020 – Present
• Lead associate on £340M breach of contract dispute between two FTSE 100 corporates — proceedings ongoing in the Commercial Court
• Managed team of 4 associates and 6 trainees across 3 concurrent high-value matters
• Secured emergency injunction within 48 hours for client in misappropriation of trade secrets case — preserved £18M in assets
• Developed and delivered client secondment programme — 3 clients hosted in-house associates in 2023
• Recognised in Legal 500 UK 2024: "A rising star — technically excellent and instinctively commercial"

Associate — Dispute Resolution | Herbert Smith Freehills | London | Sep 2017 – Aug 2020
• Acted for major investment banks and asset managers in complex financial products disputes
• Sole associate on LCIA arbitration (£12M claim) from pleadings through to award
• Contributed to firm's successful defence of FRAND patent licence dispute in Technology and Construction Court

─────────────────────────────────────────────
EDUCATION & QUALIFICATIONS
─────────────────────────────────────────────
LLB Law (First Class Honours) | University of Cambridge | 2017
LPC with Distinction | BPP Law School | 2018
Admitted to the Roll of Solicitors of England and Wales | 2021
`,

  'nhs': `YOUR FULL NAME
your.name@email.com | 07700 000000 | London, UK | linkedin.com/in/your-name
NMC/HCPC Registration No: XXXXXXXX

─────────────────────────────────────────────
PROFESSIONAL PROFILE
─────────────────────────────────────────────
Registered Nurse (Band 7) with 9 years' NHS experience across acute and community settings. Specialist in cardiac care with a proven track record in clinical leadership, service improvement, and patient safety. Experienced in CQC inspection preparation, ward management, and staff development. Committed to delivering compassionate, evidence-based care to diverse patient populations.

─────────────────────────────────────────────
CORE COMPETENCIES
─────────────────────────────────────────────
Clinical Leadership | Ward Management | Patient Safety | Care Quality Commission (CQC) | Medicines Management | Risk Assessment | Staff Supervision & Appraisal | Service Improvement | Safeguarding | DATIX | Electronic Patient Records (EPR) | NHS England Frameworks

─────────────────────────────────────────────
PROFESSIONAL EXPERIENCE
─────────────────────────────────────────────
Senior Staff Nurse (Band 7) | Royal Free Hospital NHS Foundation Trust | London | Jun 2020 – Present
• Lead nurse for 28-bed cardiac step-down unit, managing a team of 12 nursing staff across 3 shifts
• Reduced medication errors by 34% through implementation of double-checking protocol and staff training programme
• Coordinated CQC inspection preparation across 3 wards, contributing to Outstanding rating in patient outcomes domain
• Mentored 6 student nurses and 2 newly qualified staff, all progressing successfully to Band 5 and 6 posts
• Led service improvement project reducing average discharge time by 2.4 hours, freeing 8 additional bed days per week

Staff Nurse (Band 6) | King's College Hospital NHS Foundation Trust | London | Aug 2016 – May 2020
• Delivered direct patient care on busy 32-bed acute cardiology ward
• Completed Preceptorship programme and achieved Band 6 promotion within 18 months of qualification
• Acted as shift coordinator and escalation point for junior staff

─────────────────────────────────────────────
EDUCATION & QUALIFICATIONS
─────────────────────────────────────────────
BSc Nursing (First Class Honours) | King's College London | 2015
NMC Registered Nurse (Adult) | Active registration | Revalidated 2024
ALS Provider Certificate | Resuscitation Council UK | 2023
Non-Medical Prescribing (V300) | 2022
`,

  'sales': `YOUR FULL NAME
your.name@email.com | 07700 000000 | London, UK | linkedin.com/in/your-name

─────────────────────────────────────────────
PROFESSIONAL PROFILE
─────────────────────────────────────────────
High-performing B2B Sales Manager with 8 years' experience selling SaaS and professional services to enterprise clients. Consistent top-quartile performer with a track record of exceeding quota, building pipeline, and leading teams to revenue targets. Skilled in consultative selling, enterprise deal management, and coaching AEs to peak performance.

─────────────────────────────────────────────
CORE COMPETENCIES
─────────────────────────────────────────────
New Business Development | Account Management | Pipeline Management | Salesforce CRM | Enterprise Sales Cycles | Consultative Selling | Territory Planning | Team Leadership | Revenue Forecasting | Contract Negotiation | SDR Management | SaaS Metrics (ARR, MRR, Churn, NRR)

─────────────────────────────────────────────
PROFESSIONAL EXPERIENCE
─────────────────────────────────────────────
Senior Sales Manager | Sage plc | London | Feb 2021 – Present
• Exceeded annual quota 3 years running — 118%, 124%, 131% attainment vs target
• Closed £2.1M ARR in new business in FY2024, including single largest deal in team history at £340K TCV
• Managed and coached a team of 6 Account Executives, lifting team average quota attainment from 84% to 107%
• Rebuilt territory strategy for London Mid-Market segment, growing addressable pipeline by 240%
• Partnered with Marketing on ABM campaign targeting 50 target accounts, generating £890K pipeline

Account Executive | HubSpot | London | Jun 2018 – Jan 2021
• Closed 47 new logo deals in FY2020 — ranked #2 of 28 AEs in EMEA region
• Average deal size £28K ARR; sales cycle 45 days average
• Developed outbound motion targeting VC-backed scale-ups, generating 35% of own pipeline

─────────────────────────────────────────────
EDUCATION & QUALIFICATIONS
─────────────────────────────────────────────
BA Business Management (2:1) | University of Exeter | 2016
Salesforce Certified Administrator | 2020
MEDDPICC Sales Methodology Certified | 2022
`,

  'operations': `YOUR FULL NAME
your.name@email.com | 07700 000000 | Birmingham, UK | linkedin.com/in/your-name

─────────────────────────────────────────────
PROFESSIONAL PROFILE
─────────────────────────────────────────────
Results-oriented Operations Manager with 10 years' experience optimising supply chain, logistics, and manufacturing operations in FMCG and retail. Lean Six Sigma Black Belt with a track record of delivering multi-million pound efficiency savings, improving OEE, and leading large-scale operational transformations. Skilled at managing P&L, vendor relationships, and cross-functional teams.

─────────────────────────────────────────────
CORE COMPETENCIES
─────────────────────────────────────────────
Lean Six Sigma (Black Belt) | Supply Chain Management | P&L Ownership | Continuous Improvement (CI) | Demand Planning | Vendor Management | Warehouse Operations | KPI Development | SAP ERP | Change Management | Health & Safety (IOSH) | Team Leadership (up to 80 FTE)

─────────────────────────────────────────────
PROFESSIONAL EXPERIENCE
─────────────────────────────────────────────
Operations Manager | Unilever UK | Leeds | Apr 2020 – Present
• Full P&L responsibility for £18M manufacturing line producing 4.2M units annually
• Delivered £1.4M annual cost saving through Lean CI programme — 3 Kaizen events, 12 waste-reduction projects
• Improved Overall Equipment Effectiveness (OEE) from 71% to 86% over 18 months
• Managed warehouse team of 65 FTE across 2 shifts, reducing agency spend by £320K through permanent headcount restructure
• Implemented SAP S/4HANA across 2 production lines — on time and £40K under budget

Operations Supervisor | Tesco plc | Birmingham | Jan 2016 – Mar 2020
• Supervised grocery distribution centre handling 18,000 SKUs and £2.3M weekly throughput
• Reduced picking errors by 41% through process redesign and RF scanning implementation
• Led team of 22 across inbound, outbound, and returns operations

─────────────────────────────────────────────
EDUCATION & QUALIFICATIONS
─────────────────────────────────────────────
BSc Operations Management (2:1) | Aston University | 2014
Lean Six Sigma Black Belt | British Quality Foundation | 2019
IOSH Managing Safely | 2017
CILT Level 3 Award in Supply Chain | 2016
`,

  'graduate': `YOUR FULL NAME
your.name@email.com | 07700 000000 | London, UK | linkedin.com/in/your-name

─────────────────────────────────────────────
PROFESSIONAL PROFILE
─────────────────────────────────────────────
Motivated and analytically-minded Economics graduate (2:1, University of Bristol) seeking a graduate role in consulting, finance, or technology. Strong academic foundation in quantitative analysis, econometrics, and business strategy. Complemented by hands-on internship experience, student leadership, and a proven ability to communicate complex ideas clearly to diverse audiences.

─────────────────────────────────────────────
EDUCATION
─────────────────────────────────────────────
BSc Economics (2:1) | University of Bristol | 2024
Relevant modules: Econometrics, Financial Economics, Microeconomic Theory, Game Theory, Data Analysis with R
Dissertation: "The impact of rising interest rates on UK SME lending behaviour" — awarded First Class

A-Levels: Mathematics (A*), Economics (A), Further Mathematics (A) | 2021

─────────────────────────────────────────────
WORK EXPERIENCE
─────────────────────────────────────────────
Summer Analyst Intern | Goldman Sachs | London | Jun 2023 – Aug 2023
• Rotated across Equity Research and Operations divisions during 10-week programme
• Built financial model in Excel to analyse EV/EBITDA multiples for 15 UK mid-cap retailers
• Presented findings to team of 8 analysts; received commendation from desk head

Junior Research Assistant | University of Bristol Economics Department | Sep 2022 – May 2023
• Assisted Professor in research project on UK housing market dynamics
• Cleaned and analysed ONS dataset of 200,000+ transactions using R and Stata
• Contributed to working paper submitted to Journal of Housing Economics

─────────────────────────────────────────────
LEADERSHIP & ACTIVITIES
─────────────────────────────────────────────
President | Bristol Economics Society | 2022–2023
• Grew membership from 180 to 340 students; organised 12 events including panel with KPMG and Barclays
• Secured £4,500 in corporate sponsorship — highest in society history

─────────────────────────────────────────────
SKILLS
─────────────────────────────────────────────
Technical: R, Python (basic), Excel (advanced), Stata, Bloomberg Terminal
Languages: English (native), French (B2)
`,

  'executive': `YOUR FULL NAME
your.name@email.com | 07700 000000 | London, UK | linkedin.com/in/your-name

─────────────────────────────────────────────
EXECUTIVE PROFILE
─────────────────────────────────────────────
Senior financial services executive with 20 years' experience leading P&L, strategy, and transformation across insurance, asset management, and banking. Board-level operator with a track record of scaling businesses from £50M to £500M revenue, leading M&A transactions, and building high-performing leadership teams. Non-Executive Director experience across regulated and private equity-backed businesses.

─────────────────────────────────────────────
CORE COMPETENCIES
─────────────────────────────────────────────
P&L Leadership (up to £500M) | Strategic Planning | M&A and Integration | Board Governance | FCA Regulated Businesses | Investor Relations | Digital Transformation | Organisational Redesign | Executive Team Development | Capital Allocation

─────────────────────────────────────────────
EXECUTIVE EXPERIENCE
─────────────────────────────────────────────
Chief Operating Officer | Aviva UK Life | London | Jan 2019 – Present
• Member of UK Life Executive Committee with shared accountability for £2.4B annual revenue
• Led digital transformation programme delivering £85M in run-rate cost savings over 3 years
• Oversaw integration of Friends Life legacy systems — 18-month programme, £40M under budget
• Chaired Operating Committee of 8 senior leaders across Technology, Operations, and Risk
• Sponsored gender diversity programme — female representation in senior leadership from 28% to 41%

Managing Director — Retail Distribution | Standard Life Aberdeen | Edinburgh & London | Mar 2014 – Dec 2018
• Full P&L responsibility for £340M revenue retail distribution business
• Grew AUM under retail advice channel from £12B to £19B over 4 years
• Led acquisition and integration of Elevate platform — £250M transaction, synergy target exceeded by 15%
• Appointed to Group Executive Committee 2016

─────────────────────────────────────────────
NON-EXECUTIVE DIRECTORSHIPS
─────────────────────────────────────────────
Non-Executive Director | Pension Insurance Corporation | 2021 – Present
Non-Executive Director | Fintech Scale-up (NDA) | 2020 – 2022

─────────────────────────────────────────────
EDUCATION & QUALIFICATIONS
─────────────────────────────────────────────
MBA (Distinction) | London Business School | 2009
BA Economics (First Class) | University of Warwick | 2004
Chartered Insurance Professional (ACII) | 2008
FCA Approved Person (CF1, CF10, CF29)
`,

  'career-change': `YOUR FULL NAME
your.name@email.com | 07700 000000 | London, UK | linkedin.com/in/your-name

─────────────────────────────────────────────
PROFESSIONAL PROFILE
─────────────────────────────────────────────
Former finance professional transitioning into product management, with 6 years' experience in financial analysis and business operations at FTSE 100 level. Recently completed a certified Product Management course and built two end-to-end web applications. Brings a unique combination of commercial rigour, stakeholder management, and data-driven decision-making to product roles. Seeking a first PM position in a product-led tech company.

─────────────────────────────────────────────
TRANSFERABLE SKILLS
─────────────────────────────────────────────
Data Analysis & Insight | Stakeholder Management | Roadmap Thinking | Problem Framing | User Research (self-taught) | Agile Fundamentals | SQL | Figma (basic wireframing) | A/B Testing Concepts | Business Case Development | Cross-functional Collaboration | Prioritisation Frameworks (RICE, MoSCoW)

─────────────────────────────────────────────
RELEVANT PROJECTS
─────────────────────────────────────────────
BudgetWise — Personal Finance App (2024)
• Designed and shipped a web app for UK budget tracking using React and Node.js — 120 active users
• Conducted 14 user interviews to define core features; iterated 3 times based on feedback
• Wrote full PRD, built Figma prototype, and managed development backlog in Notion

Internal Process Tool | Current Employer (2023)
• Identified manual reporting bottleneck wasting 4hrs/week across 3 teams
• Defined requirements, worked with IT to build automated Excel solution — saving 200 hours annually

─────────────────────────────────────────────
PROFESSIONAL EXPERIENCE (Prior Career)
─────────────────────────────────────────────
Senior Financial Analyst | BP plc | London | Sep 2018 – Present
• Produced monthly management accounts and KPI dashboards for £300M cost centre
• Business-partnered with 5 operational teams to drive cost efficiency and variance analysis
• Led implementation of new FP&A reporting tool across 3 divisions — owned requirements gathering and UAT

─────────────────────────────────────────────
EDUCATION & QUALIFICATIONS
─────────────────────────────────────────────
BSc Accounting & Finance (2:1) | University of Leeds | 2018
Product Management Certificate | Product School | 2024
Google UX Design Certificate | Coursera | 2023
ACA Part-Qualified | ICAEW | 2020
`
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, token } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Template ID required' });
  }

  const safeId = id.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const content = PRO_TEMPLATES[safeId];

  if (!content) {
    return res.status(404).json({ error: 'Template not found' });
  }

  if (!isProToken(token)) {
    return res.status(403).json({ error: 'Pro access required', upgrade: true });
  }

  return res.status(200).json({ cv: content });
}
