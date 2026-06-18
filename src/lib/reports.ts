import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, formatCurrency } from '@/lib/utils'

function addHeader(doc: jsPDF, title: string) {
  doc.setFontSize(18)
  doc.setTextColor(37, 99, 235)
  doc.text('Contador Copilot', 14, 20)
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text(title, 14, 30)
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Gerado em: ${formatDate(new Date())}`, 14, 38)
}

export function generateClientsReport(clients: { razao_social: string; cnpj: string | null; regime_tributario: string | null; ativo: boolean }[]) {
  const doc = new jsPDF()
  addHeader(doc, 'Relatório de Clientes')

  autoTable(doc, {
    startY: 45,
    head: [['Razão Social', 'CNPJ', 'Regime', 'Status']],
    body: clients.map((c) => [
      c.razao_social,
      c.cnpj || '-',
      c.regime_tributario || '-',
      c.ativo ? 'Ativo' : 'Inativo',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save('relatorio-clientes.pdf')
}

export function generateTasksReport(tasks: { clients?: { razao_social: string }; description: string; due_date: string; priority: string; status: string }[]) {
  const doc = new jsPDF()
  addHeader(doc, 'Relatório de Pendências')

  autoTable(doc, {
    startY: 45,
    head: [['Cliente', 'Descrição', 'Vencimento', 'Prioridade', 'Status']],
    body: tasks.map((t) => [
      t.clients?.razao_social || '-',
      t.description,
      formatDate(t.due_date),
      t.priority,
      t.status,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save('relatorio-pendencias.pdf')
}

export function generateObligationsReport(obligations: { clients?: { razao_social: string }; type: string; description: string | null; due_date: string }[]) {
  const doc = new jsPDF()
  addHeader(doc, 'Relatório de Obrigações')

  autoTable(doc, {
    startY: 45,
    head: [['Cliente', 'Tipo', 'Descrição', 'Vencimento']],
    body: obligations.map((o) => [
      o.clients?.razao_social || '-',
      o.type,
      o.description || '-',
      formatDate(o.due_date),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save('relatorio-obrigacoes.pdf')
}

export function generateFinancialReport(records: { clients?: { razao_social: string }; monthly_fee: number; billing_date: string; payment_status: string }[]) {
  const doc = new jsPDF()
  addHeader(doc, 'Relatório Financeiro')

  autoTable(doc, {
    startY: 45,
    head: [['Cliente', 'Mensalidade', 'Data Cobrança', 'Status']],
    body: records.map((r) => [
      r.clients?.razao_social || '-',
      formatCurrency(Number(r.monthly_fee)),
      formatDate(r.billing_date),
      r.payment_status,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save('relatorio-financeiro.pdf')
}

export function generateCertificatesReport(obligations: { clients?: { razao_social: string }; description: string | null; due_date: string }[]) {
  const doc = new jsPDF()
  addHeader(doc, 'Relatório de Certificados Digitais')

  autoTable(doc, {
    startY: 45,
    head: [['Cliente', 'Descrição', 'Vencimento']],
    body: obligations.map((o) => [
      o.clients?.razao_social || '-',
      o.description || '-',
      formatDate(o.due_date),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save('relatorio-certificados.pdf')
}
