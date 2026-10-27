/* 농장 생활: 기존 저장 키와 주요 미션을 유지하는 확장 상태, 시간/날씨/돌봄/집/사건. */
(function(F){
const clamp=(v,min,max,def)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):def;
F.cropCatalog=[{id:'carrot',name:'당근',price:8},{id:'tomato',name:'토마토',price:10},{id:'strawberry',name:'딸기',price:12},{id:'pumpkin',name:'호박',price:14},{id:'corn',name:'옥수수',price:11},{id:'sunflower',name:'해바라기',price:13}];
F.animalCatalog=[{id:'chicken',name:'햇콩',species:'닭',product:'달걀',x:25,y:25},{id:'rabbit',name:'달솜',species:'토끼',product:'행운풀',x:28,y:26},{id:'sheep',name:'구름',species:'양',product:'양털',x:28,y:23},{id:'duck',name:'물결',species:'오리',product:'깃털',x:25,y:29}];
F.houseNames=['작은 나무 오두막','꽃 피는 아늑한 집','2층 농장집','별빛 테라스의 집'];
F.houseCosts=[{seeds:60,wood:6},{seeds:120,wood:14},{seeds:180,wood:24}];
F.weatherNames={sun:'맑음',cloud:'흐림',rain:'비',wind:'바람'};
F.story=[{title:'잠든 마을에 도착하다',text:'오랫동안 닫혀 있던 나무문이 삐걱 열렸어요. 콩이가 작은 씨앗을 내밀었지요. “네가 계산해 준 만큼 이 마을은 다시 자랄 거야.”',art:'seedhouse'}, {title:'풀밭에서 만난 친구들',text:'작은 축사에서 네 친구가 고개를 내밀었어요. 햇콩, 달솜, 구름, 물결. 먹이 한 줌과 따뜻한 손길이 새로운 우정을 만들어요.',art:'barn'}, {title:'하늘이 들려주는 이야기',text:'구름은 물을 선물하고 바람은 꽃잎을 데려왔어요. 비 오는 날에는 친구들이 축사에서 쉬어요. 창밖을 보며 자연의 시간을 느껴 보세요.',art:'greenhouse'}, {title:'작은 사건, 다정한 해결',text:'씨앗을 찾아온 새와 바람에 기운 울타리. 마을의 작은 부탁에는 언제나 풀 수 있는 수학이 숨어 있답니다. 서두르지 않아도 괜찮아요.',art:'workshop'}, {title:'우리 집, 우리들의 축제',text:'한 칸씩 커진 집과 손수 키운 정원에 별빛이 모였어요. 주민들이 함께 웃는 오늘, 반짝이는 농장은 여러분이 쓴 동화가 되었어요.',art:'house3'}];
function freshLife(){return {mapVersion:2,clock:85,day:1,weather:'sun',weatherAuto:true,materials:0,house:0,animals:F.animalCatalog.map(()=>({hunger:80,friendship:0,care:0,clean:80,water:80,mood:80})),cropTypes:Array(12).fill('carrot'),watered:Array(12).fill(false),inventory:{carrot:0,tomato:0,strawberry:0,pumpkin:0,corn:0,sunflower:0},products:[0,0,0,0],placements:[],sequence:0,completed:[],event:null,lastEventDay:0,eventSolved:0,storySeen:[],lastRainGrowth:-1,weatherSeen:['sun']};}
F.restoreLife=(s,raw)=>{const d=freshLife(),r=raw&&typeof raw==='object'?raw:{};
for(const [k,min,max] of [['clock',0,599.999],['day',1,100000],['materials',0,1000000],['house',0,3],['sequence',0,10000000],['lastEventDay',0,100000],['eventSolved',0,100000],['lastRainGrowth',-1,10000000]])d[k]=clamp(r[k],min,max,d[k]);
if(!Number.isInteger(r.house)||r.house<0||r.house>3)d.house=0;
for(const k of ['house','day','sequence','lastEventDay','eventSolved','materials'])d[k]=Math.floor(d[k]);
if(F.weatherNames[r.weather])d.weather=r.weather;if(typeof r.weatherAuto==='boolean')d.weatherAuto=r.weatherAuto;
if(Array.isArray(r.animals))d.animals=d.animals.map((a,i)=>{const b=r.animals[i]||{};return Object.fromEntries(Object.entries(a).map(([k,v])=>[k,clamp(b[k],0,k==='care'?100000:100,v)]));});
if(Array.isArray(r.cropTypes))d.cropTypes=d.cropTypes.map((v,i)=>F.cropCatalog.some(c=>c.id===r.cropTypes[i])?r.cropTypes[i]:v);
if(Array.isArray(r.watered))d.watered=d.watered.map((_,i)=>r.watered[i]===true);
if(r.inventory&&typeof r.inventory==='object')for(const c of F.cropCatalog)d.inventory[c.id]=Math.floor(clamp(r.inventory[c.id],0,100000,0));
const represented=Object.values(d.inventory).reduce((n,v)=>n+v,0);if(s.crops>represented)d.inventory.carrot+=s.crops-represented;
if(Array.isArray(r.products))d.products=d.products.map((_,i)=>Math.floor(clamp(r.products[i],0,100000,0)));
if(Array.isArray(r.placements))d.placements=r.placements.filter(p=>p&&F.decorations.some(c=>c.id===p.id)&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>0&&p.x<F.size-1&&p.y>0&&p.y<F.size-1).slice(0,80);
if(Array.isArray(r.completed))d.completed=r.completed.filter(v=>typeof v==='string').slice(-200);
if(Array.isArray(r.storySeen))d.storySeen=[...new Set(r.storySeen.filter(v=>Number.isInteger(v)&&v>=0&&v<5))];
if(Array.isArray(r.weatherSeen))d.weatherSeen=[...new Set(r.weatherSeen.filter(v=>F.weatherNames[v]))];
if(r.event&&Number.isInteger(r.event.type)&&r.event.type>=0&&r.event.type<4)d.event={type:r.event.type,day:Math.floor(clamp(r.event.day,1,d.day,d.day))};
s.life=d;if(!raw?.mapVersion)s.player={x:18,y:20};return s;};
const originalFresh=F.fresh,originalLoad=F.load,originalSolve=F.solve,originalHarvest=F.harvest;
F.fresh=()=>{const s=originalFresh();s.life=freshLife();s.player={x:18,y:20};return s;};
F.load=()=>{const s=originalLoad();let raw;try{raw=JSON.parse(localStorage.getItem('decimal-farm-v1'));}catch{}F.restoreLife(s,raw?.life);F.activeState=s;return s;};
F.solve=(s,z,q,v)=>{const ok=originalSolve(s,z,q,v);if(ok&&s.life){s.life.materials+=2;for(let i=0;i<12;i++)if(s.plots[i]===0)s.life.watered[i]=false;}return ok;};
F.harvest=s=>{if(s.life)s.plots.forEach((p,i)=>{if(p===3)s.life.inventory[s.life.cropTypes[i]]++;});return originalHarvest(s);};
F.phase=s=>s.life.clock<150?'아침':s.life.clock<330?'낮':s.life.clock<450?'저녁':'밤';
F.tickLife=(s,dt,paused)=>{if(paused||!s.life||!Number.isFinite(dt)||dt<=0)return;const l=s.life;l.clock+=dt;while(l.clock>=600){l.clock-=600;l.day++;if(l.weatherAuto)l.weather=['sun','cloud','rain','wind'][(l.day-1)%4];}if(!l.weatherSeen.includes(l.weather))l.weatherSeen.push(l.weather);
for(const a of l.animals){a.hunger=Math.max(30,a.hunger-dt*.015);a.water=Math.max(30,a.water-dt*.01);a.clean=Math.max(35,a.clean-dt*.008);a.mood=Math.min(100,(a.hunger+a.water+a.clean)/3+a.friendship*.1);}
if(l.weather==='rain'){l.watered.fill(true);const slot=l.day*10+Math.floor(l.clock/120);if(slot!==l.lastRainGrowth){l.lastRainGrowth=slot;s.plots=s.plots.map(p=>p<0?-1:Math.min(3,p+1));}}
if(l.clock>=180&&l.lastEventDay<l.day&&!l.event){l.event={type:(l.day-1)%4,day:l.day};l.lastEventDay=l.day;}
};
F.animalPose=(s,i)=>{const l=s.life,a=F.animalCatalog[i],night=F.phase(s)==='밤',sheltered=night||l.weather==='rain';const t=l.clock*.12+i*19;
return sheltered?{x:24.4+i*.65,y:22.8,sheltered:true,sleeping:night,frame:0}:{x:a.x+Math.sin(t*.4)*.75,y:a.y+Math.sin(t*.63)*.6,sheltered:false,sleeping:false,frame:Math.floor(t*2)%3};};
F.eventInfo=s=>{const e=s.life.event;if(!e)return null;return [{title:'씨앗이 궁금한 새들',text:'새들에게 나눠 줄 먹이를 계산해 평화롭게 보내 주자.',x:10,y:14,a:'1.25',b:'0.75',op:'+'},{title:'잎사귀 손님 애벌레',text:'애벌레를 옮길 화분의 흙을 준비해 보자.',x:11,y:14,a:'3.5',b:'1.25',op:'−'},{title:'바람에 기운 울타리',text:'수리에 쓸 나무 두 조각의 전체 길이를 계산하자.',x:25,y:24,a:'2.75',b:'1.48',op:'+'},{title:'비 뒤에 생긴 작은 웅덩이',text:'밭에서 덜어 낼 물의 양을 계산해 보자.',x:9,y:14,a:'5',b:'2.65',op:'−'}][e.type];};
F.actionQuestion=(s,kind,target)=>{const n=s.life.sequence%3;let a='1.25',b=(.5+n*.15).toFixed(2),op='+',story='먹이 두 봉지의 무게를 더해 주세요. 모두 몇 kg인가요?';
if(kind==='water'||kind==='animalWater'){a='3.5';b=(1.25+n*.2).toFixed(2);op='−';story=`물 ${a} L 중 ${b} L를 사용해요. 몇 L가 남을까요?`;}
if(kind==='brush'){a='1.85';b='0.65';op='−';story='양털 1.85 kg 중 0.65 kg을 정리했어요. 남은 양은 몇 kg일까요?';}
if(kind==='clean'){a='2.35';b='1.45';story='짚 2.35 kg과 1.45 kg을 모았어요. 모두 몇 kg일까요?';}
if(kind==='upgrade'){a=['2.75','4.25','5.65'][s.life.house]||'2.75';b=['1.85','2.75','3.45'][s.life.house]||'1.85';story=`집을 지을 나무 ${a} m와 ${b} m를 준비해요. 전체 길이는 몇 m일까요?`;}
if(kind==='event'){const e=F.eventInfo(s);if(e){({a,b,op}=e);story=e.text+` ${a} ${op} ${b}를 계산해 줘.`;}}
const answer=((F.hundredths(a)+(op==='+'?1:-1)*F.hundredths(b))/100).toFixed(2);return{id:`life-${s.life.sequence}`,kind,target,a,b,op,answer,story,house:s.life.house,eventDay:s.life.event?.day,hint:op==='+'?'소수점을 세로로 맞추고 오른쪽 자리부터 더해 봐. 10이 되면 왼쪽으로 1을 올려!':'빈자리는 0으로 채우고 같은 자리끼리 빼 봐. 작으면 왼쪽에서 1을 빌려 와!'};};
F.perform=(s,q,v)=>{const l=s.life;if(F.hundredths(v)===null||F.hundredths(v)!==F.hundredths(q.answer)||l.completed.includes(q.id))return false;
if(q.kind==='upgrade'){const cost=F.houseCosts[l.house];if(!cost||q.house!==l.house||s.seeds<cost.seeds||l.materials<cost.wood)return false;s.seeds-=cost.seeds;l.materials-=cost.wood;l.house++;}
else if(q.kind==='event'){if(!l.event||q.eventDay!==l.event.day)return false;l.event=null;l.eventSolved++;s.seeds+=15;l.materials+=3;}
else if(q.kind==='water'){if(!Number.isInteger(q.target)||q.target<0||q.target>=12||s.plots[q.target]<0)return false;l.watered[q.target]=true;s.plots[q.target]=Math.min(3,s.plots[q.target]+1);s.seeds+=5;}
else{const a=l.animals[q.target];if(!a||!['feed','animalWater','brush','clean'].includes(q.kind))return false;if(q.kind==='feed')a.hunger=100;if(q.kind==='animalWater')a.water=100;if(q.kind==='clean')a.clean=100;a.mood=Math.min(100,a.mood+15);a.friendship=Math.min(100,a.friendship+10);a.care++;if(a.care%4===0)l.products[q.target]++;s.seeds+=5;l.materials++;}
s.xp+=10;l.sequence++;l.completed.push(q.id);l.completed=l.completed.slice(-200);return true;};
F.plantAt=(s,index,type)=>{if(!Number.isInteger(index)||index<0||index>=12||s.plots[index]!==-1||s.seeds<5||!F.cropCatalog.some(c=>c.id===type))return false;s.seeds-=5;s.plots[index]=0;s.life.cropTypes[index]=type;s.life.watered[index]=false;return true;};
F.sellAll=s=>{let gain=0;for(const c of F.cropCatalog){gain+=s.life.inventory[c.id]*c.price;s.life.inventory[c.id]=0;}const recorded=s.crops;/* v1 작물 수량은 종류가 없으므로 기본 단가로 보존 */if(gain===0)gain=recorded*8;s.crops=0;s.life.products.forEach((n,i)=>gain+=n*[12,10,18,10][i]);s.life.products.fill(0);s.seeds+=gain;return gain;};
F.chapterOpen=(s,i)=>i===0||(i===1&&s.done[0].length>=1)||(i===2&&s.life.animals.some(a=>a.friendship>0))||(i===3&&s.life.eventSolved>0)||(i===4&&(s.life.house>0||s.done[3].length>=5));
})(Farm);
