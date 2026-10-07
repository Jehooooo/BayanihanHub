import React, { useState, useEffect } from 'react';
import { Star, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Textarea from '@/components/ui/Textarea';
import { exchangeService } from '@/services/exchange.service';
import toast from 'react-hot-toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeId: string;
  partnerName: string;
  partnerId?: string | number;
  partnerAvatar?: string;
  itemTitle?: string;
  onSuccess?: (newRating: any) => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  exchangeId,
  partnerName,
  partnerId,
  partnerAvatar,
  itemTitle,
  onSuccess,
}: RatingModalProps) {
  const [score, setScore] = useState<number>(5);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  const [isEligible, setIsEligible] = useState<boolean>(true);
  const [alreadyRated, setAlreadyRated] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !exchangeId) return;

    setErrorMsg(null);
    setScore(5);
    setReview('');
    setIsCheckingEligibility(true);

    exchangeService
      .getRatingEligibility(exchangeId)
      .then((res) => {
        setIsEligible(res.eligible);
        setAlreadyRated(res.alreadyRated);
        if (!res.eligible && res.reason) {
          setErrorMsg(res.reason);
        }
      })
      .catch(() => {
        setIsEligible(true);
      })
      .finally(() => {
        setIsCheckingEligibility(false);
      });
  }, [isOpen, exchangeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (score < 1 || score > 5) {
      setErrorMsg('Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await exchangeService.submitRating(exchangeId, {
        score,
        review: review.trim(),
        ratedUserId: partnerId,
      });

      toast.success('Rating submitted successfully.');
      if (onSuccess) {
        onSuccess(res.rating);
      }
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Unable to submit rating. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayScore = hoverScore || score;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={`Rate ${partnerName}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Partner Info Banner */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
          <Avatar
            src={partnerAvatar}
            name={partnerName}
            size="lg"
            className="flex-shrink-0 shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-neutral-900 truncate">{partnerName}</h4>
            {itemTitle && (
              <p className="text-xs text-neutral-600 truncate mt-0.5">
                Completed Interaction: <span className="font-semibold text-neutral-800">{itemTitle}</span>
              </p>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Completed Deal
            </span>
          </div>
        </div>

        {/* Loading Eligibility State */}
        {isCheckingEligibility ? (
          <div className="py-8 text-center text-sm text-neutral-500">
            <span className="inline-block animate-spin mr-2">⟳</span>
            Checking rating eligibility...
          </div>
        ) : alreadyRated ? (
          /* Already Rated State */
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Rating Already Submitted</p>
              <p className="text-xs text-amber-800 mt-1">
                You have already rated this completed transaction. To maintain fair platform integrity, only one rating is permitted per completed interaction.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : !isEligible ? (
          /* Ineligible State */
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Not Eligible to Rate</p>
              <p className="text-xs text-red-700 mt-1">
                {errorMsg || 'You are only eligible to rate users from verified, completed transactions.'}
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Rating Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Star Selection */}
            <div className="text-center space-y-2 py-2">
              <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block">
                How was your experience?
              </label>

              {/* 5 SVG Stars */}
              <div className="flex items-center justify-center gap-2 pt-1" role="group" aria-label="Star Rating Selection">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= currentDisplayScore;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setScore(starVal)}
                      onMouseEnter={() => setHoverScore(starVal)}
                      onMouseLeave={() => setHoverScore(0)}
                      className="p-1 transition-transform duration-150 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                      aria-label={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-9 h-9 transition-colors duration-150 ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-neutral-300 stroke-neutral-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Your Rating: X/5 */}
              <div className="text-sm font-extrabold text-neutral-900 pt-1">
                Your Rating: <span className="text-amber-500">{currentDisplayScore}</span> / 5
              </div>
            </div>

            {/* Optional Review Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="rating-review" className="text-xs font-bold text-neutral-700">
                Review <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <Textarea
                id="rating-review"
                placeholder="Share your experience (e.g. punctuality, communication, item condition)..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                maxLength={1000}
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-neutral-400 text-right">
                {review.length}/1000 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="font-bold shadow-sm"
              >
                {isSubmitting ? 'Submitting Rating...' : 'Submit Rating'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
