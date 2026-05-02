/**
 * Vercel/CI: TMDB_API_KEY 환경 변수로 config.js 생성
 * 로컬: env가 없고 기존 config.js가 있으면 덮어쓰지 않음
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dest = path.join(root, "config.js");
const key = process.env.TMDB_API_KEY || "";
const isVercel = process.env.VERCEL === "1";
const isCI = process.env.CI === "true";

const write = () => {
  fs.writeFileSync(
    dest,
    `const TMDB_API_KEY = ${JSON.stringify(key)};\n`
  );
};

if (isVercel || isCI) {
  write();
  if (!key) {
    console.warn(
      "빌드 경고: TMDB_API_KEY가 비어 있습니다. Vercel → Settings → Environment Variables에 추가하세요."
    );
  }
  process.exit(0);
}

if (key) {
  write();
  console.log("config.js를 TMDB_API_KEY로 생성했습니다.");
  process.exit(0);
}

if (fs.existsSync(dest)) {
  console.log("기존 config.js 유지 (TMDB_API_KEY 없음).");
  process.exit(0);
}

write();
console.warn(
  "config.js를 빈 키로 생성했습니다. config.example.js를 복사하거나 TMDB_API_KEY를 설정하세요."
);
