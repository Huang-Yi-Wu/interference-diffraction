/* 干涉與繞射 翻頁教材：翻頁引擎、目錄、作答暫存、引導提問、提示階梯、測驗與評量 */
(function(){
  'use strict';
  var root=document.documentElement;
  var KEY='iad2-store';
  var S={};
  try{S=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){S={};}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
  window.BOOK={store:S,save:save};

  var $=function(s,c){return (c||document).querySelector(s);};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};

  /* ---------- toast ---------- */
  var toastEl=$('#toast'),toastT;
  function toast(t){toastEl.textContent=t;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on');},1800);}
  window.BOOK.toast=toast;

  /* ---------- mode ---------- */
  function isStudent(){return root.classList.contains('student');}
  function setMode(m){
    root.classList.toggle('student',m==='student');
    $$('[data-mode]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-mode')===m);});
    S._mode=m;save();
    rebuild();
  }

  /* ---------- pages ---------- */
  var ALL=$$('.page');
  var CH={0:'封面與導覽',1:'第1節　波的疊加與水波干涉',2:'第2節　光的雙狹縫干涉',3:'第3節　光的繞射與生活應用',4:'總學習單・總評量・延伸',5:'教師專區',6:'封底'};
  var list=[],cur=-1,busy=false;
  ALL.forEach(function(p){var e=document.createElement('div');e.className='edge';p.appendChild(e);});
  function visible(p){return !(isStudent()&&p.hasAttribute('data-teacher'));}
  function idx(id){for(var i=0;i<list.length;i++)if(list[i].id===id)return i;return -1;}

  function rebuild(){
    var curId=cur>=0&&list[cur]?list[cur].id:null;
    list=ALL.filter(visible);
    // page numbers & footers
    list.forEach(function(p,i){
      var f=p.querySelector('.pfoot');
      if(f){f.innerHTML='';var a=document.createElement('span');a.textContent=CH[p.getAttribute('data-ch')]||'';var b=document.createElement('span');b.textContent='p. '+(i+1)+' / '+list.length;f.appendChild(a);f.appendChild(b);}
    });
    // select
    var sel=$('#jump');sel.innerHTML='';
    var lastCh=null,grp=null;
    list.forEach(function(p,i){
      var ch=p.getAttribute('data-ch');
      if(ch!==lastCh){grp=document.createElement('optgroup');grp.label=CH[ch];sel.appendChild(grp);lastCh=ch;}
      var o=document.createElement('option');o.value=p.id;o.textContent=(i+1)+'　'+p.getAttribute('data-title');grp.appendChild(o);
    });
    buildToc();buildTocPage();
    var ni=curId?idx(curId):-1;
    if(curId&&ni<0){
      var ai=ALL.indexOf(document.getElementById(curId));
      for(var k=ai;k>=0&&ni<0;k--)ni=idx(ALL[k].id);
      if(ni<0)ni=0;
    }
    if(ni>=0){cur=-1;show(ni,0,true);}
  }

  function buildToc(){
    var box=$('#toclist');box.innerHTML='';
    var lastCh=null,ol=null;
    list.forEach(function(p,i){
      var ch=p.getAttribute('data-ch');
      if(ch!==lastCh){var g=document.createElement('div');g.className='tocgrp';var h=document.createElement('h3');h.textContent=CH[ch];g.appendChild(h);ol=document.createElement('ol');g.appendChild(ol);box.appendChild(g);lastCh=ch;}
      var li=document.createElement('li');var a=document.createElement('a');a.href='#'+p.id;a.setAttribute('data-go',p.id);
      a.innerHTML='<span class="n"></span><span class="t"></span><span class="v"></span>';
      a.querySelector('.n').textContent='p.'+(i+1);a.querySelector('.t').textContent=p.getAttribute('data-title');
      if((S._visited||{})[p.id])a.querySelector('.v').textContent='已讀';
      if(i===cur)a.className='on';
      li.appendChild(a);ol.appendChild(li);
    });
  }
  function buildTocPage(){
    $$('[data-toc-ch]').forEach(function(ol){
      var ch=ol.getAttribute('data-toc-ch');ol.innerHTML='';
      list.forEach(function(p,i){
        if(p.getAttribute('data-ch')!==ch||p.hasAttribute('data-notoc'))return;
        var li=document.createElement('li');var a=document.createElement('a');a.href='#'+p.id;a.setAttribute('data-go',p.id);
        var t=document.createElement('span');t.textContent=p.getAttribute('data-title');var pg=document.createElement('span');pg.className='pg';pg.textContent='p.'+(i+1);
        if((S._visited||{})[p.id])a.classList.add('seen');
        a.appendChild(t);a.appendChild(pg);li.appendChild(a);ol.appendChild(li);
      });
      var card=ol.closest('.chap');if(card){card.hidden=!ol.children.length;
        var pages=list.filter(function(p){return p.getAttribute('data-ch')===ch&&!p.hasAttribute('data-notoc');});
        var read=pages.filter(function(p){return (S._visited||{})[p.id];}).length;
        var pr=card.querySelector('.prog');if(!pr){pr=document.createElement('span');pr.className='prog';card.insertBefore(pr,ol);}
        pr.textContent='已讀 '+read+' ／ '+pages.length+' 頁';}
    });
  }

  function show(i,dir,silent){
    if(i<0||i>=list.length||i===cur||busy)return;
    var prev=cur>=0?list[cur]:null,next=list[i];
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prev&&window.SIMS&&SIMS[prev.id]&&SIMS[prev.id].hide)try{SIMS[prev.id].hide();}catch(e){console.error(e);}
    cur=i;
    applyGate(next);
    next.scrollTop=0;
    if(prev&&dir&&!reduce&&!silent){
      busy=true;
      if(dir>0){
        next.classList.add('cur');prev.classList.remove('cur');prev.classList.add('turn-out');
        setTimeout(function(){prev.classList.remove('turn-out');busy=false;},380);
      }else{
        next.classList.add('turn-in');
        setTimeout(function(){next.classList.remove('turn-in');next.classList.add('cur');prev.classList.remove('cur');busy=false;},380);
      }
    }else{
      ALL.forEach(function(p){p.classList.remove('cur','turn-in','turn-out');});
      next.classList.add('cur');
    }
    if(next.id!=='p-cover'&&next.id!=='p-toc')S._last=next.id;S._visited=S._visited||{};S._visited[next.id]=1;save();
    $('#prev').disabled=i===0;$('#next').disabled=i===list.length-1;
    $('#jump').value=next.id;
    $('#pn').textContent=(i+1)+' / '+list.length;
    $('#where').textContent=(CH[next.getAttribute('data-ch')]||'')+'　›　'+next.getAttribute('data-title');
    $('#prog').style.width=((i+1)/list.length*100)+'%';
    if(location.hash!=='#'+next.id){selfHash=true;location.hash=next.id;}
    $$('#toclist a').forEach(function(a){a.classList.toggle('on',a.getAttribute('data-go')===next.id);});
    if(next.id==='p-worksheet')buildWorksheet();
    if(next.id==='p-cover')updateResume();
    if(next.id==='p-toc')buildTocPage();
    setTimeout(function(){
      if(window.SIMS&&SIMS[next.id]&&SIMS[next.id].show)try{SIMS[next.id].show();}catch(e){console.error(e);}
    },dir&&!reduce&&!silent?60:0);
    if(!silent)next.focus({preventScroll:true});
  }
  function go(id,dir){var i=typeof id==='number'?id:idx(id);if(i<0)return;if(dir===undefined)dir=i>cur?1:-1;show(i,dir);}
  window.BOOK.go=go;

  var selfHash=false;
  window.addEventListener('hashchange',function(){if(selfHash){selfHash=false;return;}var id=location.hash.slice(1);if(idx(id)>=0)go(id);});

  $('#prev').onclick=function(){go(cur-1,-1);};
  $('#next').onclick=function(){go(cur+1,1);};
  $('#jump').onchange=function(){go(this.value);};
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-go]');if(!a)return;
    e.preventDefault();closeToc();go(a.getAttribute('data-go'));
  });
  document.addEventListener('keydown',function(e){
    var t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
    if(e.altKey||e.ctrlKey||e.metaKey)return;
    if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(cur+1,1);}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(cur-1,-1);}
    else if(e.key==='Escape')closeToc();
  });
  // swipe
  var sx=null,sy=0,st=0;
  $('#book').addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse')return;
    if(e.target.closest('input,textarea,select,canvas,svg,button,a,.strip,.tw'))return;
    sx=e.clientX;sy=e.clientY;st=Date.now();
  });
  $('#book').addEventListener('pointerup',function(e){
    if(sx===null)return;var dx=e.clientX-sx,dy=e.clientY-sy;sx=null;
    if(Math.abs(dx)>70&&Math.abs(dy)<60&&Date.now()-st<700){go(dx<0?cur+1:cur-1,dx<0?1:-1);}
  });

  /* ---------- TOC drawer ---------- */
  var drawer=$('#drawer');
  function openToc(){drawer.hidden=false;var on=$('#toclist a.on');if(on)on.scrollIntoView({block:'center'});$('#tocClose').focus();}
  function closeToc(){if(!drawer.hidden){drawer.hidden=true;}}
  $('#tocBtn').onclick=openToc;$('#tocClose').onclick=closeToc;$('#scrim').onclick=closeToc;
  $('#brand').onclick=function(){go('p-toc');};
  $$('[data-mode]').forEach(function(b){b.onclick=function(){setMode(b.getAttribute('data-mode'));};});

  /* ---------- resume ---------- */
  function updateResume(){
    var r=$('#resume');if(!r)return;
    var id=S._last;var i=id?idx(id):-1;
    if(i>1){r.hidden=false;r.textContent='繼續上次進度（p.'+(i+1)+'）';r.setAttribute('data-go',id);}else r.hidden=true;
  }

  /* ---------- answer fields ---------- */
  function fieldsFor(q){return $$('[data-q="'+q+'"]');}
  function syncField(q,src){
    fieldsFor(q).forEach(function(el){
      if(el===src)return;
      if(el.type==='radio'){el.checked=(S[q]===el.value);}else if(el.tagName==='TEXTAREA'||el.type==='text'){if(el.value!==(S[q]||''))el.value=S[q]||'';}
    });
    document.dispatchEvent(new CustomEvent('answer',{detail:{q:q}}));
  }
  window.BOOK.setAnswer=function(q,v){S[q]=v;S._t=new Date().toISOString();save();syncField(q,null);};
  function bindFields(scope){
    $$('[data-q]',scope).forEach(function(el){
      if(el._bound)return;el._bound=true;
      var q=el.getAttribute('data-q');
      if(el.type==='radio'){el.checked=(S[q]===el.value);}
      else if(el.tagName==='TEXTAREA'||el.type==='text'){el.value=S[q]||'';}
      else return;
      el.addEventListener(el.type==='radio'?'change':'input',function(){
        S[q]=el.value;S._t=new Date().toISOString();save();syncField(q,el);
        var page=el.closest('.page');var sv=page&&page.querySelector('.saved');
      });
    });
  }
  bindFields(document);

  /* ---------- gate (predict before observe) ---------- */
  function applyGate(p){
    var req=p.getAttribute('data-requires');if(!req)return;
    var ok=!isStudent()||req.split(',').every(function(q){return S[q]&&String(S[q]).trim();});
    var lock=p.querySelector('[data-lock]'),body=p.querySelector('[data-gated]');
    if(lock)lock.hidden=ok;if(body)body.hidden=!ok;
  }
  document.addEventListener('answer',function(){if(cur>=0)applyGate(list[cur]);updateGateBtns();updateShows();updateAsk();});
  /* show previous answers (CER revision etc.) */
  function updateShows(){
    $$('[data-show]').forEach(function(el){
      if(!el._def)el._def=el.textContent;
      var v=S[el.getAttribute('data-show')];el.textContent=v&&String(v).trim()?('你當時寫的：'+v):el._def;
    });
  }
  updateShows();
  /* Q4 follow-up button: enabled only when all six choices and the draft are filled (08) */
  var Q4=['q4bph','q4bin','q4bit','q4dph','q4din','q4dit','l2q4'];
  function updateAsk(){
    var b=$('#askBtn'),m=$('#askMsg');if(!b)return;
    var ok=Q4.every(function(q){return S[q]&&String(S[q]).trim();});
    var used=b.getAttribute('data-used');
    if(!used||!ok){b.disabled=!ok;}
    m.textContent=ok?(used?'一次一個問題。想好後在下方寫修訂；需要時再按一次。':'初稿已儲存。可以請求追問，也可以略過直接修訂。'):'請先完成六個選項與初稿；追問不是必要步驟，可以略過。';
  }
  document.addEventListener('click',function(e){if(e.target&&e.target.id==='askBtn'){e.target.setAttribute('data-used','1');setTimeout(updateAsk,0);}});
  updateAsk();
  function updateGateBtns(){
    $$('[data-gatebtn]').forEach(function(b){
      var req=b.getAttribute('data-gatebtn').split(',');
      b.disabled=!req.every(function(q){return S[q]&&String(S[q]).trim();});
    });
  }
  updateGateBtns();

  /* ---------- guided questions ---------- */
  $$('.guide').forEach(function(g){
    var id=g.getAttribute('data-guide'),fb=g.querySelector('.gfb');
    var btns=$$('.gopts button',g);
    function pick(b,silent){
      btns.forEach(function(x){x.classList.remove('sel','good','bad');x.setAttribute('aria-pressed','false');});
      var good=b.hasAttribute('data-ok');
      b.classList.add('sel',good?'good':'bad');b.setAttribute('aria-pressed','true');
      fb.className='gfb '+(good?'good':'bad');fb.innerHTML='';
      var h=document.createElement('b');h.textContent=good?'想法正確':'這是常見的想法，再想想';fb.appendChild(h);
      var t=document.createElement('span');t.textContent=b.getAttribute('data-fb');fb.appendChild(t);
      if(!silent){S['_g_'+id]=b.textContent.trim();save();}
    }
    btns.forEach(function(b){b.type='button';b.setAttribute('aria-pressed','false');b.onclick=function(){pick(b);};
      if(S['_g_'+id]&&S['_g_'+id]===b.textContent.trim())pick(b,true);});
  });

  /* ---------- hint ladders ---------- */
  $$('.hints[data-hints]').forEach(function(box){
    var hs=JSON.parse(box.getAttribute('data-hints')),src=box.getAttribute('data-src'),shown=0;
    var listEl=document.createElement('div');listEl.className='hints';
    var trig=box.getAttribute('data-trigger');var b=trig?document.getElementById(trig):null;
    if(!b){b=document.createElement('button');b.type='button';b.className='btn ghost sm';b.textContent='卡住了？給我一層提示';var r=document.createElement('div');r.className='row';r.appendChild(b);box.appendChild(r);}
    box.appendChild(listEl);
    b.addEventListener('click',function(){
      if(b.disabled)return;
      if(shown<hs.length){
        var h=hs[shown++];var d=document.createElement('div');d.className='hint';
        d.innerHTML='<span class="lv"></span><span></span><small></small>';
        d.children[0].textContent=h[0];d.children[1].textContent=h[1];d.children[2].textContent=h[2];
        listEl.appendChild(d);
        S._hints=S._hints||[];S._hints.push({來源:src,層次:h[0],時間:new Date().toISOString()});save();
        if(shown===hs.length){var e=document.createElement('p');e.className='msg';e.textContent='提示已用完。若仍卡在同一處，請舉手請老師協助（轉教師）。';listEl.appendChild(e);b.disabled=true;}
      }
    });
  });

  /* ---------- quizzes ---------- */
  function scoreItem(qi){
    var type=qi.getAttribute('data-type')||'single',ans=qi.getAttribute('data-ans').split(','),pts=+qi.getAttribute('data-pts')||1;
    var chosen=$$('input:checked',qi).map(function(i){return i.value;});
    if(!chosen.length)return null;
    var s;
    if(type==='single')s=chosen[0]===ans[0]?pts:0;
    else{var c=0,w=0;chosen.forEach(function(v){if(ans.indexOf(v)>=0)c++;else w++;});s=Math.max(0,(c-w)/ans.length)*pts;s=Math.round(s*2)/2;}
    return {s:s,pts:pts,chosen:chosen,ans:ans};
  }
  $$('.quiz').forEach(function(qz){
    var id=qz.getAttribute('data-quiz');
    var items=$$('.qi',qz);
    items.forEach(function(qi,n){
      var type=qi.getAttribute('data-type')||'single';
      $$('.q-opt input',qi).forEach(function(inp){inp.type=type==='single'?'radio':'checkbox';inp.name=id+'-'+n;});
      var pts=qi.getAttribute('data-pts');var st=qi.querySelector('.stem');
      if(st&&!st.querySelector('.pts')){var sp=document.createElement('span');sp.className='pts';sp.textContent=(type==='multi'?'複選・':'')+pts+' 分';st.appendChild(sp);}
      var saved=(S['_quiz_'+id]||{})[n];if(saved)$$('.q-opt input',qi).forEach(function(i){i.checked=saved.indexOf(i.value)>=0;});
      qi.addEventListener('change',function(){var o=S['_quiz_'+id]||{};o[n]=$$('input:checked',qi).map(function(i){return i.value;});S['_quiz_'+id]=o;save();qi.classList.remove('done');var f=qi.querySelector('.qfb');if(f)f.innerHTML='';});
    });
    var chk=qz.querySelector('[data-check]'),rst=qz.querySelector('[data-reset]'),out=qz.querySelector('[data-score]');
    chk.onclick=function(){
      var tot=0,max=0,missing=0,rows={};
      items.forEach(function(qi){
        var r=scoreItem(qi),f=qi.querySelector('.qfb');max+=+qi.getAttribute('data-pts');
        var row=qi.getAttribute('data-row');if(row){rows[row]=rows[row]||{s:0,m:0};rows[row].m+=+qi.getAttribute('data-pts');}
        if(!r){missing++;f.innerHTML='<b class="no">尚未作答</b>';qi.classList.remove('done');return;}
        tot+=r.s;if(row)rows[row].s+=r.s;
        qi.classList.add('done');
        $$('.q-opt',qi).forEach(function(o){var v=o.querySelector('input').value;o.classList.toggle('right',r.ans.indexOf(v)>=0);o.classList.toggle('wrong',r.chosen.indexOf(v)>=0&&r.ans.indexOf(v)<0);});
        var full=r.s===r.pts;
        f.innerHTML='';var b=document.createElement('b');b.className=full?'ok':'no';b.textContent=(full?'正確':(r.s>0?'部分正確':'再想想'))+'（'+r.s+'／'+r.pts+' 分）';f.appendChild(b);
        var ex=document.createElement('span');ex.textContent='　'+(qi.getAttribute('data-exp')||'');f.appendChild(ex);
        var rv=qi.getAttribute('data-review');
        if(rv&&!full&&idx(rv)>=0){var a=document.createElement('a');a.href='#'+rv;a.setAttribute('data-go',rv);a.textContent='　回到 p.'+(idx(rv)+1)+' 複習';f.appendChild(a);}
      });
      out.innerHTML='';
      var sc=document.createElement('p');sc.className='score';sc.textContent='得分 '+tot+' ／ '+max+(missing?'（尚有 '+missing+' 題未作答）':'');out.appendChild(sc);
      var keys=Object.keys(rows);
      if(keys.length){
        var bars=document.createElement('div');bars.className='bars';
        keys.forEach(function(k){var r=rows[k];var d=document.createElement('div');d.className='br';
          d.innerHTML='<span></span><span class="tr"><i></i></span><span class="mono"></span>';
          d.children[0].textContent=k;d.querySelector('i').style.width=(r.s/r.m*100)+'%';d.children[2].textContent=r.s+'／'+r.m;bars.appendChild(d);});
        out.appendChild(bars);
      }
      S['_score_'+id]={得分:tot,滿分:max,時間:new Date().toISOString()};save();
      out.scrollIntoView({behavior:'smooth',block:'nearest'});
    };
    if(rst)rst.onclick=function(){items.forEach(function(qi){$$('input',qi).forEach(function(i){i.checked=false;});qi.classList.remove('done');qi.querySelector('.qfb').innerHTML='';$$('.q-opt',qi).forEach(function(o){o.classList.remove('right','wrong');});});out.innerHTML='';delete S['_quiz_'+id];delete S['_score_'+id];save();};
  });

  /* ---------- classification activity ---------- */
  $$('.cls .it').forEach(function(it){
    var ans=it.getAttribute('data-ans'),fb=it.querySelector('.cfb'),id=it.getAttribute('data-id');
    function pick(b,silent){
      $$('button',it).forEach(function(x){x.classList.add('ghost');x.setAttribute('aria-pressed','false');});
      b.classList.remove('ghost');b.setAttribute('aria-pressed','true');
      var ok=b.getAttribute('data-v')===ans;it.classList.toggle('good',ok);it.classList.toggle('bad',!ok);
      fb.textContent=(ok?'✓ 正確。':'✗ 再想想。')+(ok?it.getAttribute('data-fb'):it.getAttribute('data-hint'));
      if(!silent){S['_cls_'+id]=b.getAttribute('data-v');save();}
    }
    $$('button',it).forEach(function(b){b.type='button';b.classList.add('ghost');b.onclick=function(){pick(b);};if(S['_cls_'+id]===b.getAttribute('data-v'))pick(b,true);});
  });

  /* ---------- worksheet summary ---------- */
  function wsQuestions(){
    var seen={},out=[];
    $$('[data-q][data-prompt]').forEach(function(el){
      var q=el.getAttribute('data-q');if(seen[q])return;seen[q]=1;
      var page=el.closest('.page');
      out.push({q:q,prompt:el.getAttribute('data-prompt'),lesson:el.getAttribute('data-lesson')||page.getAttribute('data-ch'),kind:el.type==='radio'?'radio':(el.getAttribute('data-kind')||'text'),page:page.id,title:page.getAttribute('data-title')});
    });
    return out;
  }
  function buildWorksheet(){
    var box=$('#wsbox');if(!box)return;box.innerHTML='';
    var qs=wsQuestions(),done=0,names={1:'第1節　波的疊加與水波干涉',2:'第2節　光的雙狹縫干涉',3:'第3節　光的繞射與生活應用'};
    [1,2,3].forEach(function(L){
      var grp=document.createElement('div');grp.className='wsgrp';var h=document.createElement('h3');h.textContent=names[L];grp.appendChild(h);
      qs.filter(function(x){return String(x.lesson)===String(L);}).forEach(function(x){
        var v=S[x.q];var has=v&&String(v).trim();if(has)done++;
        var it=document.createElement('div');it.className='wsitem';
        var wh=document.createElement('div');wh.className='wh';
        var t=document.createElement('span');t.textContent=x.prompt;
        var meta=document.createElement('span');meta.className='row';
        var st=document.createElement('span');st.className='st '+(has?'y':'n');st.textContent=has?'已作答':'未作答';
        var a=document.createElement('a');a.href='#'+x.page;a.setAttribute('data-go',x.page);a.className='msg';var pi=idx(x.page);a.textContent='p.'+(pi+1)+' '+x.title;
        meta.appendChild(st);meta.appendChild(a);wh.appendChild(t);wh.appendChild(meta);it.appendChild(wh);
        if(x.kind==='text'){var ta=document.createElement('textarea');ta.setAttribute('data-q',x.q);ta.setAttribute('aria-label',x.prompt);ta.style.minHeight='3.2rem';it.appendChild(ta);}
        else{var ro=document.createElement('div');ro.className='ans-ro';ro.textContent=x.kind==='strip'?(has?stripText(v):'（請到該頁作答）'):(has?v:'（請到該頁選擇）');it.appendChild(ro);}
        grp.appendChild(it);
      });
      box.appendChild(grp);
    });
    $$('textarea',box).forEach(function(t){t._bound=false;});bindFields(box);
    $('#wsCount').textContent='已完成 '+done+' ／ '+qs.length+' 題';
  }
  function stripText(v){return v.split('').map(function(c){return c==='2'?'█':c==='1'?'▒':c==='0'?'·':' ';}).join('')+'（█亮　▒較暗　·暗）';}
  document.addEventListener('answer',function(){if(list[cur]&&list[cur].id==='p-worksheet'){var c=wsQuestions().filter(function(x){return S[x.q]&&String(S[x.q]).trim();}).length;$('#wsCount').textContent='已完成 '+c+' ／ '+wsQuestions().length+' 題';}});

  function record(){
    var o={教材:'干涉與繞射 翻頁互動教材',版本:'v1.0',學生代碼:S.code||'',匯出時間:new Date().toISOString(),作答:{},引導提問:{},測驗成績:{},提示歷程:S._hints||[],模型操作:S._ops||[]};
    wsQuestions().forEach(function(x){o.作答[x.prompt]=S[x.q]||'';});
    Object.keys(S).forEach(function(k){if(k.indexOf('_g_')===0)o.引導提問[k.slice(3)]=S[k];if(k.indexOf('_score_')===0)o.測驗成績[k.slice(7)]=S[k];});
    return JSON.stringify(o,null,2);
  }
  var out=$('#recOut');
  function csvCell(v){v=v==null?'':String(v);return '"'+v.replace(/"/g,'""')+'"';}
  function recordCsv(){
    var o=JSON.parse(record()),rows=[['類別','項目','內容']];
    rows.push(['基本資料','教材',o.教材],['基本資料','版本',o.版本],['基本資料','學生代碼',o.學生代碼],['基本資料','匯出時間',o.匯出時間]);
    Object.keys(o.作答).forEach(function(k){rows.push(['學習單',k,o.作答[k]]);});
    Object.keys(o.引導提問).forEach(function(k){rows.push(['引導提問',k,o.引導提問[k]]);});
    Object.keys(o.測驗成績).forEach(function(k){var s=o.測驗成績[k];rows.push(['測驗成績',k,s.得分+'／'+s.滿分+'（'+s.時間+'）']);});
    o.提示歷程.forEach(function(h){rows.push(['提示歷程',h.來源+' '+h.層次,h.時間]);});
    o.模型操作.forEach(function(h){rows.push(['模型操作',h.操作+' '+(h.內容||''),h.時間]);});
    return '﻿'+rows.map(function(r){return r.map(csvCell).join(',');}).join('\r\n');
  }
  function fileName(ext){var c=(S.code||'學生').replace(/[\\\/:*?"<>|\s]/g,'');var d=new Date();return '干涉與繞射_作答紀錄_'+c+'_'+d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)+'.'+ext;}
  function download(name,text,mime){
    try{var blob=new Blob([text],{type:mime});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();
      setTimeout(function(){URL.revokeObjectURL(url);a.remove();},1500);toast('已下載 '+name);}
    catch(e){out.value=text;out.hidden=false;out.select();toast('無法下載，請手動複製下方文字');}
  }
  window.BOOK.recordCsv=recordCsv;window.BOOK.record=function(){return record();};
  if($('#dlJson')){$('#dlJson').onclick=function(){download(fileName('json'),record(),'application/json');};$('#dlCsv').onclick=function(){download(fileName('csv'),recordCsv(),'text/csv;charset=utf-8');};}
  if($('#copyRec')){
    $('#copyRec').onclick=function(){var t=record();out.value=t;
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast('作答紀錄已複製');},function(){out.hidden=false;out.select();toast('請手動複製已選取的文字');});
      else{out.hidden=false;out.select();toast('請手動複製已選取的文字');}};
    $('#showRec').onclick=function(){out.value=record();out.hidden=!out.hidden;};
    $('#clearRec').onclick=function(){$('#clearAsk').hidden=false;};
    $('#clearNo').onclick=function(){$('#clearAsk').hidden=true;};
    $('#clearYes').onclick=function(){
      var keep={_mode:S._mode};Object.keys(S).forEach(function(k){delete S[k];});S._mode=keep._mode;save();
      $$('[data-q]').forEach(function(el){if(el.type==='radio')el.checked=false;else if(el.value!==undefined)el.value='';});
      $$('.quiz [data-reset]').forEach(function(b){b.click();});
      $$('.guide .gopts button').forEach(function(b){b.classList.remove('sel','good','bad');});$$('.guide .gfb').forEach(function(f){f.innerHTML='';f.className='gfb';});
      $$('.cls .it').forEach(function(it){it.classList.remove('good','bad');it.querySelector('.cfb').textContent='';$$('button',it).forEach(function(b){b.classList.add('ghost');});});
      document.dispatchEvent(new CustomEvent('answer',{detail:{q:'*'}}));
      $('#clearAsk').hidden=true;out.value='';buildWorksheet();toast('本機作答已清除');
    };
  }
  var code=$('#stuCode');if(code){code.value=S.code||'';code.oninput=function(){S.code=code.value;save();};}

  /* ---------- photo lightbox (08: 實拍可放大、關閉) ---------- */
  var lb=$('#lightbox'),lbImg=$('#lbImg'),lbCap=$('#lbCap'),lbFrom=null;
  function closeLb(){if(lb.hidden)return;lb.hidden=true;lbImg.removeAttribute('src');if(lbFrom)lbFrom.focus({preventScroll:true});}
  document.addEventListener('click',function(e){
    var im=e.target.closest&&e.target.closest('img.photo');
    if(im){e.preventDefault();lbFrom=im;lbImg.src=im.currentSrc||im.src;lbImg.alt=im.alt;
      var fig=im.closest('figure'),cap=fig&&fig.querySelector('figcaption');lbCap.textContent=cap?cap.textContent:im.alt;
      lb.hidden=false;$('#lbClose').focus();op2('放大照片',im.getAttribute('src'));return;}
    if(e.target===lb||e.target===lbImg||e.target.id==='lbClose')closeLb();
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLb();},true);
  $$('img.photo').forEach(function(im){im.tabIndex=0;im.setAttribute('role','button');im.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();im.click();}});});
  function op2(n,d){S._ops=S._ops||[];S._ops.push({操作:n,內容:d,時間:new Date().toISOString()});if(S._ops.length>80)S._ops.shift();save();}

  /* ---------- tabs ---------- */
  $$('[data-tabs]').forEach(function(t){
    var bs=$$('[data-tab]',t);
    bs.forEach(function(b){b.onclick=function(){bs.forEach(function(x){var on=x===b;x.setAttribute('aria-pressed',on);x.classList.toggle('ghost',!on);});
      $$('[data-panel]',t.parentNode).forEach(function(p){p.hidden=p.getAttribute('data-panel')!==b.getAttribute('data-tab');});};});
  });

  /* ---------- start ---------- */
  root.classList.toggle('student',(S._mode||'student')==='student');
  $$('[data-mode]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-mode')===(S._mode||'student'));});
  list=ALL.filter(visible);
  rebuild();
  var start=location.hash.slice(1);
  show(idx(start)>=0?idx(start):0,0,true);
  updateResume();
  window.BOOK.idx=idx;window.BOOK.cur=function(){return list[cur]&&list[cur].id;};window.BOOK.list=function(){return list.map(function(p){return p.id;});};
})();
