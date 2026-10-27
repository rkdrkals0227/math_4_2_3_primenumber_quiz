/* 36×36 탐험 지도. 건물/주민은 questions.js, 조경은 아래 목록에서 편집합니다. */
(function(F){
F.size=36;F.home={x:18,y:17,door:{x:18,y:20}};F.barn={x:27,y:20,door:{x:27,y:23}};
F.stepToward=(from,to,step)=>{const dx=to.x-from.x,dy=to.y-from.y,d=Math.hypot(dx,dy);return d<=step?{...to}:{x:from.x+dx/d*step,y:from.y+dy/d*step};};
const roads=[[[11,12],[13,17],[18,20],[21,20],[27,23]],[[18,20],[18,12],[19,9]],[[19,12],[24,13],[28,12]],[[18,20],[16,26],[20,29]],[[16,26],[12,29],[9,30]],[[27,23],[26,28],[22,30]],[[11,12],[8,15],[6,19],[8,23]]];
function segment(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);}
F.isPath=(x,y)=>roads.some(r=>r.slice(1).some((b,i)=>segment(x,y,r[i],b)<.85));
F.water=(x,y)=>((x-5.5)**2/12+(y-25)**2/15<1)||(y<22&&Math.abs(x-(3.3+Math.sin(y*.32)*.8))<1)||(Math.pow((x-25.5)/2.2,2)+Math.pow((y-29.5)/1.6,2)<1);
F.isBridge=(x,y)=>x>=3&&x<=8&&Math.abs(y-24)<.6;
F.plotPositions=Array.from({length:12},(_,i)=>({x:8+(i%4)*1.25,y:13+Math.floor(i/4)*1.25}));
F.landmarks=[{id:'home',x:18,y:17,type:'house0',name:'나의 작은 집',door:F.home.door},{id:'barn',x:27,y:20,type:'barn',name:'동물 친구들의 집',door:F.barn.door},{id:'bakery',x:26,y:29,type:'bakery',name:'밀빛 빵집'},{id:'flowerstall',x:18,y:31,type:'flowerstall',name:'꽃잎 가게'}];
F.props=[];const add=(type,x,y,size=1,solid=false)=>F.props.push({type,x,y,size,solid});
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};F.hash=hash;
const nearBuilding=(x,y)=>[...F.zones.map(z=>({x:z.bx,y:z.by})),...F.landmarks].some(b=>Math.hypot(x-b.x,y-b.y)<3.6);
const reserved=(x,y)=>nearBuilding(x,y)||F.isPath(x,y)||F.water(x,y)||F.plotPositions.some(p=>Math.hypot(x-p.x,y-p.y)<1.2)||F.zones.some(p=>Math.hypot(x-p.x,y-p.y)<2)||x>23&&x<32&&y>21&&y<32;
for(let x=-4;x<40;x+=1.4)for(let y=-4;y<40;y+=1.4){const h=hash(x,y),outside=x<2||y<2||x>33||y>33;if(outside){if(h>.60)add(['tree','pine','pinktree','fruitTree'][Math.floor(h*17)%4],x,y,.7+h*.35,true);}else if(!reserved(x,y)){
 if(h>.94&&!roads.some(r=>r.slice(1).some((b,i)=>segment(x,y,r[i],b)<2)))add(['tree','fruitTree','pinktree','pine'][Math.floor(h*23)%4],x,y,.8+h*.35,true);
 else if(h>.71)add('bush',x,y,.7+h*.4,false);
 else if(h>.52)add('flowerpatch',x,y,.6+h*.5,false);
 else if(h>.37)add('grass',x,y,.6+h*.5,false);
 else if(h>.32)add('mushrooms',x,y,.65,false);
 else if(h>.29)add('rock',x,y,.65,true);
}}
// 장소의 역할을 드러내는 조경 — 길과 출입구는 비워 둡니다.
for(const [t,x,y,k] of [['well',15,17,1],['mailbox',20,18,1],['cart',16,18,1],['flowerpatch',17,19,1],['flowerpatch',20,17,1.2],['scarecrow',7,14,1],['hay',7,12,1],['crate',12,15,1],['sign',12,12,1],['windmill',31,10,1.2],['crate',30,12,1],['rock',30,8,1],['fountain',10,28,1.1],['bench',11,31,1],['lamp',7,30,1],['cart',23,30,1],['flowerpatch',20,31,1],['hay',29,22,1.1],['trough',26,23,1],['trough',29,24,1],['reeds',4,22,1.1],['reeds',8,26,1],['bench',9,25,1],['reeds',27,30,1],['bush',16,7,1],['flowerpatch',20,7,1.2],['flowerpatch',17,10,1.2],['lamp',20,22,1],['sign',14,23,1]])add(t,x,y,k,['well','mailbox','windmill','crate','bench','fountain','trough','rock'].includes(t));
for(let x=24;x<=31;x++)if(x!==27)add('fence',x,22,1,true);
for(let y=23;y<=28;y++)if(y!==25)add('fence',31,y,1,true);
F.blocked=(x,y,state=F.activeState)=>{x=Math.round(x);y=Math.round(y);if(x<1||y<1||x>34||y>34)return true;if(F.water(x,y)&&!F.isBridge(x,y))return true;if(F.zones.some(z=>Math.abs(x-z.bx)<=1&&Math.abs(y-z.by)<=1))return true;if(F.landmarks.some(z=>Math.abs(x-z.x)<=1&&Math.abs(y-z.y)<=1))return true;if(F.props.some(p=>p.solid&&Math.abs(x-p.x)<.48&&Math.abs(y-p.y)<.48))return true;return !!state?.life?.placements?.some(p=>p.id!=='flowers'&&p.id!=='stonepath'&&p.x===x&&p.y===y);};
F.route=(from,to,state=F.activeState)=>{const sx=Math.round(from.x),sy=Math.round(from.y),tx=Math.round(to.x),ty=Math.round(to.y);if(F.blocked(tx,ty,state))return [];const queue=[[sx,sy]],seen=new Map([[`${sx},${sy}`,null]]);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];if(x===tx&&y===ty){const p=[];let k=`${x},${y}`;while(seen.get(k)!==null){const [a,b]=k.split(',').map(Number);p.unshift({x:a,y:b});k=seen.get(k);}return p;}for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const k=`${a},${b}`;if(!seen.has(k)&&!F.blocked(a,b,state)){seen.set(k,`${x},${y}`);queue.push([a,b]);}}}return [];};
F.decorations=[{id:'flowers',name:'동화 꽃밭',cost:20,type:'flowerpatch',x:15,y:20},{id:'fence',name:'작은 나무 울타리',cost:15,type:'fence',x:12,y:17},{id:'stonepath',name:'정원 돌길',cost:10,type:'rock',x:20,y:21},{id:'bench',name:'쉬어 가는 벤치',cost:30,type:'bench',x:17,y:22},{id:'pinktree',name:'분홍 꽃나무',cost:40,type:'pinktree',x:22,y:18},{id:'windmill',name:'바람개비 풍차',cost:50,type:'windmill',x:30,y:10},{id:'lamp',name:'반짝 별빛 조명',cost:25,type:'lamp',x:21,y:22},{id:'bush',name:'초록 화분 덤불',cost:15,type:'bush',x:20,y:16}];
F.canPlace=(s,id,x,y)=>{if(!Number.isInteger(x)||!Number.isInteger(y)||x<2||y<2||x>33||y>33||F.blocked(x,y,s)||F.isPath(x,y)||!F.decorations.some(d=>d.id===id))return false;
if(F.plotPositions.some(p=>Math.hypot(p.x-x,p.y-y)<1)||F.zones.some(p=>Math.hypot(p.x-x,p.y-y)<1.7)||[F.home.door,F.barn.door].some(p=>Math.hypot(p.x-x,p.y-y)<2)||s.life.placements.some(p=>p.x===x&&p.y===y))return false;
const draft={...s,life:{...s.life,placements:[...s.life.placements,{id,x,y}]}};return [...F.zones,F.barn.door].every(p=>F.route(F.home.door,p,draft).length>0);};
F.place=(s,id,x,y)=>{const d=F.decorations.find(d=>d.id===id);if(!d||s.seeds<d.cost||s.life.placements.length>=80||!F.canPlace(s,id,x,y))return false;s.seeds-=d.cost;s.life.placements.push({id,x,y});return true;};
})(Farm);
