import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, MessageCircle, Brain, CheckCircle, 
  Calendar, ChevronDown, Save, Heart 
} from 'lucide-react';
import Header from '../components/Header';
import { cn } from '../lib/utils';

export default function DailyReportForm() {
  const navigate = useNavigate();
  const [socialEngagement, setSocialEngagement] = useState(3);
  const [initiative, setInitiative] = useState(2);
  const [repetitive, setRepetitive] = useState(4);
  const [taskCompletion, setTaskCompletion] = useState(5);

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-white">
      <Header 
        title="Questionnaire Submission" 
        subtitle="How is Leo doing today?"
        rightElement={
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-sm font-medium">
            <Calendar size={18} />
            <span>Today, Mar 4, 2026</span>
          </div>
        }
      />

      <main className="flex-1 px-4 pt-6 space-y-8">
        {/* Social Interaction */}
        <section>
          <div className="flex items-center gap-3 pb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-primary">
              <Users size={20} />
            </div>
            <h3 className="text-slate-900 text-lg font-bold">Social Interaction</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2 px-1">Eye contact frequency</label>
              <div className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-100 p-1">
                {['Low', 'Medium', 'High'].map((val) => (
                  <label key={val} className="flex cursor-pointer h-full grow items-center justify-center rounded-md px-2 has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 text-sm font-medium transition-all">
                    <span className="truncate">{val}</span>
                    <input className="sr-only" name="eye_contact" type="radio" value={val} defaultChecked={val === 'Medium'} />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2 px-1">
                <label className="text-sm font-medium text-slate-500">Social Engagement</label>
                <span className="text-primary font-bold text-lg">{socialEngagement}<span className="text-xs font-normal text-slate-400 ml-1">/ 6</span></span>
              </div>
              <input 
                type="range" 
                min="0" max="6" 
                value={socialEngagement} 
                onChange={(e) => setSocialEngagement(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 px-1 mt-1">
                <span>None (0)</span>
                <span>Full (6)</span>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-100" />

        {/* Communication */}
        <section>
          <div className="flex items-center gap-3 pb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-slate-900 text-lg font-bold">Communication</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-3 px-1">Verbal Level</label>
              <div className="flex flex-wrap gap-2">
                {['Non-verbal', 'Single word', 'Short phrases', 'Fluent'].map(val => (
                  <label key={val} className="cursor-pointer">
                    <input className="peer sr-only" name="verbal_level" type="radio" value={val} defaultChecked={val === 'Short phrases'} />
                    <span className="inline-block px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary transition-all">
                      {val}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-100" />

        {/* Behavioral Patterns */}
        <section>
          <div className="flex items-center gap-3 pb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
              <Brain size={20} />
            </div>
            <h3 className="text-slate-900 text-lg font-bold">Behavioral Patterns</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-3 px-1">Emotional Regulation</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Calm', emoji: '😌', color: 'green' },
                  { label: 'Mild Anxiety', emoji: '😟', color: 'yellow' },
                  { label: 'Meltdown', emoji: '😫', color: 'red' },
                ].map(item => (
                  <label key={item.label} className="cursor-pointer group">
                    <input className="peer sr-only" name="emotional_reg" type="radio" value={item.label} defaultChecked={item.label === 'Mild Anxiety'} />
                    <div className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200 transition-all",
                      "peer-checked:bg-slate-100 peer-checked:border-primary peer-checked:shadow-sm"
                    )}>
                      <span className="text-2xl mb-1">{item.emoji}</span>
                      <span className="text-[10px] font-medium text-center uppercase tracking-wider">{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="px-4 pb-8">
          <button 
            onClick={() => navigate('/')}
            className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Submit Daily Report
          </button>
        </div>
      </main>
    </div>
  );
}
