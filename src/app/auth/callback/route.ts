import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists, if not create one
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Create profile for Google user
        const email = data.user.email ?? ''
        const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.random().toString(36).slice(2, 6)
        const displayName = data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? username

        await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          display_name: displayName,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
        })
      }
    }
  }

  // Redirect to home page after auth
  return NextResponse.redirect(`${origin}/`)
}
