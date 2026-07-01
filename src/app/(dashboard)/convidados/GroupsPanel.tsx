"use client";

import { useState } from "react";
import { createGuestGroup, deleteGuestGroup, assignGuestToGroup, renameGuestGroup } from "./actions";

interface Guest {
  id: string;
  name: string;
  guest_type: "adulto" | "crianca" | null;
  child_age: number | null;
  group_id: string | null;
}

interface Group {
  id: string;
  name: string;
  token: string;
  pin: string | null;
}

interface Props {
  groups: Group[];
  guests: Guest[];
  slug: string;
}

export function GroupsPanel({ groups: initialGroups, guests: initialGuests, slug }: Props) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [assigningGuest, setAssigningGuest] = useState<string | null>(null); // groupId
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [addingMultiple, setAddingMultiple] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [guestSearch, setGuestSearch] = useState("");

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    setCreating(true);
    const result = await createGuestGroup(newGroupName.trim());
    if (result?.group) {
      setGroups(prev => [...prev, result.group]);
      setNewGroupName("");
    }
    setCreating(false);
  }

  async function handleDeleteGroup(id: string) {
    if (!confirm("Excluir este grupo? Os convidados não serão removidos.")) return;
    await deleteGuestGroup(id);
    setGroups(prev => prev.filter(g => g.id !== id));
    setGuests(prev => prev.map(g => g.group_id === id ? { ...g, group_id: null } : g));
  }

  async function handleAssign(guestId: string, groupId: string | null) {
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, group_id: groupId } : g));
    await assignGuestToGroup(guestId, groupId);
    setAssigningGuest(null);
  }

  async function handleRename(groupId: string) {
    if (!renameValue.trim()) return;
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: renameValue.trim() } : g));
    await renameGuestGroup(groupId, renameValue.trim());
    setRenamingGroup(null);
    setRenameValue("");
  }

  async function handleAssignMultiple(groupId: string) {
    if (selectedGuests.length === 0) return;
    setAddingMultiple(true);
    setGuests(prev => prev.map(g => selectedGuests.includes(g.id) ? { ...g, group_id: groupId } : g));
    await Promise.all(selectedGuests.map(id => assignGuestToGroup(id, groupId)));
    setSelectedGuests([]);
    setAssigningGuest(null);
    setAddingMultiple(false);
  }

  function toggleGuestSelection(guestId: string) {
    setSelectedGuests(prev =>
      prev.includes(guestId) ? prev.filter(id => id !== guestId) : [...prev, guestId]
    );
  }

  function copyGroupLink(token: string) {
    const url = `${window.location.origin}/${slug}/rsvp/group?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  function copyGroupPin(pin: string, groupId: string) {
    navigator.clipboard.writeText(pin);
    setCopiedPin(groupId);
    setTimeout(() => setCopiedPin(null), 2000);
  }

  const ungrouped = guests.filter(g => !g.group_id);

  return (
    <div className="space-y-4">

      {/* Criar grupo */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h3 className="font-semibold text-neutral-800 text-sm mb-3">Novo grupo / família</h3>
        <div className="flex gap-2">
          <input
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateGroup()}
            placeholder="Ex: Família da noiva, Amigos do noivo..."
            className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage font-body"
          />
          <button
            onClick={handleCreateGroup}
            disabled={creating || !newGroupName.trim()}
            className="btn-primary disabled:opacity-40 shrink-0"
          >
            {creating ? "..." : "Criar"}
          </button>
        </div>
      </div>

      {/* Lista de grupos */}
      {groups.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-neutral-200">
          <p className="text-2xl mb-2">👨‍👩‍👧‍👦</p>
          <p className="text-neutral-500 font-body text-sm">Crie grupos para gerar links de confirmação por família.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => {
            const membros = guests.filter(g => g.group_id === group.id);
            const isExpanded = expandedGroup === group.id;
            const copied = copiedToken === group.token;

            return (
              <div key={group.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                {/* Header do grupo */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="w-8 h-8 bg-sage/10 rounded-full flex items-center justify-center shrink-0">
                      <svg width="14" height="14" fill="none" stroke="#7A8C6A" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      {renamingGroup === group.id ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") handleRename(group.id);
                              if (e.key === "Escape") { setRenamingGroup(null); setRenameValue(""); }
                            }}
                            className="border border-sage/40 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 font-body"
                          />
                          <button onClick={() => handleRename(group.id)} className="text-xs text-sage font-medium hover:underline">Salvar</button>
                          <button onClick={() => { setRenamingGroup(null); setRenameValue(""); }} className="text-xs text-neutral-400 hover:text-neutral-600">✕</button>
                        </div>
                      ) : (
                        <p className="font-semibold text-neutral-800 text-sm">{group.name}</p>
                      )}
                      <p className="text-xs text-neutral-400">
                        {membros.length} {membros.length === 1 ? "pessoa" : "pessoas"}
                        {membros.filter(m => m.guest_type === "crianca").length > 0
                          ? ` · ${membros.filter(m => m.guest_type === "crianca").length} criança(s)` : ""}
                      </p>
                    </div>
                  </button>

                  {/* PIN badge */}
                  {group.pin && (
                    <button
                      onClick={() => copyGroupPin(group.pin!, group.id)}
                      className={["flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all shrink-0", copiedPin === group.id ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-sage hover:text-sage"].join(" ")}
                      title="Copiar PIN"
                    >
                      {copiedPin === group.id ? "✓ Copiado" : `PIN: ${group.pin}`}
                    </button>
                  )}

                  {/* Ações */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setRenamingGroup(group.id); setRenameValue(group.name); setExpandedGroup(group.id); }}
                      className="p-1.5 text-neutral-300 hover:text-sage transition-colors rounded-lg"
                      title="Renomear grupo"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => copyGroupLink(group.token)}
                      className={["flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", copied ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "border-neutral-200 text-neutral-500 hover:border-sage hover:text-sage"].join(" ")}
                      title="Copiar link de confirmação"
                    >
                      {copied ? (
                        <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg> Copiado!</>
                      ) : (
                        <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/></svg> Copiar link</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1.5 text-neutral-300 hover:text-red-400 transition-colors rounded-lg"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Membros expandidos */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 px-5 py-4 space-y-2 bg-neutral-50/50">
                    {membros.length === 0 && (
                      <p className="text-xs text-neutral-400 font-body text-center py-2">Nenhum convidado neste grupo ainda.</p>
                    )}
                    {membros.map(g => (
                      <div key={g.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-neutral-100">
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{g.name}</p>
                          <p className="text-xs text-neutral-400">{g.guest_type === "crianca" ? `👶 Criança${g.child_age != null ? ` · ${g.child_age} anos` : ""}` : "🧑 Adulto"}</p>
                        </div>
                        <button
                          onClick={() => handleAssign(g.id, null)}
                          className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    ))}

                    {/* Adicionar convidado ao grupo */}
                    <div className="pt-1">
                      {assigningGuest === group.id ? (
                        <div className="space-y-1">
                          {/* Busca */}
                          <div className="relative mb-2">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                            </svg>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Buscar convidado..."
                              value={guestSearch}
                              onChange={e => setGuestSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage font-body"
                            />
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-neutral-500 font-body">Selecione quem adicionar:</p>
                            {ungrouped.length > 0 && (
                              <button
                                onClick={() => {
                                  const filtered = ungrouped.filter(g => g.name.toLowerCase().includes(guestSearch.toLowerCase()));
                                  const filteredIds = filtered.map(g => g.id);
                                  const allSelected = filteredIds.every(id => selectedGuests.includes(id));
                                  setSelectedGuests(allSelected
                                    ? selectedGuests.filter(id => !filteredIds.includes(id))
                                    : Array.from(new Set([...selectedGuests, ...filteredIds]))
                                  );
                                }}
                                className="text-xs text-sage hover:underline"
                              >
                                {ungrouped.filter(g => g.name.toLowerCase().includes(guestSearch.toLowerCase())).every(g => selectedGuests.includes(g.id)) && ungrouped.filter(g => g.name.toLowerCase().includes(guestSearch.toLowerCase())).length > 0
                                  ? "Desmarcar todos"
                                  : "Selecionar todos"}
                              </button>
                            )}
                          </div>
                          {ungrouped.filter(g => g.name.toLowerCase().includes(guestSearch.toLowerCase())).map(g => (
                            <label
                              key={g.id}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sage/10 text-sm text-neutral-700 transition-colors cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedGuests.includes(g.id)}
                                onChange={() => toggleGuestSelection(g.id)}
                                className="accent-sage w-4 h-4 shrink-0"
                              />
                              <span>{g.guest_type === "crianca" ? "👶" : "🧑"}</span>
                              {g.name}
                            </label>
                          ))}
                          {ungrouped.filter(g => g.name.toLowerCase().includes(guestSearch.toLowerCase())).length === 0 && (
                            <p className="text-xs text-neutral-400 text-center py-2">
                              {ungrouped.length === 0 ? "Todos os convidados já estão em grupos." : "Nenhum resultado para a busca."}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleAssignMultiple(group.id)}
                              disabled={selectedGuests.length === 0 || addingMultiple}
                              className="btn-primary text-xs py-1.5 px-4 disabled:opacity-40"
                            >
                              {addingMultiple ? "Adicionando..." : `Adicionar${selectedGuests.length > 0 ? ` (${selectedGuests.length})` : ""}`}
                            </button>
                            <button
                              onClick={() => { setAssigningGuest(null); setSelectedGuests([]); setGuestSearch(""); }}
                              className="text-xs text-neutral-400 hover:text-neutral-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAssigningGuest(group.id); setSelectedGuests([]); setGuestSearch(""); }}
                          className="w-full border border-dashed border-neutral-200 rounded-lg py-2 text-xs text-neutral-400 hover:border-sage hover:text-sage transition-colors flex items-center justify-center gap-1"
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Adicionar convidado ao grupo
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sem grupo */}
      {ungrouped.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
          <p className="text-xs font-medium text-amber-700 mb-1">{ungrouped.length} convidado{ungrouped.length > 1 ? "s" : ""} sem grupo</p>
          <p className="text-xs text-amber-600 font-body">Expanda um grupo acima para adicionar.</p>
        </div>
      )}
    </div>
  );
}
