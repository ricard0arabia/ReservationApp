<template>
  <main class="page">
    <h1>My Booking</h1>
    <section v-if="reservation" class="card">
      <h2>Status: {{ reservation.status }}</h2>
      <p>{{ reservation.startAt }} to {{ reservation.endAt }}</p>
      <p>Total: ₱{{ reservation.amountBreakdown.total }}</p>
      <button v-if="canPay" @click="payNow">Pay Now</button>
      <button v-if="canCancel" class="danger" @click="cancel">Cancel</button>
    </section>
    <p v-else>No active booking found.</p>
  </main>
</template>

<script setup lang="ts">
const { request } = useApi();
const reservation = ref<any>(null);

const load = async () => {
  const data = await request<any>("/api/reservations/my-active");
  reservation.value = data.reservation;
};

onMounted(load);

const canPay = computed(() =>
  reservation.value && ["HELD", "APPROVED_AWAITING_PAYMENT"].includes(reservation.value.status)
);
const canCancel = computed(() =>
  reservation.value && ["PENDING_APPROVAL", "CONFIRMED"].includes(reservation.value.status)
);

const payNow = async () => {
  const data = await request<any>(`/api/payments/${reservation.value._id}/create-checkout`, {
    method: "POST"
  });
  window.location.href = data.checkoutUrl;
};

const cancel = async () => {
  await request(`/api/reservations/${reservation.value._id}/cancel`, { method: "POST" });
  await load();
};
</script>

<style scoped>
.page {
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1.5rem;
}
.card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 1rem;
  display: grid;
  gap: 0.75rem;
}
button {
  padding: 0.6rem 1.25rem;
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
