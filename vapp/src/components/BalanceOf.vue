<template>
    <div v-if="isDrizzleInitialized">
        <drizzle-contract
            contractName="HeavenTicket"
            method="balanceOf"
            label="Tickets"
            :methodArgs="accounts"
        /> 
    </div>   
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters('accounts', ['activeAccount', 'activeBalance']),
        ...mapGetters('drizzle', ['isDrizzleInitialized']),

        accounts() {
            return [this.activeAccount]
        }
    }  
}
</script>