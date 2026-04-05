import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCash,
  HiOutlineCollection,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from 'react-icons/hi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

const DashboardPage = () => {
  const { user, isViewer } = useAuth();
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, categoryRes, trendsRes, recentRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/category-summary'),
        api.get('/dashboard/monthly-trends'),
        api.get('/dashboard/recent?limit=8'),
      ]);
      setSummary(summaryRes.data.data);
      setCategoryData(categoryRes.data.data);
      setMonthlyTrends(trendsRes.data.data);
      setRecentTxns(recentRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const summaryCards = [
    {
      title: 'Total Income',
      value: summary?.totalIncome || 0,
      icon: HiOutlineTrendingUp,
      color: 'emerald',
      gradient: 'from-emerald-400 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
    },
    {
      title: 'Total Expense',
      value: summary?.totalExpense || 0,
      icon: HiOutlineTrendingDown,
      color: 'rose',
      gradient: 'from-rose-400 to-rose-600',
      bgGradient: 'from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20',
    },
    {
      title: 'Net Balance',
      value: summary?.netBalance || 0,
      icon: HiOutlineCash,
      color: 'primary',
      gradient: 'from-primary-400 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
    },
    {
      title: 'Total Records',
      value: summary?.totalRecords || 0,
      icon: HiOutlineCollection,
      color: 'amber',
      gradient: 'from-amber-400 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
      isCurrency: false,
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare pie chart data (group by category, sum income/expense)
  const pieData = categoryData.reduce((acc, item) => {
    const existing = acc.find((d) => d.name === item.category);
    if (existing) {
      existing.value += item.total;
    } else {
      acc.push({ name: item.category, value: item.total });
    }
    return acc;
  }, []);

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartTrends = monthlyTrends.map((item) => ({
    ...item,
    label: monthNames[parseInt(item.month.split('-')[1])] + ' ' + item.month.split('-')[0].slice(-2),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's your financial overview
          </p>
        </div>
        <div className={`badge-${user?.role}`}>
          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bgGradient} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-500`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.isCurrency === false ? card.value : formatCurrency(card.value)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 xl:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Monthly Trends
          </h3>
          {chartTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartTrends}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    padding: '12px',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGradient)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
              No data available
            </div>
          )}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Category Breakdown
          </h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                {pieData.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Transactions
        </h3>
        {recentTxns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th className="pb-4 pr-4">Date</th>
                  <th className="pb-4 pr-4">Category</th>
                  <th className="pb-4 pr-4">Type</th>
                  <th className="pb-4 pr-4">Note</th>
                  <th className="pb-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentTxns.map((txn, index) => (
                  <motion.tr
                    key={txn._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-gray-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="py-3.5 pr-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(txn.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`badge-${txn.type}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                      {txn.note || '—'}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`text-sm font-semibold flex items-center justify-end gap-1 ${txn.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                        }`}>
                        {txn.type === 'income' ? (
                          <HiOutlineArrowUp className="w-4 h-4" />
                        ) : (
                          <HiOutlineArrowDown className="w-4 h-4" />
                        )}
                        {formatCurrency(txn.amount)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            No transactions found. Start by adding some records.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
