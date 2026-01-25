import React, { useState, useRef } from 'react';
import { AppState, Category, UserInput, GeneratedResult } from './types';
import { CATEGORIES, MERMAID_CODE, APP_NAME } from './constants';
import { generateCouplet, generateIPFigure, generateFortune } from './services/geminiService';
import ProcessingGraph from './components/ProcessingGraph';

export default function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [category, setCategory] = useState<Category>(Category.COUPLET);
  const [inputText, setInputText] = useState('');
  const [inputImage, setInputImage] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [showMermaid, setShowMermaid] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = (selectedCat: Category) => {
    setCategory(selectedCat);
    setState(AppState.CONFIGURING);
    setResult(null);
    setErrorMsg('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startGeneration = async () => {
    if (!inputText) return;
    setState(AppState.PROCESSING);

    try {
      let res: GeneratedResult = { category };

      if (category === Category.COUPLET) {
        const couplet = await generateCouplet(inputText);
        res.couplet = couplet;
      } else if (category === Category.IP_FIGURE) {
        const imgUrl = await generateIPFigure(inputText, inputImage);
        res.imageUrl = imgUrl;
      } else if (category === Category.FORTUNE) {
        const fortune = await generateFortune(inputText);
        res.fortune = fortune;
      }

      setResult(res);
      // ProcessingGraph will call onComplete to switch to result
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "生成失敗，請稍後再試。");
      setState(AppState.ERROR);
    }
  };

  const handleProcessComplete = () => {
    if (state !== AppState.ERROR) {
       setState(AppState.RESULT);
    }
  };

  // --- Render Helpers ---

  const renderCouplet = () => {
    if (!result?.couplet) return null;
    return (
      <div className="relative font-calligraphy py-16 px-4 md:px-12 bg-[#b91c1c] rounded-lg shadow-2xl border-[6px] border-[#fbbf24] max-w-3xl mx-auto overflow-hidden">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none"></div>
        <div className="absolute inset-0 border-2 border-[#7f1d1d] m-2 pointer-events-none rounded"></div>
        
        {/* Traditional Patterns Corners */}
        <div className="absolute top-2 left-2 text-[#fbbf24] opacity-50 text-4xl">☁️</div>
        <div className="absolute top-2 right-2 text-[#fbbf24] opacity-50 text-4xl">☁️</div>
        
        <div className="flex justify-between items-stretch gap-4 md:gap-12 relative z-10">
          {/* Upper Scroll */}
          <div className="bg-[#fee2e2] text-[#450a0a] px-5 py-8 md:px-8 md:py-12 rounded shadow-inner border border-[#fca5a5] flex flex-col items-center hover:scale-[1.02] transition-transform">
            <div className="couplet-text text-2xl md:text-4xl font-bold leading-loose">
              {result.couplet.upper}
            </div>
          </div>
          
          {/* Center Info */}
          <div className="flex flex-col justify-center items-center py-4 flex-1">
               <div className="bg-[#fbbf24] text-[#7f1d1d] px-6 py-4 rounded shadow-lg border-2 border-[#b45309] mb-8 text-center rotate-0 md:-rotate-0 hover:rotate-2 transition-transform">
                   <span className="text-2xl md:text-3xl font-bold tracking-[0.5em] mr-[-0.5em] block">{result.couplet.horizontal}</span>
               </div>
               
               <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10 text-white/90 text-sm md:text-base italic text-center font-serif leading-relaxed">
                   <span className="opacity-70 text-xs block mb-1">寓意解析</span>
                   "{result.couplet.explanation}"
               </div>
          </div>

          {/* Lower Scroll */}
          <div className="bg-[#fee2e2] text-[#450a0a] px-5 py-8 md:px-8 md:py-12 rounded shadow-inner border border-[#fca5a5] flex flex-col items-center hover:scale-[1.02] transition-transform">
            <div className="couplet-text text-2xl md:text-4xl font-bold leading-loose">
              {result.couplet.lower}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFortune = () => {
    if (!result?.fortune) return null;
    return (
      <div className="flex justify-center perspective-1000">
        <div className="bg-[#fff1f2] border-4 border-[#dc2626] p-2 rounded-lg shadow-2xl max-w-md w-full relative">
            <div className="border border-[#dc2626] h-full p-6 rounded relative bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]">
                {/* Header */}
                <div className="text-center border-b-2 border-[#dc2626] pb-4 mb-6">
                    <div className="text-xs font-bold text-stone-500 tracking-[0.3em] uppercase mb-1">Lunar 2025</div>
                    <div className="text-4xl text-[#dc2626] font-calligraphy mb-2">{result.fortune.level}</div>
                    <div className="text-lg font-bold text-stone-800">【 {result.fortune.title} 】</div>
                </div>

                {/* Poem */}
                <div className="flex justify-center gap-6 mb-8 py-4 bg-red-50/50 rounded-lg">
                    {result.fortune.poem.map((line, idx) => (
                         <div key={idx} className="couplet-text text-xl md:text-2xl font-serif text-stone-800 font-bold leading-loose">
                            {line}
                         </div>
                    ))}
                </div>

                {/* Explanation */}
                <div className="text-stone-700 text-sm md:text-base leading-relaxed text-justify font-serif border-t border-red-200 pt-4">
                    <span className="text-[#dc2626] font-bold mr-1">解曰：</span>
                    {result.fortune.explanation}
                </div>

                {/* Stamp Decoration */}
                <div className="absolute bottom-4 right-4 opacity-20 transform -rotate-12 border-4 border-[#dc2626] text-[#dc2626] w-24 h-24 rounded-full flex items-center justify-center text-4xl font-calligraphy pointer-events-none">
                    大吉
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-[#ef4444] selection:text-white pb-20">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl"></div>
      </div>

      <header className="relative z-10 px-6 py-4 flex justify-between items-center border-b border-stone-200 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#dc2626] rounded-lg shadow-lg flex items-center justify-center border-2 border-[#fbbf24]">
             <span className="text-white font-bold text-xl">福</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#7f1d1d]">
            LunarCraft <span className="text-[#dc2626]">AI</span>
          </h1>
        </div>
        <button 
          onClick={() => setShowMermaid(!showMermaid)}
          className="text-xs font-bold text-[#b45309] border border-[#b45309] px-3 py-1.5 rounded hover:bg-[#b45309] hover:text-white transition-colors uppercase tracking-wider"
        >
          {showMermaid ? '隱藏架構圖' : '查看架構圖'}
        </button>
      </header>

      {/* Blueprint View Overlay */}
      {showMermaid && (
        <div className="relative z-10 max-w-5xl mx-auto mt-4 p-4 bg-white/90 rounded-xl border border-stone-200 shadow-xl mx-4">
           <pre className="text-xs text-stone-600 font-mono overflow-auto p-4 bg-stone-50 rounded border border-stone-100">
             {MERMAID_CODE}
           </pre>
        </div>
      )}

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        
        {/* IDLE STATE */}
        {state === AppState.IDLE && (
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up mt-8">
             <div className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold mb-4 tracking-wider border border-red-200">
                ✨ 2025 乙巳蛇年 • AI 造物
             </div>
             <h2 className="text-5xl md:text-7xl font-bold mb-6 text-[#450a0a] font-serif tracking-tight">
               定製您的<br/><span className="text-[#dc2626]">專屬年味</span>
             </h2>
             <p className="text-stone-600 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
               輸入您的新年願望，讓多模態 AI 爲您編織傳統與科技交融的節日禮物。
             </p>

             <div className="grid md:grid-cols-3 gap-6">
               {CATEGORIES.map(cat => (
                 <button
                   key={cat.id}
                   onClick={() => handleStart(cat.id)}
                   className="group relative p-8 bg-white border border-stone-200 rounded-2xl hover:border-red-400 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(220,38,38,0.1)] text-left"
                 >
                   <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{cat.icon}</div>
                   <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-[#dc2626] font-serif">{cat.label}</h3>
                   <p className="text-sm text-stone-500 leading-relaxed">{cat.desc}</p>
                   <div className="absolute top-4 right-4 text-stone-300 group-hover:text-red-500 transition-colors">↗</div>
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* CONFIGURING STATE */}
        {state === AppState.CONFIGURING && (
           <div className="max-w-2xl mx-auto mt-8">
              <button onClick={() => setState(AppState.IDLE)} className="text-stone-500 hover:text-[#dc2626] mb-6 flex items-center gap-2 font-bold transition-colors">
                ← 返回首頁
              </button>
              
              <div className="bg-white border border-stone-200 shadow-xl p-8 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#dc2626] to-[#f59e0b]"></div>
                 
                 <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-red-50 text-3xl flex items-center justify-center rounded-full mx-auto mb-4 text-[#dc2626] border-2 border-red-100">
                        {CATEGORIES.find(c => c.id === category)?.icon}
                    </div>
                    <h2 className="text-3xl font-bold text-stone-900 font-serif">
                        {CATEGORIES.find(c => c.id === category)?.label}
                    </h2>
                 </div>

                 <div className="space-y-6">
                    <div>
                      <label className="block text-stone-700 font-bold mb-2">
                          {category === Category.FORTUNE ? '誠心祈願 (Prompt)' : '請許下您的新年願望 (Prompt)'}
                      </label>
                      <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={category === Category.FORTUNE ? "例如：問今年的事業運勢..." : "例如：祝願家人身體健康，事業像代碼一樣沒有Bug，財源廣進..."}
                        className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl p-4 text-stone-800 focus:outline-none focus:border-[#dc2626] focus:bg-white transition-all h-36 resize-none placeholder-stone-400"
                      />
                    </div>

                    {(category === Category.IP_FIGURE) && (
                      <div>
                        <label className="block text-stone-700 font-bold mb-2">上傳參考圖 (可選)</label>
                        <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-[#dc2626] hover:bg-red-50/50 cursor-pointer transition-colors bg-stone-50"
                        >
                           {inputImage ? (
                             <div className="relative inline-block">
                                <img src={inputImage} alt="Preview" className="h-32 rounded-lg shadow-md object-cover" />
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✓</div>
                             </div>
                           ) : (
                             <div className="text-stone-500">
                               <span className="text-3xl block mb-2 opacity-50">📷</span>
                               <span className="font-bold">點擊上傳</span> 或拖拽圖片至此
                             </div>
                           )}
                           <input 
                             type="file" 
                             ref={fileInputRef} 
                             onChange={handleImageUpload} 
                             className="hidden" 
                             accept="image/*"
                           />
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={startGeneration}
                      disabled={!inputText}
                      className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] mt-4 text-lg tracking-widest"
                    >
                      {category === Category.FORTUNE ? '求籤' : '開始生成'}
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* PROCESSING STATE */}
        {state === AppState.PROCESSING && (
           <div className="mt-12">
               <ProcessingGraph category={category} onComplete={handleProcessComplete} />
           </div>
        )}

        {/* RESULT STATE */}
        {state === AppState.RESULT && result && (
           <div className="max-w-4xl mx-auto animate-fade-in mt-8">
              <div className="text-center mb-10">
                <div className="inline-block mb-3">
                    <span className="bg-[#16a34a] text-white text-xs px-2 py-1 rounded font-bold tracking-wider">GENERATION SUCCESS</span>
                </div>
                <h2 className="text-4xl text-[#7f1d1d] font-bold font-serif">您的新春數智年貨</h2>
              </div>

              {category === Category.COUPLET && renderCouplet()}
              {category === Category.FORTUNE && renderFortune()}

              {category === Category.IP_FIGURE && result.imageUrl && (
                 <div className="flex flex-col items-center">
                    <div className="p-4 bg-white rounded-2xl shadow-2xl rotate-1 border border-stone-100 max-w-lg w-full">
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
                            <img src={result.imageUrl} alt="Generated IP" className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-4 text-center">
                            <p className="font-serif text-xl font-bold text-stone-800">" 乙巳靈蛇 • 潮玩限定 "</p>
                            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">Designed by Gemini 2.5</p>
                        </div>
                    </div>
                 </div>
              )}

              <div className="flex justify-center gap-4 mt-16">
                 <button 
                   onClick={() => setState(AppState.CONFIGURING)}
                   className="px-8 py-3 border-2 border-stone-300 text-stone-600 font-bold rounded-full hover:border-[#dc2626] hover:text-[#dc2626] transition-colors"
                 >
                   重新調整
                 </button>
                 <button 
                   onClick={() => setState(AppState.IDLE)}
                   className="px-8 py-3 bg-[#dc2626] text-white rounded-full hover:bg-[#b91c1c] font-bold transition-all shadow-lg hover:shadow-xl"
                 >
                   製作新作品
                 </button>
              </div>
           </div>
        )}
        
        {state === AppState.ERROR && (
             <div className="max-w-xl mx-auto text-center p-8 bg-white border border-red-200 rounded-2xl shadow-xl mt-12">
                 <div className="text-5xl mb-6">⚠️</div>
                 <h3 className="text-2xl text-[#dc2626] font-bold mb-2">系統繁忙</h3>
                 <p className="text-stone-500 mb-8">{errorMsg}</p>
                 <button 
                   onClick={() => setState(AppState.CONFIGURING)}
                   className="px-8 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold rounded-lg transition-colors shadow-lg"
                 >
                   重試
                 </button>
             </div>
        )}

      </main>
    </div>
  );
}