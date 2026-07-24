import styles from "./Process.module.scss";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

const STEP_ICONS = [
  ForumOutlinedIcon,
  RequestQuoteOutlinedIcon,
  LocalShippingOutlinedIcon,
];

export default function RegularProcess({ title, description, cards, image }) {
  if (!cards) return null;
  const hasImage = image?.url && image?.width && image?.height;
  const imagePadding = hasImage ? (image.height / image.width) * 100 : null;

  const stepCards = cards.map((item, index) => {
    const StepIcon = STEP_ICONS[index % STEP_ICONS.length];

    return (
      <div className={`${styles.stepWrapper}`} key={index}>
        <div className={`${styles.stepTitleNumberWrapper}`}>
          <span className={styles.iconWrapper} aria-hidden="true">
            <StepIcon />
          </span>
          <Typography variant="h4" component="div" className={`${styles.stepNumber}`}>
            Step {String(index + 1).padStart(2, "0")}
          </Typography>
        </div>
        <div className={`${styles.content}`}>
          <Typography variant="h6" component="h3">
            {item.title}
          </Typography>
          <Typography
            variant="body1"
            component="div"
            className="description"
            dangerouslySetInnerHTML={{ __html: item.description }}
          ></Typography>
        </div>
      </div>
    );
  });

  return (
    <section className={`${styles.section}`} id="process">
      <Container maxWidth="xl" className={`${styles.container} ${!hasImage ? styles.noImage : ""} grid gap-80 align-center`}>
        {hasImage && (
          <div className={`${styles.imageWrapper} image-wrapper border-radius-16`} style={{paddingBottom: `${imagePadding}%`}}>
            {/* <div className={`${styles.backgroundGradient} `}></div> */}
            <Image src={image.url} alt={image.alt || title} fill sizes="(max-width: 1100px) 100vw, (max-width: 1200px) 50vw" className="border-radius-16" />
          </div>
        )}
        <div className={`${styles.contentWrapper} ${hasImage ? styles.withImage : ""}`}>
          <div className={`${styles.titleWrapper}`}>
            <span className={styles.eyebrow}>How it works</span>
            <Typography
              variant="h4"
              component="h2"
              className={`${styles.heading}`}
              dangerouslySetInnerHTML={{ __html: title }}
            />
            {description && (
              <Typography
                variant="body1"
                component="div"
                className={`${styles.description}`}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>

          <div
            className={`${styles.stepsWrapper} grid gap-32 space-between mt-24 `}
          >
            {stepCards}
          </div>
        </div>
        
      </Container>
    </section>
  );
}
