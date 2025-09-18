const $ = s => document.querySelector(s);
const out = $("#out");
$("#f").addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = $("#q").value.trim();
  if (!city) return;
  out.innerHTML = `<div class="card">Loading…</div>`;
  try {
    // Geocoding (Open-Meteo, key-free)
    const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`).then(r=>r.json());
    if (!g.results?.length) throw new Error("City not found");
    const { latitude: lat, longitude: lon, name, country } = g.results[0];

    // 3-day forecast
    const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`).then(r=>r.json());
    const days = (w.daily.time || []).slice(0,3).map((t,i)=>({
      date: t,
      tmax: Math.round(w.daily.temperature_2m_max[i]),
      tmin: Math.round(w.daily.temperature_2m_min[i]),
      code: w.daily.weathercode[i]
    }));
    const icon = c => {
      if ([0].includes(c)) return "☀️";
      if ([1,2,3].includes(c)) return "⛅";
      if ([45,48].includes(c)) return "🌫️";
      if ([51,53,55,56,57].includes(c)) return "🌦️";
      if ([61,63,65,66,67,80,81,82].includes(c)) return "🌧️";
      if ([71,73,75,77,85,86].includes(c)) return "❄️";
      if ([95,96,99].includes(c)) return "⛈️";
      return "🌡️";
    };
    out.innerHTML = `
      <div class="card">
        <div><strong>${name}, ${country}</strong></div>
        <div class="small">${lat.toFixed(2)}, ${lon.toFixed(2)}</div>
      </div>
      ${days.map(d=>`
        <div class="card">
          <div>${icon(d.code)} <strong>${d.date}</strong></div>
          <div>Min/Max: ${d.tmin}° / ${d.tmax}°</div>
        </div>
      `).join("")}
    `;
  } catch (err) {
    out.innerHTML = `<div class="card">Error: ${err.message || err}</div>`;
  }
});
