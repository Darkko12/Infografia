(() => {
  const DATA = window.APP_DATA;
  const app = document.getElementById('app');
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));

  function route(){ return (location.hash || '#home').slice(1); }
  function go(id){
    if(route()===id) return;
    const current = $('.screen');
    if(current){
      current.classList.add('route-out');
      setTimeout(()=>{ location.hash=id; }, 210);
    } else location.hash=id;
  }
  window.go = go;

  function header(home=false){
    return `<div class="header ${home?'home':''}">
      <button type="button" class="brand-home" aria-label="Volver al inicio" style="all:unset;display:flex;align-items:center;gap:14px;cursor:pointer">
        <img class="logo" src="assets/openai-logo.png" alt="" />
        <span class="brand">ChatGPT</span>
      </button>
      <span class="divider"></span>
      <span class="tagline">De herramienta a compañía</span>
    </div>`;
  }
  function backButton(target){ return `<button class="nav-back" type="button" data-go="${target}" aria-label="Volver"><span class="chev"></span></button>`; }
  function nextButton(target){ return `<button class="nav-next" type="button" data-go="${target}" aria-label="Siguiente"><span class="chev"></span></button>`; }
  function wireNav(root=app){
    $$('.brand-home',root).forEach(b=>b.addEventListener('click',()=>go('home')));
    $$('[data-go]',root).forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  }
  function finishEntry(screen){
    requestAnimationFrame(()=>requestAnimationFrame(()=>screen.classList.remove('entering')));
  }
  function renderHTML(html, init){
    app.innerHTML = html;
    const s = $('.screen',app);
    s.classList.add('route-in','entering');
    wireNav(s);
    init?.(s);
    finishEntry(s);
  }

  function orb(kind){
    const pts=[
      [24,2],[14,7],[34,8],[7,17],[22,14],[41,17],[12,26],[27,25],[47,27],[3,31],[18,35],[36,35],[9,43],[25,45],[42,45],[31,52]
    ];
    return `<div class="orb ${kind}">${pts.map(([x,y],i)=>`<span style="left:${x}px;top:${y}px;animation-delay:${(i%6)*.13}s"></span>`).join('')}</div>`;
  }

  function renderHome(){
    renderHTML(`<section class="screen home-screen">
      ${header(true)}
      <div class="home-hero">
        <img class="home-logo anim d1" src="assets/openai-logo.png" alt="" />
        <h1 class="home-title anim d2">¿En qué te puedo <span class="accent">ayudar</span> hoy?</h1>
        <div class="home-cards anim d3">
          <button class="home-card n1" type="button" data-go="n1-menu1">
            ${orb('cyan')}
            <div><h3>La expansión<br>de ChatGPT</h3><p>De herramienta a presencia cotidiana.</p></div>
            <span class="arrow-ring">→</span>
          </button>
          <button class="home-card n2" type="button" data-go="n2-intro">
            ${orb('red')}
            <div><h3>ChatGPT te da casi<br>siempre la razón.</h3><p>Estudios de <a href="https://www.nsf.gov/" target="_blank" rel="noreferrer">National Science Foundation.</a></p></div>
            <span class="arrow-ring">→</span>
          </button>
        </div>
      </div>
    </section>`);
  }

  const menuCards1=[
    ['¿Qué es ChatGPT?','Te contamos un poco de este modelo de IA, de otros bots similares y de sus diferencias con este en su tecnología y utilidad.','n1-chatgpt'],
    ['¿Qué es OpenAI?','OpenAI es la empresa que creó ChatGPT; su misión es que la inteligencia artificial general sea desarrollada como código libre y a beneficio de toda la humanidad.','n1-openai'],
    ['Competidores principales','Te ayudamos a comparar las visitas de los últimos 5 años de ChatGPT y 6 de sus competidores mas grandes.','n1-competitors'],
    ['Otros modelos similares','Otros cinco asistentes que se reparten hoy el mismo terreno,','n1-similar']
  ];
  const menuCards2=[
    ['Porcentaje de uso','En tan solo 4 años ChatGPT alcanzó los 1000M de usuarios semanales, te mostramos visualmente como fue el crecimiento.','n1-growth'],
    ['Uso de ChatGPT','OpenAI realizó una investigación sobre los promps más pedidos por el usuario, se dividio entre 7 categorias distintas.','n1-usage']
  ];
  function n1Menu(page){
    const cards = page===1?menuCards1:menuCards2;
    renderHTML(`<section class="screen">
      ${header(false)}${backButton('home')}
      <div class="n1-menu-wrap ${page===2?'page2':''}">
        <div class="n1-menu-copy anim d1">
          <h1>La expansión de<br>ChatGPT</h1>
          <p>Recorré las paradas para entender qué es<br>ChatGPT, quién lo construyó y con quién compite.</p>
        </div>
        <div class="menu-grid anim d2">
          ${cards.map(c=>`<button class="menu-card" type="button" data-go="${c[2]}"><h3>${c[0]}</h3><p>${c[1]}</p></button>`).join('')}
        </div>
      </div>
      ${page===1?`<button type="button" class="page-switch right" data-go="n1-menu2" aria-label="Más opciones"><span class="dbl">»</span></button>`:`<button type="button" class="page-switch left" data-go="n1-menu1" aria-label="Opciones anteriores"><span class="dbl">«</span></button>`}
    </section>`);
  }

  function botIcon(){ return `<span class="bot-icon"><span class="bot-ant"></span><span class="bot-head"><span class="bot-mouth"></span></span></span>`; }
  function renderN1ChatGPT(){
    const models=DATA.n1.chatgptModels;
    renderHTML(`<section class="screen">
      ${header(false)}${backButton('n1-menu1')}
      <div class="section-body chatgpt-layout">
        <div class="chatgpt-copy anim d1">
          <h1 class="section-title">¿Qué es ChatGPT?</h1>
          <p>Es un asistente conversacional que entiende el lenguaje natural y genera respuestas similares a las de una persona.</p>
          <h2>Sus distintos modelos</h2>
          <p>Hubo modelos principales, versiones pequeñas, modelos de razonamiento y variantes especializadas.<br>Te contamos sobre los 5 más destacados:</p>
        </div>
        <div class="model-timeline soft-panel anim d2">
          <div class="model-info" id="modelInfo"><strong></strong><small></small><p></p></div>
          <div class="timeline-line"></div><div class="timeline-end-glow"></div>
          <div class="timeline-models">
            ${models.map((m,i)=>`<button class="model-node" type="button" data-i="${i}">${botIcon()}<span class="tick"></span><span class="label">${m.label}</span></button>`).join('')}
          </div>
        </div>
      </div>
    </section>`, screen=>{
      const info=$('#modelInfo',screen), nodes=$$('.model-node',screen);
      let pinned=-1;
      const show=(i,force=false)=>{
        const m=models[i], node=nodes[i];
        nodes.forEach((n,k)=>n.classList.toggle('active',k===i));
        $('strong',info).textContent=m.title; $('small',info).textContent=m.date; $('p',info).textContent=m.body;
        const panel=node.closest('.model-timeline').getBoundingClientRect();
        const rect=node.getBoundingClientRect();
        const x=clamp(rect.left-panel.left+rect.width/2-150,20,panel.width-360);
        info.style.left=x+'px'; info.classList.add('show');
      };
      const hide=()=>{ if(pinned<0){info.classList.remove('show');nodes.forEach(n=>n.classList.remove('active'));} };
      nodes.forEach((n,i)=>{
        n.addEventListener('mouseenter',()=>show(i));
        n.addEventListener('mouseleave',hide);
        n.addEventListener('click',()=>{
          pinned=pinned===i?-1:i;
          if(pinned<0) hide(); else show(i,true);
        });
      });
      $('.model-timeline',screen).addEventListener('click',e=>{if(!e.target.closest('.model-node')){pinned=-1;hide();}});
    });
  }

  function renderN1OpenAI(){
    const people=DATA.n1.openaiPeople; let idx=0;
    renderHTML(`<section class="screen">
      ${header(false)}${backButton('n1-menu1')}
      <div class="section-body openai-layout">
        <div class="openai-copy anim d1"><h1 class="section-title">¿Qué es OpenAI?</h1><p class="section-lead">OpenAI es una empresa de investigación y desarrollo de inteligencia artificial, fundada en 2015.<br>Algunos de sus referentes más importantes son:</p></div>
        <div class="person-stage anim d2" id="personStage"><button class="carousel-arrow prev" type="button">‹</button><button class="carousel-arrow next" type="button">›</button></div>
        <div class="fact-stack anim d3" id="factStack">${[0,1,2].map(()=>`<div class="fact-card"><span class="fact-icon">✦</span><p></p></div>`).join('')}</div>
      </div>
    </section>`, screen=>{
      const stage=$('#personStage',screen), stack=$('#factStack',screen), facts=$$('.fact-card',stack);
      function card(p,cls){
        const initials=p.name.split(' ').map(x=>x[0]).slice(0,2).join('');
        return `<div class="person-card ${cls}"><img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="person-fallback" style="display:none">${initials}</div><h3>${p.name}</h3><p>${p.role}</p></div>`;
      }
      function update(dir=0){
        $$('.person-card',stage).forEach(x=>x.remove());
        const left=(idx-1+people.length)%people.length,right=(idx+1)%people.length;
        stage.insertAdjacentHTML('beforeend',card(people[left],'left')+card(people[idx],'center')+card(people[right],'right'));
        facts.forEach(f=>f.classList.add('swap'));
        setTimeout(()=>{facts.forEach((f,i)=>{ $('p',f).textContent=people[idx].facts[i];f.classList.remove('swap');});},110);
      }
      $('.prev',stage).addEventListener('click',()=>{idx=(idx-1+people.length)%people.length;update(-1)});
      $('.next',stage).addEventListener('click',()=>{idx=(idx+1)%people.length;update(1)});
      update();
    });
  }

  function svgEl(tag,attrs={}){const e=document.createElementNS(SVG_NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e;}
  function renderN1Competitors(){
    renderHTML(`<section class="screen">
      ${header(false)}${backButton('n1-menu1')}
      <div class="section-body comp-layout">
        <div class="comp-copy anim d1"><h1 class="section-title">Competidores principales</h1><p class="section-lead">Compara los flujos de visitas web anuales de los últimos 5 años (Noviembre 2022 - Marzo 2026) de ChatGPT y 6 de sus competidores.</p></div>
        <div class="comp-main anim d2">
          <div class="chart-panel" id="compChart"><svg viewBox="0 0 880 450" preserveAspectRatio="none"></svg><div class="chart-tip" id="compTip"></div><div class="chart-help"><span class="help-i">i</span><span>Pasa el mouse sobre las líneas punteadas para leer más detalles. Presiona los botones para comparar a los distintos competidores.</span></div></div>
          <div class="comp-buttons" id="compButtons"></div>
        </div>
      </div>
    </section>`, screen=>initCompetitors(screen));
  }
  function initCompetitors(screen){
    const D=DATA.n1.competitors, svg=$('#compChart svg',screen), tip=$('#compTip',screen), btns=$('#compButtons',screen);
    const W=880,H=450,L=55,R=18,T=24,B=60, PW=W-L-R, PH=H-T-B;
    let selected=null;
    const minV=5,maxV=70000, logMin=Math.log10(minV), logMax=Math.log10(maxV);
    const x=i=>L+i*(PW/(D.years.length-1));
    const y=v=>T+(logMax-Math.log10(v))/(logMax-logMin)*PH;
    const ticks=[10,100,1000,10000,70000];
    ticks.forEach(v=>{
      const yy=y(v);svg.appendChild(svgEl('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#303744','stroke-width':1,'stroke-dasharray':'4 5'}));
      const tx=svgEl('text',{x:L-10,y:yy+4,fill:'#7f8793','font-size':11,'text-anchor':'end'});tx.textContent=v>=1000?(v/1000)+'B':v+'M';svg.appendChild(tx);
    });
    D.years.forEach((yr,i)=>{
      const xx=x(i);svg.appendChild(svgEl('line',{x1:xx,y1:T,x2:xx,y2:H-B,stroke:'#626875','stroke-width':1,'stroke-dasharray':'5 7'}));
      const tx=svgEl('text',{x:xx,y:H-28,fill:'#9aa1ad','font-size':12,'text-anchor':'middle'});tx.textContent=yr;svg.appendChild(tx);
    });
    const groups=[];
    D.series.forEach(s=>{
      const g=svgEl('g',{'data-series':s.key});
      let d='',started=false;
      s.values.forEach((v,i)=>{if(v==null){started=false;return;} const cmd=started?'L':'M';d+=`${cmd}${x(i)} ${y(v)} `;started=true;});
      const p=svgEl('path',{d,fill:'none',stroke:s.color,'stroke-width':2.6,'stroke-linejoin':'round','stroke-linecap':'round'});g.appendChild(p);
      s.values.forEach((v,i)=>{if(v!=null)g.appendChild(svgEl('circle',{cx:x(i),cy:y(v),r:4,fill:s.color,stroke:'#10141d','stroke-width':1.2}));});
      svg.appendChild(g);groups.push({key:s.key,g});
      const b=document.createElement('button');b.type='button';b.className='comp-btn';b.dataset.key=s.key;b.innerHTML=`<span class="dot" style="background:${s.color}"></span><span>${s.label}</span>`;btns.appendChild(b);
    });
    function applySelection(){
      groups.forEach(({key,g})=>{g.style.opacity=selected&&key!==selected?'.16':'1';const p=g.querySelector('path');p.setAttribute('stroke-width',selected===key?'5':'2.6');});
      $$('.comp-btn',btns).forEach(b=>b.classList.toggle('active',b.dataset.key===selected));
    }
    btns.addEventListener('click',e=>{const b=e.target.closest('.comp-btn');if(!b)return;selected=selected===b.dataset.key?null:b.dataset.key;applySelection();});
    D.years.forEach((yr,i)=>{
      const zone=svgEl('rect',{x:x(i)-PW/(D.years.length-1)/2,y:T,width:PW/(D.years.length-1),height:PH,fill:'transparent','data-year':i});svg.appendChild(zone);
      zone.addEventListener('mousemove',ev=>{
        tip.innerHTML=`<strong>${yr}</strong>`+D.series.map(s=>`<div class="chart-tip-row"><span class="dot" style="background:${s.color}"></span><span>${s.display[i]}</span><span>${s.label}</span></div>`).join('');
        const panel=$('#compChart',screen).getBoundingClientRect();tip.style.left=clamp(ev.clientX-panel.left+12,8,panel.width-195)+'px';tip.style.top=clamp(ev.clientY-panel.top-40,8,panel.height-205)+'px';tip.classList.add('show');
      });zone.addEventListener('mouseleave',()=>tip.classList.remove('show'));
    });
  }

  function renderN1Similar(){
    const M=DATA.n1.similarModels; let idx=0;
    renderHTML(`<section class="screen">${header(false)}${backButton('n1-menu1')}
      <div class="section-body similar-layout"><div class="similar-carousel anim d1" id="simCarousel"><div class="logo-track"><button class="carousel-arrow prev" type="button">‹</button><button class="carousel-arrow next" type="button">›</button></div><div class="sim-desc" id="simDesc"><span class="bulb"></span><p></p></div></div></div>
    </section>`, screen=>{
      const root=$('#simCarousel',screen),track=$('.logo-track',root),desc=$('#simDesc',root),p=$('p',desc),bulb=$('.bulb',desc);
      function update(){
        $$('.brand-card',track).forEach(x=>x.remove());
        const classes=['left2','left1','center','right1','right2'];
        for(let off=-2;off<=2;off++){
          const k=(idx+off+M.length)%M.length,m=M[k];track.insertAdjacentHTML('beforeend',`<div class="brand-card ${m.brand} ${classes[off+2]}">${m.name}</div>`);
        }
        desc.classList.add('swap');setTimeout(()=>{p.textContent=M[idx].description;desc.classList.remove('swap');bulb.classList.remove('pulse');void bulb.offsetWidth;bulb.classList.add('pulse');},100);
      }
      $('.prev',root).addEventListener('click',()=>{idx=(idx-1+M.length)%M.length;update()});$('.next',root).addEventListener('click',()=>{idx=(idx+1)%M.length;update()});update();
    });
  }

  function renderN1Growth(){
    renderHTML(`<section class="screen">${header(false)}${backButton('n1-menu2')}
      <div class="section-body growth-layout"><div class="growth-copy anim d1"><h1 class="section-title">Porcentaje del uso</h1><p class="section-lead">Te mostramos cómo creció el uso de ChatGPT.</p></div><div class="growth-chart soft-panel anim d2" id="growthChart"><svg viewBox="0 0 1050 450" preserveAspectRatio="none"></svg><div class="growth-tip" id="growthTip"></div><button class="mode-btn" type="button">2026 / Registro de cada mes</button></div></div>
    </section>`, screen=>initGrowth(screen));
  }
  function initGrowth(screen){
    const root=$('#growthChart',screen),svg=$('svg',root),tip=$('#growthTip',root),btn=$('.mode-btn',root);let mode='annual';
    function draw(){
      svg.innerHTML='';const data=DATA.n1.growth[mode];const W=1050,H=450,L=60,R=25,T=28,B=60,PW=W-L-R,PH=H-T-B,max=Math.max(...data.map(d=>d.value))*1.1;
      for(let j=0;j<=4;j++){const yy=T+PH*j/4;svg.appendChild(svgEl('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#343b47','stroke-width':1}));}
      const x=i=>L+i*(PW/(data.length-1)),y=v=>T+PH-(v/max)*PH;
      let path='';data.forEach((d,i)=>path+=(i?'L':'M')+x(i)+' '+y(d.value)+' ');
      const area=svgEl('path',{d:path+`L${x(data.length-1)} ${H-B} L${x(0)} ${H-B} Z`,fill:'rgba(71,95,143,.18)'});svg.appendChild(area);
      const p=svgEl('path',{d:path,fill:'none',stroke:'#f3f4f6','stroke-width':2});p.style.strokeDasharray='1600';p.style.strokeDashoffset='1600';p.style.transition='stroke-dashoffset .65s var(--ease)';svg.appendChild(p);requestAnimationFrame(()=>p.style.strokeDashoffset='0');
      data.forEach((d,i)=>{
        const c=svgEl('circle',{cx:x(i),cy:y(d.value),r:5,fill:'#fff',stroke:'#8790a0','stroke-width':1,'data-i':i});svg.appendChild(c);
        const tx=svgEl('text',{x:x(i),y:H-27,fill:'#8e96a3','font-size':11,'text-anchor':'middle'});tx.textContent=d.label;svg.appendChild(tx);
        c.addEventListener('mousemove',ev=>{tip.innerHTML=`<strong>${d.label}</strong>${mode==='monthly'?`${d.value}M usuarios semanales`:d.note}`;const rr=root.getBoundingClientRect();tip.style.left=clamp(ev.clientX-rr.left+12,8,rr.width-250)+'px';tip.style.top=clamp(ev.clientY-rr.top-58,8,rr.height-80)+'px';tip.classList.add('show')});c.addEventListener('mouseleave',()=>tip.classList.remove('show'));
      });
      btn.textContent=mode==='annual'?'2026 / Registro de cada mes':'Volver';
    }
    btn.addEventListener('click',()=>{mode=mode==='annual'?'monthly':'annual';draw()});draw();
  }

  function arcPath(cx,cy,r1,r2,a0,a1){
    const p=(r,a)=>[cx+r*Math.cos(a-Math.PI/2),cy+r*Math.sin(a-Math.PI/2)];const A=p(r2,a0),B=p(r2,a1),C=p(r1,a1),D=p(r1,a0),large=(a1-a0)>Math.PI?1:0;
    return `M${A[0]} ${A[1]} A${r2} ${r2} 0 ${large} 1 ${B[0]} ${B[1]} L${C[0]} ${C[1]} A${r1} ${r1} 0 ${large} 0 ${D[0]} ${D[1]} Z`;
  }
  function renderN1Usage(){
    const items=DATA.n1.usage;
    renderHTML(`<section class="screen">${header(false)}${backButton('n1-menu2')}
      <div class="section-body usage-layout"><div class="usage-copy anim d1"><h1 class="section-title">¿Para qué usa el usuario ChatGPT?</h1><p class="section-lead">Una mirada a las principales categorías de uso.</p></div><div class="usage-main anim d2"><aside class="usage-detail" id="usageDetail"><h3></h3><div class="big"></div><p></p><div class="mini-bar"><div class="mini-fill"></div></div></aside><div class="donut-panel" id="donutPanel"><svg class="donut-svg" viewBox="0 0 620 620"></svg><div class="donut-center"><div class="pct"></div><div class="lbl"></div></div><div class="usage-tip"></div><div class="donut-legend">${items.map(it=>`<span class="legend-item"><span class="dot" style="background:${it.color}"></span>${it.label}</span>`).join('')}</div></div></div><div class="usage-help"><span class="mouse-ico">◉</span><span>Haz click en cada sección · Para leer más información en cada una</span></div></div>
    </section>`,screen=>initUsage(screen));
  }
  function initUsage(screen){
    const items=DATA.n1.usage,svg=$('.donut-svg',screen),panel=$('#donutPanel',screen),tip=$('.usage-tip',screen),detail=$('#usageDetail',screen),center=$('.donut-center',screen);let active=-1,a=0;
    items.forEach((it,i)=>{const span=it.value/100*Math.PI*2,p=svgEl('path',{d:arcPath(310,280,128,215,a,a+span),fill:it.color,class:'donut-seg','data-i':i});svg.appendChild(p);a+=span;});
    const segs=$$('.donut-seg',svg);
    function select(i){active=active===i?-1:i;segs.forEach((s,k)=>{s.classList.toggle('active',k===active);s.classList.toggle('dim',active>=0&&k!==active)});if(active<0){detail.classList.remove('show');center.classList.remove('show');return;}const it=items[active];$('h3',detail).textContent=it.label;$('.big',detail).textContent=it.value.toFixed(1).replace('.',',')+'%';$('p',detail).textContent=it.detail;$('.mini-fill',detail).style.cssText=`width:${it.value}%;background:${it.color}`;detail.classList.add('show');$('.pct',center).textContent=it.value.toFixed(1).replace('.',',')+'%';$('.pct',center).style.color=it.color;$('.lbl',center).textContent=it.label;center.classList.add('show');}
    segs.forEach((s,i)=>{s.addEventListener('click',()=>select(i));s.addEventListener('mousemove',e=>{const it=items[i],r=panel.getBoundingClientRect();tip.textContent=`${it.value.toFixed(1).replace('.',',')}% · ${it.label}`;tip.style.left=clamp(e.clientX-r.left+10,8,r.width-180)+'px';tip.style.top=clamp(e.clientY-r.top-24,8,r.height-60)+'px';tip.classList.add('show');segs.forEach((x,k)=>{if(active<0)x.classList.toggle('dim',k!==i)});});s.addEventListener('mouseleave',()=>{tip.classList.remove('show');segs.forEach((x,k)=>x.classList.toggle('dim',active>=0&&k!==active));});});
  }

  function renderN2Intro(){
    renderHTML(`<section class="screen">${header(false)}${backButton('home')}
      <div class="n2-intro-wrap"><h1 class="n2-intro-title anim d1">La <span class="ia">IA</span> casi siempre<br>te va a dar la <span class="reason">razón.</span></h1><div class="study-card anim d2"><div class="study-stat"><span class="ico">▣</span><span><strong>2.405</strong> Personas.</span></div><div class="study-stat"><span class="ico">◆</span><span>National <strong>Science</strong><br>Foundation.</span></div><div class="study-question"><span class="ico">◔</span><span>Qué sucede cuando <strong>la IA valida nuestras opiniones</strong><br>y cómo nos <strong>influye para tomar decisiones.</strong></span></div></div><button type="button" class="start-pill anim d3" data-go="n2-agreement"><span class="mouse-ico">◉</span><span>Click para empezar.</span></button></div>
    </section>`);
  }

  function renderN2Agreement(){
    const tabs=DATA.n2.agreementTabs;
    renderHTML(`<section class="screen">${header(false)}${backButton('n2-intro')}${nextButton('n2-perspective')}
      <div class="section-body n2-agreement"><h1 class="n2-big-title anim d1">ChatGPT te da<br>mucho más la razón<br>que tus amigxs.</h1><p class="n2-sub anim d1">El estudio comparó las respuestas de ChatGPT-4o contra lo que haría un humano en tres tipos de situaciones reales.</p><div class="tabs anim d2">${tabs.map((t,i)=>`<button class="tab-btn ${i===0?'active':''}" type="button" data-i="${i}">${t.label}</button>`).join('')}</div><div class="scenario-note anim d2"></div><div class="bar-pair anim d3"><div class="meter-row"><span class="who">Humanos</span><div class="meter"><div class="meter-fill"></div><div class="meter-knob"></div><div class="meter-val"></div></div></div><div class="meter-row"><span class="who">Chat GPT</span><div class="meter"><div class="meter-fill"></div><div class="meter-knob"></div><div class="meter-val"></div></div></div><div class="metric">Métrica: % de respuestas que te aprueban la acción explícitamente.</div></div></div>
    </section>`,screen=>{
      const tabBtns=$$('.tab-btn',screen),rows=$$('.meter-row',screen),note=$('.scenario-note',screen);let cur=0;
      function setRow(row,v){const fill=$('.meter-fill',row),knob=$('.meter-knob',row),val=$('.meter-val',row);fill.style.width=v+'%';knob.style.left=clamp(v,3,97)+'%';val.textContent=v+'%';val.style.left=v>72?`calc(${v}% - 112px)`:`calc(${Math.max(v,3)}% + 48px)`;}
      function update(i){cur=i;tabBtns.forEach((b,k)=>b.classList.toggle('active',k===i));note.textContent=tabs[i].description;setRow(rows[0],tabs[i].human);setRow(rows[1],tabs[i].ai);}
      tabBtns.forEach((b,i)=>b.addEventListener('click',()=>{if(i!==cur)update(i)}));setTimeout(()=>update(0),80);
    });
  }

  function renderN2Perspective(){
    renderHTML(`<section class="screen">${header(false)}${backButton('n2-agreement')}${nextButton('n2-paradox')}
      <div class="section-body n2-persp"><h1 class="n2-big-title anim d1">La IA complaciente<br>te encierra en tu<br>propia perspectiva.</h1><p class="persp-sub anim d1">En conversaciones reales de 6 turnos donde ChatGPT era cada vez más complaciente, se habló sobre un conflicto personal y se midió si la IA menciona y considera la perspectiva de la otra persona.</p><div class="reveal-chart anim d2" id="revealChart"><svg viewBox="0 0 1030 360" preserveAspectRatio="none"></svg><div class="reveal-overlay"></div><div class="scrubber"><span class="scrub-handle"></span></div></div><div class="legend-persp"><span><span class="dot" style="background:#43e7cb"></span>IA no complaciente</span><span><span class="dot" style="background:#ffb000"></span>IA complaciente</span></div><p class="persp-metric">Métrica: % de veces que la IA considera la perspectiva de la otra persona del conflicto.</p><div class="scrub-help"><span class="mouse-ico">◉</span><span>Deslizá la línea para descubrir los resultados</span></div></div>
    </section>`,screen=>initPerspective(screen));
  }
  function initPerspective(screen){
    const data=DATA.n2.perspective,root=$('#revealChart',screen),svg=$('svg',root),cover=$('.reveal-overlay',root),scrub=$('.scrubber',root);const W=1030,H=360,L=70,R=22,T=24,B=36,PW=W-L-R,PH=H-T-B;
    [0,25,50,75,100].forEach(v=>{const yy=T+PH-(v/100)*PH;svg.appendChild(svgEl('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#66707c','stroke-width':1,'stroke-dasharray':'2 3'}));const t=svgEl('text',{x:4,y:yy+4,fill:'#9aa0a8','font-size':11});t.textContent=v+'%';svg.appendChild(t);});
    const groupW=PW/data.length,barW=42;
    data.forEach((d,i)=>{const base=L+i*groupW+groupW/2;[['non',d.non,'#43e7cb',-25],['comp',d.comp,'#ffb000',25]].forEach(([k,v,c,off])=>{const bh=(v/100)*PH,y=T+PH-bh;svg.appendChild(svgEl('rect',{x:base+off-barW/2,y,width:barW,height:bh,rx:6,fill:c}));const tx=svgEl('text',{x:base+off,y:y-5,fill:c,'font-size':13,'font-weight':700,'text-anchor':'middle'});tx.textContent=v+'%';svg.appendChild(tx);});const lb=svgEl('text',{x:base,y:H-10,fill:'#d6d8dc','font-size':12,'text-anchor':'middle'});lb.textContent=d.turn;svg.appendChild(lb);});
    let dragging=false;
    function setP(p){p=clamp(p,0,1);const px=p*root.clientWidth;scrub.style.left=px+'px';cover.style.left=px+'px';cover.style.width=(root.clientWidth-px)+'px';cover.style.right='auto';cover.style.background='rgba(5,7,12,.985)';}
    function fromEvent(e){const r=root.getBoundingClientRect();setP((e.clientX-r.left)/r.width)}
    root.addEventListener('pointerdown',e=>{dragging=true;root.setPointerCapture(e.pointerId);fromEvent(e)});root.addEventListener('pointermove',e=>{if(dragging)fromEvent(e)});root.addEventListener('pointerup',()=>dragging=false);root.addEventListener('pointercancel',()=>dragging=false);setP(0);
  }

  function renderN2Paradox(){
    const D=DATA.n2.paradox;
    renderHTML(`<section class="screen">${header(false)}${backButton('n2-perspective')}${nextButton('n2-references')}
      <div class="section-body n2-paradox"><h1 class="n2-big-title anim d1">La paradoja: te<br>perjudica y aun así<br>te gusta más.</h1><p class="paradox-sub anim d1">A pesar de empeorar tu juicio, la gente calificó las respuestas complacientes mejor.<br><strong>Escala 1–7, estudio en vivo.</strong></p><div class="paradox-cards anim d2">${D.map((d,i)=>`<div class="par-card" data-i="${i}"><h3>${d.title}</h3><div class="bubble-pair"><div class="bubble-wrap"><button type="button" class="bubble left"><span class="num">${d.left}</span></button><span class="bubble-lbl">${d.leftLabel}</span></div><div class="bubble-wrap"><button type="button" class="bubble right"><span class="num">${d.right}</span></button><span class="bubble-lbl">${d.rightLabel}</span></div></div><div class="delta">${d.delta}</div></div>`).join('')}</div><div class="par-help anim d3"><span class="mouse-ico">◉</span><span>Tocá los círculos para ver las diferencias en %.</span></div></div>
    </section>`,screen=>{$$('.par-card',screen).forEach(card=>$$('.bubble',card).forEach(b=>b.addEventListener('click',()=>card.classList.add('revealed'))));});
  }

  function renderN2References(){
    const refs=DATA.n2.references,half=Math.ceil(refs.length/2),cols=[refs.slice(0,half),refs.slice(half)];
    renderHTML(`<section class="screen">${header(false)}${backButton('n2-paradox')}<div class="refs-wrap"><h1 class="refs-title anim d1">Referencias bibliográficas</h1><div class="refs-grid anim d2">${cols.map(col=>`<div class="refs-col">${col.map(r=>`<a href="#" data-ref="${r.replace(/"/g,'&quot;')}">${r}</a>`).join('')}</div>`).join('')}</div></div></section>`,screen=>{$$('.refs-col a',screen).forEach(a=>a.addEventListener('click',e=>{e.preventDefault();alert('URL pendiente de cargar para:\n'+a.dataset.ref)}));});
  }

  function render(){
    const r=route();
    const map={
      'home':renderHome,
      'n1-menu1':()=>n1Menu(1),'n1-menu2':()=>n1Menu(2),'n1-chatgpt':renderN1ChatGPT,'n1-openai':renderN1OpenAI,'n1-competitors':renderN1Competitors,'n1-similar':renderN1Similar,'n1-growth':renderN1Growth,'n1-usage':renderN1Usage,
      'n2-intro':renderN2Intro,'n2-agreement':renderN2Agreement,'n2-perspective':renderN2Perspective,'n2-paradox':renderN2Paradox,'n2-references':renderN2References
    };
    (map[r]||renderHome)();
  }
  addEventListener('hashchange',render);
  render();
})();
