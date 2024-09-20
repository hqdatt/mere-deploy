import { useContext, useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [redirect,setRedirect] = useState(false);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/post/${id}`).then((response) => {
      response.json().then((postInfo) => {
        setPostInfo(postInfo);
      });
    });
  }, [id]);

  if (!postInfo) return "";

  const handleDelete = async (postId, fileName) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (confirmDelete) {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/post`, {
        method: "DELETE",
        body: JSON.stringify({ id: postId, fileName: fileName.split('/').pop() }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        alert("Post deleted successfully");
        setRedirect(true);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete post: ${errorData.message}`);
      }
    }
  };

  if (redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{format(new Date(postInfo.createdAt), 'MMMM d, yyyy')}</time>
      {userInfo.id === postInfo.author._id && (
        <div className="edit-row-container">
          <div className="edit-row">
            <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
              </svg>
            </Link>
          </div>
          <div className="edit-row">
            <button className="delete-btn" onClick={() => handleDelete(postInfo._id, postInfo.cover)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75V6h12v12.75A2.25 2.25 0 0115.75 21H8.25A2.25 2.25 0 016 18.75zM9 9.75V16.5m3-6.75v6.75M5.25 6l.75-1.5h12L18.75 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="image">
        <img src={postInfo.cover} alt="" />
      </div>
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
      />
    </div>
  );
}