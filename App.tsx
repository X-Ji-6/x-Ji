
import React, { useState, useRef, useEffect } from 'react';
import { analyzeXRay } from './services/geminiService';
import { AnalysisResult, RiskLevel } from './types';
import HeatmapOverlay from './components/HeatmapOverlay';
import RiskBadge from './components/RiskBadge';
import { 
  Upload, 
  Activity, 
  ChevronRight, 
  AlertCircle, 
  Image as ImageIcon, 
  FileText,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeXRay(image);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "分析过程中发生错误，请稍后重试。");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const updateSize = () => {
      if (imageRef.current) {
        setImgSize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [image, result]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">智能肺结节影像分析系统 <span className="text-xs font-normal text-slate-400 ml-2">v1.2 AI Inside</span></h1>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-indigo-600">工作站</a>
              <a href="#" className="hover:text-indigo-600">影像管理</a>
              <a href="#" className="hover:text-indigo-600">历史报告</a>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-500">DR</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Image View */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <ImageIcon className="w-4 h-4" />
                <span>影像查看器</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setImage(null); setResult(null); setError(null); }}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="清除影像"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-8 bg-slate-900 overflow-hidden min-h-[400px]">
              {image ? (
                <div className="relative inline-block max-w-full" ref={containerRef}>
                  <img
                    ref={imageRef}
                    src={image}
                    alt="X-ray Thorax"
                    className="max-h-[600px] object-contain rounded shadow-2xl"
                    onLoad={() => {
                      if (imageRef.current) {
                        setImgSize({
                          width: imageRef.current.clientWidth,
                          height: imageRef.current.clientHeight
                        });
                      }
                    }}
                  />
                  {result && (
                    <HeatmapOverlay 
                      nodules={result.nodules} 
                      width={imgSize.width} 
                      height={imgSize.height} 
                    />
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-700">
                    <Upload className="w-8 h-8 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400">请选择或拖拽X光胸片影像文件</p>
                    <p className="text-slate-600 text-xs">支持 JPG, PNG, DICOM格式</p>
                  </div>
                  <label className="mt-4 inline-flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium cursor-pointer transition-all shadow-lg shadow-indigo-500/20">
                    选择文件
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
              )}
            </div>

            {image && !result && (
              <div className="p-6 bg-white border-t border-slate-100 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在智能分析中...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      开始 AI 检测
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Results & Info */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex gap-3 text-rose-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!result && !analyzing && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-500" />
                使用说明
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-sm text-slate-600">上传患者的高清晰度X光胸片(后前位)。</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p className="text-sm text-slate-600">点击“开始AI检测”，系统将通过深度学习模型识别可疑结节位置。</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p className="text-sm text-slate-600">查看热力图定位及风险等级报告，辅助临床决策。</p>
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>免责声明：</strong>本系统仅供医学研究与临床辅助决策使用，分析结果不作为确诊依据。请务必结合放射科医生的人工审核及临床指征综合评估。
                </p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <Activity className="absolute inset-0 m-auto w-10 h-10 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">深度学习分析中</h3>
              <p className="text-slate-500 text-sm">正在检索病理特征并匹配医学数据库...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      分析报告汇总
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">检测时间: {new Date().toLocaleString()}</p>
                  </div>
                  <RiskBadge level={result.totalRisk} className="text-sm py-1.5 px-4" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">检测到结节数</p>
                    <p className="text-2xl font-bold text-slate-800">{result.nodules.length}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">建议随访周期</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {result.totalRisk === RiskLevel.HIGH ? "立刻复查" : result.totalRisk === RiskLevel.MEDIUM ? "3-6个月" : "12个月"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">影像总结:</h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                    {result.summary}
                  </p>
                  
                  <h3 className="text-sm font-semibold text-slate-700">临床建议:</h3>
                  <div className="flex gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <p>{result.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800">结节明细列表</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {result.nodules.map((nodule, idx) => (
                    <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-800">结节直径: {nodule.size_mm}mm</p>
                            <p className="text-xs text-slate-400">位置坐标: ({Math.round(nodule.x)}%, {Math.round(nodule.y)}%)</p>
                          </div>
                        </div>
                        <RiskBadge level={nodule.risk} />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                        "{nodule.description}"
                      </p>
                    </div>
                  ))}
                  {result.nodules.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                      未发现明显异常结节
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">© 2024 智能医学影像实验室 - 结节 AI 辅助检测工作站</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
