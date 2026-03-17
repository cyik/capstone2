import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import eztherapylogo from '../assets/eztherapy transparent.png';

const QUESTIONS = [
  "I often notice small sounds when others do not.",
  "I usually concentrate more on the whole picture, rather than the small details.",
  "I find it easy to do more than one thing at once.",
  "If there is an interruption, I can switch back to what I was doing very quickly.",
  "I find it easy to 'read between the lines' when someone is talking to me.",
  "I know how to tell if someone listening to me is getting bored.",
  "When I'm reading a story, I find it difficult to work out the characters' intentions.",
  "I like to collect information about categories of things (e.g. types of car, types of bird, types of train, types of plant etc).",
  "I find it easy to work out what someone is thinking or feeling just by looking at their face.",
  "I find it difficult to work out people's intentions."
];

// AQ-10 scoring logic based on typical standard:
// Q1, Q7, Q8, Q10 score 1 point if 'Definitely Agree' or 'Slightly Agree'
// Q2, Q3, Q4, Q5, Q6, Q9 score 1 point if 'Definitely Disagree' or 'Slightly Disagree'
const AGREE_SCORES = [0, 6, 7, 9]; 

export default function AQ10Form() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Hardcoded for now, would typically come from auth context
  const username = "John Pork";

  const handleSelect = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    let score = 0;
    answers.forEach((ans, idx) => {
      if (AGREE_SCORES.includes(idx)) {
        if (ans === 'definitely_agree' || ans === 'slightly_agree') score += 1;
      } else {
        if (ans === 'definitely_disagree' || ans === 'slightly_disagree') score += 1;
      }
    });
    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (answers.includes(null)) {
      alert("Please answer all questions");
      return;
    }
    
    setIsSubmitting(true);
    const score = calculateScore();
    
    try {
      const dbUsername = "john_pork"; // Assuming some formatting or ID map based on John Pork
      const response = await fetch("http://127.0.0.1:8000/api/aq10", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_username: dbUsername,
          date: new Date().toISOString().split('T')[0],
          score: score
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => navigate('/patient-home'), 2000);
      } else {
        alert("Failed to save record");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-emerald-100">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Submitted Successfully!</h2>
          <p className="text-slate-500">Thank you for completing your daily assessment. Returning home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <img src={eztherapylogo} alt="Logo" className="h-12 w-12 object-contain ml-2" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily AQ-10 Assessment</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Please answer the following 10 questions.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-4xl p-8 shadow-sm border border-slate-200 space-y-8">
          {QUESTIONS.map((question, idx) => (
            <div key={idx} className="space-y-4">
              <p className="text-lg font-semibold text-slate-800"><span className="text-indigo-600 font-black mr-2">{idx + 1}.</span> {question}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Definitely Agree", value: "definitely_agree" },
                  { label: "Slightly Agree", value: "slightly_agree" },
                  { label: "Slightly Disagree", value: "slightly_disagree" },
                  { label: "Definitely Disagree", value: "definitely_disagree" }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleSelect(idx, opt.value)}
                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      answers[idx] === opt.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-100 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
