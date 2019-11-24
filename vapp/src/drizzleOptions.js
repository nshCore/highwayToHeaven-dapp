import HeavenTicket from './contracts/HeavenTicket.json'

const options = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:7545'
    }
  },
  contracts: [HeavenTicket],
  events: {
    SimpleStorage: ['StorageSet']
  },
  polls: {
    accounts: 15000
  }
}

export default options
