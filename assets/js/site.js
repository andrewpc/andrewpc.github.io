// Small progressive enhancements. Everything still works without JS.
(function () {
  var root = document.documentElement;

  // Theme toggle
  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  });

  // Code blocks: language label + copy button
  document.querySelectorAll('.prose div.highlighter-rouge').forEach(function (block) {
    var m = block.className.match(/language-([\w+-]+)/);
    var lang = m ? m[1] : 'text';
    if (lang === 'plaintext') lang = 'text';
    var wrap = document.createElement('div');
    wrap.className = 'code-block';
    var head = document.createElement('div');
    head.className = 'code-head';
    head.innerHTML = '<span class="code-lang"></span><button type="button" class="copy-btn">Copy</button>';
    head.querySelector('.code-lang').textContent = lang;
    block.parentNode.insertBefore(wrap, block);
    wrap.appendChild(head);
    wrap.appendChild(block);
    var btn = head.querySelector('.copy-btn');
    btn.addEventListener('click', function () {
      var code = block.querySelector('code');
      var text = code ? code.innerText : block.innerText;
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text.replace(/\n$/, '')).then(done, function () {});
    });
  });

  // Heading anchors + table of contents
  var headings = Array.prototype.slice.call(document.querySelectorAll('.post .prose h2[id], .post .prose h3[id]'));
  headings.forEach(function (h) {
    var a = document.createElement('a');
    a.className = 'anchor';
    a.href = '#' + h.id;
    a.setAttribute('aria-label', 'Link to this section');
    a.textContent = '#';
    h.appendChild(a);
  });
  var toc = document.querySelector('.toc');
  if (toc && headings.length >= 3) {
    var list = toc.querySelector('ol');
    var links = headings.map(function (h) {
      var li = document.createElement('li');
      li.className = 'toc-' + h.tagName.toLowerCase();
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.replace(/#$/, '');
      li.appendChild(a);
      list.appendChild(li);
      return a;
    });
    toc.hidden = false;
    if ('IntersectionObserver' in window) {
      var visible = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
        var current = null;
        for (var i = 0; i < headings.length; i++) {
          if (headings[i].getBoundingClientRect().top < 140) current = i;
        }
        links.forEach(function (l, i) { l.classList.toggle('active', i === current); });
      }, { rootMargin: '0px 0px -70% 0px' });
      headings.forEach(function (h) { io.observe(h); });
    }
  }

  // Reading progress bar
  var bar = document.querySelector('.progress span');
  var article = document.querySelector('.post .prose');
  if (bar && article) {
    var onScroll = function () {
      var r = article.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      bar.style.width = (p * 100).toFixed(1) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Category filter on the home page
  var chips = document.querySelectorAll('.filters .chip');
  var cards = document.querySelectorAll('.card-grid .card');
  var applyFilter = function (f) {
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === f)); });
    cards.forEach(function (card) { card.hidden = !(f === 'all' || card.dataset.category === f); });
  };
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      applyFilter(chip.dataset.filter);
      var url = new URL(location.href);
      if (chip.dataset.filter === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', chip.dataset.filter);
      history.replaceState(null, '', url);
    });
  });
  if (chips.length) {
    var initial = new URLSearchParams(location.search).get('category');
    if (initial && document.querySelector('.chip[data-filter="' + CSS.escape(initial) + '"]')) applyFilter(initial);
  }

  // Search (press / or click the search button)
  var modal = document.querySelector('.search');
  if (!modal) return;
  var input = modal.querySelector('input');
  var results = modal.querySelector('.search-results');
  var index = null;
  var selected = -1;
  var esc = function (s) { return s.replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  var highlight = function (text, terms) {
    var out = esc(text);
    terms.forEach(function (t) {
      out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    });
    return out;
  };
  var snippet = function (post, terms) {
    var body = post.content;
    var lower = body.toLowerCase();
    var at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = lower.indexOf(terms[i]);
    if (at < 0) return post.description;
    var start = Math.max(0, at - 60);
    return (start > 0 ? '…' : '') + body.slice(start, at + 120) + '…';
  };
  var render = function () {
    var q = input.value.trim().toLowerCase();
    selected = -1;
    if (!q || !index) { results.innerHTML = ''; return; }
    var terms = q.split(/\s+/).filter(Boolean);
    var scored = index.map(function (p) {
      var hay = { title: p.title.toLowerCase(), tags: p.tags.join(' ').toLowerCase(), desc: p.description.toLowerCase(), body: p.content.toLowerCase() };
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i], s = 0;
        if (hay.title.indexOf(t) >= 0) s += 10;
        if (hay.tags.indexOf(t) >= 0) s += 6;
        if (hay.desc.indexOf(t) >= 0) s += 4;
        if (hay.body.indexOf(t) >= 0) s += 1;
        if (!s) return null;
        score += s;
      }
      return { p: p, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; });
    if (!scored.length) { results.innerHTML = '<li class="search-empty">No posts match “' + esc(q) + '”.</li>'; return; }
    results.innerHTML = scored.slice(0, 8).map(function (r) {
      return '<li><a href="' + r.p.url + '"><strong>' + highlight(r.p.title, terms) + '</strong><small>' + esc(r.p.date) + ' · ' + highlight(snippet(r.p, terms), terms) + '</small></a></li>';
    }).join('');
  };
  var open = function () {
    modal.hidden = false;
    input.focus();
    input.select();
    if (!index) {
      fetch(results.dataset.index).then(function (r) { return r.json(); }).then(function (d) { index = d; render(); }).catch(function () {});
    }
  };
  var close = function () { modal.hidden = true; };
  document.querySelectorAll('.search-open').forEach(function (b) { b.addEventListener('click', open); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  input.addEventListener('input', render);
  document.addEventListener('keydown', function (e) {
    var typing = /input|textarea|select/i.test((e.target.tagName || '')) || e.target.isContentEditable;
    if (modal.hidden) {
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); open(); }
      return;
    }
    var items = results.querySelectorAll('a');
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      selected = (selected + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (a, i) { a.classList.toggle('selected', i === selected); });
      items[selected].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && items.length) {
      e.preventDefault();
      location.href = items[Math.max(0, selected)].href;
    }
  });
})();
