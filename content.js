// EdgeSuggestAI Internet Suggestion MVP

(function() {
  if (window.hasRunEdgeSuggestAI) return;
  window.hasRunEdgeSuggestAI = true;

  function getSearchBox() {
    const url = location.hostname;
    if (url.includes('google.com')) return document.querySelector('input[name="q"]');
    if (url.includes('bing.com')) return document.querySelector('input[name="q"]');
    if (url.includes('duckduckgo.com')) return document.querySelector('input[name="q"]');
    return null;
  }

  let dropdown = document.createElement('div');
  dropdown.className = 'edge-suggestai-dropdown';
  dropdown.style.display = 'none';
  document.body.appendChild(dropdown);

  // Suggestion API fetch (Google by default)
  async function fetchSuggestions(q) {
    if (!q) return [];
    try {
      const res = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      return data[1] || [];
    } catch (e) { return []; }
  }

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
      el.addEventListener('mousedown', function(e) {
        e.preventDefault();
        inputBox.value = s;
        dropdown.style.display = 'none';
        inputBox.focus();
      });
      dropdown.appendChild(el);
    });
    const rect = inputBox.getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.width = rect.width + 'px';
    dropdown.style.display = 'block';
  }

  function hideDropdown() { dropdown.style.display = 'none'; }
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

  function attach() {
    const inputBox = getSearchBox();
    if (!inputBox) return;

    let lastVal = '';
    let lastFetch = null;

    inputBox.setAttribute('autocomplete', 'off');
    inputBox.addEventListener('input', async function() {
      const val = inputBox.value;
      if (!val || val === lastVal) {
        hideDropdown();
        return;
      }
      lastVal = val;
      const suggestions = await fetchSuggestions(val);
      selectedIdx = -1;
      showDropdown(suggestions, inputBox);
      inputBox.onkeydown = function(ev) {
        handleKey(ev, suggestions, inputBox);
      };
    });
    inputBox.addEventListener('blur', function() {
      setTimeout(hideDropdown, 100);
    });
    window.addEventListener('beforeunload', hideDropdown);
  }

  function waitForBox() {
    const b = getSearchBox();
    if (b) attach();
    else setTimeout(waitForBox, 600);
  }
  waitForBox();

})();