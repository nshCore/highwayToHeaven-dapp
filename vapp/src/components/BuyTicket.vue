<template>
    <div v-if="isDrizzleInitialized">
        <button v-on:click="buyTicket">buy ticket</button>
        <button v-on:click="enterHeaven">enter heaven</button>
        <button v-on:click="leaveHeaven">leave heaven</button>

    </div>   
</template>

<script>
import Web3 from 'web3';
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('drizzle', ['isDrizzleInitialized', 'drizzleInstance']),
    ...mapGetters('accounts', ['activeAccount']),

    accounts() {
        return [this.activeAccount]
    }
  },
  methods: {
    buyTicket: async function(event) {        
        if (this.isDrizzleInitialized) {
            const buyTicketMethod = this.drizzleInstance.contracts["HeavenTicket"].methods['buyTicket'];
            buyTicketMethod.cacheSend({ value: "1" });
        } else {
            alert("Drizzle doesn't seem to be initialised / ready");
        }
    },

    enterHeaven: async function(event) {        
        if (this.isDrizzleInitialized) {
            const enterHeavenMethod = this.drizzleInstance.contracts["HeavenTicket"].methods['enterHeaven'];
            enterHeavenMethod.cacheSend(this.activeAccount);
        } else {
            alert("Drizzle doesn't seem to be initialised / ready");
        }
    },

    leaveHeaven: async function(event) {        
        if (this.isDrizzleInitialized) {
            const leaveHeavenMethod = this.drizzleInstance.contracts["HeavenTicket"].methods['leaveHeaven'];
            leaveHeavenMethod.cacheSend(this.activeAccount);
        } else {
            alert("Drizzle doesn't seem to be initialised / ready");
        }
    }
}  
}
</script>
