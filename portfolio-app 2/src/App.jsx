import { useState, useMemo, useRef, useEffect } from "react";

// ─── API KEY（从 .env.local 读取）────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

// ─── TEMPLATES ────────────────────────────────────────────────────────────────
const T = {
  product:   { id:"product",   name:"产品",    icon:"🧩", color:"#0d7377", light:"#e6f4f4",
    jobs:["产品经理","高级产品经理","产品总监","产品运营","产品策划","增长产品经理"],
    fields:["需求背景","用户规模","核心功能","上线版本"],
    metrics:["DAU/MAU","功能使用率","NPS","交付周期"],
    tags:["需求分析","原型设计","用户调研","数据分析","A/B测试","竞品分析","迭代优化","项目管理"],
    ph:{title:"付费会员体系重构",desc:"重新梳理会员权益体系，提升付费转化与续费留存"} },
  operation: { id:"operation", name:"运营",    icon:"📣", color:"#c2410c", light:"#fff3eb",
    jobs:["运营专员","运营经理","高级运营","运营总监","内容运营","用户运营","活动运营","社群运营"],
    fields:["活动背景","目标用户","渠道策略","执行周期"],
    metrics:["GMV/营收","DAU增量","转化率","ROI"],
    tags:["用户增长","内容运营","活动策划","社群运营","数据运营","拉新促活","品牌合作","用户留存"],
    ph:{title:"双11大促整体运营",desc:"统筹全平台双11活动，覆盖拉新、促活、转化三大目标"} },
  ads:       { id:"ads",       name:"广告销售", icon:"💰", color:"#6d28d9", light:"#f2eeff",
    jobs:["广告销售","销售经理","大客户经理","商务拓展","媒介顾问","KA经理"],
    fields:["客户行业","预算规模","投放渠道","合作周期"],
    metrics:["签约金额","客户数","续约率","CTR/CVR"],
    tags:["客户开发","方案提案","效果优化","账户管理","大客户","品牌广告","效果广告","行业洞察"],
    ph:{title:"某快消品牌年框合作",desc:"签下TOP快消品牌年框，覆盖品牌+效果投放"} },
  marketing: { id:"marketing", name:"市场",    icon:"🎯", color:"#b91c1c", light:"#fff0f0",
    jobs:["市场专员","市场经理","品牌经理","整合营销","增长营销","CMO"],
    fields:["营销目标","目标受众","核心卖点","传播渠道"],
    metrics:["品牌曝光","线索量","CAC","市场份额"],
    tags:["品牌建设","内容营销","PR传播","KOL合作","SEO/SEM","活动策划","市场调研","增长黑客"],
    ph:{title:"新品上市整合营销",desc:"策划新品上市方案，全渠道协同提升声量"} },
  data:      { id:"data",      name:"数据",    icon:"📊", color:"#1d4ed8", light:"#eff3ff",
    jobs:["数据分析师","高级数据分析师","数据科学家","BI工程师","数据产品经理","算法工程师"],
    fields:["分析背景","数据来源","分析方法","落地应用"],
    metrics:["分析准确率","采纳率","模型提升","业务改善"],
    tags:["数据建模","用户画像","漏斗分析","A/B测试","BI报表","预测模型","指标体系","数据治理"],
    ph:{title:"用户流失预警模型",desc:"建立行为预警模型，识别高流失风险用户并干预"} },
  tech:      { id:"tech",      name:"技术",    icon:"⚙️", color:"#065f46", light:"#ecfdf5",
    jobs:["前端工程师","后端工程师","全栈工程师","技术负责人","架构师","技术总监"],
    fields:["技术背景","架构方案","技术栈","难点突破"],
    metrics:["性能提升","稳定性","研发效率","用户规模"],
    tags:["前端","后端","AI/ML","架构设计","DevOps","移动端","数据库","安全"],
    ph:{title:"推荐系统重构",desc:"重构千万级用户推荐系统，提升准确率与实时性"} },
};

