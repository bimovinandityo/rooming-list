"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  ImagePlus,
  Link as LinkIcon,
  Smile,
  MoreHorizontal,
  Pencil,
  Trash2,
  X as XIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/utils";

interface Announcement {
  id: string;
  authorName: string;
  authorInitials: string;
  postedAt: string; // pre-formatted display string ("11h10", "27/07/25", …)
  title: string;
  body: string;
  images?: string[];
}

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&blur=10",
];

const INITIAL_POSTS: Announcement[] = [
  {
    id: "p1",
    authorName: "Frédéric Total",
    authorInitials: "FT",
    postedAt: "11:10",
    title: "🌴🌴 Wrap-up of this incredible event 🌴🌴",
    body: `What a way to close the year — a recap of this wonderful event.
Thanks to everyone for the cooperation and the trust. See you next year for greener and even more FUN events.
Long live the team!!! 🥳 ❤️`,
    images: [STOCK_IMAGES[0], STOCK_IMAGES[1]],
  },
  {
    id: "p2",
    authorName: "Frédéric Total",
    authorInitials: "FT",
    postedAt: "11:10",
    title: "🌴🌴 Wrap-up of this incredible event 🌴🌴",
    body: `What a way to close the year — a recap of this wonderful event.
Thanks to everyone for the cooperation and the trust. See you next year for greener and even more FUN events.
Long live the team!!! 🥳 ❤️`,
    images: [STOCK_IMAGES[2]],
  },
  {
    id: "p3",
    authorName: "Frédéric Total",
    authorInitials: "FT",
    postedAt: "07/27/25",
    title: "Departure day 🥇 🚂",
    body: `Please pack your belongings and vacate the rooms by 4:00 PM at the latest.
You'll be able to load your luggage onto the coaches.`,
  },
];

export function AnnouncementsView() {
  const [posts, setPosts] = useState<Announcement[]>(INITIAL_POSTS);

  // Composer state
  const [draft, setDraft] = useState("");
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyWrap(prefix: string, suffix: string = prefix) {
    const ta = composerRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = draft.slice(0, start);
    const sel = draft.slice(start, end);
    const after = draft.slice(end);
    const next = `${before}${prefix}${sel || "texte"}${suffix}${after}`;
    setDraft(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = before.length + prefix.length + (sel || "texte").length + suffix.length;
      ta.setSelectionRange(cursor, cursor);
    });
  }

  function appendEmoji(emoji: string) {
    const ta = composerRef.current;
    if (!ta) {
      setDraft((d) => d + emoji);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setDraft(draft.slice(0, start) + emoji + draft.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  function handleAddImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDraftImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function resetComposer() {
    setDraft("");
    setDraftImages([]);
    setEditingId(null);
  }

  function handlePublish() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const [firstLine, ...rest] = trimmed.split("\n");
    const title = firstLine.length > 80 ? firstLine.slice(0, 80) + "…" : firstLine;
    const body = rest.join("\n").trim() || trimmed;

    if (editingId) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, title, body, images: draftImages.length > 0 ? draftImages : undefined }
            : p,
        ),
      );
    } else {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setPosts((prev) => [
        {
          id: `p-${Date.now()}`,
          authorName: "Frédéric Total",
          authorInitials: "FT",
          postedAt: `${hh}h${mm}`,
          title,
          body,
          images: draftImages.length > 0 ? draftImages : undefined,
        },
        ...prev,
      ]);
    }
    resetComposer();
  }

  function handleEdit(post: Announcement) {
    setEditingId(post.id);
    setDraft(`${post.title}\n${post.body}`);
    setDraftImages(post.images ?? []);
    composerRef.current?.focus();
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (editingId === postId) resetComposer();
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-8 py-6 flex flex-col gap-6">
        {/* Composer */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write your message"
            rows={3}
            className="w-full resize-none px-4 pt-4 pb-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none rounded-t-lg"
          />

          {/* Draft image previews */}
          {draftImages.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {draftImages.map((src, i) => (
                <div
                  key={i}
                  className="relative w-24 h-16 rounded-md overflow-hidden border border-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDraftImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow-sm"
                  >
                    <XIcon size={9} className="text-gray-700" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-t border-gray-100">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleAddImages(e.target.files);
                e.target.value = "";
              }}
            />
            <ToolButton
              icon={LinkIcon}
              title="Insert link"
              onClick={() => {
                const url = window.prompt("Link URL", "https://");
                if (url) applyWrap("[", `](${url})`);
              }}
            />
            <ToolButton icon={Smile} title="Insert emoji" onClick={() => appendEmoji("🎉")} />
            <ToolButton
              icon={ImagePlus}
              title="Add image"
              onClick={() => fileInputRef.current?.click()}
            />
            <span className="mx-1 h-4 w-px bg-gray-200" />
            <ToolButton icon={Bold} title="Bold" onClick={() => applyWrap("**")} />
            <ToolButton icon={Italic} title="Italic" onClick={() => applyWrap("_")} />

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={resetComposer}
                disabled={!draft.trim() && draftImages.length === 0 && !editingId}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={!draft.trim()}
                className="text-sm px-4 py-1.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {editingId ? "Save" : "Publish"}
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={() => handleEdit(post)}
              onDelete={() => handleDelete(post.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  onClick,
  title,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
    >
      <Icon size={14} />
    </button>
  );
}

function PostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: Announcement;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white px-5 pt-4 pb-5">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-600 shrink-0">
            {post.authorInitials}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-medium">{post.authorName}</span>
            <span className="text-gray-400"> · {post.postedAt}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil size={13} className="mr-2 text-gray-500" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-red-600 focus:text-red-700">
              <Trash2 size={13} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <h2 className="text-sm font-semibold text-gray-900 mb-2">{post.title}</h2>
      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{post.body}</p>

      {post.images && post.images.length > 0 && (
        <div
          className={cn(
            "mt-4 grid gap-2",
            post.images.length === 1 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {post.images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              className="w-full h-56 object-cover rounded-md border border-gray-200"
            />
          ))}
        </div>
      )}
    </article>
  );
}
