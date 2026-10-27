/* 학습/경제 규칙. 모든 소수는 100배 정수로 비교해 부동소수점 오차를 피합니다. */
(function(F){
F.hundredths=v=>{const t=String(v).trim();if(!/^\d+(?:\.\d{1,2})?$/.test(t))return null;const [a,b='']=t.split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));return Number.isSafeInteger(n)?n:null;};
F.validAnswer=(q,v)=>q.kind==='compare'?/^[<>=＜＞＝]$/.test(String(v).trim()):F.hundredths(v)!==null;
F.answerMatches=(q,v)=>q.kind==='compare'?String(v).trim().replace('＜','<').replace('＞','>').replace('＝','=')===q.answer:F.hundredths(v)!==null&&F.hundredths(v)===F.hundredths(q.answer);
F.fresh=()=>({version:1,seeds:20,xp:0,crops:0,done:[[],[],[],[],[]],practice:[0,0,0,0,0],plots:Array(12).fill(-1),decor:[],player:{x:9,y:12},sound:false,motion:true,started:false});
F.unlocked=(s,z)=>z===0||s.done[z-1].length>=5;
F.solve=(s,z,q,value)=>{if(!F.answerMatches(q,value)||s.done[z].includes(q.id))return false;s.done[z].push(q.id);s.seeds+=10;s.xp+=20;s.plots=s.plots.map(p=>p<0?-1:Math.min(3,p+1));const empty=s.plots.indexOf(-1);if(empty>=0)s.plots[empty]=0;return true;};
F.plant=s=>{const i=s.plots.indexOf(-1);if(i<0||s.seeds<5)return false;s.plots[i]=0;s.seeds-=5;return true;};
F.harvest=s=>{const n=s.plots.filter(p=>p===3).length;s.crops+=n;s.plots=s.plots.map(p=>p===3?-1:p);return n;};
F.load=()=>{try{const raw=JSON.parse(localStorage.getItem('decimal-farm-v1')),s=F.fresh();if(!raw||raw.version!==1)return s;
for(const key of ['seeds','xp','crops'])if(Number.isSafeInteger(raw[key])&&raw[key]>=0)s[key]=raw[key];
if(Array.isArray(raw.done)&&raw.done.length===5&&raw.done.every(a=>Array.isArray(a)&&a.every(v=>typeof v==='string')))s.done=raw.done.map(a=>[...new Set(a)]);
if(Array.isArray(raw.practice)&&raw.practice.length===5&&raw.practice.every(n=>Number.isSafeInteger(n)&&n>=0))s.practice=raw.practice;
if(Array.isArray(raw.plots)&&raw.plots.length===12&&raw.plots.every(n=>Number.isInteger(n)&&n>=-1&&n<=3))s.plots=raw.plots;
if(Array.isArray(raw.decor))s.decor=[...new Set(raw.decor.filter(v=>typeof v==='string'))];
if(raw.player&&Number.isFinite(raw.player.x)&&Number.isFinite(raw.player.y)&&raw.player.x>=1&&raw.player.x<=(F.size||21)-2&&raw.player.y>=1&&raw.player.y<=(F.size||21)-2&&(!F.blocked||!F.blocked(raw.player.x,raw.player.y)))s.player=raw.player;
for(const key of ['sound','motion','started'])if(typeof raw[key]==='boolean')s[key]=raw[key];return s;
}catch{return F.fresh();}};
F.save=s=>{try{localStorage.setItem('decimal-farm-v1',JSON.stringify(s));return true;}catch{return false;}};
})(globalThis.Farm=globalThis.Farm||{});
