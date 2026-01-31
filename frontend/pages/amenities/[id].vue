<template>
  <main class="page">
    <h1>Availability</h1>
    <p v-if="amenity">{{ amenity.name }}</p>
    <div class="field">
      <label>Select date</label>
      <input v-model="date" type="date" />
      <button @click="load">Check availability</button>
    </div>
    <ul class="slots">
      <li v-for="slot in slots" :key="slot._id">Hour {{ slot.hourStart }}:00 booked</li>
    </ul>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const { request } = useApi();
const amenity = ref<any>(null);
const date = ref(new Date().toISOString().slice(0, 10));
const slots = ref<any[]>([]);

onMounted(async () => {
  const data = await request<any>("/api/amenities");
  amenity.value = data.items.find((item: any) => item._id === route.params.id);
  await load();
});

const load = async () => {
  const data = await request<any>(`/api/availability?amenityId=${route.params.id}&date=${date.value}`);
  slots.value = data.slots ?? [];
};
</script>

<style scoped>
.page {
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1rem;
}
.field {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
input {
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #cbd5f5;
}
button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 600;
}
.slots {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}
</style>
