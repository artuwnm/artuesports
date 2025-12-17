import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if the current user is a super admin
    const { data: adminUser, error: adminCheckError } = await supabaseClient
      .from('admin_users')
      .select('role')
      .eq('email', user.email)
      .single();

    if (adminCheckError || !adminUser || adminUser.role !== 'super_admin') {
      throw new Error('Only super admins can create admin users');
    }

    // Parse request body
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      throw new Error('Email, password, and role are required');
    }

    if (role !== 'admin' && role !== 'super_admin') {
      throw new Error('Invalid role. Must be "admin" or "super_admin"');
    }

    // Create Supabase admin client (with service role key)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create the auth user
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
    });

    if (createUserError) {
      throw new Error(`Failed to create auth user: ${createUserError.message}`);
    }

    // Get the current super admin's ID for the created_by field
    const { data: currentAdmin } = await supabaseClient
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single();

    // Create the admin_users entry
    const { error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert([
        {
          email,
          role,
          created_by: currentAdmin?.id || null,
        },
      ]);

    if (insertError) {
      // If admin_users insert fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to create admin record: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
