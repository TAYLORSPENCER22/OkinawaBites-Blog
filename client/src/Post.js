import {format} from "date-fns";
import {Link} from "react-router-dom";
import {getAuthorColor} from "./authorColor";

export default function Post({ _id,title, summary, cover, content, createdAt, author, location}) {
    return (

      <div className="post">
          {cover && (
            <Link to = {`/post/${_id}`}>
            <img className="image" src={cover.startsWith('http') ? cover : 'http://localhost:4000/'+cover} alt=""/>
            </Link>
          )}

        <Link to = {`/post/${_id}`}>
          <h2 className="titleSummary">{title}</h2>
          </Link>
          {location && <p className="post-location">📍 {location.name}</p>}
          <p className="summary">{summary}</p>
          <p className="info">
            <a className="author" style={{backgroundColor: getAuthorColor(author.username)}}>{author.username}</a>
            <time className="homeTime">{format(new Date(createdAt), 'MMM d, yyyy HH:mm')}</time>
            </p>

      </div>

    );
};

