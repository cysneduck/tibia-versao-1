import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user making the request
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin or master_admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || !['admin', 'master_admin'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { notification_type } = await req.json();

    // Always use requesting user's ID
    const targetUserId = user.id;

    // Define notification templates
    const templates: Record<string, { title: string; message: string; type: string }> = {
      claim_ready: {
        title: "🔥 Sua Vez de Clamar!",
        message: "O respawn [TEST] está disponível. Você tem 5 minutos!",
        type: "claim_ready"
      },
      claim_expiring: {
        title: "⏰ Claim Expirando",
        message: "Seu claim no respawn [TEST] expira em 2 minutos!",
        type: "claim_expiring"
      },
      queue_update: {
        title: "📍 Atualização da Fila",
        message: "Você é o próximo na fila do respawn [TEST]",
        type: "queue_update"
      },
      system_alert: {
        title: "🔔 Alerta do Sistema",
        message: "Esta é uma notificação de teste do sistema",
        type: "system_alert"
      }
    };

    const template = templates[notification_type] || templates.system_alert;

    // Insert test notification
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        title: template.title,
        message: template.message,
        type: template.type,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      throw insertError;
    }

    console.log('Test notification sent:', {
      type: notification_type,
      target: targetUserId,
      admin: user.id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification,
        message: 'Test notification sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test-notification function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
