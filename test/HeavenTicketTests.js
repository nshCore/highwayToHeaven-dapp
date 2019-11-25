const assert = require("chai").assert;
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const HeavenTicket = artifacts.require("HeavenTicket");

contract("HeavenTicket", accounts => {

  // do some dry setup for each test
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    _owner = accounts[0];
    
    // redeploy the contract beforeEach test bescause we change state in some tests that can cause subsequet tests to fail
    // state isn't reloaded between it() only files
    // @SEE https://github.com/dapperlabs/cryptokitties-bounty/blob/master/test/clock-auction.test.js#L23-L36
    // ht = await HeavenTicket.deployed() this uses same instance of contract for each test ^^
    ht = await HeavenTicket.new('HeavenTicket', 'HT', 0, 21000000, 1);
  });

  // a piece of me dies everytime
  afterEach(async () => {
    await ht.kill();
  });

  it("should put 21000000 tickets in the owner account", async () => {
    const balance = await ht.balanceOf(accounts[0]);
    assert.notEqual(balance, 0, "some token must be minted");
    assert.equal(balance, 21000000, "21000000 is in the first account");
    assert.notEqual(balance, 21000001, "21000001 is not the first account");
  });
  
  it("ticket price should be 1 ether", async () => {
    const ticketPrice = await ht.getTicketPrice();
    assert.equal(ticketPrice, 1);
    assert.notEqual(ticketPrice, 2);
    assert.notEqual(ticketPrice, 0);
  });

  it("address shouldn't be in list", async () => {
    const response = await ht.isGuestOnList(accounts[0]);
    assert.equal(response, false);
    assert.notEqual(response, true);
  });

  it("user should be able to buy token", async () => {
    const receipt = await ht.buyTicket({ from: accounts[1], value: 1 ** 10 })
    const balance = await ht.balanceOf(accounts[1]);
    assert.equal(balance, 1, "user should have 1 ticket");
    assert.notEqual(balance, 2, "user should not have 2 ticket");
    assert.notEqual(balance, 0, "user should not have 0 ticket");
  });

  it("user should not be able to buy token because they sent too little", async () => {

    // calling buy ticket with an incorrect amount should raise a revert, so try and assert it
    await expectRevert(
      // should throw error becaus minimum buy in is 1 this is 0.5
      ht.buyTicket({ from: accounts[1], value: 1000000000000000 }),
      "you need money to get into heaven"
    );
    // be nice to know here if you can share a js constants between the contracts and the tests
    // as they are asserting on the messages to avoid false positives from mismathced messages not failed logic

    // check our revert actually prevented state change
    const balance = await ht.balanceOf(accounts[1]);
    assert.equal(balance, 0, "user should have 0 ticket");
    assert.notEqual(balance, 1, "user should not have 1 ticket");
  });

  it("owner should not be able to buy token", async () => {

    await expectRevert(
      ht.buyTicket({ from: accounts[0], value: 1 ** 10 }),
      "sender can't be contract owner"
    );

    // check our revert actually prevented state change
    const balance = await ht.balanceOf(accounts[1]);
    assert.equal(balance, 0, "user should have 0 ticket"); 
    assert.notEqual(balance, 1, "user should not have 1 ticket"); 
  });

  it("user buying ticket should be on guestlist", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 })
    assert.equal(await ht.isGuestOnList(accounts[1]), true);
  });

  it("user buying ticket should have 1 token", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 })
    assert.equal(await ht.balanceOf(accounts[1]), "1");
  });

  it("user buying ticket should increase total supply by 1", async () => {
    let initialSupply = await ht.totalSupply();
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 })
    const currentSupply = await ht.totalSupply();
    assert.notEqual(currentSupply, initialSupply);
    assert.equal(currentSupply, ++initialSupply);
  });

  it("buying ticket increases guest count", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 })
    const guestCount = await ht.getGuestCount();
    assert.equal(guestCount, 1);
  });

  it("user cant be on guest list if they never paid", async () => {
    assert.equal(await ht.isGuestOnList(accounts[1]), false);
  });

  it("user cant buy duplicate tickets", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 })
    assert.equal(await ht.isGuestOnList(accounts[1]), true);
    await expectRevert(
      ht.buyTicket({ from: accounts[1], value: 1 ** 10 }),
      "you can only go to heaven once"
    );
  })

  it("user cant get into heaven without ticket", async () => {
    await expectRevert(ht.enterHeaven(accounts[1]), 
      "heavens pretty exclusive, buy a ticket"
    );
  });

  it("entering heaven removes users ticket", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 });
    await ht.enterHeaven(accounts[1]);
    assert.equal(await ht.balanceOf(accounts[1]), "0");
  });

  it("entering heaven decreses total suuply", async () => {
    let initialSupply = await ht.totalSupply();
    await ht.buyTicket({ from: accounts[1], value: 1 ** 18 });

    // should increase token by 1 as we buy
    const currentSupply = await ht.totalSupply();
    assert.equal(currentSupply, ++initialSupply);

    // entering should decrese total ticket supply
    // or in this case same as we started
    await ht.enterHeaven(accounts[1]);
    let supplyAfterEntering = await ht.totalSupply();
    assert.equal(supplyAfterEntering, --initialSupply);
  });

  it("two users buying tickets and one going to heaven increases suuply by 1", async () => {
    let initialSupply = await ht.totalSupply();
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 });
    await ht.buyTicket({ from: accounts[2], value: 1 ** 10 });

    let currentSupply = await ht.totalSupply();

    // const expected = parseInt(initialSupply) + 2; // js hates type safety :'(
    assert.equal(currentSupply.toString(), (parseInt(initialSupply) + 2).toString()); 

    await ht.enterHeaven(accounts[1]);
    currentSupply = await ht.totalSupply();

    assert.equal(currentSupply, parseInt(initialSupply) + 1);
  });

  it("entering heaven adds user to paterons", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 18 });
    await ht.enterHeaven(accounts[1]);
    assert.equal(await ht.isPatron(accounts[1]), true);
    assert.notEqual(await ht.isPatron(accounts[1]), false);
  });

  it("entering heaven increases pateron count", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 })
    await ht.enterHeaven(accounts[1]);
    const patreonCount = await ht.getPatronCount();
    assert.equal(patreonCount, 1);
  });

  it("leaving heaven removes user from paterons", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 10 });
    await ht.buyTicket({ from: accounts[2], value: 1 ** 10 });
    await ht.enterHeaven(accounts[1]);
    await ht.enterHeaven(accounts[2]);
    assert.equal(await ht.isPatron(accounts[1]), true);
    assert.equal(await ht.isPatron(accounts[2]), true);
    await ht.leaveHeaven(accounts[1]);
    assert.equal(await ht.isPatron(accounts[1]), false);
  });

  it("should emit TicketBought when buying a ticket", async () => {
    const receipt = await ht.buyTicket({ from: accounts[1], value: 1 ** 18 });
    expectEvent(receipt, 'TicketBought', {
      guest: accounts[1]
    });
  });

  it("should emit EnteredHeaven when entering heaven", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 18 });
    const receipt = await ht.enterHeaven(accounts[1]);
    expectEvent(receipt, 'EnteredHeaven', {
      guest: accounts[1]
    });
  });

  it("should emit LeftHeaven when leaving heaven", async () => {
    await ht.buyTicket({ from: accounts[1], value: 1 ** 18 });
    await ht.enterHeaven(accounts[1]);
    const receipt = await ht.leaveHeaven(accounts[1]);
    expectEvent(receipt, 'LeftHeaven', {
      guest: accounts[1]
    });
  });

});
