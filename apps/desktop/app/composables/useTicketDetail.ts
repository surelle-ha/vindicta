const selectedTicketId = ref<string | null>(null)

export function useTicketDetail() {
  const route = useRoute()
  const router = useRouter()

  function openTicket(id: string) {
    selectedTicketId.value = id
    router.replace({ query: { ...route.query, ticket: id } })
  }

  function closeTicket() {
    selectedTicketId.value = null
    const q = { ...route.query }
    delete q.ticket
    router.replace({ query: q })
  }

  onMounted(() => {
    if (route.query.ticket && !selectedTicketId.value) {
      selectedTicketId.value = route.query.ticket as string
    }
  })

  return { selectedTicketId, openTicket, closeTicket }
}
