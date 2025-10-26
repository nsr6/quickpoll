from pydantic import BaseModel
from typing import List, Optional

class OptionCreate(BaseModel):
    text: str

class PollCreate(BaseModel):
    question: str
    options: List[OptionCreate]

class OptionOut(BaseModel):
    id: int
    text: str
    votes: int

    class Config:
        orm_mode = True

class PollOut(BaseModel):
    id: int
    question: str
    likes: int
    token: str
    options: List[OptionOut]

    class Config:
        orm_mode = True
