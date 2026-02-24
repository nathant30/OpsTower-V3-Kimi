// AI Management Page - AI models, training, and predictions
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { Brain, TrendingUp, Activity, AlertTriangle, RefreshCw, Cpu, BarChart3 } from 'lucide-react';

// AI Model Types
interface AIModel {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'training' | 'inactive';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  predictions24h: number;
  description: string;
  type: 'fraud' | 'routing' | 'demand' | 'scoring';
}

interface Prediction {
  id: string;
  timestamp: string;
  modelName: string;
  input: string;
  prediction: string;
  confidence: number;
}

// Mock AI Models
const mockModels: AIModel[] = [
  {
    id: '1',
    name: 'Fraud Detection',
    version: '2.4.1',
    status: 'active',
    accuracy: 97.8,
    precision: 96.5,
    recall: 94.2,
    f1Score: 95.3,
    lastTrained: new Date(Date.now() - 86400000 * 2).toISOString(),
    predictions24h: 12543,
    description: 'Detects fraudulent transactions and suspicious activities',
    type: 'fraud',
  },
  {
    id: '2',
    name: 'Route Optimization',
    version: '3.1.0',
    status: 'active',
    accuracy: 94.2,
    precision: 93.8,
    recall: 92.1,
    f1Score: 92.9,
    lastTrained: new Date(Date.now() - 86400000 * 5).toISOString(),
    predictions24h: 8762,
    description: 'Optimizes driver routes for efficiency and fuel savings',
    type: 'routing',
  },
  {
    id: '3',
    name: 'Demand Prediction',
    version: '1.8.2',
    status: 'training',
    accuracy: 91.5,
    precision: 89.3,
    recall: 88.7,
    f1Score: 89.0,
    lastTrained: new Date(Date.now() - 86400000 * 1).toISOString(),
    predictions24h: 4521,
    description: 'Predicts ride demand by location and time',
    type: 'demand',
  },
  {
    id: '4',
    name: 'Driver Scoring',
    version: '2.0.5',
    status: 'active',
    accuracy: 93.6,
    precision: 92.1,
    recall: 91.8,
    f1Score: 91.9,
    lastTrained: new Date(Date.now() - 86400000 * 3).toISOString(),
    predictions24h: 3420,
    description: 'Scores driver performance and reliability',
    type: 'scoring',
  },
];

