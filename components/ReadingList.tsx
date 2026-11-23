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

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, status }),
      });

      const text = await res.text();
      let data: { title?: string; error?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Endpoint bermasalah (HTTP ${res.status}). Cek lokasi app/api/books/route.ts`,
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Gagal menambah buku");
      }

      setFeedback({
        type: "success",
        text: `Berhasil menambahkan "${data.title}"`,
      });
      setTitle("");
      setAuthor("");
      setStatus("Belum Dibaca");
      await refreshBooks();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan jaringan",
      });
    } finally {
      setLoading(false);
    }
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
    setFeedback(null);

    try {
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
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui buku");
      }

      setEditingId(null);
      setFeedback({
        type: "success",
        text: `Berhasil memperbarui "${data.title}"`,
      });
      await refreshBooks();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memperbarui buku",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(book: Book) {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus buku");
      }

      setFeedback({
        type: "success",
        text: `Berhasil menghapus "${book.title}"`,
      });
      await refreshBooks();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus buku",
      });
    } finally {
      setLoading(false);
    }
  }

  function badgeClass(bookStatus: string) {
    if (bookStatus === "Selesai") return "badge badge-done";
    if (bookStatus === "Sedang Dibaca") return "badge badge-reading";
    return "badge badge-unread";
  }

  return (
    <div className="crud-wrapper">
      <form onSubmit={handleCreate} className="card form-card">
        <h2>Tambah Buku Baru</h2>
        <div className="input-row">
          <input
            type="text"
            placeholder="Judul buku"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nama penulis"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>
        <div className="action-row">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Belum Dibaca">Belum Dibaca</option>
            <option value="Sedang Dibaca">Sedang Dibaca</option>
            <option value="Selesai">Selesai</option>
          </select>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Menyimpan..." : "Tambah Buku"}
          </button>
        </div>
      </form>

      {feedback && (
        <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-error"}`}>
          {feedback.text}
        </div>
      )}

      <section className="list-section">
        <h2>Daftar Buku ({books.length})</h2>

        {books.length === 0 ? (
          <p className="card empty-state">
            Belum ada buku tersimpan. Tambahkan buku pertama di atas.
          </p>
        ) : (
          <div className="book-list">
            {books.map((book) => (
              <div key={book.id} className="card book-card">
                {editingId === book.id ? (
                  <div className="edit-form">
                    <div className="input-row">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                      />
                    </div>
                    <div className="action-row">
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                        <option value="Belum Dibaca">Belum Dibaca</option>
                        <option value="Sedang Dibaca">Sedang Dibaca</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleUpdate(book.id)}
                        disabled={loading}
                        className="btn btn-save"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn btn-secondary"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="book-item">
                    <div>
                      <h3>{book.title}</h3>
                      <p className="author">{book.author}</p>
                      <span className={badgeClass(book.status)}>{book.status}</span>
                    </div>
                    <div className="button-group">
                      <button
                        type="button"
                        onClick={() => startEdit(book)}
                        className="btn btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(book)}
                        disabled={loading}
                        className="btn btn-danger"
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
