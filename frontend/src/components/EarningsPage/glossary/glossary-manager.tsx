import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
} from "@mui/material";
import {
  MenuBook,
  DeleteOutline,
  Add,
  ExpandMore,
  Check,
  Close,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../../../api/fetchWithAuth";

export interface GlossaryEntry {
  id?: number;
  original: string;
  translation: string;
  targetLangs: string[];
}

const DEFAULT_LANGUAGES = [
  "Italiano",
  "Inglese",
  "Francese",
  "Spagnolo",
  "Tedesco",
  "Portoghese",
  "Russo",
  "Cinese",
  "Giapponese",
  "Arabo",
];

export type GlossaryScope = "user" | "company";

const DEFAULT_SCOPE: GlossaryScope = "company";

export async function loadGlossary(
  scope: GlossaryScope = DEFAULT_SCOPE
): Promise<GlossaryEntry[]> {
  try {
    const res = await fetchWithAuth(`/glossary/?scope=${scope}`, {
      method: "GET",
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return Array.isArray(data?.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

export async function saveGlossary(
  entries: GlossaryEntry[],
  scope: GlossaryScope = DEFAULT_SCOPE
): Promise<GlossaryEntry[]> {
  const res = await fetchWithAuth("/glossary/", {
    method: "PUT",
    body: JSON.stringify({ scope, entries }),
  });

  if (!res.ok) {
    throw new Error("Failed to save glossary entries.");
  }

  const data = await res.json();
  return Array.isArray(data?.entries) ? data.entries : [];
}

export async function deleteGlossaryEntry(
  entryId: number,
  scope: GlossaryScope = DEFAULT_SCOPE
): Promise<void> {
  const res = await fetchWithAuth(`/glossary/${entryId}/?scope=${scope}`, {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete glossary entry.");
  }
}

export async function buildGlossaryPrompt(
  targetLang: string,
  scope: GlossaryScope = DEFAULT_SCOPE
): Promise<string> {
  const glossary = await loadGlossary(scope);
  if (glossary.length === 0) return "";

  const relevant = glossary.filter(
    (e) =>
      e.original.trim() &&
      e.targetLangs &&
      (e.targetLangs.includes("Tutte le lingue") ||
        e.targetLangs.includes(targetLang))
  );
  if (relevant.length === 0) return "";

  const lines = relevant.map((e) => {
    const trans = e.translation.trim() || e.original.trim();
    return `- "${e.original}" -> "${trans}"`;
  });

  return `\n\nUsa queste regole di traduzione per i seguenti termini:\n${lines.join("\n")}\nSe un termine ha una traduzione specificata, usala. Se la traduzione e uguale all'originale, non tradurre quel termine.`;
}

interface MultiLangSelectProps {
  selected: string[];
  onChange: (langs: string[]) => void;
  testId: string;
  languages?: string[];
}

function MultiLangSelect({
  selected,
  onChange,
  testId,
  languages = DEFAULT_LANGUAGES,
}: MultiLangSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const glossaryLangOptions = ["Tutte le lingue", ...languages];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isAllSelected = selected.includes("Tutte le lingue");

  const toggle = (lang: string) => {
    if (lang === "Tutte le lingue") {
      onChange(isAllSelected ? [] : ["Tutte le lingue"]);
      return;
    }
    const without = selected.filter((l) => l !== "Tutte le lingue");
    const next = without.includes(lang)
      ? without.filter((l) => l !== lang)
      : [...without, lang];
    onChange(next);
  };

  const label = isAllSelected
    ? "Tutte le lingue"
    : selected.length === 0
      ? "Seleziona lingue"
      : selected.length <= 2
        ? selected.join(", ")
        : `${selected.length} lingue`;

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          height: "34px",
          width: "100%",
          padding: "0 12px",
          fontSize: "14px",
          border: "1px solid #d1d5db",
          borderRadius: "7px",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
          textAlign: "left",
          color: "#111827",
          cursor: "pointer",
        }}
        data-testid={testId}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <ExpandMore sx={{ fontSize: 18, color: "#6b7280", flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            zIndex: 50,
            marginTop: "4px",
            width: "100%",
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "7px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
            padding: "4px 0",
            maxHeight: "208px",
            overflow: "auto",
          }}
        >
          {glossaryLangOptions.map((lang) => {
            const checked =
              lang === "Tutte le lingue" ? isAllSelected : selected.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggle(lang)}
                style={{
                  width: "100%",
                  padding: "7px 12px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
                data-testid={`${testId}-option-${lang}`}
              >
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    border: checked ? "1px solid #2563eb" : "1px solid #d1d5db",
                    background: checked ? "#2563eb" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {checked && <Check sx={{ fontSize: 12, color: "#ffffff" }} />}
                </span>
                <span>{lang}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface GlossaryModalProps {
  open: boolean;
  onClose: () => void;
  scope?: GlossaryScope;
  languages?: string[];
}

export function GlossaryModal({
  open,
  onClose,
  scope = DEFAULT_SCOPE,
  languages = DEFAULT_LANGUAGES,
}: GlossaryModalProps) {
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchEntries = async () => {
      if (!open) return;

      const loaded = await loadGlossary(scope);
      const migrated = loaded.map((e) => ({
        id: e.id,
        original: e.original || "",
        translation: e.translation || "",
        targetLangs: Array.isArray(e.targetLangs) && e.targetLangs.length > 0
            ? e.targetLangs
              : ["Tutte le lingue"],
      }));

      if (mounted) {
        setEntries(migrated);
      }
    };

    void fetchEntries();
    return () => {
      mounted = false;
    };
  }, [open, scope]);

  const addRow = () => {
    setEntries((prev) => [
      ...prev,
      { original: "", translation: "", targetLangs: ["Tutte le lingue"] },
    ]);
  };

  const updateEntry = (
    index: number,
    field: "original" | "translation",
    value: string
  ) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const updateEntryLangs = (index: number, langs: string[]) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, targetLangs: langs } : e))
    );
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const cleaned = entries.filter((e) => e.original.trim());
    setIsSaving(true);
    try {
      await saveGlossary(cleaned, scope);
      toast.success("Glossario salvato");
      onClose();
    } catch (error) {
      console.error("Errore salvataggio glossario:", error);
      toast.error("Errore nel salvataggio del glossario");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent
        sx={{
          maxWidth: "100vw",
          minHeight: "30vw",
          p: "18px 18px 14px 18px",
          borderRadius: "0px",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, color: "#6b7280" }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>

        <Box>
          <DialogTitle
            sx={{
              p: 0,
              fontSize: "16px",
              lineHeight: 1.1,
              fontWeight: 700,
              color: "#111827",
              mb: 0.5,
            }}
          >
            Glossario personalizzato
          </DialogTitle>
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              lineHeight: 1.25,
              color: "#6b7280",
            }}
          >
            Definisci come tradurre o mantenere invariati termini specifici durante
            la traduzione
          </p>
        </Box>

        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 190px 28px",
              gap: "10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#6b7280",
              padding: "0 2px",
              marginBottom: "8px",
            }}
          >
            <span>Termine originale</span>
            <span>Traduzione desiderata</span>
            <span>Lingua target</span>
            <span></span>
          </div>

          {entries.map((entry, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 190px 28px",
                gap: "10px",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <input
                type="text"
                value={entry.original}
                onChange={(e) => updateEntry(i, "original", e.target.value)}
                placeholder="es. EBITDA"
                style={{
                  height: "34px",
                  padding: "0 12px",
                  fontSize: "14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  background: "#ffffff",
                  color: "#111827",
                  outline: "none",
                }}
                data-testid={`glossary-original-${i}`}
              />
              <input
                type="text"
                value={entry.translation}
                onChange={(e) => updateEntry(i, "translation", e.target.value)}
                placeholder="es. EBITDA"
                style={{
                  height: "34px",
                  padding: "0 12px",
                  fontSize: "14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  background: "#ffffff",
                  color: "#111827",
                  outline: "none",
                }}
                data-testid={`glossary-translation-${i}`}
              />
              <MultiLangSelect
                selected={entry.targetLangs}
                onChange={(langs) => updateEntryLangs(i, langs)}
                testId={`glossary-lang-${i}`}
                languages={languages}
              />
              <button
                onClick={() => removeEntry(i)}
                style={{
                  width: "28px",
                  height: "28px",
                  border: "none",
                  background: "transparent",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                data-testid={`glossary-delete-${i}`}
              >
                <DeleteOutline sx={{ fontSize: 18 }} />
              </button>
            </div>
          ))}

          <button
            onClick={addRow}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#2563eb",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              marginTop: "2px",
              padding: 0,
            }}
            data-testid="button-add-glossary-term"
          >
            <Add sx={{ fontSize: 20 }} />
            Aggiungi termine
          </button>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "18px",
            right: "18px",
          }}
        >
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              height: "36px",
              padding: "0 22px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#ffffff",
              backgroundColor: "#f97316",
              border: "none",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.7 : 1,
            }}
            data-testid="button-save-glossary"
          >
            {isSaving ? "Salvando..." : "Salva"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GlossaryButtonProps {
  onClick: () => void;
  className?: string;
}

export function GlossaryButton({
  onClick,
  className = "",
}: GlossaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        height: "34px",
        padding: "0 14px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        border: "1px solid #d1d5db",
        color: "#4b5563",
        background: "#f8fafc",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        cursor: "pointer",
      }}
      data-testid="button-glossary"
    >
      <MenuBook sx={{ fontSize: 18 }} />
      Glossario
    </button>
  );
}
