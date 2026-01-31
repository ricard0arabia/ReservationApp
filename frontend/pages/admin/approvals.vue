<template>
  <main class="page">
    <h1>Approval Queue</h1>
    <div v-if="reservations.length" class="list">
      <article v-for="reservation in reservations" :key="reservation._id" class="card">
        <h2>{{ reservation.amenityId }} • {{ reservation.durationHours }}h</h2>
        <p>{{ reservation.startAt }} → {{ reservation.endAt }}</p>
        <div class="actions">
          <button @click="approve(reservation._id)">Approve</button>
          <button class="danger" @click="deny(reservation._id)">Deny</button>
        </div>
      </article>
    </div>
    <p v-else>No pending approvals.</p>
  </main>
</template>

<script setup lang="ts">
const { request } = useApi();
const reservations = ref<any[]>([]);

const load = async () => {
  const data = await request<any>("/api/admin/reservations?status=PENDING_APPROVAL");
  reservations.value = data.items ?? [];
};

onMounted(load);

const approve = async (id: string) => {
  await request(`/api/admin/reservations/${id}/approve`, { method: "POST" });
  await load();
};

const deny = async (id: string) => {
  await request(`/api/admin/reservations/${id}/deny`, { method: "POST", body: { reason: "Not available" } });
  await load();
};
</script>

<style scoped>
.page {
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1.5rem;
}
.list {
  display: grid;
  gap: 1rem;
}
.card {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}
.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 600;
}
.danger {
  background: #dc2626;
}
</style>
