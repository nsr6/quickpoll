from sqlmodel import Session, select
from .models import Poll, Option
from .schemas import PollCreate
from typing import List

def create_poll(session: Session, poll_in: PollCreate) -> Poll:
    poll = Poll(question=poll_in.question)
    session.add(poll)
    session.commit()
    session.refresh(poll)
    for opt in poll_in.options:
        option = Option(text=opt.text, poll_id=poll.id, votes=0)
        session.add(option)
    session.commit()
    session.refresh(poll)
    return poll

def get_polls(session: Session, limit: int = 50):
    stmt = select(Poll)
    polls = session.exec(stmt).all()
    # load options
    for p in polls:
        p.options = session.exec(select(Option).where(Option.poll_id == p.id)).all()
    return polls

def get_poll(session: Session, poll_id: int):
    p = session.get(Poll, poll_id)
    if p:
        p.options = session.exec(select(Option).where(Option.poll_id == p.id)).all()
    return p

def vote_option(session: Session, option_id: int):
    option = session.get(Option, option_id)
    if not option:
        return None
    option.votes += 1
    session.add(option)
    session.commit()
    session.refresh(option)
    return option

def like_poll(session: Session, poll_id: int):
    poll = session.get(Poll, poll_id)
    if not poll:
        return None
    poll.likes += 1
    session.add(poll)
    session.commit()
    session.refresh(poll)
    return poll

def delete_poll(session: Session, poll_id: int) -> bool:
    try:
        # Get the poll with its options
        poll = session.get(Poll, poll_id)
        if not poll:
            return False
            
        # Get and delete all options
        stmt = select(Option).where(Option.poll_id == poll_id)
        options = session.exec(stmt).all()
        for option in options:
            session.delete(option)
            
        # Delete the poll
        session.delete(poll)
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        print(f"Error deleting poll: {e}")
        raise
