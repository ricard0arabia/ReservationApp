<template>
  <main class="page">
    <h1>Waiting for confirmation...</h1>
    <p>Your payment is being verified. This page will refresh the reservation status.</p>
    <p v-if="reservation">Status: {{ reservation.status }}</p>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const { request } = useApi();
const reservation = ref<any>(null);

const load = async () => {
  const id = route.query.reservationId as string;
  if (!id) {
    return;
  }
  const data = await request<any>(`/api/reservations/${id}`);
  reservation.value = data.reservation;
};

onMounted(() => {
  load();
  setInterval(load, 5000);
});
</script>

<style scoped>
.page {
  padding: 2rem 1.5rem;
}
</style>