const SAMPLE = [
  { id:1, industry:"operation", status:"done", title:"双11大促整体运营", description:"统筹全平台双11活动，协调产品/设计/技术/供应链等10+团队，覆盖预热期、爆发期、返场期共21天", jobTitle:"运营总监", company:"某电商平台", startDate:"2023-09", endDate:"2023-11", extraFields:{"活动背景":"年度最大节点，目标超越去年20%","目标用户":"25-40岁女性用户","渠道策略":"首页+推送+直播+短视频","执行周期":"21天"}, metrics:[{label:"GMV",before:"2.1亿",after:"3.4亿",delta:"+61.9%"},{label:"DAU峰值",before:"180万",after:"310万",delta:"+72.2%"},{label:"转化率",before:"3.2%",after:"5.8%",delta:"+2.6pp"}], tags:["活动策划","用户增长","数据运营"], progress:100, highlights:"首次实现跨平台直播联动，单场直播GMV破千万" },
  { id:2, industry:"product",   status:"ongoing", title:"会员体系2.0重构", description:"重设计付费会员权益架构，解决权益同质化问题，提升付费意愿与续费率", jobTitle:"高级产品经理", company:"某科技公司", startDate:"2024-03", endDate:"", extraFields:{"需求背景":"会员转化率持续下滑","用户规模":"注册2000万/付费120万","核心功能":"差异化权益+动态定价+等级体系","上线版本":"v2.0"}, metrics:[{label:"付费转化率",before:"6.1%",after:"—",delta:"目标9%"},{label:"月续费率",before:"71%",after:"—",delta:"目标85%"}], tags:["需求分析","用户调研","A/B测试"], progress:65, highlights:"调研500人+竞品分析完成，开发联调中" },
  { id:3, industry:"ads",       status:"done", title:"某美妆品牌年框签约", description:"从0到1开发TOP美妆客户，完成品牌+效果一体化投放方案，签约年度框架", jobTitle:"大客户经理", company:"某广告媒体", startDate:"2023-06", endDate:"2023-12", extraFields:{"客户行业":"美妆/个护","预算规模":"年度800万","投放渠道":"信息流+搜索+开屏","合作周期":"12个月"}, metrics:[{label:"签约金额",before:"0",after:"800万",delta:"新客突破"},{label:"品牌曝光",before:"—",after:"4.2亿次",delta:""},{label:"ROI",before:"—",after:"1:6.8",delta:"超行业均值"}], tags:["客户开发","大客户","品牌广告"], progress:100, highlights:"Q4续约谈判中，客户预计增加30%预算" },
  { id:4, industry:"data",      status:"ongoing", title:"用户分层运营指标体系", description:"构建全量用户行为标签体系，支撑精细化运营决策，打通产品-运营-数据协作链路", jobTitle:"数据分析师", company:"某科技公司", startDate:"2024-01", endDate:"", extraFields:{"分析背景":"运营缺乏精准画像，投放浪费","数据来源":"埋点+CRM+第三方","分析方法":"RFM模型+聚类算法","落地应用":"精准推送+个性化首页"}, metrics:[{label:"标签覆盖率",before:"23%",after:"81%",delta:"+58pp"},{label:"精准推送CTR",before:"1.2%",after:"—",delta:"目标3.5%"}], tags:["用户画像","数据建模","指标体系"], progress:45, highlights:"RFM模型已上线，精准推送模块开发中" },
  { id:5, industry:"marketing", status:"done", title:"新品发布整合传播", description:"统筹新产品发布整合传播，协调PR/KOL/社交媒体多渠道协同扩大声量", jobTitle:"市场经理", company:"某品牌公司", startDate:"2023-11", endDate:"2024-01", extraFields:{"营销目标":"新品认知度快速破圈","目标受众":"18-30岁Z世代","核心卖点":"科技感+高颜值","传播渠道":"微博+小红书+抖音+媒体PR"}, metrics:[{label:"媒体曝光",before:"—",after:"12亿次",delta:""},{label:"社媒互动",before:"—",after:"380万次",delta:"+210%"},{label:"搜索指数",before:"基准100",after:"峰值1840",delta:"+18.4x"}], tags:["PR传播","KOL合作","品牌建设","内容营销"], progress:100, highlights:"登上微博热搜TOP5，小红书相关笔记破10万篇" },
];

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const STORAGE_KEY = "portfolio-projects-v1";
function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SAMPLE;
  } catch {
    return SAMPLE;
  }
}
function saveProjects(projects) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch {}
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function TagPill({ label, color="#4f5882", bg="#f0f1f8", onRemove, onClick, active, small }) {
  const sz = small ? {padding:"1px 7px",fontSize:10} : {padding:"3px 10px",fontSize:11};
  return (
    <span onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:3,borderRadius:999,fontWeight:600,background:active?color:bg,color:active?"#fff":color,cursor:(onClick||onRemove)?"pointer":"default",border:`1px solid ${active?color:"transparent"}`,transition:"all .12s",userSelect:"none",...sz}}>
      {label}
      {onRemove && <span onClick={e=>{e.stopPropagation();onRemove();}} style={{fontSize:12,lineHeight:1,opacity:.5,marginLeft:1}}>×</span>}
    </span>
  );
}

function Arc({ pct, color, size=34 }) {
  const r=12,cx=size/2,cy=size/2,circ=2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{flexShrink:0}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef0f6" strokeWidth="2.5"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
        transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dashoffset .4s"}}/>
      <text x={cx} y={cy+3.5} textAnchor="middle" fontSize="8" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}

