var canvas = document.getElementById("sky");
var ctx = canvas.getContext("2d");
var W = 0, H = 0;
var stars = [];
var backgroundStars = [];
var supabaseClient = null;

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  var d = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * d;
  canvas.height = H * d;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(d, 0, 0, d, 0, 0);
}
resize();
window.addEventListener("resize", resize);

for (var i = 0; i < 180; i++) {
  backgroundStars.push({
    x: Math.random(),
    y: Math.random(),
    r: 0.25 + Math.random() * 0.75,
    a: 0.08 + Math.random() * 0.25,
    p: Math.random() * 6.28
  });
}

function makeStar() {
  return {
    x: 18 + Math.random() * Math.max(20, W - 36),
    y: 18 + Math.random() * Math.max(20, H - 36),
    r: 0.9 + Math.random() * 1.8,
    p: Math.random() * 6.28,
    speed: 0.0012 + Math.random() * 0.0028,
    a: 0
  };
}

function draw(t) {
  ctx.clearRect(0, 0, W, H);

  backgroundStars.forEach(function(s) {
    var wave = 0.55 + 0.45 * Math.sin(t * 0.0007 + s.p);
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, 6.28);
    ctx.fillStyle = "rgba(215,226,255," + (s.a * wave) + ")";
    ctx.fill();
  });

  stars.forEach(function(s) {
    s.a = Math.min(1, s.a + 0.012);
    var wave = 0.5 + 0.5 * Math.sin(t * s.speed + s.p);
    var a = s.a * (0.18 + 0.82 * wave);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, 6.28);
    ctx.fillStyle = "rgba(255,249,218," + Math.max(0.08, a) + ")";
    ctx.shadowColor = "rgba(255,238,170,0.95)";
    ctx.shadowBlur = 2 + 8 * wave;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

function render(data, addStar) {
  var n = Number(data && data.stars || 0);
  var target = Math.max(1, Number(data && data.target || 500));

  if (addStar) {
    stars.push(makeStar());
  }

  document.getElementById("stars").textContent = n;
  document.getElementById("cur").textContent = n;
  document.getElementById("target").textContent = target;
  document.getElementById("bar").style.width = Math.min(100, n / target * 100) + "%";
}

async function start() {
  try {
    var response = await fetch("config.json?ts=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("config.json 加载失败");
    var cfg = await response.json();

    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_KEY ||
        cfg.SUPABASE_URL.indexOf("PASTE_") >= 0 ||
        cfg.SUPABASE_KEY.indexOf("PASTE_") >= 0) {
      throw new Error("config.json 还没有填写 Supabase URL 和 Publishable key");
    }

    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase JS 加载失败，请检查网络");
    }

    supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

    var before = await supabaseClient.rpc("get_activity");
    if (before.error) throw before.error;
    render(before.data, false);

    var result = await supabaseClient.rpc("increment_stars");
    if (result.error) throw result.error;
    render(result.data, true);

    var n = Number(result.data.stars);
    var target = Number(result.data.target);

    if (n >= target) {
      document.getElementById("msg").textContent = "星空已经被点亮！";
    } else {
      document.getElementById("msg").textContent = "感谢你的到来，你点亮了一颗星";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("msg").textContent = "连接失败：" + err.message;
  }
}

start();

fetch("config.json?ts=" + Date.now(), { cache: "no-store" })
  .then(function(r) { return r.json(); })
  .then(function(cfg) {
    document.getElementById("video").src = cfg.VIDEO_URL || "video.mp4";
  })
  .catch(function() {
    document.getElementById("video").src = "video.mp4";
  });

document.getElementById("play").onclick = function() {
  var box = document.getElementById("videoBox");
  var video = document.getElementById("video");
  box.classList.add("on");
  video.play().catch(function(){});
};

document.getElementById("close").onclick = function() {
  var video = document.getElementById("video");
  video.pause();
  document.getElementById("videoBox").classList.remove("on");
};

document.getElementById("videoBox").onclick = function(e) {
  if (e.target === document.getElementById("videoBox")) {
    document.getElementById("video").pause();
    document.getElementById("videoBox").classList.remove("on");
  }
};
