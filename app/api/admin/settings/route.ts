import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET admin settings (password hash)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "umkm"

  const { data, error } = await supabase
    .from("admin_settings")
    .select("password_hash")
    .eq("admin_type", type)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ password_hash: data?.password_hash })
}

// POST verify password
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { type = "umkm", password } = body

  const { data, error } = await supabase
    .from("admin_settings")
    .select("password_hash")
    .eq("admin_type", type)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Simple comparison (in production, use bcrypt)
  const isValid = data?.password_hash === password

  return NextResponse.json({ valid: isValid })
}

// PUT update password
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { type = "umkm", oldPassword, newPassword } = body

  // First verify old password
  const { data: settings, error: fetchError } = await supabase
    .from("admin_settings")
    .select("password_hash")
    .eq("admin_type", type)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (settings?.password_hash !== oldPassword) {
    return NextResponse.json({ error: "Password lama salah" }, { status: 401 })
  }

  // Update password
  const { error: updateError } = await supabase
    .from("admin_settings")
    .update({
      password_hash: newPassword,
      updated_at: new Date().toISOString(),
    })
    .eq("admin_type", type)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
