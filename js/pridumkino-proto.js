/**
 * Прототип Придумкино — состояние в localStorage.
 */
(function (global) {
  const STORAGE_KEY = "sozdania_pridumkino_proto_v1";

  const THEMES = ["kosmos", "nauka", "tekhnologiya"];

  const LEGACY_THEME_IDS = {
    gorod: "nauka",
    leto: "tekhnologiya"
  };

  const THEME_META = {
    kosmos: {
      id: "kosmos",
      title: "Космос",
      icon: "🪐",
      tagline: "Пусть космос станет таким, каким его видишь только ты",
      colorLabel: "Космос"
    },
    nauka: {
      id: "nauka",
      title: "Наука",
      icon: "🔬",
      tagline: "Открой мир открытий и преврати идеи в настоящие открытия",
      colorLabel: "Наука"
    },
    tekhnologiya: {
      id: "tekhnologiya",
      title: "Технология",
      icon: "🤖",
      tagline: "Создай будущее — роботы, гаджеты и изобретения твоей мечты",
      colorLabel: "Технология"
    }
  };

  const THEME_MURAL_PREVIEW = {
    kosmos: {
      gradient: "linear-gradient(180deg, #312e81 0%, #6366f1 40%, #94a3b8 48%, #e2e8f0 100%)",
      accent: "#818cf8"
    },
    nauka: {
      gradient: "linear-gradient(180deg, #ecfccb 0%, #84cc16 35%, #64748b 42%, #cbd5e1 100%)",
      accent: "#65a30d"
    },
    tekhnologiya: {
      gradient: "linear-gradient(180deg, #0ea5e9 0%, #38bdf8 30%, #94a3b8 38%, #e2e8f0 100%)",
      accent: "#0284c7"
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
    { login: "КосмоВаня", title: "Планета мечты", theme: "kosmos" },
    { login: "МираКрафт", title: "Орбита знаний", theme: "nauka" },
    { login: "ТехноРома", title: "Робот-помощник", theme: "tekhnologiya" },
    { login: "ВикаКодит", title: "Звёздная тропа", theme: "kosmos" },
    { login: "ЛесникАртём", title: "Лаборатория идей", theme: "nauka" },
    { login: "ДашаЛео", title: "Умный дом", theme: "tekhnologiya" },
    { login: "СаняВольт", title: "Комета", theme: "kosmos" },
    { login: "НикаАрт", title: "Микромир", theme: "nauka" },
    { login: "ПолинаСвет", title: "Город будущего", theme: "tekhnologiya" },
    { login: "МаксПикс", title: "Галактика", theme: "kosmos" },
    { login: "ЮляКраск", title: "Формула чуда", theme: "nauka" },
    { login: "КирСмайл", title: "Дрон-мечта", theme: "tekhnologiya" },
    { login: "АняЛуч", title: "Спутник", theme: "kosmos" },
    { login: "ТимКод", title: "Опыт №7", theme: "nauka" },
    { login: "ЛенаХаус", title: "Кибер-скейт", theme: "tekhnologiya" },
    { login: "РомаВолна", title: "НЛО дружбы", theme: "kosmos" },
    { login: "СоняНебо", title: "Телескоп", theme: "nauka" },
    { login: "ВоваГраф", title: "ИИ-художник", theme: "tekhnologiya" },
    { login: "КатяСад", title: "Станция", theme: "kosmos" },
    { login: "ИльяМур", title: "Химия цвета", theme: "nauka" },
    { login: "МишаЛайн", title: "Голограмма", theme: "tekhnologiya" },
    { login: "ЗояТепло", title: "Марс сегодня", theme: "kosmos" },
    { login: "ГлебОрбит", title: "Клетка жизни", theme: "nauka" },
    { login: "НастяБлок", title: "Прототип мечты", theme: "tekhnologiya" }
  ];

  const POINTS_PER_GENERATION = 30;
  const POINTS_JOINT = 30;
  const SESSION_KEY = "sozdania_pridumkino_session";

  const COLORING_PAGES = {
    kosmos: [{ id: 1, label: "Космос", art: "👽🛸" }],
    nauka: [{ id: 1, label: "Наука", art: "🔬🧪" }],
    tekhnologiya: [{ id: 1, label: "Технология", art: "🤖⚙️" }]
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

  function normalizeThemeId(id) {
    if (!id) return null;
    const key = String(id).trim().toLowerCase();
    if (THEMES.includes(key)) return key;
    if (LEGACY_THEME_IDS[key]) return LEGACY_THEME_IDS[key];
    return null;
  }

  function migrateThemeMap(source) {
    const out = {};
    if (!source || typeof source !== "object") return out;
    Object.keys(source).forEach((key) => {
      const nextId = normalizeThemeId(key);
      if (nextId) out[nextId] = source[key];
    });
    return out;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        completed: migrateThemeMap(parsed.completed),
        jointTitles: migrateThemeMap(parsed.jointTitles)
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
    const id = normalizeThemeId(raw);
    if (id) return id;
    return normalizeThemeId(loadSession().theme);
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
    const theme = normalizeThemeId(themeId);
    if (!theme) {
      return { state: loadState(), isNew: false, ok: false };
    }

    const state = loadState();
    const already = Boolean(state.completed[theme]);
    const prev = state.completed[theme] || {};
    const savedTitle = state.jointTitles?.[theme] || prev.title || "";

    state.completed = { ...state.completed };
    state.completed[theme] = {
      theme,
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
      const session = { ...defaultSession(), ...JSON.parse(raw) };
      session.theme = normalizeThemeId(session.theme);
      return session;
    } catch {
      return defaultSession();
    }
  }

  function saveSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function setSessionTheme(themeId, method) {
    const theme = normalizeThemeId(themeId);
    const s = loadSession();
    s.theme = theme;
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

  function getJointCard(themeId, state) {
    const st = state || loadState();
    const meta = THEME_META[themeId];
    const work = st.completed[themeId] || null;
    const preview = THEME_MURAL_PREVIEW[themeId] || THEME_MURAL_PREVIEW.kosmos;
    const coloring = work?.pictureId
      ? getColoringPages(themeId).find((p) => p.id === work.pictureId)
      : getThemeColoringPage(themeId);

    return {
      themeId,
      meta,
      work,
      ready: Boolean(work),
      title: st.jointTitles?.[themeId] || work?.title || "",
      buildingName: work?.buildingName || "",
      method: work?.method || null,
      coloringLabel: coloring?.label || meta.title,
      coloringArt: coloring?.art || meta.icon,
      preview
    };
  }

  function getJointCards(state) {
    return THEMES.map((id) => getJointCard(id, state));
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
    THEME_MURAL_PREVIEW,
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
    getJointCard,
    getJointCards,
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
