<template>
    <div v-if="isDrizzleInitialized">
        <drizzle-contract
            contractName="HeavenTicket"
            method="getPatronCount"
            label="People in heaven"
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