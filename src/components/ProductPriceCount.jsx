import React, { useState } from "react";

const ProductPriceCount = ({ price, countable }) => {
  const [count, setCount] = useState(1);
  const currentRoute = window.location.pathname;

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  return (
    <div className="product-total d-flex align-items-center">
      {countable && (
        <div className="quantity">
          <div className="quantity d-flex align-items-center">
            <div className="quantity-nav nice-number d-flex align-items-center">
              <button onClick={decrement} type="button">
                <i className="bi bi-dash"></i>
              </button>
              <span
                style={{
                  margin: "0 15px",
                  fontFamily: "var(--font-cabin)",
                  color: "var(--title-color1)",
                  fontSize: "16px",
                }}
              >
                {count}
              </span>
              <button onClick={increment} type="button">
                <i className="bi bi-plus"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      {currentRoute === "/shop-details" ? (
        ""
      ) : (
        <strong>
          {countable && <i className="bi bi-x-lg px-2" />}
          <span
            className="product-price"
            style={{
              margin: "0 px",
              fontFamily: "var(--font-cabin)",
              color: "var(--title-color1)",
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            ${(count * price).toFixed(2)}
          </span>
        </strong>
      )}
    </div>
  );
};

export default ProductPriceCount;
