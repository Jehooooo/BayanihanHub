import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';
import Textarea from '@/components/ui/Textarea';
import toast from 'react-hot-toast';

export default function RatingPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Thank you! Rating submitted successfully.');
      navigate('/dashboard');
    }, 600);
  };

  return (
    <PageLayout>
      <div className="max-w-md mx-auto py-8">
        <Card className="text-center space-y-6 border border-neutral-200 shadow-card">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-neutral-900">Rate Your Exchange</h1>
            <p className="text-xs text-neutral-500">Share feedback about your exchange partner</p>
          </div>

          {/* User & Exchange info */}
          <div className="space-y-3 py-4 border-y border-neutral-100 bg-neutral-50/60 rounded-[var(--radius-md)] p-4">
            <Avatar name="Juan Dela Cruz" size="xl" className="mx-auto shadow-sm" />
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Juan Dela Cruz</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Exchanged: <strong>Men's Jacket</strong></p>
              <p className="text-[10px] text-neutral-400 font-medium">Completed on June 15, 2026</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                How was your experience?
              </label>
              <div className="flex justify-center pt-1">
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>
            </div>

            <Textarea
              label="Write a review (optional)"
              placeholder="Was the partner punctual, friendly, and honest about item condition?..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />

            <Button variant="primary" size="lg" fullWidth type="submit" isLoading={isSubmitting} className="font-bold shadow-button">
              Submit Rating & Review
            </Button>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
