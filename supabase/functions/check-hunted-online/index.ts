import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting hunted characters online check...');

    // Fetch all hunted characters
    const { data: huntedChars, error: fetchError } = await supabase
      .from('hunted_characters')
      .select('id, character_name');

    if (fetchError) {
      throw new Error(`Failed to fetch hunted characters: ${fetchError.message}`);
    }

    if (!huntedChars || huntedChars.length === 0) {
      console.log('No hunted characters to check');
      return new Response(
        JSON.stringify({ success: true, message: 'No hunted characters to check' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking ${huntedChars.length} hunted characters...`);

    // Fetch the online players page with browser-like headers
    const targetUrl = 'https://rubinot.com.br/?subtopic=worlds&world=Mystian';
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch online players: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Successfully fetched online players page');

    // Parse character names from HTML
    // The page typically has a table with character names
    // We'll look for patterns like <td>CharacterName</td> or similar
    const onlineCharacterNames = new Set<string>();
    
    // Try multiple patterns to extract character names
    // Pattern 1: Direct text in table cells
    const tdPattern = /<td[^>]*>([^<]+)<\/td>/gi;
    let match;
    while ((match = tdPattern.exec(html)) !== null) {
      const name = match[1].trim();
      // Filter out common non-character text (numbers, dates, etc.)
      if (name && name.length > 2 && !/^\d+$/.test(name) && !/\d{2}:\d{2}/.test(name)) {
        onlineCharacterNames.add(name.toLowerCase());
      }
    }

    // Pattern 2: Links to character pages
    const linkPattern = /<a[^>]*href="[^"]*character[^"]*"[^>]*>([^<]+)<\/a>/gi;
    while ((match = linkPattern.exec(html)) !== null) {
      const name = match[1].trim();
      if (name && name.length > 2) {
        onlineCharacterNames.add(name.toLowerCase());
      }
    }

    console.log(`Found ${onlineCharacterNames.size} online players on page`);

    // Check each hunted character against online list
    const updates = [];
    const nowOnline: string[] = [];
    let totalOnline = 0;

    for (const char of huntedChars) {
      const isOnline = onlineCharacterNames.has(char.character_name.toLowerCase());
      
      // Get current status to detect changes
      const { data: currentStatus } = await supabase
        .from('hunted_characters')
        .select('is_online')
        .eq('id', char.id)
        .single();

      const wasOffline = !currentStatus?.is_online;

      const updateData: any = {
        is_online: isOnline,
        last_checked: new Date().toISOString(),
      };

      if (isOnline) {
        totalOnline++;
        updateData.last_seen_online = new Date().toISOString();
        
        // If character just came online (was offline, now online)
        if (wasOffline) {
          nowOnline.push(char.character_name);
        }
      }

      updates.push(
        supabase
          .from('hunted_characters')
          .update(updateData)
          .eq('id', char.id)
      );
    }

    // Execute all updates
    await Promise.all(updates);

    // Create notifications for characters that just came online
    if (nowOnline.length > 0) {
      console.log(`Creating notifications for ${nowOnline.length} newly online characters:`, nowOnline);
      
      // Get all user IDs to notify everyone
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      if (profiles) {
        const notifications = profiles.flatMap(profile => 
          nowOnline.map(charName => ({
            user_id: profile.id,
            title: 'Hunted Player Online!',
            message: `${charName} is now online`,
            type: 'hunted_online',
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
          }))
        );

        await supabase.from('notifications').insert(notifications);
      }
    }

    const duration = Date.now() - startTime;

    // Log the check results
    await supabase.from('online_check_logs').insert({
      total_hunted: huntedChars.length,
      total_online: totalOnline,
      duration_ms: duration,
      success: true,
    });

    console.log(`Check complete: ${totalOnline}/${huntedChars.length} online (${duration}ms)`);

    return new Response(
      JSON.stringify({
        success: true,
        total_hunted: huntedChars.length,
        total_online: totalOnline,
        newly_online: nowOnline,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking hunted characters:', errorMessage);
    
    const duration = Date.now() - startTime;
    
    // Log the error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from('online_check_logs').insert({
        total_hunted: 0,
        total_online: 0,
        duration_ms: duration,
        success: false,
        error_message: errorMessage,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
