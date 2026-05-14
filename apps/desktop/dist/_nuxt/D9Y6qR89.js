const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./DusZrriH.js","./CXprYpPW.js","./entry.BxnlF0nW.css","./CgWNC7vB.js","./uYr82bVc.js","./ycFhKfin.js"])))=>i.map(i=>d[i]);
import{e as _,g as V,h as S,Q as U}from"./CXprYpPW.js";import{n as g,g as I,u as z}from"./DusZrriH.js";const Z=_("file-text",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);const Q=_("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]),Y=V("kanban",{state:()=>({tickets:[],draggingId:null,projectPath:null}),getters:{byStatus:e=>{const n={backlog:[],todo:[],in_progress:[],in_review:[],done:[],cancelled:[]};for(const t of e.tickets)n[t.status].push(t);return n},total:e=>e.tickets.length,doneCount:e=>e.tickets.filter(n=>n.status==="done").length},actions:{load(e,n){this.tickets=e,this.projectPath=n},async createTicket(e,n){const t=this.tickets.reduce((s,a)=>Math.max(s,a.number??0),0)+1,o={id:I(),number:t,type:e.type??"feature",status:e.status??"backlog",priority:e.priority??"medium",title:e.title??"Untitled",description:e.description??"",gitControl:e.gitControl??{enabled:!1,branch:"",autoCommit:!1,autoPush:!1},labels:e.labels??[],roleIds:e.roleIds??[],sprintId:e.sprintId??null,comments:[],likes:0,createdAt:g(),updatedAt:g(),resolvedAt:null,createdBy:n};return this.tickets.push(o),await this.persist(),o},async moveTicket(e,n){const t=this.tickets.find(o=>o.id===e);t&&(t.status=n,t.updatedAt=g(),(n==="done"||n==="cancelled")&&(t.resolvedAt=g()),await this.persist())},async updateTicket(e,n){const t=this.tickets.find(o=>o.id===e);t&&(Object.assign(t,n,{updatedAt:g()}),await this.persist())},async deleteTicket(e){this.tickets=this.tickets.filter(n=>n.id!==e),await this.persist()},async addComment(e,n,t,o=!1,s=null){const a=this.tickets.find(c=>c.id===e);if(!a)return;const l={id:I(),text:n,author:t,isAI:o,parentId:s,likes:0,createdAt:g()};a.comments||(a.comments=[]),a.comments.push(l),a.updatedAt=g(),await this.persist()},async persist(){if(!this.projectPath)return;const{useVindictaJson:e}=await S(async()=>{const{useVindictaJson:t}=await import("./DusZrriH.js").then(o=>o.h);return{useVindictaJson:t}},__vite__mapDeps([0,1,2]),import.meta.url),{patchTickets:n}=e();await n(this.projectPath,this.tickets)}}});function L(e){return e.includes("\\")||/^[A-Za-z]:/.test(e)}async function B(){const{homeDir:e}=await S(async()=>{const{homeDir:t}=await import("./CgWNC7vB.js");return{homeDir:t}},__vite__mapDeps([3,4]),import.meta.url);return`${(await e()).replace(/[\\/]$/,"")}\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js`}function f(e){const n=e.trim();return n?Math.max(1,Math.ceil(n.length/4)):0}function j(e){const n=e instanceof Error?e.message:String(e??"");return/usage limit|usage_limit|usage.*exhausted|usage.*remaining|quota|billing|insufficient_quota|rate limit|limit.*reached|429|0 usage|out of credits|insufficient balance|credit/i.test(n)?"Codex could not start because your AI usage limit appears to be exhausted. Check your plan, billing, or usage limits, then try again.":/unauthorized|forbidden|authentication|api key|401|403|not logged in/i.test(n)?"Codex is not authenticated. Sign in to Codex or update your API key in Settings, then try again.":/codex.*not.*found|not recognized|ENOENT/i.test(n)?"Codex CLI is not available. Open Settings > Doctor and install or repair Codex.":/@openai\/codex-win32-x64|Missing optional dependency/i.test(n)?"Codex CLI is installed but its Windows runtime dependency is missing. Open Settings > Doctor and use Install/Repair Codex, or run npm install -g @openai/codex@latest.":/sep is not defined/i.test(n)?"Vindicta could not prepare the Codex run because of a local path handling error. Please update Vindicta and try again.":n||"Codex could not run. Check Settings > Doctor, then try again."}async function ee(e){const{Command:n}=await S(async()=>{const{Command:u}=await import("./ycFhKfin.js");return{Command:u}},__vite__mapDeps([5,4]),import.meta.url),t=z(),o=L(e.projectPath),s=o?e.projectPath.replace(/\//g,"\\"):e.projectPath,a=o?"\\":"/",l=Date.now(),c=`${s}${a}.vindicta_codex_output_${l}.txt`,d=e.sandbox??"read-only";try{const y=["exec",...["-c",`model_reasoning_effort="${e.reasoningEffort??"medium"}"`],"-C",s,"--skip-git-repo-check","--sandbox",d,"--color","never","-o",c,e.prompt],C=o?"node-codex-exec":"codex-exec",M=o?[await B(),...y]:y,w=await n.create(C,M,{cwd:s}).execute(),v=[w.stderr,w.stdout].filter(Boolean).join(`
`);if(w.code!==0&&v){const O=j(v);return{code:w.code,stdout:w.stdout,stderr:O,tokenUsage:{inputTokens:f(e.prompt),outputTokens:f(v),totalTokens:f(e.prompt)+f(v)}}}const D=await t.readTextFile(c).catch(()=>""),$=D||w.stdout||w.stderr,A={inputTokens:f(e.prompt),outputTokens:f($),totalTokens:f(e.prompt)+f($)};try{await U().recordTokenUsage({...A,tool:"Codex",model:e.model||(e.reasoningEffort?`Codex CLI default (${e.reasoningEffort} effort)`:"Codex CLI default"),prompt:e.prompt})}catch{}return{code:w.code,stdout:D||w.stdout,stderr:w.stderr,tokenUsage:A}}catch(u){throw new Error(j(u))}finally{t.removeFile(c).catch(()=>{})}}const x=new TextEncoder;function b(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function r(e,n){const t=n?`<w:pPr><w:pStyle w:val="${n}"/></w:pPr>`:"",s=String(e||"").split(/\r?\n/).map((a,l)=>`<w:r>${l?"<w:br/>":""}<w:t xml:space="preserve">${b(a)}</w:t></w:r>`).join("");return`<w:p>${t}${s}</w:p>`}function k(e){return`<w:p><w:pPr><w:pStyle w:val="Bullet"/></w:pPr><w:r><w:t xml:space="preserve">${b(e)}</w:t></w:r></w:p>`}function p(e,n){return r(`${e}: ${n}`,"Metric")}function h(e,n){return e.filter(t=>t.severity.toLowerCase()===n).length}function W(e){const n=h(e.findings,"critical")+h(e.findings,"high"),t=e.summary||"No executive summary was provided for this scan.";return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" mc:Ignorable="w14 wp14">
  <w:body>
    ${[r("Vindicta Security Analyzer","Title"),r("AI Security Review Report","Subtitle"),r(`Project: ${e.projectName||"Unknown project"}`,"Heading1"),r(`Project code: ${e.projectCode||"N/A"}`),r(`Project path: ${e.projectPath||"N/A"}`),r(`Scan date: ${new Date(e.scannedAt).toLocaleString()}`),r(`Generated: ${new Date(e.generatedAt).toLocaleString()}`),r("Executive Summary","Heading1"),r(t),r("Risk Overview","Heading1"),p("Total findings",e.findings.length),p("Critical findings",h(e.findings,"critical")),p("High findings",h(e.findings,"high")),p("High-risk findings",n),p("Medium findings",h(e.findings,"medium")),p("Low findings",h(e.findings,"low")),r("Methodology","Heading1"),k("Codex reviewed the selected project in read-only mode."),k("The review focused on OWASP-style risks, abusable functions, configuration, Tauri permissions, API boundaries, and frontend trust boundaries."),k("Generated findings should be validated by an engineer before remediation is considered complete."),r("Findings","Heading1"),...e.findings.length?e.findings.flatMap((s,a)=>[r(`${a+1}. ${s.title}`,"Heading2"),p("Finding ID",s.id),p("Severity",s.severity.toUpperCase()),p("Status",s.status),p("Area",s.area||"Project"),p("Risk family",s.owaspCategory||"Security review"),r("Detail","Heading3"),r(s.detail||"No detail provided."),r("Evidence","Heading3"),r(s.evidence||"No evidence provided."),r("Recommended Remediation","Heading3"),r(s.recommendation||"No recommendation provided.")]):[r("No structured findings were returned for this scan.")],r("Raw AI Report","Heading1"),r(e.rawReport||"No raw report was captured.","CodeBlock")].join("")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`}function H(){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/><w:color w:val="1F2937"/></w:rPr>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:sz w:val="44"/><w:color w:val="047857"/></w:rPr>
    <w:pPr><w:spacing w:after="120"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/>
    <w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="26"/><w:color w:val="4B5563"/></w:rPr>
    <w:pPr><w:spacing w:after="360"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="111827"/></w:rPr>
    <w:pPr><w:spacing w:before="320" w:after="160"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:rPr><w:b/><w:sz w:val="25"/><w:color w:val="374151"/></w:rPr>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="Heading 3"/>
    <w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="047857"/></w:rPr>
    <w:pPr><w:spacing w:before="160" w:after="80"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Metric">
    <w:name w:val="Metric"/>
    <w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:b/><w:sz w:val="21"/><w:color w:val="374151"/></w:rPr>
    <w:pPr><w:spacing w:after="80"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Bullet">
    <w:name w:val="Bullet"/>
    <w:rPr><w:sz w:val="21"/><w:color w:val="374151"/></w:rPr>
    <w:pPr><w:ind w:left="360" w:hanging="180"/><w:spacing w:after="80"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="CodeBlock">
    <w:name w:val="Code Block"/>
    <w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/><w:color w:val="374151"/></w:rPr>
    <w:pPr><w:shd w:fill="F3F4F6"/><w:spacing w:before="120" w:after="120"/></w:pPr>
  </w:style>
</w:styles>`}function X(e){let n=4294967295;for(const t of e){n^=t;for(let o=0;o<8;o+=1)n=n>>>1^3988292384&-(n&1)}return(n^4294967295)>>>0}function R(e=new Date){return(e.getHours()&31)<<11|(e.getMinutes()&63)<<5|Math.floor(e.getSeconds()/2)&31}function F(e=new Date){return(e.getFullYear()-1980&127)<<9|(e.getMonth()+1&15)<<5|e.getDate()&31}function i(e,n){e.push(n&255,n>>>8&255)}function m(e,n){e.push(n&255,n>>>8&255,n>>>16&255,n>>>24&255)}function P(e,n){for(const t of n)e.push(t)}function E(e){const n=new Date,t=[],o=[],s=[];for(const l of e){const c=x.encode(l.name),d=x.encode(l.content),u=X(d),T=t.length;m(t,67324752),i(t,20),i(t,0),i(t,0),i(t,R(n)),i(t,F(n)),m(t,u),m(t,d.length),m(t,d.length),i(t,c.length),i(t,0),P(t,c),P(t,d),s.push({name:c,data:d,crc:u,offset:T})}const a=t.length;for(const l of s)m(o,33639248),i(o,20),i(o,20),i(o,0),i(o,0),i(o,R(n)),i(o,F(n)),m(o,l.crc),m(o,l.data.length),m(o,l.data.length),i(o,l.name.length),i(o,0),i(o,0),i(o,0),i(o,0),m(o,0),m(o,l.offset),P(o,l.name);return P(t,new Uint8Array(o)),m(t,101010256),i(t,0),i(t,0),i(t,s.length),i(t,s.length),m(t,o.length),m(t,a),i(t,0),new Uint8Array(t)}function te(e){const n=new Date(e.generatedAt).toISOString(),t=[{name:"[Content_Types].xml",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`},{name:"_rels/.rels",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`},{name:"word/_rels/document.xml.rels",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`},{name:"word/document.xml",content:W(e)},{name:"word/styles.xml",content:H()},{name:"docProps/core.xml",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${b(`Vindicta Security Review - ${e.projectName}`)}</dc:title>
  <dc:subject>Security Analyzer Report</dc:subject>
  <dc:creator>Vindicta</dc:creator>
  <cp:keywords>security,OWASP,Vindicta,AI scan</cp:keywords>
  <dcterms:created xsi:type="dcterms:W3CDTF">${n}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${n}</dcterms:modified>
</cp:coreProperties>`},{name:"docProps/app.xml",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Vindicta</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <Company>Vindicta</Company>
</Properties>`}];return E(t)}function G(e){return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" mc:Ignorable="w14 wp14">
  <w:body>
    ${[r("Vindicta Sprint Report","Title"),r(e.sprintName,"Subtitle"),r(`Project: ${e.projectName||"Unknown project"}`,"Heading1"),r(`Project code: ${e.projectCode||"N/A"}`),r(`Generated: ${new Date(e.generatedAt).toLocaleString()}`),r("Sprint Goal","Heading1"),r(e.sprintGoal||"No sprint goal was recorded."),r("Outcome","Heading1"),p("Completed tickets",e.completedTickets.length),p("Returned to backlog",e.incompleteTickets.length),r("Completed Tickets","Heading1"),...e.completedTickets.length?e.completedTickets.flatMap(t=>[r(`#${t.number} ${t.title}`,"Heading2"),p("Type",t.type),p("Priority",t.priority),p("Status",t.status),r(t.description||"No description provided.")]):[r("No tickets were marked done before the sprint was ended.")],r("Incomplete Tickets Returned To Backlog","Heading1"),...e.incompleteTickets.length?e.incompleteTickets.map(t=>k(`#${t.number} ${t.title} (${t.status})`)):[r("No incomplete tickets were returned to the backlog.")],r("Markdown Source","Heading1"),r(e.markdown||"No markdown report was generated.","CodeBlock")].join("")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`}function ne(e){const n=new Date(e.generatedAt).toISOString();return E([{name:"[Content_Types].xml",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`},{name:"_rels/.rels",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`},{name:"word/_rels/document.xml.rels",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`},{name:"word/document.xml",content:G(e)},{name:"word/styles.xml",content:H()},{name:"docProps/core.xml",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${b(`Vindicta Sprint Report - ${e.sprintName}`)}</dc:title>
  <dc:subject>Sprint Report</dc:subject>
  <dc:creator>Vindicta</dc:creator>
  <cp:keywords>sprint,Vindicta,report</cp:keywords>
  <dcterms:created xsi:type="dcterms:W3CDTF">${n}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${n}</dcterms:modified>
</cp:coreProperties>`},{name:"docProps/app.xml",content:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Vindicta</Application>
  <Company>Vindicta</Company>
</Properties>`}])}function N(e){return e.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")}function q(e,n=86){const t=[];for(const o of e.split(/\r?\n/)){let s=o.replace(/^#+\s*/,"").replace(/\*\*/g,"");for(;s.length>n;){let a=s.lastIndexOf(" ",n);a<20&&(a=n),t.push(s.slice(0,a)),s=s.slice(a).trim()}t.push(s)}return t}function oe(e){const n=q(e.markdown||`${e.sprintName}
No report content generated.`).slice(0,180),t=[];for(let c=0;c<n.length;c+=42)t.push(n.slice(c,c+42));t.length||t.push(["No report content generated."]);const o=[];o.push("<< /Type /Catalog /Pages 2 0 R >>"),o.push(`<< /Type /Pages /Kids [${t.map((c,d)=>`${3+d*2} 0 R`).join(" ")}] /Count ${t.length} >>`),t.forEach((c,d)=>{const T=3+d*2+1;o.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${T} 0 R >>`);const y=["BT","/F2 16 Tf","72 740 Td",`(${N(d===0?`Vindicta Sprint Report - ${e.sprintName}`:`${e.sprintName} continued`)}) Tj`,"/F1 10 Tf","0 -24 Td",...c.map(C=>`(${N(C)}) Tj 0 -15 Td`),"ET"].join(`
`);o.push(`<< /Length ${x.encode(y).length} >>
stream
${y}
endstream`)});const s=[`%PDF-1.4
`],a=[0];o.forEach((c,d)=>{a.push(x.encode(s.join("")).length),s.push(`${d+1} 0 obj
${c}
endobj
`)});const l=x.encode(s.join("")).length;s.push(`xref
0 ${o.length+1}
0000000000 65535 f 
`);for(const c of a.slice(1))s.push(`${String(c).padStart(10,"0")} 00000 n 
`);return s.push(`trailer
<< /Size ${o.length+1} /Root 1 0 R >>
startxref
${l}
%%EOF`),x.encode(s.join(""))}export{Z as F,Q as T,oe as a,te as b,ne as c,j as f,ee as r,Y as u};
