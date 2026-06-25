import { Link } from "react-router-dom";
import blogData from "../utils/blog_data.json";

function HomeBlog() {
  return (
    <div className="h1-blog-area mb-120">
      <div className="container">
        <div className="row mb-50">
          <div className="col-lg-12 d-flex justify-content-center">
            <div className="section-title1 text-center">
              <span>
                <img src="assets/images/icon/section-vec-l2.svg" alt="" />
                Latest Blog
                <img src="assets/images/icon/section-vec-r2.svg" alt="" />
              </span>
              <h2>valueable words from Customers</h2>
            </div>
          </div>
        </div>
        <div className="row g-lg-4 gy-5 justify-content-center">
          {blogData.slice(0, 3).map((item) => {
            const { id, image, category, date, title } = item;
            return (
              <div key={id} className="col-lg-4 col-md-6 col-sm-10">
                <div className="h1-blog-card">
                  <div className="blog-img">
                    <img className="img-fluid" src={image} alt="" />
                    <div className="category">
                      <Link to="/blog-grid">{category}</Link>
                    </div>
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <Link to="/blog-grid">{date}</Link>
                    </div>
                    <h4>
                      <Link to="/blog-details">{title}</Link>
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HomeBlog;
