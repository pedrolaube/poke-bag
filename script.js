(function(){
  var $=function(s){return document.querySelector(s)},body=document.body;
  var mons=[["Bulbasaur","Planta / Veneno","Carrega uma semente nas costas desde o nascimento."],["Charmander","Fogo","A chama na ponta da cauda mostra a sua energia."],["Squirtle","Água","Recolhe-se no casco para se proteger e revidar."],["Pikachu","Elétrico","Guarda eletricidade nas bochechas e a solta em combate."],["Eevee","Normal","Seu corpo instável permite várias evoluções."],["Gengar","Fantasma / Veneno","Esconde-se nas sombras e imita quem está por perto."]];
  var favs=[];try{favs=JSON.parse(localStorage.getItem('pb-favs')||'[]')}catch(e){}
  var dex=$('#dex');
  mons.forEach(function(m){
    var r=document.createElement('article');r.className='row';r.dataset.n=m[0].toLowerCase();
    r.innerHTML='<div class="img">IMG</div><div><h3>'+m[0]+'</h3><small>'+m[1]+'</small><p>'+m[2]+'</p></div><div class="acts"><a class="mini" href="#competitivo" style="text-decoration:none;text-align:center">Ficha competitiva</a><button class="mini fv" type="button" aria-pressed="false">Favoritar</button></div>';
    var b=r.querySelector('.fv');
    function sync(){var on=favs.indexOf(m[0])>-1;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.textContent=on?'Favorito':'Favoritar'}
    b.onclick=function(){var i=favs.indexOf(m[0]);i>-1?favs.splice(i,1):favs.push(m[0]);try{localStorage.setItem('pb-favs',JSON.stringify(favs))}catch(e){}sync();drawFavs()};
    sync();dex.appendChild(r);
  });
  function drawFavs(){
    var s=document.querySelectorAll('#fav .slot');
    s.forEach(function(el,i){el.textContent=favs[i]||''});
  }
  drawFavs();

  // carrossel
  document.querySelectorAll('.arrow').forEach(function(a){a.onclick=function(){var t=$('#track');t.scrollBy({left:a.dataset.dir*(t.clientWidth*.8),behavior:'smooth'})}});

  // menu, pesquisa e simulador
  $('#burger').onclick=function(){var n=$('#nav'),o=n.classList.toggle('open');this.setAttribute('aria-expanded',o)};
  var q=$('#q');
  $('#sbtn').onclick=function(){var s=$('#search');if(!s.classList.contains('open')){s.classList.add('open');q.focus()}else{location.hash='#pokedex';filter()}};
  function filter(){var v=q.value.trim().toLowerCase(),n=0;document.querySelectorAll('.row').forEach(function(r){var ok=r.dataset.n.indexOf(v)>-1;r.style.display=ok?'':'none';if(ok)n++});$('#empty').style.display=n?'none':'block'}
  q.oninput=function(){if(location.hash!=='#pokedex')location.hash='#pokedex';filter()};
  document.querySelectorAll('.pills .pill').forEach(function(b){b.onclick=function(){document.querySelectorAll('.pills .pill').forEach(function(x){x.classList.remove('on')});b.classList.add('on');if(b.id==='play')$('#arena').textContent='Simulador em desenvolvimento. Em breve você poderá batalhar aqui.'}});

  // rotas por hash
  var names=['inicio','pokedex','competitivo','simulador'];
  function route(){
    var h=(location.hash||'#inicio').slice(1);if(names.indexOf(h)<0)h='inicio';
    names.forEach(function(n){$('#v-'+n).classList.toggle('on',n===h)});
    document.querySelectorAll('.tab').forEach(function(t){t.getAttribute('href')==='#'+h?t.setAttribute('aria-current','page'):t.removeAttribute('aria-current')});
    $('#nav').classList.remove('open');
  }
  window.addEventListener('hashchange',route);route();

  // abertura: 5 s (contorno 0-2,3 s, cor 2,3-3,3 s, logo voa ao cabeçalho 3,5-4,5 s, página 5 s)
  var bg=$('#introbg'),fly=$('#fly'),ended=false;
  function end(){if(ended)return;ended=true;[bg,fly,$('#skip')].forEach(function(e){e.style.display='none'});body.classList.remove('intro')}
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){end();return}
  setTimeout(function(){
    var a=fly.getBoundingClientRect(),h=$('#hlogo').getBoundingClientRect();
    var s=h.height/a.height,dx=(h.left+h.width/2)-(a.left+a.width/2),dy=(h.top+h.height/2)-(a.top+a.height/2);
    fly.classList.add('go');bg.classList.add('out');
    fly.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale('+s+')';
  },3500);
  setTimeout(end,5000);
  $('#skip').onclick=end;
})();