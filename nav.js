// Shared navigation bar for all tools pages
(function() {
    var pages = [
        { name: '+ Add', href: 'FastCopy.html', param: 'add', icon: '' },
        { name: 'List', href: 'FastCopy.html', param: 'list', icon: '&#128203;' },
        { name: 'ID Generator', href: 'IDGenerator.html', param: '', icon: '' }
    ];

    var currentFile = window.location.pathname.split('/').pop() || 'index.html';

    var navStyle = document.createElement('style');
    navStyle.textContent = [
        '.shared-nav { display:flex; gap:10px; justify-content:center; flex-wrap:wrap;',
        '  position:sticky; top:0; z-index:100; padding:12px 10px;',
        '  background:linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);',
        '  margin-bottom:20px; position:relative; }',
        '.shared-nav a, .shared-nav button { padding:10px 20px; border-radius:8px; text-decoration:none;',
        '  font-size:0.9rem; font-weight:600; cursor:pointer; border:2px solid transparent;',
        '  transition:all 0.2s; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); }',
        '.shared-nav a:hover, .shared-nav button:hover { background:rgba(255,255,255,0.15); color:#fff; }',
        '.shared-nav a.active, .shared-nav button.active { background:#fff; color:#203a43; }',
        '.shared-nav .version { position:absolute; bottom:4px; right:10px;',
        '  font-size:0.65rem; color:rgba(255,255,255,0.35); pointer-events:none; }'
    ].join('\n');
    document.head.appendChild(navStyle);

    var nav = document.createElement('div');
    nav.className = 'shared-nav';

    pages.forEach(function(page) {
        var isCurrentPage = (currentFile === page.href);

        if (isCurrentPage && page.param) {
            // Same page sub-navigation: use button with onclick
            var btn = document.createElement('button');
            btn.id = 'nav' + page.param.charAt(0).toUpperCase() + page.param.slice(1);
            btn.innerHTML = (page.icon ? page.icon + ' ' : '') + page.name;
            btn.setAttribute('onclick', "showPage('" + page.param + "')");
            // Default active state for list
            if (page.param === 'list') btn.className = 'active';
            nav.appendChild(btn);
        } else if (isCurrentPage && !page.param) {
            // Current page with no sub-param (e.g. IDGenerator)
            var btn = document.createElement('button');
            btn.innerHTML = (page.icon ? page.icon + ' ' : '') + page.name;
            btn.className = 'active';
            nav.appendChild(btn);
        } else {
            // Link to another page
            var a = document.createElement('a');
            a.href = page.href + (page.param ? '?page=' + page.param : '');
            a.innerHTML = (page.icon ? page.icon + ' ' : '') + page.name;
            nav.appendChild(a);
        }
    });

    document.body.insertBefore(nav, document.body.firstChild);

    // Version number
    var version = document.createElement('span');
    version.className = 'version';
    version.textContent = 'v1.0.3';
    nav.appendChild(version);
})();
