/* 干涉與繞射 翻頁教材：動畫與互動模擬（全部依波動模型即時計算、繪製） */
(function(){
  'use strict';
  var SIMS=window.SIMS={};
  var root=document.documentElement;
  function css(n){return getComputedStyle(root).getPropertyValue(n).trim();}
  function $(id){return document.getElementById(id);}
  function fontB(){return css('--f-body');}
  function fit(c){
    var dpr=Math.min(window.devicePixelRatio||1,2);
    var w=c.getBoundingClientRect().width||c.parentNode.getBoundingClientRect().width||600;
    var asp=parseFloat(c.getAttribute('data-aspect'))||0.5;
    var h=Math.round(w*asp);
    if(w<480)h=Math.round(w*Math.min(asp*1.45,0.95));
    c.style.height=h+'px';
    if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
    var ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx:ctx,w:w,h:h,fs:Math.max(11,Math.min(15,w/52))};
  }
  function sgn(v){if(Math.abs(v)<0.05)v=0;return (v>=0?'+':'')+v.toFixed(1);}
  function sinc(x){return Math.abs(x)<1e-9?1:Math.sin(x)/x;}
  function wl2rgb(w){var r,g,b;
    if(w<440){r=-(w-440)/60;g=0;b=1;}else if(w<490){r=0;g=(w-440)/50;b=1;}else if(w<510){r=0;g=1;b=-(w-510)/20;}
    else if(w<580){r=(w-510)/70;g=1;b=0;}else if(w<645){r=1;g=-(w-645)/65;b=0;}else{r=1;g=0;b=0;}
    var f=w<420?0.3+0.7*(w-380)/40:(w>700?0.3+0.7*(780-w)/80:1);return [r*f,g*f,b*f];}
  function rgbStr(a,k){k=k===undefined?1:k;return 'rgb('+Math.round(Math.min(1,a[0]*k)*255)+','+Math.round(Math.min(1,a[1]*k)*255)+','+Math.round(Math.min(1,a[2]*k)*255)+')';}
  function hexRgb(c){c=c.replace('#','');if(c.length===3)c=c.split('').map(function(z){return z+z;}).join('');var n=parseInt(c,16);return [(n>>16)&255,(n>>8)&255,n&255];}
  function loop(fn){var id=null,last=0;return{start:function(){if(id)return;last=0;var f=function(ts){var dt=last?Math.min(0.05,(ts-last)/1000):0;last=ts;if(fn(dt)!==false)id=requestAnimationFrame(f);else id=null;};id=requestAnimationFrame(f);},stop:function(){if(id)cancelAnimationFrame(id);id=null;},on:function(){return !!id;}};}
  function op(name,detail){var S=window.BOOK&&BOOK.store;if(!S)return;S._ops=S._ops||[];S._ops.push({操作:name,內容:detail,時間:new Date().toISOString()});if(S._ops.length>80)S._ops.shift();BOOK.save();}
  function pulse(x,c,h,wid){var d=Math.abs(x-c);if(d>wid/2)return 0;return h*0.5*(1+Math.cos(Math.PI*d/(wid/2)));}
  function arrow(ctx,x1,y1,x2,y2,col){ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();var a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-8*Math.cos(a-0.45),y2-8*Math.sin(a-0.45));ctx.lineTo(x2-8*Math.cos(a+0.45),y2-8*Math.sin(a+0.45));ctx.closePath();ctx.fill();}

  /* two-panel string plot shared by animation and simulation */
  function drawString(g,o){
    var ctx=g.ctx,w=g.w,h=g.h,fs=g.fs,ink=css('--ink'),mut=css('--muted'),line=css('--line'),wave=css('--wave'),las=css('--laser');
    ctx.clearRect(0,0,w,h);ctx.font=fs+'px '+fontB();
    var padL=Math.max(34,w*0.06),padR=10,pw=w-padL-padR,gap=fs*1.6,ph=(h-gap*2-fs*1.2)/2;
    var tops=[gap,gap*2+ph];
    function X(x){return padL+x*pw;}
    tops.forEach(function(top,i){
      function Y(v){return top+ph/2-v/3*(ph/2);}
      ctx.strokeStyle=line;ctx.lineWidth=1;ctx.strokeRect(padL,top,pw,ph);
      ctx.strokeStyle=mut;ctx.beginPath();ctx.moveTo(padL,Y(0));ctx.lineTo(padL+pw,Y(0));ctx.stroke();
      ctx.fillStyle=mut;ctx.textAlign='right';[3,0,-3].forEach(function(v){ctx.fillText((v>0?'+':'')+v,padL-5,Y(v)+fs*0.35);});
      ctx.textAlign='left';ctx.fillText(i?'② 合成繩形（繩子實際形狀）':'① 分波模型　A 細實線／B 虛線',padL+6,top-fs*0.4);
      ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(X(0.5),top);ctx.lineTo(X(0.5),top+ph);ctx.stroke();ctx.setLineDash([]);
      ctx.fillText('P',X(0.5)+5,top+ph-6);
      function curve(fn,col,lw,dash){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.setLineDash(dash||[]);ctx.beginPath();for(var k=0;k<=360;k++){var x=k/360,y=fn(x);k?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}ctx.stroke();ctx.setLineDash([]);}
      if(i===0){
        curve(function(x){return pulse(x,o.xa,o.ha,o.wid);},ink,2);
        curve(function(x){return pulse(x,o.xb,o.hb,o.wid);},wave,2.6,[8,6]);
        ctx.font='bold '+fs+'px '+fontB();ctx.textAlign='center';
        if(o.xa>-0.1&&o.xa<1.1){ctx.fillStyle=ink;ctx.fillText('A',X(o.xa),Y(o.ha>=0?o.ha:0)-8);}
        if(o.xb>-0.1&&o.xb<1.1){ctx.fillStyle=wave;ctx.fillText('B',X(o.xb),o.hb>=0?Y(o.hb)-8:Y(0)-8);}
        if(o.arrows){var ay=top+fs*1.2;arrow(ctx,X(o.xa)-18,ay,X(o.xa)+18,ay,ink);arrow(ctx,X(o.xb)+18,ay,X(o.xb)-18,ay,wave);}
        ctx.font=fs+'px '+fontB();ctx.textAlign='left';
      }else curve(function(x){return pulse(x,o.xa,o.ha,o.wid)+pulse(x,o.xb,o.hb,o.wid);},las,4);
    });
    ctx.fillStyle=mut;ctx.textAlign='center';ctx.fillText('位置（畫面寬度 %）  0 · 25 · 50 · 75 · 100',padL+pw/2,h-3);ctx.textAlign='left';
    return {X:X,tops:tops,ph:ph,padL:padL,pw:pw};
  }

  /* ================= cover ================= */
  (function(){
    var c=$('coverCv'),L=loop(function(dt){t+=dt;draw();}),t=0;
    function draw(){
      var dpr=Math.min(window.devicePixelRatio||1,2),r=c.getBoundingClientRect();if(!r.width)return;
      if(c.width!==Math.round(r.width*dpr)){c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);}
      var ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);var w=r.width,h=r.height;
      ctx.fillStyle='#0c1118';ctx.fillRect(0,0,w,h);
      var bx=w*0.22,sy1=h*0.36,sy2=h*0.44,lam=Math.max(16,w/34);
      ctx.lineWidth=1.2;
      [sy1,sy2].forEach(function(sy){
        for(var n=0;n<40;n++){var rr=((t*30)%lam)+n*lam;if(rr>w*1.1)break;ctx.strokeStyle='rgba(116,170,255,'+Math.max(0,0.32-rr/(w*3.2))+')';ctx.beginPath();ctx.arc(bx,sy,rr,-Math.PI/2,Math.PI/2);ctx.stroke();}
      });
      ctx.fillStyle='#2a3546';ctx.fillRect(bx-4,0,8,sy1-5);ctx.fillRect(bx-4,sy1+5,8,sy2-sy1-10);ctx.fillRect(bx-4,sy2+5,8,h-sy2);
      var sx=w*0.9,mid=(sy1+sy2)/2;
      for(var y=0;y<h;y+=2){var u=(y-mid)/h;var I=Math.pow(Math.cos(u*Math.PI*9),2)*Math.pow(sinc(u*Math.PI*2.2),2);ctx.fillStyle='rgba(255,70,95,'+I.toFixed(3)+')';ctx.fillRect(sx,y,w-sx,2);}
      ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(sx-1,0,1,h);
    }
    SIMS['p-cover']={show:function(){draw();if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)L.start();},hide:function(){L.stop();},redraw:draw};
  })();

  /* ================= 1-1 animation (07B storyboard, 36 s) ================= */
  (function(){
    var c=$('animCv'),t=0,playing=false;
    var CAP=[[0,'「在理想線性介質中，兩個相同脈衝正相向傳播。」'],[6,'「同一位置的位移相加。同向重疊時，這裡的合成位移變大。」'],[14,'「通過之後，兩個脈衝仍各自向原方向傳播。」'],[20,'「改成等大反向時，位移抵銷，完全重疊當下合成位移為零。」'],[28,'「零位移只描述這一瞬間；不代表波或能量永久消失。」']];
    function lerp(a,b,u){u=Math.max(0,Math.min(1,u));return a+(b-a)*u;}
    function state(t){
      var o={wid:0.2,ha:1,hb:1,xa:.2,xb:.8,arrows:false,freeze:false,nums:'',banner:'',summary:false};
      if(t<14){
        if(t<1){o.xa=.2;o.xb=.8;o.freeze=true;}
        else if(t<6){o.xa=lerp(.2,.5,(t-1)/5);o.xb=lerp(.8,.5,(t-1)/5);o.arrows=true;}
        else{o.xa=o.xb=.5;o.freeze=true;o.nums=t>=11?'P：+1 ＋ 1 ＝ +2':(t>=9.5?'P：+1 ＋ 1':(t>=8?'P：+1':''));}
      }else if(t<20){o.xa=lerp(.5,.8,(t-14)/6);o.xb=lerp(.5,.2,(t-14)/6);o.arrows=true;}
      else{o.hb=-1;
        if(t<21.5){o.xa=.2;o.xb=.8;o.banner='新案例：等大反向';}
        else if(t<26){o.xa=lerp(.2,.5,(t-21.5)/4.5);o.xb=lerp(.8,.5,(t-21.5)/4.5);o.arrows=true;}
        else if(t<28){o.xa=o.xb=.5;o.freeze=true;o.nums='P：+1 － 1 ＝ 0';}
        else if(t<33){o.xa=lerp(.5,.8,(t-28)/5);o.xb=lerp(.5,.2,(t-28)/5);o.arrows=true;}
        else{o.xa=.8;o.xb=.2;o.summary=true;}
      }
      return o;
    }
    function draw(){
      var g=fit(c),o=state(t),ctx=g.ctx,fs=g.fs;
      var geo=drawString(g,o);
      ctx.font='bold '+(fs+1)+'px '+fontB();
      if(o.nums){ctx.fillStyle=css('--laser');ctx.textAlign='center';ctx.fillText(o.nums,geo.X(0.5),geo.tops[1]+fs*1.3);}
      if(o.freeze&&t>=6){ctx.fillStyle=css('--muted');ctx.textAlign='right';ctx.font=fs+'px '+fontB();ctx.fillText('〔教學定格〕',geo.padL+geo.pw-6,geo.tops[0]+fs*1.2);}
      if(o.banner){ctx.fillStyle=css('--warn');ctx.textAlign='center';ctx.fillText(o.banner,geo.X(0.5),geo.tops[0]+fs*1.4);}
      if(o.summary){ctx.fillStyle=css('--ink');ctx.textAlign='center';ctx.font='bold '+(fs+2)+'px '+fontB();ctx.fillText('重疊暫時，通過後各自傳播',geo.X(0.5),geo.tops[1]+fs*1.4);}
      ctx.textAlign='left';
      var cap=CAP[0][1];CAP.forEach(function(k){if(t>=k[0])cap=k[1];});
      $('animCap').textContent=cap;$('animScrub').value=t;$('animTime').textContent=t.toFixed(1)+' / 36 秒';
    }
    var L=loop(function(dt){t+=dt;if(t>=36){t=36;playing=false;draw();return false;}draw();});
    $('animPlay').onclick=function(){if(t>=36)t=0;playing=true;L.start();op('動畫','播放');};
    $('animPause').onclick=function(){playing=false;L.stop();};
    $('animReplay').onclick=function(){t=0;playing=true;L.start();};
    $('animScrub').oninput=function(){t=+this.value;draw();};
    Array.prototype.forEach.call(document.querySelectorAll('[data-shot]'),function(b){b.onclick=function(){t=+b.getAttribute('data-shot');draw();if(!L.on()){playing=true;L.start();}};});
    SIMS['p-l1-anim']={show:draw,hide:function(){L.stop();},redraw:draw};
  })();

  /* ================= 1-3 superposition sim (07B spec) ================= */
  (function(){
    var c=$('supCv'),st={hA:1,hB:1,t:0};var SPEED=0.05;
    function xa(){return 0.25+SPEED*st.t;}function xb(){return 0.75-SPEED*st.t;}
    function draw(){
      var g=fit(c);drawString(g,{xa:xa(),xb:xb(),ha:st.hA,hb:st.hB,wid:0.2,arrows:false});
      var a=pulse(0.5,xa(),st.hA,0.2),b=pulse(0.5,xb(),st.hB,0.2);
      $('supRead').textContent='P 點：A＝'+sgn(a)+'　B＝'+sgn(b)+'　合成＝'+sgn(a+b)+'（相對單位）　t＝'+st.t.toFixed(1)+' 秒'+(L.on()?'':'　暫停中');
    }
    var L=loop(function(dt){st.t+=dt;if(xa()>1.15){draw();return false;}draw();});
    function reset(){L.stop();st.t=0;draw();}
    var hA=$('hA'),hB=$('hB');
    function sync(){st.hA=+hA.value;st.hB=+hB.value;$('hAv').textContent=sgn(st.hA);$('hBv').textContent=sgn(st.hB);reset();}
    hA.oninput=sync;hB.oninput=sync;hA.onchange=hB.onchange=function(){op('繩波模擬','高度 A='+hA.value+' B='+hB.value);};
    $('caseSame').onclick=function(){hA.value=1;hB.value=1;sync();op('繩波模擬','同向案例');};
    $('caseOpp').onclick=function(){hA.value=1;hB.value=-1;sync();op('繩波模擬','反向案例');};
    $('supPlay').onclick=function(){if(xa()>1.15)st.t=0;L.start();};
    $('supPause').onclick=function(){L.stop();draw();};
    $('supReset').onclick=function(){hA.value=1;hB.value=1;sync();};
    SIMS['p-l1-sim']={show:function(){sync();},hide:function(){L.stop();},redraw:draw};
  })();

  /* ================= 1-5 oscillation: displacement vs amplitude ================= */
  (function(){
    var c=$('oscCv'),st={a1:1,a2:1,phi:0,t:0},W=2*Math.PI/2;
    function amp(){var p=st.phi*Math.PI/180;return Math.sqrt(Math.max(0,st.a1*st.a1+st.a2*st.a2+2*st.a1*st.a2*Math.cos(p)));}
    function y1(t){return st.a1*Math.sin(W*t);}function y2(t){return st.a2*Math.sin(W*t+st.phi*Math.PI/180);}
    function draw(){
      var g=fit(c),ctx=g.ctx,w=g.w,h=g.h,fs=g.fs,ink=css('--ink'),mut=css('--muted'),line=css('--line'),wave=css('--wave'),las=css('--laser');
      ctx.clearRect(0,0,w,h);ctx.font=fs+'px '+fontB();
      var padL=Math.max(34,w*0.06),padR=Math.max(80,w*0.16),pw=w-padL-padR,top=fs*1.6,ph=h-top-fs*2,mid=top+ph/2,sc=ph/2/3.1;
      ctx.strokeStyle=line;ctx.strokeRect(padL,top,pw,ph);ctx.strokeStyle=mut;ctx.beginPath();ctx.moveTo(padL,mid);ctx.lineTo(padL+pw,mid);ctx.stroke();
      ctx.fillStyle=mut;ctx.textAlign='right';[3,0,-3].forEach(function(v){ctx.fillText((v>0?'+':'')+v,padL-5,mid-v*sc+fs*0.35);});ctx.textAlign='left';
      ctx.fillText('同一位置的位移（縱軸）隨時間（橫軸，最近 2 個週期）',padL+4,top-fs*0.45);
      var A=amp();
      ctx.setLineDash([6,5]);ctx.strokeStyle=las;ctx.lineWidth=1.5;[A,-A].forEach(function(v){ctx.beginPath();ctx.moveTo(padL,mid-v*sc);ctx.lineTo(padL+pw,mid-v*sc);ctx.stroke();});ctx.setLineDash([]);
      function curve(fn,col,lw,dash){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.setLineDash(dash||[]);ctx.beginPath();for(var k=0;k<=300;k++){var tt=st.t-4+4*k/300;var y=fn(tt);var X=padL+pw*k/300,Y=mid-y*sc;k?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();ctx.setLineDash([]);}
      curve(y1,ink,1.6);curve(y2,wave,1.8,[7,5]);curve(function(tt){return y1(tt)+y2(tt);},las,3.5);
      var yn=y1(st.t)+y2(st.t);ctx.fillStyle=las;ctx.beginPath();ctx.arc(padL+pw,mid-yn*sc,5,0,7);ctx.fill();
      var lx=padL+pw+10;ctx.font=(fs-1)+'px '+fontB();
      ctx.fillStyle=ink;ctx.fillText('— 振動 1',lx,top+fs);ctx.fillStyle=wave;ctx.fillText('- - 振動 2',lx,top+fs*2.3);ctx.fillStyle=las;ctx.fillText('━ 合成',lx,top+fs*3.6);ctx.fillText('┄ 合振幅',lx,top+fs*4.9);
      ctx.fillStyle=mut;ctx.fillText('● 此刻',lx,top+fs*6.2);
      $('oscRead').textContent='此刻：振動1＝'+sgn(y1(st.t))+'　振動2＝'+sgn(y2(st.t))+'　合成位移＝'+sgn(yn)+'　｜　合振幅＝'+A.toFixed(2)+(A<0.05?'（完全相消）':'');
      $('a1v').textContent=st.a1.toFixed(1);$('a2v').textContent=st.a2.toFixed(1);$('phiv').textContent=st.phi+'°'+(st.phi===0||st.phi===360?'（同相）':(st.phi===180?'（反相）':''));
    }
    var L=loop(function(dt){st.t+=dt;draw();});
    function sync(){st.a1=+$('a1').value;st.a2=+$('a2').value;st.phi=+$('phi').value;draw();}
    ['a1','a2','phi'].forEach(function(id){$(id).oninput=sync;$(id).onchange=function(){op('振動合成','A1='+st.a1+' A2='+st.a2+' φ='+st.phi);};});
    $('phSame').onclick=function(){$('phi').value=0;sync();};$('phOpp').onclick=function(){$('phi').value=180;sync();};
    $('oscPlay').onclick=function(){L.start();};$('oscPause').onclick=function(){L.stop();};
    $('oscZero').onclick=function(){
      L.stop();var p=st.phi*Math.PI/180;var d=Math.atan2(st.a2*Math.sin(p),st.a1+st.a2*Math.cos(p));
      var k=Math.ceil((W*st.t+d)/Math.PI+1e-6);st.t=(k*Math.PI-d)/W;draw();op('振動合成','停在位移為0');
    };
    SIMS['p-l1-amp']={show:function(){sync();},hide:function(){L.stop();},redraw:draw};
  })();

  /* ================= 1-6 ripple tank (two coherent sources) ================= */
  (function(){
    var c=$('ripCv'),GW=170,GH=150,off=document.createElement('canvas');off.width=GW;off.height=GH;var ox=off.getContext('2d'),img=ox.createImageData(GW,GH);
    var st={t:0,lines:false,lam:18,d:36,probe:null,trA:[],trB:[],trP:[]},s1,s2,A,B,OM=2*Math.PI/1.2,geo=null;
    function setup(){
      st.lam=18*(+$('ripL').value);st.d=st.lam*(+$('ripD').value);
      s1={x:GW/2-st.d/2,y:10};s2={x:GW/2+st.d/2,y:10};
      var y=GH*0.78;A={x:GW/2,y:y};
      B=null;var best=1e9;for(var x=GW/2;x<GW-2;x+=0.2){var e=Math.abs(Math.abs(Math.hypot(x-s1.x,y-s1.y)-Math.hypot(x-s2.x,y-s2.y))-st.lam/2);if(e<best){best=e;B={x:x,y:y};}}
      if(best>1)B={x:GW-6,y:y};
      st.trA=[];st.trB=[];st.trP=[];for(var k=0;k<240;k++)step(2.4/240);
      $('ripDv').textContent=(+$('ripD').value).toFixed(1)+' λ';$('ripLv').textContent=(+$('ripL').value).toFixed(1);
    }
    function disp(x,y,t){var k=2*Math.PI/st.lam;return Math.sin(k*Math.hypot(x-s1.x,y-s1.y)-OM*t)+Math.sin(k*Math.hypot(x-s2.x,y-s2.y)-OM*t);}
    function ampAt(p){return Math.abs(2*Math.cos(Math.PI*(Math.hypot(p.x-s1.x,p.y-s1.y)-Math.hypot(p.x-s2.x,p.y-s2.y))/st.lam));}
    function step(dt){st.t+=dt;st.trA.push(disp(A.x,A.y,st.t));st.trB.push(disp(B.x,B.y,st.t));if(st.probe)st.trP.push(disp(st.probe.x,st.probe.y,st.t));
      [st.trA,st.trB,st.trP].forEach(function(a){while(a.length>240)a.shift();});}
    function draw(){
      var g=fit(c),ctx=g.ctx,w=g.w,h=g.h,fs=g.fs;
      var pos=hexRgb(css('--wave')),neg=hexRgb(css('--laser')),bg=hexRgb(css('--sheet'));
      for(var j=0;j<GH;j++)for(var i=0;i<GW;i++){
        var v=disp(i,j,st.t)/2,col=v>0?pos:neg,a=Math.min(1,Math.abs(v)),p=(j*GW+i)*4;
        var r=bg[0]+(col[0]-bg[0])*a,gg=bg[1]+(col[1]-bg[1])*a,b=bg[2]+(col[2]-bg[2])*a;
        if(st.lines){var dr=(Math.hypot(i-s1.x,j-s1.y)-Math.hypot(i-s2.x,j-s2.y))/st.lam,f=Math.abs(dr-Math.round(dr));
          if(f<0.035){r=r*0.3+255*0.7;gg=gg*0.3+215*0.7;b=b*0.3+60*0.7;}else if(Math.abs(f-0.5)<0.035){r=r*0.25;gg=gg*0.25;b=b*0.25;}}
        img.data[p]=r;img.data[p+1]=gg;img.data[p+2]=b;img.data[p+3]=255;}
      ox.putImageData(img,0,0);
      ctx.clearRect(0,0,w,h);
      var narrow=w<520,mw=narrow?w:Math.min(w*0.5,h*GW/GH),mh=mw*GH/GW;
      if(narrow){mh=Math.min(mh,h*0.55);mw=mh*GW/GH;}
      var mx=narrow?(w-mw)/2:0,my=narrow?0:(h-mh)/2;ctx.imageSmoothingEnabled=true;ctx.drawImage(off,mx,my,mw,mh);
      var s=mw/GW;geo={mx:mx,my:my,s:s,mw:mw,mh:mh};
      ctx.font='bold '+fs+'px '+fontB();ctx.lineWidth=2;
      [s1,s2].forEach(function(q,i){ctx.fillStyle=css('--ink');ctx.beginPath();ctx.arc(mx+q.x*s,my+q.y*s,5,0,7);ctx.fill();ctx.fillText('S'+(i+1),mx+q.x*s-8,my+q.y*s+fs+8);});
      [[A,'A'],[B,'B']].concat(st.probe?[[st.probe,'P']]:[]).forEach(function(q){ctx.strokeStyle=q[1]==='P'?css('--warn'):css('--ink');ctx.beginPath();ctx.arc(mx+q[0].x*s,my+q[0].y*s,7,0,7);ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ctx.fillText(q[1],mx+q[0].x*s+9,my+q[0].y*s-8);});
      if(st.lines){ctx.font=(fs-2)+'px '+fontB();ctx.fillStyle=css('--ink');ctx.fillText('黃線：腹線　黑線：節線',mx+6,my+mh-6);}
      var rows=[[st.trA,'A 點位移紀錄',css('--ink')],[st.trB,'B 點位移紀錄',css('--ink')]];if(st.probe)rows.push([st.trP,'P 點位移紀錄',css('--warn')]);
      var tx=narrow?6:mw+16,ty=narrow?mh+8:6,tw=w-tx-6,th=((narrow?h-mh-12:h-12)-(rows.length-1)*8)/rows.length;
      ctx.font=(fs-1)+'px '+fontB();
      rows.forEach(function(r,i){var top=ty+i*(th+8),mid=top+th/2;ctx.strokeStyle=css('--line');ctx.lineWidth=1;ctx.strokeRect(tx,top,tw,th);ctx.strokeStyle=css('--muted');ctx.beginPath();ctx.moveTo(tx,mid);ctx.lineTo(tx+tw,mid);ctx.stroke();
        ctx.fillStyle=css('--muted');ctx.fillText(r[1],tx+6,top+fs);ctx.strokeStyle=r[2];ctx.lineWidth=2.2;ctx.beginPath();
        for(var k=0;k<r[0].length;k++){var X=tx+tw*k/239,Y=mid-r[0][k]/2.2*(th/2-4);k?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();});
      $('ripRead').textContent='一段時間內的振幅（理想、兩波等振幅）：A＝'+ampAt(A).toFixed(2)+'　B＝'+ampAt(B).toFixed(2)+(st.probe?'　P＝'+ampAt(st.probe).toFixed(2):'　（點左圖可放置 P）')+'　最大值為 2.00';
    }
    var L=loop(function(dt){var n=Math.max(1,Math.round(dt/(2.4/240)));for(var i=0;i<n&&i<6;i++)step(2.4/240);draw();});
    $('ripPlay').onclick=function(){L.start();op('水波模擬','播放');};$('ripPause').onclick=function(){L.stop();};
    $('ripLines').onclick=function(){st.lines=!st.lines;this.setAttribute('aria-pressed',st.lines);draw();op('水波模擬','腹線節線 '+(st.lines?'開':'關'));};
    $('ripD').oninput=$('ripL').oninput=function(){st.probe=null;setup();draw();};
    c.addEventListener('click',function(e){if(!geo)return;var r=c.getBoundingClientRect(),x=(e.clientX-r.left-geo.mx)/geo.s,y=(e.clientY-r.top-geo.my)/geo.s;
      if(x<0||y<0||x>GW||y>GH)return;st.probe={x:x,y:y};st.trP=[];var t0=st.t;st.t-=2.4;for(var k=0;k<240;k++){st.t+=2.4/240;st.trP.push(disp(x,y,st.t));}st.t=t0;draw();op('水波模擬','放置探測點');});
    SIMS['p-l1-water']={show:function(){setup();draw();},hide:function(){L.stop();},redraw:draw};
  })();

  /* ================= 2-1 prediction strip ================= */
  function makeStrip(boxId,key,clearId){
    var box=$(boxId);if(!box)return;var N=25,btns=[];
    function val(){var v=(window.BOOK&&BOOK.store[key])||'';while(v.length<N)v+=' ';return v.slice(0,N);}
    function paint(){var v=val();btns.forEach(function(b,i){var ch=v[i];if(ch===' ')b.removeAttribute('data-v');else b.setAttribute('data-v',ch);b.setAttribute('aria-label','第'+(i+1)+'格：'+(ch==='2'?'亮':ch==='1'?'較暗':ch==='0'?'暗':'未畫'));});}
    for(var i=0;i<N;i++){(function(i){var b=document.createElement('button');b.type='button';b.onclick=function(){var v=val().split('');var c=v[i];v[i]=c===' '?'2':c==='2'?'1':c==='1'?'0':'2';var s=v.join('');BOOK.setAnswer(key,s.trim()?s:'');paint();};box.appendChild(b);btns.push(b);})(i);}
    $(clearId).onclick=function(){BOOK.setAnswer(key,'');paint();};
    document.addEventListener('answer',function(e){if(e.detail&&(e.detail.q===key||e.detail.q==='*'))paint();});
    paint();
  }
  makeStrip('stripPred','l2q1d','stripClear');
  makeStrip('stripObs','l2q2d','stripObsClear');

  /* ================= 2-3 Huygens ================= */
  (function(){
    var c=$('huyCv'),t=0,cross=false;
    function draw(){
      var g=fit(c),ctx=g.ctx,w=g.w,h=g.h,fs=g.fs,ink=css('--ink'),mut=css('--muted'),wave=css('--wave'),las=css('--laser');
      ctx.clearRect(0,0,w,h);ctx.font=fs+'px '+fontB();
      var bx=w*0.32,lam=Math.max(18,w/24),v=lam*0.9,sep=Math.max(lam*1.6,h*0.16),y1=h/2-sep/2,y2=h/2+sep/2;
      ctx.strokeStyle=wave;ctx.lineWidth=2;
      var s=((v*t)%lam);
      for(var x=s;x<bx;x+=lam){ctx.globalAlpha=0.85;ctx.beginPath();ctx.moveTo(x,fs*1.6);ctx.lineTo(x,h-fs*1.4);ctx.stroke();}
      ctx.globalAlpha=1;
      var r0=(((v*t-bx)%lam)+lam)%lam,maxR=w-bx;
      [y1,y2].forEach(function(sy){for(var r=r0;r<maxR;r+=lam){if(r<2)continue;ctx.globalAlpha=Math.max(0.15,1-r/maxR*0.8);ctx.beginPath();ctx.arc(bx,sy,r,-Math.PI/2,Math.PI/2);ctx.stroke();}});
      ctx.globalAlpha=1;
      if(cross){ctx.fillStyle=las;
        for(var a=r0;a<maxR;a+=lam)for(var b=r0;b<maxR;b+=lam){if(a<2||b<2)continue;
          var d=sep,xx=(a*a-b*b+d*d)/(2*d);var hh=a*a-xx*xx;if(hh<0)continue;var py=y1+xx,px=bx+Math.sqrt(hh);
          if(px<w-2&&py>0&&py<h){ctx.beginPath();ctx.arc(px,py,3,0,7);ctx.fill();}}}
      ctx.fillStyle=ink;ctx.fillRect(bx-4,0,8,y1-5);ctx.fillRect(bx-4,y1+5,8,sep-10);ctx.fillRect(bx-4,y2+5,8,h-y2-5);
      ctx.fillStyle=mut;ctx.fillText('入射平面波（直線為波峰）',6,fs*1.1);ctx.fillText('S₁',bx+8,y1-6);ctx.fillText('S₂',bx+8,y2+fs+4);
      ctx.textAlign='right';ctx.fillText(cross?'紅點：兩組波峰交會（增強）':'兩個次波源各自發出圓弧波前',w-6,fs*1.1);ctx.fillText('波前示意，不是光的路徑',w-6,h-6);ctx.textAlign='left';
    }
    var L=loop(function(dt){t+=dt;draw();});
    $('huyPlay').onclick=function(){L.start();};$('huyPause').onclick=function(){L.stop();};
    $('huyCross').onclick=function(){cross=!cross;this.setAttribute('aria-pressed',cross);draw();};
    SIMS['p-l2-huygens']={show:function(){draw();if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)L.start();},hide:function(){L.stop();},redraw:draw};
  })();

  /* ================= screen pattern helper ================= */
  function drawPattern(g,o){
    // o: {range(mm), I(x_mm, lam_nm), white, lam, label, marks}
    var ctx=g.ctx,w=g.w,h=g.h,fs=g.fs,mut=css('--muted'),line=css('--line'),ink=css('--ink');
    ctx.clearRect(0,0,w,h);ctx.font=fs+'px '+fontB();
    var padL=o.left||10,padR=10,pw=w-padL-padR,stripTop=fs*1.5,stripH=Math.max(40,h*0.24),cTop=stripTop+stripH+fs*1.6,cH=h-cTop-fs*1.8;
    ctx.fillStyle=mut;ctx.fillText(o.label||'屏幕上的亮度分布（理想模型）',padL,fs*1.05);
    var N=Math.round(pw);var vals=[],cols=[];
    var lams=o.white?[]:[o.lam];if(o.white)for(var L=400;L<=700;L+=10)lams.push(L);
    var wsum=[0,0,0];lams.forEach(function(L){var c=wl2rgb(L);wsum[0]+=c[0];wsum[1]+=c[1];wsum[2]+=c[2];});
    for(var i=0;i<=N;i++){var x=(i/N-0.5)*2*o.range;var acc=[0,0,0],Isum=0;
      lams.forEach(function(L){var I=o.I(x,L),c=wl2rgb(L);acc[0]+=I*c[0];acc[1]+=I*c[1];acc[2]+=I*c[2];Isum+=I;});
      vals.push(Isum/lams.length);
      cols.push(o.white?[acc[0]/wsum[0],acc[1]/wsum[1],acc[2]/wsum[2]]:acc);}
    ctx.fillStyle='#05070a';ctx.fillRect(padL,stripTop,pw,stripH);
    for(i=0;i<=N;i++){ctx.fillStyle=rgbStr(cols[i],o.white?1.15:1);ctx.fillRect(padL+i,stripTop,1.5,stripH);}
    ctx.strokeStyle=line;ctx.strokeRect(padL,stripTop,pw,stripH);
    ctx.strokeStyle=line;ctx.strokeRect(padL,cTop,pw,cH);
    ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.beginPath();for(i=0;i<=N;i++){var Y=cTop+cH-vals[i]*(cH-4);i?ctx.lineTo(padL+i,Y):ctx.moveTo(padL+i,Y);}ctx.stroke();
    ctx.fillStyle=mut;ctx.textAlign='center';
    [-1,-0.5,0,0.5,1].forEach(function(f){var X=padL+pw*(f+1)/2;ctx.fillText((f*o.range>0?'+':'')+Math.round(f*o.range)+' mm',Math.min(Math.max(X,padL+24),padL+pw-24),h-4);ctx.beginPath();ctx.moveTo(X,cTop+cH);ctx.lineTo(X,cTop+cH+4);ctx.stroke();});
    ctx.textAlign='left';ctx.fillText('亮度',padL+4,cTop+fs);
    return {padL:padL,pw:pw,stripTop:stripTop,stripH:stripH,cTop:cTop,cH:cH};
  }

  /* ================= 2-4 double-slit sim ================= */
  (function(){
    var c=$('dsCv'),white=false,A=0.04;
    function draw(){
      var lam=+$('dsL').value,d=+$('dsD').value,Z=+$('dsZ').value;
      $('dsLv').textContent=white?'白光':lam+' nm';$('dsDv').textContent=d.toFixed(2)+' mm';$('dsZv').textContent=Z.toFixed(1)+' m';
      var g=fit(c);
      drawPattern(g,{range:30,lam:lam,white:white,label:'屏幕亮度分布（理想模型，中央在中間）',I:function(x,L){var k=Math.PI*x*1e-3/(L*1e-9*Z);return Math.pow(Math.cos(k*d*1e-3),2)*Math.pow(sinc(k*A*1e-3),2);}});
      var sp=lam*1e-9*Z/(d*1e-3)*1e3;
      $('dsRead').textContent=white?'白光：中央亮紋為白色；不同顏色的亮紋間隔不同，往外逐漸分開而帶彩色。':'相鄰亮紋間隔（模擬量測）≈ '+sp.toFixed(2)+' mm　｜　波長越長、屏幕越遠、縫距越小 → 間隔越大';
    }
    ['dsL','dsD','dsZ'].forEach(function(id){$(id).oninput=draw;$(id).onchange=function(){op('雙狹縫模擬','λ='+$('dsL').value+' d='+$('dsD').value+' L='+$('dsZ').value);};});
    $('dsWhite').onclick=function(){white=!white;this.setAttribute('aria-pressed',white);this.textContent=white?'改用單色光':'改用白光';draw();op('雙狹縫模擬',white?'白光':'單色');};
    SIMS['p-l2-sim']={show:draw,redraw:draw};
  })();

  /* ================= 2-5 B / D model (08 ACT01) ================= */
  (function(){
    var svg=$('bdSvg'),c=$('bdCv'),NS='http://www.w3.org/2000/svg',st={sel:'B',t:0};
    var S1={x:110,y:120},S2={x:110,y:180},Bp={x:480,y:150},Dp={x:480,y:70};
    function el(n,a,txt){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(txt)e.textContent=txt;svg.appendChild(e);return e;}
    function drawSvg(){
      svg.innerHTML='';
      el('rect',{x:100,y:20,width:12,height:90,fill:'var(--ink)'});el('rect',{x:100,y:130,width:12,height:40,fill:'var(--ink)'});el('rect',{x:100,y:190,width:12,height:90,fill:'var(--ink)'});
      for(var y=20;y<=280;y+=2){var ph=(y-150)/160*Math.PI;var I=Math.pow(Math.cos(ph),2)*Math.exp(-Math.pow((y-150)/170,2));el('rect',{x:476,y:y,width:12,height:2,fill:'var(--laser)','fill-opacity':I.toFixed(3)});}
      el('line',{x1:488,y1:20,x2:488,y2:280,stroke:'var(--ink)','stroke-width':2});
      [[Bp,'B'],[Dp,'D']].forEach(function(p){var on=st.sel===p[1];
        [S1,S2].forEach(function(s){el('line',{x1:s.x+12,y1:s.y,x2:p[0].x,y2:p[0].y,stroke:on?'var(--wave)':'var(--muted)','stroke-width':on?2.6:1.2,'stroke-dasharray':p[1]==='D'?'7 5':'0','stroke-opacity':on?1:0.45});});
        el('circle',{cx:p[0].x,cy:p[0].y,r:7,fill:on?'var(--wave)':'var(--sheet)',stroke:'var(--wave)','stroke-width':2});
        el('text',{x:500,y:p[0].y+6,'font-size':20,'font-weight':700,fill:'var(--ink)'},p[1]+(p[1]==='B'?' 亮':' 暗'));});
      el('text',{x:68,y:126,'font-size':18,fill:'var(--ink)'},'S₁');el('text',{x:68,y:186,'font-size':18,fill:'var(--ink)'},'S₂');
      el('text',{x:96,y:14,'font-size':14,fill:'var(--muted)'},'雙狹縫');el('text',{x:430,y:14,'font-size':14,fill:'var(--muted)'},'屏幕（亮度示意）');
      el('text',{x:150,y:296,'font-size':13,fill:'var(--muted)'},'路徑示意 · 非實拍 · 未依比例');
    }
    function drawWave(){
      var g=fit(c),ctx=g.ctx,w=g.w,h=g.h,fs=g.fs,mut=css('--muted'),wave=css('--wave'),las=css('--laser'),ink=css('--ink');
      ctx.clearRect(0,0,w,h);ctx.font=(fs-1)+'px '+fontB();
      var phase=st.sel==='B'?0:Math.PI,lab=w<480?72:Math.min(150,w*0.22),right=w<480?70:120;
      var rows=[['S₁ 傳來',0,wave,1.6],['S₂ 傳來',phase,wave,1.6],['合成',null,las,2]],rh=(h-6)/3,x0=lab,xw=w-x0-right;
      rows.forEach(function(r,i){var mid=3+rh*i+rh/2;ctx.fillStyle=mut;ctx.textAlign='left';ctx.fillText(r[0],4,mid+fs*0.35);
        ctx.strokeStyle=css('--line');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,mid);ctx.lineTo(x0+xw,mid);ctx.stroke();
        ctx.strokeStyle=r[2];ctx.lineWidth=i===2?3.5:2.2;ctx.beginPath();
        for(var k=0;k<=240;k++){var u=k/240*4*Math.PI-st.t;var y=r[1]===null?(Math.sin(u)+Math.sin(u+phase)):Math.sin(u+r[1]);var Y=mid-y*(rh/2-4)/r[3];k?ctx.lineTo(x0+xw*k/240,Y):ctx.moveTo(x0+xw*k/240,Y);}ctx.stroke();});
      ctx.fillStyle=ink;ctx.font='bold '+fs+'px '+fontB();ctx.fillText(st.sel+' 點',x0+xw+10,fs*1.4);
      ctx.font=(fs-1)+'px '+fontB();ctx.fillStyle=mut;ctx.fillText('兩路都到達',x0+xw+10,fs*2.9);ctx.fillText(st.sel==='B'?'同相→增強':'反相→相消',x0+xw+10,h-fs*0.8);
    }
    function draw(){drawSvg();drawWave();}
    var L=loop(function(dt){st.t+=dt*2.5;drawWave();});
    function sel(p){st.sel=p;var b=$('selB'),d=$('selD');b.setAttribute('aria-pressed',p==='B');d.setAttribute('aria-pressed',p==='D');b.classList.toggle('ghost',p!=='B');d.classList.toggle('ghost',p!=='D');draw();op('B／D 模型','選擇 '+p);}
    $('selB').onclick=function(){sel('B');};$('selD').onclick=function(){sel('D');};
    $('bdPlay').onclick=function(){L.start();op('B／D 模型','播放');};$('bdPause').onclick=function(){L.stop();};$('bdReset').onclick=function(){L.stop();st.t=0;drawWave();op('B／D 模型','重置');};
    SIMS['p-l2-explain']={show:draw,hide:function(){L.stop();},redraw:draw};
  })();

  /* ================= 3-1 single slit ================= */
  (function(){
    var c=$('ssCv'),Z=1.5;
    function draw(){
      var a=+$('ssA').value,lam=+$('ssL').value;$('ssAv').textContent=a.toFixed(2)+' mm';$('ssLv').textContent=lam+' nm';
      var g=fit(c),left=Math.max(60,g.w*0.12);
      var geo=drawPattern(g,{range:40,lam:lam,left:left,label:'屏幕亮度分布（遠場理想模型）',I:function(x,L){var k=Math.PI*x*1e-3/(L*1e-9*Z);return Math.pow(sinc(k*a*1e-3),2);}});
      var ctx=g.ctx,cx=left*0.45,top=geo.stripTop,hh=geo.cTop+geo.cH-top,mid=top+hh/2,open=Math.max(10,hh*0.55*(a/0.15));
      ctx.fillStyle=css('--ink');ctx.fillRect(cx-4,top,8,mid-open/2-top);ctx.fillRect(cx-4,mid+open/2,8,top+hh-mid-open/2);
      ctx.fillStyle=css('--wave');var n=Math.max(3,Math.round(open/7));for(var i=0;i<n;i++){ctx.beginPath();ctx.arc(cx,mid-open/2+open*(i+0.5)/n,2.6,0,7);ctx.fill();}
      ctx.fillStyle=css('--muted');ctx.font=(g.fs-2)+'px '+fontB();ctx.textAlign='center';ctx.fillText('狹縫',cx,top+hh+g.fs);ctx.textAlign='left';
      var cw=2*lam*1e-9*Z/(a*1e-3)*1e3;
      $('ssRead').textContent='中央亮紋寬度（模擬量測，兩側第一暗紋間）≈ '+cw.toFixed(1)+' mm'+(cw>80?'（超出畫面）':'')+'　｜　縫越窄、波長越長 → 中央亮紋越寬';
    }
    ['ssA','ssL'].forEach(function(id){$(id).oninput=draw;$(id).onchange=function(){op('單狹縫模擬','a='+$('ssA').value+' λ='+$('ssL').value);};});
    SIMS['p-l3-single']={show:draw,redraw:draw};
  })();

  /* ================= profile helper (compare page + quiz curves) ================= */
  function curve(c,fn,opt){
    opt=opt||{};var g=fit(c),ctx=g.ctx,w=g.w,h=g.h,fs=g.fs;ctx.clearRect(0,0,w,h);
    var pad=8,base=h-fs*1.4;ctx.strokeStyle=css('--line');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,base);ctx.lineTo(w-pad,base);ctx.stroke();
    ctx.strokeStyle=css('--ink');ctx.lineWidth=2.2;ctx.beginPath();for(var k=0;k<=400;k++){var u=(k/400-0.5)*2;var I=fn(u);var X=pad+(w-2*pad)*k/400,Y=base-I*(base-fs*0.6);k?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();
    ctx.fillStyle=css('--muted');ctx.font=(fs-2)+'px '+fontB();ctx.textAlign='center';ctx.fillText('屏幕位置（中央在中間）',w/2,h-3);ctx.textAlign='left';
  }
  var singleF=function(u){var s=sinc(u*Math.PI*3.2);return s*s;},doubleF=function(u){var s=sinc(u*Math.PI*1.3),cc=Math.cos(u*Math.PI*7);return s*s*cc*cc;};

  (function(){
    var c=$('cmpCv');
    function draw(){
      var g=fit(c),ctx=g.ctx,w=g.w,h=g.h,fs=g.fs,ink=css('--ink'),mut=css('--muted'),las=css('--laser'),wave=css('--wave'),line=css('--line');
      ctx.clearRect(0,0,w,h);ctx.font=(fs-1)+'px '+fontB();
      var x0=Math.max(70,w*0.16),xw=w-x0-10,rh=(h-10)/2;
      function panel(i,label,fn,srcs){
        var top=4+i*(rh+4),base=top+rh-30,sh=rh-34,cy=top+4+sh/2;
        ctx.fillStyle=ink;ctx.fillRect(18,top+4,7,sh);
        ctx.fillStyle=css('--sheet');srcs.forEach(function(s){ctx.fillRect(18,cy+s[0]*sh,7,s[1]*sh);});
        ctx.fillStyle=wave;srcs.forEach(function(s){var n=Math.max(1,Math.round(s[1]*sh/6));for(var k=0;k<n;k++){ctx.beginPath();ctx.arc(21.5,cy+s[0]*sh+s[1]*sh*(k+0.5)/n,2.5,0,7);ctx.fill();}});
        ctx.fillStyle=mut;ctx.fillText(label,x0,top+fs);
        for(var k=0;k<=xw;k+=2){var u=(k/xw-0.5)*2;ctx.fillStyle=las;ctx.globalAlpha=Math.min(1,fn(u));ctx.fillRect(x0+k,base+6,2,18);}ctx.globalAlpha=1;
        ctx.strokeStyle=line;ctx.strokeRect(x0,base+6,xw,18);
        ctx.strokeStyle=ink;ctx.lineWidth=2.2;ctx.beginPath();for(k=0;k<=500;k++){u=(k/500-0.5)*2;var Y=base-fn(u)*(rh-fs*2.2-34);k?ctx.lineTo(x0+xw*k/500,Y):ctx.moveTo(x0+xw*k/500,Y);}ctx.stroke();
        ctx.strokeStyle=line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,base);ctx.lineTo(x0+xw,base);ctx.stroke();
      }
      panel(0,'單狹縫：縫內連續分布的次波源',singleF,[[-0.18,0.36]]);
      panel(1,'雙狹縫：兩個分立次波源',doubleF,[[-0.3,0.08],[0.22,0.08]]);
    }
    SIMS['p-l3-compare']={show:draw,redraw:draw};
  })();

  SIMS['p-l3-quiz']={show:function(){curve($('qcvA'),singleF);curve($('qcvB'),doubleF);}};
  SIMS['p-assess']={show:function(){curve($('acvA'),singleF);curve($('acvB'),doubleF);}};
  SIMS['p-l3-quiz'].redraw=SIMS['p-l3-quiz'].show;SIMS['p-assess'].redraw=SIMS['p-assess'].show;

  /* ================= 3-3 thin film ================= */
  (function(){
    var c=$('filmCv'),N=1.33;
    function R(lam,d){var s=Math.sin(2*Math.PI*N*d/lam);return s*s;}
    function color(d){var acc=[0,0,0],ws=[0,0,0];for(var L=400;L<=700;L+=5){var cc=wl2rgb(L),r=R(L,d);for(var k=0;k<3;k++){acc[k]+=r*cc[k];ws[k]+=cc[k];}}
      return acc.map(function(v,k){return Math.pow(Math.min(1,v/ws[k]*1.35),0.85);});}
    var wedge=null;
    function draw(){
      var d=+$('filmD').value;$('filmDv').textContent=d+' nm';
      var g=fit(c),ctx=g.ctx,w=g.w,h=g.h,fs=g.fs,ink=css('--ink'),mut=css('--muted'),line=css('--line');
      ctx.clearRect(0,0,w,h);ctx.font=(fs-1)+'px '+fontB();
      var narrow=w<480,ww=narrow?w*0.3:w*0.26,lx=8,lw=w-ww-30,top=fs*1.5,ch=h-top-fs*3.4;
      // reflectance curve
      ctx.fillStyle=mut;ctx.fillText('各顏色的反射強度（相對）',lx,fs*1.05);
      ctx.strokeStyle=line;ctx.strokeRect(lx,top,lw,ch);
      ctx.strokeStyle=ink;ctx.lineWidth=2.2;ctx.beginPath();for(var k=0;k<=300;k++){var L=400+300*k/300,Y=top+ch-R(L,d)*(ch-6);k?ctx.lineTo(lx+lw*k/300,Y):ctx.moveTo(lx+lw*k/300,Y);}ctx.stroke();
      for(k=0;k<lw;k++){ctx.fillStyle=rgbStr(wl2rgb(400+300*k/lw));ctx.fillRect(lx+k,top+ch+4,1.5,10);}
      ctx.fillStyle=mut;ctx.textAlign='center';[400,500,600,700].forEach(function(L){ctx.fillText(L+' nm',Math.min(Math.max(lx+lw*(L-400)/300,lx+22),lx+lw-22),top+ch+14+fs);});ctx.textAlign='left';
      // swatch
      var col=color(d),sx=lx+lw-70,sy=top+6;ctx.fillStyle=rgbStr(col);ctx.fillRect(sx,sy,62,36);ctx.strokeStyle=line;ctx.strokeRect(sx,sy,62,36);ctx.fillStyle=mut;ctx.font=(fs-3)+'px '+fontB();ctx.fillText('反射光顏色',sx,sy+48);
      // wedge
      var wx=w-ww-8,wy=top,wh=ch+14;ctx.font=(fs-1)+'px '+fontB();ctx.fillStyle=mut;ctx.fillText('直立肥皂膜',wx,fs*1.05);
      if(!wedge||wedge.h!==Math.round(wh)){wedge={h:Math.round(wh),rows:[]};for(var y=0;y<wedge.h;y++)wedge.rows.push(rgbStr(color(900*y/wedge.h)));}
      for(var y=0;y<wedge.h;y++){ctx.fillStyle=wedge.rows[y];ctx.fillRect(wx,wy+y,ww,1.2);}
      ctx.strokeStyle=line;ctx.strokeRect(wx,wy,ww,wh);
      var my=wy+wh*d/900;ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(wx-6,my);ctx.lineTo(wx+ww+6,my);ctx.stroke();
      ctx.fillStyle=mut;ctx.font=(fs-3)+'px '+fontB();ctx.fillText('上：薄',wx,wy+wh+fs);ctx.textAlign='right';ctx.fillText('下：厚',wx+ww,wy+wh+fs);ctx.textAlign='left';
      // readout
      var best=400,bv=-1,worst=400,wv=2;for(var L2=400;L2<=700;L2+=5){var r=R(L2,d);if(r>bv){bv=r;best=L2;}if(r<wv){wv=r;worst=L2;}}
      function nm(L){return L<450?'紫藍':L<495?'藍':L<570?'綠':L<590?'黃':L<620?'橙':'紅';}
      $('filmRead').textContent=d<40?'膜厚 '+d+' nm：膜極薄，兩路反射光近乎反相，各色都很弱，看起來偏暗（肥皂膜破掉前頂端變黑）。':'膜厚 '+d+' nm：增強最多約 '+best+' nm（'+nm(best)+'），減弱最多約 '+worst+' nm（'+nm(worst)+'）。不同顏色增強程度不同，所以帶色。';
    }
    $('filmD').oninput=draw;$('filmD').onchange=function(){op('薄膜模擬','d='+$('filmD').value);};
    SIMS['p-l3-film']={show:function(){wedge=null;draw();},redraw:function(){wedge=null;draw();}};
  })();

  /* ================= 3-5 straight-line model vs observation ================= */
  (function(){
    var c=$('modelCv'),mode='double';
    function draw(){
      var g=fit(c),ctx=g.ctx,w=g.w,h=g.h,fs=g.fs,mut=css('--muted'),ink=css('--ink');
      ctx.clearRect(0,0,w,h);ctx.font=(fs-1)+'px '+fontB();
      var pw=(w-24)/2,top=fs*1.6,ph=h-top-6;
      [0,1].forEach(function(i){
        var x0=8+i*(pw+8);ctx.fillStyle='#05070a';ctx.fillRect(x0,top,pw,ph);
        ctx.fillStyle=mut;ctx.fillText(i?(w<480?'實際特徵（示意）':'實際觀察的特徵（示意）'):(w<480?'直進模型預測':'直進模型的預測'),x0,fs*1.1);
        for(var k=0;k<pw;k++){var u=(k/pw-0.5)*2,I;
          if(i===0){I=mode==='double'?((Math.abs(u+0.16)<0.05||Math.abs(u-0.16)<0.05)?1:0):(Math.abs(u)<0.08?1:0);}
          else{I=mode==='double'?doubleF(u):Math.pow(sinc(u*Math.PI*3.6),2);}
          ctx.fillStyle='rgba(255,60,85,'+Math.min(1,I*1.1).toFixed(3)+')';ctx.fillRect(x0+k,top,1.5,ph);}
        if(i===1&&mode==='single'){ctx.setLineDash([5,4]);ctx.strokeStyle='#ffffff';ctx.lineWidth=1;[-0.08,0.08].forEach(function(u){var X=x0+pw*(u+1)/2;ctx.beginPath();ctx.moveTo(X,top);ctx.lineTo(X,top+ph);ctx.stroke();});ctx.setLineDash([]);
          ctx.fillStyle='#ffffff';ctx.font=(fs-3)+'px '+fontB();ctx.fillText('虛線：幾何陰影邊界',x0+4,top+ph-6);ctx.font=(fs-1)+'px '+fontB();}
      });
      $('modelMsg').textContent=mode==='double'?'直進模型只預測兩條亮帶，無法說明多條明暗交替。':'直進模型只預測一條亮帶，無法說明光展開到陰影區與旁側亮紋。';
    }
    function set(m){mode=m;$('mDouble').setAttribute('aria-pressed',m==='double');$('mSingle').setAttribute('aria-pressed',m==='single');$('mDouble').classList.toggle('ghost',m!=='double');$('mSingle').classList.toggle('ghost',m!=='single');draw();}
    $('mDouble').onclick=function(){set('double');};$('mSingle').onclick=function(){set('single');};
    SIMS['p-l3-argue']={show:draw,redraw:draw};
  })();

  /* ---------- redraw on resize / theme ---------- */
  function redrawCur(){var id=window.BOOK&&BOOK.cur();var s=id&&SIMS[id];if(s)(s.redraw||s.show)();}
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(redrawCur,120);});
  try{window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',redrawCur);}catch(e){}
  new MutationObserver(redrawCur).observe(root,{attributes:true,attributeFilter:['data-theme']});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(redrawCur);
  setTimeout(redrawCur,0);
})();
