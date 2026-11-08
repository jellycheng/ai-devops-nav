(function () {
  const PALETTE = [
    "#3b6cf4",
    "#7c3aed",
    "#db2777",
    "#ea580c",
    "#059669",
    "#0891b2",
  ];

  function hashColor(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return PALETTE[Math.abs(h) % PALETTE.length];
  }

  const FILTER_ALL = "全部";
  const UNGROUPED_CODE = "ungrouped";
  const UNGROUPED_NAME = "未分组";

  /** 分组展示顺序（与 group_code 对应） */
  const GROUP_DISPLAY_ORDER = [
    "ai-coding",
    "java",
    "go",
    "python",
    "full-frontend",
    "database",
    "bigdata",
    "middleware",
    "container",
    "registry-config",
    "cicd",
    "iac",
    "api-gateway",
    "service-mesh",
    "artifacts",
    "cloud",
    "observability",
    "qa",
    "tools",
    "code-hosting",
    "learning",
    "community",
    "productivity",
  ];

  function groupCode(site) {
    const c = (site.group_code || "").trim();
    return c || UNGROUPED_CODE;
  }

  function groupName(site) {
    const n = (site.group_name || "").trim();
    return n || UNGROUPED_NAME;
  }

  function sortGroupMeta(a, b) {
    if (a.code === UNGROUPED_CODE) return 1;
    if (b.code === UNGROUPED_CODE) return -1;
    const ia = GROUP_DISPLAY_ORDER.indexOf(a.code);
    const ib = GROUP_DISPLAY_ORDER.indexOf(b.code);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.name.localeCompare(b.name, "zh");
  }

  /** @returns {{ code: string, name: string }[]} */
  function collectGroups(sites) {
    const map = new Map();
    sites.forEach((s) => {
      const code = groupCode(s);
      if (!map.has(code)) map.set(code, groupName(s));
    });
    return Array.from(map, ([code, name]) => ({ code, name })).sort(
      sortGroupMeta
    );
  }

  function groupSites(sites) {
    const map = new Map();
    sites.forEach((s) => {
      const c = groupCode(s);
      if (!map.has(c)) map.set(c, []);
      map.get(c).push(s);
    });
    return map;
  }

  function matchesQuery(site, q) {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      site.title.toLowerCase().includes(needle) ||
      site.description.toLowerCase().includes(needle) ||
      site.url.toLowerCase().includes(needle)
    );
  }

  function renderLogo(site) {
    const wrap = document.createElement("div");
    wrap.className = "logo-wrap";

    if (site.logo) {
      const img = document.createElement("img");
      img.src = site.logo;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.onerror = () => {
        img.remove();
        wrap.appendChild(renderFallback(site.title));
      };
      wrap.appendChild(img);
    } else {
      wrap.appendChild(renderFallback(site.title));
    }
    return wrap;
  }

  function renderFallback(title) {
    const el = document.createElement("div");
    el.className = "logo-fallback";
    el.style.background = hashColor(title || "?");
    el.textContent = (title || "?").trim().charAt(0).toUpperCase();
    return el;
  }

  function syncDescToggle(descEl, toggleBtn) {
    if (descEl.classList.contains("is-expanded")) return;
    const truncated = descEl.scrollHeight > descEl.clientHeight + 1;
    toggleBtn.hidden = !truncated;
  }

  function syncTitleToggle(titleEl, toggleBtn) {
    if (titleEl.classList.contains("is-expanded")) return;
    const truncated = titleEl.scrollWidth > titleEl.clientWidth + 1;
    toggleBtn.hidden = !truncated;
  }

  function bindTextToggle(targetEl, toggleBtn, onSync) {
    toggleBtn.type = "button";
    toggleBtn.className = "text-toggle";
    toggleBtn.textContent = "展开";
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const expanded = targetEl.classList.toggle("is-expanded");
      toggleBtn.textContent = expanded ? "收起" : "展开";
      toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      if (!expanded) onSync(targetEl, toggleBtn);
    });
  }

  function createCard(site) {
    const card = document.createElement("a");
    card.className = "card";
    card.href = site.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.dataset.id = site.id;

    const top = document.createElement("div");
    top.className = "card-top";
    top.title = site.title;
    top.appendChild(renderLogo(site));

    const text = document.createElement("div");
    text.className = "card-text";

    const titleRow = document.createElement("div");
    titleRow.className = "card-title-row";

    const h3 = document.createElement("h3");
    h3.className = "card-title";
    h3.textContent = site.title;
    h3.title = site.title;

    const titleToggle = document.createElement("button");
    bindTextToggle(h3, titleToggle, syncTitleToggle);

    titleRow.appendChild(h3);
    titleRow.appendChild(titleToggle);

    const descWrap = document.createElement("div");
    descWrap.className = "card-desc-wrap";

    const desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = site.description;
    desc.title = site.description;

    const descToggle = document.createElement("button");
    bindTextToggle(desc, descToggle, syncDescToggle);

    descWrap.appendChild(desc);
    descWrap.appendChild(descToggle);

    text.appendChild(titleRow);
    text.appendChild(descWrap);

    requestAnimationFrame(() => {
      syncTitleToggle(h3, titleToggle);
      syncDescToggle(desc, descToggle);
    });
    top.appendChild(text);
    card.appendChild(top);

    const urlRow = document.createElement("div");
    urlRow.className = "card-url-row";

    const urlSpan = document.createElement("span");
    urlSpan.className = "card-url";
    urlSpan.textContent = site.url;
    urlSpan.title = site.url;

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "复制";
    copyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      copyUrl(site.url, copyBtn);
    });

    urlRow.appendChild(urlSpan);
    urlRow.appendChild(copyBtn);
    card.appendChild(urlRow);

    return card;
  }

  async function copyUrl(url, btn) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      btn.textContent = "已复制";
      btn.classList.add("is-done");
      setTimeout(() => {
        btn.textContent = "复制";
        btn.classList.remove("is-done");
      }, 1600);
    } catch {
      btn.textContent = "失败";
      setTimeout(() => {
        btn.textContent = "复制";
      }, 1600);
    }
  }

  function init() {
    const sites = window.NAV_SITES || [];
    const sectionsEl = document.getElementById("card-sections");
    const searchInput = document.getElementById("search");
    const filtersEl = document.getElementById("filters");
    const statsEl = document.getElementById("stats");

    const groups = collectGroups(sites);
    const validCodes = new Set(groups.map((g) => g.code));

    function groupFromHash() {
      const raw = location.hash.replace(/^#/, "").trim();
      if (!raw) return FILTER_ALL;
      const code = decodeURIComponent(raw);
      return validCodes.has(code) ? code : FILTER_ALL;
    }

    function updateGroupHash(code) {
      const base = location.pathname + location.search;
      if (code === FILTER_ALL) {
        history.replaceState(null, "", base);
        return;
      }
      history.replaceState(null, "", `${base}#${encodeURIComponent(code)}`);
    }

    let activeGroup = groupFromHash();

    function scrollToGroup(code) {
      if (code === FILTER_ALL) return;
      requestAnimationFrame(() => {
        const block = sectionsEl.querySelector(
          `[data-group-code="${code}"]`
        );
        if (block) {
          block.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    function selectGroup(code) {
      activeGroup = code;
      updateGroupHash(code);
      renderFilters();
      renderCards();
    }

    function renderFilters() {
      filtersEl.innerHTML = "";
      const items = [{ code: FILTER_ALL, name: FILTER_ALL }, ...groups];
      items.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "filter-btn" + (item.code === activeGroup ? " is-active" : "");
        btn.textContent = item.name;
        btn.dataset.groupCode = item.code;
        btn.addEventListener("click", () => {
          selectGroup(item.code);
        });
        filtersEl.appendChild(btn);
      });
    }

    function renderCards() {
      const q = searchInput.value.trim();
      const filtered = sites.filter((s) => {
        if (activeGroup !== FILTER_ALL && groupCode(s) !== activeGroup) {
          return false;
        }
        return matchesQuery(s, q);
      });

      sectionsEl.innerHTML = "";
      const categoryTotal = collectGroups(sites).length;
      statsEl.textContent = `精选 ${sites.length} 个站点，分 ${categoryTotal} 类整理，当前显示 ${filtered.length} 个。`;

      if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "没有匹配的导航项，试试更换关键词或分组。";
        sectionsEl.appendChild(empty);
        return;
      }

      const byGroup = groupSites(filtered);
      const allGroupOrder = collectGroups(sites);
      const nameByCode = new Map(
        allGroupOrder.map((g) => [g.code, g.name])
      );
      const order =
        activeGroup === FILTER_ALL
          ? allGroupOrder.map((g) => g.code).filter((code) => byGroup.has(code))
          : [activeGroup];

      order.forEach((code) => {
        const items = byGroup.get(code);
        if (!items || !items.length) return;

        const block = document.createElement("section");
        block.className = "group-block";
        block.id = code;
        block.dataset.groupCode = code;
        block.setAttribute("aria-labelledby", `group-title-${code}`);

        const header = document.createElement("header");
        header.className = "group-header";

        const title = document.createElement("h2");
        title.className = "group-title";
        title.id = `group-title-${code}`;
        title.textContent = nameByCode.get(code) || UNGROUPED_NAME;

        const count = document.createElement("span");
        count.className = "group-count";
        count.textContent = String(items.length);

        header.appendChild(title);
        header.appendChild(count);

        const grid = document.createElement("div");
        grid.className = "grid";
        items.forEach((site) => grid.appendChild(createCard(site)));

        block.appendChild(header);
        block.appendChild(grid);
        sectionsEl.appendChild(block);
      });

      if (activeGroup !== FILTER_ALL) {
        scrollToGroup(activeGroup);
      }
    }

    searchInput.addEventListener("input", renderCards);

    window.addEventListener("hashchange", () => {
      const next = groupFromHash();
      if (next === activeGroup) return;
      activeGroup = next;
      renderFilters();
      renderCards();
    });

    renderFilters();
    renderCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
