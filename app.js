// جفتینو - منطق اصلی بازی (کامنت‌ها برای پیدا کردن محل تغییر)
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let CFG,SETS={},ABOUT,mode='calm',setId='animals',chap=0,G=null,tm=null,tab='rec';
const LS=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let P=LS('jofti_p')||{},ST=LS('jofti_s')||{sound:true,vib:true},ST2=LS('jofti_t')||{games:0,time:0};
const key=()=>mode+'_'+setId,pr=()=>P[key()]||(P[key()]={u:1,s:{},b:{}});
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
// صدا (ساخته‌شده با کد، بدون فایل) و لرزش (روی آیفون کار نمی‌کند)
let AC;function beep(f,d=.12){if(!ST.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.value=.08;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const vib=()=>{if(ST.vib&&navigator.vibrate)navigator.vibrate(60)};
function go(id){$$('.scr').forEach(e=>e.hidden=e.id!==id);document.body.classList.toggle('mapbg',id==='map');
 if(id==='home')counters();if(id==='map')drawMap();if(id==='records')drawRec();if(id==='settings'){$('#sSnd').checked=ST.sound;$('#sVib').checked=ST.vib}scrollTo(0,0)}
function counters(){let s=0,c=0;for(const k in P){for(const l in P[k].s)s+=P[k].s[l];if(k.startsWith('challenge'))c+=P[k].u-1}
 $$('#cStar,.cStar').forEach(e=>e.textContent=s);$$('#cCup,.cCup').forEach(e=>e.textContent=c)}
// مرحله‌ها: اندازه‌ی شبکه از levels-config.json محاسبه می‌شود
function lv(L){const per=CFG.levelsPerGridStep,n=CFG.grids.length,gi=Math.min(Math.floor((L-1)/per),n-1),g=CFG.grids[gi];
 const extra=Math.max(0,L-per*(n-1)-1),c=CFG.challenge,sec=Math.max(c.minSecondsPerPair,c.secondsPerPair-Math.floor(extra/c.extraLevelsPerSecond));
 return{cols:g.cols,rows:g.rows,pairs:g.cols*g.rows/2,sec}}
function drawMap(){const per=CFG.levelsPerChapter,p=pr(),box=$('#path');box.innerHTML='';
 for(let i=0;i<per;i++){const L=chap*per+i+1;if(L>CFG.levelsPerSection)break;const [x,y]=CFG.mapPoints[i],b=document.createElement('button');
  b.className='node '+(L<p.u?'done':L===p.u?'cur':'');b.style.cssText=`left:${x}%;top:${y}%`;
  b.innerHTML=L>p.u?'🔒':L+(p.s[L]?`<small>${'⭐'.repeat(p.s[L])}</small>`:'');b.disabled=L>p.u;b.onclick=()=>start(L);box.append(b)}
 $('#chapT').textContent=`بخش ${chap*per+1}–${Math.min((chap+1)*per,CFG.levelsPerSection)}`;
 $('#twoBox').hidden=mode!=='calm';$('#pv').disabled=chap===0;$('#nx').disabled=(chap+1)*per>=CFG.levelsPerSection}
function start(L){const v=lv(L),items=shuf(SETS[setId]).slice(0,v.pairs);
 G={L,v,deck:shuf([...items,...items]),open:[],matched:0,moves:0,miss:0,t0:Date.now(),turn:0,score:[0,0],lock:false,left:v.pairs*v.sec,two:mode==='calm'&&$('#two').checked};
 go('game');$('#gL').textContent='مرحله '+L;$('#gM').textContent=0;$('#gT').hidden=mode!=='challenge';tick();
 const gr=$('#grid');gr.style.gridTemplateColumns=`repeat(${v.cols},1fr)`;gr.innerHTML='';
 G.deck.forEach(it=>{const c=document.createElement('button');c.className='card';c.dataset.n=it.id;c.setAttribute('aria-label','کارت');
  c.innerHTML=`<img class="back" src="images/card-back.webp" alt=""><img class="face" src="${it.image}" alt="${it.name}">`;c.onclick=()=>flip(c);gr.append(c)});
 clearInterval(tm);if(mode==='challenge')tm=setInterval(()=>{G.left--;tick();if(G.left<=0)end(false)},1000);turnTxt()}
function tick(){$('#gT').textContent='⏱ '+G.left}
function turnTxt(){$('#turn').textContent=G.two?`نوبت بازیکن ${G.turn+1} — امتیاز: ${G.score[0]} : ${G.score[1]}`:''}
function flip(c){if(G.lock||c.classList.contains('open')||c.classList.contains('done'))return;c.classList.add('open');G.open.push(c);beep(500,.05);
 if(G.open.length<2)return;G.moves++;$('#gM').textContent=G.moves;const[a,b]=G.open;G.open=[];
 if(a.dataset.n===b.dataset.n){setTimeout(()=>{a.classList.add('done');b.classList.add('done')},350);G.matched++;G.score[G.turn]++;beep(800,.15);turnTxt();if(G.matched===G.v.pairs)setTimeout(()=>end(true),700)}
 else{G.lock=true;G.miss++;beep(200,.2);vib();setTimeout(()=>{[a,b].forEach(x=>x.classList.add('bad'));},300);
  setTimeout(()=>{[a,b].forEach(x=>x.classList.remove('open','bad'));G.lock=false;if(G.two){G.turn=1-G.turn;turnTxt()}
   if(mode==='challenge'&&G.miss%CFG.challenge.shuffleAfterMistakes===0)reshuffle()},800)}}
// جابه‌جا کردن کارت‌های باقی‌مانده در حالت چالشی
function reshuffle(){const gr=$('#grid'),all=[...gr.children],idx=all.map((c,i)=>c.classList.contains('done')?-1:i).filter(i=>i>=0),m=shuf(idx.map(i=>all[i]));idx.forEach((i,k)=>all[i]=m[k]);gr.replaceChildren(...all)}
function end(win){clearInterval(tm);const t=Math.round((Date.now()-G.t0)/1000);ST2.games++;ST2.time+=t;sv('jofti_t',ST2);const p=pr();let st=0;
 if(win){const r=G.moves/G.v.pairs;st=r<=CFG.starThresholds[0]?3:r<=CFG.starThresholds[1]?2:1;p.s[G.L]=Math.max(p.s[G.L]||0,st);const o=p.b[G.L];
  p.b[G.L]={t:o?Math.min(o.t,t):t,m:o?Math.min(o.m,G.moves):G.moves};if(G.L===p.u&&p.u<CFG.levelsPerSection)p.u++;sv('jofti_p',P)}
 go('result');$('#rT').textContent=win?'آفرین! 🎉':'زمان تمام شد ⏰';$('#rS').textContent=win?'⭐'.repeat(st)+'☆'.repeat(3-st):'دوباره امتحان کن';
 let d=`زمان: ${t} ثانیه — حرکت: ${G.moves}`;if(win&&G.two)d+=G.score[0]===G.score[1]?' — مساوی شدید!':` — برنده: بازیکن ${G.score[0]>G.score[1]?1:2}`;$('#rD').textContent=d;
 $('#rN').hidden=!win||G.L>=CFG.levelsPerSection;if(win)beep(900,.3)}
function drawRec(){const b=$('#recBox');
 if(tab==='stat'){let h=`تعداد بازی‌ها: ${ST2.games}<br>مجموع زمان بازی: ${Math.round(ST2.time/60)} دقیقه<br>`;
  for(const k in P){const[m,s]=k.split('_');h+=`${m==='calm'?'آرامش':'چالشی'} / ${s==='animals'?'حیوانات':'میوه‌ها'}: ${P[k].u-1} مرحله تمام شده<br>`}b.innerHTML=h;return}
 let h='';for(const k in P){const[m,s]=k.split('_');for(const l in P[k].b)h+=`${m==='calm'?'آرامش':'چالشی'} / ${s==='animals'?'حیوانات':'میوه‌ها'} / مرحله ${l}: ${P[k].b[l].t} ثانیه، ${P[k].b[l].m} حرکت<br>`}
 b.innerHTML=h||'هنوز رکوردی ثبت نشده. یک مرحله را تمام کن!'}
function msg(t){const m=$('#msg');m.textContent=t;m.hidden=false}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.go)go(t.dataset.go);if(t.dataset.mode){mode=t.dataset.mode;go('sets')}
 if(t.dataset.set){setId=t.dataset.set;chap=Math.floor((pr().u-1)/CFG.levelsPerChapter);go('map')}
 if(t.dataset.tab){tab=t.dataset.tab;drawRec()}});
