import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes, KeyRound, Activity, AlertCircle, Timer, LogOut } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { authService } from '../../services/authService';
import Card from '../../components/ui/Card';
import RequestsChart from '../../components/charts/RequestsChart';
import { useNavigate } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, delay, accent = 'primary' }) {
  return (
    <Card delay={delay} className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl bg-${accent}/15 flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 text-${accent}`} />
      </div>
      <div>
        <p className="font-body text-sm text-text-secondary">{label}</p>
        <p className="font-display text-2xl text-text-primary">{value}</p>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, chart] = await Promise.all([
          dashboardService.summary(),
          dashboardService.requestChart(),
        ]);
        setSummary(summaryData);
        setChartData(chart.chart || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="font-display text-3xl text-text-primary">
            Welcome back{user ? `, ${user.name}` : ''}
          </h1>
          <p className="font-body text-sm text-text-secondary mt-1">
            Here's what's happening across your applications
          </p>
        </motion.div>
      </div>

      {loading ? (
        <p className="text-text-secondary font-body">Loading your dashboard…</p>
      ) : error ? (
        <p className="text-danger font-body">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard icon={Boxes} label="Applications" value={summary.applications} delay={0} />
            <StatCard icon={KeyRound} label="Active API Keys" value={summary.apiKeys} delay={0.05} accent="secondary" />
            <StatCard icon={Activity} label="Requests Today" value={summary.requestsToday} delay={0.1} />
            <StatCard icon={AlertCircle} label="Failed Requests" value={summary.failedRequests} delay={0.15} accent="danger" />
            <StatCard icon={Timer} label="Avg Response Time" value={`${summary.averageResponseTime}ms`} delay={0.2} accent="secondary" />
            <StatCard icon={Activity} label="Total Requests" value={summary.totalRequests} delay={0.25} />
          </div>

          <Card delay={0.3}>
            <h2 className="font-display text-xl text-text-primary mb-4">Requests over time</h2>
            <RequestsChart data={chartData} />
          </Card>
        </>
      )}
    </div>
  );
}