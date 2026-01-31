<template>
  <main class="page">
    <h1>Amenities</h1>
    <p>Browse the multipurpose building amenities and check availability.</p>
    <div class="grid">
      <article v-for="amenity in amenities" :key="amenity._id" class="card">
        <h2>{{ amenity.name }}</h2>
        <p>{{ amenity.description }}</p>
        <NuxtLink :to="`/reserve/${amenity._id}`">Reserve</NuxtLink>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
const { request } = useApi();
const amenities = ref<any[]>([]);

onMounted(async () => {
  const data = await request<any>("/api/amenities");
  amenities.value = data.items ?? [];
});
</script>

<style scoped>
.page {
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1.5rem;
}
.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.card {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  background: #fff;
  display: grid;
  gap: 0.75rem;
}
.card a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}
</style>
