(function () {
  var $ = function (s) {
      return document.querySelector(s);
    },
    body = document.body;
  var fallbackMons = [
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
  var mons = fallbackMons;
  var apiUrl = "http://localhost:3000/api";
  var dex = $("#dex");
  var pageSize = 20;
  var nextOffset = 0;
  var hasMore = true;
  var loadingMons = false;
  var loadedNames = new Set();

  function titleCase(value) {
    return value
      ? value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ")
      : "";
  }

  function renderMons() {
    dex.innerHTML = "";
    mons.forEach(function (m) {
      var r = document.createElement("article");
      r.className = "row";
      var name = Array.isArray(m) ? m[0] : m.displayName;
      r.dataset.n = name.toLowerCase();
      var types = Array.isArray(m) ? m[1] : m.types.join(" / ");
      var description = Array.isArray(m) ? m[2] : "Dados obtidos pela PokéAPI.";
      var image = Array.isArray(m) ? "" : m.image;
      r.innerHTML =
        '<div class="img">' +
        (image
          ? '<img src="' +
            image +
            '" alt="' +
            name +
            '" style="width:100%;height:100%;object-fit:contain">'
          : "IMG") +
        "</div><div><h3>" +
        name +
        "</h3><small>" +
        types +
        "</small><p>" +
        description +
        '</p></div><div class="acts"><a class="mini" href="#competitivo" style="text-decoration:none;text-align:center">Ficha competitiva</a><button class="mini fv" type="button" aria-pressed="false">Favoritar</button></div>';
      var b = r.querySelector(".fv");
      function sync() {
        var on = favs.indexOf(name) > -1;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on);
        b.textContent = on ? "Favorito" : "Favoritar";
      }
      b.onclick = function () {
        var i = favs.indexOf(name);
        i > -1 ? favs.splice(i, 1) : favs.push(name);
        try {
          localStorage.setItem("pb-favs", JSON.stringify(favs));
        } catch (e) {}
        sync();
        drawFavs();
      };
      sync();
      dex.appendChild(r);
    });
  }

  async function loadMons() {
    if (loadingMons) return;
    loadingMons = true;
    var moreButton = $("#load-more");
    var loadFailed = false;
    moreButton.disabled = true;
    moreButton.textContent = "Carregando...";

    try {
      var response = await fetch(
        apiUrl +
          "/pokemon?limit=" +
          pageSize +
          "&offset=" +
          nextOffset
      );
      if (!response.ok) throw new Error("Falha ao consultar o backend");
      var data = await response.json();
      if (!Array.isArray(data.results)) {
        throw new Error("Resposta inválida do backend");
      }

      var newMons = data.results
        .map(function (pokemon) {
          return {
            displayName: titleCase(pokemon.displayName),
            types: pokemon.types.map(titleCase),
            image: pokemon.image,
          };
        })
        .filter(function (pokemon) {
          var key = pokemon.displayName.toLowerCase();
          if (loadedNames.has(key)) return false;
          loadedNames.add(key);
          return true;
        });

      if (nextOffset === 0) mons = newMons;
      else mons = mons.concat(newMons);

      nextOffset += data.results.length;
      hasMore =
        data.results.length > 0 &&
        (typeof data.count !== "number" || nextOffset < data.count);
      renderMons();
    } catch (error) {
      if (nextOffset === 0) {
        mons = fallbackMons;
        renderMons();
      }
      loadFailed = true;
      console.error("Falha ao carregar Pokémon:", error);
    } finally {
      loadingMons = false;
      moreButton.disabled = !hasMore;
      moreButton.textContent = loadFailed
        ? "Tentar novamente"
        : hasMore
          ? "Carregar mais"
          : "Fim da Pokedex";
      moreButton.style.display = "";
    }
  }

  $("#load-more").onclick = loadMons;

  var favs = [];
  try {
    favs = JSON.parse(localStorage.getItem("pb-favs") || "[]");
  } catch (e) {}
  renderMons();
  loadMons();
  function drawFavs() {
    var s = document.querySelectorAll("#fav .slot");
    s.forEach(function (el, i) {
      el.textContent = favs[i] || "";
    });
  }
  drawFavs();

  // carrossel
  document.querySelectorAll(".arrow").forEach(function (a) {
    a.onclick = function () {
      var t = $("#track");
      t.scrollBy({
        left: a.dataset.dir * (t.clientWidth * 0.8),
        behavior: "smooth",
      });
    };
  });

  // menu, pesquisa e simulador
  $("#burger").onclick = function () {
    var n = $("#nav"),
      o = n.classList.toggle("open");
    this.setAttribute("aria-expanded", o);
  };
  var q = $("#q");
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
  q.oninput = function () {
    if (location.hash !== "#pokedex") location.hash = "#pokedex";
    filter();
  };
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

  // rotas por hash
  var names = ["inicio", "pokedex", "competitivo", "simulador"];
  function route() {
    var h = (location.hash || "#inicio").slice(1);
    if (names.indexOf(h) < 0) h = "inicio";
    names.forEach(function (n) {
      $("#v-" + n).classList.toggle("on", n === h);
    });
    document.querySelectorAll(".tab").forEach(function (t) {
      t.getAttribute("href") === "#" + h
        ? t.setAttribute("aria-current", "page")
        : t.removeAttribute("aria-current");
    });
    $("#nav").classList.remove("open");
  }
  window.addEventListener("hashchange", route);
  route();

  // abertura: 5 s (contorno 0-2,3 s, cor 2,3-3,3 s, logo voa ao cabeçalho 3,5-4,5 s, página 5 s)
  var bg = $("#introbg"),
    fly = $("#fly"),
    ended = false;
  function end() {
    if (ended) return;
    ended = true;
    [bg, fly, $("#skip")].forEach(function (e) {
      e.style.display = "none";
    });
    body.classList.remove("intro");
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    end();
    return;
  }
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
  setTimeout(end, 5000);
  $("#skip").onclick = end;
})();
