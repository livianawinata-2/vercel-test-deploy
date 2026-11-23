"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Book } from "@/db/schema";

export default function ReadingList({ initialBooks }: { initialBooks: Book[] }) {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("Belum Dibaca");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function refreshBooks() {
    const res = await fetch("/api/books");
    if (res.ok) {
      const data = await res.json();
      setBooks(data);
      router.refresh();
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    setLoading(true);
    setFeedback(null);

    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, status }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setFeedback({ type: "error", text: data.error });
      return;
    }

    setFeedback({
      type: "success",
      text: `Berhasil menambahkan "${data.title}"`,
    });
    setTitle("");
    setAuthor("");
    setStatus("Belum Dibaca");
    await refreshBooks();
  }

  function startEdit(book: Book) {
    setEditingId(book.id);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditStatus(book.status);
    setFeedback(null);
  }

  async function handleUpdate(id: number) {
    if (!editTitle.trim() || !editAuthor.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        author: editAuthor,
        status: editStatus,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setFeedback({ type: "error", text: data.error });
      return;
    }

    setEditingId(null);
    setFeedback({
      type: "success",
      text: `Berhasil memperbarui "${data.title}"`,
    });
    await refreshBooks();
  }

  async function handleDelete(book: Book) {
    setLoading(true);
    const res = await fetch(`/api/books/${book.id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setFeedback({ type: "error", text: data.error });
      return;
    }

    setFeedback({
      type: "success",
      text: `Berhasil menghapus "${book.title}"`,
    });
    await refreshBooks();
  }

  function badgeColor(bookStatus: string) {
    if (bookStatus === "Selesai") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    if (bookStatus === "Sedang Dibaca") return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    return "bg-zinc-700/50 text-zinc-300 border-zinc-600";
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4"
      >
        <h2 className="text-lg font-semibold">Tambah Buku Baru</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Judul buku"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            required
          />
          <input
            type="text"
            placeholder="Nama penulis"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
            required
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          >
            <option value="Belum Dibaca">Belum Dibaca</option>
            <option value="Sedang Dibaca">Sedang Dibaca</option>
            <option value="Selesai">Selesai</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-100 text-zinc-950 font-medium text-sm px-5 py-2 rounded-lg hover:bg-zinc-300 transition disabled:opacity-50"
          >
            Tambah Buku
          </button>
        </div>
      </form>

      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-sm border ${
            feedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-700 text-emerald-200"
              : "bg-red-950/60 border-red-700 text-red-200"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Daftar Buku ({books.length})</h2>
        </div>

        {books.length === 0 ? (
          <p className="text-zinc-500 text-sm bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
            Belum ada buku tersimpan. Tambahkan buku pertama di atas.
          </p>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <div key={book.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                {editingId === book.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm"
                      />
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm"
                      >
                        <option value="Belum Dibaca">Belum Dibaca</option>
                        <option value="Sedang Dibaca">Sedang Dibaca</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleUpdate(book.id)}
                        className="bg-emerald-500 text-zinc-950 font-medium text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-400"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-lg hover:bg-zinc-700"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-zinc-100">{book.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{book.author}</p>
                      <span
                        className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full border ${badgeColor(
                          book.status,
                        )}`}
                      >
                        {book.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(book)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(book)}
                        className="bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-800/60 text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
