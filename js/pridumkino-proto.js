/**
 * Прототип Придумкино — состояние в localStorage.
 */
(function (global) {
  const STORAGE_KEY = "sozdania_pridumkino_proto_v1";

  const THEMES = ["gorod", "kosmos", "leto"];

  const THEME_META = {
    gorod: {
      id: "gorod",
      title: "Город",
      icon: "🏙️",
      tagline: "Преврати город в произведение искусства",
      colorLabel: "Город"
    },
    kosmos: {
      id: "kosmos",
      title: "Космос",
      icon: "🪐",
      tagline: "Пусть космос станет таким, каким его видишь только ты",
      colorLabel: "Космос"
    },
    leto: {
      id: "leto",
      title: "Лето",
      icon: "🌻",
      tagline: "Сделай лето таким солнечным, каким оно бывает в твоих мечтах",
      colorLabel: "Лето"
    }
  };

  const BUILDINGS = [
    { id: 1, name: "Дом у парка" },
    { id: 2, name: "Библиотека" },
    { id: 3, name: "Школа" },
    { id: 4, name: "Театр" },
    { id: 5, name: "Музей" },
    { id: 6, name: "Спорткомплекс" },
    { id: 7, name: "Кафе" },
    { id: 8, name: "Вокзал" },
    { id: 9, name: "Башня" },
    { id: 10, name: "Мост" }
  ];

  const MOCK_GALLERY = [
    { login: "КосмоВаня", title: "Радужный закат", theme: "leto" },
    { login: "МираКрафт", title: "Планета мечты", theme: "kosmos" },
    { login: "ТехноРома", title: "Улица идей", theme: "gorod" },
    { login: "ВикаКодит", title: "Солнечный день", theme: "leto" },
    { login: "ЛесникАртём", title: "Космический дом", theme: "kosmos" },
    { login: "ДашаЛео", title: "Город будущего", theme: "gorod" },
    { login: "СаняВольт", title: "Летний ветер", theme: "leto" },
    { login: "НикаАрт", title: "Звёздная тропа", theme: "kosmos" },
    { login: "ПолинаСвет", title: "Домик мечты", theme: "gorod" },
    { login: "МаксПикс", title: "Морской бриз", theme: "leto" },
    { login: "ЮляКраск", title: "Орбита", theme: "kosmos" },
    { login: "КирСмайл", title: "Площадь", theme: "gorod" },
    { login: "АняЛуч", title: "Пикник", theme: "leto" },
    { login: "ТимКод", title: "Галактика", theme: "kosmos" },
    { login: "ЛенаХаус", title: "Переулок", theme: "gorod" },
    { login: "РомаВолна", title: "Каникулы", theme: "leto" },
    { login: "СоняНебо", title: "Комета", theme: "kosmos" },
    { login: "ВоваГраф", title: "Проспект", theme: "gorod" },
    { login: "КатяСад", title: "Сад", theme: "leto" },
    { login: "ИльяМур", title: "Станция", theme: "kosmos" },
    { login: "МишаЛайн", title: "Квартал", theme: "gorod" },
    { login: "ЗояТепло", title: "Озеро", theme: "leto" },
    { login: "ГлебОрбит", title: "Спутник", theme: "kosmos" },
    { login: "НастяБлок", title: "Двор", theme: "gorod" }
  ];

  const POINTS_PER_GENERATION = 30;
  const POINTS_JOINT = 30;
  const SESSION_KEY = "sozdania_pridumkino_session";

  const COLORING_PAGES = {
    gorod: [{ id: 1, label: "Город", art: "🏠🚗" }],
    kosmos: [{ id: 1, label: "Космос", art: "👽🛸" }],
    leto: [{ id: 1, label: "Лето", art: "🏖️☀️" }]
  };

  const PALETTE = [
    "#fde047", "#facc15", "#fb923c", "#f87171", "#ef4444",
    "#c084fc", "#a855f7", "#60a5fa", "#3b82f6", "#34d399",
    "#22c55e", "#86efac", "#f9a8d4", "#fda4af", "#94a3b8", "#1f2937"
  ];

  function defaultState() {
    return {
      completed: {},
      jointTitles: {},
      jointDone: false,
      jointBonusAwarded: false,
      totalPoints: 0,
      myLogin: "МашаКреатив"
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        completed: parsed.completed || {},
        jointTitles: parsed.jointTitles || {}
      };
    } catch {
      return defaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getThemeFromQuery() {
    const raw = new URLSearchParams(location.search).get("theme");
    const id = raw ? String(raw).trim().toLowerCase() : "";
    if (THEMES.includes(id)) return id;
    const sessionTheme = loadSession().theme;
    if (sessionTheme && THEMES.includes(sessionTheme)) return sessionTheme;
    return null;
  }

  function resolveBuildingId(explicitId) {
    const n = Number(explicitId);
    if (Number.isFinite(n) && n > 0) return n;
    const fromSession = Number(loadSession().buildingId);
    if (Number.isFinite(fromSession) && fromSession > 0) return fromSession;
    return null;
  }

  function allThemesDone(state) {
    return THEMES.every((t) => state.completed[t]);
  }

  function completeGeneration(themeId, payload) {
    if (!THEMES.includes(themeId)) {
      return { state: loadState(), isNew: false, ok: false };
    }

    const state = loadState();
    const already = Boolean(state.completed[themeId]);
    const prev = state.completed[themeId] || {};
    const savedTitle = state.jointTitles?.[themeId] || prev.title || "";

    state.completed = { ...state.completed };
    state.completed[themeId] = {
      theme: themeId,
      method: payload.method || prev.method || "color",
      buildingId: payload.buildingId ?? prev.buildingId ?? null,
      buildingName: payload.buildingName || prev.buildingName || "",
      pictureId: payload.pictureId ?? prev.pictureId ?? 1,
      title: savedTitle,
      completedAt: new Date().toISOString()
    };

    if (!already) {
      state.totalPoints += POINTS_PER_GENERATION;
    }

    if (state.jointDone && allThemesDone(state) && !state.jointBonusAwarded) {
      state.totalPoints += POINTS_JOINT;
      state.jointBonusAwarded = true;
    }

    try {
      saveState(state);
    } catch (err) {
      console.error("Не удалось сохранить прогресс Придумкино", err);
      return { state, isNew: false, ok: false };
    }

    return { state, isNew: !already, ok: true };
  }

  function saveJointTitles(titles) {
    const state = loadState();
    if (!state.jointTitles) state.jointTitles = {};

    THEMES.forEach((themeId) => {
      const title = (titles[themeId] || "").trim();
      if (!title) return;
      state.jointTitles[themeId] = title;
      if (state.completed[themeId]) {
        state.completed[themeId].title = title;
      }
    });

    state.jointDone = true;
    if (allThemesDone(state) && !state.jointBonusAwarded) {
      state.totalPoints += POINTS_JOINT;
      state.jointBonusAwarded = true;
    }
    saveState(state);
    return { ok: true, state };
  }

  function resetProto() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getGalleryWorks(state) {
    const mine = THEMES.filter((t) => state.completed[t]).map((t) => {
      const work = state.completed[t];
      return {
        login: state.myLogin,
        title: work.title || "Без названия",
        theme: t,
        buildingName: work.buildingName,
        isMine: true
      };
    });

    return [...mine, ...MOCK_GALLERY.map((w) => ({ ...w, isMine: false }))];
  }

  function defaultSession() {
    return { theme: null, method: null, pictureId: null, buildingId: null };
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return defaultSession();
      return { ...defaultSession(), ...JSON.parse(raw) };
    } catch {
      return defaultSession();
    }
  }

  function saveSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function setSessionTheme(themeId, method) {
    const s = loadSession();
    s.theme = themeId;
    s.method = method;
    s.pictureId = method === "color" ? 1 : null;
    s.buildingId = null;
    saveSession(s);
    return s;
  }

  function getDefaultPictureId() {
    return 1;
  }

  function getThemeColoringPage(themeId) {
    return getColoringPages(themeId)[0] || null;
  }

  function getColoringPages(themeId) {
    return COLORING_PAGES[themeId] || [];
  }

  /** SVG-зоны для прототипа раскраски (6 зон) */
  function getColoringSvg() {
    return `
      <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <rect class="pk-color-zone" data-zone="bg" x="8" y="8" width="304" height="304" rx="12" fill="#fff"/>
        <circle class="pk-color-zone" data-zone="sun" cx="260" cy="56" r="28" fill="#fff"/>
        <ellipse class="pk-color-zone" data-zone="cloud" cx="80" cy="70" rx="40" ry="22" fill="#fff"/>
        <rect class="pk-color-zone" data-zone="house" x="100" y="140" width="120" height="90" rx="4" fill="#fff"/>
        <polygon class="pk-color-zone" data-zone="roof" points="90,140 160,90 230,140" fill="#fff"/>
        <circle class="pk-color-zone" data-zone="planet" cx="70" cy="240" r="32" fill="#fff"/>
        <rect class="pk-color-zone" data-zone="rocket" x="200" y="200" width="36" height="80" rx="8" fill="#fff"/>
      </svg>
    `;
  }

  function isTourMode() {
    return new URLSearchParams(location.search).get("mode") === "tour";
  }

  function tourUrl(href) {
    if (!href || href.startsWith("#") || /^https?:/i.test(href) || href.startsWith("../")) {
      return href;
    }
    const cur = new URLSearchParams(location.search);
    if (cur.get("mode") !== "tour") return href;

    const step = cur.get("step") || "5";
    const [path, query] = href.split("?");
    const next = new URLSearchParams(query || "");
    next.set("mode", "tour");
    next.set("step", step);
    return `${path}?${next.toString()}`;
  }

  function go(href) {
    location.href = tourUrl(href);
  }

  function goReplace(href) {
    location.replace(tourUrl(href));
  }

  function patchTourLinks(root) {
    if (!isTourMode()) return;
    const scope = root || document;
    scope.querySelectorAll("a[href]").forEach((a) => {
      const raw = a.getAttribute("href");
      if (!raw) return;
      const patched = tourUrl(raw);
      if (patched !== raw) a.setAttribute("href", patched);
    });
  }

  global.PridumkinoProto = {
    STORAGE_KEY,
    SESSION_KEY,
    THEMES,
    THEME_META,
    BUILDINGS,
    COLORING_PAGES,
    PALETTE,
    MOCK_GALLERY,
    POINTS_PER_GENERATION,
    POINTS_JOINT,
    loadState,
    saveState,
    loadSession,
    saveSession,
    setSessionTheme,
    getColoringPages,
    getThemeColoringPage,
    getDefaultPictureId,
    getColoringSvg,
    getThemeFromQuery,
    resolveBuildingId,
    allThemesDone,
    completeGeneration,
    saveJointTitles,
    resetProto,
    getGalleryWorks,
    themeLink(base, themeId) {
      return tourUrl(`${base}?theme=${themeId}`);
    },
    isTourMode,
    tourUrl,
    go,
    goReplace,
    patchTourLinks
  };
})(window);
