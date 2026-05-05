import { invitationData } from "./invitation-data.js?v=20260505-dreame-original-guide";

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
  return String(text ?? "")
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

async function copyText(text, message = "복사되었어요.") {
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
  const targetDate = new Date(dateString);
  const monthLabel = targetDate.toLocaleString("en-US", { month: "long" }).toUpperCase();
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const cells = buildCalendar(dateString);

  return `
    <div class="calendar">
      <p class="calendar__month">${monthLabel}</p>
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
          <span class="contact-card__role">${escapeHtml(item.role === "GROOM" ? "신랑에게 연락하기" : "신부에게 연락하기")}</span>
          <h3 class="contact-card__name">${escapeHtml(item.name)}</h3>
          <p class="contact-card__phone">${escapeHtml(item.phone)}</p>
          <div class="contact-card__actions">
            <a class="contact-card__button" href="tel:${item.phone.replaceAll("-", "")}">전화</a>
            <a class="contact-card__button" href="sms:${item.phone.replaceAll("-", "")}">문자</a>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAccountGroups(groups) {
  return groups
    .map(
      (group) => `
        <section class="account-group">
          <h3 class="account-group__title">${escapeHtml(group.side)}</h3>
          <div class="account-group__entries">
            ${group.entries
              .map(
                (entry) => `
                  <button
                    class="account-line"
                    type="button"
                    data-copy="${escapeHtml(`${entry.bank} ${entry.number} (${entry.holder})`)}"
                    aria-label="${escapeHtml(`${entry.label} ${entry.bank} ${entry.number} ${entry.holder} 복사`)}"
                  >
                    <span class="account-line__role">${escapeHtml(entry.label)}</span>
                    <span class="account-line__account">${escapeHtml(`${entry.bank} ${entry.number}`)}</span>
                    <span class="account-line__holder">${escapeHtml(entry.holder)}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>
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
                class="navigation-app navigation-app--${escapeHtml(item.brand || "default")}"
                type="button"
                data-map-action="${escapeHtml(item.action)}"
                aria-label="${escapeHtml(item.label)} 열기"
              >
                ${
                  item.iconSrc
                    ? `<img class="navigation-app__icon-image" src="${escapeHtml(item.iconSrc)}" alt="" aria-hidden="true" />`
                    : ""
                }
                <span class="navigation-app__label">${escapeHtml(item.label)}</span>
              </button>
            `
            : `
              <a
                class="navigation-app navigation-app--${escapeHtml(item.brand || "default")}"
                href="${escapeHtml(item.url)}"
                target="_blank"
                rel="noreferrer"
                aria-label="${escapeHtml(item.label)} 열기"
              >
                ${
                  item.iconSrc
                    ? `<img class="navigation-app__icon-image" src="${escapeHtml(item.iconSrc)}" alt="" aria-hidden="true" />`
                    : ""
                }
                <span class="navigation-app__label">${escapeHtml(item.label)}</span>
              </a>
            `
        }
      `,
    )
    .join("");
}

function renderLocationGuideItem(item) {
  const marker = item.marker || "none";
  const markerMarkup =
    marker === "none"
      ? ""
      : marker === "bullet"
        ? '<span class="guide-item__marker guide-item__marker--bullet" aria-hidden="true">•</span>'
        : `<span class="guide-item__marker guide-item__marker--${escapeHtml(marker)}" aria-hidden="true"></span>`;

  return `
    <li class="guide-item${marker === "none" ? " guide-item--plain" : ""}">
      ${markerMarkup}
      <span class="guide-item__text">${escapeHtml(item.text)}</span>
    </li>
  `;
}

function renderLocationGuideSections(sections) {
  return sections
    .map(
      (section) => `
        <section class="guide-block${section.compact ? " guide-block--compact" : ""}">
          <h3 class="guide-block__title">${escapeHtml(section.title)}</h3>
          <ul class="guide-list">
            ${section.items.map((item) => renderLocationGuideItem(item)).join("")}
          </ul>
        </section>
      `,
    )
    .join("");
}

function renderInformationCards(cards) {
  return cards
    .map(
      (card, index) => `
        <article class="overview-card${index === 0 ? " overview-card--wide" : ""}">
          <span class="overview-card__label">${escapeHtml(card.title)}</span>
          <h2 class="overview-card__heading">${escapeHtml(card.heading)}</h2>
          <div class="overview-card__lines">
            ${card.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderDonationSection(donation) {
  if (!donation) {
    return "";
  }

  const imageMarkup = donation.image
    ? `
        <figure class="donation-panel__figure">
          ${
            donation.ctaUrl
              ? `<a class="donation-panel__image-link" href="${escapeHtml(donation.ctaUrl)}" target="_blank" rel="noreferrer">`
              : ""
          }
            <img src="${escapeHtml(donation.image.src)}" alt="${escapeHtml(donation.image.alt)}" loading="lazy" />
          ${donation.ctaUrl ? "</a>" : ""}
        </figure>
      `
    : "";

  const ctaMarkup =
    donation.ctaUrl && donation.ctaLabel
      ? `
          <a class="donation-panel__button" href="${escapeHtml(donation.ctaUrl)}" target="_blank" rel="noreferrer">
            ${escapeHtml(donation.ctaLabel)}
          </a>
        `
      : "";

  return `
    <section class="section">
      <div class="donation-panel reveal" data-reveal>
        <div class="donation-panel__heading">
          <h2 class="section-title section-title--en">${escapeHtml(donation.title)}</h2>
          ${donation.subtitle ? `<p class="donation-panel__sub">${escapeHtml(donation.subtitle)}</p>` : ""}
        </div>
        <p class="donation-panel__message">${escapeHtml(donation.message)}</p>
        ${imageMarkup}
        <div class="donation-panel__lines">
          ${donation.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        </div>
        ${ctaMarkup}
      </div>
    </section>
  `;
}

function createPageMarkup(data) {
  return `
    <button class="music-fab" type="button" data-action="music-toggle" aria-pressed="false" aria-label="배경음악 재생">
      <span class="music-fab__icon">M</span>
      <span class="music-fab__label">BGM</span>
    </button>

    <section class="hero">
      <div class="hero__top">
        <p class="hero__script">${escapeHtml(data.couple.scriptTitle || "Getting Married")}</p>
        <div class="hero__names">
          <span class="hero__name">${escapeHtml(data.couple.groom)}</span>
          <span class="hero__and">and</span>
          <span class="hero__name">${escapeHtml(data.couple.bride)}</span>
        </div>
      </div>
      <figure class="hero__figure">
        <img class="hero__image" src="${data.hero.image}" alt="${escapeHtml(data.hero.alt)}" />
      </figure>
      <div class="hero__meta">
        <p class="hero__date">${escapeHtml(data.event.displayDate)}</p>
        <p class="hero__venue">${escapeHtml(data.event.venue)}</p>
      </div>
      <div class="hero__summary reveal is-visible" data-reveal>
        ${renderInformationCards(data.informationCards)}
      </div>
    </section>

    <section class="section">
      <div class="invitation-panel reveal is-visible" data-reveal>
        <p class="section-tag">Invitation</p>
        <div class="invitation-copy">
          ${data.invitation.poem
            .map((line) =>
              line ? `<p>${escapeHtml(line)}</p>` : '<div class="invitation-copy__spacer" aria-hidden="true"></div>',
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="location-card reveal" data-reveal>
        <div class="location-card__heading">
          <h2 class="section-title section-title--en">Location</h2>
          <p class="location-card__title">${escapeHtml(data.event.venue)}</p>
          <p class="location-card__address">${escapeHtml(data.event.address)}</p>
        </div>

        <div class="location-map reveal" data-reveal>
          <div id="naver-map" class="location-map__canvas" role="img" aria-label="${escapeHtml(`${data.event.venue} 네이버 지도`)}"></div>
          <div class="location-map__fallback" data-map-fallback hidden></div>
        </div>

        <div class="location-guide">
          <section class="guide-block guide-block--navigation">
            <h3 class="guide-block__title">${escapeHtml(data.locationGuide.navigationTitle || "네비게이션")}</h3>
            <div class="navigation-apps">
              ${renderMapLinks(data.maps.apps)}
            </div>
            <button class="location-guide__copy" type="button" data-copy="${escapeHtml(data.event.address)}">
              <span class="location-guide__copy-title">${escapeHtml(data.locationGuide.copyLabel || "주소 복사")}</span>
              <span class="location-guide__copy-caption">${escapeHtml(data.locationGuide.copyCaption || data.event.address)}</span>
            </button>
          </section>

          <div class="guide-blocks">
            ${renderLocationGuideSections(data.locationGuide.sections)}
          </div>
        </div>
      </div>
    </section>

    ${renderDonationSection(data.donation)}

    <section class="section">
      <div class="utility-card reveal" data-reveal>
        <div class="utility-card__heading">
          <h2 class="section-title section-title--en">Gift</h2>
          <p class="utility-card__sub">마음 전하실 곳</p>
        </div>
        <p class="utility-card__copy">${escapeHtml(data.account.message)}</p>
        <div class="account-groups">
          ${renderAccountGroups(data.account.groups)}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="gallery-panel reveal" data-reveal>
        <div class="gallery-panel__heading">
          <h2 class="section-title section-title--en">Gallery</h2>
          <p class="gallery-panel__sub">Moment of Love</p>
        </div>
        <div class="gallery-grid">
          ${renderGallery(data.gallery)}
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer__actions">
        <button class="pill-button" type="button" data-action="share">링크 공유</button>
        <button class="pill-button" type="button" data-action="copy-link">링크 복사</button>
      </div>
      <p class="footer__title">${escapeHtml(data.couple.groom)} &amp; ${escapeHtml(data.couple.bride)}</p>
      <p class="footer__date">${escapeHtml(data.event.shortDate)}</p>
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

function isAndroidDevice() {
  return /android/i.test(window.navigator.userAgent);
}

function openExternalLink(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function buildAndroidIntentUrl(appUrl, packageName, fallbackUrl) {
  if (!appUrl || !packageName) {
    return "";
  }

  const matches = appUrl.match(/^([a-z0-9.+-]+):\/\/(.*)$/i);
  if (!matches) {
    return "";
  }

  const [, scheme, path] = matches;
  const segments = [`intent://${path}#Intent`, `scheme=${scheme}`, `package=${packageName}`];

  if (fallbackUrl) {
    segments.push(`S.browser_fallback_url=${encodeURIComponent(fallbackUrl)}`);
  }

  segments.push("end");
  return segments.join(";");
}

function triggerUrlNavigation(url) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

function openAppWithFallback({ appUrl, mobileFallbackUrl, desktopUrl, notice, packageName }) {
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

  const fallbackUrl = mobileFallbackUrl || desktopUrl;

  if (isAndroidDevice()) {
    const intentUrl = buildAndroidIntentUrl(appUrl, packageName, fallbackUrl);
    if (intentUrl) {
      window.location.href = intentUrl;
      return;
    }
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
    if (fallbackUrl) {
      window.location.href = fallbackUrl;
    }
  }, 1400);

  triggerUrlNavigation(appUrl);
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

function getNaverMapAuth() {
  const keyId = (runtimeConfig.naverMapKeyId || runtimeConfig.ncpKeyId || "").trim();
  if (keyId) {
    return { credential: keyId, paramName: "ncpKeyId" };
  }

  const clientId = (runtimeConfig.naverMapClientId || runtimeConfig.ncpClientId || "").trim();
  if (clientId) {
    return { credential: clientId, paramName: "ncpClientId" };
  }

  return null;
}

function loadNaverMapScript(auth) {
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
      `https://oapi.map.naver.com/openapi/v3/maps.js?${auth.paramName}=${encodeURIComponent(auth.credential)}` +
      "&callback=__initWeddingNaverMap";
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

  const auth = getNaverMapAuth();
  if (!auth) {
    setMapFallback("네이버 지도 연결 정보가 아직 없어요. 지도 앱 버튼으로 위치를 바로 확인해 주세요.", "네이버 지도 열기", data.maps.naver);
    return;
  }

  try {
    await loadNaverMapScript(auth);
    const center = new window.naver.maps.LatLng(data.maps.coordinates.lat, data.maps.coordinates.lng);
    const map = new window.naver.maps.Map("naver-map", {
      center,
      zoom: data.maps.coordinates.zoom,
      scaleControl: false,
      mapDataControl: false,
      logoControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    });

    new window.naver.maps.Marker({
      position: center,
      map,
      title: data.event.venue,
    });
  } catch {
    setMapFallback("지도를 불러오지 못했어요. 네이버 지도에서 위치를 바로 확인해 주세요.", "네이버 지도 열기", data.maps.naver);
  }
}

function updateCountdown(dateString) {
  const daysElement = document.querySelector("#countdown-days");
  const hoursElement = document.querySelector("#countdown-hours");
  const minutesElement = document.querySelector("#countdown-minutes");
  const secondsElement = document.querySelector("#countdown-seconds");

  if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
    return;
  }

  const target = new Date(dateString).getTime();
  const now = Date.now();
  const difference = Math.max(target - now, 0);
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  daysElement.textContent = String(days).padStart(3, "0");
  hoursElement.textContent = String(hours).padStart(2, "0");
  minutesElement.textContent = String(minutes).padStart(2, "0");
  secondsElement.textContent = String(seconds).padStart(2, "0");
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
      showToast("배경음악을 재생했어요.");
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
        await copyText(value);
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
      const mapApp = data.maps.apps.find((item) => item.action === action);
      if (mapApp) {
        openAppWithFallback({
          appUrl: mapApp.appUrl,
          mobileFallbackUrl: mapApp.mobileFallbackUrl,
          desktopUrl: mapApp.desktopUrl,
          notice: mapApp.notice,
          packageName: mapApp.packageName,
        });
      }
      return;
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
            title: `${data.couple.groom} · ${data.couple.bride} 결혼식`,
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
