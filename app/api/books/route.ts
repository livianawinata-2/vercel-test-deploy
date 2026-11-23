import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";

export async function GET() {
  try {
    const allBooks = await db.select().from(books).orderBy(desc(books.id));
    return NextResponse.json(allBooks);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data buku" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, status } = body;

    if (!title?.trim() || !author?.trim()) {
      return NextResponse.json({ error: "Judul dan penulis wajib diisi" }, { status: 400 });
    }

    const [newBook] = await db
      .insert(books)
      .values({
        title: title.trim(),
        author: author.trim(),
        status: status || "Belum Dibaca",
      })
      .returning();

    return NextResponse.json(newBook, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal menambah buku (Vercel bersifat read-only)" },
      { status: 500 },
    );
  }
}
