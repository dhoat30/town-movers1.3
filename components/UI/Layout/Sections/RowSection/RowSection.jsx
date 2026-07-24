import React from "react";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Button from "@mui/material/Button";
import Link from "next/link";
import Container from "@mui/material/Container";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BeforeAfter from "../../../BeforeAfterSlider/BeforeAfter";
import styles from "./RowSection.module.scss";
import CustomAccordion from "@/components/UI/Accordion/CustomAccordion";

function RichDescription({ html }) {
  const contentParts = html.split(/(<ul[\s\S]*?<\/ul>)/gi);

  return contentParts.map((contentPart, partIndex) => {
    if (!/^<ul/i.test(contentPart.trim())) {
      return (
        <div
          key={`content-${partIndex}`}
          dangerouslySetInnerHTML={{ __html: contentPart }}
        />
      );
    }

    const listItems = Array.from(
      contentPart.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi),
      (match) => match[1],
    );

    return (
      <ul className={styles.richBulletList} key={`list-${partIndex}`}>
        {listItems.map((listItem, itemIndex) => (
          <li key={`item-${itemIndex}`}>
            <CheckCircleOutlineRoundedIcon aria-hidden="true" />
            <div
              className={styles.richBulletContent}
              dangerouslySetInnerHTML={{ __html: listItem }}
            />
          </li>
        ))}
      </ul>
    );
  });
}

export default function RowSection({
  title,
  subtitle,
  description,
  imageAlignment,
  image,
  ctaGroup,
  bulletPoints,
  showBeforeAfterImages,
  beforeImage,
  afterImage,
  accordionData, 
  backgroundColor, 
  fontColor
}) {
  const contentAlignment = imageAlignment === "left" ? "2 / 3" : "1 / 2";

  return (
    <section className={`${styles.section}`} id="services" style={{background: backgroundColor ? backgroundColor : null}}>
      <Container maxWidth="xl">
        <div className={`${styles.wrapper} ${imageAlignment === "right" ? styles.imageRight : ""}`}>
          <div
            className={`${styles.contentWrapper} `}
            style={{ gridColumn: contentAlignment }}
          >
            {subtitle && (
              <Typography variant="subtitle2" component="div" className={styles.subtitle} sx={{color: fontColor}}>
                {subtitle}
              </Typography>
            )}
            <Typography variant="h4" component="h2" className={`${styles.title}`} sx={{color: "var(--light-primary)"}}>
              {title}
            </Typography>

            {description && (
              <div
                className={`${styles.description} ${fontColor ? "dark-body1" : ""}`}
                style={{ color: fontColor || undefined }}
              >
                <RichDescription html={description} />
              </div>
            )}

            {bulletPoints?.length > 0 && (
              <ul className={styles.bulletList}>
                {bulletPoints.map((item, index) => (
                  <li key={index}>
                    <CheckCircleOutlineRoundedIcon aria-hidden="true" />
                    <Typography
                      variant="subtitle1"
                      component="span"
                    >
                      {item.text}
                    </Typography>
                  </li>
                ))}
              </ul>
            )}
            {accordionData?.length > 0 && <CustomAccordion qaData={accordionData} />}
            <div className={styles.buttonWrapper}>
            {ctaGroup?.cta && (
              <Link href={ctaGroup.cta.url} className={styles.cta}>
                <Button
                  variant={ctaGroup.cta_type || "contained"}
                  color="primary"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={fontColor ? { color: fontColor, borderColor: fontColor } : undefined}
                >
                  {ctaGroup.cta.title}
                </Button>
              </Link>
            )}
            </div> 
          </div>

          {/* image wrapper */}
          {showBeforeAfterImages ? (
            <div className={`${styles.imageContainer}`}>
              <BeforeAfter
                showTitle={false}
                data={{ beforeImage, afterImage }}
              />
            </div>
          ) : (
            <div
              className={styles.imageWrapper}
            >
              {image && 
               <Image
               src={image.url}
               alt={image.alt || title || "Moving service"}
               fill
               sizes="(max-width: 1100px) calc(100vw - 48px), 50vw"
               quality={90}
             />
              }
             
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
