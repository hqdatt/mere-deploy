import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({
  _id,
  title,
  cover,
  content,
  createdAt,
  author,
}) {
  return (
    <div className="post">
      <div className="image">
         <Link to={`/post/${_id}`}>
            <img src={cover} alt="" />
         </Link>
      </div>
      <div className="texts">
        <div className="title-container">
          <Link to={`/post/${_id}`}>
            <h2>{title}</h2>
          </Link>
        </div>
        <Link to={`/post/${_id}`}>
          <p className="info">
            <time>{format(new Date(createdAt), 'MMMM d, yyyy')}</time>
          </p>
        </Link>
      </div>
    </div>
  );
}