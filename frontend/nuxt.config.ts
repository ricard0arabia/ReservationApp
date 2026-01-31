export default defineNuxtConfig({
  ssr: true,
  typescript: {
    strict: true
  },
  app: {
    head: {
      title: "Subdivision Amenities Reservations",
      meta: [
        {
          name: "description",
          content: "Reserve community amenities with verified availability and secure payments."
        }
      ]
    }
  }
});
