/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, ChevronRight, ArrowRight, Quote } from 'lucide-react';
import { cn } from './lib/utils';
import { ResultView } from './components/ResultView';
import { analysisPersonality, type BaZiResult } from './lib/gemini';

const reportKey = 'shunyue-report-v2';
function restoreReport(): BaZiResult | null {
  try { const report = JSON.parse(sessionStorage.getItem(reportKey) || 'null'); return report?.monthlyEnergy?.length === 12 && report.monthlyEnergy.every((m: { monthNumber: number }) => m.monthNumber >= 1 && m.monthNumber <= 12) ? report : null; } catch { return null; }
}

type Step = 'landing' | 'form' | 'quiz' | 'loading' | 'result';

export default function App() {
  const [step, setStep] = useState<Step>(() => restoreReport() ? 'result' : 'landing');
  const [birthData, setBirthData] = useState({
    date: '',
    time: '12:00',
    gender: '男',
    city: '北京'
  });
  const [result, setResult] = useState<BaZiResult | null>(restoreReport);


  const handleStart = () => setStep('form');

  const handleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('quiz');
  };

  const handleQuizComplete = async (quizAnswers: { q: string; a: string }[]) => {

    setStep('loading');
    
    try {
      const resultData = await analysisPersonality(
        birthData.date,
        birthData.time,
        birthData.gender,
        birthData.city,
        quizAnswers
      );
      setResult(resultData);
      try { sessionStorage.setItem(reportKey, JSON.stringify(resultData)); } catch { /* Report remains usable without browser storage. */ }
      setStep('result');
    } catch (error) {
      console.error(error);
      alert('频率同步中断，请检查网络后重试');
      setStep('landing');
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 selection:bg-gold/30">
      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="max-w-md w-full text-center space-y-8"
          >
            <div className="relative inline-block">
              <Sparkles className="w-12 h-12 text-gold absolute -top-8 -right-8 animate-pulse" />
              <h1 className="text-5xl font-serif tracking-tighter leading-none italic mb-2">顺月</h1>
              <p className="text-xs uppercase tracking-[0.3em] font-mono opacity-50">每个月，找到自己的节奏</p>
            </div>
            
            <div className="space-y-4">
              <Quote className="w-6 h-6 mx-auto opacity-20" />
              <p className="text-xl font-serif italic text-ink/80 leading-relaxed px-8">
                “每一个瞬间，都是能量的交织”
              </p>
              <div className="h-px w-12 bg-gold/30 mx-auto" />
              <p className="text-sm opacity-60 px-12">
                人生的落差在于，有了绝佳的创意，却在频率不对时勉强而为，最终在频率对时——早已遗忘。
              </p>
            </div>

            <button
              onClick={handleStart}
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-ink text-paper rounded-full font-medium overflow-hidden transition-all hover:pr-10 active:scale-95"
            >
              <span>生成我的年度行动卡</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-serif italic mb-1">设定你的初始属性</h2>
              <p className="text-xs opacity-50 uppercase tracking-widest">Initial Setting</p>
            </div>

            <form onSubmit={handleBirthSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">降临日期 (公历)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input
                    required
                    type="date"
                    value={birthData.date}
                    onChange={e => setBirthData({ ...birthData, date: e.target.value })}
                    className="w-full bg-white border border-ink/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">降临时分</label>
                  <input
                    required
                    type="time"
                    value={birthData.time}
                    onChange={e => setBirthData({ ...birthData, time: e.target.value })}
                    className="w-full bg-white border border-ink/5 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-mono text-center text-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">出生城市</label>
                  <input
                    required
                    type="text"
                    placeholder="如：北京"
                    value={birthData.city}
                    onChange={e => setBirthData({ ...birthData, city: e.target.value })}
                    className="w-full bg-white border border-ink/5 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-mono text-center text-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 ml-1">能量属性 (性别)</label>
                <div className="grid grid-cols-2 gap-4">
                  {['男', '女'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setBirthData({ ...birthData, gender: g })}
                      className={cn(
                        "py-3 rounded-2xl font-bold transition-all border text-sm",
                        birthData.gender === g 
                          ? "bg-ink text-paper border-ink shadow-lg shadow-ink/10" 
                          : "bg-white text-ink/40 border-ink/5 hover:border-gold/30"
                      )}
                    >
                      {g === '男' ? '乾造 (男)' : '坤造 (女)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-ink text-paper rounded-2xl font-bold transition-all hover:bg-gold active:scale-[0.98] mt-4 shadow-lg shadow-gold/5"
                >
                  下一步：副本扫描
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'quiz' && (
          <QuizStep onComplete={handleQuizComplete} />
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="w-24 h-24 border-2 border-gold/20 rounded-full border-t-gold"
              />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-gold animate-bounce" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-serif italic text-lg">人设加载中...</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">Loading Personality Core</p>
            </div>
          </motion.div>
        )}

        {step === 'result' && result && (
          <ResultView result={result} reset={() => { try { sessionStorage.removeItem(reportKey); } catch {} setResult(null); setStep('landing'); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuizStep({ onComplete }: { onComplete: (answers: { q: string; a: string }[]) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);

  const questions = [
    {
      q: "当你在能量场极佳时，你更倾向于？",
      options: ["在人群中释放光芒", "待在实验室里沉思"],
      type: "维度"
    },
    {
      q: "如果有人说你“最近频率很稳”，你的第一反应是？",
      options: ["啥情况？求翻译", "听不懂但觉得很高级", "那是必须的，我也感觉到了"],
      type: "倾向"
    },
    {
      q: "面对未知的绝佳创意（但当下能量不对），你会？",
      options: ["立刻执行，忘了也没事", "先存起来，等感觉对了再说", "想想要不还是睡一觉"],
      type: "决策"
    },
    {
      q: "你觉得自己核心能量场的状态最像？",
      options: ["炽热燃烧的恒星", "静谧流淌的深海", "一只慵懒的树懒"],
      type: "趣味"
    },
    {
      q: "处理复杂逻辑时，你更依赖？",
      options: ["冷酷的数据推导", "玄学的直觉共鸣"],
      type: "维度"
    },
    {
      q: "如果中了一个亿的量子券，你第一件事是？",
      options: ["买下心仪已久的飞船模型", "寻找大师测算能量守恒", "买下整个森林供流浪小猫开会"],
      type: "趣味"
    },
    {
      q: "进入平行时空，你最希望自己的初始身份是？",
      options: ["掌握禁忌知识的炼金术士", "穿梭星际的遗迹猎人", "猫咖里无所事事的店长"],
      type: "倾向"
    },
    {
      q: "当意识接收到未来的模糊信号，通常你会？",
      options: ["逻辑拆解，寻找因果", "直觉先行，先冲再说", "静坐观察，看看是不是幻觉"],
      type: "维度"
    },
    {
      q: "如果你的频率被一个陌生人瞬间看穿，你会？",
      options: ["感到被冒犯的威胁", "惊喜于找到同频者", "面无表情但内心波涛汹涌"],
      type: "倾向"
    },
    {
      q: "你最偏好的色彩维度是？",
      options: ["深邃的虚空黑", "生机的极光绿", "热烈的超新星红"],
      type: "审美"
    },
    {
      q: "当世界陷入无序，你觉得最好的平衡方式是？",
      options: ["建立严丝合缝的秩序", "顺应自然的涌现路径", "睡一觉再说"],
      type: "决策"
    },
    {
      q: "如果你的性格是一部电影，你觉得名字应该是？",
      options: ["《理性的巅峰》", "《孤独的共振》", "《快乐的人家》"],
      type: "趣味"
    },
    {
      q: "当深夜独自观测星空，你的第一感触是？",
      options: ["渺小个体的数学概率", "万物互联的量子织网", "单纯觉得星星挺好看"],
      type: "倾向"
    }
  ];

  const handleSelect = (a: string) => {
    const newAnswers = [...answers, { q: questions[currentIdx].q, a }];
    if (currentIdx < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-md w-full"
    >
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif italic">意识采集区</h2>
          <p className="text-[10px] uppercase tracking-widest opacity-40">同步进度 {currentIdx + 1}/{questions.length}</p>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={cn("h-1 w-2 rounded-full transition-all", i <= currentIdx ? "bg-gold" : "bg-ink/5")} />
          ))}
        </div>
      </div>

      <div className="min-h-[220px] flex flex-col justify-center gap-6">
        <h3 className="text-xl font-medium leading-normal">{questions[currentIdx].q}</h3>
        <div className="grid gap-3">
          {questions[currentIdx].options.map(opt => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className="w-full text-left p-6 bg-white border border-ink/5 rounded-3xl hover:border-gold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex justify-between items-center group"
            >
              <span className="font-medium">{opt}</span>
              <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all" />
            </button>
          ))}
        </div>
      </div>
      
      <p className="mt-12 text-center text-[10px] opacity-30 italic">
        * 请随直觉点击，过度思考会降低结果精度
      </p>
    </motion.div>
  );
}
