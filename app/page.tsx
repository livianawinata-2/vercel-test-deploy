import { desc } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import ReadingList from "@/components/ReadingList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allBooks = await db.select().from(books).orderBy(desc(books.id));

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Reading List</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Daftar bacaan pribadi menggunakan Next.js, Drizzle ORM, dan SQLite
          </p>
        </header>
        <ReadingList initialBooks={allBooks} />
      </div>
    </main>
  );
}
