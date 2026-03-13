      /* ---------- SCROLL PROGRESS ---------- */
      window.addEventListener("scroll", () => {
        const scrolled = window.scrollY;
        const total = document.body.scrollHeight - window.innerHeight;
        document.getElementById("progress-bar").style.width =
          (scrolled / total) * 100 + "%";
      });
      
      /* ---------- NAV DOTS ---------- */
      const dotTargets = [
        "hero",
        "origem",
        "cadeia",
        "infografico",
        "roi-section",
        "operacao",
        "desafios",
        "inovacao",
      ];
      const dots = document.querySelectorAll(".nav-dot");

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          document
            .getElementById(dotTargets[i])
            ?.scrollIntoView({ behavior: "smooth" });
        });
      });

      const sectionEls = dotTargets
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      const navObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const idx = sectionEls.indexOf(e.target);
              dots.forEach((d) => d.classList.remove("active"));
              if (dots[idx]) dots[idx].classList.add("active");
            }
          });
        },
        { threshold: 0.4 },
      );

      sectionEls.forEach((s) => navObs.observe(s));

      /* ---------- FADE IN ON SCROLL ---------- */
      let barsTriggered = false;

      const fadeObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e, delay) => {
            if (e.isIntersecting) {
              setTimeout(() => e.target.classList.add("visible"), delay * 80);
            }
          });
        },
        { threshold: 0.12 },
      );

      document
        .querySelectorAll(".fade-in, .slide-left")
        .forEach((el) => fadeObs.observe(el));

      /* ---------- BAR FILL ANIMATION ---------- */
      const barObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && !barsTriggered) {
              barsTriggered = true;
              document.querySelectorAll(".bar-fill").forEach((bar) => {
                const target = bar.getAttribute("data-width");
                bar.style.width = target + "%";
              });
            }
          });
        },
        { threshold: 0.3 },
      );

      const prodComp = document.querySelector(".prod-comparison");
      if (prodComp) barObs.observe(prodComp);

      /* ---------- CHAIN INTERACTIVE ---------- */
      document.querySelectorAll(".chain-step").forEach((step) => {
        step.addEventListener("click", () => {
          const wasActive = step.classList.contains("active");
          document
            .querySelectorAll(".chain-step")
            .forEach((s) => s.classList.remove("active"));
          if (!wasActive) step.classList.add("active");
        });
      });

      /* ---------- CHART.JS COLORS ---------- */
      const amber = "#D4780A";
      const warm = "#E8C87A";
      const steel = "#7A8A96";
      const cream = "#F5F0E8";
      const rust = "#B84B1E";
      const dark = "#1A1208";
      const dust = "#C4A882";

      Chart.defaults.color = dust;
      Chart.defaults.borderColor = "rgba(196,168,130,0.1)";
      Chart.defaults.font.family = "'DM Sans', sans-serif";

      /* ---------- PROD CHART (BARRAS) ---------- */
      const prodCtx = document.getElementById("prodChart").getContext("2d");
      new Chart(prodCtx, {
        type: "bar",
        data: {
          labels: [
            "Capacidade (kg/turno)",
            "Padronização (%)",
            "Mão de obra (%)",
            "Tempo de sova (min/lote)",
          ],
          datasets: [
            {
              label: "Sem máquina",
              data: [18, 30, 85, 20],
              backgroundColor: "rgba(122,138,150,0.7)",
              borderColor: steel,
              borderWidth: 1,
              borderRadius: 3,
            },
            {
              label: "Com Amassadeira",
              data: [60, 95, 30, 5],
              backgroundColor: "rgba(212,120,10,0.8)",
              borderColor: amber,
              borderWidth: 1,
              borderRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: dust, font: { size: 12 } },
            },
            tooltip: {
              backgroundColor: dark,
              borderColor: amber,
              borderWidth: 1,
              titleColor: warm,
              bodyColor: dust,
            },
          },
          scales: {
            x: {
              ticks: { color: dust, font: { size: 11 } },
              grid: { color: "rgba(196,168,130,0.08)" },
            },
            y: {
              ticks: { color: dust },
              grid: { color: "rgba(196,168,130,0.08)" },
            },
          },
        },
      });

      /* ---------- ROI CHART (LINHA) ---------- */
      const roiCtx = document.getElementById("roiChart").getContext("2d");

      const months = Array.from({ length: 25 }, (_, i) =>
        i === 0 ? "Início" : `Mês ${i}`,
      );
      const investimento = -12000;
      const lucroMensal = 680;
      const cumulative = months.map((_, i) => {
        const val = investimento + lucroMensal * i;
        return Math.round(val);
      });

      // Mark payback month
      const paybackMonth = cumulative.findIndex((v) => v >= 0);

      new Chart(roiCtx, {
        type: "line",
        data: {
          labels: months,
          datasets: [
            {
              label: "Lucro acumulado (R$)",
              data: cumulative,
              borderColor: amber,
              backgroundColor: (ctx) => {
                const chart = ctx.chart;
                const { ctx: c, chartArea } = chart;
                if (!chartArea) return "transparent";
                const gradient = c.createLinearGradient(
                  0,
                  chartArea.top,
                  0,
                  chartArea.bottom,
                );
                gradient.addColorStop(0, "rgba(212,120,10,0.25)");
                gradient.addColorStop(1, "rgba(212,120,10,0.01)");
                return gradient;
              },
              fill: true,
              tension: 0.4,
              pointRadius: (ctx) => (ctx.dataIndex === paybackMonth ? 8 : 3),
              pointBackgroundColor: (ctx) =>
                ctx.dataIndex === paybackMonth ? warm : amber,
              pointBorderColor: (ctx) =>
                ctx.dataIndex === paybackMonth ? amber : "transparent",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: dark,
              borderColor: amber,
              borderWidth: 1,
              titleColor: warm,
              bodyColor: dust,
              callbacks: {
                label: (ctx) => `  R$ ${ctx.parsed.y.toLocaleString("pt-BR")}`,
                afterBody: (items) => {
                  const idx = items[0].dataIndex;
                  if (idx === paybackMonth)
                    return ["  ✅ Ponto de equilíbrio!"];
                  return [];
                },
              },
            },
            annotation: {},
          },
          scales: {
            x: {
              ticks: { color: dust, font: { size: 10 }, maxTicksLimit: 12 },
              grid: { color: "rgba(196,168,130,0.06)" },
            },
            y: {
              ticks: {
                color: dust,
                callback: (v) => "R$ " + (v / 1000).toFixed(0) + "k",
              },
              grid: { color: "rgba(196,168,130,0.06)" },
            },
          },
        },
      });