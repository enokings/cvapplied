<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CVApplied — One-Click Job Tailoring</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MG5NEFRT2S"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-MG5NEFRT2S');
</script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0f1117; --ink-soft: #3a3d4a; --ink-muted: #7a7f8e;
    --paper: #fafaf8; --white: #ffffff; --accent: #1a56db;
    --accent-soft: #e8effe; --rule: #e4e4e0; --gold: #c89b3c;
    --green: #1a7a4a; --green-soft: #e6f4ed;
    --red: #c0392b; --red-soft: #fdf0ee;
    --amber: #d97706; --amber-soft: #fef3c7;
    --shadow-sm: 0 1px 3px rgba(15,17,23,0.06);
    --shadow-md: 0 4px 16px rgba(15,17,23,0.08);
    --shadow-lg: 0 12px 40px rgba(15,17,23,0.10);
    --radius: 10px; --radius-lg: 18px;
  }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased; min-height: 100vh; }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(250,250,248,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--rule); padding: 0 48px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: var(--ink); text-decoration: none; letter-spacing: -0.02em; }
  .nav-logo span { color: var(--accent); }
  .nav-right { display: flex; align-items: center; gap: 20px; }
  .nav-link { font-size: 0.85rem; font-weight: 500; color: var(--ink-soft); text-decoration: none; transition: color 0.2s; }
  .nav-link:hover { color: var(--ink); }

  .main { max-width: 1200px; margin: 0 auto; padding: 100px 32px 80px; }

  .page-header { text-align: center; margin-bottom: 40px; }
  .page-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: var(--accent-soft); color: var(--accent); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 6px 14px; border-radius: 4px; margin-bottom: 16px; }
  .page-eyebrow::before { content: ''; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }
  .page-header h1 { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.025em; margin-bottom: 12px; }
  .page-header h1 em { font-style: normal; color: var(--accent); }
  .page-header p { font-size: 1rem; color: var(--ink-soft); font-weight: 300; max-width: 540px; margin: 0 auto; }

  /* PRO GATE */
  .pro-gate {
    background: var(--white); border: 1px solid var(--rule);
    border-radius: var(--radius-lg); padding: 40px;
    text-align: center; margin-bottom: 32px;
    box-shadow: var(--shadow-sm);
  }
  .pro-gate-icon { font-size: 2.5rem; margin-bottom: 16px; }
  .pro-gate h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
  .pro-gate p { font-size: 0.9rem; color: var(--ink-soft); margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; }
  .gate-form-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
  .code-input {
    padding: 12px 16px; border: 1.5px solid var(--rule); border-radius: 8px;
    font-family: 'DM Mono', monospace; font-size: 1rem; text-align: center;
    letter-spacing: 0.1em; outline: none; text-transform: uppercase;
    transition: border-color 0.2s; width: 200px;
  }
  .code-input:focus { border-color: var(--accent); }
  .unlock-btn {
    padding: 12px 24px; background: var(--accent); color: var(--white);
    border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
  }
  .unlock-btn:hover { background: #1548c0; }
  .unlock-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .code-error { font-size: 0.8rem; color: var(--red); margin-bottom: 10px; display: none; }
  .code-error.show { display: block; }
  .gate-divider { font-size: 0.8rem; color: var(--ink-muted); margin: 16px 0; }
  .gate-stripe-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .btn-stripe { padding: 11px 22px; background: var(--accent); color: var(--white); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 700; text-decoration: none; transition: background 0.2s; }
  .btn-stripe:hover { background: #1548c0; }
  .btn-stripe-ghost { padding: 11px 22px; background: transparent; color: var(--ink-soft); border: 1.5px solid var(--rule); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500; text-decoration: none; transition: all 0.2s; }
  .btn-stripe-ghost:hover { border-color: var(--ink); color: var(--ink); }

  /* INPUT GRID */
  .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .card { background: var(--white); border: 1px solid var(--rule); border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow-sm); }
  .card-title { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .step-dot { width: 22px; height: 22px; background: var(--accent); border-radius: 50%; color: var(--white); font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .input-tabs { display: flex; gap: 2px; background: var(--paper); border-radius: 8px; padding: 4px; margin-bottom: 16px; border: 1px solid var(--rule); }
  .input-tab { flex: 1; padding: 8px 12px; text-align: center; font-size: 0.82rem; font-weight: 500; color: var(--ink-muted); border-radius: 6px; cursor: pointer; transition: all 0.2s; border: none; background: transparent; }
  .input-tab.active { background: var(--white); color: var(--ink); font-weight: 600; box-shadow: var(--shadow-sm); border: 1px solid var(--rule); }

  .cv-textarea { width: 100%; min-height: 360px; border: 1.5px solid var(--rule); border-radius: var(--radius); padding: 14px; font-family: 'DM Mono', monospace; font-size: 0.82rem; color: var(--ink); line-height: 1.6; resize: vertical; outline: none; transition: border-color 0.2s; background: var(--paper); }
  .cv-textarea:focus { border-color: var(--accent); background: var(--white); }
  .cv-textarea::placeholder { color: var(--ink-muted); font-family: 'DM Sans', sans-serif; }
  .jd-textarea { width: 100%; min-height: 360px; border: 1.5px solid var(--rule); border-radius: var(--radius); padding: 14px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--ink); line-height: 1.6; resize: vertical; outline: none; transition: border-color 0.2s; background: var(--paper); }
  .jd-textarea:focus { border-color: var(--accent); background: var(--white); }
  .jd-textarea::placeholder { color: var(--ink-muted); }

  .upload-zone { border: 2px dashed var(--rule); border-radius: var(--radius); padding: 36px 20px; text-align: center; background: var(--paper); cursor: pointer; transition: all 0.2s; position: relative; }
  .upload-zone:hover, .upload-zone.drag-over { border-color: var(--accent); background: var(--accent-soft); }
  .upload-zone.has-file { border-color: var(--green); background: var(--green-soft); border-style: solid; }
  .upload-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
  .upload-icon { font-size: 1.8rem; margin-bottom: 8px; }
  .upload-zone h3 { font-size: 0.88rem; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
  .upload-zone p { font-size: 0.78rem; color: var(--ink-muted); }

  /* TAILOR BUTTON */
  .tailor-btn { width: 100%; padding: 16px; background: var(--accent); color: var(--white); border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(26,86,219,0.3); display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
  .tailor-btn:hover:not(:disabled) { background: #1548c0; transform: translateY(-1px); }
  .tailor-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ERROR */
  .error-banner { display: none; background: var(--red-soft); border: 1px solid #f5c6c0; border-radius: var(--radius); padding: 14px 18px; font-size: 0.88rem; color: var(--red); margin-bottom: 16px; }
  .error-banner.show { display: block; }

  /* LOADING */
  .loading-state { display: none; text-align: center; padding: 48px 24px; }
  .loading-state.show { display: block; }
  .loading-spinner { width: 48px; height: 48px; border: 3px solid var(--rule); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 20px; max-width: 400px; margin-left: auto; margin-right: auto; }
  .loading-step { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--ink-muted); padding: 8px 16px; border-radius: 8px; background: var(--white); border: 1px solid var(--rule); transition: all 0.3s; }
  .loading-step.active { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
  .loading-step.done { color: var(--green); border-color: var(--green); background: var(--green-soft); }
  .loading-step-icon { font-size: 0.9rem; width: 20px; text-align: center; }

  /* RESULTS */
  .results-section { display: none; }
  .results-section.show { display: block; }

  /* RESULTS HEADER */
  .results-header { background: var(--green); border-radius: var(--radius-lg); padding: 24px 32px; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .results-header-text h2 { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--white); margin-bottom: 4px; }
  .results-header-text p { font-size: 0.88rem; color: rgba(255,255,255,0.75); }
  .results-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-left: auto; }

  .btn-copy-result { padding: 10px 18px; background: rgba(255,255,255,0.2); color: var(--white); border: 1.5px solid rgba(255,255,255,0.3); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-copy-result:hover { background: rgba(255,255,255,0.3); }
  .btn-copy-result.copied { background: rgba(255,255,255,0.35); }
  .btn-docx { padding: 10px 18px; background: var(--white); color: var(--green); border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-docx:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .btn-pdf { padding: 10px 18px; background: transparent; color: var(--white); border: 1.5px solid rgba(255,255,255,0.3); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .btn-pdf:hover { background: rgba(255,255,255,0.15); }
  .btn-analyse-link { padding: 10px 18px; background: rgba(255,255,255,0.15); color: var(--white); border: 1.5px solid rgba(255,255,255,0.25); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
  .btn-analyse-link:hover { background: rgba(255,255,255,0.25); }
  .btn-reset { padding: 10px 18px; background: transparent; color: rgba(255,255,255,0.6); border: 1.5px solid rgba(255,255,255,0.15); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 400; cursor: pointer; transition: all 0.2s; }
  .btn-reset:hover { color: var(--white); border-color: rgba(255,255,255,0.35); }

  /* SIDE BY SIDE */
  .side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .cv-panel { background: var(--white); border: 1px solid var(--rule); border-radius: var(--radius-lg); overflow: hidden; }
  .cv-panel-header { padding: 16px 20px; border-bottom: 1px solid var(--rule); background: var(--paper); display: flex; align-items: center; gap: 10px; }
  .cv-panel-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .cv-panel-label.before { color: var(--ink-muted); }
  .cv-panel-label.after { color: var(--green); }
  .cv-panel-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-left: auto; }
  .cv-panel-badge.tailored { background: var(--green-soft); color: var(--green); }
  .cv-panel textarea { width: 100%; min-height: 600px; border: none; outline: none; padding: 20px; font-family: 'DM Mono', monospace; font-size: 0.8rem; line-height: 1.7; color: var(--ink-soft); resize: vertical; background: var(--white); }

  /* CHANGES LIST */
  .changes-section { margin-bottom: 24px; }
  .changes-title { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .changes-title::after { content: ''; flex: 1; height: 1px; background: var(--rule); }
  .changes-list { display: flex; flex-direction: column; gap: 8px; }
  .change-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; background: var(--white); border: 1px solid var(--rule); border-radius: 8px; font-size: 0.85rem; color: var(--ink-soft); }
  .change-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 7px; border-radius: 4px; flex-shrink: 0; margin-top: 1px; }
  .change-badge.keyword { background: var(--accent-soft); color: var(--accent); }
  .change-badge.reorder { background: var(--amber-soft); color: var(--amber); }
  .change-badge.rewrite { background: var(--green-soft); color: var(--green); }
  .change-badge.summary { background: #f3e8ff; color: #7c3aed; }

  @media (max-width: 900px) {
    nav { padding: 0 20px; }
    .main { padding: 88px 20px 60px; }
    .input-grid { grid-template-columns: 1fr; }
    .side-by-side { grid-template-columns: 1fr; }
    .results-header { flex-direction: column; align-items: flex-start; }
    .results-actions { margin-left: 0; }
  }
  @media (max-width: 600px) {
    nav { padding: 0 16px; }
    .main { padding: 80px 12px 48px; }
    .card { padding: 16px; }
  }
</style>
</head>
<body>

<nav>
  <a href="index.html" class="nav-logo">CV<span>Applied</span></a>
  <div class="nav-right">
    <a href="analyse.html" class="nav-link">Analyse CV</a>
    <a href="templates.html" class="nav-link">Templates</a>
    <a href="index.html" class="nav-link">← Home</a>
  </div>
</nav>

<div class="main">

  <div class="page-header">
    <div class="page-eyebrow">Pro Feature</div>
    <h1>Tailor your CV to any job — <em>instantly</em></h1>
    <p>Paste your CV and the job description. CVApplied rewrites your CV to match the role — reordering sections, injecting keywords, and sharpening language — without changing your actual experience.</p>
  </div>

  <!-- PRO GATE (hidden when Pro unlocked) -->
  <div class="pro-gate" id="pro-gate">
    <div class="pro-gate-icon">🔑</div>
    <h2>Pro Feature</h2>
    <p>Job tailoring is available on CVApplied Pro. Enter your access code to unlock, or upgrade below.</p>
    <div class="gate-form-row">
      <input type="text" class="code-input" id="gate-code-input" placeholder="CVAP-XXXX-XXXX" maxlength="14" oninput="formatGateCode(this)" aria-label="Pro access code">
      <button class="unlock-btn" id="gate-unlock-btn" onclick="verifyGateCode()">Unlock →</button>
    </div>
    <div class="code-error" id="gate-code-error"></div>
    <div class="gate-divider">or</div>
    <div class="gate-stripe-row">
      <a href="https://buy.stripe.com/cNi14n72RfH1aBa1HOfjG00" target="_blank" rel="noopener" class="btn-stripe">Get Pro — £9/mo →</a>
      <a href="https://buy.stripe.com/6oU6oHaf366rbFe2LSfjG01" target="_blank" rel="noopener" class="btn-stripe-ghost">£89/yr — Save 17%</a>
    </div>
    <p style="margin-top:12px; font-size:0.75rem; color:var(--ink-muted);">Cancel any time</p>
  </div>

  <!-- TAILOR TOOL (shown when Pro unlocked) -->
  <div id="tailor-tool" style="display:none;">

    <!-- INPUT GRID -->
    <div class="input-grid" id="input-section">

      <!-- CV INPUT -->
      <div class="card">
        <div class="card-title"><div class="step-dot">1</div> Your Current CV</div>
        <div class="input-tabs">
          <button class="input-tab active" id="cv-tab-paste" onclick="switchCVTab('paste')">✏️ Paste Text</button>
          <button class="input-tab" id="cv-tab-upload" onclick="switchCVTab('upload')">📄 Upload File</button>
        </div>
        <div id="cv-paste-panel">
          <textarea class="cv-textarea" id="cv-text" placeholder="Paste your full CV here...

YOUR FULL NAME
your.name@email.com | 07700 000000 | London, UK

PROFESSIONAL PROFILE
Results-driven professional..." aria-label="Your CV text"></textarea>
        </div>
        <div id="cv-upload-panel" style="display:none;">
          <div class="upload-zone" id="cv-upload-zone" onclick="document.getElementById('cv-file').click()">
            <input type="file" id="cv-file" accept=".pdf,.doc,.docx,.txt" style="display:none" aria-label="Upload CV file">
            <div class="upload-icon" id="cv-upload-icon">📄</div>
            <h3 id="cv-upload-title">Drop your CV here or click to browse</h3>
            <p id="cv-upload-sub">PDF, DOC, DOCX or TXT</p>
          </div>
        </div>
      </div>

      <!-- JD INPUT -->
      <div class="card">
        <div class="card-title"><div class="step-dot">2</div> Job Description</div>
        <div class="input-tabs">
          <button class="input-tab active" id="jd-tab-paste" onclick="switchJDTab('paste')">✏️ Paste Text</button>
          <button class="input-tab" id="jd-tab-upload" onclick="switchJDTab('upload')">📄 Upload File</button>
        </div>
        <div id="jd-paste-panel">
          <textarea class="jd-textarea" id="jd-text" placeholder="Paste the full job description here...

We are looking for an experienced Senior Product Manager to join our growing team. The ideal candidate will have 5+ years experience in B2B SaaS..." aria-label="Job description text"></textarea>
        </div>
        <div id="jd-upload-panel" style="display:none;">
          <div class="upload-zone" id="jd-upload-zone" onclick="document.getElementById('jd-file').click()">
            <input type="file" id="jd-file" accept=".pdf,.doc,.docx,.txt" style="display:none" aria-label="Upload job description file">
            <div class="upload-icon" id="jd-upload-icon">📄</div>
            <h3 id="jd-upload-title">Drop JD file here or click to browse</h3>
            <p id="jd-upload-sub">PDF, DOC, DOCX or TXT</p>
          </div>
        </div>
      </div>

    </div>

    <div class="error-banner" id="error-banner" role="alert"></div>

    <button class="tailor-btn" id="tailor-btn" onclick="runTailoring()">
      <span>🎯</span>
      <span>Tailor My CV to This Job</span>
    </button>

    <!-- LOADING -->
    <div class="loading-state" id="loading-state" aria-live="polite">
      <div class="loading-spinner"></div>
      <p style="font-size:1rem; font-weight:600; color:var(--ink); margin-bottom:6px;">Tailoring your CV...</p>
      <p style="font-size:0.85rem; color:var(--ink-muted);">Analysing the JD, injecting keywords, and rewriting for maximum match</p>
      <div class="loading-steps">
        <div class="loading-step active" id="step-1"><span class="loading-step-icon">🔍</span> Reading job requirements</div>
        <div class="loading-step" id="step-2"><span class="loading-step-icon">🎯</span> Identifying keyword gaps</div>
        <div class="loading-step" id="step-3"><span class="loading-step-icon">✍️</span> Rewriting profile summary</div>
        <div class="loading-step" id="step-4"><span class="loading-step-icon">📋</span> Tailoring experience bullets</div>
        <div class="loading-step" id="step-5"><span class="loading-step-icon">✅</span> Finalising tailored CV</div>
      </div>
    </div>

    <!-- RESULTS -->
    <div class="results-section" id="results-section">

      <div class="results-header">
        <div class="results-header-text">
          <h2>✓ Your CV has been tailored</h2>
          <p>Copy the result below, or download as DOCX. Then run it through the analyser to confirm the score improved.</p>
        </div>
        <div class="results-actions">
          <button class="btn-reset" onclick="resetTailoring()">← Tailor Another</button>
          <button class="btn-copy-result" id="copy-btn" onclick="copyResult()">📋 Copy Tailored CV</button>
          <button class="btn-docx" id="docx-btn" onclick="downloadDocx()">⬇ Download DOCX</button>
          <button class="btn-pdf" onclick="exportPDF()">🖨 Save as PDF</button>
          <a href="analyse.html" id="analyse-link" class="btn-analyse-link">✦ Analyse Tailored CV</a>
        </div>
      </div>

      <!-- CHANGES SUMMARY -->
      <div class="changes-section" id="changes-section">
        <div class="changes-title">What Changed</div>
        <div class="changes-list" id="changes-list"></div>
      </div>

      <!-- SIDE BY SIDE -->
      <div class="side-by-side">
        <div class="cv-panel">
          <div class="cv-panel-header">
            <span class="cv-panel-label before">Original CV</span>
            <span class="cv-panel-badge" style="background:var(--red-soft); color:var(--red); margin-left:auto;">Before</span>
          </div>
          <textarea id="original-cv-display" readonly aria-label="Original CV"></textarea>
        </div>
        <div class="cv-panel">
          <div class="cv-panel-header">
            <span class="cv-panel-label after">Tailored CV</span>
            <span class="cv-panel-badge tailored">✓ Tailored</span>
          </div>
          <textarea id="tailored-cv-display" readonly aria-label="Tailored CV"></textarea>
        </div>
      </div>

    </div>

  </div>

</div>

<script>
  // ── CONFIG ──
  const STRIPE_MONTHLY = 'https://buy.stripe.com/cNi14n72RfH1aBa1HOfjG00';
  const STRIPE_ANNUAL  = 'https://buy.stripe.com/6oU6oHaf366rbFe2LSfjG01';

  // ── STATE ──
  let cvFile = null;
  let jdFile = null;
  let activeCVTab = 'paste';
  let activeJDTab = 'paste';
  let tailoredText = '';
  let loadingInterval = null;

  // ── PRO CHECK ──
  function getUsageData() {
    try { return JSON.parse(localStorage.getItem('cva_usage') || '{}'); }
    catch { return {}; }
  }
  function saveUsageData(d) { localStorage.setItem('cva_usage', JSON.stringify(d)); }
  function isPro() { return getUsageData().pro === true; }
  function getToken() { return getUsageData().token || null; }

  // ── INIT ──
  if (isPro()) {
    document.getElementById('pro-gate').style.display = 'none';
    document.getElementById('tailor-tool').style.display = 'block';
  }

  // ── GATE CODE FORMAT ──
  function formatGateCode(input) {
    let val = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (val.length > 4) val = val.slice(0,4) + '-' + val.slice(4);
    if (val.length > 9) val = val.slice(0,9) + '-' + val.slice(9);
    if (val.length > 14) val = val.slice(0,14);
    input.value = val;
  }

  document.getElementById('gate-code-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyGateCode();
  });

  async function verifyGateCode() {
    const code = document.getElementById('gate-code-input').value.trim();
    const errorEl = document.getElementById('gate-code-error');
    const btn = document.getElementById('gate-unlock-btn');
    if (!code) return;

    btn.textContent = 'Verifying...';
    btn.disabled = true;
    errorEl.classList.remove('show');

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();

      if (response.status === 429) {
        errorEl.textContent = data.error || 'Too many attempts. Please wait and try again.';
        errorEl.classList.add('show');
        btn.textContent = 'Unlock →';
        btn.disabled = false;
        return;
      }

      if (data.valid && data.token) {
        const d = getUsageData();
        d.pro = true;
        d.token = data.token;
        saveUsageData(d);
        document.getElementById('pro-gate').style.display = 'none';
        document.getElementById('tailor-tool').style.display = 'block';
        showBanner('✓ Pro access unlocked');
      } else {
        errorEl.textContent = data.error || 'Invalid code. Please check and try again.';
        errorEl.classList.add('show');
        btn.textContent = 'Unlock →';
        btn.disabled = false;
      }
    } catch (err) {
      errorEl.textContent = 'Network error. Please try again.';
      errorEl.classList.add('show');
      btn.textContent = 'Unlock →';
      btn.disabled = false;
    }
  }

  function showBanner(msg) {
    const b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:72px;left:50%;transform:translateX(-50%);background:var(--green);color:white;padding:12px 24px;border-radius:8px;font-weight:600;font-size:0.9rem;z-index:300;box-shadow:0 4px 16px rgba(0,0,0,0.2)';
    b.textContent = msg;
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 4000);
  }

  // ── TAB SWITCHES ──
  function switchCVTab(tab) {
    activeCVTab = tab;
    document.getElementById('cv-tab-paste').classList.toggle('active', tab === 'paste');
    document.getElementById('cv-tab-upload').classList.toggle('active', tab === 'upload');
    document.getElementById('cv-paste-panel').style.display = tab === 'paste' ? 'block' : 'none';
    document.getElementById('cv-upload-panel').style.display = tab === 'upload' ? 'block' : 'none';
  }

  function switchJDTab(tab) {
    activeJDTab = tab;
    document.getElementById('jd-tab-paste').classList.toggle('active', tab === 'paste');
    document.getElementById('jd-tab-upload').classList.toggle('active', tab === 'upload');
    document.getElementById('jd-paste-panel').style.display = tab === 'paste' ? 'block' : 'none';
    document.getElementById('jd-upload-panel').style.display = tab === 'upload' ? 'block' : 'none';
  }

  // ── FILE HANDLERS ──
  document.getElementById('cv-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    cvFile = file;
    document.getElementById('cv-upload-zone').classList.add('has-file');
    document.getElementById('cv-upload-icon').textContent = '✅';
    document.getElementById('cv-upload-title').textContent = file.name;
    document.getElementById('cv-upload-sub').textContent = `${(file.size/1024).toFixed(1)} KB — ready`;
  });

  document.getElementById('jd-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    jdFile = file;
    document.getElementById('jd-upload-zone').classList.add('has-file');
    document.getElementById('jd-upload-icon').textContent = '✅';
    document.getElementById('jd-upload-title').textContent = file.name;
    document.getElementById('jd-upload-sub').textContent = `${(file.size/1024).toFixed(1)} KB — ready`;
  });

  async function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target.result.replace(/[^\x20-\x7E\n\r\t£€]/g, ' ').trim();
        if (text.length < 50) reject(new Error('Too little text extracted. Please use Paste Text instead.'));
        else resolve(text);
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  // ── LOADING ANIMATION ──
  function animateSteps() {
    const steps = ['step-1','step-2','step-3','step-4','step-5'];
    let i = 0;
    const interval = setInterval(() => {
      if (i > 0) {
        document.getElementById(steps[i-1]).classList.remove('active');
        document.getElementById(steps[i-1]).classList.add('done');
        document.getElementById(steps[i-1]).querySelector('.loading-step-icon').textContent = '✓';
      }
      if (i < steps.length) {
        document.getElementById(steps[i]).classList.add('active');
        i++;
      } else { clearInterval(interval); }
    }, 2200);
    return interval;
  }

  // ── MAIN TAILORING ──
  async function runTailoring() {
    const token = getToken();
    if (!token) { showError('Pro access required. Please enter your access code above.'); return; }

    // Build payload
    const body = { token };

    if (activeCVTab === 'paste') {
      const cvText = document.getElementById('cv-text').value.trim();
      if (!cvText || cvText.length < 100) { showError('Please paste your full CV (minimum 100 characters).'); return; }
      body.cvText = cvText;
    } else {
      if (!cvFile) { showError('Please upload a CV file.'); return; }
      const ext = cvFile.name.split('.').pop().toLowerCase();
      if (ext === 'txt') {
        try { body.cvText = await readFileAsText(cvFile); }
        catch (e) { showError(e.message); return; }
      } else {
        try {
          body.cvFileData = await readFileAsBase64(cvFile);
          body.cvFileType = ext;
        } catch { showError('Could not read CV file. Please use Paste Text instead.'); return; }
      }
    }

    if (activeJDTab === 'paste') {
      const jdText = document.getElementById('jd-text').value.trim();
      if (!jdText || jdText.length < 50) { showError('Please paste the job description (minimum 50 characters).'); return; }
      body.jdText = jdText;
    } else {
      if (!jdFile) { showError('Please upload a job description file.'); return; }
      const ext = jdFile.name.split('.').pop().toLowerCase();
      if (ext === 'txt') {
        try { body.jdText = await readFileAsText(jdFile); }
        catch (e) { showError(e.message); return; }
      } else {
        try {
          body.jdFileData = await readFileAsBase64(jdFile);
          body.jdFileType = ext;
        } catch { showError('Could not read JD file. Please use Paste Text instead.'); return; }
      }
    }

    hideError();
    document.getElementById('input-section').style.display = 'none';
    document.getElementById('tailor-btn').style.display = 'none';
    document.getElementById('loading-state').classList.add('show');
    loadingInterval = animateSteps();

    try {
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Token rejected server-side — clear Pro flag and show gate
          const d = getUsageData();
          d.pro = false; d.token = null;
          saveUsageData(d);
          document.getElementById('pro-gate').style.display = 'block';
          document.getElementById('tailor-tool').style.display = 'none';
          throw new Error('Pro access could not be verified. Please re-enter your code.');
        }
        throw new Error(data.error || 'Tailoring failed');
      }

      tailoredText = data.tailoredCv;

      clearInterval(loadingInterval);
      ['step-1','step-2','step-3','step-4','step-5'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active'); el.classList.add('done');
        el.querySelector('.loading-step-icon').textContent = '✓';
      });

      setTimeout(() => {
        document.getElementById('loading-state').classList.remove('show');
        renderResults(data);
        document.getElementById('results-section').classList.add('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        gtag('event', 'cv_tailored');
      }, 500);

    } catch (err) {
      clearInterval(loadingInterval);
      document.getElementById('loading-state').classList.remove('show');
      document.getElementById('input-section').style.display = 'grid';
      document.getElementById('tailor-btn').style.display = 'flex';
      showError('Tailoring failed: ' + err.message);
    }
  }

  function renderResults(data) {
    document.getElementById('original-cv-display').value = data.originalCv || '';
    document.getElementById('tailored-cv-display').value = data.tailoredCv || '';

    const changesList = document.getElementById('changes-list');
    changesList.innerHTML = '';
    if (data.changes && data.changes.length > 0) {
      data.changes.forEach(c => {
        const item = document.createElement('div');
        item.className = 'change-item';
        const badge = document.createElement('span');
        badge.className = `change-badge ${c.type}`;
        badge.textContent = c.type;
        const desc = document.createElement('span');
        desc.textContent = c.description;
        item.appendChild(badge);
        item.appendChild(desc);
        changesList.appendChild(item);
      });
    } else {
      document.getElementById('changes-section').style.display = 'none';
    }

    // Store tailored CV for analyse handoff
    try {
      localStorage.setItem('cva_tailor_handoff', JSON.stringify({ text: data.tailoredCv, ts: Date.now() }));
    } catch {}
  }

  // ── RESET ──
  function resetTailoring() {
    tailoredText = '';
    cvFile = null;
    jdFile = null;
    document.getElementById('results-section').classList.remove('show');
    document.getElementById('changes-section').style.display = 'block';
    document.getElementById('input-section').style.display = 'grid';
    document.getElementById('tailor-btn').style.display = 'flex';
    document.getElementById('cv-text').value = '';
    document.getElementById('jd-text').value = '';
    ['step-1','step-2','step-3','step-4','step-5'].forEach((id, i) => {
      const el = document.getElementById(id);
      el.classList.remove('active','done');
      const icons = ['🔍','🎯','✍️','📋','✅'];
      el.querySelector('.loading-step-icon').textContent = icons[i];
    });
    document.getElementById('step-1').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── COPY ──
  function copyResult() {
    if (!tailoredText) return;
    navigator.clipboard.writeText(tailoredText).then(() => {
      const btn = document.getElementById('copy-btn');
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = '📋 Copy Tailored CV'; btn.classList.remove('copied'); }, 2500);
    }).catch(() => {
      const ta = document.getElementById('tailored-cv-display');
      ta.select();
      document.execCommand('copy');
    });
  }

  // ── DOCX DOWNLOAD ──
  async function downloadDocx() {
    if (!tailoredText) return;
    const btn = document.getElementById('docx-btn');
    btn.textContent = 'Generating...';
    btn.disabled = true;

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: tailoredText, token: getToken(), name: 'tailored-cv' })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tailored-cv-cvapplied.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showError('DOCX download failed: ' + err.message);
    } finally {
      btn.textContent = '⬇ Download DOCX';
      btn.disabled = false;
    }
  }

  // ── PDF EXPORT ──
  function exportPDF() {
    if (!tailoredText) return;
    const lines = tailoredText.split('\n');
    let html = '';
    for (const line of lines) {
      const t = line.trim();
      if (!t) { html += '<br>'; continue; }
      if (t.startsWith('─')) { html += '<hr>'; continue; }
      const safe = t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      if (t === t.toUpperCase() && t.length > 3 && !t.includes('@') && !t.includes('|')) {
        html += !html ? '<h1>'+safe+'</h1>' : '<h2>'+safe+'</h2>';
      } else if (t.startsWith('•') || t.startsWith('-')) {
        html += '<li>' + safe.slice(safe.startsWith('•') ? 1 : 1).trim() + '</li>';
      } else {
        html += '<p>'+safe+'</p>';
      }
    }
    const w = window.open('', '_blank');
    if (!w) { alert('Please allow popups for cvapplied.com to export as PDF.'); return; }
    w.document.write('<!DOCTYPE html><html><head><title>Tailored CV</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Times New Roman,serif;font-size:11pt;color:#1a1a1a;padding:28px 36px;max-width:800px;margin:0 auto;}h1{font-size:18pt;font-weight:700;margin-bottom:4px;}h2{font-size:10pt;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:0.1em;margin:14px 0 6px;}p{font-size:10.5pt;line-height:1.5;margin-bottom:3px;}li{font-size:10.5pt;line-height:1.5;margin-left:16px;margin-bottom:2px;}hr{border:none;border-top:1px solid #c0c4d0;margin:8px 0 4px;}@media print{body{padding:0;}}</style></head><body>'+html+'<scri'+'pt>window.onload=()=>{window.print();}<\/scri'+'pt></body></html>');
    w.document.close();
  }

  // ── ERROR ──
  function showError(msg) {
    const el = document.getElementById('error-banner');
    el.textContent = '⚠ ' + msg;
    el.classList.add('show');
  }
  function hideError() {
    document.getElementById('error-banner').classList.remove('show');
  }
</script>
</body>
</html>
