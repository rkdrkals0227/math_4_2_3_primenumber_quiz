/* 독립 PNG 스프라이트 렌더러. assets/의 동명 PNG 교체 또는 manifest 수정 가능.
   GLB를 쓰려면 이 렌더러를 WebGL 렌더러로 교체해야 합니다(README 참고). */
(function(F){
F.assetManifest={};for(const n of ['seedhouse','greenhouse','workshop','market','stage','tree','pinktree','pine','crop0','crop1','crop2','crop3','player','kong','drop','moru','popo','star','flowers','fence','bench','lamp','windmill','crate'])F.assetManifest[n]=`assets/${n}.png`;
F.images={};F.loadAssets=()=>Promise.all(Object.entries(F.assetManifest).map(([n,url])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{F.images[n]=img;resolve();};img.onerror=()=>resolve();img.src=url;})));
F.iso=(x,y)=>({x:720+(x-y)*32,y:100+(x+y)*16});
F.screenToWorld=(cx,cy)=>{const v=F.view;const px=(cx-v.ox)/v.scale-720,py=(cy-v.oy)/v.scale-100;return{x:py/32+px/64,y:py/32-px/64};};
F.render=(canvas,s,time,zoom=1)=>{
const dpr=Math.min(devicePixelRatio||1,2),w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=false;
const scale=Math.min(w/1430,h/850)*zoom;const player=F.iso(s.player.x,s.player.y);let ox=(w-1440*scale)/2,oy=(h-850*scale)/2+22;
if(zoom>1){ox=w/2-player.x*scale;oy=h/2-player.y*scale;}
F.view={scale,ox,oy};c.translate(ox,oy);c.scale(scale,scale);
const poly=(pts,color)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();};
const tile=(x,y,color,depth=0)=>{const p=F.iso(x,y);if(depth){poly([[p.x-32,p.y],[p.x,p.y+16],[p.x,p.y+16+depth],[p.x-32,p.y+depth]],'#b4b58a');poly([[p.x,p.y+16],[p.x+32,p.y],[p.x+32,p.y+depth],[p.x,p.y+16+depth]],'#8fa57b');}poly([[p.x,p.y-16],[p.x+32,p.y],[p.x,p.y+16],[p.x-32,p.y]],color);};
// 섬의 그림자와 잔디: 각 지형 타일은 독립적인 등각 마름모입니다.
c.fillStyle='#6c947b22';c.beginPath();c.ellipse(720,470,630,300,0,0,Math.PI*2);c.fill();
for(let k=0;k<41;k++)for(let x=0;x<21;x++){let y=k-x;if(y<0||y>20)continue;const water=F.water(x,y),path=F.isPath(x,y),p=F.iso(x,y);tile(x,y,water?'#89c9cb':path?((x+y)%2?'#ead8b2':'#eeddbd'):['#a6c78c','#aacc91','#afcf95','#a3c488'][(x*7+y*11)%4],x===20||y===20?25:0);
 if(water){c.fillStyle='#d6f0df88';const wave=Math.sin(time*1.5+x+y)*3;c.fillRect(p.x-13+wave,p.y,18,2);if(y===12){poly([[p.x-30,p.y-3],[p.x,p.y-18],[p.x+30,p.y-3],[p.x,p.y+12]],'#ceac7a');for(let j=-18;j<20;j+=9)c.fillStyle='#ead0a1',c.fillRect(p.x+j,p.y-2,3,8);}}
 else if(!path&&(x+y)%3===0){c.fillStyle='#8caf742e';c.fillRect(p.x-8,p.y,3,3);c.fillRect(p.x+9,p.y-5,2,4);}
}
for(const p of F.plotPositions){const a=F.iso(p.x,p.y);poly([[a.x,a.y-13],[a.x+28,a.y],[a.x,a.y+13],[a.x-28,a.y]],'#ae8c67');for(let i=-1;i<=1;i++)poly([[a.x-19+i*7,a.y-4-i*3],[a.x-15+i*7,a.y-6-i*3],[a.x+18+i*7,a.y+5-i*3],[a.x+14+i*7,a.y+7-i*3]],'#927452');}
const objects=F.props.map(p=>({...p,scale:1.7}));F.zones.forEach((z,i)=>{objects.push({x:z.bx,y:z.by,type:z.building,scale:2});objects.push({x:z.x,y:z.y,type:['kong','drop','moru','popo','star'][i],scale:1.75,npc:i});});
s.plots.forEach((stage,i)=>{if(stage>=0&&F.plotPositions[i])objects.push({...F.plotPositions[i],type:'crop'+stage,scale:1.4});});
s.decor.forEach(id=>{const p=F.decorations.find(d=>d.id===id);if(p)objects.push({...p,type:id,scale:1.8});});
for(let i=0;i<Math.min(5,s.done[1].length);i++)objects.push({x:10+i*.8,y:4,type:'flowers',scale:1.7});
for(let i=0;i<Math.min(5,s.done[2].length);i++)objects.push({x:14+i,y:12.5,type:'fence',scale:1.5});
for(let i=0;i<Math.min(5,s.done[3].length);i++)objects.push({x:13+i*.8,y:17.5,type:'crate',scale:1.3});
for(let i=0;i<Math.min(5,s.done[4].length);i++)objects.push({x:3+i,y:18,type:'lamp',scale:1.6});
objects.push({...s.player,type:'player',scale:1.85,player:true});objects.sort((a,b)=>(a.x+a.y)-(b.x+b.y));
for(const o of objects){const img=F.images[o.type];if(!img)continue;const p=F.iso(o.x,o.y);const bounce=s.motion&&(o.npc!==undefined||o.player&&F.moving)?Math.sin(time*4+o.x)*2:0;const iw=img.width*o.scale,ih=img.height*o.scale;c.drawImage(img,Math.round(p.x-iw/2),Math.round(p.y-ih+10+bounce),iw,ih);
 if(o.player){c.fillStyle='#fff8da';c.beginPath();c.moveTo(p.x-6,p.y-ih-8);c.lineTo(p.x+6,p.y-ih-8);c.lineTo(p.x,p.y-ih);c.fill();}
 if(o.npc!==undefined){const available=F.unlocked(s,o.npc);c.fillStyle=available?'#fff8db':'#dce7d2';c.beginPath();c.arc(p.x,p.y-ih-7,11,0,7);c.fill();c.fillStyle=available?'#628956':'#97a58b';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText(available?'!':'·',p.x,p.y-ih);}
}
F.zoneHits=[];F.zones.forEach((z,i)=>{const p=F.iso(z.bx,z.by);const label=z.name;const yy=p.y-245;c.font='bold 17px sans-serif';let width=c.measureText(label).width+38;c.fillStyle='#fffbeaee';c.beginPath();c.roundRect(p.x-width/2,yy,width,34,12);c.fill();c.fillStyle=F.unlocked(s,i)?'#4e6656':'#929989';c.textAlign='center';c.fillText(label,p.x,yy+23);F.zoneHits.push({x:p.x-width/2,y:yy,w:width,h:34,zone:i});});
if(s.done[4].length>=5&&s.motion){for(let i=0;i<24;i++){const x=450+Math.sin(i*41)*300,y=450+((time*30+i*37)%220);c.fillStyle=['#fff0a5','#e9adbe','#b2d5c8'][i%3];c.fillRect(x,y,4,7);}}
};
})(Farm);
