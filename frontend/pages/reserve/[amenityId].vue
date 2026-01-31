<template>
  <main class="page">
    <h1>Reserve Amenity</h1>
    <p v-if="amenity">{{ amenity.name }} — {{ amenity.description }}</p>

    <section class="card">
      <div class="field">
        <label>Date</label>
        <input v-model="date" type="date" />
      </div>
      <div class="field">
        <label>Start hour</label>
        <input v-model.number="startHour" type="number" min="9" max="21" />
      </div>
      <div class="field">
        <label>End hour</label>
        <input v-model.number="endHour" type="number" min="10" max="22" />
      </div>
      <button @click="createReservation">Create Reservation</button>
    </section>

    <section v-if="reservation" class="card">
      <h2>Status: {{ reservation.status }}</h2>
      <p>{{ reservation.startAt }} to {{ reservation.endAt }}</p>
      <p>Total: ₱{{ reservation.amountBreakdown.total }}</p>
      <button v-if="reservation.status === 'HELD' || reservation.status === 'APPROVED_AWAITING_PAYMENT'" @click="payNow">
        Pay Now
      </button>
      <p v-if="reservation.status === 'PENDING_APPROVAL'">Waiting for admin approval.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const { request } = useApi();
const amenity = ref<any>(null);
const reservation = ref<any>(null);
const date = ref(new Date().toISOString().slice(0, 10));
const startHour = ref(9);
const endHour = ref(10);

onMounted(async () => {
  const data = await request<any>("/api/amenities");
  amenity.value = data.items.find((item: any) => item._id === route.params.amenityId);
});

const createReservation = async () => {
  const data = await request<any>("/api/reservations", {
    method: "POST",
    body: {
      amenityId: route.params.amenityId,
      date: date.value,
      startHour: startHour.value,
      endHour: endHour.value
    }
  });
  reservation.value = data.reservation;
};

const payNow = async () => {
  const data = await request<any>(`/api/payments/${reservation.value._id}/create-checkout`, {
    method: "POST"
  });
  window.location.href = data.checkoutUrl;
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
.field {
  display: grid;
  gap: 0.5rem;
}
input {
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #cbd5f5;
}
button {
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 600;
}
</style>
