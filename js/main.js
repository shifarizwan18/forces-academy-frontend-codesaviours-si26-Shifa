/* ==========================================================
   MAIN.JS — Animated Stats Counter
   Cards are ALWAYS visible via CSS (see home.css). This script
   only handles the number count-up, triggered the first time
   the stats section scrolls into view.
========================================================== */

document.addEventListener('DOMContentLoaded', function () {

    var statsSection = document.querySelector('.fa-stats');
    if (!statsSection) return;

    var counters = statsSection.querySelectorAll('.fa-stat-number');
    var DURATION = 2000; // ms — count up over 2 seconds
    var hasAnimated = false;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setFinalNumbers() {
        counters.forEach(function (el) {
            var target = parseFloat(el.getAttribute('data-target'));
            var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            el.firstChild.textContent = target.toFixed(decimals);
        });
    }

    function animateCounter(el) {
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
    }

    function runCount() {
        if (hasAnimated) return;
        hasAnimated = true;

        if (prefersReducedMotion) {
            setFinalNumbers();
            return;
        }
        counters.forEach(animateCounter);
    }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    runCount();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(statsSection);
    } else {
        runCount();
    }

    // Safety net: no matter what happens with the observer, make sure
    // the numbers show their final values within 4 seconds.
    setTimeout(function () {
        if (!hasAnimated) setFinalNumbers();
    }, 4000);

    /* ==========================================================
       BACK TO TOP BUTTON
       Shows after 300px of scroll, hides at the top. Click
       smooth-scrolls back to the very top of the page.
    ========================================================== */

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

});