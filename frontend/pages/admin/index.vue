<template>
  <main class="page">
    <h1>Admin Dashboard</h1>
    <p>Review pending approvals, manage amenities, and view audit logs.</p>
    <div class="actions">
      <NuxtLink to="/admin/approvals">Go to Approvals</NuxtLink>
    </div>
  </main>
</template>

<style scoped>
.page {
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1rem;
}
.actions a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}
</style>
