import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { document_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single()

    if (docError || !document) {
      throw new Error('Documento não encontrado')
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path)

    if (downloadError || !fileData) {
      throw new Error('Erro ao baixar documento')
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    let extractedText = ''
    try {
      const pdfText = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
      const textMatches = pdfText.match(/\(([^)]+)\)/g) || []
      extractedText = textMatches
        .map((m) => m.slice(1, -1))
        .filter((t) => t.length > 2 && /[a-zA-ZÀ-ú0-9]/.test(t))
        .join(' ')
        .slice(0, 8000)

      if (extractedText.length < 50) {
        extractedText = `Documento PDF: ${document.file_name}. Categoria: ${document.category}. Não foi possível extrair texto completo — pode ser um PDF escaneado.`
      }
    } catch {
      extractedText = `Documento PDF: ${document.file_name}. Categoria: ${document.category}.`
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente contábil brasileiro. Analise o documento e retorne APENAS um JSON válido com:
{
  "summary": "resumo em 2-3 frases em português",
  "key_info": { "empresa": "", "valor": "", "data": "", "tipo": "" },
  "alerts": ["alerta 1", "alerta 2"]
}`,
          },
          {
            role: 'user',
            content: `Analise este documento contábil:\n\n${extractedText}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiResponse.ok) {
      const err = await openaiResponse.text()
      throw new Error(`OpenAI error: ${err}`)
    }

    const aiResult = await openaiResponse.json()
    const content = JSON.parse(aiResult.choices[0].message.content)

    const { error: insertError } = await supabase
      .from('document_summaries')
      .insert({
        document_id,
        summary: content.summary,
        key_info: content.key_info || {},
        alerts: content.alerts || [],
      })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, summary: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
