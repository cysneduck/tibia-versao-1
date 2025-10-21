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

    const targetUrl = 'https://rubinot.com.br/?subtopic=worlds&world=Mystian';
    const homepageUrl = 'https://rubinot.com.br/';
    
    // Try multiple scraping strategies to bypass Cloudflare
    const strategies = [
      // Strategy 1: AllOrigins CORS proxy
      { name: 'AllOrigins', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, useProxy: true },
      // Strategy 2: Direct with session and aggressive headers
      { name: 'Direct+Session', url: targetUrl, useSession: true, useHeaders: true },
      // Strategy 3: Direct without session
      { name: 'Direct', url: targetUrl, useHeaders: true },
    ];
    
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    let html = '';
    let successStrategy = '';
    
    // Try each strategy until one works
    for (const strategy of strategies) {
      console.log(`Trying strategy: ${strategy.name}`);
      let sessionCookies = '';
      
      try {
        // Establish session if needed
        if (strategy.useSession) {
          console.log('Establishing session with homepage...');
          try {
            const homepageResponse = await fetch(homepageUrl, {
              headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0',
                'DNT': '1',
              },
            });
            
            const setCookie = homepageResponse.headers.get('set-cookie');
            if (setCookie) {
              sessionCookies = setCookie.split(';')[0];
              console.log('Session cookies obtained');
            }
            
            // Random delay
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
          } catch (error) {
            console.log('Session establishment failed:', error);
          }
        }
        
        // Prepare headers
        const headers: Record<string, string> = strategy.useHeaders ? {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
          'Referer': homepageUrl,
        } : {};
        
        if (sessionCookies) {
          headers['Cookie'] = sessionCookies;
        }
        
        // Try fetching with retry logic
        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`  Attempt ${attempt}/${maxRetries}...`);
            
            const response = await fetch(strategy.url, strategy.useHeaders ? { headers } : {});
            
            if (response.ok) {
              html = await response.text();
              console.log(`✓ Success with ${strategy.name}! (${html.length} bytes)`);
              console.log('HTML snippet:', html.substring(0, 300));
              successStrategy = strategy.name;
              break;
            } else {
              console.log(`  × Attempt ${attempt} failed: ${response.status} ${response.statusText}`);
              if (attempt === 1 && response.status === 403) {
                console.log('  Cloudflare detected:', response.headers.get('cf-mitigated'));
              }
            }
          } catch (error) {
            console.log(`  × Attempt ${attempt} error:`, error);
          }
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // If we got HTML, break out of strategy loop
        if (html) break;
        
      } catch (error) {
        console.log(`Strategy ${strategy.name} failed:`, error);
      }
      
      // Small delay between strategies
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // If all strategies failed
    if (!html) {
      throw new Error('All scraping strategies failed - Cloudflare protection is too strong');
    }

    // Step 3: Parse character names with multiple patterns
    const onlineCharacterNames = new Set<string>();
    
    // Pattern 1: Links to character pages (most reliable)
    const linkPattern = /<a[^>]*href="[^"]*[?&]name=([^"&]+)[^"]*"[^>]*>([^<]+)<\/a>/gi;
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      const name = (match[1] || match[2]).trim().replace(/\+/g, ' ');
      if (name && name.length > 2 && !/^\d+$/.test(name)) {
        onlineCharacterNames.add(name.toLowerCase());
      }
    }
    
    // Pattern 2: Table cells with character names
    const tdPattern = /<td[^>]*>([A-Z][a-zA-Z\s]{2,25})<\/td>/g;
    while ((match = tdPattern.exec(html)) !== null) {
      const name = match[1].trim();
      if (name && name.length > 2 && !/^\d+$/.test(name) && !/\d{2}:\d{2}/.test(name) && 
          !/(Level|Vocation|World|Online|Players|Status)/i.test(name)) {
        onlineCharacterNames.add(name.toLowerCase());
      }
    }
    
    // Pattern 3: Specific Rubinot world page structure
    const worldPattern = /<td[^>]*class="[^"]*player[^"]*"[^>]*>([^<]+)<\/td>/gi;
    while ((match = worldPattern.exec(html)) !== null) {
      const name = match[1].trim();
      if (name && name.length > 2) {
        onlineCharacterNames.add(name.toLowerCase());
      }
    }

    console.log(`Parsed ${onlineCharacterNames.size} unique online players from page`);

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
