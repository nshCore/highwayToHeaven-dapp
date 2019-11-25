<template>
    <div v-if="isDrizzleInitialized">
        <drizzle-contract
            contractName="HeavenTicket"
            method="isPatron"
            label="In heaven"
            :methodArgs="accounts"      
        /> 
    </div>   
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('accounts', ['activeAccount']),    
    ...mapGetters('drizzle', ['isDrizzleInitialized']),

    accounts() {
      return [this.activeAccount]
    }    
  }    
}
</script>