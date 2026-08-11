import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { ROLE_LABELS, MvpUserRole } from '../lib/permissions';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Phone, 
  Key, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Building2, 
  Crown, 
  ChefHat, 
  Smartphone, 
  Coins 
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { 
    staffMembers, 
    addStaffMember, 
    updateStaffMember, 
    deleteStaffMember, 
    currentRole, 
    setCurrentRole, 
    mvpRole, 
    permissions 
  } = useResto();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'EMPLOYE' as MvpUserRole,
    pinCode: '1234',
    active: true
  });

  const handleOpenAdd = () => {
    setEditingStaffId(null);
    setFormData({
      name: '',
      phone: '+229 ',
      role: 'EMPLOYE',
      pinCode: Math.floor(1000 + Math.random() * 9000).toString(),
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: typeof staffMembers[0]) => {
    setEditingStaffId(staff.id);
    setFormData({
      name: staff.name,
      phone: staff.phone,
      role: staff.role as MvpUserRole,
      pinCode: staff.pinCode || '1234',
      active: staff.active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStaffId) {
      updateStaffMember(editingStaffId, formData);
    } else {
      addStaffMember(formData);
    }
    setIsModalOpen(false);
  };

  const rolesList: { role: MvpUserRole; icon: React.ElementType }[] = [
    { role: 'PROPRIETAIRE', icon: Crown },
    { role: 'EMPLOYE', icon: Smartphone },
    { role: 'CUISINE', icon: ChefHat },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#0B1F33] text-white p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-400 p-2 rounded-xl">
              <Users className="w-6 h-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Personnel & Gestion des Rôles</h2>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Gérez les accès de votre équipe. Attribuez les 3 rôles MVP (Propriétaire, Employé, Cuisine) et définissez les codes PIN pour une utilisation fluide et sécurisée sur mobile.
          </p>
        </div>

        {permissions.canManageStaff && (
          <button
            onClick={handleOpenAdd}
            className="bg-[#F59E0B] hover:bg-[#d98805] text-[#0B1F33] font-black px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shrink-0 w-full md:w-auto justify-center"
          >
            <UserPlus className="w-5 h-5" />
            <span>Ajouter un membre</span>
          </button>
        )}
      </div>

      {/* Role Switcher Tester for Demo */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Tester le Profil / Changement Rapide de Rôle</span>
          </div>
          <span className="text-xs text-slate-400">Rôle actif : <strong className="text-amber-400">{mvpRole}</strong></span>
        </div>
        <p className="text-xs text-slate-300">
          Cliquez sur un rôle ci-dessous pour simuler immédiatement l'interface utilisateur vue par ce membre du personnel :
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {rolesList.map(({ role, icon: RoleIcon }) => {
            const meta = ROLE_LABELS[role];
            const isCurrent = mvpRole === role;
            return (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                  isCurrent 
                    ? 'bg-[#0B1F33] border-amber-400 text-white shadow-md ring-2 ring-amber-400/50' 
                    : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <RoleIcon className={`w-4 h-4 ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`} />
                  {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="font-extrabold text-xs">{meta.title}</span>
                <span className="text-[10px] text-slate-400 truncate">{role}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Roles Matrix Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesList.map(({ role, icon: RoleIcon }) => {
          const meta = ROLE_LABELS[role];
          return (
            <div key={role} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{meta.title}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeColor}`}>
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {meta.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Staff Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>Membres de l'Équipe ({staffMembers.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Synchronisation Supabase Active</span>
        </div>

        <div className="divide-y divide-slate-100">
          {staffMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm">Aucun membre enregistré.</p>
            </div>
          ) : (
            staffMembers.map((staff) => {
              const roleMeta = ROLE_LABELS[staff.role as MvpUserRole] || ROLE_LABELS['EMPLOYE'];
              return (
                <div key={staff.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm shadow">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{staff.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleMeta.badgeColor}`}>
                          {roleMeta.title}
                        </span>
                        {!staff.active && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                            Inactif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {staff.phone}
                        </span>
                        {staff.pinCode && (
                          <span className="flex items-center gap-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-[11px]">
                            <Key className="w-3 h-3 text-slate-400" />
                            PIN: {staff.pinCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {permissions.canManageStaff && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium text-xs flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => deleteStaffMember(staff.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingStaffId ? 'Modifier le Membre' : 'Nouveau Membre de l\'Équipe'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Amina Cotonou"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone Bénin *</label>
                <input
                  type="text"
                  required
                  placeholder="+229 97 00 11 22"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rôle Attribué *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as MvpUserRole })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-bold"
                >
                  <option value="PROPRIETAIRE">PROPRIETAIRE (Accès Total & Configuration)</option>
                  <option value="EMPLOYE">EMPLOYE (Prise de commande, Tables & Encaissement)</option>
                  <option value="CUISINE">CUISINE (Écran de préparation KDS direct)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code PIN Rapide (4 chiffres)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono font-bold tracking-widest text-center"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="staff-active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                />
                <label htmlFor="staff-active" className="text-xs font-bold text-slate-700">Compte Actif</label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B1F33] hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-black shadow-lg"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
