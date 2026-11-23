import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookId = Number(id);
    const body = await request.json();
    const { title, author, status } = body;

    const [updatedBook] = await db
      .update(books)
      .set({
        ...(title !== undefined && { title: title.trim() }),
        ...(author !== undefined && { author: author.trim() }),
        ...(status !== undefined && { status }),
      })
      .where(eq(books.id, bookId))
      .returning();

    return NextResponse.json(updatedBook);
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui buku (Vercel bersifat read-only)" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookId = Number(id);

    await db.delete(books).where(eq(books.id, bookId));

    return NextResponse.json({ message: "Buku berhasil dihapus" });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus buku (Vercel bersifat read-only)" },
      { status: 500 },
    );
  }
}
