from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, Text
from typing import List, Optional
import uuid
from .database import get_db
from . import models, schemas, auth

router = APIRouter(prefix="/api/posts", tags=["Posts & Discovery"])

@router.post("/", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post: schemas.PostCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    new_post = models.Post(**post.model_dump(), author_id=current_user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # Format comments (will be empty for a new post)
    formatted_comments = [
        schemas.CommentResponse(
            id=c.id,
            author=c.author.full_name if c.author else "Unknown",
            text=c.text
        ) for c in new_post.comments
    ]

    return {
        "id": new_post.id,
        "author_id": new_post.author_id,
        "authorName": current_user.full_name,
        "authorPhoto": current_user.profile_photo_url,
        "motherTongue": current_user.mother_tongue,
        "restaurantName": new_post.restaurant_name,
        "state": new_post.state,
        "city": new_post.city,
        "description": new_post.description,
        "keywords": new_post.keywords,
        "mapLink": new_post.map_link,
        "photos": new_post.photos,
        "likes": 0,
        "liked": False,
        "comments": formatted_comments,
        "created_at": new_post.created_at
    }

@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by restaurant name, city, state, or keywords"),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional) if hasattr(auth, 'get_current_user_optional') else None
):
    query = db.query(models.Post)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Post.restaurant_name.ilike(search_filter),
                models.Post.city.ilike(search_filter),
                models.Post.state.ilike(search_filter),
                models.Post.description.ilike(search_filter),
                cast(models.Post.keywords, Text).ilike(search_filter)
            )
        )
        
    posts = query.order_by(models.Post.created_at.desc()).all()
    
    response_data = []
    for post in posts:
        # Count likes
        likes_count = db.query(models.PostLike).filter(models.PostLike.post_id == post.id).count()
        
        # Check if current user liked it
        user_liked = False
        if current_user:
            existing_like = db.query(models.PostLike).filter(
                models.PostLike.post_id == post.id,
                models.PostLike.user_id == current_user.id
            ).first()  # <-- Added the missing closing parenthesis here
            if existing_like:
                user_liked = True

        # Format comments with author name
        formatted_comments = [
            schemas.CommentResponse(
                id=c.id,
                author=c.author.full_name if c.author else "Unknown",
                text=c.text
            ) for c in post.comments
        ]

        response_data.append({
            "id": post.id,
            "author_id": post.author_id,
            "authorName": post.author.full_name if post.author else "Unknown",
            "authorPhoto": post.author.profile_photo_url if post.author else None,
            "motherTongue": post.author.mother_tongue if post.author else "",
            "restaurantName": post.restaurant_name,
            "state": post.state,
            "city": post.city,
            "description": post.description,
            "keywords": post.keywords,
            "mapLink": post.map_link,
            "photos": post.photos,
            "likes": likes_count,
            "liked": user_liked,
            "comments": formatted_comments,
            "created_at": post.created_at
        })

    return response_data

@router.post("/{post_id}/like", status_code=status.HTTP_200_OK)
def like_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Post not found")
        
    existing_like = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == current_user.id
    ).first()
    
    if not existing_like:
        new_like = models.PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        db.commit()
        
    return {"message": "Post liked successfully"}


@router.delete("/{post_id}/like", status_code=status.HTTP_200_OK)
def unlike_post(
    post_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing_like = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        db.delete(existing_like)
        db.commit()
        
    return {"message": "Post unliked successfully"}


@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: uuid.UUID,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Post not found")
        
    new_comment = models.Comment(
        post_id=post_id,
        author_id=current_user.id,  # <-- Fixed to match your database column name
        text=comment.text
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {
        "id": new_comment.id,
        "author": current_user.full_name,
        "text": new_comment.text
    }