// Random Lawsuit Test - Call debugTriggerRandomLawsuit() in console
window.debugTriggerRandomLawsuit = () => {
  const gameStore = window.gameStore || window.__METAMAN_GAME_STORE__;
  if (gameStore?.getState()?.debugTriggerRandomLawsuit) {
    gameStore.getState().debugTriggerRandomLawsuit();
  } else {
    console.log('Game store not found or debug method unavailable');
  }
};

console.log('Random Lawsuit Debug: Call debugTriggerRandomLawsuit() to test');

