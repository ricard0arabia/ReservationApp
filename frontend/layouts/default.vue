<template>
  <div>
    <header class="nav">
      <NuxtLink to="/" class="brand">Amenity Reservations</NuxtLink>
      <nav>
        <NuxtLink to="/amenities">Amenities</NuxtLink>
        <NuxtLink to="/rules">Rules</NuxtLink>
        <NuxtLink to="/login">Login</NuxtLink>
        <NuxtLink to="/my-booking">My Booking</NuxtLink>
        <NuxtLink to="/admin">Admin</NuxtLink>
      </nav>
    </header>
    <NuxtPage />
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
  position: sticky;
  top: 0;
}
.nav nav {
  display: flex;
  gap: 1rem;
}
.brand {
  font-weight: 700;
  text-decoration: none;
  color: #0f172a;
}
.nav a {
  text-decoration: none;
  color: #475569;
}
</style>
