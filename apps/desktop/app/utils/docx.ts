export interface VindictaDocxFinding {
  id: string
  title: string
  area: string
  severity: string
  status: string
  owaspCategory: string
  detail: string
  evidence: string
  recommendation: string
}

export interface VindictaSecurityDocxReport {
  projectName: string
  projectCode: string
  projectPath: string
  generatedAt: string
  scannedAt: string
  summary: string
  rawReport: string
  findings: VindictaDocxFinding[]
}

const encoder = new TextEncoder()

function xml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function para(text: string, style?: string) {
  const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''
  const lines = String(text || '').split(/\r?\n/)
  const runs = lines.map((line, index) => {
    const br = index ? '<w:br/>' : ''
    return `<w:r>${br}<w:t xml:space="preserve">${xml(line)}</w:t></w:r>`
  }).join('')
  return `<w:p>${styleXml}${runs}</w:p>`
}

function bullet(text: string) {
  return `<w:p><w:pPr><w:pStyle w:val="Bullet"/></w:pPr><w:r><w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`
}

function stat(label: string, value: string | number) {
  return para(`${label}: ${value}`, 'Metric')
}

function severityCount(findings: VindictaDocxFinding[], severity: string) {
  return findings.filter(finding => finding.severity.toLowerCase() === severity).length
}

function buildDocumentXml(report: VindictaSecurityDocxReport) {
  const highRisk = severityCount(report.findings, 'critical') + severityCount(report.findings, 'high')
  const summary = report.summary || 'No executive summary was provided for this scan.'
  const body = [
    para('Vindicta Security Analyzer', 'Title'),
    para('AI Security Review Report', 'Subtitle'),
    para(`Project: ${report.projectName || 'Unknown project'}`, 'Heading1'),
    para(`Project code: ${report.projectCode || 'N/A'}`),
    para(`Project path: ${report.projectPath || 'N/A'}`),
    para(`Scan date: ${new Date(report.scannedAt).toLocaleString()}`),
    para(`Generated: ${new Date(report.generatedAt).toLocaleString()}`),
    para('Executive Summary', 'Heading1'),
    para(summary),
    para('Risk Overview', 'Heading1'),
    stat('Total findings', report.findings.length),
    stat('Critical findings', severityCount(report.findings, 'critical')),
    stat('High findings', severityCount(report.findings, 'high')),
    stat('High-risk findings', highRisk),
    stat('Medium findings', severityCount(report.findings, 'medium')),
    stat('Low findings', severityCount(report.findings, 'low')),
    para('Methodology', 'Heading1'),
    bullet('Codex reviewed the selected project in read-only mode.'),
    bullet('The review focused on OWASP-style risks, abusable functions, configuration, Tauri permissions, API boundaries, and frontend trust boundaries.'),
    bullet('Generated findings should be validated by an engineer before remediation is considered complete.'),
    para('Findings', 'Heading1'),
    ...(report.findings.length
      ? report.findings.flatMap((finding, index) => [
          para(`${index + 1}. ${finding.title}`, 'Heading2'),
          stat('Finding ID', finding.id),
          stat('Severity', finding.severity.toUpperCase()),
          stat('Status', finding.status),
          stat('Area', finding.area || 'Project'),
          stat('Risk family', finding.owaspCategory || 'Security review'),
          para('Detail', 'Heading3'),
          para(finding.detail || 'No detail provided.'),
          para('Evidence', 'Heading3'),
          para(finding.evidence || 'No evidence provided.'),
          para('Recommended Remediation', 'Heading3'),
          para(finding.recommendation || 'No recommendation provided.'),
        ])
      : [para('No structured findings were returned for this scan.')]),
    para('Raw AI Report', 'Heading1'),
    para(report.rawReport || 'No raw report was captured.', 'CodeBlock'),
  ].join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" mc:Ignorable="w14 wp14">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
</w:styles>`
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function dosTime(date = new Date()) {
  return ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((Math.floor(date.getSeconds() / 2)) & 0x1f)
}

function dosDate(date = new Date()) {
  return (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f)
}

function writeUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff)
}

function writeUint32(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff)
}

function pushBytes(target: number[], data: Uint8Array) {
  for (const byte of data) target.push(byte)
}

function createZip(files: { name: string; content: string }[]) {
  const now = new Date()
  const output: number[] = []
  const central: number[] = []
  const records: { name: Uint8Array; data: Uint8Array; crc: number; offset: number }[] = []

  for (const file of files) {
    const name = encoder.encode(file.name)
    const data = encoder.encode(file.content)
    const crc = crc32(data)
    const offset = output.length

    writeUint32(output, 0x04034b50)
    writeUint16(output, 20)
    writeUint16(output, 0)
    writeUint16(output, 0)
    writeUint16(output, dosTime(now))
    writeUint16(output, dosDate(now))
    writeUint32(output, crc)
    writeUint32(output, data.length)
    writeUint32(output, data.length)
    writeUint16(output, name.length)
    writeUint16(output, 0)
    pushBytes(output, name)
    pushBytes(output, data)

    records.push({ name, data, crc, offset })
  }

  const centralOffset = output.length

  for (const record of records) {
    writeUint32(central, 0x02014b50)
    writeUint16(central, 20)
    writeUint16(central, 20)
    writeUint16(central, 0)
    writeUint16(central, 0)
    writeUint16(central, dosTime(now))
    writeUint16(central, dosDate(now))
    writeUint32(central, record.crc)
    writeUint32(central, record.data.length)
    writeUint32(central, record.data.length)
    writeUint16(central, record.name.length)
    writeUint16(central, 0)
    writeUint16(central, 0)
    writeUint16(central, 0)
    writeUint16(central, 0)
    writeUint32(central, 0)
    writeUint32(central, record.offset)
    pushBytes(central, record.name)
  }

  pushBytes(output, new Uint8Array(central))

  writeUint32(output, 0x06054b50)
  writeUint16(output, 0)
  writeUint16(output, 0)
  writeUint16(output, records.length)
  writeUint16(output, records.length)
  writeUint32(output, central.length)
  writeUint32(output, centralOffset)
  writeUint16(output, 0)

  return new Uint8Array(output)
}

export function createVindictaSecurityDocx(report: VindictaSecurityDocxReport) {
  const now = new Date(report.generatedAt).toISOString()
  const files = [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: 'word/_rels/document.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    {
      name: 'word/document.xml',
      content: buildDocumentXml(report),
    },
    {
      name: 'word/styles.xml',
      content: buildStylesXml(),
    },
    {
      name: 'docProps/core.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${xml(`Vindicta Security Review - ${report.projectName}`)}</dc:title>
  <dc:subject>Security Analyzer Report</dc:subject>
  <dc:creator>Vindicta</dc:creator>
  <cp:keywords>security,OWASP,Vindicta,AI scan</cp:keywords>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      name: 'docProps/app.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Vindicta</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <Company>Vindicta</Company>
</Properties>`,
    },
  ]

  return createZip(files)
}
