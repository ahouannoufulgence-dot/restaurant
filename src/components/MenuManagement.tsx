import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { MenuItem, SellingUnit, SupplementOption } from '../types';
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Copy,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  Sparkles,
  Star,
  Flame,
  Leaf,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  Info
} from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const { 
    menuItems, 
    categories, 
    addMenuItem, 
    updateMenuItem, 
    toggleMenuItemAvailability, 
    deleteMenuItem, 
    addCategory, 
    duplicateMenuItem,
    reorderMenuItems,
    formatFcfa 
  } = useResto();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // New Category input
  const [newCatName, setNewCatName] = useState<string>('');

  // Add / Edit Dish Modal
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0]?.name || 'Plats Chauds & Spécialités');
  const [priceFcfa, setPriceFcfa] = useState<number>(2000);
  const [unit, setUnit] = useState<SellingUnit>('portion');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [isIllustrativeImage, setIsIllustrativeImage] = useState<boolean>(true);
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [isTodaySpecial, setIsTodaySpecial] = useState<boolean>(false);
  const [isVegetarian, setIsVegetarian] = useState<boolean>(false);
  const [spicyLevel, setSpicyLevel] = useState<'Aucun' | 'Doux' | 'Moyen' | 'Fort'>('Aucun');
  const [supplements, setSupplements] = useState<SupplementOption[]>([]);

  // Temp supplement input inside modal
  const [newSuppName, setNewSuppName] = useState<string>('');
  const [newSuppPrice, setNewSuppPrice] = useState<number>(500);

  const sellingUnits: SellingUnit[] = ['portion', 'assiette', 'plat', 'bouteille', 'verre', 'sachet', 'kg', 'L', 'pièce', 'casier'];

  // Image Presets for Quick Selection
  const imagePresets = [
    { name: 'Poulet Braisé', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80' },
    { name: 'Poisson Braisé', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80' },
    { name: 'Riz / Atassi', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80' },
    { name: 'Alloko / Plantain', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80' },
    { name: 'Suya / Brochettes', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
    { name: 'Jus Bissap / Cocktail', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
    { name: 'Bière Béninoise', url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80' }
  ];

  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];

  const filteredItems = safeMenuItems.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategory(categories[0]?.name || 'Plats Chauds & Spécialités');
    setPriceFcfa(2000);
    setUnit('portion');
    setDescription('');
    setImage(imagePresets[0].url);
    setIsIllustrativeImage(true);
    setIsPopular(false);
    setIsNew(false);
    setIsTodaySpecial(false);
    setIsVegetarian(false);
    setSpicyLevel('Aucun');
    setSupplements([
      { id: 's1', name: 'Supplément Plantain / Aloko', priceFcfa: 500 },
      { id: 's2', name: 'Supplément Sauce Extra', priceFcfa: 200 }
    ]);
    setShowItemModal(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPriceFcfa(item.priceFcfa);
    setUnit(item.unit);
    setDescription(item.description || '');
    setImage(item.image || '');
    setIsIllustrativeImage(item.isIllustrativeImage ?? true);
    setIsPopular(item.isPopular ?? false);
    setIsNew(item.isNew ?? false);
    setIsTodaySpecial(item.isTodaySpecial ?? false);
    setIsVegetarian(item.isVegetarian ?? false);
    setSpicyLevel(item.spicyLevel || 'Aucun');
    setSupplements(item.supplements || []);
    setShowItemModal(true);
  };

  const handleAddSupplementToForm = () => {
    if (!newSuppName.trim()) return;
    setSupplements(prev => [
      ...prev,
      { id: 'supp_' + Date.now(), name: newSuppName.trim(), priceFcfa: newSuppPrice }
    ]);
    setNewSuppName('');
    setNewSuppPrice(500);
  };

  const handleRemoveSupplementFromForm = (suppId: string) => {
    setSupplements(prev => prev.filter(s => s.id !== suppId));
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateMenuItem(editingId, {
        name,
        category,
        priceFcfa,
        unit,
        description,
        image,
        isIllustrativeImage,
        isPopular,
        isNew,
        isTodaySpecial,
        isVegetarian,
        spicyLevel,
        supplements
      });
    } else {
      addMenuItem({
        name,
        category,
        priceFcfa,
        unit,
        description,
        available: true,
        image,
        isIllustrativeImage,
        isPopular,
        isNew,
        isTodaySpecial,
        isVegetarian,
        spicyLevel,
        supplements
      });
    }

    setShowItemModal(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const handleMoveIndex = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < filteredItems.length) {
      const currentId = filteredItems[index].id;
      const targetId = filteredItems[targetIndex].id;
      reorderMenuItems(currentId, targetId);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-[#F59E0B]" />
            <span>Gestion du Menu & Plats</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Présentation visuelle appétissante, prix en FCFA et gestion des stocks en direct.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="bg-slate-200 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
              <span>Cartes</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-slate-600" />
              <span>Tableau</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-[#0B1F33] hover:bg-slate-800 text-white font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-md"
          >
            <Plus className="h-4 w-4 text-[#F59E0B]" />
            <span>Nouveau Plat</span>
          </button>
        </div>
      </div>

      {/* CATEGORIES & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher Riz, Poulet braisé, Capitaine, Bissap, Atassi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          {/* Quick Add Category Form */}
          <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Nouvelle Catégorie..."
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="bg-slate-50 border rounded-xl px-3 py-2 text-xs font-medium"
            />
            <button
              type="submit"
              className="bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-slate-900 transition whitespace-nowrap"
            >
              + Catégorie
            </button>
          </form>

        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl font-black whitespace-nowrap transition ${
              selectedCategory === 'all' 
                ? 'bg-[#0B1F33] text-[#F59E0B]' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tous ({menuItems.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3.5 py-1.5 rounded-xl font-black whitespace-nowrap transition ${
                selectedCategory === c.name 
                  ? 'bg-[#0B1F33] text-[#F59E0B]' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: VISUAL CARDS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-medium">Aucun produit dans cette catégorie.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-400 transition"
              >
                {/* Image & Badges Banner */}
                <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-amber-900">
                      <UtensilsCrossed className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <button
                      onClick={() => toggleMenuItemAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-md border transition ${
                        item.available 
                          ? 'bg-emerald-500 text-white border-emerald-400' 
                          : 'bg-red-600 text-white border-red-500'
                      }`}
                    >
                      {item.available ? '✓ En Stock' : '✕ Épuisé'}
                    </button>
                  </div>

                  {/* Custom Badges */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                    {item.isPopular && (
                      <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md uppercase">
                        ★ Populaire
                      </span>
                    )}
                    {item.isNew && (
                      <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-md uppercase">
                        ⚡ Nouveau
                      </span>
                    )}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2.5 left-2.5 bg-[#0B1F33]/90 text-[#F59E0B] font-black text-xs px-3 py-1 rounded-xl border border-amber-500/30 shadow-md">
                    {formatFcfa(item.priceFcfa)} <span className="text-[10px] text-slate-300">/ {item.unit}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border">{item.category}</span>
                      {item.supplements && item.supplements.length > 0 && (
                        <span className="text-amber-800">{item.supplements.length} supplément(s)</span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-sm leading-snug">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  {/* Reordering & Action Toolbar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                    
                    {/* Move Up/Down */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveIndex(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs disabled:opacity-30"
                        title="Monter"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveIndex(idx, 'down')}
                        disabled={idx === filteredItems.length - 1}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs disabled:opacity-30"
                        title="Descendre"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Secondary Actions: Duplicate, Edit, Delete */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => duplicateMenuItem(item.id)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-200"
                        title="Dupliquer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dupliquer</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#0B1F33] text-white text-[11px] uppercase font-bold">
                <tr>
                  <th className="p-3.5">Plat / Produit</th>
                  <th className="p-3.5">Catégorie</th>
                  <th className="p-3.5">Prix FCFA</th>
                  <th className="p-3.5">Unité</th>
                  <th className="p-3.5">Disponibilité</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                      Aucun produit trouvé dans cette catégorie.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 flex items-center space-x-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border" />
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-block bg-slate-100 text-slate-800 font-semibold text-[10px] px-2.5 py-0.5 rounded-full border">
                          {item.category}
                        </span>
                      </td>

                      <td className="p-3.5 font-black text-slate-900 text-sm">
                        {formatFcfa(item.priceFcfa)}
                      </td>

                      <td className="p-3.5 font-bold text-slate-700">
                        par {item.unit}
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => toggleMenuItemAvailability(item.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition ${
                            item.available 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {item.available ? 'En Stock' : 'Épuisé'}
                        </button>
                      </td>

                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => duplicateMenuItem(item.id)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg transition"
                          title="Dupliquer"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL FEATURED ADD / EDIT ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitItem} className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-4">
            
            <button
              type="button"
              onClick={() => setShowItemModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-black text-slate-900 text-lg border-b pb-2 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <span>{editingId ? 'Modifier le Produit' : 'Ajouter un Produit au Menu'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              
              {/* Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom du Plat / Boisson</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Poulet Braisé + Aloko"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-[#0B1F33]"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-2.5 py-2 font-bold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    required
                    step={100}
                    value={priceFcfa}
                    onChange={e => setPriceFcfa(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              {/* Selling Unit */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Unité de Vente</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as SellingUnit)}
                  className="w-full bg-slate-50 border rounded-xl px-2.5 py-2 font-bold"
                >
                  {sellingUnits.map(u => (
                    <option key={u} value={u}>par {u}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description courte & garnitures</label>
                <textarea
                  rows={2}
                  placeholder="ex: Poulet braisé au feu de bois accompagné de sauce friture et aloko..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 font-medium"
                />
              </div>

              {/* Image URL & Quick Presets (Req 31 & 37) */}
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200 space-y-2">
                <label className="font-black text-amber-950 block">Photo du Plat</label>
                
                {/* Preset quick picker */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">Sélection rapide par type de plat :</span>
                  <div className="flex flex-wrap gap-1">
                    {imagePresets.map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setImage(preset.url);
                          setIsIllustrativeImage(true);
                        }}
                        className="text-[10px] bg-white hover:bg-amber-100 text-slate-800 font-bold px-2 py-1 rounded-lg border border-amber-200 transition"
                      >
                        📷 {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Lien d'image personnalisée (https://...)"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs"
                />

                <label className="flex items-center space-x-2 text-xs font-bold text-amber-950 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isIllustrativeImage}
                    onChange={e => setIsIllustrativeImage(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Afficher la mention "Image illustrative" (Recommandé si la photo n'est pas exacte)</span>
                </label>
              </div>

              {/* Badges and spice options */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block">Badges & Caractéristiques</label>
                
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={e => setIsPopular(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>★ Plat Populaire</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={e => setIsNew(e.target.value !== undefined ? e.target.checked : false)}
                      className="rounded text-emerald-600"
                    />
                    <span>⚡ Nouveau au Menu</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTodaySpecial}
                      onChange={e => setIsTodaySpecial(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Special du Jour</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVegetarian}
                      onChange={e => setIsVegetarian(e.target.checked)}
                      className="rounded text-green-600"
                    />
                    <span>🌱 Végétarien</span>
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Niveau de Piment :</label>
                  <div className="flex gap-1.5">
                    {(['Aucun', 'Doux', 'Moyen', 'Fort'] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSpicyLevel(lvl)}
                        className={`flex-1 py-1 text-xs rounded-lg font-bold border transition ${
                          spicyLevel === lvl
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {lvl === 'Aucun' ? 'Doux / Sans' : `🔥 ${lvl}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Supplements Management */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block">Suppléments Proposés</label>
                
                <div className="space-y-1.5">
                  {supplements.map(supp => (
                    <div key={supp.id} className="flex items-center justify-between bg-white p-2 rounded-xl border text-xs">
                      <span className="font-bold text-slate-800">{supp.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-amber-900">+{formatFcfa(supp.priceFcfa)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSupplementFromForm(supp.id)}
                          className="text-red-500 hover:text-red-700 font-bold p-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Nom (ex: Portion Aloko extra)"
                    value={newSuppName}
                    onChange={e => setNewSuppName(e.target.value)}
                    className="flex-1 bg-white border rounded-xl px-2.5 py-1.5 text-xs font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Prix"
                    step={100}
                    value={newSuppPrice}
                    onChange={e => setNewSuppPrice(Number(e.target.value))}
                    className="w-20 bg-white border rounded-xl px-2 py-1.5 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddSupplementToForm}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full bg-[#0B1F33] hover:bg-slate-800 text-[#F59E0B] font-black py-3.5 rounded-2xl text-xs transition shadow-lg"
            >
              Enregistrer le Plat
            </button>

          </form>
        </div>
      )}

    </div>
  );
};

