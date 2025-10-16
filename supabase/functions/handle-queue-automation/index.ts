import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting queue automation...');

    // Cleanup expired priorities
    const { data: priorityResult, error: priorityError } = await supabase
      .rpc('cleanup_expired_priorities');

    if (priorityError) {
      console.error('Error cleaning up expired priorities:', priorityError);
      throw priorityError;
    }

    console.log('Priority cleanup result:', priorityResult);

    // Handle expired claims
    const { data: claimResult, error: claimError } = await supabase
      .rpc('handle_expired_claims');

    if (claimError) {
      console.error('Error handling expired claims:', claimError);
      throw claimError;
    }

    console.log('Expired claims result:', claimResult);

    // Delete old notifications (older than 24 hours and read)
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .eq('is_read', true);

    if (deleteError) {
      console.error('Error deleting old notifications:', deleteError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        priorityResult, 
        claimResult,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in queue automation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
