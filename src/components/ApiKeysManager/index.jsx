import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { MoreVertical, X, ChevronLeft, ChevronRight, Trash2, Copy, Check } from "lucide-react";
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import RippleButton from '../RippleButton';
import AnimatedText from '../AnimatedText';

// ---------- helpers ----------

const EXPIRATION_OPTIONS = [
    { id: "1m", label: "1 month", months: 1 },
    { id: "3m", label: "3 months", months: 3 },
    { id: "6m", label: "6 months", months: 6 },
    { id: "12m", label: "12 months", months: 12 },
    // { id: "custom", label: "Custom", months: null },
    { id: "never", label: "Never expire", months: null },
];

function normalizeDate(value) {
    if (!value) return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(date) {
    const normalized = normalizeDate(date);
    if (!normalized) return "—";
    return normalized.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function maskKey(key) {
    if (!key) return "—";
    const visible = String(key).slice(0, 8);
    return `${visible}${"*".repeat(8)}`;
}

function computeStatus(expires_at) {
    const expires = normalizeDate(expires_at);
    if (!expires) return "Active"; // never expires
    return expires.getTime() > Date.now() ? "Active" : "Expired";
}

// ---------- small UI atoms ----------

function StatusPill({ status }) {
    const isActive = status === "Active";
    return (
        <span
            className={`inline-flex items-center gap-1.5 text-sm ${isActive ? "text-emerald-600" : "text-gray-400"
                }`}
        >
            <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-300"
                    }`}
            />
            {status}
        </span>
    );
}

function PillToggle({ options, value, onChange }) {
    const {
        theme
    } = useContext(MainContext);

    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const selected = value === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChange(opt.id)}
                        className={`rounded-xl  px-3 py-2 text-sm font-medium transition-colors ${selected
                            ? "bg-purple-600/65 !border !border-transparent text-white"
                            : (theme === 'light' ? "bg-transparent !border !border-gray-300 text-gray-700 hover:border-gray-400" : "bg-transparent !border !border-textColor-200/50 text-textColor-100 hover:border-textColor-100")
                            }`}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

// ---------- Create / Edit modal ----------

function KeyFormModal({ mode, initial, onClose, onSubmit }) {
    const {
        theme
    } = useContext(MainContext);
    const isEdit = mode === "edit";
    const [name, setName] = useState(initial?.name ?? "");
    const [expirationId, setExpirationId] = useState(initial?.expirationId ?? "12m");
    const [customDate, setCustomDate] = useState(
        initial?.expires_at && expirationId === "custom"
            ? normalizeDate(initial?.expires_at)?.toISOString().slice(0, 10) ?? ""
            : ""
    );
    const nameRef = useRef(null);

    useEffect(() => {
        nameRef.current?.focus();
    }, []);

    const expiresOn = useMemo(() => {
        const opt = EXPIRATION_OPTIONS.find((o) => o.id === expirationId);
        if (!opt) return null;
        if (opt.id === "never") return null;
        if (opt.id === "custom") {
            return customDate ? new Date(customDate) : null;
        }
        const baseDate = initial?.created_at ?? new Date();
        return addMonths(baseDate, opt.months);
    }, [expirationId, customDate, initial?.created_at]);

    const canSubmit =
        name.trim().length > 0 && (expirationId !== "custom" || Boolean(customDate));

    async function handleSubmit() {
        if (!canSubmit) return;

        const { api_key, success, message } = await makeApiRequest("/api-key", "POST", JSON.stringify({
            name: name.trim(),
            expirationId,
            expires_at: expiresOn,
        }));

        /**
         * example response:
         * {
         * */
        // const api_key = {
        //     created_at: "2026-07-03T11:44:32.778899+00:00",
        //     expires_at: "2027-07-03T11:44:30.822000+00:00",
        //     id: "9xhrpK8NkE9OvJmeTtze",
        //     key: "Cb1lQyjiyeAFOH73zq7aDqAU1yV0P1FFOeRHTAF1tzk",
        //     key_prefix: "Cb1lQyji...",
        //     name: "sza"
        // };

        if (!success) {
            throw new Error(message);
        }

        const normalizedKey = {
            ...api_key,
            created_at: normalizeDate(api_key.created_at),
            expires_at: normalizeDate(api_key.expires_at),
            expirationId,
        };

        onSubmit(normalizedKey);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={`w-full max-w-lg rounded-2xl p-8 shadow-xl ${theme === 'light' ? 'bg-white' : 'bg-textColor-300 text-white'}`}>
                <div className="mb-6 flex items-start justify-between">
                    <h2 className={`text-2xl font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>
                        {isEdit ? "Edit API key" : "Generate new API key"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-gray-400  hover:text-gray-600"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="mb-2 block text-sm text-gray-900">
                        <BaseHeading text="Name (required)" />
                        {/* Name<span className="text-gray-900"> (required)</span> */}
                    </label>
                    <input
                        ref={nameRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Default"
                        className={`w-full rounded-xl ${theme === "light" ? "!border !border-gray-300" : "!border !border-textColor-200/50 bg-textColor-300 text-textColor-100"} font-semibold px-3 py-3 placeholder-gray-400 outline-none focus:border-gray-500`}
                    />
                </div>

                <div className="mb-2">
                    <label className="mb-2 block text-sm text-gray-900">
                        <BaseHeading text="Expiration (required)" />
                        {/* Expiration<span className="text-gray-900"> (required)</span> */}
                    </label>
                    <PillToggle
                        options={EXPIRATION_OPTIONS}
                        value={expirationId}
                        onChange={setExpirationId}
                    />
                </div>

                {expirationId === "custom" && (
                    <div className="mt-3">
                        <input
                            type="date"
                            value={customDate}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className={`rounded-xl ${theme === "light" ? "!border !border-gray-300" : "!border !border-textColor-200/50 bg-textColor-300 text-textColor-100"} font-semibold px-3 py-2 text-sm outline-none focus:border-gray-500`}
                        />
                    </div>
                )}

                <p className="mt-3 text-sm text-gray-500">
                    {expirationId === "never"
                        ? "This key will never expire."
                        : `Expires on: ${expiresOn ? formatDate(expiresOn) : "—"}`}
                </p>

                <div className="mt-8 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className={`rounded-xl px-3 py-2 text-sm font-medium bg-transparent ${theme === 'light' ? "!border !border-gray-300 text-gray-700 hover:border-gray-400" : "!border !border-textColor-200/50 text-textColor-100 hover:border-textColor-100"}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${canSubmit
                            ? "bg-[linear-gradient(90deg,#a99df2,#d992b1)] text-white"
                            : `cursor-not-allowed ${theme === "light" ? "bg-gray-200 text-gray-400" : "bg-textColor-200/30 text-textColor-100"}`}`}
                    >
                        {isEdit ? "Save" : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------- Reveal-new-key modal (shown once, right after creation) ----------

function NewKeyRevealModal({ apiKey, onClose }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(apiKey.key);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard may be unavailable in sandboxed environments; fail silently
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
                <h2 className="mb-2 text-2xl font-medium text-gray-900">API key created</h2>
                <p className="mb-6 text-sm text-gray-500">
                    Copy this key now. For your security, we will not show the full key again.
                </p>
                <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <code className="truncate text-sm text-gray-800">{apiKey.key}</code>
                    <button
                        onClick={handleCopy}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------- Delete confirmation ----------

function DeleteConfirmModal({ name, onCancel, onConfirm }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <h2 className="mb-2 text-xl font-medium text-gray-900">Delete API key</h2>
                <p className="mb-6 text-sm text-gray-500">
                    Are you sure you want to delete <span className="font-medium text-gray-700">{name}</span>?
                    Any application using this key will lose access immediately. This cannot be undone.
                </p>
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:border-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-full bg-red-600 px-8 py-3 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------- Row action menu ----------

function RowMenu({ onDelete }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Row actions"
            >
                <MoreVertical size={18} />
            </button>
            {open && (
                <div className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <button
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ---------- Main component ----------

export default function ApiKeysManager() {
    const { theme, keys, setKeys } = useContext(MainContext);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(false);

    const [createOpen, setCreateOpen] = useState(false);
    const [deletingKey, setDeletingKey] = useState(null); // key object pending delete
    const [revealKey, setRevealKey] = useState(null); // newly created key to show once

    const totalPages = Math.max(1, Math.ceil(keys.length / rowsPerPage));
    const safePage = Math.min(page, totalPages);

    const pageRows = useMemo(() => {
        const start = (safePage - 1) * rowsPerPage;
        return keys.slice(start, start + rowsPerPage);
    }, [keys, safePage, rowsPerPage]);

    const rangeLabel = useMemo(() => {
        if (keys.length === 0) return "0 of 0";
        const start = (safePage - 1) * rowsPerPage + 1;
        const end = Math.min(safePage * rowsPerPage, keys.length);
        return `${start}-${end} of ${keys.length}`;
    }, [keys.length, safePage, rowsPerPage]);

    function normalizeKeyItem(item) {
        return {
            ...item,
            created_at: normalizeDate(item.created_at),
            expires_at: normalizeDate(item.expires_at),
            last_used_at: normalizeDate(item.last_used_at),
        };
    }

    function handleCreate(newKey) {
        setKeys((prev) => [newKey, ...prev]);
        setCreateOpen(false);
        setRevealKey(newKey);
        setPage(1);

        return newKey;
    }

    async function handleDeleteConfirm() {
        try {
            await makeApiRequest(`/api-key/${encodeURIComponent(deletingKey.id)}`, "DELETE");
            setKeys((prev) => prev.filter((k) => k.id !== deletingKey.id));
        } catch (error) {
            console.error("Failed to delete API key:", error);
        } finally {
            setDeletingKey(null);
        }
    }

    useEffect(() => {
        async function loadKeys() {
            setIsLoading(true);
            try {
                const data = await makeApiRequest("/api-key", "GET");
                const rawKeys = data?.api_keys ?? [];
                const allKeys = Array.isArray(rawKeys) ? rawKeys.map(normalizeKeyItem) : [];
                setKeys(allKeys);
            } catch (error) {
                console.error("Failed to load API keys:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadKeys();
    }, [setKeys]);

    return (
        // min-h-screen
        <div className={`w-full p-6 pt-2 sm:p-6 ${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className={`text-xl font-semibold ${theme === "light" ? 'text-textColor-300' : 'text-textColor-100'} ml-0`}>Manage API Keys</h1>
                        <BaseHeading text="Manage the keys used to authenticate your API requests." />
                        {/* <p className="mt-1 text-sm text-gray-500">
                            Manage the keys used to authenticate your API requests.
                        </p> */}
                    </div>
                    <RippleButton cssClasses='px-4 py-2.5 !text-md font-medium' onClick={() => setCreateOpen(true)}>
                        Generate API Key
                    </RippleButton>
                    {/* <button
                        onClick={() => setCreateOpen(true)}
                        className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Create API Key +
                    </button> */}
                </div>

                <div className={`overflow-hidden rounded-2xl  ${theme === 'light' ? '!border !border-gray-200' : '!border !border-textColor-200/50'} shadow-sm`}>
                    <div className={`overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-900'}`}>
                        <table className="w-full min-w-[720px] table-fixed">
                            <thead>
                                <tr className={`text-left text-sm text-gray-500 ${theme === 'light' ? '!border-b !border-b-gray-200' : '!border-b !border-b-textColor-200/50'}`}>
                                    <th className="w-1/5 px-4 py-2 font-medium truncate">Name</th>
                                    <th className="w-1/4 px-4 py-2 font-medium">API key</th>
                                    <th className="w-1/6 px-4 py-2 font-medium">Status</th>
                                    <th className="w-1/6 px-4 py-2 font-medium">Expires</th>
                                    <th className="w-1/6 px-4 py-2 font-medium">Last used</th>
                                    <th className="w-1/6 px-4 py-2 font-medium">Created</th>
                                    <th className="w-10 px-4 py-4" />
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-14 text-center text-sm text-gray-400">
                                            <AnimatedText cssClasses="font-semibold" text='Loading API keys...' />
                                        </td>
                                    </tr>
                                ) : pageRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-14 text-center text-sm text-gray-400">
                                            No API keys yet. Generate one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map((k) => {
                                        const status = computeStatus(k.expires_at);
                                        return (
                                            <tr key={k.id} className={`last:!border-b-0 text-left text-sm ${theme === 'light' ? '!border-b !border-b-gray-200 text-textColor-200' : '!border-b !border-b-textColor-200/50 text-textColor-100'}`}>
                                                <td className="px-6 py-4 font-medium">{k.name}</td>
                                                <td className="px-6 py-4 font-mono">{maskKey(k.key ?? k.key_prefix)}</td>
                                                <td className="px-6 py-4">
                                                    <StatusPill status={status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    {k.expires_at ? formatDate(k.expires_at) : "Never"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {k.last_used_at ? formatDate(k.last_used_at) : "Never used"}
                                                </td>
                                                <td className="px-6 py-4">{formatDate(k.created_at)}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <RowMenu
                                                        onDelete={() => setDeletingKey(k)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={`flex flex-col items-center justify-between gap-3 px-6 py-3 text-sm text-gray-500 sm:flex-row ${theme === 'light' ? '!border-t !border-t-gray-200' : '!border-t !border-t-textColor-200/50'}`}>
                        <div className="flex items-center gap-2">
                            <BaseHeading text="Rows per page:" />
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setPage(1);
                                }}
                                className={`rounded-md  px-2 py-1 text-sm text-gray-700 outline-none ${theme === 'light' ? '!border !border-gray-200' : '!border !border-textColor-200/50 bg-textColor-300 text-textColor-100'}`}
                            >
                                {[5, 10, 25].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <BaseHeading text={rangeLabel} />
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage <= 1}
                                    className={`rounded-md p-1.5 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-gray-50 ${theme === "light" ? '!border !border-textColor-100 text-textColor-300' : '!border !border-gray-200/50 text-textColor-100'}`}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage >= totalPages}
                                    className={`rounded-md p-1.5 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-gray-50 ${theme === "light" ? '!border !border-textColor-100 text-textColor-300' : '!border !border-gray-200/50 text-textColor-100'}`}
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {createOpen && (
                <KeyFormModal
                    mode="create"
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}

            {deletingKey && (
                <DeleteConfirmModal
                    name={deletingKey.name}
                    onCancel={() => setDeletingKey(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}

            {revealKey && (
                <NewKeyRevealModal apiKey={revealKey} onClose={() => setRevealKey(null)} />
            )}
        </div>
    );
}
