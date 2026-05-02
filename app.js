const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

function posterUrl(path, size = "w500") {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
}

function backdropUrl(path) {
  if (!path) return null;
  return `${IMG_BASE}/w1280${path}`;
}

async function fetchNowPlaying() {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "ko-KR",
    page: "1",
    region: "KR",
  });
  const res = await fetch(
    `${TMDB_BASE}/movie/now_playing?${params.toString()}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.status_message || `요청 실패 (${res.status})`);
  }
  return res.json();
}

function setHero(movie) {
  const backdrop = document.getElementById("heroBackdrop");
  const title = document.getElementById("heroTitle");
  const overview = document.getElementById("heroOverview");
  const bg = backdropUrl(movie.backdrop_path || movie.poster_path);
  if (bg) {
    backdrop.style.backgroundImage = `url('${bg}')`;
  }
  title.textContent = movie.title;
  overview.textContent = movie.overview || "소개글이 없습니다.";
}

function createCard(movie) {
  const path = movie.poster_path;
  const posterSm = path ? posterUrl(path, "w185") : null;
  const posterMd = path ? posterUrl(path, "w342") : null;
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <div class="card__img-wrap">
      ${
        posterMd
          ? `<img class="card__img" src="${posterMd}" srcset="${posterSm} 185w, ${posterMd} 342w" sizes="(max-width: 399px) 50vw, (max-width: 639px) 33vw, 200px" alt="" loading="lazy" decoding="async" width="342" height="513" />`
          : `<div class="placeholder-poster">포스터 없음</div>`
      }
    </div>
    <div class="card__body">
      <h3 class="card__title">${escapeHtml(movie.title)}</h3>
      ${
        movie.release_date
          ? `<p class="card__meta">${movie.release_date}</p>`
          : ""
      }
    </div>
  `;
  const img = card.querySelector(".card__img");
  if (img) {
    img.alt = `${movie.title} 포스터`;
  }
  return card;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function setStatus(el, message, isError = false) {
  el.textContent = message;
  el.classList.toggle("is-error", isError);
}

async function init() {
  const grid = document.getElementById("movieGrid");
  const status = document.getElementById("status");

  if (typeof TMDB_API_KEY === "undefined" || !TMDB_API_KEY) {
    setStatus(
      status,
      "config.js에 TMDB_API_KEY가 설정되어 있는지 확인하세요.",
      true
    );
    return;
  }

  setStatus(status, "목록을 불러오는 중…");

  try {
    const data = await fetchNowPlaying();
    const results = data.results || [];

    if (results.length === 0) {
      setStatus(status, "표시할 영화가 없습니다.");
      return;
    }

    setStatus(status, `${results.length}편`);
    setHero(results[0]);

    grid.innerHTML = "";
    results.forEach((movie) => {
      grid.appendChild(createCard(movie));
    });
  } catch (e) {
    console.error(e);
    setStatus(
      status,
      e.message || "데이터를 불러오지 못했습니다. 네트워크를 확인해 주세요.",
      true
    );
  }
}

init();
