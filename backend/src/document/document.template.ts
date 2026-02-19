export function renderWorkOrderHtml(data: {
  tenantName: string;
  workOrderId: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assetName: string;
  createdAt: string;
  closedAt?: string | null;
  documentHash?: string | null;
}) {
  const esc = (v: any) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>OS ${esc(data.workOrderId)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .h1 { font-size: 18px; font-weight: 700; margin: 0; }
    .muted { color: #666; font-size: 12px; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px; margin-top: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .row { display: flex; gap: 8px; }
    .k { width: 140px; color: #444; font-size: 12px; }
    .v { flex: 1; font-size: 12px; }
    .hr { border-top: 1px solid #eee; margin: 14px 0; }
    .footer { margin-top: 18px; font-size: 11px; color: #666; }
    .badge { display:inline-block; padding: 2px 8px; border-radius: 999px; border: 1px solid #ddd; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <p class="h1">ORDEM DE SERVIÇO (OS)</p>
      <div class="muted">${esc(data.tenantName)}</div>
      <div class="muted">ID: ${esc(data.workOrderId)}</div>
    </div>
    <div style="text-align:right">
      <div class="badge">Status: ${esc(data.status)}</div><br/>
      <div class="badge">Prioridade: ${esc(data.priority)}</div>
    </div>
  </div>

  <div class="card">
    <div class="grid">
      <div class="row"><div class="k">Ativo</div><div class="v">${esc(data.assetName)}</div></div>
      <div class="row"><div class="k">Abertura</div><div class="v">${esc(data.createdAt)}</div></div>
      <div class="row"><div class="k">Fechamento</div><div class="v">${esc(data.closedAt ?? "-")}</div></div>
      <div class="row"><div class="k">Hash do PDF</div><div class="v">${esc(data.documentHash ?? "-")}</div></div>
    </div>

    <div class="hr"></div>

    <div class="row"><div class="k">Título</div><div class="v">${esc(data.title)}</div></div>
    <div class="row"><div class="k">Descrição</div><div class="v">${esc(data.description ?? "-")}</div></div>
  </div>

  <div class="footer">
    Documento gerado automaticamente. Após Encerrada, é imutável.
  </div>
</body>
</html>
`;
}