import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBookData, setPrecision } from './store/features/bookSlice';
import { subscribeToBook } from './bitfinexService';
import './App.css';

const MAX_PRECISION = 5;
const MIN_PRECISION = 1;

const MAX_ROWS = 100;

const PRECISIONS = {
  5: 'P0',
  4: 'P1',
  3: 'P2',
  2: 'P3',
  1: 'P4',
};

const mergeAndTrimOrderBook = (existingOrders, newOrders) => {
  const mergedOrders = [...newOrders, ...existingOrders];
  return mergedOrders.slice(0, MAX_ROWS);
};

const App = () => {
  const dispatch = useDispatch();
  const { bids, asks, precision } = useSelector((state) => state.book);

  const onMessage = (msg) => {
    if (msg.event === undefined && msg[1] !== 'hb') {
      const [channelId, bookData] = msg;
      const newBids = bookData.filter((entry) => entry[2] > 0);
      const newAsks = bookData
        .filter((entry) => entry[2] < 0)
        .map((ask) => [ask[0], ask[1], ask[2]]);
      dispatch(
        setBookData({
          bids: mergeAndTrimOrderBook(bids, newBids),
          asks: mergeAndTrimOrderBook(asks, newAsks),
        })
      );
    }
  };

  const increasePrecision = () => {
    if (precision < MAX_PRECISION) {
      const newPrecision = precision + 1;
      const resubscribe = subscribeToBook(onMessage, PRECISIONS[precision]);
      resubscribe(PRECISIONS[newPrecision]);
      dispatch(setPrecision(newPrecision));
    }
  };

  const decreasePrecision = () => {
    if (precision > MIN_PRECISION) {
      const newPrecision = precision - 1;
      const resubscribe = subscribeToBook(onMessage, PRECISIONS[precision]);
      resubscribe(PRECISIONS[newPrecision]);
      dispatch(setPrecision(newPrecision));
    }
  };

  useEffect(() => {
    subscribeToBook(onMessage, PRECISIONS[precision]);
  }, [dispatch, asks, bids]);

  return (
    <div>
      <h2>Order Book</h2>
      <div className="precision-buttons">
        <button disabled={precision === MIN_PRECISION} onClick={decreasePrecision}>
          Decrease prec.
        </button>
        <button disabled={precision === MAX_PRECISION} onClick={increasePrecision}>
          Increase prec.
        </button>
      </div>
      <div className="table-container">
        <table className="order-book-table">
          <thead>
            <tr>
              <th className="col-count">Count</th>
              <th className="col-amount">Amount</th>
              <th className="col-total">Total</th>
              <th className="col-price">Price</th>
              <th className="col-price">Price</th>
              <th className="col-total">Total</th>
              <th className="col-amount">Amount</th>
              <th className="col-count">Count</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, index) => {
              const ask = asks[index] || [];
              return (
                <tr key={index}>
                  <td className="col-count">{bid[1]}</td>
                  <td className="col-amount">{bid[2]?.toFixed(4)}</td>
                  <td className="col-total">{Math.abs(bid[2] * bid[0])?.toFixed(4)}</td>
                  <td className="col-price">{bid[0]}</td>
                  <td className="col-price">{ask[0]}</td>
                  <td className="col-total">
                    {ask[2] ? Math.abs(ask[2] * ask[0])?.toFixed(4) : ''}
                  </td>
                  <td className="col-amount">{ask[2]?.toFixed(4)}</td>
                  <td className="col-count">{ask[1]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
