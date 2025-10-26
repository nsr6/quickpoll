from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import datetime

class Option(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    votes: int = 0
    poll_id: Optional[int] = Field(default=None, foreign_key="poll.id")
    # forward reference to Poll
    poll: Optional["Poll"] = Relationship(back_populates="options")

class Poll(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    question: str
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    likes: int = 0
    token: str = Field(default="", index=True)
    options: List[Option] = Relationship(back_populates="poll")
