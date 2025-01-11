import React, { useEffect, useState } from "react";
import { PostType, CommentPostType } from "./App";
import { BASE_URL } from "./App";
import { Avatar, Button } from "@mui/material";

interface PostProps {
    post: PostType;
    authToken: string | null;
    authTokenType: string | null;
    username: string | null;
  }

const Post: React.FC<PostProps> = ({ post, authToken, authTokenType, username }) => {

    const [imageUrl, setImageUrl] = useState<string>('');
    const [comments, setComments] = useState<CommentPostType[]>([]);
    const [newComment, setNewComment] = useState<string>('');

    useEffect(() => {
        if (post.image_url_type === 'absolute') {
            setImageUrl(post.image_url)
        } else {
            setImageUrl(BASE_URL + post.image_url)
        }
    }, [])

    useEffect(() => {
        setComments(post.comments)
    }, [])

    const handleDelete = (event: any) => {
        event.preventDefault();

        const requestOptions = {
            method: 'DELETE',
            headers: new Headers({
                'Authorization': authTokenType + ' ' + authToken
            })
        }

        fetch(BASE_URL + 'post/delete/' + post.id, requestOptions)
            .then(response => {
                console.log(response)
                if (response.ok) {
                    window.location.reload()
                }
            })
            .catch(error => {
                console.log(error)
            })
    }

    const postComment = (event: any) => {
        event.preventDefault();

        const json_string = JSON.stringify({
            'username': username,
            'text': newComment,
            'post_id': post.id
        })

        const requestOptions = {
            method: 'POST',
            headers: new Headers({
                'Authorization': authTokenType + ' ' + authToken,
                'Content-Type': 'application/json'
            }),
            body: json_string
        }

        fetch(BASE_URL + 'comment', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }

                throw response
            })
            .then(() => {
                fetchComments();
            })
            .catch(error => {
                console.log(error)
            })
            .finally(() => {
                setNewComment('');
            })
    }

    const fetchComments = () => {
        fetch(BASE_URL + 'comment/all/' + post.id)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then(data => {
                setComments(data)
            })
            .catch(error => {
                console.log(error)
            })
    }

    return (
        <div className="post">
            <div className="post-header">
                <Avatar alt='User' />
                <div className="post-header-info">
                    <h3>{post.user.username}</h3>
                    <Button className="post-delete" onClick={handleDelete} >Delete</Button>
                </div>
            </div>
            <img className="post-image" src={imageUrl} alt="post" />
            <p className="post-text">{post.caption}</p>
            <div className="post-comments">
                {comments.map((comment) => (
                    <p>
                        <strong>{comment.username}:</strong>
                        {comment.text}
                    </p>
                ))}
            </div>

            {authToken && (
                <form className="post-comment-box">
                    <input type="text" className="post-input" placeholder="Add comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                    <button className="post-button" type="submit" disabled={!newComment} onClick={postComment}>Add</button>
                </form>
            )}
        </div>
    );
};

export default Post;
