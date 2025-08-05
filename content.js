(function () {
  if (window.edgeSuggestAIInit) return;
  window.edgeSuggestAIInit = true;

  let dropdown = document.createElement('div');
  dropdown.className = 'edge-suggestai-dropdown';
  dropdown.style.display = 'none';
  document.body.appendChild(dropdown);

  let selectedIdx = -1;
  let lastSuggestions = [];
  let attachedInput = null;

  function getSearchBox() {
    // Google, Bing, DuckDuckGo all use input[name="q"]
    return document.querySelector('input[name="q"]:not([data-edge-suggestai])');
  }

  function fetchSuggestions(q) {
    if (!q) return Promise.resolve([]);
    return fetch(
      "https://suggestqueries.google.com/complete/search?client=firefox&q=" + encodeURIComponent(q)
    ).then(res => res.ok ? res.json() : []).then(data => Array.isArray(data) && Array.isArray(data[1]) ? data[1] : []).catch(() => []);
  }

  function showDropdown(suggestions, inputBox) {
    if (!suggestions.length) {
      dropdown.style.display = 'none';
      return;
    }
    lastSuggestions = suggestions;
    selectedIdx = -1;
    dropdown.innerHTML = '';
    suggestions.forEach((s, idx) => {
      let el = document.createElement('div');
      el.className = 'edge-suggestai-suggestion';
      el.textContent = s;
      el.dataset.idx = idx;
      el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        inputBox.value = s;
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));
        hideDropdown();
        inputBox.focus();
      });
      dropdown.appendChild(el);
    });
    // Position dropdown
    const rect = inputBox.getBoundingClientRect();
    dropdown.style.left = rect.left + window.scrollX + 'px';
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.width = rect.width + 'px';
    dropdown.style.display = 'block';
  }

  function hideDropdown() {
    dropdown.style.display = 'none';
    selectedIdx = -1;
    lastSuggestions = [];
  }

  function updateActive() {
    const items = dropdown.querySelectorAll('.edge-suggestai-suggestion');
    items.forEach((el, i) => {
      el.classList.toggle('edge-suggestai-active', i === selectedIdx);
    });
  }

  function handleKeyDown(e, inputBox) {
    if (dropdown.style.display !== 'block') return;
    const items = dropdown.querySelectorAll('.edge-suggestai-suggestion');
    if (e.key === 'ArrowDown') {
      selectedIdx = Math.min(selectedIdx + 1, lastSuggestions.length - 1);
      updateActive();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateActive();
      e.preventDefault();
    } else if (e.key === 'Enter' && selectedIdx >= 0 && lastSuggestions[selectedIdx]) {
      inputBox.value = lastSuggestions[selectedIdx];
      inputBox.dispatchEvent(new Event('input', { bubbles: true }));
      hideDropdown();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      hideDropdown();
      e.preventDefault();
    }
  }

  function attachToInput(inputBox) {
    if (!inputBox || inputBox.dataset.edgeSuggestai === "1") return;
    inputBox.dataset.edgeSuggestai = "1";
    inputBox.setAttribute('autocomplete', 'off');
    inputBox.setAttribute('aria-autocomplete', 'list');

    inputBox.addEventListener('input', function () {
      const val = inputBox.value;
      if (!val) {
        hideDropdown();
        return;
      }
      fetchSuggestions(val).then(suggestions => {
        showDropdown(suggestions, inputBox);
      });
    });

    inputBox.addEventListener('keydown', function (e) {
      handleKeyDown(e, inputBox);
    });

    inputBox.addEventListener('blur', function () {
      setTimeout(hideDropdown, 100);
    });

    attachedInput = inputBox;
  }

  // Attach to new search box if present (including after SPA navigation)
  const observer = new MutationObserver(() => {
    const box = getSearchBox();
    if (box) attachToInput(box);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial attach at load
  document.addEventListener('DOMContentLoaded', () => {
    const box = getSearchBox();
    if (box) attachToInput(box);
  });
  // Also run on script load in case DOMContentLoaded already fired
  setTimeout(() => {
    const box = getSearchBox();
    if (box) attachToInput(box);
  }, 1000);

  // Clean up dropdown on navigation
  window.addEventListener('beforeunload', hideDropdown);
})();