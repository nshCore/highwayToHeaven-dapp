<template>
    <div v-if="isDrizzleInitialized">
        <drizzle-contract
            contractName="HeavenTicket"
            method="getTicketPrice"
            label="Ticket Price"
        /> 
    </div>   
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('drizzle', ['isDrizzleInitialized']),
  }    
}
</script>