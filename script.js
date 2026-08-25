(function(){
  "use strict";
  var rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("sky");
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, dpr = 1;
  var stars = [];
  var shoot = null;
  var particles = [];
  var nextShoot = performance.now() + 4500;
  var COLORS = ["232,230,240", "242,210,124", "244,182,194"];

  function resize(){
    W = window.innerWidth; H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
  }
  function makeStars(){
    var count = Math.min(220, Math.round(W * H / 7500));
    stars = [];
    for(var i = 0; i < count; i++){
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.35 + Math.pow(Math.random(), 2.2) * 1.5,
        d: Math.random(),
        tw: Math.random() * Math.PI * 2,
        ts: 0.4 + Math.random() * 1.5,
        c: Math.random() < 0.1 ? 1 : (Math.random() < 0.06 ? 2 : 0)
      });
    }
  }

  function spawnShoot(){
    var fromLeft = Math.random() < 0.5;
    shoot = {
      x: fromLeft ? Math.random() * W * 0.4 : W * 0.6 + Math.random() * W * 0.4,
      y: Math.random() * H * 0.25,
      vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 4),
      vy: 2 + Math.random() * 1.6,
      life: 62
    };
  }

  function burst(x, y){
    var n = 68;
    for(var i = 0; i < n; i++){
      var ang = Math.random() * Math.PI * 2;
      var sp = 1 + Math.random() * 5.5;
      var life = 48 + Math.random() * 34;
      particles.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 1.4,
        life: life, max: life,
        c: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
  }

  function celebrate(){
    var w = window.innerWidth, h = window.innerHeight;
    burst(w * 0.5, h * 0.38);
    setTimeout(function(){ burst(w * 0.28, h * 0.28); }, 320);
    setTimeout(function(){ burst(w * 0.72, h * 0.3); }, 620);
    setTimeout(function(){ burst(w * 0.5, h * 0.2); }, 980);
    setTimeout(function(){ burst(w * 0.38, h * 0.42); }, 1350);
    setTimeout(function(){ burst(w * 0.62, h * 0.44); }, 1650);
  }

  function draw(t){
    ctx.clearRect(0, 0, W, H);
    var sy = window.scrollY || window.pageYOffset || 0;
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      var y = (s.y - sy * 0.22 * s.d) % H;
      if(y < 0) y += H;
      var a = rm ? 0.8 : (0.45 + 0.55 * Math.abs(Math.sin(s.tw + t * s.ts)));
      a *= 0.3 + 0.7 * s.d;
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + COLORS[s.c] + "," + a.toFixed(3) + ")";
      ctx.fill();
    }
    if(!rm && !shoot && t > nextShoot){
      spawnShoot();
      nextShoot = t + 6000 + Math.random() * 6000;
    }
    if(shoot){
      shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life--;
      var fade = shoot.life / 62;
      var tailX = shoot.x - shoot.vx * 8;
      var tailY = shoot.y - shoot.vy * 8;
      var grad = ctx.createLinearGradient(shoot.x, shoot.y, tailX, tailY);
      grad.addColorStop(0, "rgba(242,210,124," + (0.9 * fade).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(242,210,124,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(shoot.x, shoot.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      if(shoot.life <= 0 || shoot.x < -80 || shoot.x > W + 80 || shoot.y > H + 80) shoot = null;
    }
    for(var j = particles.length - 1; j >= 0; j--){
      var p = particles[j];
      p.vy += 0.05; p.vx *= 0.985;
      p.x += p.vx; p.y += p.vy; p.life--;
      var pa = Math.max(p.life / p.max, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.1 + pa * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + p.c + "," + pa.toFixed(3) + ")";
      ctx.fill();
      if(p.life <= 0) particles.splice(j, 1);
    }
    if(!rm) requestAnimationFrame(draw);
  }

  var svg = document.getElementById("heart-svg");
  var NS = "http://www.w3.org/2000/svg";
  var N = 28, pts = [], circles = [], poly;
  for(var k = 0; k <= N; k++){
    var th = (k % N) / N * Math.PI * 2;
    var hx = 16 * Math.pow(Math.sin(th), 3);
    var hy = -(13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th)) + 2;
    pts.push([hx, hy]);
  }
  poly = document.createElementNS(NS, "polyline");
  poly.setAttribute("points", pts.map(function(p){ return p[0].toFixed(2) + "," + p[1].toFixed(2); }).join(" "));
  svg.appendChild(poly);
  pts.forEach(function(p, idx){
    if(idx === N) return;
    var c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", p[0].toFixed(2));
    c.setAttribute("cy", p[1].toFixed(2));
    c.setAttribute("r", (idx % 9 === 4 ? 0.62 : 0.42));
    c.setAttribute("class", "cstar" + (idx % 9 === 4 ? " gold" : ""));
    c.style.transitionDelay = (idx * 0.09 + 2.6) + "s";
    svg.appendChild(c);
    circles.push(c);
  });

  function drawHeart(){
    if(rm){
      poly.style.strokeDashoffset = "0";
      circles.forEach(function(c){ c.style.opacity = "1"; });
      return;
    }
    var len = poly.getTotalLength();
    poly.style.strokeDasharray = len;
    poly.style.strokeDashoffset = len;
    circles.forEach(function(c){ c.style.opacity = "0"; });
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        poly.style.transition = "stroke-dashoffset 3.4s cubic-bezier(.4,0,.2,1)";
        poly.style.strokeDashoffset = "0";
        circles.forEach(function(c){
          c.style.transition = "opacity .5s ease";
          c.dataset.go = "1";
          requestAnimationFrame(function(){ c.style.opacity = "1"; });
        });
      });
    });
  }

  if(rm){
    drawHeart();
  } else {
    var heartDone = false;
    var heartIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting && !heartDone){ heartDone = true; drawHeart(); heartIO.disconnect(); }
      });
    }, { threshold: 0.35 });
    heartIO.observe(document.querySelector(".constellation"));
  }

  var reveals = document.querySelectorAll(".reveal");
  if(rm || !("IntersectionObserver" in window)){
    reveals.forEach ? reveals.forEach(function(el){ el.classList.add("in"); })
      : Array.prototype.forEach.call(reveals, function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
    Array.prototype.forEach.call(reveals, function(el){ io.observe(el); });
  }

  var btnYes = document.getElementById("btnYes");
  var btnTime = document.getElementById("btnTime");
  var choices = document.getElementById("choices");
  var answer = document.getElementById("answer");

  btnYes.addEventListener("click", function(){
    choices.hidden = true;
    answer.hidden = false;
    answer.innerHTML = "<p class=\"ans-title\">You just made every star up there brighter.</p>" +
      "<p>Thank you, Rei. I won&rsquo;t waste this &mdash; I&rsquo;ll spend every single day proving that trusting me again was the right call.</p>";
    answer.scrollIntoView({ behavior: rm ? "auto" : "smooth", block: "center" });
    if(!rm) celebrate();
  });
  btnTime.addEventListener("click", function(){
    choices.hidden = true;
    answer.hidden = false;
    answer.innerHTML = "<p class=\"ans-title\">Then I&rsquo;ll wait. Right here.</p>" +
      "<p>No pressure. No countdown. Take all the time you need &mdash; I&rsquo;m not going anywhere.</p>";
    answer.scrollIntoView({ behavior: rm ? "auto" : "smooth", block: "center" });
  });

  var rt;
  window.addEventListener("resize", function(){
    clearTimeout(rt);
    rt = setTimeout(resize, 160);
  });

  resize();
  if(rm){ draw(performance.now()); } else { requestAnimationFrame(draw); }
})();
