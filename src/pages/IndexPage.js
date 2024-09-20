import Post from "../components/Post";
import Pagination from "../Pagination";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/post`).then((response) => {
      response.json().then((posts) => {
        setPosts(posts);
      });
    });
  }, []);

  // Calculate the indexes for the posts to display on the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Calculate total pages
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <>
      <img
        className="headerImg"
        src="https://i0.wp.com/mymeadowreport.com/wp-content/uploads/2020/07/img_4343.jpg?fit=1000%2C667&ssl=1"
        alt="Header"
      />
      <div className="posts">
        {currentPosts.length > 0 &&
          currentPosts.map((post) => <Post key={post.id} {...post} />)}
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}