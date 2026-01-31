<template>
  <main class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">Subdivision Amenities Portal</p>
        <h1>Reserve the multipurpose building in minutes</h1>
        <p>
          View real-time availability, book basketball court slots, and pay securely using GCash
          via PayMongo.
        </p>
        <div class="actions">
          <NuxtLink to="/amenities" class="primary">View Amenities</NuxtLink>
          <NuxtLink to="/rules" class="secondary">Read Rules</NuxtLink>
        </div>
      </div>
      <div class="card">
        <h2>Today’s snapshot</h2>
        <ul>
          <li>Operating hours: 9:00 AM – 10:00 PM</li>
          <li>Maintenance gap: 5:00 PM – 6:00 PM</li>
          <li>Granularity: 1-hour slots</li>
        </ul>
      </div>
    </header>
  </main>
</template>

<style scoped>
.page {
  padding: 3rem 1.5rem;
  font-family: "Inter", system-ui, sans-serif;
  color: #0f172a;
}
.hero {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: center;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: #64748b;
}
.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
.primary,
.secondary {
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
}
.primary {
  background: #2563eb;
  color: white;
}
.secondary {
  border: 1px solid #cbd5f5;
  color: #1e293b;
}
.card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: #f8fafc;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}
</style>
