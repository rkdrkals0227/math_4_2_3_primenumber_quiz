/* 그림책 렌더 레이어: 지형 캐시 → 물/그늘 → 정렬된 객체 → 날씨/빛.
   모든 자산은 교체 가능한 PNG. 화면 밖 객체는 그리지 않습니다. */
(function(F){
const story=['house0','house1','house2','house3','barn','bakery','flowerstall','well','fountain','cart','mailbox','scarecrow','hay','reeds','rock','bush','mushrooms','fruitTree','sapling','flowerpatch','grass','sign','trough','seedhouse','greenhouse','workshop','market','stage','oak','pine','flowerTree'];
for(const n of ['chicken','rabbit','sheep','duck'])for(let i=0;i<3;i++)story.push(n+i);
for(const n of ['carrot','tomato','strawberry','pumpkin','corn','sunflower'])for(let i=0;i<4;i++)story.push(n+i);
for(const n of ['front','back','left','right'])for(let i=0;i<2;i++)story.push('player_'+n+i);
story.forEach(n=>F.assetManifest['s_'+n]=`assets/story/${n}.png`);
F.assetURL=n=>F.assetManifest['s_'+n]||F.assetManifest[n]||'assets/flowers.png';
F.iso=(x,y)=>({x:1536+(x-y)*32,y:160+(x+y)*16});
F.screenToWorld=(x,y)=>{const v=F.view,px=(x-v.ox)/v.scale-1536,py=(y-v.oy)/v.scale-160;return{x:py/32+px/64,y:py/32-px/64};};
const poly=(c,pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();};
function tile(c,x,y,color,size=32){const p=F.iso(x,y);poly(c,[[p.x,p.y-size/2],[p.x+size,p.y],[p.x,p.y+size/2],[p.x-size,p.y]],color);}
let ground,camera,last=0;F.worldHits=[];F.particles=[];
F.visualEffect=(x,y,kind='sparkle')=>{F.particles.push({x,y,kind,start:performance.now()/1000});};
function groundLayer(){const cv=document.createElement('canvas');cv.width=3072;cv.height=1696;const c=cv.getContext('2d');c.fillStyle='#9fc674';c.fillRect(0,0,cv.width,cv.height);
for(let x=-6;x<42;x++)for(let y=-6;y<42;y++){const h=F.hash(x,y),p=F.iso(x,y);let color=['#9ec876','#a3cc7b','#9bc472','#a8cf7f'][Math.floor(h*4)];if(F.water(x,y))color='#79c8ce';else if(F.isPath(x,y))color='#ecd49b';tile(c,x,y,color,32.3);
if(!F.isPath(x,y)&&!F.water(x,y)){for(let k=0;k<3;k++){const px=p.x-20+F.hash(x+k*3,y+2)*40,py=p.y-8+F.hash(x-4,y+k)*16;c.fillStyle=k%2?'#83ad5c66':'#d1df9d77';c.fillRect(px,py,2,4);if(h>.7){c.fillStyle='#fff1bb';c.fillRect(px+5,py,2,2);}}}
if(F.water(x,y)){c.fillStyle='#b6e7db55';c.fillRect(p.x-10,p.y,16,1);}
}
// 꽃길 가장자리의 작은 돌과 꽃잎.
for(let x=1;x<35;x++)for(let y=1;y<35;y++)if(F.isPath(x,y)){const p=F.iso(x,y);c.fillStyle='#c9b98866';c.beginPath();c.ellipse(p.x+12,p.y+5,2,1,0,0,7);c.fill();}
for(let x=3;x<=8;x++){tile(c,x,24,'#bd9667',31);const p=F.iso(x,24);for(let i=-2;i<=2;i++){c.strokeStyle='#f0d0a0';c.lineWidth=2;c.beginPath();c.moveTo(p.x-21+i*5,p.y-5-i*2.5);c.lineTo(p.x+11+i*5,p.y+11-i*2.5);c.stroke();}}
for(const p of F.plotPositions){tile(c,p.x,p.y,'#9c7750',34);const a=F.iso(p.x,p.y);for(let j=-2;j<=2;j++){c.strokeStyle='#bf9564';c.lineWidth=3;c.beginPath();c.moveTo(a.x-23+j*5,a.y-6-j*2.5);c.lineTo(a.x+10+j*5,a.y+10-j*2.5);c.stroke();}}
return cv;}
function imageInfo(type){let key='s_'+type;if(type==='tree')key='s_oak';if(type==='pinktree')key='s_flowerTree';let img=F.images[key]||F.images[type];return{img,modern:!!F.images[key]};}
function dimensions(type,img,modern,size=1){if(!modern)return{w:img.width*1.5*size,h:img.height*1.5*size};let k=.9;if(type.startsWith('player_'))k=.83;else if(/^(chicken|rabbit|sheep|duck)/.test(type))k=.9;else if(F.cropCatalog.some(a=>type.startsWith(a.id)))k=.65;else if(['grass','flowerpatch','bush','mushrooms','reeds','rock'].includes(type))k=.7;else if(['oak','tree','pine','flowerTree','pinktree','fruitTree'].includes(type))k=.95;else if(type==='sapling')k=.8;return{w:img.width*k*size,h:img.height*k*size};}
F.render=(cv,s,t,zoom=1)=>{const w=cv.clientWidth,h=cv.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;const dt=Math.min(.1,Math.max(0,t-last));last=t;
const phase=F.phase(s),l=s.life,motion=s.motion,clock=l.clock,anim=motion?clock:0,scale=(w<900?.82:1)*zoom,p=F.iso(s.player.x,s.player.y);const target=zoom<=.55?F.iso(17,17):{x:p.x,y:p.y-45};if(!camera)camera={...target};const ease=1-Math.exp(-dt*5);camera.x+=(target.x-camera.x)*ease;camera.y+=(target.y-camera.y)*ease;const ox=w/2-camera.x*scale,oy=h/2-camera.y*scale+30;F.view={scale,ox,oy};
const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,phase==='밤'?'#536f85':phase==='저녁'?'#e6c7a0':'#b6d398');sky.addColorStop(1,'#91b96d');c.fillStyle=sky;c.fillRect(0,0,w,h);
c.save();c.translate(ox,oy);c.scale(scale,scale);if(!ground)ground=groundLayer();c.drawImage(ground,0,0);
// 부드러운 구름 그림자와 물결은 지형 아래의 분위기만 바꿉니다.
if(l.weather==='cloud'||l.weather==='rain'){c.fillStyle='#43597713';for(let i=0;i<4;i++){c.beginPath();c.ellipse(900+i*430+Math.sin(anim*.02+i)*200,450+i*210,300,90,-.3,0,7);c.fill();}}
for(let x=1;x<30;x++)for(let y=1;y<33;y++)if(F.water(x,y)){const a=F.iso(x,y);c.strokeStyle='#e3fff088';c.lineWidth=1.5;const drift=Math.sin(anim*1.4+x+y)*5;c.beginPath();c.moveTo(a.x-9+drift,a.y);c.quadraticCurveTo(a.x,a.y+3,a.x+13+drift,a.y);c.stroke();if((x+y)%9===0){c.fillStyle='#4b91a355';c.beginPath();c.ellipse(a.x+Math.sin(anim*.3)*12,a.y+4,6,2,0,0,7);c.fill();}if((x+y)%13===0){c.fillStyle='#76a265';c.beginPath();c.ellipse(a.x+drift,a.y-7,4,2,-.3,0,7);c.fill();}}
s.life.watered.forEach((wet,i)=>{if(wet){const a=F.plotPositions[i];tile(c,a.x,a.y,'#587b5b35',32);}});
const objects=F.props.map(o=>({...o}));F.zones.forEach((z,i)=>{objects.push({x:z.bx,y:z.by,type:z.building,building:true,zone:i});const wander=motion?Math.sin(anim*.14+i)*.25:0;objects.push({x:z.x+wander,y:z.y,type:['kong','drop','moru','popo','star'][i],npc:i,size:1.25});});
F.landmarks.forEach(o=>objects.push({...o,type:o.id==='home'?'house'+l.house:o.type,building:true,feature:o.id}));
s.plots.forEach((stage,i)=>{if(stage>=0)objects.push({...F.plotPositions[i],type:l.cropTypes[i]+stage,plot:i});});
// 온실 앞 전시 정원. 플레이어가 심는 텃밭과 분리합니다.
for(let i=0;i<12;i++)objects.push({x:17+(i%4)*.75,y:7.8+Math.floor(i/4)*.7,type:['sunflower3','strawberry3','tomato3'][i%3],size:.75});
for(let i=0;i<Math.min(5,s.done[1].length);i++)objects.push({x:21,y:6+i*.6,type:'flowerpatch',size:.8});
for(let i=0;i<Math.min(5,s.done[2].length);i++)objects.push({x:27+i*.7,y:14,type:'fence',size:.9});
for(let i=0;i<Math.min(5,s.done[3].length);i++)objects.push({x:23+i*.5,y:30,type:'crate',size:.8});
for(let i=0;i<Math.min(5,s.done[4].length);i++)objects.push({x:6+i,y:30,type:'lamp',size:1.1});
s.decor.forEach(id=>{const d=F.decorations.find(d=>d.id===id);if(d)objects.push({...d,type:d.type});});l.placements.forEach(o=>{const d=F.decorations.find(d=>d.id===o.id);if(d)objects.push({...o,type:d.type});});
F.animalCatalog.forEach((a,i)=>{const pose=F.animalPose(s,i);objects.push({...pose,type:a.id+(motion?pose.frame:0),animal:i});});
// 연못의 작은 야생 오리 한 쌍.
objects.push({x:5.3+Math.sin(anim*.1)*.8,y:25.5,type:'duck'+(Math.floor(anim)%3),size:.6});
const frame=motion&&F.moving?Math.floor(t*7)%2:0;objects.push({...s.player,type:'player_'+(F.facing||'front')+frame,player:true});
if(s.done[4].length>=5)for(let i=0;i<4;i++)objects.push({x:7+i*.8,y:29,type:['kong','drop','moru','popo'][i],size:1.15});
objects.sort((a,b)=>(a.x+a.y)-(b.x+b.y));F.worldHits=[];F.zoneHits=[];
for(const o of objects){const a=F.iso(o.x,o.y),{img,modern}=imageInfo(o.type);if(!img)continue;const {w:iw,h:ih}=dimensions(o.type,img,modern,o.size||1);const bottom=modern?ih/img.height*8:8;const screenX=a.x*scale+ox,screenY=a.y*scale+oy;if(screenX+iw*scale/2<-30||screenX-iw*scale/2>w+30||screenY+20<0||screenY-ih*scale>h)continue;
const sway=motion&&['tree','oak','pine','pinktree','fruitTree','flowerpatch','grass','reeds'].includes(o.type)?Math.sin(anim*(l.weather==='wind'?2:1)+o.x)*.012*(l.weather==='wind'?2:1):0;
const bounce=motion&&(o.npc!==undefined||o.player&&F.moving)?Math.sin(t*6+o.x)*1.2:0;c.save();c.translate(a.x,a.y+bounce);c.rotate(sway);if(o.solid&&a.y>p.y&&Math.abs(a.x-p.x)<iw*.48&&a.y-p.y<ih*.8)c.globalAlpha=.35;c.drawImage(img,-iw/2,-ih+bottom,iw,ih);c.restore();
if(o.type==='windmill'&&motion){c.save();c.translate(a.x,a.y-56*(o.size||1));c.rotate(anim*(l.weather==='wind'?1.5:.5));c.strokeStyle='#f6e9b8';c.lineWidth=7;for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(5,0);c.lineTo(27,0);c.stroke();}c.restore();}
if(o.building&&(phase==='밤'||phase==='저녁')){const gx=a.x-35,gy=a.y-85;c.fillStyle=phase==='밤'?'#ffe4a6aa':'#ffe9ad77';c.beginPath();c.ellipse(gx,gy,13,10,0,0,7);c.fill();c.fillRect(gx-6,gy-8,12,16);}
if(o.type==='lamp'&&(phase==='밤'||s.done[4].length>=5)){const g=c.createRadialGradient(a.x,a.y-75,0,a.x,a.y-75,50);g.addColorStop(0,'#ffeab778');g.addColorStop(1,'#ffeab700');c.fillStyle=g;c.fillRect(a.x-50,a.y-125,100,100);}
if(o.animal!==undefined){if(o.sleeping){c.fillStyle='#f8f0d3';c.font='bold 16px sans-serif';c.fillText('z',a.x+20,a.y-38);}if(l.animals[o.animal].friendship>=20){c.fillStyle='#ed9c99';c.font='15px sans-serif';c.fillText('♥',a.x+20,a.y-50);}}
if(o.player){c.fillStyle='#fff9d4';poly(c,[[a.x-5,a.y-ih-3],[a.x+5,a.y-ih-3],[a.x,a.y-ih+5]],'#fff9d4');}
if(o.npc!==undefined||o.feature||o.animal!==undefined){const hit={x:a.x-iw*.4,y:a.y-ih*.8,w:iw*.8,h:ih*.85,zone:o.npc,feature:o.feature,animal:o.animal};F.worldHits.push(hit);}
if(o.npc!==undefined){const z=F.zones[o.npc];const ready=F.unlocked(s,o.npc);c.fillStyle=ready?'#fff9df':'#dce4ce';c.beginPath();c.arc(a.x,a.y-ih,10,0,7);c.fill();c.fillStyle='#587245';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText(ready?'!':'·',a.x,a.y-ih+5);}
if(o.building&&zoom>=.6){const label=o.feature==='home'?F.houseNames[l.house]:o.zone!==undefined?F.zones[o.zone].name:o.name;if(label){c.font='600 15px sans-serif';const tw=c.measureText(label).width+24;c.fillStyle='#fff9e8ed';c.beginPath();c.roundRect(a.x-tw/2,a.y-ih+12,tw,28,9);c.fill();c.fillStyle='#4e6651';c.textAlign='center';c.fillText(label,a.x,a.y-ih+31);if(o.zone!==undefined)F.zoneHits.push({x:a.x-tw/2,y:a.y-ih+12,w:tw,h:28,zone:o.zone});}}
}
const event=F.eventInfo(s);if(event){const ep=F.iso(event.x,event.y);if(l.event.type===0){for(let i=0;i<4;i++){const x=ep.x+Math.sin(anim*1.5+i*1.6)*55,y=ep.y-50+Math.cos(anim*2+i)*10;c.strokeStyle='#536b63';c.lineWidth=3;c.beginPath();c.moveTo(x-7,y-3);c.lineTo(x,y+Math.sin(anim*5)*4);c.lineTo(x+7,y-3);c.stroke();}}else if(l.event.type===1){for(let i=0;i<4;i++){c.fillStyle='#add85d';c.beginPath();c.arc(ep.x+i*5,ep.y-15+Math.sin(i+anim),4,0,7);c.fill();}}else if(l.event.type===2){const info=imageInfo('fence');c.save();c.translate(ep.x,ep.y);c.rotate(.4);c.drawImage(info.img,-40,-70,80,110);c.restore();}else{c.fillStyle='#8bcdd999';c.beginPath();c.ellipse(ep.x,ep.y,40,17,0,0,7);c.fill();}c.fillStyle='#fff5d3';c.beginPath();c.arc(ep.x,ep.y-85,17,0,7);c.fill();c.fillStyle='#a6783a';c.font='bold 22px sans-serif';c.textAlign='center';c.fillText('!',ep.x,ep.y-77);F.worldHits.push({x:ep.x-45,y:ep.y-110,w:90,h:120,feature:'event'});}
// 배치 후보를 실제 지도에 미리 표시합니다. 확인 전에는 결제하지 않습니다.
if(F.placement){const q=F.placement;if(q.x!==undefined){const valid=q.valid,a=F.iso(q.x,q.y),d=F.decorations.find(d=>d.id===q.id);tile(c,q.x,q.y,valid?'#f6f5aabb':'#e99a8ccc',35);const info=imageInfo(d.type);if(info.img){c.globalAlpha=.65;const dim=dimensions(d.type,info.img,info.modern);c.drawImage(info.img,a.x-dim.w/2,a.y-dim.h+8,dim.w,dim.h);c.globalAlpha=1;}}}
if(motion&&l.weather==='sun'){for(let i=0;i<8;i++){const a=F.iso(8+i*2.4,15+Math.sin(anim*.1+i)*3);const xx=a.x+Math.sin(anim*1.1+i)*15,yy=a.y-35+Math.cos(anim+i)*8;c.fillStyle=i%2?'#f8e6ab':'#ecafb7';c.beginPath();c.ellipse(xx-3,yy,Math.abs(Math.sin(anim*8+i))*4+1,3,0,0,7);c.ellipse(xx+3,yy,4,3,0,0,7);c.fill();}}
F.particles=F.particles.filter(e=>t-e.start<2);if(motion)for(const e of F.particles){const a=F.iso(e.x,e.y),age=t-e.start;for(let i=0;i<14;i++){c.fillStyle=['#fff8bc','#f2b19d','#ddeeb0'][i%3];c.globalAlpha=Math.max(0,1-age/2);const angle=i*2.4;c.fillRect(a.x+Math.cos(angle)*age*40,a.y-40+Math.sin(angle)*age*30-age*20,4,5);}c.globalAlpha=1;}
c.restore();
if(phase==='저녁'||phase==='밤'){c.fillStyle=phase==='밤'?'#213e7136':'#ed966b22';c.fillRect(0,0,w,h);if(phase==='밤'){c.fillStyle='#fff4be';c.beginPath();c.arc(w-85,78,16,0,7);c.fill();c.fillStyle='#6b8195';c.beginPath();c.arc(w-78,73,14,0,7);c.fill();for(let i=0;i<30;i++){const x=F.hash(i,14)*w,y=F.hash(i,17)*h;c.globalAlpha=.3+Math.abs(Math.sin(anim*.8+i))*.5;c.fillStyle='#fff4b6';c.fillRect(x,y,2,2);}c.globalAlpha=1;}}
if(l.weather==='rain'&&motion){c.strokeStyle='#e4f5f299';c.lineWidth=1.3;for(let i=0;i<85;i++){const x=(F.hash(i,1)*w+anim*40)%w,y=(F.hash(i,5)*h+anim*300)%h;c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y+13);c.stroke();}}
if(l.weather==='wind'&&motion){for(let i=0;i<15;i++){const x=(F.hash(i,4)*w+anim*70)%w,y=F.hash(i,9)*h+Math.sin(anim+i)*15;c.fillStyle='#dbc57199';c.beginPath();c.ellipse(x,y,4,2,anim+i,0,7);c.fill();}}
};
F.drawInterior=(cv,s,avatar)=>{const c=cv.getContext('2d');cv.width=560;cv.height=380;c.clearRect(0,0,560,380);const pos=(x,y)=>({x:280+(x-y)*27,y:145+(x+y)*13.5});poly(c,[[64,145],[280,37],[280,145],[64,253]],'#e5ca99');poly(c,[[280,37],[496,145],[496,253],[280,145]],'#d4bc91');
for(let x=0;x<8;x++)for(let y=0;y<8;y++){const p=pos(x,y);poly(c,[[p.x,p.y-13.5],[p.x+27,p.y],[p.x,p.y+13.5],[p.x-27,p.y]],(x+y)%2?'#cfae7e':'#d9b989');}
// 창문, 침대, 책상. 집 단계에 따라 책장과 카펫, 조명을 추가합니다.
poly(c,[[108,133],[169,102],[169,156],[108,187]],'#8abdb4');c.strokeStyle='#f9e7bd';c.lineWidth=5;c.strokeRect(350,112,49,35);
poly(c,[[118,214],[172,187],[226,214],[172,241]],'#a9c7b5');poly(c,[[118,214],[172,241],[172,258],[118,232]],'#aa7d5b');poly(c,[[128,207],[156,194],[184,208],[156,221]],'#fff1d3');
poly(c,[[355,223],[401,200],[447,223],[401,246]],'#b88b62');poly(c,[[355,223],[401,246],[401,265],[355,242]],'#986e52');poly(c,[[380,217],[400,208],[419,217],[399,226]],'#e9d5ab');
if(s.life.house>=1)poly(c,[[230,245],[280,220],[334,245],[280,272]],'#c6878b');if(s.life.house>=2){c.fillStyle='#b88e60';c.fillRect(280,87,55,73);for(let i=0;i<3;i++)for(let j=0;j<7;j++){c.fillStyle=['#88a99a','#d49c8b','#e4c486'][j%3];c.fillRect(284+j*7,92+i*21,5,16);}}
if(s.life.house>=3){const im=F.images.s_flowerpatch;if(im)c.drawImage(im,330,250,80,60);c.fillStyle='#f7d78e';c.beginPath();c.arc(450,190,12,0,7);c.fill();c.fillStyle='#917857';c.fillRect(448,202,4,38);}
const p=pos(avatar.x,avatar.y),im=F.images['s_player_front0'];if(im)c.drawImage(im,p.x-24,p.y-62,48,72);c.fillStyle='#685b48';c.font='14px sans-serif';c.textAlign='center';c.fillText('방향키로 둘러보고, 아래 버튼으로 농장에 돌아가요.',280,368);
};
})(Farm);
