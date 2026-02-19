/* ── HAMBURGER TOGGLE — add this inside your existing <script> block
   or paste it just before the closing </script> tag in index.html ── */

(function () {
    var toggle  = document.getElementById('navToggle');
    var navList = document.getElementById('navList');

    if (!toggle || !navList) return;

    /* Open / close the menu when the hamburger is clicked */
    toggle.addEventListener('click', function () {
        var isOpen = navList.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    /* Close the menu automatically when a nav button is clicked
       (so the page doesn't stay open after the user navigates) */
    navList.querySelectorAll('.nav-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            navList.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
        if (!toggle.contains(e.target) && !navList.contains(e.target)) {
            navList.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            navList.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.focus();
        }
    });
})();