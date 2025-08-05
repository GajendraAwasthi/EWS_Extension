// EdgeSuggestAI: Cross-browser, robust real-time suggestion overlay

(function () {
  if (window.hasRunEdgeSuggestAI) return;
  window.hasRunEdgeSuggestAI = true;

  // Helper: get search box for all major search engines
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

  // Helper: Wait for the search box to appear (useful for SPA navigation)
  function waitForSearchBox(cb) {
    let lastBox = null;
    function check() {
      const box = getSearchBox();
      if (box && box !== lastBox) {
        lastBox = box;
        cb(box);
      }
      setTimeout(check, 500);
    }
    check();
  }

  // Custom dropdown
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

  // Show and position dropdown
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
      el.dataset.idx = idx;
      el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        inputBox.value = s;
        inputBox.dispatchEvent(new Event('input', {bubbles:true}));
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

  function hideDropdown() { dropdown.style.display = 'none'; }

  // Keyboard navigation support
  let selectedIdx = -1;
  function handleKey(e, suggestions, inputBox) {
    if (dropdown.style.display !== 'block') return;
    const items = dropdown.querySelectorAll('.edge-suggestai-suggestion');
    if (e.key === 'ArrowDown') {
      selectedIdx = Math.min(selectedIdx + 1, suggestions.length - 1);
      updateActive(items);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateActive(items);
      e.preventDefault();
    } else if (e.key === 'Enter' && selectedIdx >= 0 && suggestions[selectedIdx]) {
      inputBox.value = suggestions[selectedIdx];
      inputBox.dispatchEvent(new Event('input', {bubbles:true}));
      hideDropdown();
      selectedIdx = -1;
      e.preventDefault();
    } else if (e.key === 'Escape') {
      hideDropdown();
      selectedIdx = -1;
      e.preventDefault();
    }
  }
  function updateActive(items) {
    items.forEach((el, i) => {
      el.classList.toggle('edge-suggestai-active', i === selectedIdx);
    });
  }

  // Main logic: attach handlers to search box
  function setupInput(inputBox) {
    // Prevent double-binding
    if (inputBox.edgeSuggestAIActive) return;
    inputBox.edgeSuggestAIActive = true;

    // Turn off native autocomplete
    inputBox.setAttribute('autocomplete', 'off');
    inputBox.setAttribute('aria-autocomplete', 'list');

    let lastVal = '';
    let debounceTimer = null;

    inputBox.addEventListener('input', function () {
      const val = inputBox.value;
      if (!val || val === lastVal) {
        hideDropdown();
        return;
      }
      lastVal = val;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const suggestions = await fetchSuggestions(val);
        selectedIdx = -1;
        showDropdown(suggestions, inputBox);

        inputBox.onkeydown = function (ev) {
          handleKey(ev, suggestions, inputBox);
        };
      }, 120);
    });

    inputBox.addEventListener('blur', function () {
      setTimeout(hideDropdown, 100);
    });

    // Hide dropdown on navigation
    window.addEventListener('beforeunload', hideDropdown);
  }

  // Start extension: always re-attach to search box (for SPA navigation)
  waitForSearchBox(setupInput);

})();