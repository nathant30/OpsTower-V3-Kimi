// Trust Score Page
// Driver and passenger trust scoring system

import { useEffect, useState } from 'react';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import {
  Award,
  TrendingUp,
  TrendingDown,
  User,
  Target,
  CheckCircle,
  Star,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types
interface TrustScoreHistory {
  date: string;
  score: number;
}

interface TrustScoreFactors {
  completion: number;
  rating: number;
  behavior: number;
  verification: number;
}

interface TrustScoreData {
  userId: string;
  name: string;
  role: 'driver' | 'passenger';
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  factors: TrustScoreFactors;
  history: TrustScoreHistory[];
  lastUpdated: string;
}

// Mock data for development
const mockScores: TrustScoreData[] = [
  {
    userId: 'USR-001',
    name: 'Juan Santos',
    role: 'driver',
    score: 94,
    level: 'excellent',
    factors: { completion: 98, rating: 4.8, behavior: 95, verification: 100 },
    history: [
      { date: '2024-01-01', score: 88 },
      { date: '2024-02-01', score: 90 },
      { date: '2024-03-01', score: 92 },
      { date: '2024-04-01', score: 94 },
    ],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-002',
    name: 'Maria Cruz',
    role: 'driver',
    score: 78,
    level: 'good',
    factors: { completion: 85, rating: 4.2, behavior: 80, verification: 100 },
    history: [
      { date: '2024-01-01', score: 72 },
      { date: '2024-02-01', score: 75 },
      { date: '2024-03-01', score: 76 },
      { date: '2024-04-01', score: 78 },
    ],
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-003',
    name: 'Pedro Reyes',
    role: 'passenger',
    score: 62,
    level: 'fair',
    factors: { completion: 70, rating: 3.8, behavior: 65, verification: 100 },
    history: [
      { date: '2024-01-01', score: 68 },
      { date: '2024-02-01', score: 66 },
      { date: '2024-03-01', score: 64 },
      { date: '2024-04-01', score: 62 },
    ],
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-004',
    name: 'Ana Garcia',
    role: 'passenger',
    score: 45,
    level: 'poor',
    factors: { completion: 50, rating: 2.5, behavior: 45, verification: 80 },
    history: [
      { date: '2024-01-01', score: 55 },
      { date: '2024-02-01', score: 52 },
      { date: '2024-03-01', score: 48 },
      { date: '2024-04-01', score: 45 },
    ],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-005',
    name: 'Miguel Torres',
    role: 'driver',
    score: 88,
    level: 'good',
    factors: { completion: 92, rating: 4.5, behavior: 88, verification: 100 },
    history: [
      { date: '2024-01-01', score: 82 },
      { date: '2024-02-01', score: 85 },
      { date: '2024-03-01', score: 86 },
      { date: '2024-04-01', score: 88 },
    ],
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'USR-006',
    name: 'Sofia Lim',
    role: 'passenger',
    score: 96,
    level: 'excellent',
    factors: { completion: 100, rating: 4.9, behavior: 95, verification: 100 },
    history: [
      { date: '2024-01-01', score: 92 },
      { date: '2024-02-01', score: 94 },
      { date: '2024-03-01', score: 95 },
      { date: '2024-04-01', score: 96 },
    ],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const TrustScore = () => {
  const [scores, setScores] = useState<TrustScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'driver' | 'passenger'>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    loadScores();
  }, [roleFilter]);

  const loadScores = async () => {
    try {
      // Simulate API call - replace with actual API when ready
      // const params = roleFilter !== 'all' ? { role: roleFilter } : undefined
      // const response = await getTrustScores(params)
      // setScores(response.data)
      
      // Use mock data for now with filtering
      setTimeout(() => {
        let filtered = mockScores;
        if (roleFilter !== 'all') {
          filtered = mockScores.filter(s => s.role === roleFilter);
        }
        setScores(filtered);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load trust scores', error);
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 70) return 'bg-blue-500/20';
    if (score >= 50) return 'bg-yellow-500/20';
    return 'bg-orange-500/20';
  };

  const getLevelBadge = (level: string): 'active' | 'warning' | 'alert' | 'default' => {
    switch (level) {
      case 'excellent':
        return 'active';
      case 'good':
        return 'active';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'alert';
      default:
        return 'default';
    }
  };

  const filteredScores = levelFilter === 'all'
    ? scores
    : scores.filter((s) => s.level === levelFilter);

  const scoreDistribution = [
    { name: 'Excellent (90-100)', value: scores.filter((s) => s.score >= 90).length, color: '#22c55e' },
    { name: 'Good (70-89)', value: scores.filter((s) => s.score >= 70 && s.score < 90).length, color: '#3b82f6' },
    { name: 'Fair (50-69)', value: scores.filter((s) => s.score >= 50 && s.score < 70).length, color: '#eab308' },
    { name: 'Poor (0-49)', value: scores.filter((s) => s.score < 50).length, color: '#f97316' },
  ];

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading trust scores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Trust Score System</h1>
        <p className="text-sm text-gray-400 mt-1">
          Driver and passenger trust scoring based on behavior and performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white mt-2">{scores.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Average Score</p>
                <p className={`text-3xl font-bold mt-2 ${getScoreColor(avgScore)}`}>
                  {avgScore}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Excellent Scores</p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {scores.filter((s) => s.level === 'excellent').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Flagged Users</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">
                  {scores.filter((s) => s.level === 'poor').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Trust Score Algorithm */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Trust Score Factors</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Completion Rate</span>
                  <span className="text-sm font-semibold text-white">25%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Rating Score</span>
                  <span className="text-sm font-semibold text-white">30%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Behavior Score</span>
                  <span className="text-sm font-semibold text-white">30%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Verification Status</span>
                  <span className="text-sm font-semibold text-white">15%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  Trust scores are calculated using a weighted algorithm that considers multiple factors
                  including ride completion rates, passenger/driver ratings, behavioral patterns, and
                  identity verification status.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Users</option>
                <option value="driver">Drivers Only</option>
                <option value="passenger">Passengers Only</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Score Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-4 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Levels</option>
                <option value="excellent">Excellent (90-100)</option>
                <option value="good">Good (70-89)</option>
                <option value="fair">Fair (50-69)</option>
                <option value="poor">Poor (0-49)</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Trust Scores List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Trust Scores ({filteredScores.length})</h3>
          <div className="space-y-3">
            {filteredScores.map((score) => (
              <div
                key={score.userId}
                className="p-4 bg-[#0f0f14] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-16 h-16 ${getScoreBgColor(score.score)} rounded-lg flex items-center justify-center`}>
                        <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                          {score.score}
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{score.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getLevelBadge(score.level)}>
                            {score.level.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-400 uppercase">
                            {score.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Factors */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Completion</p>
                        <p className="text-sm font-semibold text-white">
                          {score.factors.completion}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <p className="text-sm font-semibold text-white">
                            {score.factors.rating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Behavior</p>
                        <p className="text-sm font-semibold text-white">
                          {score.factors.behavior}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Verification</p>
                        <p className="text-sm font-semibold text-white">
                          {score.factors.verification}%
                        </p>
                      </div>
                    </div>

                    {/* Score History Chart */}
                    {score.history.length > 0 && (
                      <div className="h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={score.history}>
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke={score.score >= 70 ? '#22c55e' : '#f97316'}
                              strokeWidth={2}
                              dot={false}
                            />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#f3f4f6',
                              }}
                              labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500 mb-3">
                      Last updated: {new Date(score.lastUpdated).toLocaleDateString()}
                    </p>
                    <button className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Adjust Score
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrustScore;