// ─── AI INTERVIEW MODAL ───────────────────────────────────────────────────────
function InterviewModal({ project, onClose }) {
  const tmpl = T[project.industry];
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [noKey, setNoKey] = useState(!API_KEY);
  const bottomRef = useRef(null);

  const projectContext = `项目名称：${project.title}
岗位名称：${project.jobTitle}
所在公司：${project.company}
项目时间：${project.startDate}${project.endDate ? ` 至 ${project.endDate}` : " 至今"}
项目描述：${project.description}
量化成果：${project.metrics.map(m=>`${m.label}${m.before?` 从${m.before}`:""}${m.after&&m.after!=="—"?`到${m.after}`:""}${m.delta?`(${m.delta})`:""}`).join("；")}
项目亮点：${project.highlights || "无"}
${Object.entries(project.extraFields||{}).filter(([,v])=>v).map(([k,v])=>`${k}：${v}`).join("\n")}`.trim();

  const systemPrompt = `你是一位经验丰富的互联网行业面试官，正在对候选人进行针对以下项目的深度面试：

${projectContext}

面试规则：
1. 围绕这个项目，逐步深入考察候选人的理解深度、决策过程、挑战应对和总结反思
2. 层次递进：背景了解 → 核心挑战 → 具体决策 → 结果复盘 → 经验提炼
3. 对回答给简短点评后继续追问更深的问题
4. 语气专业友好，像真实一对一面试
5. 每次只问一个问题，控制在120字以内
6. 适当使用追问技巧，如"能具体说说吗"、"当时是怎么做决定的"

请先简短自我介绍面试场景，然后提第一个问题。`;

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages, loading]);

  const callAI = async (msgs) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:systemPrompt, messages:msgs })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content?.map(c=>c.text||"").join("") || "获取回复失败";
  };

  const startInterview = async () => {
    setStarted(true); setLoading(true);
    try {
      const text = await callAI([{role:"user",content:"开始面试"}]);
      setMessages([{role:"ai",text}]);
    } catch(e) {
      setMessages([{role:"ai",text:`❌ ${e.message || "连接失败，请检查 API Key 是否正确"}`}]);
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    const newMsgs = [...messages, {role:"user",text:userMsg}];
    setMessages(newMsgs); setLoading(true);
    try {
      const apiMsgs = newMsgs.map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
      const text = await callAI(apiMsgs);
      setMessages(p=>[...p,{role:"ai",text}]);
    } catch(e) {
      setMessages(p=>[...p,{role:"ai",text:`❌ ${e.message || "网络错误，请重试"}`}]);
    }
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(10,14,30,.6)",backdropFilter:"blur(5px)",padding:20}}>
      <div style={{width:"100%",maxWidth:600,height:"85vh",background:"#fff",borderRadius:20,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 28px 70px rgba(0,0,0,.22)"}}>

        {/* header */}
        <div style={{padding:"15px 20px 13px",borderBottom:"1px solid #f0f2f8",display:"flex",alignItems:"center",gap:11,flexShrink:0,background:`linear-gradient(135deg,${tmpl.color}08,transparent)`}}>
          <div style={{width:36,height:36,borderRadius:11,background:tmpl.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🎤</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:14,color:"#1a1d2e",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{project.title}</div>
            <div style={{fontSize:11,color:"#a8afc4",marginTop:1}}>{project.jobTitle} · AI 面试模拟</div>
          </div>
          <button onClick={onClose} style={{background:"#f3f4fa",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",color:"#6b7280",flexShrink:0}}>✕</button>
        </div>

        {/* no key warning */}
        {noKey && (
          <div style={{margin:"12px 16px",padding:"10px 14px",background:"#fff8e8",borderRadius:10,border:"1px solid #fde68a",fontSize:12,color:"#92400e",lineHeight:1.7}}>
            ⚠️ 未检测到 API Key。请在项目根目录创建 <code style={{background:"#fef3c7",padding:"1px 5px",borderRadius:4}}>.env.local</code> 文件并填入 <code style={{background:"#fef3c7",padding:"1px 5px",borderRadius:4}}>VITE_ANTHROPIC_API_KEY=你的key</code>，然后重启 <code style={{background:"#fef3c7",padding:"1px 5px",borderRadius:4}}>npm run dev</code>
          </div>
        )}

        {/* messages */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:14,background:"#fafbff"}}>
          {!started && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:18,textAlign:"center",padding:"0 20px"}}>
              <div style={{fontSize:48}}>🎯</div>
              <div>
                <div style={{fontWeight:800,fontSize:18,color:"#1a1d2e",marginBottom:8}}>面试模拟准备好了</div>
                <div style={{fontSize:13,color:"#8891a8",lineHeight:1.8,maxWidth:340}}>AI 面试官将基于项目「{project.title}」进行深度面试，考察你对这个项目的理解、决策思路和结果复盘能力</div>
              </div>
              <div style={{background:tmpl.light,borderRadius:12,padding:"11px 16px",fontSize:12,color:tmpl.color,fontWeight:600,border:`1px solid ${tmpl.color}30`,maxWidth:340,lineHeight:1.7,textAlign:"left"}}>
                💡 像真实面试一样回答，细节越丰富，追问越有价值
              </div>
              <button onClick={startInterview} disabled={noKey} style={{padding:"12px 32px",background:noKey?"#e5e7eb":tmpl.color,color:noKey?"#9ca3af":"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:14,cursor:noKey?"not-allowed":"pointer",fontFamily:"inherit",letterSpacing:"0.03em",boxShadow:noKey?"none":`0 4px 14px ${tmpl.color}44`}}>
                {noKey ? "需要先配置 API Key" : "开始面试 →"}
              </button>
            </div>
          )}

          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:9,flexDirection:m.role==="user"?"row-reverse":"row",alignItems:"flex-end"}}>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,background:m.role==="user"?"#e8eaf4":"#1a1d2e"}}>
                {m.role==="user"?"👤":"🤖"}
              </div>
              <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",background:m.role==="user"?"#1a1d2e":tmpl.light,color:m.role==="user"?"#fff":"#1a1d2e",fontSize:13,lineHeight:1.8,border:m.role==="user"?"none":`1px solid ${tmpl.color}18`,whiteSpace:"pre-wrap"}}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{display:"flex",gap:9,alignItems:"flex-end"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"#1a1d2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🤖</div>
              <div style={{padding:"12px 16px",borderRadius:"4px 14px 14px 14px",background:tmpl.light,border:`1px solid ${tmpl.color}18`,display:"flex",gap:5,alignItems:"center"}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:6,height:6,borderRadius:"50%",background:tmpl.color,animation:"bounce .9s infinite",animationDelay:`${i*.18}s`}}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* input */}
        {started && (
          <div style={{padding:"11px 16px",borderTop:"1px solid #f0f2f8",display:"flex",gap:9,flexShrink:0,background:"#fff"}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="输入回答，Enter 发送 · Shift+Enter 换行" disabled={loading}
              style={{flex:1,padding:"9px 12px",borderRadius:10,border:"1.5px solid #e4e7f0",fontSize:13,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.6,background:"#fafbff",color:"#1a1d2e",height:56,boxSizing:"border-box"}}/>
            <button onClick={send} disabled={!input.trim()||loading}
              style={{padding:"0 16px",background:input.trim()&&!loading?tmpl.color:"#e8eaf4",color:input.trim()&&!loading?"#fff":"#a8afc4",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:input.trim()&&!loading?"pointer":"not-allowed",fontFamily:"inherit",flexShrink:0,transition:"all .15s"}}>
              发送
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ─── PROJECT ROW ──────────────────────────────────────────────────────────────
function ProjectRow({ p, expanded, onToggle, onEdit, onDelete, onToggleStatus, onInterview }) {
  const tmpl = T[p.industry];
  const done = p.status === "done";

  return (
    <div style={{background:"#fff",borderRadius:11,border:`1px solid ${expanded?"#c7cde8":"#e8eaf4"}`,overflow:"hidden",boxShadow:expanded?"0 4px 18px rgba(0,0,0,.07)":"none",transition:"border-color .15s,box-shadow .15s"}}>
      {/* compact row */}
      <div style={{display:"grid",gridTemplateColumns:"3px 26px 1fr 110px 100px 34px auto",alignItems:"center",gap:0,paddingRight:10,minHeight:48}}>
        <div onClick={onToggle} style={{alignSelf:"stretch",background:done?`${tmpl.color}40`:tmpl.color,cursor:"pointer"}}/>
        <div onClick={onToggle} style={{fontSize:14,textAlign:"center",paddingLeft:10,cursor:"pointer"}}>{tmpl.icon}</div>
        <div onClick={onToggle} style={{padding:"9px 12px 9px 10px",minWidth:0,cursor:"pointer"}}>
          <div style={{fontSize:13.5,fontWeight:700,color:done?"#9aa0b8":"#1a1d2e",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</div>
          <div style={{fontSize:11,color:"#a8afc4",marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {p.jobTitle} · {p.company} · {p.startDate}{p.endDate?` — ${p.endDate}`:" 至今"}
          </div>
        </div>
        <div onClick={onToggle} style={{textAlign:"right",paddingRight:14,cursor:"pointer"}}>
          {p.metrics[0]?<>
            <div style={{fontSize:13,fontWeight:800,color:done?"#059669":"#c2410c",lineHeight:1.2}}>
              {p.metrics[0].after&&p.metrics[0].after!=="—"?p.metrics[0].after:p.metrics[0].delta}
            </div>
            <div style={{fontSize:10,color:"#a8afc4"}}>{p.metrics[0].label}</div>
          </>:<div/>}
        </div>
        <div onClick={onToggle} style={{display:"flex",gap:4,overflow:"hidden",cursor:"pointer"}}>
          {p.tags.slice(0,1).map(t=><TagPill key={t} label={t} color={tmpl.color} bg={tmpl.light} small/>)}
          {p.tags.length>1&&<span style={{fontSize:10,color:"#a8afc4",alignSelf:"center",whiteSpace:"nowrap"}}>+{p.tags.length-1}</span>}
        </div>
        <div onClick={onToggle} style={{display:"flex",justifyContent:"center",cursor:"pointer"}}>
          {done
            ?<div style={{width:20,height:20,borderRadius:"50%",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#059669",fontWeight:700}}>✓</div>
            :<Arc pct={p.progress} color={tmpl.color}/>}
        </div>
        {/* inline action buttons */}
        <div style={{display:"flex",alignItems:"center",gap:3,paddingLeft:6}}>
          {[
            {icon:"✎",  title:"编辑",     fn:e=>{e.stopPropagation();onEdit(p);},       hBg:"#f4f5fb",hBd:"#c7cde8",hCo:"#4a4f6a"},
            {icon:"🎤", title:"面试模拟", fn:e=>{e.stopPropagation();onInterview(p);},  hBg:tmpl.light,hBd:`${tmpl.color}88`,hCo:tmpl.color},
          ].map(({icon,title,fn,hBg,hBd,hCo})=>(
            <button key={title} onClick={fn} title={title}
              style={{width:28,height:28,borderRadius:7,border:"1px solid #e4e7f0",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#a8afc4",transition:"all .12s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=hBg;e.currentTarget.style.borderColor=hBd;e.currentTarget.style.color=hCo;}}
              onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor="#e4e7f0";e.currentTarget.style.color="#a8afc4";}}>
              {icon}
            </button>
          ))}
          <div onClick={onToggle} style={{width:20,fontSize:11,color:"#c8cede",transform:expanded?"rotate(180deg)":"rotate(0)",transition:"transform .2s",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",userSelect:"none"}}>▼</div>
        </div>
      </div>

      {/* expanded */}
      {expanded && (
        <div style={{borderTop:"1px solid #f0f2f8",padding:"16px 18px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
            <div>
              <p style={{margin:"0 0 12px",fontSize:13,color:"#4a4f6a",lineHeight:1.75}}>{p.description}</p>
              {p.highlights&&(
                <div style={{fontSize:12,color:"#4a4f6a",background:"#f7f8ff",borderRadius:8,padding:"8px 11px",marginBottom:12,borderLeft:`3px solid ${tmpl.color}`}}>
                  💡 {p.highlights}
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 14px"}}>
                {Object.entries(p.extraFields||{}).filter(([,v])=>v).map(([k,v])=>(
                  <div key={k}>
                    <div style={{fontSize:10,fontWeight:700,color:"#a8afc4",textTransform:"uppercase",letterSpacing:"0.05em"}}>{k}</div>
                    <div style={{fontSize:12,color:"#1a1d2e",marginTop:1}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {p.metrics.length>0&&(
                <div style={{borderRadius:9,overflow:"hidden",border:"1px solid #e8eaf4",marginBottom:12}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 68px 68px 76px",padding:"5px 10px",background:"#f4f5fb"}}>
                    {["指标","优化前","优化后","变化"].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:"#a8afc4",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</span>)}
                  </div>
                  {p.metrics.map((m,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 68px 68px 76px",padding:"7px 10px",borderTop:"1px solid #f0f2f8"}}>
                      <span style={{fontSize:12,color:"#1a1d2e",fontWeight:600}}>{m.label}</span>
                      <span style={{fontSize:12,color:"#a8afc4"}}>{m.before}</span>
                      <span style={{fontSize:12,color:"#1a1d2e"}}>{m.after}</span>
                      <span style={{fontSize:12,fontWeight:700,color:done?"#059669":"#c2410c"}}>{m.delta}</span>
                    </div>
                  ))}
                </div>
              )}
              {!done&&(
                <div style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:11,color:"#a8afc4",fontWeight:600}}>项目进度</span>
                    <span style={{fontSize:11,color:tmpl.color,fontWeight:700}}>{p.progress}%</span>
                  </div>
                  <div style={{height:5,background:"#eaecf5",borderRadius:999}}>
                    <div style={{height:"100%",width:`${p.progress}%`,background:tmpl.color,borderRadius:999,transition:"width .4s"}}/>
                  </div>
                </div>
              )}
              <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={e=>{e.stopPropagation();onEdit(p);}} style={{padding:"6px 12px",borderRadius:7,border:"1px solid #e4e7f0",background:"transparent",fontSize:12,fontWeight:600,color:"#4a4f6a",cursor:"pointer",fontFamily:"inherit"}}>✎ 编辑</button>
                <button onClick={e=>{e.stopPropagation();onInterview(p);}} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${tmpl.color}44`,background:tmpl.light,fontSize:12,fontWeight:600,color:tmpl.color,cursor:"pointer",fontFamily:"inherit"}}>🎤 面试模拟</button>
                <button onClick={e=>{e.stopPropagation();onToggleStatus(p.id);}} style={{padding:"6px 12px",borderRadius:7,border:"1px solid #e4e7f0",background:"transparent",fontSize:12,fontWeight:600,color:"#6b7280",cursor:"pointer",fontFamily:"inherit"}}>
                  {done?"↩ 重新进行":"✓ 标记完成"}
                </button>
                <button onClick={e=>{e.stopPropagation();onDelete(p.id);}} style={{padding:"6px 12px",borderRadius:7,border:"1px solid #fca5a5",background:"#fff5f5",fontSize:12,fontWeight:600,color:"#ef4444",cursor:"pointer",fontFamily:"inherit"}}>
                  🗑 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EDIT DRAWER ──────────────────────────────────────────────────────────────
function EditDrawer({ project, onSave, onClose }) {
  const blank = {id:null,industry:"product",status:"ongoing",title:"",description:"",startDate:"",endDate:"",jobTitle:"",company:"",extraFields:{},metrics:[],tags:[],progress:0,highlights:""};
  const [form, setForm] = useState(project||blank);
  const [tagInput, setTagInput] = useState("");
  const tmpl = T[form.industry];
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sx=(k,v)=>setForm(p=>({...p,extraFields:{...p.extraFields,[k]:v}}));
  const addM=()=>setForm(p=>({...p,metrics:[...p.metrics,{label:"",before:"",after:"",delta:""}]}));
  const updM=(i,u)=>setForm(p=>{const m=[...p.metrics];m[i]={...m[i],...u};return{...p,metrics:m};});
  const delM=(i)=>setForm(p=>({...p,metrics:p.metrics.filter((_,j)=>j!==i)}));
  const addTag=t=>{if(t&&!form.tags.includes(t))s("tags",[...form.tags,t]);setTagInput("");};
  const delTag=t=>s("tags",form.tags.filter(x=>x!==t));

  const inp={padding:"8px 11px",borderRadius:8,border:"1px solid #e4e7f0",fontSize:13,fontFamily:"inherit",background:"#fafbff",color:"#1a1d2e",outline:"none",width:"100%",boxSizing:"border-box"};
  const lbl={display:"block",fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"#a8afc4",marginBottom:4};

  return (
    <div style={{position:"fixed",inset:0,zIndex:600,display:"flex"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(15,18,40,.4)",backdropFilter:"blur(2px)"}}/>
      <div style={{width:520,background:"#fff",overflowY:"auto",boxShadow:"-8px 0 40px rgba(0,0,0,.12)"}}>
        <div style={{padding:"18px 22px 14px",borderBottom:"1px solid #eef0f6",position:"sticky",top:0,background:"#fff",zIndex:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>{tmpl.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:15,color:"#1a1d2e"}}>{form.id?"编辑项目":"新建项目"}</div>
            <div style={{fontSize:11,color:"#a8afc4",marginTop:1}}>{tmpl.name} 模板</div>
          </div>
          <button onClick={onClose} style={{background:"#f3f4fa",border:"none",borderRadius:7,width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"18px 22px",display:"flex",flexDirection:"column",gap:13}}>
          <div>
            <label style={lbl}>行业模板</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {Object.values(T).map(t=>(
                <button key={t.id} onClick={()=>s("industry",t.id)} style={{padding:"5px 11px",borderRadius:7,border:`2px solid ${form.industry===t.id?t.color:"#e4e7f0"}`,background:form.industry===t.id?t.light:"#fafbff",color:form.industry===t.id?t.color:"#8891a8",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .12s"}}>
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={lbl}>状态</label>
              <div style={{display:"flex",gap:6}}>
                {[["ongoing","⏳ 进行中","#c2410c","#fff8e8"],["done","✓ 已完成","#059669","#d1fae5"]].map(([v,l,c,bg])=>(
                  <button key={v} onClick={()=>s("status",v)} style={{flex:1,padding:"6px",borderRadius:8,border:`2px solid ${form.status===v?c:"#e4e7f0"}`,background:form.status===v?bg:"#fafbff",color:form.status===v?c:"#8891a8",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
                ))}
              </div>
            </div>
            {form.status==="ongoing"&&(
              <div>
                <label style={lbl}>进度 {form.progress}%</label>
                <input type="range" min="0" max="100" value={form.progress} onChange={e=>s("progress",+e.target.value)} style={{width:"100%",accentColor:tmpl.color,marginTop:7}}/>
              </div>
            )}
          </div>
          <div>
            <label style={lbl}>项目名称</label>
            <input style={inp} value={form.title} onChange={e=>s("title",e.target.value)} placeholder={tmpl.ph.title}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div>
              <label style={lbl}>岗位名称</label>
              <input style={inp} value={form.jobTitle||""} onChange={e=>s("jobTitle",e.target.value)} placeholder="例：高级产品经理"/>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>
                {tmpl.jobs.slice(0,4).map(j=>(
                  <button key={j} onClick={()=>s("jobTitle",j)} style={{padding:"2px 7px",borderRadius:999,border:`1px solid ${form.jobTitle===j?tmpl.color:"#e4e7f0"}`,background:form.jobTitle===j?tmpl.light:"transparent",color:form.jobTitle===j?tmpl.color:"#a8afc4",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .12s"}}>{j}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>所在公司</label>
              <input style={inp} value={form.company||""} onChange={e=>s("company",e.target.value)} placeholder="公司名称"/>
            </div>
            <div>
              <label style={lbl}>开始时间</label>
              <input style={inp} value={form.startDate||""} onChange={e=>s("startDate",e.target.value)} placeholder="2024-01"/>
            </div>
            <div>
              <label style={lbl}>结束时间</label>
              <input style={inp} value={form.endDate||""} onChange={e=>s("endDate",e.target.value)} placeholder="留空=至今"/>
            </div>
          </div>
          <div>
            <label style={lbl}>项目描述</label>
            <textarea style={{...inp,resize:"vertical"}} rows={3} value={form.description} onChange={e=>s("description",e.target.value)} placeholder={tmpl.ph.desc}/>
          </div>
          <div style={{background:tmpl.light,borderRadius:10,padding:"12px 14px",border:`1px solid ${tmpl.color}22`}}>
            <div style={{fontSize:10,fontWeight:700,color:tmpl.color,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>{tmpl.icon} {tmpl.name}专属字段</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {tmpl.fields.map(f=>(
                <div key={f}>
                  <label style={{...lbl,color:tmpl.color}}>{f}</label>
                  <input style={{...inp,background:"#fff",border:`1px solid ${tmpl.color}33`}} value={form.extraFields[f]||""} onChange={e=>sx(f,e.target.value)} placeholder={`填写${f}`}/>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <label style={{...lbl,marginBottom:0}}>量化成果</label>
              <button onClick={addM} style={{fontSize:11,color:tmpl.color,background:tmpl.light,border:`1px solid ${tmpl.color}33`,borderRadius:6,padding:"3px 9px",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>+ 添加</button>
            </div>
            <div style={{fontSize:11,color:"#a8afc4",marginBottom:7}}>参考：{tmpl.metrics.join(" · ")}</div>
            {form.metrics.length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"1.3fr .8fr .8fr 1fr 20px",gap:5,marginBottom:5}}>
                {["指标","优化前","优化后","变化",""].map((h,i)=><span key={i} style={{fontSize:10,color:"#a8afc4",fontWeight:600}}>{h}</span>)}
              </div>
            )}
            {form.metrics.map((m,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1.3fr .8fr .8fr 1fr 20px",gap:5,marginBottom:5,alignItems:"center"}}>
                {[["label","指标名"],["before","优化前"],["after","优化后"],["delta","变化"]].map(([k,ph])=>(
                  <input key={k} style={{...inp,padding:"6px 8px",fontSize:12}} value={m[k]} onChange={e=>updM(i,{[k]:e.target.value})} placeholder={ph}/>
                ))}
                <button onClick={()=>delM(i)} style={{background:"none",border:"none",cursor:"pointer",color:"#d1d5db",fontSize:16,padding:0}}>×</button>
              </div>
            ))}
          </div>
          <div>
            <label style={lbl}>分类标签</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:7}}>
              {tmpl.tags.map(t=>(
                <TagPill key={t} label={t} color={tmpl.color} bg={tmpl.light} active={form.tags.includes(t)} onClick={()=>form.tags.includes(t)?delTag(t):addTag(t)} small/>
              ))}
            </div>
            <input style={inp} value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag(tagInput)} placeholder="自定义标签，Enter 添加"/>
            {form.tags.filter(t=>!tmpl.tags.includes(t)).length>0&&(
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
                {form.tags.filter(t=>!tmpl.tags.includes(t)).map(t=><TagPill key={t} label={t} color={tmpl.color} bg={tmpl.light} onRemove={()=>delTag(t)} small/>)}
              </div>
            )}
          </div>
          <div>
            <label style={lbl}>亮点备注</label>
            <textarea style={{...inp,resize:"vertical"}} rows={2} value={form.highlights} onChange={e=>s("highlights",e.target.value)} placeholder="项目亮点、特殊突破或补充说明"/>
          </div>
          <button onClick={()=>onSave(form)} style={{padding:"11px",background:tmpl.color,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginTop:2}}>
            💾 保存项目
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState(loadProjects);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [interviewProject, setInterviewProject] = useState(null);
  const [filterInd, setFilterInd] = useState("all");
  const [filterJob, setFilterJob] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTag, setFilterTag] = useState("");
  const [search, setSearch] = useState("");

  // 自动持久化
  useEffect(() => { saveProjects(projects); }, [projects]);

  const save = form => {
    if (form.id) setProjects(p=>p.map(x=>x.id===form.id?form:x));
    else setProjects(p=>[...p,{...form,id:Date.now()}]);
    setEditing(null);
  };
  const del = id => { setProjects(p=>p.filter(x=>x.id!==id)); if(expanded===id)setExpanded(null); };
  const toggleStatus = id => setProjects(p=>p.map(x=>x.id===id?{...x,status:x.status==="done"?"ongoing":"done",progress:x.status==="done"?80:100}:x));

  const availableJobs = useMemo(()=>{
    const base = filterInd==="all"?projects:projects.filter(p=>p.industry===filterInd);
    return [...new Set(base.map(p=>p.jobTitle).filter(Boolean))];
  },[filterInd,projects]);

  const filtered = useMemo(()=>projects.filter(p=>{
    if(filterInd!=="all"&&p.industry!==filterInd) return false;
    if(filterJob!=="all"&&p.jobTitle!==filterJob) return false;
    if(filterStatus!=="all"&&p.status!==filterStatus) return false;
    if(filterTag&&!p.tags.includes(filterTag)) return false;
    if(search&&!p.title.includes(search)&&!p.description.includes(search)) return false;
    return true;
  }),[projects,filterInd,filterJob,filterStatus,filterTag,search]);

  const ongoing = filtered.filter(p=>p.status==="ongoing");
  const done    = filtered.filter(p=>p.status==="done");
  const tagBase = filterInd==="all"?projects:projects.filter(p=>p.industry===filterInd);
  const tagCounts = {};
  tagBase.forEach(p=>p.tags.forEach(t=>{tagCounts[t]=(tagCounts[t]||0)+1;}));
  const allTags = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).map(([t])=>t);
  const totalMetrics = projects.reduce((a,p)=>a+p.metrics.length,0);

  return (
    <div style={{height:"100vh",background:"#f2f3f9",fontFamily:"'Noto Sans SC','PingFang SC','Helvetica Neue',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* NAV */}
      <div style={{background:"#fff",borderBottom:"1px solid #e8eaf4",padding:"0 16px",flexShrink:0,zIndex:200}}>
        <div style={{height:52,display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginRight:6,flexShrink:0}}>
            <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#0d7377,#14a085)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📋</div>
            <span style={{fontWeight:900,fontSize:15,color:"#1a1d2e",letterSpacing:"-0.3px"}}>成就库</span>
          </div>

          <div style={{position:"relative",width:180,flexShrink:0}}>
            <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#bbb"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索项目..."
              style={{width:"100%",padding:"6px 10px 6px 26px",borderRadius:8,border:"none",fontSize:12,fontFamily:"inherit",background:"#f2f3f9",color:"#1a1d2e",outline:"none",boxSizing:"border-box"}}/>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <span style={{fontSize:11,color:"#a8afc4",fontWeight:600}}>行业</span>
            <select value={filterInd} onChange={e=>{setFilterInd(e.target.value);setFilterJob("all");}}
              style={{padding:"5px 10px",borderRadius:8,border:"1px solid #e4e7f0",fontSize:12,fontFamily:"inherit",background:"#fff",color:"#1a1d2e",outline:"none",cursor:"pointer"}}>
              <option value="all">全部</option>
              {Object.values(T).map(t=><option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
            </select>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <span style={{fontSize:11,color:"#a8afc4",fontWeight:600}}>岗位</span>
            <select value={filterJob} onChange={e=>setFilterJob(e.target.value)}
              style={{padding:"5px 10px",borderRadius:8,border:"1px solid #e4e7f0",fontSize:12,fontFamily:"inherit",background:"#fff",color:"#1a1d2e",outline:"none",cursor:"pointer",maxWidth:150}}>
              <option value="all">全部</option>
              {availableJobs.map(j=><option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          <div style={{display:"flex",background:"#f2f3f9",borderRadius:8,overflow:"hidden",flexShrink:0}}>
            {[["all","全部"],["ongoing","进行中"],["done","已完成"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFilterStatus(v)}
                style={{padding:"5px 12px",border:"none",background:filterStatus===v?"#1a1d2e":"transparent",color:filterStatus===v?"#fff":"#8891a8",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .12s"}}>
                {l}
              </button>
            ))}
          </div>

          <button onClick={()=>setEditing({})}
            style={{marginLeft:"auto",padding:"7px 14px",background:"#0d7377",color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>
            + 新建
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* SIDEBAR */}
        <div style={{width:172,flexShrink:0,background:"#fff",borderRight:"1px solid #e8eaf4",overflowY:"auto",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"14px 14px 10px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#a8afc4",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>概览</div>
            {[
              {label:"全部项目",val:projects.length,c:"#1a1d2e"},
              {label:"进行中",  val:projects.filter(p=>p.status==="ongoing").length,c:"#c2410c"},
              {label:"已完成",  val:projects.filter(p=>p.status==="done").length,   c:"#059669"},
              {label:"量化指标",val:`${totalMetrics}条`,c:"#0d7377"},
            ].map(s=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f4f5fb"}}>
                <span style={{fontSize:12,color:"#6b7280"}}>{s.label}</span>
                <span style={{fontSize:13,fontWeight:800,color:s.c}}>{s.val}</span>
              </div>
            ))}
          </div>
          <div style={{padding:"10px 14px",flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:"#a8afc4",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>标签筛选</div>
            <button onClick={()=>setFilterTag("")}
              style={{width:"100%",textAlign:"left",padding:"5px 9px",borderRadius:7,border:"none",background:filterTag===""?"#1a1d2e":"transparent",color:filterTag===""?"#fff":"#6b7280",fontSize:12,fontWeight:filterTag===""?700:400,cursor:"pointer",fontFamily:"inherit",marginBottom:2,transition:"all .12s"}}>
              全部标签
            </button>
            {allTags.length===0&&<div style={{fontSize:11,color:"#c8cede",padding:"4px 9px"}}>暂无标签</div>}
            {allTags.map(t=>{
              const cnt=tagBase.filter(p=>p.tags.includes(t)).length;
              const active=filterTag===t;
              const proj=projects.find(p=>p.tags.includes(t)&&(filterInd==="all"||p.industry===filterInd));
              const c=proj?T[proj.industry].color:"#4f5882";
              return (
                <button key={t} onClick={()=>setFilterTag(active?"":t)}
                  style={{width:"100%",textAlign:"left",padding:"5px 9px",borderRadius:7,border:"none",background:active?`${c}18`:"transparent",color:active?c:"#6b7280",fontSize:12,fontWeight:active?700:400,cursor:"pointer",fontFamily:"inherit",marginBottom:1,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .12s"}}>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginRight:6}}>{t}</span>
                  <span style={{fontSize:10,color:active?c:"#c8cede",fontWeight:700,flexShrink:0}}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          {filtered.length===0?(
            <div style={{textAlign:"center",padding:"60px 20px",color:"#a8afc4",background:"#fff",borderRadius:14,border:"1.5px dashed #e4e7f0",marginTop:8}}>
              <div style={{fontSize:36,marginBottom:10}}>📭</div>
              <div style={{fontWeight:600,marginBottom:4}}>暂无匹配项目</div>
              <button onClick={()=>setEditing({})} style={{marginTop:8,fontSize:13,color:"#0d7377",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>+ 新建项目</button>
            </div>
          ):(
            <div>
              {(filterStatus==="all"||filterStatus==="ongoing")&&ongoing.length>0&&(
                <div style={{marginBottom:filterStatus==="all"&&done.length>0?20:0}}>
                  {filterStatus==="all"&&(
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
                      <span style={{fontSize:12,fontWeight:800,color:"#c2410c"}}>⏳ 进行中</span>
                      <span style={{fontSize:10,color:"#c2410c",background:"#fff8e8",padding:"1px 7px",borderRadius:999,border:"1px solid #fed7aa",fontWeight:700}}>{ongoing.length}</span>
                    </div>
                  )}
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {ongoing.map(p=>(
                      <ProjectRow key={p.id} p={p} expanded={expanded===p.id}
                        onToggle={()=>setExpanded(expanded===p.id?null:p.id)}
                        onEdit={setEditing} onDelete={del} onToggleStatus={toggleStatus} onInterview={setInterviewProject}/>
                    ))}
                  </div>
                </div>
              )}
              {(filterStatus==="all"||filterStatus==="done")&&done.length>0&&(
                <div>
                  {filterStatus==="all"&&(
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
                      <span style={{fontSize:12,fontWeight:800,color:"#059669"}}>✅ 已完成</span>
                      <span style={{fontSize:10,color:"#059669",background:"#d1fae5",padding:"1px 7px",borderRadius:999,border:"1px solid #a7f3d0",fontWeight:700}}>{done.length}</span>
                    </div>
                  )}
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {done.map(p=>(
                      <ProjectRow key={p.id} p={p} expanded={expanded===p.id}
                        onToggle={()=>setExpanded(expanded===p.id?null:p.id)}
                        onEdit={setEditing} onDelete={del} onToggleStatus={toggleStatus} onInterview={setInterviewProject}/>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {editing!==null&&<EditDrawer project={Object.keys(editing).length>0?editing:null} onSave={save} onClose={()=>setEditing(null)}/>}
      {interviewProject&&<InterviewModal project={interviewProject} onClose={()=>setInterviewProject(null)}/>}
    </div>
  );
}
