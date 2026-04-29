/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, MapPin, Brain, Share2, ChevronRight, Loader2, Compass, ArrowRight, Quote, Lock } from 'lucide-react';
import { cn } from './lib/utils';
import { calculateTrueSolarTime } from './lib/constants';
import { analysisPersonality, type BaZiResult } from './lib/gemini';

type Step = 'landing' | 'form' | 'quiz' | 'loading' | 'result';

export default function App() {
  const [step, setStep] = useState<Step>('landing');
  const [birthData, setBirthData] = useState({
    date: '',
    time: '12:00',
  });
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [result, setResult] = useState<BaZiResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleStart = () => setStep('form');

  const handleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('quiz');
  };

  const handleQuizComplete = async (quizAnswers: { q: string; a: string }[]) => {
    setAnswers(quizAnswers);
    setStep('loading');
    
    try {
      const resultData = await analysisPersonality(
        birthData.date,
        birthData.time,
        quizAnswers
      );
      setResult(resultData);
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
              <h1 className="text-5xl font-serif tracking-tighter leading-none italic mb-2">频率实验室</h1>
              <p className="text-xs uppercase tracking-[0.3em] font-mono opacity-50">频率与身份实验室</p>
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
              <span>开启人设分析</span>
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
          <ResultView result={result} reset={() => setStep('landing')} />
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

function ResultView({ result, reset }: { result: BaZiResult, reset: () => void }) {
  const [isPaid, setIsPaid] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl w-full py-12 px-4 space-y-16 pb-32 relative"
    >
      {/* Main Social Identity Card */}
      <motion.div
        variants={itemVariants}
        className="relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-gold/30 via-ink/5 to-gold/30 rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-ink/5">
          <div className="absolute top-6 right-8 text-right z-20">
            <p className="text-[10px] uppercase font-bold tracking-widest text-ink/30 mb-0.5">契合度</p>
            <p className="text-4xl font-serif italic text-gold leading-none">{result.score}%</p>
          </div>

          <div className="p-8 md:p-14 space-y-10 relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
            
            <div className="space-y-6 text-center pt-8">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-paper rounded-full border border-gold/10">
                <Sparkles className="w-3 h-3 text-gold" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-mono font-bold text-gold">人设编号 #{Math.floor(result.score * 777)}</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl md:text-7xl font-serif tracking-tighter italic text-ink">{result.vibeLabel}</h2>
                <p className="text-xl md:text-3xl font-serif text-gold/80 italic">{result.dayMaster}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center">
              {result.tags.map(tag => (
                <span key={tag} className="px-5 py-2 bg-ink text-paper text-[11px] rounded-xl font-medium tracking-wider shadow-md hover:scale-105 transition-transform cursor-default italic">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="max-w-xl mx-auto space-y-6 relative">
               <Quote className="w-10 h-10 opacity-5 text-gold absolute -top-4 -left-6" />
               <p className="text-xl md:text-2xl leading-relaxed font-serif italic text-ink/90 text-center">
                 {result.prediction}
               </p>
            </div>

            <div className="pt-10 border-t border-ink/5 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-ink/40">2026 气场实验室</p>
                <h4 className="text-2xl font-serif italic tracking-tighter text-ink opacity-80 leading-none">身份验证成功</h4>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-paper text-ink/20 border border-ink/5">
                  <Share2 className="w-5 h-5" />
                </div>
                <p className="text-[8px] opacity-30 font-mono tracking-tighter">IDENTIFICATION SCANNED</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Sections with Paywall */}
      <div className="relative">
        <div className={cn("space-y-24 transition-all duration-1000", !isPaid && "filter blur-md pointer-events-none select-none opacity-40 brightness-95")}>
          {/* Personality Matrix */}
          <section className="space-y-12">
            <div className="text-center space-y-2">
              <h3 className="text-xs uppercase tracking-[0.4em] font-black text-ink/30">初始人设属性矩阵</h3>
              <div className="h-px w-12 bg-gold/30 mx-auto" />
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {result.eightCharacters.map((item, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="bg-white p-8 rounded-[2rem] border border-ink/5 space-y-6 hover:shadow-2xl hover:shadow-gold/5 transition-all flex flex-col items-center text-center group"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em]">{item.pillar}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-gold/40 shadow-sm shadow-gold" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-5xl font-serif flex items-baseline justify-center gap-1 group-hover:scale-110 transition-transform duration-500">
                      <span className="text-ink">{item.stem}</span>
                      <span className="text-ink/20 text-3xl font-light">{item.branch}</span>
                    </div>
                    <div className="inline-block px-3 py-1 bg-paper rounded-full border border-gold/10">
                      <span className="text-[10px] text-gold font-black uppercase tracking-wider">{item.shishen}</span>
                    </div>
                  </div>
                  <p className="text-xs text-ink/60 leading-relaxed font-serif italic pt-4 border-t border-ink/5 mt-auto">
                    {item.meaning}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Monthly Strategy - Interactive Cards */}
          <section className="space-y-12 px-2">
            <div className="text-center space-y-2">
              <h3 className="text-xs uppercase tracking-[0.4em] font-black text-ink/30">2026 年度副本全攻略</h3>
              <div className="h-px w-12 bg-gold/30 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.monthlyEnergy.map((m, idx) => (
                <motion.div 
                  key={idx} 
                  variants={itemVariants}
                  className="group bg-white p-8 rounded-[2.5rem] border border-ink/5 flex flex-col gap-6 hover:border-gold/30 hover:shadow-2xl transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-bl-[4rem] -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all opacity-20" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex gap-4 items-center">
                      <div className="text-5xl font-serif italic text-ink/10 group-hover:text-gold/20 transition-colors uppercase">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono opacity-40 uppercase">{m.month}</p>
                        <div className="text-xs font-black text-gold uppercase tracking-widest">{m.element} 能量</div>
                      </div>
                    </div>
                    <div className="bg-ink text-paper px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-ink/10">
                      {m.shishen} Buff
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-ink group-hover:text-gold transition-colors">{m.direction}</h4>
                      <p className="text-[9px] opacity-30 font-mono tracking-widest">{m.dateRange}</p>
                    </div>
                    <div className="p-4 bg-paper/50 rounded-2xl border border-ink/5 space-y-2">
                      <p className="text-xs font-serif italic text-ink/70 leading-relaxed"><span className="text-gold font-bold not-italic mr-1">生效：</span>{m.shishenMeaning}</p>
                      <p className="text-[10px] opacity-50 font-serif leading-relaxed">{m.vibe}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Geography Strategy - Travel Cards style */}
          <section className="bg-ink text-paper rounded-[4rem] px-8 py-16 md:p-20 space-y-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] -mr-64 -mt-64" />
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-paper/5 rounded-full border border-paper/10 backdrop-blur-md">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gold">气场大地图 • CO-EXPANSION</span>
                </div>
                <h3 className="font-serif text-5xl md:text-7xl italic leading-none tracking-tighter">地理共生<br /><span className="text-gold">补全计划</span></h3>
              </div>
              <div className="max-w-md lg:text-right">
                <p className="text-base font-serif italic text-paper/60 leading-relaxed mb-4">
                  “物理空间的跨越本质上是频率的重新校准。”
                </p>
                <div className="flex flex-wrap lg:justify-end gap-2">
                  <span className="px-3 py-1 bg-paper/10 rounded-lg text-[9px] font-mono opacity-50">AIR PRESSURE: OPTIMAL</span>
                  <span className="px-3 py-1 bg-paper/10 rounded-lg text-[9px] font-mono opacity-50">COORDS: SCANNING</span>
                </div>
              </div>
            </div>
            
            <div className="grid xl:grid-cols-2 gap-16 relative z-10">
              {/* Domestic */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-paper/30">国内主干副本</h4>
                  <div className="h-px flex-1 bg-paper/10" />
                </div>
                <div className="grid gap-6">
                  {result.yearlyStrategy.domesticCities.map(city => (
                    <motion.div 
                      key={city.name} 
                      whileHover={{ x: 10 }}
                      className="group bg-paper/5 p-8 rounded-3xl border border-paper/10 hover:border-gold/30 hover:bg-paper/[0.08] transition-all relative"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                          <span className="text-3xl font-serif italic text-paper group-hover:text-gold transition-colors">{city.name}</span>
                          <p className="text-[10px] opacity-30 font-mono tracking-widest uppercase italic">Primary Node</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-mono text-gold italic font-black leading-none">{city.score}</p>
                          <p className="text-[8px] font-black opacity-20 uppercase tracking-widest">Similarity</p>
                        </div>
                      </div>
                      <div className="relative pl-6 py-1 border-l-2 border-gold/20 group-hover:border-gold/50 transition-colors">
                        <p className="text-xs text-paper/70 font-serif italic leading-relaxed">
                          {city.reason}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* International */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-paper/30">跨域跃迁副本</h4>
                  <div className="h-px flex-1 bg-paper/10" />
                </div>
                <div className="grid gap-6">
                  {result.yearlyStrategy.intlCities.map(city => (
                    <motion.div 
                      key={city.name} 
                      whileHover={{ x: -10 }}
                      className="group bg-paper/5 p-8 rounded-3xl border border-paper/10 hover:border-gold/30 hover:bg-paper/[0.08] transition-all"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                          <span className="text-3xl font-serif italic text-paper group-hover:text-gold transition-colors">{city.name}</span>
                          <p className="text-[10px] opacity-30 font-mono tracking-widest uppercase italic">Dimensional Link</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-mono text-gold italic font-black leading-none">{city.score}</p>
                          <p className="text-[8px] font-black opacity-20 uppercase tracking-widest">Similarity</p>
                        </div>
                      </div>
                      <div className="relative pl-6 py-1 border-l-2 border-gold/20 group-hover:border-gold/50 transition-colors">
                        <p className="text-xs text-paper/70 font-serif italic leading-relaxed">
                          {city.reason}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative z-10 pt-8"
            >
               <div className="p-12 bg-white/5 rounded-[3rem] border border-paper/10 backdrop-blur-2xl flex flex-col md:flex-row gap-10 items-center md:items-start group">
                  <div className="shrink-0 p-6 bg-gold rounded-full shadow-[0_0_50px_rgba(212,175,55,0.3)] group-hover:rotate-12 transition-transform">
                     <Brain className="w-10 h-10 text-ink" />
                  </div>
                  <div className="space-y-6 text-center md:text-left">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-gold tracking-[0.4em] uppercase">核心策略汇总 • Core Strategic Advice</span>
                       <div className="h-0.5 w-12 bg-gold/50 mx-auto md:mx-0" />
                    </div>
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 rounded-lg text-xs font-bold text-gold italic">
                         # {result.yearlyStrategy.directionTag}
                      </div>
                      <h5 className="text-3xl md:text-5xl font-serif italic leading-none tracking-tighter text-paper">
                        “{result.yearlyStrategy.coreAdvice}”
                      </h5>
                    </div>
                  </div>
               </div>
            </motion.div>
          </section>

          {/* Footer Actions */}
          <div className="flex flex-col items-center gap-12 py-16">
             <button 
               onClick={reset}
               className="group px-14 py-6 rounded-full border-2 border-ink text-xs font-black uppercase tracking-[0.3em] text-ink hover:bg-ink hover:text-paper transition-all hover:scale-105 active:scale-95 shadow-2xl"
             >
               重新采集意识流
             </button>
             <div className="space-y-4 text-center">
               <div className="flex items-center justify-center gap-4 opacity-10">
                 <div className="w-12 h-px bg-ink" />
                 <p className="text-[10px] font-mono tracking-widest uppercase">Atmosphere Lab v5.0 Final Build</p>
                 <div className="w-12 h-px bg-ink" />
               </div>
               <p className="text-[8px] opacity-10 uppercase tracking-[0.5em] font-mono">ENCRYPTED DATA PROTECTION • ZERO PERSISTENCE POLICY</p>
             </div>
          </div>
        </div>

        {/* Paywall Overlay */}
        <AnimatePresence>
          {!isPaid && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center pt-[600px] pointer-events-none"
            >
              <div className="max-w-sm w-full bg-white/95 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-gold/20 shadow-[0_50px_100px_rgba(0,0,0,0.1)] text-center space-y-8 pointer-events-auto">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/20">
                    <Lock className="w-8 h-8 text-gold animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif italic text-ink">读取失败</h3>
                    <p className="text-xs uppercase tracking-widest text-gold font-black">能量耦合不足</p>
                  </div>
                  <p className="text-xs opacity-50 px-4 leading-relaxed font-serif italic">由于 2026 副本数据量级巨大，需同步 9.9 能量券以解锁完整气场报告与补能方案。</p>
                </div>
                
                <button 
                  onClick={() => setShowPayModal(true)}
                  className="w-full py-5 bg-ink text-paper rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:bg-gold hover:text-ink active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 group"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>立即同步结果</span>
                </button>
                
                <div className="flex items-center justify-center gap-2 opacity-30">
                   <div className="w-1 h-1 rounded-full bg-ink" />
                   <div className="w-1 h-1 rounded-full bg-ink" />
                   <div className="w-1 h-1 rounded-full bg-ink" />
                   <p className="text-[10px] font-mono italic">SYNCING 12,482 USERS...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPayModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="bg-white max-w-sm w-full rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/20"
              >
                <div className="p-10 text-center space-y-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-3 py-1 bg-[#07C160]/10 rounded-full border border-[#07C160]/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#07C160] rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-[#07C160] uppercase tracking-widest">Secure Link Established</span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">微信支付</h3>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-[#07C160]/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                    <div className="relative aspect-square max-w-[200px] mx-auto bg-paper rounded-[2.5rem] border-2 border-[#07C160]/10 flex items-center justify-center p-6 bg-white overflow-hidden">
                       {/* Placeholder CSS QR code */}
                       <div className="w-full h-full border-4 border-ink grid grid-cols-5 grid-rows-5 gap-1 p-2 opacity-80">
                         {Array.from({length: 25}).map((_, i) => (
                           <div key={i} className={cn("bg-ink rounded-sm", Math.random() > 0.5 ? "opacity-100" : "opacity-0")} />
                         ))}
                         {/* Positioning Squares */}
                         <div className="absolute top-8 left-8 w-6 h-6 border-4 border-ink bg-white flex items-center justify-center"><div className="w-2 h-2 bg-ink" /></div>
                         <div className="absolute top-8 right-8 w-6 h-6 border-4 border-ink bg-white flex items-center justify-center"><div className="w-2 h-2 bg-ink" /></div>
                         <div className="absolute bottom-8 left-8 w-6 h-6 border-4 border-ink bg-white flex items-center justify-center"><div className="w-2 h-2 bg-ink" /></div>
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white p-2 rounded-xl shadow-lg border border-ink/5">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/73/WeChat_logo.svg" className="w-6 h-6" alt="WeChat" />
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-4xl font-serif italic text-gold font-bold">¥9.90</p>
                    <p className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">Transaction ID: LAB_{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>

                  <div className="grid gap-3 pt-4">
                    <button 
                      onClick={() => {
                          setIsPaid(true);
                          setShowPayModal(false);
                      }}
                      className="w-full py-5 bg-[#07C160] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:bg-[#06ae56] active:scale-[0.98] shadow-xl shadow-[#07C160]/20"
                    >
                      我已支付
                    </button>
                    <button 
                      onClick={() => setShowPayModal(false)}
                      className="w-full py-4 bg-paper text-ink/40 rounded-2xl font-bold transition-all hover:bg-ink/5 text-xs uppercase tracking-widest"
                    >
                      取消扫描
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

