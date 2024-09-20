import Post from "../components/Post";
import Pagination from "../Pagination";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 3;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/post?page=${currentPage}&limit=${postsPerPage}`).then((response) => {
      response.json().then(({ posts, totalPages }) => {
        setPosts(posts);
        setTotalPages(totalPages);
      });
    });
  }, [currentPage]);

  return (
    <>
      <div className="posts">
        {posts.length > 0 && posts.map((post) => <Post key={post._id} {...post} />)}
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}