import {format} from "date-fns";
import {Link} from "react-router-dom";

export default function Post({ _id,title, summary, cover, content, createdAt, author}) {
    return (
      
      <div className="post">
          <Link to = {`/post/${_id}`}>
          <img className="image" src={'http://localhost:4000/'+cover} alt=""/>
          </Link>
        
        <Link to = {`/post/${_id}`}>
          <h2 className="titleSummary">{title}</h2>
          </Link>
          <p className="summary">{summary}</p>
          <p className="info">
            <a className="author">{author.username}</a>
            <time className="homeTime">{format(new Date(createdAt), 'MMM d, yyyy HH:mm')}</time>
            </p>
        
      </div>
      
    );
};

