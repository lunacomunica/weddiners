"use client";

import { useState, useOptimistic, useTransition } from "react";
import { CATEGORIES, PHASE_LABELS } from "./checklistData";
import { toggleChecklistItem, createChecklistItem, deleteChecklistItem } from "./actions";

type DBItem = {
  id: string;
  title: string;
  category: string;
  months_before: number;
  done: boolean;
  tip: string | null;
  is_default: boolean;
};

type CustomCategory = { id: string; label: string; color: string; bg: string };

type Filter = "all" | "pending" | "done";
type View = "fase" | "categoria";

const PALETTE = [
  { color: "#7A8C6A", bg: "#F0F4ED" },
  { color: "#C4704A", bg: "#FAF0EA" },
  { color: "#1B3A5C", bg: "#EEF3F8" },
  { color: "#7B6BA8", bg: "#F5F3FB" },
  { color: "#C4707A", bg: "#FDF3F4" },
  { color: "#5A7A6A", bg: "#EDF4F0" },
  { color: "#A0729A", bg: "#F8F3F8" },
  { color: "#2A6A8C", bg: "#EAF4FA" },
  { color: "#8C8C8C", bg: "#F5F5F5" },
  { color: "#B5892A", bg: "#FBF6EA" },
];

export function ChecklistView({ initialItems }: { initialItems: DBItem[] }) {
  const [optimisticItems, updateOptimistic] = useOptimistic(
    initialItems,
    (state, { id, done }: { id: string; done: boolean }) =>
      state.map(i => i.id === id ? { ...i, done } : i)
  );
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("fase");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("outros");
  const [newItemPhase, setNewItemPhase] = useState<number>(6);
  const [addingPhase, setAddingPhase] = useState<number | null>(null);
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Categorias customizadas (salvas em localStorage por agora)
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("weddiners_custom_cats") ?? "[]"); } catch { return []; }
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState(0);

  const allCategories = [...CATEGORIES, ...customCategories];

  function saveCustomCategories(cats: CustomCategory[]) {
    setCustomCategories(cats);
    localStorage.setItem("weddiners_custom_cats", JSON.stringify(cats));
  }

  function handleCreateCategory() {
    if (!newCatLabel.trim()) return;
    const palette = PALETTE[newCatColor];
    const id = newCatLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + Date.now();
    const newCat: CustomCategory = { id, label: newCatLabel.trim(), ...palette };
    saveCustomCategories([...customCategories, newCat]);
    setNewCatLabel("");
    setCreatingCategory(false);
  }

  function handleDeleteCategory(id: string) {
    if (!confirm("Excluir esta categoria? As tarefas dela serão mantidas em 'Outros'.")) return;
    saveCustomCategories(customCategories.filter(c => c.id !== id));
  }

  const done = optimisticItems.filter(i => i.done).length;
  const total = optimisticItems.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  function handleToggle(id: string, currentDone: boolean) {
    startTransition(async () => {
      updateOptimistic({ id, done: !currentDone });
      await toggleChecklistItem(id, !currentDone);
    });
  }

  async function handleAddItemToPhase(monthsBefore: number) {
    if (!newItemTitle.trim()) return;
    setSaving(true);
    await createChecklistItem(newItemTitle.trim(), newItemCategory, monthsBefore);
    setNewItemTitle("");
    setAddingPhase(null);
    setSaving(false);
  }

  async function handleAddItemToCategory(categoryId: string) {
    if (!newItemTitle.trim()) return;
    setSaving(true);
    await createChecklistItem(newItemTitle.trim(), categoryId, newItemPhase);
    setNewItemTitle("");
    setAddingCategory(null);
    setSaving(false);
  }

  const filteredItems = optimisticItems.filter(i =>
    filter === "all" ? true : filter === "done" ? i.done : !i.done
  );

  const phases = [12, 9, 6, 3, 1, 0];
  const byPhase = phases.map(p => ({
    phase: p,
    label: PHASE_LABELS[p],
    items: filteredItems.filter(i => i.months_before === p),
    total: optimisticItems.filter(i => i.months_before === p).length,
    done: optimisticItems.filter(i => i.months_before === p && i.done).length,
  }));

  const byCategory = allCategories.map(cat => ({
    ...cat,
    items: filteredItems.filter(i => i.category === cat.id),
    total: optimisticItems.filter(i => i.category === cat.id).length,
    done: optimisticItems.filter(i => i.category === cat.id && i.done).length,
  })).filter(cat => cat.total > 0 || customCategories.some(c => c.id === cat.id));

  return (
    <div className="max-w-4xl">
      {/* Progress hero */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-3xl font-semibold text-neutral-800 font-display">{pct}%</p>
            <p className="text-sm text-neutral-500 mt-0.5">{done} de {total} tarefas concluídas</p>
          </div>
          <p className="text-sm text-neutral-400">
            {total - done} {total - done === 1 ? "tarefa pendente" : "tarefas pendentes"}
          </p>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7A8C6A, #A8BC98)" }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {byCategory.filter(c => c.total > 0).map(cat => (
            <div key={cat.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: cat.bg, color: cat.color }}>
              <span>{cat.label}</span>
              <span className="opacity-60">{cat.done}/{cat.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex bg-neutral-100 rounded-lg p-1 gap-1">
          {(["fase", "categoria"] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={["px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                view === v ? "bg-white shadow-sm text-neutral-800" : "text-neutral-500 hover:text-neutral-700"
              ].join(" ")}
            >
              Por {v}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "done"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={["px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                filter === f ? "bg-moss text-white border-moss" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
              ].join(" ")}
            >
              {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : "Concluídas"}
            </button>
          ))}
        </div>
      </div>

      {/* Phase view */}
      {view === "fase" ? (
        <div className="space-y-6">
          {byPhase.map(({ phase, label, items: phaseItems, total: phTotal, done: phDone }) => {
            if (phTotal === 0) return null;
            const phasePct = Math.round((phDone / phTotal) * 100);
            const isComplete = phDone === phTotal;
            return (
              <div key={phase} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <div className={["px-5 py-4 flex items-center justify-between border-b", isComplete ? "bg-sage/5 border-sage/20" : "border-neutral-100"].join(" ")}>
                  <div className="flex items-center gap-3">
                    {isComplete && (
                      <div className="w-5 h-5 rounded-full bg-sage flex items-center justify-center">
                        <svg width="11" height="11" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <h3 className="font-semibold text-neutral-700 text-sm">{label}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">{phDone}/{phTotal}</span>
                    <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${phasePct}%` }} />
                    </div>
                  </div>
                </div>

                {phaseItems.length > 0 ? (
                  <ul className="divide-y divide-neutral-50">
                    {phaseItems.map(item => (
                      <ChecklistRow
                        key={item.id}
                        item={item}
                        allCategories={allCategories}
                        onToggle={() => handleToggle(item.id, item.done)}
                        onDelete={() => deleteChecklistItem(item.id)}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-3 text-sm text-neutral-400 italic">
                    {filter === "pending" ? "Nenhuma tarefa pendente nessa fase 🎉" : "Nenhuma tarefa concluída ainda"}
                  </p>
                )}

                {addingPhase === phase ? (
                  <div className="px-5 py-3 border-t border-neutral-100 flex gap-2 flex-wrap">
                    <input
                      autoFocus
                      value={newItemTitle}
                      onChange={e => setNewItemTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddItemToPhase(phase); if (e.key === "Escape") setAddingPhase(null); }}
                      placeholder="Nome da tarefa..."
                      className="flex-1 min-w-0 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                    />
                    <select
                      value={newItemCategory}
                      onChange={e => setNewItemCategory(e.target.value)}
                      className="text-sm border border-neutral-200 rounded-lg px-2 py-2 focus:outline-none text-neutral-600"
                    >
                      {allCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <button onClick={() => handleAddItemToPhase(phase)} disabled={saving} className="btn-primary">
                      {saving ? "..." : "Adicionar"}
                    </button>
                    <button onClick={() => setAddingPhase(null)} className="text-neutral-400 hover:text-neutral-600 px-2">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingPhase(phase)}
                    className="w-full px-5 py-2.5 text-left text-xs text-neutral-400 hover:text-sage hover:bg-neutral-50 transition-colors flex items-center gap-1.5 border-t border-neutral-50"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Adicionar tarefa nesta fase
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Category view */
        <div className="space-y-6">
          {byCategory.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                  <h3 className="font-semibold text-neutral-700 text-sm">{cat.label}</h3>
                  {customCategories.some(c => c.id === cat.id) && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-neutral-300 hover:text-red-400 transition-colors ml-1"
                      title="Excluir categoria"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
                {cat.total > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">{cat.done}/{cat.total}</span>
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: cat.bg }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((cat.done / cat.total) * 100)}%`, background: cat.color }} />
                    </div>
                  </div>
                )}
              </div>

              {cat.items.length > 0 ? (
                <ul className="divide-y divide-neutral-50">
                  {cat.items.map(item => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                      allCategories={allCategories}
                      onToggle={() => handleToggle(item.id, item.done)}
                      onDelete={() => deleteChecklistItem(item.id)}
                      showPhase
                    />
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-3 text-sm text-neutral-400 italic">
                  {filter === "pending" ? "Tudo concluído nessa categoria 🎉" : "Nenhuma tarefa ainda"}
                </p>
              )}

              {/* Adicionar tarefa na categoria */}
              {addingCategory === cat.id ? (
                <div className="px-5 py-3 border-t border-neutral-100 flex gap-2 flex-wrap">
                  <input
                    autoFocus
                    value={newItemTitle}
                    onChange={e => setNewItemTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddItemToCategory(cat.id); if (e.key === "Escape") setAddingCategory(null); }}
                    placeholder="Nome da tarefa..."
                    className="flex-1 min-w-0 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                  />
                  <select
                    value={newItemPhase}
                    onChange={e => setNewItemPhase(Number(e.target.value))}
                    className="text-sm border border-neutral-200 rounded-lg px-2 py-2 focus:outline-none text-neutral-600"
                  >
                    {phases.map(p => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
                  </select>
                  <button onClick={() => handleAddItemToCategory(cat.id)} disabled={saving} className="btn-primary">
                    {saving ? "..." : "Adicionar"}
                  </button>
                  <button onClick={() => setAddingCategory(null)} className="text-neutral-400 hover:text-neutral-600 px-2">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingCategory(cat.id); setNewItemTitle(""); }}
                  className="w-full px-5 py-2.5 text-left text-xs text-neutral-400 hover:text-sage hover:bg-neutral-50 transition-colors flex items-center gap-1.5 border-t border-neutral-50"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Adicionar tarefa nesta categoria
                </button>
              )}
            </div>
          ))}

          {/* Criar nova categoria */}
          {creatingCategory ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <p className="text-sm font-semibold text-neutral-700 mb-4">Nova categoria</p>
              <div className="space-y-4">
                <input
                  autoFocus
                  value={newCatLabel}
                  onChange={e => setNewCatLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreateCategory(); if (e.key === "Escape") setCreatingCategory(false); }}
                  placeholder="Nome da categoria..."
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
                />
                <div>
                  <p className="text-xs text-neutral-400 mb-2">Cor</p>
                  <div className="flex gap-2 flex-wrap">
                    {PALETTE.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setNewCatColor(i)}
                        className={["w-7 h-7 rounded-full border-2 transition-all", newCatColor === i ? "border-neutral-800 scale-110" : "border-transparent"].join(" ")}
                        style={{ background: p.color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateCategory} className="btn-primary">Criar categoria</button>
                  <button onClick={() => setCreatingCategory(false)} className="text-neutral-400 hover:text-neutral-600 px-3 text-sm">Cancelar</button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreatingCategory(true)}
              className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-2xl text-sm text-neutral-400 hover:border-sage hover:text-sage transition-colors flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Nova categoria
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ChecklistRow({
  item, allCategories, onToggle, onDelete, showPhase,
}: {
  item: DBItem;
  allCategories: { id: string; label: string; color: string; bg: string }[];
  onToggle: () => void;
  onDelete: () => void;
  showPhase?: boolean;
}) {
  const cat = allCategories.find(c => c.id === item.category);

  return (
    <li className="flex items-start gap-3 px-5 py-3.5 hover:bg-neutral-50/70 transition-colors group">
      <button
        onClick={onToggle}
        className={[
          "mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all",
          item.done ? "bg-sage border-sage" : "border-neutral-300 group-hover:border-sage/60"
        ].join(" ")}
      >
        {item.done && (
          <svg width="11" height="11" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
        <p className={["text-sm font-medium transition-colors", item.done ? "line-through text-neutral-400" : "text-neutral-700"].join(" ")}>
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {showPhase && <span className="text-xs text-neutral-400">{PHASE_LABELS[item.months_before]}</span>}
          {item.tip && (
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              {showPhase && <span className="text-neutral-200">·</span>}
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {item.tip}
            </span>
          )}
        </div>
      </div>

      {cat && (
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium" style={{ background: cat.bg, color: cat.color }}>
          {cat.label}
        </span>
      )}

      {!item.is_default && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-red-400 transition-all"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </li>
  );
}
