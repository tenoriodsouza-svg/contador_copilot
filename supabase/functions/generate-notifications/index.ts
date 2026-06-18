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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Não autorizado')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Não autorizado')

    const today = new Date().toISOString().split('T')[0]
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const notifications: {
      user_id: string
      type: string
      title: string
      message: string
      reference_id: string
      reference_type: string
    }[] = []

    const { data: overdueTasks } = await supabase
      .from('tasks')
      .select('id, description, due_date, clients(razao_social)')
      .eq('user_id', user.id)
      .neq('status', 'concluido')
      .lt('due_date', today)

    for (const task of overdueTasks || []) {
      const client = task.clients as { razao_social: string } | null
      notifications.push({
        user_id: user.id,
        type: 'task_overdue',
        title: 'Pendência atrasada',
        message: `${client?.razao_social}: ${task.description} — venceu em ${task.due_date}`,
        reference_id: task.id,
        reference_type: 'task',
      })
    }

    const { data: upcomingObligations } = await supabase
      .from('obligations')
      .select('id, type, description, due_date, clients(razao_social)')
      .eq('user_id', user.id)
      .gte('due_date', today)
      .lte('due_date', in7Days)

    for (const obligation of upcomingObligations || []) {
      const client = obligation.clients as { razao_social: string } | null
      notifications.push({
        user_id: user.id,
        type: 'obligation_due',
        title: 'Obrigação próxima do vencimento',
        message: `${client?.razao_social}: ${obligation.type} vence em ${obligation.due_date}`,
        reference_id: obligation.id,
        reference_type: 'obligation',
      })
    }

    const { data: upcomingCerts } = await supabase
      .from('obligations')
      .select('id, description, due_date, clients(razao_social)')
      .eq('user_id', user.id)
      .eq('type', 'Certificados Digitais')
      .gte('due_date', today)
      .lte('due_date', in30Days)

    for (const cert of upcomingCerts || []) {
      const client = cert.clients as { razao_social: string } | null
      notifications.push({
        user_id: user.id,
        type: 'certificate_expiring',
        title: 'Certificado próximo do vencimento',
        message: `${client?.razao_social}: certificado vence em ${cert.due_date}`,
        reference_id: cert.id,
        reference_type: 'obligation',
      })
    }

    for (const notif of notifications) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', notif.user_id)
        .eq('reference_id', notif.reference_id)
        .eq('reference_type', notif.reference_type)
        .eq('read', false)
        .maybeSingle()

      if (!existing) {
        await supabase.from('notifications').insert(notif)
      }
    }

    return new Response(JSON.stringify({ created: notifications.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
