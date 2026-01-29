import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET all UMKM
export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("umkm")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform data to match frontend format
  const transformedData = data.map((item) => ({
    id: item.id,
    nama: item.nama,
    jenis: item.jenis,
    deskripsi: item.deskripsi,
    alamat: item.alamat,
    koordinat: item.koordinat,
    kontak: item.kontak,
    gambar: item.gambar,
    video: item.video,
  }))

  return NextResponse.json(transformedData)
}

// POST new UMKM
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("umkm")
    .insert([
      {
        nama: body.nama,
        jenis: body.jenis,
        deskripsi: body.deskripsi,
        alamat: body.alamat,
        koordinat: body.koordinat,
        kontak: body.kontak,
        gambar: body.gambar || [],
        video: body.video || null,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PUT update UMKM
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  if (!body.id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("umkm")
    .update({
      nama: body.nama,
      jenis: body.jenis,
      deskripsi: body.deskripsi,
      alamat: body.alamat,
      koordinat: body.koordinat,
      kontak: body.kontak,
      gambar: body.gambar || [],
      video: body.video || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE UMKM
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  const { error } = await supabase.from("umkm").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