$('#pv').onclick=()=>{chap--;drawMap()};$('#nx').onclick=()=>{chap++;drawMap()};
$('#gBack').onclick=()=>{clearInterval(tm);go('map')};$('#gR').onclick=()=>start(G.L);
$('#rN').onclick=()=>{chap=Math.floor(G.L/CFG.levelsPerChapter);start(G.L+1)};$('#rR').onclick=()=>start(G.L);
$('#rM').onclick=()=>{chap=Math.floor((G.L-1)/CFG.levelsPerChapter);go('map')};
$('#sSnd').onchange=e=>{ST.sound=e.target.checked;sv('jofti_s',ST)};$('#sVib').onchange=e=>{ST.vib=e.target.checked;sv('jofti_s',ST)};
$('#sClr').onclick=()=>{if(confirm('همه‌ی پیشرفت و رکوردها پاک شود؟')){P={};ST2={games:0,time:0};sv('jofti_p',P);sv('jofti_t',ST2);counters()}};
// بارگذاری داده‌ها از پوشه‌ی data
(async()=>{try{const j=u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()});
 [CFG,SETS.animals,SETS.fruits,ABOUT]=await Promise.all([j('data/levels-config.json'),j('data/animals.json'),j('data/fruits.json'),j('data/about.json')]);
 $('#aboutBox').innerHTML=`<b>${ABOUT.name}</b> — نسخه ${ABOUT.version}<p>${ABOUT.description}</p>سازنده: ${ABOUT.creator}<br>${ABOUT.contactLabel}: ${ABOUT.contact}`;go('home')}
 catch(e){msg('بارگذاری بازی انجام نشد. اینترنت را بررسی کن و صفحه را دوباره باز کن.')}})();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').then(r=>{r.addEventListener('updatefound',()=>{const w=r.installing;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){$('#upd').hidden=false;$('#updB').onclick=()=>{w.postMessage('skip');location.reload()}}})})}).catch(()=>{});
