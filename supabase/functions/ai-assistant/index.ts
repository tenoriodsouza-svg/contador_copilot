import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Você é o Assistente Contábil do Contador Copilot, especializado em contabilidade brasileira.

Você pode ajudar com:
- Obrigações do Simples Nacional
- Diferenças entre regimes tributários (Simples, Lucro Presumido, Lucro Real, MEI)
- Rotinas contábeis mensais
- Prazos e obrigações acessórias
- Apoio operacional para contadores autônomos

Responda sempre em português brasileiro, de forma clara e profissional.
Seja objetivo mas completo. Use exemplos práticos quando útil.
Não forneça consultoria jurídica — recomende consultar um contador para casos específicos.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Não autorizado')

    const { chat_id, message } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Não autorizado')

    const { data: history } = await supabase
      .from('ai_chat_messages')
      .select('role, content')
      .eq('chat_id', chat_id)
      .order('created_at')
      .limit(20)

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!openaiResponse.ok) {
      const err = await openaiResponse.text()
      throw new Error(`OpenAI error: ${err}`)
    }

    const aiResult = await openaiResponse.json()
    const assistantContent = aiResult.choices[0].message.content

    await supabase.from('ai_chat_messages').insert({
      chat_id,
      role: 'assistant',
      content: assistantContent,
    })

    await supabase
      .from('ai_chats')
      .update({ updated_at: new Date().toISOString(), title: message.slice(0, 50) })
      .eq('id', chat_id)

    return new Response(JSON.stringify({ content: assistantContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
