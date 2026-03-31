import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle, BrainCircuit } from 'lucide-react';

export default function AQ10Dashboard({ username = "john_pork" }) {
  const [data, setData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [needsAttention, setNeedsAttention] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/aq10/${username}`);
        if (response.ok) {
          const result = await response.json();
          setData(result.history || []);
          setPrediction(result.prediction);
          setNeedsAttention(result.needs_attention);
        }
      } catch (error) {
        console.error("Failed to fetch AQ10 data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse font-bold">Loading assessment history...</div>;
  }

  // Display only the last 30 items for clarity if there are many
  const chartData = data.slice(-30).map(item => ({
    name: item.date.slice(5), // MM-DD
    score: item.score
  }));

  if (prediction !== null) {
    chartData.push({
      name: "Predicted",
      predictedScore: parseFloat(prediction.toFixed(1))
    });
  }

  return (
    <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">AQ-10 Score Tracking</h3>
            <p className="text-slate-500 text-sm font-medium">Daily diagnostic history and LSTM prediction</p>
          </div>
        </div>
        {prediction !== null && (
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Next Day Forecast</p>
            <p className="text-2xl font-black text-indigo-600">{prediction.toFixed(1)} / 10</p>
          </div>
        )}
      </div>

      {needsAttention && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-inner">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-base font-bold text-rose-900">Professional Assistance Recommended</h4>
            <p className="text-sm text-rose-700 font-medium mt-1">
              Based on the 30-day symptom tracking and LSTM forecast, the predicted AQ-10 score is elevated (&gt;{prediction?.toFixed(1)}).
              The system recommends seeking professional medical advice or scheduling a session with a therapist soon.
            </p>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <p className="text-slate-500 font-medium">No assessment data available yet.</p>
        </div>
      ) : (
        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} />
              <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '0.25rem' }}
              />
              <ReferenceLine y={6} stroke="#F43F5E" strokeDasharray="3 3" label={{ position: 'top', value: 'Threshold (6)', fill: '#F43F5E', fontSize: 10, fontWeight: 700 }} />
              <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6 }} name="Historical Score" />
              {prediction !== null && (
                <Line type="monotone" dataKey="predictedScore" stroke="#F43F5E" strokeWidth={3} strokeDasharray="5 5" dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} name="LSTM Prediction" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
