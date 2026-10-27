/* 개인정보와 화면 제어를 분리한 활동 통계. 정답률은 '문제 첫 답'과 '전체 시도'로 구분합니다. */
(function(F){
const defaults=()=>({activeSeconds:0,elapsedSeconds:0,attempts:0,correctAttempts:0,questions:0,firstCorrect:0,completed:0,hints:0,unassisted:0});
const key=q=>[q.id,q.kind,q.a,q.b,q.answer].join('|');
function show(s,q,topic){const k=key(q);let item=s.records.find(x=>x.key===k);if(!item){item={key:k,id:'question-'+s.questionSerial++,topic,prompt:(q.display||`${q.a} ${q.op} ${q.b} = ?`).slice(0,200),attempts:0,hints:0,correct:false,firstCorrect:false,seconds:0,startActive:s.active};s.records.push(item);s.records=s.records.slice(-400);}s.currentKey=k;return item;}
function attempt(s,q,correct,topic){const r=show(s,q,topic);if(r.correct)return false;const m=s.metrics;if(!r.attempts){m.questions++;r.firstCorrect=correct;if(correct)m.firstCorrect++;}r.attempts++;m.attempts++;if(correct){r.correct=true;m.correctAttempts++;m.completed++;if(r.attempts===1&&r.hints===0)m.unassisted++;}return true;}
function hint(s,q,topic){const r=show(s,q,topic);if(r.correct)return;r.hints++;s.metrics.hints++;}
function snapshot(s,finish=false){s.metrics.activeSeconds=Math.floor(s.active);s.metrics.elapsedSeconds=Math.max(s.metrics.activeSeconds,Math.floor((Date.now()-s.began)/1000));s.revision++;const log=s.records.map(x=>({id:x.id,topic:x.topic,prompt:x.prompt,attempts:x.attempts,hints:x.hints,correct:x.correct,firstCorrect:x.firstCorrect,seconds:Math.floor(x.seconds||0)}));return {sessionId:s.receipt.id,revision:s.revision,metrics:{...s.metrics},log,finish};}
F.ClassroomCore={tick(s,dt,questionActive){s.active+=dt;if(questionActive){const q=s.records.find(x=>x.key===s.currentKey);if(q&&!q.correct)q.seconds+=dt;}},create:(profile,receipt)=>({profile,receipt,began:Date.now(),active:0,metrics:defaults(),records:[],questionSerial:1,revision:0,submitted:false}),show,attempt,hint,snapshot,key};
})(globalThis.Farm=globalThis.Farm||{});
