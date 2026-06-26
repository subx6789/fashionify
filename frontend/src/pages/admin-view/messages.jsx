/**
 * ============================================================================
 * File Purpose Documentation
 * ============================================================================
 * File: messages.jsx
 * Purpose: Full page React view rendering a distinct route in the application.
 * Functions/Methods: 8
 * 
 * Description: 
 * This file is part of the Fashionify e-commerce platform. It encapsulates 
 * specific logic related to its domain (Frontend UI/State or Backend Logic).
 * Beginners should read through the functions below to understand how data 
 * flows through this specific module.
 * ============================================================================
 */

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector }      from "react-redux";
import {
  fetchMessages,
  fetchUnreadCount,
  markMessageRead,
  markMessageResolved,
  deleteMessage,
} from "@/store/admin/messages-slice";
import {
  Mail,
  MailOpen,
  CheckCircle,
  Circle,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Inbox,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SkeletonRepeater } from "@/components/ui/skeleton";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";

// ── Filter tab definitions ────────────────────────────────────────────────────
const FILTER_TABS = [
  { id: "all",      label: "All Messages" },
  { id: "unread",   label: "Unread"       },
  { id: "resolved", label: "Resolved"     },
];

// ── Relative time formatter ───────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Single message row ────────────────────────────────────────────────────────
function MessageRow({ msg, onRead, onResolve, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={`border-2 border-border rounded-sm transition-all ${
        !msg.read
          ? "bg-primary/10 border-l-4 border-l-primary"
          : "bg-card"
      }`}
      style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
    >
      {/* ── Summary row ── */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer group"
        onClick={() => {
          setExpanded((e) => !e);
          // Auto-mark as read when opened
          if (!msg.read) onRead(msg.id, true);
        }}
      >
        {/* Unread indicator */}
        <div className="flex-shrink-0 mt-0.5">
          {msg.read
            ? <MailOpen className="w-4 h-4 text-muted-foreground" />
            : <Mail     className="w-4 h-4 text-primary" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-black truncate ${!msg.read ? "text-foreground" : "text-muted-foreground"}`}>
              {msg.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">{msg.email}</span>
            {msg.resolved && (
              <span
                className="text-[10px] font-black px-1.5 py-0.5 border-2 border-border bg-muted rounded-sm"
                style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
              >
                RESOLVED
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 truncate ${!msg.read ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            {msg.subject}
          </p>
        </div>

        {/* Right: time + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium">
            {timeAgo(msg.createdAt)}
          </span>
          {expanded
            ? <ChevronUp   className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* ── Expanded full message ── */}
      {expanded && (
        <div className="border-t-2 border-border px-4 pb-4 pt-3 space-y-3">
          {/* Full message body */}
          <div
            className="p-3 bg-muted/30 border-2 border-border rounded-sm text-sm leading-relaxed whitespace-pre-wrap"
          >
            {msg.message}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>From: <strong className="text-foreground">{msg.name}</strong></span>
            <span>Email: <strong className="text-foreground">{msg.email}</strong></span>
            <span>
              Received:{" "}
              <strong className="text-foreground">
                {new Date(msg.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium", timeStyle: "short",
                })}
              </strong>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Mark read / unread toggle */}
            <button
              onClick={() => onRead(msg.id, !msg.read)}
              className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 border-2 border-border rounded-sm bg-background hover:bg-muted transition-colors"
              style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
            >
              {msg.read
                ? <><Mail     className="w-3.5 h-3.5" /> Mark Unread</>
                : <><MailOpen className="w-3.5 h-3.5" /> Mark Read</>}
            </button>

            {/* Resolve toggle */}
            <button
              onClick={() => onResolve(msg.id, !msg.resolved)}
              className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 border-2 border-border rounded-sm transition-colors ${
                msg.resolved
                  ? "bg-muted text-muted-foreground hover:bg-background"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
              style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
            >
              {msg.resolved
                ? <><Circle      className="w-3.5 h-3.5" /> Reopen</>
                : <><CheckCircle className="w-3.5 h-3.5" /> Mark Resolved</>}
            </button>

            {/* Reply shortcut */}
            <a
              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
              className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 border-2 border-border rounded-sm bg-background hover:bg-muted transition-colors"
              style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
            >
              Reply via Email ↗
            </a>

            {/* Delete */}
            <button
              onClick={() => onDelete(msg.id)}
              className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 border-2 border-border rounded-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors ml-auto"
              style={{ boxShadow: "1px 1px 0px 0px hsl(var(--neu-black))" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function AdminMessages() {
  const dispatch                    = useDispatch();
  const { messages, unreadCount, isLoading } = useSelector((s) => s.adminMessages);
  const { toast }                   = useToast();

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sortOrder,    setSortOrder]    = useState("newest"); // "newest" | "oldest"
  const [messageToDelete, setMessageToDelete] = useState(null);

  // Fetch messages when filter changes
  useEffect(() => {
    dispatch(fetchMessages(activeFilter));
  }, [dispatch, activeFilter]);

  // Fetch unread count on mount (for sidebar badge sync)
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // ── Client-side search + sort ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...messages];

    // Search by name / email / subject / message body
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q)    ||
          m.email.toLowerCase().includes(q)   ||
          m.subject.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortOrder === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    // "newest" already comes from the server, no re-sort needed

    return list;
  }, [messages, searchQuery, sortOrder]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleRead(id, read) {
    dispatch(markMessageRead({ id, read })).then(() => {
      dispatch(fetchUnreadCount());
    });
  }

  function handleResolve(id, resolved) {
    dispatch(markMessageResolved({ id, resolved })).then(() => {
      dispatch(fetchUnreadCount());
    });
  }

  function handleDeleteClick(id) {
    setMessageToDelete(id);
  }

  function confirmDelete() {
    if (!messageToDelete) return;
    dispatch(deleteMessage(messageToDelete)).then(() => {
      toast({ title: "Message deleted" });
      dispatch(fetchUnreadCount());
      setMessageToDelete(null);
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6" />
            Messages
          </h1>
          <p className="text-sm text-muted-foreground font-bold mt-1">
            Contact Us submissions from customers
          </p>
        </div>
        {unreadCount > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground border-2 border-border rounded-sm font-black text-sm"
            style={{ boxShadow: "3px 3px 0px 0px hsl(var(--neu-black))" }}
          >
            <Mail className="w-4 h-4" />
            {unreadCount} unread
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Filter tabs */}
        <div
          className="flex border-2 border-border rounded-sm overflow-hidden"
          style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          role="tablist"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeFilter === tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 text-xs font-black transition-colors border-r-2 border-border last:border-r-0 ${
                activeFilter === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
              {tab.id === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black rounded-full bg-foreground text-background">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortOrder((s) => s === "newest" ? "oldest" : "newest")}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-black border-2 border-border rounded-sm bg-background hover:bg-muted transition-colors"
          style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
        >
          {sortOrder === "newest"
            ? <><ArrowDown className="w-3.5 h-3.5" /> Newest First</>
            : <><ArrowUp   className="w-3.5 h-3.5" /> Oldest First</>}
        </button>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, subject…"
            className="w-full pl-9 pr-3 py-2 text-sm border-2 border-border rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            style={{ boxShadow: "2px 2px 0px 0px hsl(var(--neu-black))" }}
          />
        </div>
      </div>

      {/* ── Results count ── */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground font-bold">
          {filtered.length} message{filtered.length !== 1 ? "s" : ""}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </p>
      )}

      {/* ── Message list ── */}
      {isLoading ? (
        // Skeleton rows
        <div className="space-y-3">
          <SkeletonRepeater count={4} className="h-16 border-2 border-border rounded-sm bg-muted/30" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              onRead={handleRead}
              onResolve={handleResolve}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-sm text-center"
        >
          <Inbox className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="font-black text-lg">
            {activeFilter === "unread"   ? "No unread messages"
             : activeFilter === "resolved" ? "No resolved messages"
             : "No messages yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : "Customer contact form submissions will appear here."}
          </p>
        </div>
      )}

      <ConfirmDeleteDialog
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Message?"
        warningText="Deleting this message will permanently remove it from your inbox. This action cannot be undone."
      />
    </div>
  );
}

export default AdminMessages;
