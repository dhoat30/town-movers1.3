import React, { useState } from "react";
import Image from "next/image";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import GoogleIcon from "../../Icons/GoogleIcon";
import styles from '../GoogleReviewsCarousle.module.scss'
export default function GoogleReviewCard({ name = "Google customer", description = "", customerPic, className = "", showFacebookLogo, characterLimit = 180, date, reviewLink, onMouseEnter, onMouseLeave }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const numberOfStars = 5;
  const starsJSX = Array.from({ length: numberOfStars }, (_, index) => (
    <StarIcon key={index} sx={{ color: "#FABB05", fontSize: "1rem" }} />
  ));

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Limit description to 200 characters if not expanded
  const shortDescription =
    description.length > characterLimit
      ? description.slice(0, characterLimit) + "..."
      : description;
let sourceLogo = showFacebookLogo ? <Image src="/facebook-reviews.png" alt="facebook page" width={96} height={24}/> :   <GoogleIcon />;
  return (
    <article
      className={`${className} ${styles.slide} embla__slide`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
    >
      <div className={styles.cardTop}>
        <div className={styles.stars} aria-label="5 out of 5 stars">{starsJSX}</div>
        {sourceLogo}
      </div>
      <div className={styles.descriptionWrapper}>
        <Typography variant="body1" component="p">
          {isExpanded ? description : shortDescription}
        </Typography>
        {description.length > characterLimit && (
          <button onClick={toggleExpand} className={`${styles.readMorebutton}`}>
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
      <div className={styles.profileWrapper}>
        {customerPic ? (
          <Image src={customerPic} alt="" width={44} height={44} sizes="44px" />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
        )}
        <div className={styles.nameWrapper}>
          <Typography variant="subtitle1" component="h3">{name}</Typography>
          <span>{date || "Google review"}</span>
        </div>
        {reviewLink && (
          <a className={styles.reviewLink} href={reviewLink} target="_blank" rel="noreferrer" aria-label={`View ${name}'s review on Google`}>
            View
          </a>
        )}
      </div>
    </article>
  );
}


