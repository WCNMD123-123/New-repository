(() => {
  "use strict";

  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0;
  let stars = [];
  const backgroundStars = [];
  let supabaseClient = null;
  let config = null;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * d);
    canvas.height = Math.floor(H * d);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < 220; i++) {
    backgroundStars.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.25 + Math.random() * 0.9,
      a: 0.08 + Math.random() * 0.28,
      p: Math.random() * Math.PI * 2
    });
  }

  function makeStar() {
    return {
      x: 18 + Math.random() * Math.max(20, W - 36),
      y: 18 + Math.random() * Math.max(20, H - 36),
      r: 0.9 + Math.random() * 1.8,
      p: Math.random() * Math.PI * 2,
      speed: 0.0012 + Math.random() * 0.0028,
      a: 0
    };
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    backgroundStars.forEach(s => {
      const wave = 0.55 + 0.45 * Math.sin(t * 0.0007 + s.p);
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(215,226,255,${s.a * wave})`;
      ctx.fill();
    });

    stars.forEach(s => {
      s.a = Math.min(1, s.a + 0.012);
      const wave = 0.5 + 0.5 * Math.sin(t * s.speed + s.p);
      const a = s.a * (0.18 + 0.82 * wave);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,249,218,${Math.max(0.08, a)})`;
      ctx.shadowColor = "rgba(255,238,170,0.95)";
      ctx.shadowBlur = 2 + 8 * wave;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  function render(data, addStar = false) {
    const n = Number(data?.stars ?? 0);
    const target = Math.max(1, Number(data?.target ?? 500));

    if (addStar) stars.push(makeStar());

    document.getElementById("stars").textContent = n.toLocaleString();
    document.getElementById("cur").textContent = n.toLocaleString();
    document.getElementById("target").textContent = target.toLocaleString();
    document.getElementById("bar").style.width =
      Math.min(100, n / target * 100) + "%";
  }

  function setMessage(text) {
    document.getElementById("msg").textContent = text;
  }

  async function loadConfig() {
    const response = await fetch(`config.json?ts=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`config.json 加载失败（HTTP ${response.status}）`);
    }

    const cfg = await response.json();

    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_KEY) {
      throw new Error("config.json 未填写 Supabase 配置");
    }

    if (cfg.SUPABASE_URL.includes("PASTE_") ||
        cfg.SUPABASE_KEY.includes("PASTE_")) {
      throw new Error("config.json 仍是示例配置，请填写真实 Supabase URL 和 Publishable key");
    }

    if (!/^https:\/\/[^\s]+\.supabase\.co/.test(cfg.SUPABASE_URL)) {
      throw new Error("SUPABASE_URL 格式不正确");
    }

    return cfg;
  }

  async function start() {
    try {
      setMessage("正在连接星空……");

      config = await loadConfig();

      if (!window.supabase?.createClient) {
        throw new Error("Supabase JS 加载失败，请检查网络后刷新");
      }

      supabaseClient = window.supabase.createClient(
        config.SUPABASE_URL,
        config.SUPABASE_KEY
      );

      const before = await supabaseClient.rpc("get_activity");
      if (before.error) throw before.error;
      render(before.data, false);

      const result = await supabaseClient.rpc("increment_stars");
      if (result.error) throw result.error;
      render(result.data, true);

      const n = Number(result.data?.stars ?? 0);
      const target = Number(result.data?.target ?? 500);

      setMessage(
        n >= target
          ? "星空已经被点亮！"
          : "感谢你的到来，你点亮了一颗星"
      );
    } catch (err) {
      console.error("[点亮星空]", err);
      setMessage("连接失败：" + (err?.message || "未知错误"));
    }
  }

  async function loadVideo() {
    try {
      const cfg = config || await loadConfig();
      document.getElementById("video").src = cfg.VIDEO_URL || "video.mp4";
    } catch {
      document.getElementById("video").src = "video.mp4";
    }
  }

  document.getElementById("play").addEventListener("click", () => {
    const box = document.getElementById("videoBox");
    const video = document.getElementById("video");
    box.classList.add("on");
    box.setAttribute("aria-hidden", "false");
    video.play().catch(() => {});
  });

  function closeVideo() {
    const video = document.getElementById("video");
    video.pause();
    document.getElementById("videoBox").classList.remove("on");
    document.getElementById("videoBox").setAttribute("aria-hidden", "true");
  }

  document.getElementById("close").addEventListener("click", closeVideo);
  document.getElementById("videoBox").addEventListener("click", e => {
    if (e.target.id === "videoBox") closeVideo();
  });

  start();
  loadVideo();
})();
