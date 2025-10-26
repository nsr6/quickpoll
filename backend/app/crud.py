from sqlmodel import Session, select
from .models import Poll, Option
from .schemas import PollCreate
from typing import List

import secrets

def create_poll(session: Session, poll_in: PollCreate) -> Poll:
    token = secrets.token_urlsafe(16)
    poll = Poll(question=poll_in.question, token=token)
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

def edit_poll(session: Session, poll_id: int, question: str, options: list) -> bool:
    """Edit a poll's question and options.

    `options` is a list of dicts with optional 'id' and required 'text'.
    Existing options with matching ids will be updated. New options (no id)
    will be created. Options not present in the incoming list will be deleted.
    """
    try:
        poll = session.get(Poll, poll_id)
        if not poll:
            return False
        poll.question = question

        # Get existing options mapped by id
        existing_options = {opt.id: opt for opt in session.exec(select(Option).where(Option.poll_id == poll_id)).all()}
        new_option_ids = set()

        # Process incoming options
        for opt in options:
            if isinstance(opt, dict) and 'id' in opt and opt['id'] in existing_options:
                # Edit existing option
                existing_options[opt['id']].text = opt.get('text', existing_options[opt['id']].text)
                new_option_ids.add(opt['id'])
            else:
                # Add new option
                new_opt = Option(text=opt.get('text', ''), poll_id=poll_id, votes=opt.get('votes', 0))
                session.add(new_opt)

        # Delete removed options
        for oid, o in existing_options.items():
            if oid not in new_option_ids:
                session.delete(o)

        session.add(poll)
        session.commit()
        session.refresh(poll)
        return True
    except Exception as e:
        session.rollback()
        print(f"Error editing poll: {e}")
        raise
