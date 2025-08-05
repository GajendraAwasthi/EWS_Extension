// EdgeSuggestAI: Fetches real-time suggestions from Google Suggest API

(function () {
  if (window.hasRunEdgeSuggestAI) return;
  window.hasRunEdgeSuggestAI = true;

  // Utility: Find search box
  function getSearchBox() {
    const url = location.hostname;
    // Google
    if (url.includes('google.com')) return document.querySelector('input[name="q"]');
    // Bing
    if (url.includes('bing.com')) return document.querySelector('input[name="q"]');
    // DuckDuckGo
    if (url.includes('duckduckgo.com')) return document.querySelector('input[name="q"]');
    return null;
  }

  // Create dropdown
  let dropdown = document.createElement('div');
  dropdown.className = 'edge-suggestai-dropdown';
  dropdown.style.display = 'none';
  document.body.appendChild(dropdown);

  // Fetch suggestions from Google Suggest API
  async function fetchSuggestions(q) {
    if (!q) return [];
    try {
      const res = await fetch(
        "https://suggestqueries.google.com/complete/search?client=firefox&q=" + encodeURIComponent(q)
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[1])) return data[1];
      return [];
    } catch (e) {
      return [];
    }
  }

  // Show dropdown
  function showDropdown(suggestions, inputBox) {
    if (!suggestions.length) {
      dropdown.style.display = 'none';
      return;
    }
    dropdown.innerHTML = '';
    suggestions.forEach((s, idx) => {
      let el = document.createElement('div');
      el.className = 'edge-suggestai-suggestion';
      el.textContent = s;
      el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        inputBox.value = s;
        dropdown.style.display = 'none';
        inputBox.focus();
      });
      dropdown.appendChild(el);
    });
    // Position dropdown
    const rect = inputBox.getBoundingClientRect();
    dropdown.style.left = rect.left + window.scrollX + 'px';
    dropdown.style.top = rect.bottom + window.scrollY + 'px';
    dropdown.style.width = rect.width + 'px';
    dropdown.style.display = 'block';
  }

  function hideDropdown() { dropdown.style.display = 'none'; }

  // Keyboard navigation support
  let selectedIdx = -1;
  function handleKey(e, suggestions, inputBox) {
    if (dropdown.style.display !== 'block') return;
    if (e.key === 'ArrowDown') {
      selectedIdx = Math.min(selectedIdx + 1, suggestions.length - 1);
      updateActive();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateActive();
      e.preventDefault();
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      inputBox.value = suggestions[selectedIdx];
      hideDropdown();
      selectedIdx = -1;
      e.preventDefault();
    }
  }
  function updateActive() {
    const items = dropdown.querySelectorAll('.edge-suggestai-suggestion');
    items.forEach((el, i) => {
      el.classList.toggle('edge-suggestai-active', i === selectedIdx);
    });
  }

  // Attach listeners to input box
  function attach() {
    const inputBox = getSearchBox();
    if (!inputBox) return;

    let lastVal = '';
    inputBox.setAttribute('autocomplete', 'off');
    inputBox.addEventListener('input', async function () {
      const val = inputBox.value;
      if (!val || val === lastVal) {
        hideDropdown();
        return;
      }
      lastVal = val;
      const suggestions = await fetchSuggestions(val);
      selectedIdx = -1;
      showDropdown(suggestions, inputBox);

      inputBox.onkeydown = function (ev) {
        handleKey(ev, suggestions, inputBox);
      };
    });

    inputBox.addEventListener('blur', function () {
      setTimeout(hideDropdown, 100);
    });
    window.addEventListener('beforeunload', hideDropdown);
  }

  // Wait for input box to be available
  function waitForBox() {
    const b = getSearchBox();
    if (b) attach();
    else setTimeout(waitForBox, 400);
  }
  waitForBox();

})();