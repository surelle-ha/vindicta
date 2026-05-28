const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./i8hHMFjf.js","./DhEqZVGG.js"])))=>i.map(i=>d[i]);
import{c as M,h as N,$ as O,o as a,b as c,g as e,e as u,y as s,Q as _,M as m,K as l,S as z,T as I,U as R,N as j,W as h,O as V,P as q,X as D,v as b,A as C,_ as J}from"./Bj8b6L22.js";import{u as H}from"./J7SGKKnw.js";import{u as $}from"./IH3JTTWd.js";import{P as L}from"./CZrsJrmy.js";import{T as E}from"./CT5UHkhQ.js";import{L as F}from"./HXv1cMEd.js";import{P as B}from"./CPslRd07.js";import{W as G}from"./ByTlak6u.js";import{I as W}from"./xaVFGIW9.js";import{T as U}from"./C3OTAO1T.js";import{C as K}from"./Dqzt9rQ6.js";import"./CqN_TyiF.js";import"./ChH9gCf4.js";import"./D_2HTvvy.js";const Q=M("square",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]]),X={class:"mx-auto max-w-5xl space-y-5 pb-8"},Y={class:"flex items-center gap-3"},Z={class:"grid size-10 place-items-center rounded-xl border border-violet-500/25 bg-violet-500/10"},ee={class:"grid gap-5 xl:grid-cols-[1fr_20rem]"},te={class:"space-y-5"},se={class:"rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"},re={class:"flex items-center justify-between gap-3"},oe={class:"flex items-center gap-2"},ne={class:"flex items-center gap-2"},ie={class:"mt-4 flex flex-wrap items-end gap-3"},ae={class:"block"},de=["disabled"],ce=["disabled"],le={key:0,class:"mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2"},pe={class:"text-xs text-emerald-300"},ue={class:"font-mono"},me={key:1,class:"mt-3"},fe={class:"max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/20 p-3 text-[11px] leading-relaxed text-[var(--text-muted)] custom-scroll"},ge={class:"rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"},ve={class:"flex items-center gap-2"},xe={class:"mt-3 space-y-2"},be={class:"flex flex-wrap items-baseline gap-2"},he={class:"font-mono text-xs font-semibold text-violet-300"},ye={key:0,class:"font-mono text-[10px] text-[var(--text-faint)]"},_e={class:"mt-0.5 text-xs text-[var(--text-muted)]"},je={class:"space-y-5"},Ce={class:"rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"},Se={class:"flex items-center gap-2"},Pe={class:"rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"},ke={class:"flex items-center gap-2"},we={key:0,class:"mt-2 rounded-lg border border-[var(--border)] bg-black/10 p-3"},Te={class:"text-xs font-medium text-[var(--text)]"},Ae={class:"mt-0.5 break-words text-[10px] text-[var(--text-muted)]"},Me={key:1,class:"mt-2 text-xs text-[var(--text-muted)]"},Ne={class:"rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4"},Oe={class:"flex items-center justify-between gap-2"},ze={class:"flex items-center gap-2"},Ie={class:"mt-3 overflow-auto rounded-lg border border-[var(--border)] bg-black/20 p-3 text-[10px] leading-relaxed text-[var(--text-muted)] custom-scroll"},Qe=N({__name:"mcp",setup(Re){const S=O();H();const{notify:f}=$(),n=b(!1),g=b(!1),p=b(7474),o=b([]);let v=null;const x=C(()=>S.activeProject),P=[{name:"list_projects",description:"Returns all projects registered in Vindicta.",params:"none"},{name:"get_project",description:"Returns metadata for a specific project by ID.",params:"{ project_id: string }"},{name:"get_findings",description:"Returns all security remediation findings for the active or specified project.",params:"{ project_id?: string, status?: string, severity?: string }"},{name:"get_scans",description:"Returns the scan history and raw AI reports for the active or specified project.",params:"{ project_id?: string, limit?: number }"},{name:"get_security_summary",description:"Returns a concise security posture summary: open findings count, high-risk count, last scan time.",params:"{ project_id?: string }"},{name:"run_diagnostics",description:"Runs dependency and secret pattern scans on the specified project and returns the findings.",params:"{ project_id: string }"}],y=C(()=>{const i={mcpServers:{vindicta:{command:"node",args:["<path-to-vindicta-mcp-server.js>"],env:{VINDICTA_PORT:String(p.value)}}}};return JSON.stringify(i,null,2)});async function k(){if(!(n.value||g.value)){g.value=!0,o.value=[];try{const{Command:i}=await J(async()=>{const{Command:d}=await import("./i8hHMFjf.js");return{Command:d}},__vite__mapDeps([0,1]),import.meta.url),t=x.value?.absolutePath??"",r=i.create("node-mcp-server",["-e",A(t)]);r.stdout.on("data",d=>{o.value.push(`[out] ${d.trim()}`),o.value.length>100&&o.value.shift()}),r.stderr.on("data",d=>{o.value.push(`[err] ${d.trim()}`),o.value.length>100&&o.value.shift()}),r.on("close",()=>{n.value=!1,o.value.push("[server stopped]")}),r.on("error",d=>{n.value=!1,o.value.push(`[error] ${d}`)}),v=await r.spawn(),n.value=!0,o.value.push(`[server started on port ${p.value}]`),f(`MCP server started on port ${p.value}.`,"success")}catch(i){const t=i?.message??String(i);o.value.push(`[failed to start] ${t}`);const r=t.toLowerCase(),d=r.includes("not allowed")||r.includes("forbidden")||r.includes("permission")?"Shell permission denied. Check Tauri capabilities config.":r.includes("enoent")||r.includes("not found")?'Node.js not found. Make sure "node" is installed and in your PATH.':"Failed to start MCP server. Make sure Node.js is installed.";f(d,"error")}finally{g.value=!1}}}async function w(){try{v&&(await v.kill(),v=null),n.value=!1,o.value.push("[server stopped by user]"),f("MCP server stopped.","success")}catch(i){f(i?.message??"Could not stop the MCP server.","error")}}function T(){navigator.clipboard.writeText(y.value).then(()=>{f("Claude Desktop config copied to clipboard.","success")})}function A(i){return`
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = ${p.value};
const projectPath = ${JSON.stringify(i)};

function readVindictaJson(p) {
  try {
    const file = path.join(p, 'vindicta.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return null; }
}

function loadProjects() {
  try {
    const store = path.join(process.env.APPDATA || process.env.HOME, '.vindicta', 'vindicta-app.bin');
    if (fs.existsSync(store)) {
      const data = JSON.parse(fs.readFileSync(store, 'utf8'));
      return data.projects || [];
    }
  } catch {}
  return [];
}

const tools = [
  { name: 'list_projects', description: 'List all registered projects.' },
  { name: 'get_findings', description: 'Get security findings for the active project.', inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, status: { type: 'string' }, severity: { type: 'string' } } } },
  { name: 'get_scans', description: 'Get scan history for the active project.', inputSchema: { type: 'object', properties: { project_id: { type: 'string' }, limit: { type: 'number' } } } },
  { name: 'get_security_summary', description: 'Get security posture summary.', inputSchema: { type: 'object', properties: { project_id: { type: 'string' } } } },
  { name: 'run_diagnostics', description: 'Return existing dependency and secret findings.', inputSchema: { type: 'object', properties: { project_id: { type: 'string' } } } },
];

function handleTool(name, args) {
  const vj = readVindictaJson(projectPath);
  if (!vj) return { error: 'Could not read vindicta.json from ' + projectPath };
  const sec = vj.security || {};
  if (name === 'list_projects') return [{ id: vj.meta?.id, name: vj.meta?.name, path: projectPath }];
  if (name === 'get_findings') {
    let findings = sec.findings || [];
    if (args?.status) findings = findings.filter(f => f.status === args.status);
    if (args?.severity) findings = findings.filter(f => f.severity === args.severity);
    return findings;
  }
  if (name === 'get_scans') {
    const scans = (sec.scans || []).slice(0, args?.limit || 10);
    return scans.map(s => ({ id: s.id, scannedAt: s.scannedAt, effort: s.effort, status: s.status, summary: s.summary, findingCount: (s.findings||[]).length }));
  }
  if (name === 'get_security_summary') {
    const findings = sec.findings || [];
    const scans = sec.scans || [];
    return { openFindings: findings.filter(f => f.status === 'open').length, highRisk: findings.filter(f => f.severity === 'critical' || f.severity === 'high').length, lastScan: scans[0]?.scannedAt || null, totalFindings: findings.length };
  }
  if (name === 'run_diagnostics') {
    const findings = (sec.findings || []).filter(f => f.source === 'dependency' || f.source === 'secret');
    return findings;
  }
  return { error: 'Unknown tool: ' + name };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const rpc = JSON.parse(body);
      let result;
      if (rpc.method === 'initialize') result = { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'vindicta-mcp', version: '1.0.0' } };
      else if (rpc.method === 'tools/list') result = { tools };
      else if (rpc.method === 'tools/call') result = { content: [{ type: 'text', text: JSON.stringify(handleTool(rpc.params?.name, rpc.params?.arguments), null, 2) }] };
      else result = { error: { code: -32601, message: 'Method not found' } };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result }));
    } catch (e) {
      res.writeHead(400); res.end(JSON.stringify({ error: e.message }));
    }
  });
});
server.listen(port, '127.0.0.1', () => console.log('Vindicta MCP server listening on http://127.0.0.1:' + port));
process.on('SIGTERM', () => { server.close(); process.exit(0); });
`}return(i,t)=>(a(),c("div",X,[e("div",Y,[e("div",Z,[u(s(L),{class:"size-5 text-violet-300"})]),t[1]||(t[1]=e("div",null,[e("h1",{class:"font-display text-lg font-bold text-[var(--text)]"},"MCP Server"),e("p",{class:"text-xs text-[var(--text-muted)]"},"Expose Vindicta to AI agents via the Model Context Protocol.")],-1))]),e("div",ee,[e("main",te,[e("section",se,[e("div",re,[e("div",oe,[u(s(E),{class:"size-4 text-violet-300"}),t[2]||(t[2]=e("h2",{class:"text-sm font-semibold text-[var(--text)]"},"Server Control",-1))]),e("div",ne,[e("span",{class:_(["flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",s(n)?"border-emerald-500/30 bg-emerald-500/10 text-emerald-300":"border-white/10 bg-white/[0.04] text-[var(--text-faint)]"])},[e("span",{class:_(["size-1.5 rounded-full",s(n)?"bg-emerald-400":"bg-[var(--text-faint)]"])},null,2),m(" "+l(s(n)?"Running":"Stopped"),1)],2)])]),e("div",ie,[e("label",ae,[t[3]||(t[3]=e("span",{class:"text-xs font-medium text-[var(--text-muted)]"},"Port",-1)),z(e("input",{"onUpdate:modelValue":t[0]||(t[0]=r=>R(p)?p.value=r:null),type:"number",min:"1024",max:"65535",disabled:s(n),class:"mt-1 h-9 w-28 rounded-lg border border-[var(--border)] bg-black/20 px-3 text-xs text-[var(--text)] outline-none disabled:opacity-50"},null,8,de),[[I,s(p),void 0,{number:!0}]])]),s(n)?(a(),c("button",{key:1,class:"inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-200 hover:bg-red-500/15",onClick:w},[u(s(Q),{class:"size-3.5"}),t[5]||(t[5]=m(" Stop Server ",-1))])):(a(),c("button",{key:0,class:"inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50",disabled:s(g),onClick:k},[s(g)?(a(),j(s(F),{key:0,class:"size-3.5 animate-spin"})):(a(),j(s(B),{key:1,class:"size-3.5"})),t[4]||(t[4]=m(" Start Server ",-1))],8,ce))]),s(n)?(a(),c("div",le,[e("p",pe,[t[6]||(t[6]=m("MCP endpoint: ",-1)),e("span",ue,"http://127.0.0.1:"+l(s(p)),1)])])):h("",!0),s(o).length?(a(),c("div",me,[t[7]||(t[7]=e("p",{class:"mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-faint)]"},"Server log",-1)),e("pre",fe,l(s(o).join(`
`)),1)])):h("",!0)]),e("section",ge,[e("div",ve,[u(s(G),{class:"size-4 text-indigo-300"}),t[8]||(t[8]=e("h2",{class:"text-sm font-semibold text-[var(--text)]"},"Available MCP Tools",-1))]),t[9]||(t[9]=e("p",{class:"mt-1 text-xs text-[var(--text-muted)]"},"These tools are exposed to any MCP-compatible agent connected to this server.",-1)),e("div",xe,[(a(),c(V,null,q(P,r=>e("div",{key:r.name,class:"rounded-lg border border-[var(--border)] bg-black/10 px-3 py-2.5"},[e("div",be,[e("span",he,l(r.name),1),r.params!=="none"?(a(),c("span",ye,l(r.params),1)):h("",!0)]),e("p",_e,l(r.description),1)])),64))])])]),e("aside",je,[e("section",Ce,[e("div",Se,[u(s(W),{class:"size-3.5 text-sky-300"}),t[10]||(t[10]=e("h2",{class:"text-sm font-semibold text-[var(--text)]"},"What is MCP?",-1))]),t[11]||(t[11]=e("p",{class:"mt-2 text-xs leading-relaxed text-[var(--text-muted)]"}," The Model Context Protocol (MCP) lets AI agents like Claude connect to external tools and data sources. Starting this server exposes Vindicta's security findings, scan history, and diagnostics to any MCP-compatible agent. ",-1))]),e("section",Pe,[e("div",ke,[u(s(D),{class:"size-3.5 text-emerald-300"}),t[12]||(t[12]=e("h2",{class:"text-sm font-semibold text-[var(--text)]"},"Active Project Scope",-1))]),s(x)?(a(),c("div",we,[e("p",Te,l(s(x).name),1),e("p",Ae,l(s(x).absolutePath),1)])):(a(),c("p",Me,"No active project selected. Select a project in the sidebar first."))]),e("section",Ne,[e("div",Oe,[e("div",ze,[u(s(U),{class:"size-3.5 text-amber-300"}),t[13]||(t[13]=e("h2",{class:"text-sm font-semibold text-[var(--text)]"},"Claude Desktop Config",-1))]),e("button",{class:"inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-[var(--text-muted)] hover:bg-white/[0.07] hover:text-[var(--text)]",onClick:T},[u(s(K),{class:"size-3"}),t[14]||(t[14]=m(" Copy ",-1))])]),t[15]||(t[15]=e("p",{class:"mt-1.5 text-xs text-[var(--text-muted)]"},[m("Add this to your "),e("span",{class:"font-mono text-[var(--text)]"},"claude_desktop_config.json"),m(" to connect Claude Desktop to this server.")],-1)),e("pre",Ie,l(s(y)),1)])])])]))}});export{Qe as default};
