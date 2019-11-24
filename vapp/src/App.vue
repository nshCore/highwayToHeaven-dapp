<template>
  <div v-if="isDrizzleInitialized" id="app">
    <img id="buddyChrist" alt="Vue logo" src="./assets/buddyChrist.png" />

    <div class="section">
      <h2>Highway To Heaven!!</h2>
      <token-supply />
      <token-symbol />
      <guest-list />
      <heaven-list />
      <balance-of />
      <is-guest />
      <is-pateron />
      <ticket-price />
      <buy-ticket />
    </div>

    <div class="section">
      <drizzle-account units="Ether" :precision="2" /> 
      <drizzle-contract-form
        contractName="HeavenTicket"
        method="transfer"
        :placeholders="placeholders"
      />      
    </div>
  </div>

  <div v-else>Loading...</div>
</template>

<script>
import { mapGetters } from 'vuex';

import IsGuest from './components/IsGuest';
import IsPateron from './components/IsPateron';
import BuyTicket from './components/BuyTicket';
import BalanceOf from './components/BalanceOf';
import GuestList from './components/GuestList';
import HeavenList from './components/HeavenList';
import TokenSupply from './components/TokenSupply';
import TokenSymbol from './components/TokenSymbol';
import TicketPrice from './components/TicketPrice';

export default {
  name: 'app',
  components: {
    IsGuest,
    IsPateron,
    BuyTicket,
    GuestList,
    BalanceOf,
    HeavenList,
    TokenSupply,
    TokenSymbol,
    TicketPrice
  },

  computed: {
    ...mapGetters('drizzle', ['isDrizzleInitialized']),
    placeholders() {
      return ['To Address', 'Amount to Send']
    }    
  }
}
</script>

<style>
#buddyChrist {
  width: 25%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
