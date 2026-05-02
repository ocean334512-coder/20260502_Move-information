/**
 * Vercel/CI: TMDB_API_KEY 환경 변수로 assets/runtime-config.js 생성
 * 로컬: env가 없고 기존 파일에 키가 있으면 유지
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dest = path.join(root, "assets", "runtime-config.js");
const key = process.env.TMDB_API_KEY || "";
const isVercel = process.env.VERCEL === "1";
const isCI = process.env.CI === "true";

const write = () => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(
    dest,
    `/**\n * 빌드(Vercel 등)에서 TMDB_API_KEY가 주입됩니다.\n * 로컬만 쓸 때는 여기에 키를 넣거나 config.example.js를 참고하세요.\n */\nconst TMDB_API_KEY = ${JSON.stringify(key)};\n`
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
  console.log("assets/runtime-config.js를 TMDB_API_KEY로 생성했습니다.");
  process.exit(0);
}

if (fs.existsSync(dest)) {
  const prev = fs.readFileSync(dest, "utf8");
  if (/TMDB_API_KEY\s*=\s*["'][^"']+["']/.test(prev)) {
    console.log("기존 assets/runtime-config.js 유지 (TMDB_API_KEY 없음).");
    process.exit(0);
  }
}

write();
console.warn(
  "assets/runtime-config.js를 생성했습니다. 키가 비어 있으면 config.example.js를 참고해 넣거나 TMDB_API_KEY를 설정하세요."
);
