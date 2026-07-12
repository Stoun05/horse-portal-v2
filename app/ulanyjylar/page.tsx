"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import {
  Eye,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type UserRole = "Admin" | "Operator" | "Weterinar" | "Gözegçi";
type UserStatus = "Işjeň" | "Passiw";

type PortalUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin: string;
};

type UserForm = Omit<PortalUser, "id" | "createdAt" | "lastLogin">;

const STORAGE_KEY = "horse-portal-users-v1";
const emptyForm: UserForm = {
  name: "",
  email: "",
  phone: "",
  role: "Gözegçi",
  status: "Işjeň",
};

const rolePermissions: Record<UserRole, string[]> = {
  Admin: ["Ähli bölümleri dolandyrmak", "Ulanyjy goşmak we üýtgetmek", "Hasabat we eksport"],
  Operator: ["At maglumatlaryny dolandyrmak", "Media goşmak we pozmak", "Hasabatlary görmek"],
  Weterinar: ["Saglyk taryhyny dolandyrmak", "Waksina we bejergi ýazgylary", "At maglumatlaryny görmek"],
  Gözegçi: ["Maglumatlary görmek", "Gözleg we süzgüç", "Üýtgetmek gadagan"],
};

export default function UlanyjylarPage() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Ähli" | UserRole>("Ähli");
  const [statusFilter, setStatusFilter] = useState<"Ähli" | UserStatus>("Ähli");
  const [formOpen, setFormOpen] = useState(false);
  const [profile, setProfile] = useState<PortalUser | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setUsers(JSON.parse(saved) as PortalUser[]);
    } catch {
      setUsers([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [hydrated, users]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tk");
    return users.filter((user) => {
      const matchesQuery =
        !normalized ||
        [user.name, user.email, user.phone, user.role]
          .join(" ")
          .toLocaleLowerCase("tk")
          .includes(normalized);
      const matchesRole = roleFilter === "Ähli" || user.role === roleFilter;
      const matchesStatus = statusFilter === "Ähli" || user.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (user: PortalUser) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setProfile(null);
    setFormOpen(true);
  };

  const saveUser = (event: FormEvent) => {
    event.preventDefault();
    const duplicate = users.some(
      (user) => user.email.toLocaleLowerCase() === form.email.toLocaleLowerCase() && user.id !== editingId
    );
    if (duplicate) {
      window.alert("Bu email bilen ulanyjy eýýäm bar.");
      return;
    }

    if (editingId) {
      setUsers((current) =>
        current.map((user) => (user.id === editingId ? { ...user, ...form } : user))
      );
    } else {
      setUsers((current) => [
        {
          id: crypto.randomUUID(),
          ...form,
          createdAt: new Date().toISOString(),
          lastLogin: "",
        },
        ...current,
      ]);
    }
    setFormOpen(false);
  };

  const deleteUser = (user: PortalUser) => {
    if (window.confirm(`${user.name} atly ulanyjyny pozmalymy?`)) {
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (profile?.id === user.id) setProfile(null);
    }
  };

  const toggleStatus = (user: PortalUser) => {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? { ...item, status: item.status === "Işjeň" ? "Passiw" : "Işjeň" }
          : item
      )
    );
  };

  const activeCount = users.filter((user) => user.status === "Işjeň").length;
  const adminCount = users.filter((user) => user.role === "Admin").length;
  const operatorCount = users.filter((user) => user.role === "Operator").length;

  return (
    <div className="min-h-screen bg-[#f4f7f5] lg:flex">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1 border-x-0 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]">
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-black text-[#082f24] lg:text-4xl">Ulanyjylar</h1>
              <p className="mt-2 font-medium text-slate-600">
                Ulgamyň ulanyjylaryny, rollaryny we işjeňlik ýagdaýlaryny dolandyryň.
              </p>
            </div>
            <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white hover:bg-[#08462d]">
              <UserPlus size={18} /> Täze ulanyjy
            </button>
          </header>

          <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={<Users />} title="Jemi ulanyjy" value={users.length} />
            <Stat icon={<UserCheck />} title="Işjeň ulanyjy" value={activeCount} />
            <Stat icon={<ShieldCheck />} title="Adminler" value={adminCount} />
            <Stat icon={<Users />} title="Operatorlar" value={operatorCount} />
          </section>

          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_260px_260px]">
              <label className="relative block">
                <span className="sr-only">Ulanyjy gözle</span>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ady, emaili ýa-da telefon belgisi boýunça gözle..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "Ähli" | UserRole)} className={inputClass}>
                <option value="Ähli">Ähli rollar</option>
                <option>Admin</option><option>Operator</option><option>Weterinar</option><option>Gözegçi</option>
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "Ähli" | UserStatus)} className={inputClass}>
                <option value="Ähli">Ähli ýagdaýlar</option>
                <option>Işjeň</option><option>Passiw</option>
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-2xl font-black text-[#082f24]">Ulanyjy sanawy</h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">{filteredUsers.length} ulanyjy görkezilýär</p>
              </div>
            </div>

            {!hydrated ? (
              <p className="p-12 text-center font-semibold text-slate-600">Maglumatlar ýüklenýär...</p>
            ) : filteredUsers.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm text-slate-950">
                  <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-700">
                    <tr>
                      <th className="px-5 py-4">Ulanyjy</th><th className="px-5 py-4">Rol</th>
                      <th className="px-5 py-4">Telefon</th><th className="px-5 py-4">Ýagdaýy</th>
                      <th className="px-5 py-4">Döredilen</th><th className="px-5 py-4">Soňky giriş</th>
                      <th className="px-5 py-4">Hereket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b5e3c] font-black text-white">
                              {initials(user.name)}
                            </div>
                            <div>
                              <p className="font-black text-[#082f24]">{user.name}</p>
                              <p className="text-xs font-medium text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                        <td className="px-5 py-4">{user.phone || "Maglumat ýok"}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => toggleStatus(user)} title="Ýagdaýyny üýtget">
                            <StatusBadge status={user.status} />
                          </button>
                        </td>
                        <td className="px-5 py-4">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-4">{user.lastLogin ? formatDate(user.lastLogin) : "Entek girmedi"}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <ActionButton label="Gör" onClick={() => setProfile(user)}><Eye size={17} /></ActionButton>
                            <ActionButton label="Üýtget" onClick={() => openEdit(user)}><Pencil size={17} /></ActionButton>
                            <ActionButton label="Poz" danger onClick={() => deleteUser(user)}><Trash2 size={17} /></ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <Users className="mx-auto text-emerald-700" size={48} />
                <h3 className="mt-4 text-2xl font-black text-slate-950">
                  {users.length ? "Gözlege laýyk ulanyjy tapylmady" : "Ulanyjy ýok"}
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-slate-600">
                  {users.length
                    ? "Gözleg sözüni ýa-da süzgüçleri üýtgediň."
                    : "Demo ulanyjylar aýryldy. Ilkinji hakyky ulanyjyny goşuň."}
                </p>
                {!users.length && (
                  <button onClick={openCreate} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0b5e3c] px-5 py-3 font-bold text-white">
                    <UserPlus size={18} /> Ilkinji ulanyjyny goş
                  </button>
                )}
              </div>
            )}
          </section>

          <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(Object.keys(rolePermissions) as UserRole[]).map((role) => (
              <article key={role} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#082f24]">{role}</h3>
                  <span className="text-2xl font-black text-[#0b5e3c]">{users.filter((user) => user.role === role).length}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {rolePermissions[role].map((permission) => (
                    <li key={permission} className="flex gap-2 text-sm font-medium text-slate-600">
                      <span className="text-emerald-700">✓</span>{permission}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </main>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-2xl font-black text-[#082f24]">{editingId ? "Ulanyjyny üýtget" : "Täze ulanyjy"}</h2>
                <p className="text-sm text-slate-600">Şahsy maglumatlary we ulgam roluny giriziň.</p>
              </div>
              <button onClick={() => setFormOpen(false)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><X /></button>
            </div>
            <form onSubmit={saveUser} className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Doly ady">
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ady we familiýasy" className={inputClass} />
              </Field>
              <Field label="Email">
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="ulanyjy@example.com" className={inputClass} />
              </Field>
              <Field label="Telefon">
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+993 ..." className={inputClass} />
              </Field>
              <Field label="Rol">
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })} className={inputClass}>
                  <option>Admin</option><option>Operator</option><option>Weterinar</option><option>Gözegçi</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Ýagdaýy">
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })} className={inputClass}>
                    <option>Işjeň</option><option>Passiw</option>
                  </select>
                </Field>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
                <p className="font-black text-emerald-950">{form.role} ygtyýarlary</p>
                <p className="mt-1 text-sm text-emerald-900">{rolePermissions[form.role].join(" · ")}</p>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 sm:col-span-2">
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800">Ýatyr</button>
                <button type="submit" className="rounded-xl bg-[#0b5e3c] px-6 py-3 font-bold text-white hover:bg-[#08462d]">Ýatda sakla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {profile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4" onClick={() => setProfile(null)}>
          <article className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0b5e3c] text-xl font-black text-white">{initials(profile.name)}</div>
                <div><h2 className="text-2xl font-black text-[#082f24]">{profile.name}</h2><RoleBadge role={profile.role} /></div>
              </div>
              <button onClick={() => setProfile(null)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><X /></button>
            </div>
            <div className="mt-6 grid gap-3">
              <Info label="Email" value={profile.email} />
              <Info label="Telefon" value={profile.phone || "Maglumat ýok"} />
              <Info label="Ýagdaýy" value={profile.status} />
              <Info label="Döredilen güni" value={formatDate(profile.createdAt)} />
              <Info label="Soňky giriş" value={profile.lastLogin ? formatDate(profile.lastLogin) : "Entek girmedi"} />
            </div>
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-black text-emerald-950">Ygtyýarlary</p>
              <ul className="mt-2 space-y-1 text-sm font-medium text-emerald-900">
                {rolePermissions[profile.role].map((permission) => <li key={permission}>✓ {permission}</li>)}
              </ul>
            </div>
            <button onClick={() => openEdit(profile)} className="mt-5 w-full rounded-xl bg-[#0b5e3c] py-3 font-bold text-white">Maglumatlary üýtget</button>
          </article>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b5e3c] focus:ring-2 focus:ring-emerald-100";

function Stat({ icon, title, value }: { icon: ReactNode; title: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#0b5e3c]">{icon}</div><p className="text-sm font-semibold text-slate-600">{title}</p><p className="mt-1 text-3xl font-black text-[#082f24]">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>{children}</label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words font-semibold text-slate-950">{value}</p></div>;
}

function RoleBadge({ role }: { role: UserRole }) {
  const colors: Record<UserRole, string> = {
    Admin: "bg-purple-100 text-purple-800",
    Operator: "bg-blue-100 text-blue-800",
    Weterinar: "bg-emerald-100 text-emerald-800",
    Gözegçi: "bg-slate-200 text-slate-800",
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${colors[role]}`}>{role}</span>;
}

function StatusBadge({ status }: { status: UserStatus }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${status === "Işjeň" ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-700"}`}>{status}</span>;
}

function ActionButton({ children, label, onClick, danger = false }: { children: ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return <button onClick={onClick} title={label} aria-label={label} className={`rounded-lg border p-2 ${danger ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}>{children}</button>;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tk-TM", { dateStyle: "medium" }).format(new Date(value));
}
