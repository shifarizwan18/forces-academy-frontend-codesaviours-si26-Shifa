/* ==========================================================
   MAIN.JS — Animated Stats Counter
   Cards fade/slide into view the first time the stats section
   scrolls into the viewport (see home.css for the .in-view
   transition). This script also handles the number count-up,
   triggered at the same moment.
========================================================== */
document.addEventListener('DOMContentLoaded', function () {

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var statsSection = document.querySelector('.fa-stats');

    if (statsSection) {

        var counters = statsSection.querySelectorAll('.fa-stat-number');
        var statCards = statsSection.querySelectorAll('.fa-stat-card');
        var statsGrid = statsSection.querySelector('.fa-stats-grid'); // observe the grid, not the whole section
        var DURATION = 2000; // ms — count up over 2 seconds
        var hasAnimated = false;

        var setFinalNumbers = function () {
            counters.forEach(function (el) {
                var target = parseFloat(el.getAttribute('data-target'));
                var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
                el.firstChild.textContent = target.toFixed(decimals);
            });
        };

        var animateCounter = function (el) {
            var target = parseFloat(el.getAttribute('data-target'));
            var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            var numberNode = el.firstChild; // text node holding the number
            var startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / DURATION, 1);
                var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                var current = eased * target;

                numberNode.textContent = current.toFixed(decimals);

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    numberNode.textContent = target.toFixed(decimals);
                }
            }
            requestAnimationFrame(step);
        };
        var revealCards = function () {
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    statCards.forEach(function (card) {
                        card.classList.add('in-view');
                    });
                });
            });
        };
        var runCount = function () {
            if (hasAnimated) return;
            hasAnimated = true;

            revealCards();

            if (prefersReducedMotion) {
                setFinalNumbers();
                return;
            }
            counters.forEach(animateCounter);
        };

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        runCount();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.3,                 // grid ka kam se kam 30% dikhna chahiye
                rootMargin: '0px 0px -15% 0px'  // viewport ke bottom 15% ko ignore karo, taake trigger thoda deferred ho
            });
            observer.observe(statsGrid || statsSection);
        } else {
            // No IntersectionObserver support — just show everything now.
            runCount();
        }
        setTimeout(function () {
            if (!hasAnimated) {
                revealCards();
                setFinalNumbers();
                hasAnimated = true;
            }
        }, 4000);
    }
    var backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        var SCROLL_SHOW_THRESHOLD = 300;
        var ticking = false; // throttle via requestAnimationFrame

        function updateBackToTopVisibility() {
            if (window.scrollY > SCROLL_SHOW_THRESHOLD) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
            ticking = false;
        }
        // Check immediately in case the page loads already scrolled
        updateBackToTopVisibility();

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updateBackToTopVisibility);
                ticking = true;
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }
    var THEME_KEY = 'fa-theme';
    var root = document.documentElement;
    var toggleBtn = document.getElementById('themeToggle');

    if (toggleBtn) {

        function isDark() {
            return root.classList.contains('dark-mode');
        }

        function setTheme(dark) {
            root.classList.toggle('dark-mode', dark);
            toggleBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
            toggleBtn.setAttribute(
                'aria-label',
                dark ? 'Switch to light mode' : 'Switch to dark mode'
            );
            try {
                localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
            } catch (e) {
                /* localStorage unavailable (private browsing, disabled, etc.)
                   Theme still works for this page load, it just won't persist. */
            }
        }
        // Sync the button's ARIA state with whatever the pre-paint
        // script already decided (localStorage or system preference).
        setTheme(isDark());

        toggleBtn.addEventListener('click', function () {
            setTheme(!isDark());
        });
        var media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', function (e) {
            var saved = null;
            try { saved = localStorage.getItem(THEME_KEY); } catch (err) { /* ignore */ }
            if (saved === null) setTheme(e.matches);
        });
    }

});