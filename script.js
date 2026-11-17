document.addEventListener("DOMContentLoaded", function () {
    const welcomeScreen = document.getElementById("welcome-screen");
    const openBtn = document.getElementById("open-btn");
    const music = document.getElementById("background-music");
    const mainContent = document.getElementById("main-content");
    const playBtn = document.getElementById("play-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const player = document.querySelector(".music-player");
    const progress = document.getElementById("progress");
    const progressBar = document.getElementById("progress-bar");

    const MESSAGE_SCALE = 1;     // tamaño de la letra del mensaje (1 = alto de las fotos)
    const OPEN_DELAY = 2900;     // duración de la animación del sobre (ms)

    // ---------- ABRIR EL SOBRE ----------
    if (openBtn) {
        openBtn.addEventListener("click", function () {
            const env = document.getElementById("envelope");
            if (env.classList.contains("open")) return;
            env.classList.add("open");
            welcomeScreen.classList.add("opening");
            if (music) music.play().catch(function () { syncPlayerState(); });
            setTimeout(function () {
                welcomeScreen.classList.add("hidden");
                mainContent.classList.remove("hidden");
                document.body.classList.remove("welcome-active");
                window.scrollTo(0, 0);
                requestAnimationFrame(fitAll);
            }, OPEN_DELAY);
        });
    }

    // ---------- TÍTULOS QUE SE AJUSTAN AL ANCHO ----------
    function fitTitles() {
        const groups = {};
        document.querySelectorAll("[data-fit]").forEach(function (el) {
            (groups[el.dataset.fit] = groups[el.dataset.fit] || []).push(el);
        });
        Object.keys(groups).forEach(function (name) {
            const list = groups[name];
            let best = Infinity;
            list.forEach(function (el) {
                const parent = el.parentElement;
                const cs = getComputedStyle(parent);
                const avail = (parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * 0.98;
                if (avail <= 0) return;
                let lo = parseFloat(el.dataset.min || 18);
                let hi = parseFloat(el.dataset.max || 80);
                for (let i = 0; i < 14; i++) {
                    const mid = (lo + hi) / 2;
                    el.style.fontSize = mid + "px";
                    if (el.offsetWidth <= avail) lo = mid; else hi = mid;
                }
                best = Math.min(best, lo);
            });
            if (best !== Infinity) list.forEach(function (el) { el.style.fontSize = best + "px"; });
        });
    }

    // ---------- MENSAJE: tamaño según el alto de las fotos ----------
    function fitMessage() {
        document.querySelectorAll(".hero-side").forEach(function (row) {
            const text = row.querySelector(".message-text");
            const stack = row.querySelector(".polaroid-stack");
            if (!text || !stack) return;
            const target = stack.offsetHeight * MESSAGE_SCALE;
            if (target <= 0) return;
            let lo = 14, hi = 48;
            for (let i = 0; i < 14; i++) {
                const mid = (lo + hi) / 2;
                text.style.fontSize = mid + "px";
                if (text.offsetHeight <= target) lo = mid; else hi = mid;
            }
            text.style.fontSize = lo + "px";
        });
    }
    function fitAll() { fitTitles(); fitMessage(); }

    let fitTimer;
    window.addEventListener("resize", function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitAll, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
    window.addEventListener("load", fitAll);   // también cuando terminan de cargar las fotos

    // ---------- REPRODUCTOR ----------
    function syncPlayerState() {
        if (player && music) player.classList.toggle("is-playing", !music.paused);
    }
    if (music) {
        music.addEventListener("playing", syncPlayerState);
        music.addEventListener("pause", syncPlayerState);
        music.addEventListener("ended", syncPlayerState);
        music.addEventListener("error", function () {
            player.classList.remove("is-playing");
            console.error("No se pudo cargar musica.mp3. Revisá que el archivo exista.", music.error);
        });
        music.addEventListener("timeupdate", function () {
            if (music.duration) progressBar.style.width = (music.currentTime / music.duration) * 100 + "%";
        });
    }
    if (playBtn) {
        playBtn.addEventListener("click", function () {
            if (music.paused) music.play().catch(function () { syncPlayerState(); });
            else music.pause();
        });
    }
    [prevBtn, nextBtn].forEach(function (btn) {
        if (btn) btn.addEventListener("click", function () { music.currentTime = 0; });
    });
    if (progress) {
        progress.addEventListener("click", function (e) {
            if (!music.duration) return;
            const rect = progress.getBoundingClientRect();
            music.currentTime = ((e.clientX - rect.left) / rect.width) * music.duration;
        });
    }

    // ---------- CUENTA REGRESIVA ----------
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");

    // 20 de diciembre de 2026, 14:00 (Argentina)
    const eventDate = new Date("2026-12-20T14:00:00-03:00").getTime();
    const pad = function (n) { return String(n).padStart(2, "0"); };

    function updateCountdown() {
        const diff = eventDate - Date.now();
        if (diff <= 0) {
            daysEl.textContent = "0"; hoursEl.textContent = "00"; minutesEl.textContent = "00";
            return;
        }
        daysEl.textContent = Math.floor(diff / 86400000);
        hoursEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
        minutesEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
});
