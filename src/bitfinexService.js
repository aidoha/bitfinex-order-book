const ws = new WebSocket('wss://api-pub.bitfinex.com/ws/2');
let channelId = null;

export const subscribeToBook = (onMessage, precision, setIsConnected) => {
  const resubscribe = (newPrecision) => {
    if (channelId !== null) {
      const unsubscribeMsg = JSON.stringify({
        event: 'unsubscribe',
        chanId: channelId,
      });
      ws.send(unsubscribeMsg);
      channelId = null;
    }

    const subscribeMsg = JSON.stringify({
      event: 'subscribe',
      channel: 'book',
      symbol: 'tBTCUSD',
      prec: newPrecision,
    });
    ws.send(subscribeMsg);
  };

  const disconnectWebSocket = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.event === 'subscribed' && msg.channel === 'book') {
      channelId = msg.chanId;
    }
    onMessage(msg);
  };

  ws.onopen = () => {
    setIsConnected(true);
    const confMsg = JSON.stringify({
      event: 'conf',
      flags: 536870912,
    });
    ws.send(confMsg);

    resubscribe(precision);
  };

  ws.onclose = () => {
    setIsConnected(false);
    channelId = null;
  };

  ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    ws.close();
  };

  return { resubscribe, disconnectWebSocket };
};
