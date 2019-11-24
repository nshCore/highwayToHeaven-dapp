<template>
    <div v-if="isDrizzleInitialized">
        <drizzle-contract
            contractName="HeavenTicket"
            method="getGuestCount"
            label="Guest Count"
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