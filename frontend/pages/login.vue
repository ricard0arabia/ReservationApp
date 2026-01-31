<template>
  <main class="page">
    <h1>Login</h1>
    <p class="subtitle">Sign in to reserve amenities and manage your booking.</p>

    <section class="card">
      <h2>Google OAuth (demo)</h2>
      <div class="field">
        <label>Email</label>
        <input v-model="googleEmail" type="email" placeholder="you@example.com" />
      </div>
      <div class="field">
        <label>Name</label>
        <input v-model="googleName" type="text" placeholder="Your name" />
      </div>
      <button @click="loginGoogle">Login with Google</button>
    </section>

    <section class="card">
      <h2>Phone OTP (demo)</h2>
      <div class="field">
        <label>Phone</label>
        <input v-model="phone" type="tel" placeholder="09xxxxxxxxx" />
      </div>
      <button @click="requestOtp">Request OTP</button>
      <div v-if="otpRequested" class="field">
        <label>OTP</label>
        <input v-model="otp" type="text" placeholder="123456" />
        <button @click="verifyOtp">Verify OTP</button>
      </div>
    </section>

    <section v-if="authUser" class="card success">
      <h2>Signed in</h2>
      <p>Welcome, {{ authUser.displayName }} ({{ authUser.role }})</p>
    </section>
  </main>
</template>

<script setup lang="ts">
const { request, setAuth } = useApi();
const googleEmail = ref("");
const googleName = ref("");
const phone = ref("");
const otp = ref("");
const otpRequested = ref(false);
const authUser = ref<any>(null);

const loginGoogle = async () => {
  const data = await request<any>(`/api/auth/google/callback?email=${googleEmail.value}&name=${googleName.value}`);
  setAuth(data.token, data.user.role);
  authUser.value = data.user;
};

const requestOtp = async () => {
  await request("/api/auth/phone/request-otp", { method: "POST" });
  otpRequested.value = true;
};

const verifyOtp = async () => {
  const data = await request<any>("/api/auth/phone/verify-otp", {
    method: "POST",
    body: { phone: phone.value, otp: otp.value }
  });
  setAuth(data.token, data.user.role);
  authUser.value = data.user;
};
</script>

<style scoped>
.page {
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1.5rem;
}
.subtitle {
  color: #64748b;
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
  padding: 0.6rem 0.75rem;
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
.success {
  background: #ecfdf3;
  border: 1px solid #bbf7d0;
}
</style>
