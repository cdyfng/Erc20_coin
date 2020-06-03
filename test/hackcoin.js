const truffleAssert = require('truffle-assertions');

const HACKToken = artifacts.require('HACKToken');
const BN = web3.utils.BN;

const UNIT = new BN('1000000000000000000');
const SUPPLY = UNIT.mul(new BN('1000000000'));

contract('HACK', accounts => {
  let hack;

  before(async () => {
    hack = await HACKToken.deployed();
  })

  it('should be paused when initialized', async () => {
    assert(await hack.paused(), 'Not paused');
  })

  it('should put 1B HACK in the first account', async () => {
    await hack.unpause();
    const balance = await hack.balanceOf(accounts[0]);
    assert(balance.eq(SUPPLY), '1B wasn\'t in the first account');
  });

  it('should send 1 HACK to accounts[1]', async () => {
    await hack.transfer(accounts[1], UNIT);
    const balance = await hack.balanceOf(accounts[0]);
    assert(balance.eq(SUPPLY.sub(UNIT)), 'Bad balance');
  });

  it('should disallow non-owner transfer when pausing', async () => {
    // Can't transfer when paused
    await hack.pause();
    assert.equal(await hack.paused(), true, 'Should be paused');
    await truffleAssert.reverts(
      hack.transfer(accounts[1], UNIT, {from: accounts[1]}),
      'Pausable: paused');
    await hack.unpause();
    // Can transfer when unpaused
    const balanceBefore = await hack.balanceOf(accounts[0]);
    await hack.transfer(accounts[1], UNIT);
    const balanceAfter = await hack.balanceOf(accounts[0]);
    assert(balanceBefore.sub(UNIT).eq(balanceAfter), 'Balance should change');
  });

  it('should allow the owner to transfer when puased', async () => {
    await hack.pause();
    const balanceBefore = await hack.balanceOf(accounts[0]);
    await hack.transfer(accounts[1], UNIT);
    const balanceAfter = await hack.balanceOf(accounts[0]);
    assert(balanceBefore.sub(UNIT).eq(balanceAfter), 'Balance should change');
    await hack.unpause();
  });

  it('should reject non-owner\'s call to transferOwnership', async () => {
    await truffleAssert.reverts(
      hack.transferOwnership(accounts[2], {from: accounts[1]}),
      'Ownable: caller is not the owner.'
    );
  });

  it('should allow 3rd party to transfer from the owner with allowance', async () => {
    await hack.transfer(accounts[1], UNIT.muln(100));
    await hack.pause();
    await hack.approve(accounts[2], UNIT);
    const balanceBefore = await hack.balanceOf(accounts[0]);
    await hack.transferFrom(accounts[0], accounts[1], UNIT, {from: accounts[2]});
    const balanceAfter = await hack.balanceOf(accounts[0]);
    assert(balanceBefore.sub(UNIT).eq(balanceAfter), 'Balance should change');
    await hack.unpause();
  });

  it('should reject tranfer from any non-owner accounts when paused', async () => {
    await hack.transfer(accounts[1], UNIT.muln(100));
    await hack.approve(accounts[2], UNIT, {from: accounts[1]});
    await hack.pause();
    await truffleAssert.reverts(
      hack.transferFrom(accounts[1], accounts[2], UNIT, {from: accounts[2]}),
      'Pausable: paused');
    await hack.unpause();
  });

});
