import React, { useEffect, useState } from 'react';
import { Category } from '../types';

interface ProcessingGraphProps {
  category: Category;
  onComplete: () => void;
}

const ProcessingGraph: React.FC<ProcessingGraphProps> = ({ category, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const getStepDescription = (cat: Category, stepId: number) => {
      if (stepId === 3) {
          if (cat === Category.COUPLET) return "大模型文案 & 格律校正";
          if (cat === Category.IP_FIGURE) return "特徵提取 & 擴散生成";
          if (cat === Category.FORTUNE) return "隨機數運算 & 簽文匹配";
      }
      return "";
  }

  const steps = [
    { id: 1, label: "多模態解析 (Parser)", desc: "識別用戶願望..." },
    { id: 2, label: "路由分發 (Dispatch)", desc: `切換至 ${category} 生成線...` },
    { id: 3, label: "AI 構建 (Generation)", desc: getStepDescription(category, 3) },
    { id: 4, label: "渲染交付 (Rendering)", desc: "最終成品組裝中..." }
  ];

  useEffect(() => {
    // Total estimated duration (approx 6s to match steps animation)
    const totalDuration = 6000;
    const intervalTime = 100;
    let elapsed = 0;

    const progressInterval = setInterval(() => {
        elapsed += intervalTime;
        const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
        setProgress(newProgress);
    }, intervalTime);

    // Step logic
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length) {
          clearInterval(stepInterval);
          clearInterval(progressInterval);
          setProgress(100);
          setTimeout(onComplete, 800); 
          return prev;
        }
        return prev + 1;
      });
    }, 1500); // 1.5s per step

    return () => {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
    };
  }, [onComplete, steps.length, category]);

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white/80 border-2 border-red-100 rounded-xl backdrop-blur-sm shadow-[0_4px_20px_rgba(220,38,38,0.1)]">
      <h3 className="text-red-800 text-center mb-6 font-bold tracking-widest text-xl font-serif-sc border-b pb-4 border-red-100">
        AI 工坊製作中
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-8 px-4">
        <div className="flex justify-between text-xs text-red-800 mb-2 font-bold">
            <span>製作進度</span>
            <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden border border-orange-200">
            <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-6 top-4 bottom-4 w-1 bg-orange-100">
          <div 
            className="w-full bg-red-600 transition-all duration-500 ease-linear"
            style={{ height: `${(activeStep / steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-6 pl-16">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`relative transition-all duration-500 ${index < activeStep ? 'opacity-100 transform translate-x-0' : 'opacity-40 translate-x-2'}`}
            >
              {/* Node Dot */}
              <div className={`absolute -left-[3.25rem] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300
                ${index < activeStep ? 'bg-red-600 border-orange-400 shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'bg-stone-200 border-stone-300'}
              `}>
                {index < activeStep && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              </div>

              {/* Content */}
              <div className={`p-4 rounded-lg border transition-all duration-500
                 ${index === activeStep - 1 
                    ? 'bg-red-50 border-red-200 shadow-md' 
                    : 'bg-white border-transparent'}
              `}>
                <h4 className={`font-bold text-lg ${index === activeStep -1 ? 'text-red-700' : 'text-stone-500'}`}>
                  {step.label}
                </h4>
                <p className="text-sm text-stone-500 mt-1">
                   {step.desc}
                </p>
                {index === activeStep - 1 && (
                    <div className="mt-2 text-xs text-red-600 font-bold animate-pulse flex items-center gap-1">
                        <span>⚡</span> 運算中...
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingGraph;