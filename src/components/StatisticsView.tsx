import React from 'react';
import { useResto } from '../context/RestoContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Award } from 'lucide-react';

export const StatisticsView: React.FC = () => {
  const { orders, menuItems, formatFcfa } = useResto();

  // 1. Payment Methods Breakdown
  let cashTotal = 0;
  let mtnTotal = 0;
  let moovTotal = 0;

  orders.forEach(o => {
    o.payments.forEach(p => {
      if (p.status === 'Payé') {
        if (p.method === 'Espèces') cashTotal += p.amountFcfa;
        else if (p.method === 'MTN Mobile Money') mtnTotal += p.amountFcfa;
        else if (p.method === 'Moov Money') moovTotal += p.amountFcfa;
      }
    });
  });

  const paymentData = [
    { name: 'Espèces', value: cashTotal, color: '#10B981' },
    { name: 'MTN MoMo', value: mtnTotal, color: '#F59E0B' },
    { name: 'Moov Money', value: moovTotal, color: '#2563EB' }
  ];

  // 2. Order Types Breakdown
  const orderTypeCounts: Record<string, number> = {
    'Sur place': 0,
    'À emporter': 0,
    'Livraison': 0
  };

  orders.forEach(o => {
    if (orderTypeCounts[o.type] !== undefined) {
      orderTypeCounts[o.type] += 1;
    }
  });

  const orderTypeData = Object.keys(orderTypeCounts).map(type => ({
    name: type,
    commandes: orderTypeCounts[type]
  }));

  // 3. Top Selling Products
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

  orders.forEach(o => {
    o.items.forEach(i => {
      if (!productSalesMap[i.menuItemName]) {
        productSalesMap[i.menuItemName] = { name: i.menuItemName, quantity: 0, revenue: 0 };
      }
      productSalesMap[i.menuItemName].quantity += i.quantity;
      productSalesMap[i.menuItemName].revenue += i.unitPriceFcfa * i.quantity;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#F59E0B]" />
            <span>Statistiques & Analytics Bénin</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyse des ventes en FCFA, plats les plus populaires et canaux d'encaissement Mobile Money.
          </p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-amber-500" />
            <span>Encaissements par Mode de Règlement (FCFA)</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={entry => `${entry.name}: ${formatFcfa(entry.value)}`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatFcfa(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Types Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Volume de Commandes par Type</span>
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderTypeData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commandes" fill="#0B1F33" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TOP SELLING PRODUCTS LEADERBOARD */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <Award className="h-5 w-5 text-[#F59E0B]" />
          <span>Top 5 des Plats & Boissons les plus Vendus</span>
        </h2>

        <div className="space-y-3">
          {topProducts.map((prod, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                  idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-800'
                }`}>
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{prod.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {prod.quantity} portion(s) vendue(s)
                  </p>
                </div>
              </div>

              <span className="font-black text-[#0B1F33] text-sm sm:text-base">
                {formatFcfa(prod.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
