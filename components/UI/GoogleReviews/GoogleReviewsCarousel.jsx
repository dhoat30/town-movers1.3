"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Container from "@mui/material/Container";
import Image from "next/image";
import GoogleReviewCard from "./GoogleReviewCard/GoogleReviewCard";
import Typography from "@mui/material/Typography";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import styles from "./GoogleReviewsCarousle.module.scss";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

// Rank reviews using service details that help a prospective customer decide.
// Reviewer names and demographic characteristics are deliberately not considered.
const REVIEW_SIGNALS = [
  ["on time", 6],
  ["punctual", 6],
  ["no hidden", 6],
  ["transparent", 5],
  ["careful", 5],
  ["no damage", 5],
  ["without any damage", 5],
  ["communication", 4],
  ["communicative", 4],
  ["professional", 4],
  ["efficient", 4],
  ["apartment", 3],
  ["stairs", 3],
  ["regional", 3],
  ["office", 3],
  ["fragile", 3],
  ["furniture", 2],
  ["belongings", 2],
  ["recommend", 2],
  ["price", 2],
  ["quote", 2],
];

function getReviewText(review) {
  return (review.text ?? review.snippet ?? "").trim();
}

function reviewQualityScore(review) {
  const text = getReviewText(review);
  const lowerText = text.toLowerCase();
  const detailScore = Math.min(text.length, 600) / 30;
  const helpfulScore = Math.min(Number(review.likes ?? 0), 5);
  const serviceScore = REVIEW_SIGNALS.reduce(
    (score, [signal, weight]) =>
      score + (lowerText.includes(signal) ? weight : 0),
    0,
  );

  return detailScore + helpfulScore + serviceScore;
}

export default function GoogleReviewsCarousel({ data }) {
  const resumeTimerRef = useRef(null);
  const reviews = Array.isArray(data) ? data : data?.reviews;
  const hasReviews = Array.isArray(reviews) && reviews.length > 0;

  // ✅ AutoScroll plugin
  const autoScroll = useMemo(
    () =>
      AutoScroll({
        speed: 0.6, // increase for faster
        startDelay: 0,
        stopOnInteraction: false, // keep moving after button clicks / drag
        stopOnMouseEnter: false, // IMPORTANT: do NOT pause on carousel hover
        // If your users drag, Embla will stop momentarily then continue
      }),
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true },
    [autoScroll],
  );

  const navigateCarousel = useCallback(
    (direction) => {
      if (!emblaApi) return;

      const plugin = emblaApi.plugins()?.autoScroll;
      plugin?.stop?.();
      direction === "previous" ? emblaApi.scrollPrev() : emblaApi.scrollNext();

      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => plugin?.play?.(), 2500);
    },
    [emblaApi],
  );

  const scrollPrev = useCallback(() => navigateCarousel("previous"), [navigateCarousel]);
  const scrollNext = useCallback(() => navigateCarousel("next"), [navigateCarousel]);

  useEffect(() => {
    return () => window.clearTimeout(resumeTimerRef.current);
  }, []);

  // ✅ Pause ONLY when hovering a card
  const handleCardMouseEnter = useCallback(() => {
    if (!emblaApi) return;
    const plugin = emblaApi.plugins()?.autoScroll;
    plugin?.stop?.();
  }, [emblaApi]);

  const handleCardMouseLeave = useCallback(() => {
    if (!emblaApi) return;
    const plugin = emblaApi.plugins()?.autoScroll;
    plugin?.play?.();
  }, [emblaApi]);

  if (!hasReviews) return null;

  const featuredReviews = reviews
    .filter((item) => {
      const rating = item.stars ?? item.rating;
      const text = getReviewText(item);

      return (
        item.showReviewInCarousel === true &&
        rating === 5 &&
        text.length >= 70
      );
    })
    .sort((reviewA, reviewB) => {
      const qualityDifference =
        reviewQualityScore(reviewB) - reviewQualityScore(reviewA);

      if (qualityDifference !== 0) return qualityDifference;

      return (
        new Date(reviewB.iso_date ?? 0).getTime() -
        new Date(reviewA.iso_date ?? 0).getTime()
      );
    })
    .slice(0, 12);

  if (featuredReviews.length === 0) return null;

  const averageRating =
    reviews.reduce((sum, review) => sum + Number(review.stars ?? review.rating ?? 0), 0) /
    reviews.length;

  const testimonialCardsJSX = featuredReviews.map((item) => {
    return (
      <GoogleReviewCard
        key={item.review_id || `${item.user?.name}-${item.iso_date}`}
        name={item.name ?? item.user?.name}
        description={item.text ?? item.snippet}
        customerPic={item.reviewerPhotoUrl ?? item.user?.thumbnail}
        date={item.date}
        reviewLink={item.link}
        characterLimit={210}
        onMouseEnter={handleCardMouseEnter}
        onMouseLeave={handleCardMouseLeave}
      />
    );
  });

  return (
    <section className={styles.section} aria-labelledby="google-reviews-title">
      <Container maxWidth="xl" className={styles.container}>
        <div className={styles.titleRow}>
          <div className={styles.headingContent}>
            <span className={styles.eyebrow}>Customer stories</span>
            <Typography variant="h2" component="h2" id="google-reviews-title" className={styles.title}>
              Trusted by people on the move
            </Typography>
            <Typography variant="body1" component="p" className={styles.intro}>
              Real feedback from customers who trusted our team with their move.
            </Typography>
          </div>

          <div className={styles.reviewSummary} aria-label={`${averageRating.toFixed(1)} out of 5 from ${reviews.length} Google reviews`}>
            <div className={styles.googleMark}>
              <Image src="/google-logo.png" alt="Google" width={24} height={24} />
            </div>
            <div>
              <div className={styles.ratingLine}>
                <strong>{averageRating.toFixed(1)}</strong>
                <div className={styles.summaryStars} aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <StarRoundedIcon key={index} />
                  ))}
                </div>
              </div>
              <span className={styles.reviewCount}>Based on {reviews.length} Google reviews</span>
            </div>
          </div>
        </div>

        <div className={styles.carouselHeader}>
          <Typography component="p" className={styles.featuredLabel}>Featured reviews</Typography>
          <div className={styles.controls}>
            <button type="button" onClick={scrollPrev} aria-label="Previous review">
              <ArrowBackRoundedIcon />
            </button>
            <button type="button" onClick={scrollNext} aria-label="Next review">
              <ArrowForwardRoundedIcon />
            </button>
          </div>
        </div>

        <div className={`${styles.carousel} embla`}>
          <div className="embla__viewport" ref={emblaRef}>
            <div className="embla__container">{testimonialCardsJSX}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
