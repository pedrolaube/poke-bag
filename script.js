(function () {
  /* ---- Atalhos ---- */
  var $ = function (s) {
      return document.querySelector(s);
    },
    body = document.body;

  /* ---- Dados da Pokedex (nome, tipo, descrição) ---- */
  var mons = [
    [
      "Bulbasaur",
      "Planta / Veneno",
      "Carrega uma semente nas costas desde o nascimento.",
    ],
    ["Charmander", "Fogo", "A chama na ponta da cauda mostra a sua energia."],
    ["Squirtle", "Água", "Recolhe-se no casco para se proteger e revidar."],
    [
      "Pikachu",
      "Elétrico",
      "Guarda eletricidade nas bochechas e a solta em combate.",
    ],
    ["Eevee", "Normal", "Seu corpo instável permite várias evoluções."],
    [
      "Gengar",
      "Fantasma / Veneno",
      "Esconde-se nas sombras e imita quem está por perto.",
    ],
  ];

  /* ---- Favoritos: lê a lista salva no navegador ---- */
  var favs = [];
  try {
    favs = JSON.parse(localStorage.getItem("pb-favs") || "[]");
  } catch (e) {}

  /* ---- Página Pokedex: cria um cartão para cada Pokémon ---- */
  var dex = $("#dex");
  mons.forEach(function (m) {
    var r = document.createElement("article");
    r.className = "row";
    r.dataset.n = m[0].toLowerCase();
    r.innerHTML =
      '<div class="img">IMG</div><div><h3>' +
      m[0] +
      "</h3><small>" +
      m[1] +
      "</small><p>" +
      m[2] +
      '</p></div><div class="acts"><a class="mini" href="#competitivo" style="text-decoration:none;text-align:center">Ficha competitiva</a><button class="mini fv" type="button" aria-pressed="false">Favoritar</button></div>';
    var b = r.querySelector(".fv");
    // Atualiza o texto e a cor do botão Favoritar
    function sync() {
      var on = favs.indexOf(m[0]) > -1;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
      b.textContent = on ? "Favorito" : "Favoritar";
    }
    // Clique em Favoritar: adiciona ou remove e salva
    b.onclick = function () {
      var i = favs.indexOf(m[0]);
      i > -1 ? favs.splice(i, 1) : favs.push(m[0]);
      try {
        localStorage.setItem("pb-favs", JSON.stringify(favs));
      } catch (e) {}
      sync();
      drawFavs();
    };
    sync();
    dex.appendChild(r);
  });

  /* ---- Página Início: mostra os favoritos nas 3 caixas ---- */
  function drawFavs() {
    var s = document.querySelectorAll("#fav .slot");
    s.forEach(function (el, i) {
      el.textContent = favs[i] || "";
    });
  }
  drawFavs();

  /* ---- Página Início: setas do carrossel de notícias ---- */
  document.querySelectorAll(".arrow").forEach(function (a) {
    a.onclick = function () {
      var t = $("#track");
      t.scrollBy({
        left: a.dataset.dir * (t.clientWidth * 0.8),
        behavior: "smooth",
      });
    };
  });

  /* ---- Barra de navegação: botão hambúrguer (menu no celular) ---- */
  $("#burger").onclick = function () {
    var n = $("#nav"),
      o = n.classList.toggle("open");
    this.setAttribute("aria-expanded", o);
  };

  /* ---- Barra de navegação: pesquisa ---- */
  var q = $("#q");
  // Botão Pesquisar: primeiro clique abre o campo, o segundo pesquisa
  $("#sbtn").onclick = function () {
    var s = $("#search");
    if (!s.classList.contains("open")) {
      s.classList.add("open");
      q.focus();
    } else {
      location.hash = "#pokedex";
      filter();
    }
  };
  // Esconde os Pokémon que não combinam com o texto digitado
  function filter() {
    var v = q.value.trim().toLowerCase(),
      n = 0;
    document.querySelectorAll(".row").forEach(function (r) {
      var ok = r.dataset.n.indexOf(v) > -1;
      r.style.display = ok ? "" : "none";
      if (ok) n++;
    });
    $("#empty").style.display = n ? "none" : "block";
  }
  // Pesquisa enquanto digita
  q.oninput = function () {
    if (location.hash !== "#pokedex") location.hash = "#pokedex";
    filter();
  };

  /* ---- Página Simulador: botões da lateral ---- */
  document.querySelectorAll(".pills .pill").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll(".pills .pill").forEach(function (x) {
        x.classList.remove("on");
      });
      b.classList.add("on");
      if (b.id === "play")
        $("#arena").textContent =
          "Simulador em desenvolvimento. Em breve você poderá batalhar aqui.";
    };
  });

  /* ---- Barra de navegação: botão de tema claro/escuro ---- */
  var themeBtn = $("#theme");
  var root = document.documentElement;

  // Aplica o tema, troca o texto do botão e salva a escolha
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    themeBtn.textContent = t === "dark" ? "Claro" : "Escuro";
    try {
      localStorage.setItem("pb-theme", t);
    } catch (e) {}
  }

  // Tema inicial: o salvo no navegador ou o do sistema do visitante
  var saved = null;
  try {
    saved = localStorage.getItem("pb-theme");
  } catch (e) {}
  if (!saved) {
    saved = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  setTheme(saved);

  // Clique no botão: alterna entre claro e escuro
  themeBtn.onclick = function () {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  };

  /* ---- Páginas: troca de seção pelo endereço (#inicio, #pokedex...) ---- */
  var names = ["inicio", "pokedex", "competitivo", "simulador"];
  function route() {
    var h = (location.hash || "#inicio").slice(1);
    if (names.indexOf(h) < 0) h = "inicio";
    // Mostra só a página atual
    names.forEach(function (n) {
      $("#v-" + n).classList.toggle("on", n === h);
    });
    // Marca a aba atual na barra de navegação
    document.querySelectorAll(".tab").forEach(function (t) {
      t.getAttribute("href") === "#" + h
        ? t.setAttribute("aria-current", "page")
        : t.removeAttribute("aria-current");
    });
    $("#nav").classList.remove("open");
  }
  window.addEventListener("hashchange", route);
  route();

  /* ---- Animação de abertura ----
     5 s: contorno 0-2,3 s, cor 2,3-3,3 s,
     logo voa ao cabeçalho 3,5-4,5 s, página 5 s */
  var bg = $("#introbg"),
    fly = $("#fly"),
    ended = false;
  // Encerra a animação e libera a página
  function end() {
    if (ended) return;
    ended = true;
    [bg, fly, $("#skip")].forEach(function (e) {
      e.style.display = "none";
    });
    body.classList.remove("intro");
  }
  // Quem prefere menos movimento pula a animação
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    end();
    return;
  }
  // Aos 3,5 s: o logo voa até o cabeçalho
  setTimeout(function () {
    var a = fly.getBoundingClientRect(),
      h = $("#hlogo").getBoundingClientRect();
    var s = h.height / a.height,
      dx = h.left + h.width / 2 - (a.left + a.width / 2),
      dy = h.top + h.height / 2 - (a.top + a.height / 2);
    fly.classList.add("go");
    bg.classList.add("out");
    fly.style.transform =
      "translate(calc(-50% + " +
      dx +
      "px),calc(-50% + " +
      dy +
      "px)) scale(" +
      s +
      ")";
  }, 3500);
  // Aos 5 s: termina
  setTimeout(end, 5000);
  // Botão Pular
  $("#skip").onclick = end;
})();