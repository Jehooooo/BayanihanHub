import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Star, CheckCircle2, AlertCircle, ArrowLeft, Package, Clock } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Textarea from '@/components/ui/Textarea';
import { exchangeService } from '@/services/exchange.service';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import SEO from '@/components/common/SEO';

export default function RatingPage() {
  const { exchangeId: paramExchangeId } = useParams<{ exchangeId?: string }>();
  const [searchParams] = useSearchParams();
  const queryExchangeId = searchParams.get('exchangeId');
  const activeExchangeId = paramExchangeId || queryExchangeId || '';

  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [score, setScore] = useState<number>(5);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [eligibilityData, setEligibilityData] = useState<any>(null);
  const [completedExchanges, setCompletedExchanges] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    if (activeExchangeId) {
      // Check eligibility for specific exchange
      exchangeService
        .getRatingEligibility(activeExchangeId)
        .then((res) => {
          if (!isMounted) return;
          setEligibilityData(res);
          if (res.alreadyRated && res.existingRating) {
            setScore(res.existingRating.score);
            setReview(res.existingRating.review || '');
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          setErrorMsg(err.message || 'Unable to load rating details.');
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      // If no exchangeId specified, fetch user's completed exchanges
      exchangeService
        .getExchanges(currentUser?.id)
        .then((list) => {
          if (!isMounted) return;
          const completed = list.filter((e) => e.status === 'completed');
          setCompletedExchanges(completed);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error(err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeExchangeId, currentUser?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExchangeId || isSubmitting) return;

    if (score < 1 || score > 5) {
      toast.error('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await exchangeService.submitRating(activeExchangeId, {
        score,
        review: review.trim(),
        ratedUserId: eligibilityData?.partner?.userId,
      });

      toast.success('Rating submitted successfully.');
      navigate('/profile');
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
    <PageLayout>
      <SEO title="Rate Interaction | BayanihanHub" noindex={true} />
      <div className="max-w-xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <Link
            to="/exchanges"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Exchanges
          </Link>
        </div>

        {isLoading ? (
          <Card className="text-center py-16 space-y-3 border border-neutral-200">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-neutral-600">Loading rating information...</p>
          </Card>
        ) : !activeExchangeId ? (
          /* List of Completed Deals to Rate */
          <Card className="space-y-6 border border-neutral-200 p-6">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-extrabold text-neutral-900">Rate Completed Interactions</h1>
              <p className="text-xs text-neutral-500">
                You can only rate community members you have completed a verified deal or exchange with.
              </p>
            </div>

            {completedExchanges.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <Package className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-sm font-semibold text-neutral-700">No completed interactions to rate yet</p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Complete an exchange or item handover with a neighbor first. Once marked completed, you will be eligible to share feedback.
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="sm" onClick={() => navigate('/exchanges')}>
                    View Active Exchanges
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Select a Completed Interaction to Rate:
                </h3>
                <div className="space-y-2.5">
                  {completedExchanges.map((exc) => {
                    const isOfferer = String(exc.offererId) === String(currentUser?.id);
                    const partner = isOfferer ? exc.receiver : exc.offerer;
                    const partnerName = partner?.fullName || partner?.username || 'Neighbor';

                    return (
                      <div
                        key={exc.id}
                        className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-neutral-50 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={partnerName} size="md" className="flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-neutral-900 truncate">{partnerName}</p>
                            <p className="text-xs text-neutral-500 truncate">
                              Item: {exc.offeredItem?.title || exc.requestedItem?.title || 'Exchange'}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/rate/${exc.id.replace('exc-', '')}`)}
                        >
                          Rate Partner
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        ) : eligibilityData?.alreadyRated ? (
          /* Already Rated State */
          <Card className="text-center space-y-6 border border-neutral-200 p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-neutral-900">Rating Already Submitted</h2>
              <p className="text-xs text-neutral-500">
                You rated {eligibilityData?.partner?.fullName || 'your partner'} for this interaction.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-600">Your Submitted Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= (eligibilityData.existingRating?.score || 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-neutral-300 stroke-neutral-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-extrabold text-neutral-800 ml-1">
                    {eligibilityData.existingRating?.score}/5
                  </span>
                </div>
              </div>
              {eligibilityData.existingRating?.review && (
                <p className="text-xs text-neutral-700 italic border-t border-neutral-200 pt-2 mt-2">
                  "{eligibilityData.existingRating.review}"
                </p>
              )}
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" size="md" onClick={() => navigate('/exchanges')}>
                Return to Exchanges
              </Button>
              <Button variant="primary" size="md" onClick={() => navigate('/profile')}>
                View My Profile
              </Button>
            </div>
          </Card>
        ) : !eligibilityData?.eligible ? (
          /* Ineligible State */
          <Card className="text-center space-y-6 border border-red-200 p-6 bg-red-50/40">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-neutral-900">Ineligible to Rate</h2>
              <p className="text-xs text-red-700 max-w-sm mx-auto">
                {eligibilityData?.reason || errorMsg || 'Only verified completed interactions between legitimate participants can be rated.'}
              </p>
            </div>
            <div>
              <Button variant="outline" size="md" onClick={() => navigate('/exchanges')}>
                Back to Exchanges
              </Button>
            </div>
          </Card>
        ) : (
          /* Valid Rating Form */
          <Card className="space-y-6 border border-neutral-200 shadow-sm p-6">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-extrabold text-neutral-900">
                Rate {eligibilityData?.partner?.fullName || 'Partner'}
              </h1>
              <p className="text-xs text-neutral-500">
                Provide honest feedback about your completed interaction
              </p>
            </div>

            {/* Interaction Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <Avatar
                src={eligibilityData?.partner?.avatar}
                name={eligibilityData?.partner?.fullName || 'Neighbor'}
                size="lg"
                className="flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-neutral-900 text-sm truncate">
                  {eligibilityData?.partner?.fullName}
                </h3>
                {eligibilityData?.partner?.itemTitle && (
                  <p className="text-xs text-neutral-600 truncate mt-0.5">
                    Completed Deal: <span className="font-semibold">{eligibilityData.partner.itemTitle}</span>
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Deal
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Star Rating Select */}
              <div className="space-y-2 text-center py-2">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                  How was your experience?
                </label>
                <div className="flex justify-center items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= currentDisplayScore;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setScore(starVal)}
                        onMouseEnter={() => setHoverScore(starVal)}
                        onMouseLeave={() => setHoverScore(0)}
                        className="p-1 transition-transform duration-150 hover:scale-125 focus:outline-none"
                        aria-label={`Select ${starVal} star${starVal > 1 ? 's' : ''}`}
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
                <div className="text-sm font-extrabold text-neutral-900 pt-1">
                  Your Rating: <span className="text-amber-500">{currentDisplayScore}</span> / 5
                </div>
              </div>

              {/* Review Textarea */}
              <div className="space-y-1.5">
                <label htmlFor="review-text" className="text-xs font-bold text-neutral-700">
                  Review <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <Textarea
                  id="review-text"
                  placeholder="Share helpful feedback (punctuality, friendliness, item accuracy)..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  disabled={isSubmitting}
                />
                <p className="text-[11px] text-neutral-400 text-right">
                  {review.length}/1000 characters
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/exchanges')}
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
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
