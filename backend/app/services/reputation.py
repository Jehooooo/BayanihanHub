"""
BayanihanHub Reputation, Dynamic Rating, and Badge Evaluation Engine.
Provides centralized calculation of:
- Dynamic average ratings and 5-star distribution breakdowns
- Bayesian ranking formula for fair leaderboard sorting
- Reputation tiers based on rating average, volume, and completed deals
- Automatic badge eligibility evaluation
"""
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime

from app.models.exchange import Rating, Exchange, ExchangeParticipant
from app.models.user import User, UserBadge, Badge
from app.services.notifications import create_notification


# Prior platform parameters for Bayesian Weighted Ranking
BAYESIAN_MIN_RATINGS_WEIGHT = 3.0   # 'm'
BAYESIAN_PRIOR_MEAN = 4.5           # 'C'


def calculate_user_reputation_stats(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Computes real-time dynamic reputation statistics for a user using active ratings.
    Hidden/moderated ratings are strictly excluded.
    """
    # 1. Fetch all active ratings received by this user
    active_ratings = (
        db.query(Rating)
        .filter(Rating.rated_user_id == user_id, Rating.status == "active")
        .all()
    )

    total_ratings = len(active_ratings)
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    total_score = 0

    for r in active_ratings:
        score = int(r.score)
        if 1 <= score <= 5:
            distribution[score] += 1
            total_score += score

    average_rating: Optional[float] = None
    if total_ratings > 0:
        average_rating = round(total_score / total_ratings, 2)

    # 2. Count completed exchanges/deals (status_id = 4)
    completed_deals = (
        db.query(func.count(ExchangeParticipant.exchange_id.distinct()))
        .join(Exchange, Exchange.exchange_id == ExchangeParticipant.exchange_id)
        .filter(
            ExchangeParticipant.user_id == user_id,
            Exchange.exchange_status_id == 4,  # completed
        )
        .scalar() or 0
    )

    # 3. Determine Reputation Level
    # Formula factors average rating, number of ratings, and completed interactions
    if total_ratings == 0:
        reputation_level = "New Member"
    elif total_ratings >= 20 and (average_rating or 0) >= 4.8 and completed_deals >= 15:
        reputation_level = "Outstanding"
    elif total_ratings >= 10 and (average_rating or 0) >= 4.5 and completed_deals >= 8:
        reputation_level = "Top Contributor"
    elif total_ratings >= 5 and (average_rating or 0) >= 4.2 and completed_deals >= 4:
        reputation_level = "Very Trusted"
    elif total_ratings >= 2 and (average_rating or 0) >= 4.0:
        reputation_level = "Trusted"
    else:
        reputation_level = "Active Member"

    # 4. Bayesian Weighted Score for fair ranking:
    # Score = (v / (v + m)) * R + (m / (v + m)) * C + min(completed_deals * 0.02, 0.40)
    # v = valid rating count, m = 3, R = user average, C = 4.5 prior mean
    if total_ratings > 0 and average_rating is not None:
        v = float(total_ratings)
        m = BAYESIAN_MIN_RATINGS_WEIGHT
        R = float(average_rating)
        C = BAYESIAN_PRIOR_MEAN
        base_score = (v / (v + m)) * R + (m / (v + m)) * C
        deal_bonus = min(completed_deals * 0.02, 0.40)
        bayesian_score = round(base_score + deal_bonus, 3)
    else:
        bayesian_score = round(min(completed_deals * 0.05, 0.50), 3)

    return {
        "userId": user_id,
        "totalRatings": total_ratings,
        "averageRating": average_rating,
        "distribution": distribution,
        "completedDeals": completed_deals,
        "reputationLevel": reputation_level,
        "bayesianScore": bayesian_score,
    }


def check_and_award_automatic_badges(db: Session, user_id: int) -> List[str]:
    """
    Checks if a user qualifies for any automatic badges and awards them if not yet possessed.
    Returns list of newly awarded badge names.
    """
    stats = calculate_user_reputation_stats(db, user_id)
    total_ratings = stats["totalRatings"]
    avg_rating = stats["averageRating"] or 0.0
    completed_deals = stats["completedDeals"]

    # Existing active badges
    existing_badges = {
        ub.badge.badge_code
        for ub in db.query(UserBadge)
        .join(Badge, Badge.badge_id == UserBadge.badge_id)
        .filter(UserBadge.user_id == user_id, UserBadge.status == "active")
        .all()
        if ub.badge
    }

    newly_awarded = []

    badge_rules = [
        # (badge_code, qualifies_bool, reason)
        ("community_star", total_ratings >= 3 and avg_rating >= 4.5, "Maintained 4.5+ star average across 3+ community ratings"),
        ("highly_rated", total_ratings >= 5 and avg_rating >= 4.7, "Maintained an exceptional 4.7+ star rating with 5+ ratings"),
        ("active_exchanger", completed_deals >= 10, "Successfully completed 10+ community exchanges and deals"),
        ("trusted_donor", completed_deals >= 10, "Completed 10+ generous item donations and handovers"),
    ]

    for code, qualifies, reason in badge_rules:
        if qualifies and code not in existing_badges:
            badge_obj = db.query(Badge).filter(Badge.badge_code == code).first()
            if badge_obj:
                new_ub = UserBadge(
                    user_id=user_id,
                    badge_id=badge_obj.badge_id,
                    awarded_by=None,
                    reason=reason,
                    status="active",
                    earned_at=datetime.now(),
                )
                db.add(new_ub)
                newly_awarded.append(badge_obj.name)

                # Send in-app notification
                create_notification(
                    db=db,
                    user_id=user_id,
                    type_code="system",
                    title="New Badge Earned!",
                    message=f"Congratulations! You earned the '{badge_obj.name}' badge: {badge_obj.description}",
                    link="/profile",
                )

    if newly_awarded:
        db.commit()

    return newly_awarded
