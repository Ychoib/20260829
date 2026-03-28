import { invitationData } from "./invitation-data.js?v=20260328-hero-script";

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const musicPlayer = document.querySelector("#bg-music");
const runtimeConfig = window.__INVITATION_CONFIG__ ?? {};

let countdownTimerId;
let naverMapLoader;
let musicAutoplayCleanup;

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

async function copyText(text, message = "복사했어요.") {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast(message);
  }
}

function formatWithLineBreaks(lines) {
  return lines.map((line) => escapeHtml(line)).join("<br />");
}

function buildCalendar(dateString) {
  const targetDate = new Date(dateString);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const date = targetDate.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ label: "", isBlank: true, isActive: false });
  }

  for (let day = 1; day <= lastDate; day += 1) {
    cells.push({ label: String(day), isBlank: false, isActive: day === date });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ label: "", isBlank: true, isActive: false });
  }

  return cells;
}

function renderCalendar(dateString) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const cells = buildCalendar(dateString);

  return `
    <div class="calendar">
      <div class="calendar__weekdays">
        ${weekdays.map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="calendar__grid">
        ${cells
          .map((cell) => {
            if (cell.isBlank) {
              return '<span class="calendar__cell calendar__cell--blank"></span>';
            }

            return `<span class="calendar__cell${cell.isActive ? " calendar__cell--active" : ""}">${cell.label}</span>`;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderInfoCards(cards) {
  return cards
    .map(
      (card) => `
        <article class="info-card reveal" data-reveal>
          <span class="info-card__label">${escapeHtml(card.title)}</span>
          <h3 class="info-card__heading">${escapeHtml(card.heading)}</h3>
          <p class="info-card__body">${formatWithLineBreaks(card.lines)}</p>
        </article>
      `,
    )
    .join("");
}

function renderDirections(items) {
  return items
    .map(
      (item) => `
        <article class="direction-card reveal" data-reveal>
          <h3>${escapeHtml(item.title)}</h3>
          <ul>
            ${item.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function renderGallery(items) {
  return items
    .map(
      (item, index) => `
        <button
          class="gallery-card ${item.layout === "featured" ? "gallery-card--featured" : ""} reveal"
          type="button"
          data-gallery-index="${index}"
          data-reveal
          aria-label="${escapeHtml(item.alt)} 크게 보기"
        >
          <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy" />
          <span class="gallery-card__caption">${escapeHtml(item.caption)}</span>
        </button>
      `,
    )
    .join("");
}

function renderContacts(items) {
  return items
    .map(
      (item) => `
        <article class="contact-card reveal" data-reveal>
          <span class="contact-card__role">${escapeHtml(item.role)}</span>
          <h3 class="contact-card__name">${escapeHtml(item.name)}</h3>
          <p class="contact-card__phone">${escapeHtml(item.phone)}</p>
          <a class="contact-card__button" href="tel:${item.phone.replaceAll("-", "")}">
            ${escapeHtml(item.buttonLabel)}
          </a>
        </article>
      `,
    )
    .join("");
}

function renderMapLinks(items) {
  return items
    .map(
      (item) => `
        ${
          item.type === "app"
            ? `
              <button
                class="pill-button pill-button--map${item.emphasis ? " pill-button--dark" : ""}"
                type="button"
                data-map-action="${escapeHtml(item.action)}"
                aria-label="${escapeHtml(item.label)} 열기"
              >
                <span class="pill-button__title">${escapeHtml(item.label)}</span>
                <span class="pill-button__meta">${escapeHtml(item.caption)}</span>
              </button>
            `
            : `
              <a
                class="pill-button pill-button--map${item.emphasis ? " pill-button--dark" : ""}"
                href="${escapeHtml(item.url)}"
                target="_blank"
                rel="noreferrer"
                aria-label="${escapeHtml(item.label)} 열기"
              >
                <span class="pill-button__title">${escapeHtml(item.label)}</span>
                <span class="pill-button__meta">${escapeHtml(item.caption)}</span>
              </a>
            `
        }
      `,
    )
    .join("");
}

function createPageMarkup(data) {
  return `
    <button class="music-fab" type="button" data-action="music-toggle" aria-pressed="false" aria-label="배경음악 재생">
      <span class="music-fab__icon">♪</span>
      <span class="music-fab__label">BGM</span>
    </button>

    <section class="hero">
      <img class="hero__image" src="${data.hero.image}" alt="${escapeHtml(data.hero.alt)}" />
      <div class="hero__shade" aria-hidden="true"></div>
      <div class="hero__content">
        ${data.hero.label ? `<p class="hero__label">${escapeHtml(data.hero.label)}</p>` : ""}
        ${data.couple.scriptTitle ? `<p class="hero__script">${escapeHtml(data.couple.scriptTitle)}</p>` : ""}
        <h1 class="hero__names">${escapeHtml(data.couple.title)}</h1>
        <p class="hero__line">${escapeHtml(data.couple.invitationLine)}</p>
        <div class="hero__datebar">
          <span>${escapeHtml(data.event.dayLabel)}</span>
          <span>${escapeHtml(data.event.monthLabel)}</span>
          <span>${escapeHtml(data.event.yearLabel)}</span>
        </div>
      </div>
    </section>

    <section class="section section--story">
      <div class="story-card reveal is-visible" data-reveal>
        <div class="story-card__content">
          <p class="section-tag">${escapeHtml(data.spotlight.label)}</p>
          <h2 class="section-title">${escapeHtml(data.couple.storyTitle)}</h2>
          <p class="story-card__text">${escapeHtml(data.couple.storyText)}</p>
        </div>
        <figure class="story-card__figure">
          <img src="${data.spotlight.image}" alt="${escapeHtml(data.spotlight.alt)}" loading="lazy" />
        </figure>
      </div>
    </section>

    <section class="section">
      <div class="paper-card reveal" data-reveal>
        <p class="section-tag">${escapeHtml(data.invitation.label)}</p>
        <h2 class="section-title">${escapeHtml(data.invitation.title)}</h2>
        <div class="invitation-copy">
          ${data.invitation.poem
            .map((line) =>
              line
                ? `<p>${escapeHtml(line)}</p>`
                : '<div class="invitation-copy__spacer" aria-hidden="true"></div>',
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="schedule-card reveal" data-reveal>
        <div class="schedule-card__intro">
          <p class="section-tag">WEDDING DAY</p>
          <p class="schedule-card__date">${escapeHtml(data.event.shortDate)}</p>
          <p class="schedule-card__text">${escapeHtml(data.event.dayOfWeekLabel)}</p>
        </div>
        ${renderCalendar(data.event.isoDate)}
        <div class="countdown" aria-label="결혼식까지 남은 시간">
          <div class="countdown__item">
            <span class="countdown__label">DAYS</span>
            <strong id="countdown-days">000</strong>
          </div>
          <div class="countdown__separator">:</div>
          <div class="countdown__item">
            <span class="countdown__label">HOUR</span>
            <strong id="countdown-hours">00</strong>
          </div>
          <div class="countdown__separator">:</div>
          <div class="countdown__item">
            <span class="countdown__label">MIN</span>
            <strong id="countdown-minutes">00</strong>
          </div>
          <div class="countdown__separator">:</div>
          <div class="countdown__item">
            <span class="countdown__label">SEC</span>
            <strong id="countdown-seconds">00</strong>
          </div>
        </div>
        <p class="countdown__message" id="countdown-message"></p>
      </div>
    </section>

    <section class="section">
      <div class="location-card reveal" data-reveal>
        <div class="location-card__heading">
          <p class="section-tag">LOCATION</p>
          <h2 class="section-title">${escapeHtml(data.event.venue)}</h2>
          <p class="location-card__address">
            ${escapeHtml(data.event.address)}<br />
            ${escapeHtml(data.event.addressLegacy)}
          </p>
        </div>

        <div class="location-map reveal" data-reveal>
          <div
            id="naver-map"
            class="location-map__canvas"
            role="img"
            aria-label="${escapeHtml(`${data.event.venue} 네이버 지도`)}"
          ></div>
          <div class="location-map__fallback" data-map-fallback hidden></div>
        </div>

        <div class="location-card__map-tools">
          <p class="section-tag">MAP APPS</p>
          <p class="location-card__map-note">${escapeHtml(data.maps.hint)}</p>
        </div>

        <div class="location-card__actions">
          ${renderMapLinks(data.maps.apps)}
          <button class="pill-button pill-button--map" type="button" data-copy="${escapeHtml(data.event.address)}">
            <span class="pill-button__title">주소 복사</span>
            <span class="pill-button__meta">텍스트 복사</span>
          </button>
        </div>

        <div class="info-grid">
          ${renderInfoCards(data.informationCards)}
        </div>

        <div class="directions-grid">
          ${renderDirections(data.directions)}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="gallery-panel reveal" data-reveal>
        <p class="section-tag">GALLERY</p>
        <h2 class="section-title">우리의 순간을 담았어요</h2>
        <div class="gallery-grid">
          ${renderGallery(data.gallery)}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="utility-grid">
        <div class="utility-card reveal" data-reveal>
          <p class="section-tag">CONTACT</p>
          <h2 class="section-title">편하게 연락 주세요</h2>
          <div class="contact-grid">
            ${renderContacts(data.contacts)}
          </div>
        </div>

        <div class="utility-card reveal" data-reveal>
          <p class="section-tag">ACCOUNT</p>
          <h2 class="section-title">마음 전하실 곳</h2>
          <p class="utility-card__copy">${escapeHtml(data.account.message)}</p>
          <div class="account-box">
            <strong>${escapeHtml(`${data.account.bank} ${data.account.number}`)}</strong>
            <span>예금주 ${escapeHtml(data.account.holder)}</span>
          </div>
          <div class="utility-card__actions">
            <button
              class="pill-button pill-button--dark"
              type="button"
              data-copy="${escapeHtml(`${data.account.bank} ${data.account.number} (${data.account.holder})`)}"
            >
              계좌번호 복사
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--closing">
      <div class="closing-card reveal" data-reveal>
        <div class="closing-card__quote">
          ${data.quote.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        </div>
        <div class="closing-card__share">
          <p class="section-tag">SHARE</p>
          <h2 class="section-title">${escapeHtml(data.sharing.title)}</h2>
          <p class="utility-card__copy">${escapeHtml(data.sharing.description)}</p>
          <div class="utility-card__actions">
            <button class="pill-button pill-button--dark" type="button" data-action="share">링크 공유</button>
            <button class="pill-button" type="button" data-action="copy-link">링크 복사</button>
            <button class="pill-button" type="button" data-action="calendar">캘린더 추가</button>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>${escapeHtml(data.couple.title)}의 결혼식에 함께해 주셔서 감사합니다.</p>
      <p class="footer__meta">
        Music:
        <a href="${data.music.sourceUrl}" target="_blank" rel="noreferrer">${escapeHtml(data.music.title)}</a>
        by ${escapeHtml(data.music.artist)}
        ·
        <a href="${data.music.licenseUrl}" target="_blank" rel="noreferrer">CC BY 3.0</a>
      </p>
    </footer>
  `;
}

function isMobileDevice() {
  return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function openExternalLink(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function openAppWithFallback({ appUrl, mobileFallbackUrl, desktopUrl, notice }) {
  if (!appUrl) {
    if (desktopUrl) {
      openExternalLink(desktopUrl);
    }
    return;
  }

  if (!isMobileDevice()) {
    openExternalLink(desktopUrl || mobileFallbackUrl || appUrl);
    if (notice) {
      showToast(notice);
    }
    return;
  }

  let fallbackTimerId;
  const cleanup = () => {
    window.clearTimeout(fallbackTimerId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", cleanup);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      cleanup();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", cleanup, { once: true });

  fallbackTimerId = window.setTimeout(() => {
    cleanup();
    if (mobileFallbackUrl) {
      window.location.href = mobileFallbackUrl;
    }
  }, 1400);

  window.location.href = appUrl;
}

function setMapFallback(message, linkLabel, linkUrl) {
  const mapCanvas = document.querySelector("#naver-map");
  const fallback = document.querySelector("[data-map-fallback]");

  if (!mapCanvas || !fallback) {
    return;
  }

  mapCanvas.hidden = true;
  fallback.hidden = false;
  fallback.innerHTML = `
    <div class="location-map__empty">
      <p>${escapeHtml(message)}</p>
      ${
        linkUrl
          ? `<a class="location-map__link" href="${escapeHtml(linkUrl)}" target="_blank" rel="noreferrer">${escapeHtml(linkLabel)}</a>`
          : ""
      }
    </div>
  `;
}

function loadNaverMapScript(clientId) {
  if (window.naver?.maps) {
    return Promise.resolve(window.naver);
  }

  if (naverMapLoader) {
    return naverMapLoader;
  }

  naverMapLoader = new Promise((resolve, reject) => {
    window.__initWeddingNaverMap = () => resolve(window.naver);

    const script = document.createElement("script");
    script.id = "naver-map-sdk";
    script.async = true;
    script.src =
      `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${encodeURIComponent(clientId)}` +
      "&submodules=geocoder&callback=__initWeddingNaverMap";
    script.onerror = () => reject(new Error("Failed to load NAVER Maps API"));
    document.head.append(script);
  });

  return naverMapLoader;
}

async function setupNaverMap(data) {
  const mapCanvas = document.querySelector("#naver-map");
  if (!mapCanvas) {
    return;
  }

  const clientId = (runtimeConfig.naverMapClientId || runtimeConfig.naverMapKeyId || "").trim();
  if (!clientId) {
    setMapFallback(
      "네이버 지도 API 연결 준비는 끝났어요. Client ID를 넣으면 이 자리에서 바로 지도를 볼 수 있어요.",
      "네이버지도에서 보기",
      data.maps.naver,
    );
    return;
  }

  try {
    await loadNaverMapScript(clientId);
    const fallbackCenter = new window.naver.maps.LatLng(data.maps.coordinates.lat, data.maps.coordinates.lng);
    const map = new window.naver.maps.Map("naver-map", {
      center: fallbackCenter,
      zoom: data.maps.coordinates.zoom,
      scaleControl: false,
      mapDataControl: false,
      logoControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    });

    const createMarker = (position) =>
      new window.naver.maps.Marker({
        position,
        map,
        title: data.event.venue,
      });

    let markerPosition = fallbackCenter;

    if (window.naver.maps.Service?.geocode) {
      try {
        const geocodeResult = await new Promise((resolve, reject) => {
          window.naver.maps.Service.geocode({ address: data.maps.searchText || data.event.address }, (status, response) => {
            if (status !== window.naver.maps.Service.Status.OK) {
              reject(new Error(`Geocode failed: ${status}`));
              return;
            }

            const point = response?.result?.items?.[0]?.point || response?.v2?.addresses?.[0];
            if (!point) {
              reject(new Error("No geocode results"));
              return;
            }

            const x = Number(point.x ?? point.longitude);
            const y = Number(point.y ?? point.latitude);

            if (!Number.isFinite(x) || !Number.isFinite(y)) {
              reject(new Error("Invalid geocode coordinates"));
              return;
            }

            resolve({ x, y });
          });
        });

        markerPosition = new window.naver.maps.LatLng(geocodeResult.y, geocodeResult.x);
        map.setCenter(markerPosition);
      } catch (error) {
        console.warn("NAVER geocode fallback:", error);
      }
    }

    createMarker(markerPosition);
  } catch {
    setMapFallback(
      "지도를 불러오지 못했어요. 네이버지도에서 바로 위치를 확인하실 수 있어요.",
      "네이버지도에서 보기",
      data.maps.naver,
    );
  }
}

function updateCountdown(dateString) {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  const difference = Math.max(target - now, 0);
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const calendarDays = Math.max(Math.ceil(difference / (1000 * 60 * 60 * 24)), 0);
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  document.querySelector("#countdown-days").textContent = String(days).padStart(3, "0");
  document.querySelector("#countdown-hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#countdown-minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#countdown-seconds").textContent = String(seconds).padStart(2, "0");

  const message = document.querySelector("#countdown-message");
  if (message) {
    message.textContent =
      difference === 0
        ? `${invitationData.couple.title}의 결혼식이 바로 오늘입니다.`
        : `${invitationData.couple.title}의 결혼식이 ${calendarDays}일 남았습니다.`;
  }
}

function startCountdown(dateString) {
  window.clearInterval(countdownTimerId);
  updateCountdown(dateString);
  countdownTimerId = window.setInterval(() => updateCountdown(dateString), 1000);
}

function createCalendarFile(data) {
  const eventStart = new Date(data.event.isoDate);
  const eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);
  const toIcsDate = (date) =>
    date
      .toISOString()
      .replaceAll("-", "")
      .replaceAll(":", "")
      .replace(/\.\d{3}Z$/, "Z");

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//mobile-wedding-invitation//KO",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@mobile-wedding-invitation`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(eventStart)}`,
    `DTEND:${toIcsDate(eventEnd)}`,
    `SUMMARY:${data.couple.groom} ${data.couple.bride} 결혼식`,
    `LOCATION:${data.event.venue} ${data.event.address}`,
    `DESCRIPTION:${data.event.displayDate} / ${data.event.venue}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "youngchan-seunghyeon-wedding.ics";
  anchor.click();
  URL.revokeObjectURL(url);
}

function openLightbox(item) {
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  lightboxImage.alt = "";
  lightboxCaption.textContent = "";
  document.body.style.overflow = "";
}

function updateMusicButton(isPlaying) {
  const button = document.querySelector("[data-action='music-toggle']");
  if (!button) {
    return;
  }

  button.classList.toggle("is-playing", isPlaying);
  button.setAttribute("aria-pressed", String(isPlaying));
  button.setAttribute("aria-label", isPlaying ? "배경음악 정지" : "배경음악 재생");
  const label = button.querySelector(".music-fab__label");
  if (label) {
    label.textContent = isPlaying ? "ON" : "BGM";
  }
}

function clearMusicAutoplayFallback() {
  if (!musicAutoplayCleanup) {
    return;
  }

  musicAutoplayCleanup();
  musicAutoplayCleanup = null;
}

function registerMusicAutoplayFallback() {
  if (musicAutoplayCleanup) {
    return;
  }

  const attemptPlayback = async (event) => {
    if (event?.target?.closest?.("[data-action='music-toggle']")) {
      return;
    }

    clearMusicAutoplayFallback();

    try {
      await musicPlayer.play();
      updateMusicButton(true);
    } catch {
      updateMusicButton(false);
    }
  };

  const onPointerDown = (event) => {
    void attemptPlayback(event);
  };
  const onKeyDown = () => {
    void attemptPlayback();
  };

  musicAutoplayCleanup = () => {
    window.removeEventListener("pointerdown", onPointerDown, true);
    window.removeEventListener("touchstart", onPointerDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
  };

  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("touchstart", onPointerDown, true);
  document.addEventListener("keydown", onKeyDown, true);
}

function setupMusic(music) {
  musicPlayer.src = music.src;
  musicPlayer.volume = 0.34;
  musicPlayer.autoplay = true;
  musicPlayer.playsInline = true;
  updateMusicButton(false);
}

async function attemptAutoPlayMusic() {
  if (!musicPlayer.src) {
    return;
  }

  try {
    await musicPlayer.play();
    clearMusicAutoplayFallback();
    updateMusicButton(true);
  } catch {
    updateMusicButton(false);
    registerMusicAutoplayFallback();
  }
}

async function toggleMusic() {
  if (!musicPlayer.src) {
    return;
  }

  clearMusicAutoplayFallback();

  if (musicPlayer.paused) {
    try {
      await musicPlayer.play();
      updateMusicButton(true);
      showToast("배경음악을 재생해요.");
    } catch {
      showToast("음악 재생을 시작하지 못했어요.");
    }
    return;
  }

  musicPlayer.pause();
  updateMusicButton(false);
  showToast("배경음악을 멈췄어요.");
}

function setupRevealAnimations() {
  const revealed = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    revealed.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  revealed.forEach((element) => observer.observe(element));
}

function setupEventHandlers(data) {
  app.addEventListener("click", async (event) => {
    const copyTrigger = event.target.closest("[data-copy]");
    if (copyTrigger) {
      const value = copyTrigger.getAttribute("data-copy");
      if (value) {
        await copyText(value, "복사했어요.");
      }
      return;
    }

    const galleryTrigger = event.target.closest("[data-gallery-index]");
    if (galleryTrigger) {
      const item = data.gallery[Number(galleryTrigger.getAttribute("data-gallery-index"))];
      if (item) {
        openLightbox(item);
      }
      return;
    }

    const mapTrigger = event.target.closest("[data-map-action]");
    if (mapTrigger) {
      const action = mapTrigger.getAttribute("data-map-action");

      if (action === "open-kakao-map-app") {
        const kakaoMap = data.maps.apps.find((item) => item.action === action);
        if (kakaoMap) {
          openAppWithFallback({
            appUrl: kakaoMap.appUrl,
            mobileFallbackUrl: kakaoMap.mobileFallbackUrl,
            desktopUrl: kakaoMap.desktopUrl,
            notice: "모바일에서는 카카오맵 앱으로 바로 이어져요.",
          });
        }
        return;
      }

      if (action === "open-tmap-app") {
        const tmap = data.maps.apps.find((item) => item.action === action);
        if (tmap) {
          openAppWithFallback({
            appUrl: tmap.appUrl,
            mobileFallbackUrl: tmap.mobileFallbackUrl,
            desktopUrl: tmap.desktopUrl,
            notice: "모바일에서는 티맵 앱으로 길찾기를 시작해요.",
          });
        }
        return;
      }
    }

    const actionTrigger = event.target.closest("[data-action]");
    if (!actionTrigger) {
      return;
    }

    const action = actionTrigger.getAttribute("data-action");

    if (action === "music-toggle") {
      await toggleMusic();
      return;
    }

    if (action === "copy-link") {
      await copyText(window.location.href, "링크를 복사했어요.");
      return;
    }

    if (action === "share") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${data.couple.groom} · ${data.couple.bride} 결혼합니다`,
            text: `${data.event.displayDate} ${data.event.venue}`,
            url: window.location.href,
          });
        } catch {
          return;
        }
      } else {
        await copyText(window.location.href, "공유 기능 대신 링크를 복사했어요.");
      }
      return;
    }

    if (action === "calendar") {
      createCalendarFile(data);
      showToast("캘린더 파일을 준비했어요.");
    }
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target.closest("[data-lightbox-close]")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

function renderApp(data) {
  app.innerHTML = createPageMarkup(data);
  setupNaverMap(data);
  setupMusic(data.music);
  void attemptAutoPlayMusic();
  setupRevealAnimations();
  setupEventHandlers(data);
  startCountdown(data.event.isoDate);
}

renderApp(invitationData);