const AIManagement = () => {
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showRetrainModal, setShowRetrainModal] = useState(false);

  const { data: models, isLoading } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<AIModel[]> => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockModels;
    },
  });

  const retrainMutation = useMutation({
    mutationFn: async (modelId: string) => {
      // Simulate retraining
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return modelId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      setShowRetrainModal(false);
      setSelectedModel(null);
    },
  });

  const handleRetrain = (model: AIModel) => {
    setSelectedModel(model);
    setShowRetrainModal(true);
  };

  const confirmRetrain = () => {
    if (selectedModel) {
      retrainMutation.mutate(selectedModel.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <XpressBadge variant="active">Active</XpressBadge>;
      case 'training':
        return <XpressBadge variant="warning">Training</XpressBadge>;
      case 'inactive':
        return <XpressBadge variant="offline">Inactive</XpressBadge>;
      default:
        return <XpressBadge variant="default">{status}</XpressBadge>;
    }
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'fraud':
        return AlertTriangle;
      case 'routing':
        return TrendingUp;
      case 'demand':
        return BarChart3;
      case 'scoring':
        return Cpu;
      default:
        return Brain;
    }
  };

  const getModelIconColor = (type: string) => {
    switch (type) {
      case 'fraud':
        return 'text-red-400 bg-red-500/10';
      case 'routing':
        return 'text-green-400 bg-green-500/10';
      case 'demand':
        return 'text-blue-400 bg-blue-500/10';
      case 'scoring':
        return 'text-purple-400 bg-purple-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f14]">
        <div className="text-gray-400">Loading AI models...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">AI Management</h1>
        <p className="text-gray-400 mt-1">
          Monitor and manage AI models for predictive analytics
        </p>
      </div>

      {/* AI Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models?.map((model) => {
          const Icon = getModelIcon(model.type);
          return (
            <XpressCard key={model.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${getModelIconColor(model.type)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                      {getStatusBadge(model.status)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Version {model.version}</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">{model.description}</p>

              {/* Performance Metrics */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-300 mb-3">Performance Metrics</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0f0f14] p-3 rounded-lg">
                    <div className="text-xs text-gray-500">Accuracy</div>
                    <div className="text-lg font-bold text-green-400">{model.accuracy.toFixed(1)}%</div>
                  </div>
                  <div className="bg-[#0f0f14] p-3 rounded-lg">
                    <div className="text-xs text-gray-500">Precision</div>
                    <div className="text-lg font-bold text-blue-400">{model.precision.toFixed(1)}%</div>
                  </div>
                  <div className="bg-[#0f0f14] p-3 rounded-lg">
                    <div className="text-xs text-gray-500">Recall</div>
                    <div className="text-lg font-bold text-yellow-400">{model.recall.toFixed(1)}%</div>
                  </div>
                  <div className="bg-[#0f0f14] p-3 rounded-lg">
                    <div className="text-xs text-gray-500">F1 Score</div>
                    <div className="text-lg font-bold text-orange-400">{model.f1Score.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Training Info */}
              <div className="border-t border-gray-800 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500">Last Trained</div>
                    <div className="text-sm text-gray-300">
                      {new Date(model.lastTrained).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Predictions (24h)</div>
                    <div className="text-sm font-semibold text-white">
                      {model.predictions24h.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Progress Bar (if training) */}
              {model.status === 'training' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Training Progress</span>
                    <span className="text-xs text-white">65%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all animate-pulse"
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <XpressButton
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRetrain(model)}
                  disabled={model.status === 'training'}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Retrain Model
                </XpressButton>
                <XpressButton
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  icon={<Activity className="w-4 h-4" />}
                >
                  View Logs
                </XpressButton>
              </div>
            </XpressCard>
          );
        })}
      </div>

      {/* Recent Predictions Table */}
      <XpressCard title="Recent Predictions (Last 100)" icon={<Brain className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Timestamp</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Model</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Input</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Prediction</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => {
                const modelNames = ['Fraud Detection', 'Route Optimization', 'Demand Prediction', 'Driver Scoring'];
                const predictions = ['High Risk', 'Normal', 'Low Risk', 'Optimal Route', 'Peak Demand'];
                const confidence = 70 + Math.random() * 25;
                return (
                  <tr
                    key={i}
                    className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(Date.now() - i * 300000).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-white">{modelNames[i % modelNames.length]}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">Transaction #{1000 + i}</td>
                    <td className="py-3 px-4 text-white">{predictions[i % predictions.length]}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold ${
                          confidence > 85
                            ? 'text-green-400'
                            : confidence > 75
                            ? 'text-yellow-400'
                            : 'text-orange-400'
                        }`}
                      >
                        {confidence.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </XpressCard>

      {/* Retrain Confirmation Modal */}
      {showRetrainModal && selectedModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <XpressCard className="w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Confirm Model Retraining</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to retrain <strong>{selectedModel.name}</strong>? This process
                may take several hours and will use significant computational resources.
              </p>
              <div className="flex gap-3">
                <XpressButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowRetrainModal(false);
                    setSelectedModel(null);
                  }}
                >
                  Cancel
                </XpressButton>
                <XpressButton
                  className="flex-1"
                  onClick={confirmRetrain}
                  loading={retrainMutation.isPending}
                >
                  Confirm Retrain
                </XpressButton>
              </div>
            </div>
          </XpressCard>
        </div>
      )}
    </div>
  );
};

export default AIManagement;
