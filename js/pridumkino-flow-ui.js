/**
 * UI-хелперы потока Придумкино
 */
(function (global) {
  const P = () => global.PridumkinoProto;

  function renderFlowChrome(root, themeId, options) {
    const meta = P().THEME_META[themeId];
    const state = P().loadState();
    root.innerHTML = `
      <div class="pk-flow__top">
        <nav class="pk-flow__nav">
          <a href="${P().tourUrl("map.html")}">Районы</a>
          <span>Кодекс СоздАния</span>
          <span>Рейтинг героев</span>
          <span>Квартал родителей</span>
        </nav>
        <span class="pk-points">${state.totalPoints} БАЛЛОВ</span>
      </div>
      <div class="pk-flow__crumb">
        <a href="${P().tourUrl("map.html")}">Главная</a> &gt;
        <a href="${P().tourUrl("district-pridumkino.html")}">Придумкино</a> &gt;
        ${meta.title}
      </div>
      <div class="pk-flow__hero">
        <h1>${meta.title}</h1>
        <p>Здесь ты можешь всё! Яркие штрихи, неожиданные цвета, смелые решения — твой рисунок расскажет историю, которую никто не видел. Давай, у тебя всё получится!</p>
      </div>
    `;
  }

  function renderStepper(container, steps, activeIndex) {
    const parts = steps.map((label, i) => {
      const done = i < activeIndex;
      const active = i === activeIndex;
      let stateClass = "pk-step--upcoming";
      if (done) stateClass = "pk-step--done";
      else if (active) stateClass = "pk-step--active";

      const iconContent = done ? "✓" : String(i + 1);

      return `
        <div class="pk-step ${stateClass}">
          <div class="pk-step__icon">${iconContent}</div>
          <div class="pk-step__label">${label}</div>
        </div>
      `;
    });

    const withConnectors = [];
    parts.forEach((part, i) => {
      withConnectors.push(part);
      if (i < parts.length - 1) {
        withConnectors.push('<div class="pk-step__connector" aria-hidden="true"></div>');
      }
    });

    container.className = "pk-stepper";
    container.innerHTML = withConnectors.join("");
  }

  const COLOR_STEPS = ["Выбери картинку", "Раскрась картинку", "Сделай граффити"];
  const UPLOAD_STEPS = ["Загрузи рисунок", "Раскрась картинку", "Сделай граффити"];

  function getSteps(method) {
    return method === "upload" ? UPLOAD_STEPS : COLOR_STEPS;
  }

  function flowFooter() {
    return `
      <footer class="pk-flow__footer">
        <span>© 2026 ПАО «МТС». Все права защищены</span>
        <a href="prize-rules.html">Правила</a>
      </footer>
    `;
  }

  global.PridumkinoFlowUI = {
    renderFlowChrome,
    renderStepper,
    getSteps,
    flowFooter,
    COLOR_STEPS
  };
})(window);
