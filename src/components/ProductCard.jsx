import { Link } from "react-router-dom";

const ProductCard = ({ id, img, name, price, description }) => {
  return (
    <div className="collection-card">
      <div className="collection-img">
        <img
          className="img-fluid"
          src={img}
          alt=""
          style={{ objectFit: "cover", height: 218, width: "100%" }}
        />
        <div className="view-dt-btn">
          <div className="plus-icon">
            <i className="bi bi-plus" />
          </div>
          <Link to={`/package/detail/${id}`}>View Details</Link>
        </div>
        <ul className="cart-icon-list">
          <li>
            <a href="#">
              <img src="assets/images/icon/Icon-cart3.svg" alt="" />
            </a>
          </li>
        </ul>
      </div>
      <div className="collection-content text-center">
        <h4>
          <Link to={`/package/detail/${id}`}>{name}</Link>
        </h4>
        <div className="price">
          <h6>${price}</h6>
        </div>
        <div>
          <span
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              paddingLeft: "18px",
              paddingRight: "18px",
            }}
          >
            {description}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
